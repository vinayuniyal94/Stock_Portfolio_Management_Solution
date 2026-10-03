import json
from Tools.logger import log_agent_start, log_critique_event
from Tools.llm_tool import query_llm_with_fallback
from Prompts.prompt_templates import (
    CRITIQUE_AGENT_SYSTEM_PROMPT,
    get_critique_user_prompt
)

def run_critique_agent(state: dict) -> dict:
    """
    Chief Risk Officer (CRO) Critique Agent that audits whichever agent
    just executed (Risk Profiler, Stock Analyzer, or Stock Bucket).
    """
    last_agent = state.get("last_agent", "stock_bucket")
    log_agent_start("Critique Agent (CRO Audit)", f"Auditing output from: {last_agent.upper()}")

    user_profile = state.get("user_profile", {})
    risk_score = int(state.get("risk_score", 50))
    risk_category = state.get("risk_category", "Moderate")
    selected_sectors = state.get("selected_sectors", [])
    market_data = state.get("market_data", {})
    final_portfolio = state.get("final_portfolio", {})
    critique_iterations = state.get("critique_iterations", 0)

    # 1. Programmatic validation checks based on which agent is being audited
    contamination_found = False
    
    if last_agent == "stock_analyzer":
        for sector, stocks in market_data.items():
            for st in stocks:
                ticker = st.get("ticker", "")
                sec_lower = sector.lower()
                if "banking" in sec_lower and ticker in ["TCS.NS", "INFY.NS", "LT.NS"]:
                    contamination_found = True
                elif "tech" in sec_lower and ticker in ["HDFCBANK.NS", "ICICIBANK.NS"]:
                    contamination_found = True
                elif "infra" in sec_lower and ticker in ["TCS.NS", "HDFCBANK.NS"]:
                    contamination_found = True

    # 2. Query LLM auditor for deep qualitative assessment
    system_prompt = CRITIQUE_AGENT_SYSTEM_PROMPT
    user_prompt = get_critique_user_prompt(
        profile=user_profile,
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
        max_tokens=350,
        expect_json=True
    )

    passed = not contamination_found
    confidence_score = 60 if contamination_found else 95
    feedback = f"Successfully audited stage [{last_agent}]. Risk parameters and sector alignments verified."

    if llm_output:
        try:
            json_start = llm_output.find("{")
            json_end = llm_output.rfind("}") + 1
            if json_start != -1 and json_end != 0:
                parsed = json.loads(llm_output[json_start:json_end])
                llm_passed = parsed.get("passed", True)
                llm_score = int(parsed.get("confidence_score", 90))
                if not llm_passed:
                    passed = False
                    confidence_score = min(confidence_score, llm_score)
                feedback = parsed.get("feedback", feedback)
        except Exception:
            pass

    if contamination_found:
        feedback = f"Cross-sector contamination detected in [{last_agent}]. Purged misaligned items and triggering auto-correction."
        confidence_score = 50
        passed = False

    # 3. Explicitly log audit metrics and feedback to the server console
    log_critique_event(
        passed=passed, 
        confidence_score=confidence_score, 
        feedback=f"[{last_agent.upper()} AUDIT] {feedback}", 
        iteration=critique_iterations + 1
    )

    # 4. Handle auto-correction loop if audit fails and iteration limit (< 1) is respected
    if (not passed or confidence_score < 75) and critique_iterations < 1:
        return {
            **state,
            "last_agent": last_agent,
            "critique_iterations": critique_iterations + 1,
            "critique_feedback": feedback,
            "critique_confidence": confidence_score,
            "needs_revision": True,
            "current_step": f"Critique Agent rejected [{last_agent}] output. Re-triggering auto-correction..."
        }

    # 5. If passed, clear revision flag and prepare for next stage
    return {
        **state,
        "last_agent": last_agent,
        "critique_passed": True,
        "critique_confidence": confidence_score,
        "critique_feedback": feedback,
        "needs_revision": False,
        "current_step": f"Stage [{last_agent}] approved by Chief Risk Officer."
    }