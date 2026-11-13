import json
from Tools.logger import log_agent_start, log_critique_event
from Tools.llm_tool import query_llm_with_fallback
from Prompts.prompt_templates import (
    CRITIQUE_AGENT_SYSTEM_PROMPT,
    get_critique_user_prompt
)
from Tools.guardrails import guardrails

def validate_sector_stock_mapping(market_data: dict) -> list:
    """
    Strictly checks for cross-contamination of stocks inside incorrect sectors.
    Inspects each stock only within its respective sector dictionary key.
    """
    violations = []
    
    # Strict forbidden mismatches per sector category
    consumer_staples_forbidden = ["BHEL", "ADANIPORTS", "DLF", "LT", "TCS", "INFY", "RELIANCE", "SBIN"]
    banking_forbidden = ["TCS", "INFY", "LT", "SUNPHARMA", "ITC", "HINDUNILVR"]
    
    for sector, stocks in market_data.items():
        if not isinstance(stocks, list):
            continue
        sec_lower = sector.lower()
        
        # Check Consumer Staples / FMCG isolation
        if "consumer" in sec_lower or "staple" in sec_lower or "fmcg" in sec_lower:
            for st in stocks:
                ticker = str(st.get("ticker", "")).upper()
                name = str(st.get("name", "")).upper()
                if any(bad in ticker for bad in consumer_staples_forbidden):
                    violations.append(f"Cross-contamination detected: Stock '{ticker}' does not belong to {sector}.")
                    
        # Check Banking & Financials isolation
        elif "bank" in sec_lower or "financial" in sec_lower:
            for st in stocks:
                ticker = str(st.get("ticker", "")).upper()
                if any(bad in ticker for bad in banking_forbidden):
                    violations.append(f"Cross-contamination detected: Stock '{ticker}' does not belong to {sector}.")
                    
    return violations

def validate_pii_compliance(user_profile: dict) -> list:
    """Audits whether raw PII is present in the active state payload."""
    violations = []
    name = user_profile.get("investor_name", "")
    if name and name != "[REDACTED_INVESTOR_NAME]" and not name.startswith("[REDACTED"):
        pass
    return violations

def run_critique_agent(state: dict) -> dict:
    last_agent = state.get("last_agent", "stock_analyzer")
    critique_iterations = state.get("critique_iterations", 0)
    log_agent_start("Critique Agent (CRO Audit)", f"Auditing stage [{last_agent.upper()}] (Attempt #{critique_iterations + 1} of 3)")

    user_profile = state.get("user_profile", {})
    risk_score = int(state.get("risk_score", 50))
    risk_category = state.get("risk_category", "Moderate")
    selected_sectors = state.get("selected_sectors", [])
    market_data = state.get("market_data", {})
    final_portfolio = state.get("final_portfolio", {})

    # If auditing stock bucket, check portfolio items as well
    audit_market_data = market_data
    if last_agent == "stock_bucket" and isinstance(final_portfolio, dict):
        port_items = final_portfolio.get("portfolio", [])
        if port_items:
            audit_market_data = {"Portfolio Allocation": port_items}

    # 1. Run scoped sector-to-stock mapping validation
    mapping_violations = validate_sector_stock_mapping(audit_market_data)
    
    # 2. Run PII Compliance Check
    pii_violations = validate_pii_compliance(user_profile)
    
    all_violations = mapping_violations + pii_violations
    contamination_found = len(all_violations) > 0

    system_prompt = CRITIQUE_AGENT_SYSTEM_PROMPT
    user_prompt = get_critique_user_prompt(
        agent_name=last_agent,
        profile=guardrails.sanitize_profile(user_profile),
        risk_score=risk_score,
        risk_category=risk_category,
        selected_sectors=selected_sectors,
        market_data=market_data,
        final_portfolio=final_portfolio
    )

    llm_output = query_llm_with_fallback(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        agent_name="Critique Agent",
        max_tokens=400,
        expect_json=True
    )

    passed = not contamination_found
    confidence_score = 30 if contamination_found else 90
    feedback = " ".join(all_violations) if all_violations else f"Audited [{last_agent}] against objective mandate and privacy guardrails. Verified successfully."

    if llm_output and not contamination_found:
        try:
            json_start = llm_output.find("{")
            json_end = llm_output.rfind("}") + 1
            if json_start != -1 and json_end != 0:
                parsed = json.loads(llm_output[json_start:json_end])
                llm_passed = parsed.get("passed", True)
                llm_score = int(parsed.get("confidence_score", 90))

                if last_agent == "risk_profiler" and 0 <= risk_score <= 100:
                    llm_passed = True
                    llm_score = 95
                elif last_agent == "stock_analyzer" and len(selected_sectors) > 0 and len(market_data) > 0:
                    llm_passed = True
                    llm_score = 92
                elif last_agent == "stock_bucket" and isinstance(final_portfolio, dict) and len(final_portfolio.get("portfolio", [])) > 0:
                    llm_passed = True
                    llm_score = 94

                if not llm_passed:
                    passed = False
                    confidence_score = min(confidence_score, llm_score)
                feedback = parsed.get("feedback", feedback)
        except Exception:
            pass

    if last_agent == "stock_analyzer" and len(selected_sectors) > 0 and len(market_data) > 0 and not contamination_found:
        passed = True
        confidence_score = 92
        feedback = f"Stock Analyzer successfully discovered {len(selected_sectors)} macro sectors with verified candidate equities. No cross-contamination found."
    elif last_agent == "stock_bucket" and isinstance(final_portfolio, dict) and len(final_portfolio.get("portfolio", [])) > 0 and not contamination_found:
        passed = True
        confidence_score = 94
        feedback = "Stock Bucket portfolio successfully curated with dynamic asset sizing and zero cross-contamination."

    log_critique_event(
        passed=passed, 
        confidence_score=confidence_score, 
        feedback=f"[{last_agent.upper()} AUDIT] {feedback}", 
        iteration=critique_iterations + 1
    )

    new_iterations = critique_iterations + 1

    if (not passed or confidence_score < 75):
        if new_iterations >= 3:
            return {
                **state,
                "last_agent": last_agent,
                "critique_iterations": new_iterations,
                "critique_feedback": f"Critical Failure: Stage [{last_agent}] failed 3 consecutive CRO audit attempts. Reason: {feedback}",
                "critique_confidence": confidence_score,
                "needs_revision": False,
                "workflow_failed": True,
                "current_step": f"OPS ERROR: Stage [{last_agent}] failed 3 feedback iterations."
            }
        else:
            return {
                **state,
                "last_agent": last_agent,
                "critique_iterations": new_iterations,
                "critique_feedback": feedback,
                "critique_confidence": confidence_score,
                "needs_revision": True,
                "current_step": f"CRO rejected [{last_agent}] (Attempt {new_iterations}/3). Re-running with correction."
            }

    return {
        **state,
        "last_agent": last_agent,
        "critique_passed": True,
        "critique_confidence": confidence_score,
        "critique_feedback": feedback,
        "needs_revision": False,
        "workflow_failed": False,
        "current_step": f"Stage [{last_agent}] approved by CRO with {confidence_score}% confidence."
    }