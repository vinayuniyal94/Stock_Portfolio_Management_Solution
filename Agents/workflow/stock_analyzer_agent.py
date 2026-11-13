import json
from Tools.logger import log_agent_start, traceable
from Tools.llm_tool import query_llm_with_fallback
from Tools.stock_data_tool import (
    fetch_live_stock_metrics,
    fetch_trending_stocks,
    fetch_nse_most_active
)
from Prompts.prompt_templates import (
    STOCK_ANALYZER_SYSTEM_PROMPT,
    get_stock_analyzer_user_prompt
)


@traceable(name="Stock_Analyzer_Agent", run_type="chain")
def run_stock_analyzer_agent(state: dict) -> dict:
    log_agent_start("Stock Analyzer Agent", "Executing ReAct [Think -> Plan -> Act] Dynamic Sector & Equity Discovery")

    risk_category = state.get("risk_category", "Moderate")
    risk_score = int(state.get("risk_score", 50))
    user_profile = state.get("user_profile", {})
    horizon = user_profile.get("investment_horizon", "5-7 Years")
    goal = user_profile.get("primary_goal", "Wealth Creation")
    critique_feedback = state.get("critique_feedback", "")

    # Fetch real-time trending and active market signals from Indian Stock API (/trending & /NSE_most_active)
    trending = fetch_trending_stocks()
    nse_active = fetch_nse_most_active()

    system_prompt = STOCK_ANALYZER_SYSTEM_PROMPT
    user_prompt = get_stock_analyzer_user_prompt(
        risk_score=risk_score,
        risk_category=risk_category,
        horizon=horizon,
        goal=goal
    )

    live_signals = []
    for item in (trending[:8] + nse_active[:8]):
        if isinstance(item, dict):
            sym = item.get("company_name") or item.get("symbol") or item.get("ticker")
            if sym:
                live_signals.append(str(sym))
    if live_signals:
        user_prompt += f"\n\nLive NSE Trending & Most-Active Market Movers: {', '.join(dict.fromkeys(live_signals))}"

    if critique_feedback:
        user_prompt += (
            f"\n\n[CRO AUDITOR FEEDBACK FROM PREVIOUS ATTEMPT]: {critique_feedback}\n"
            "Strictly address this feedback in your updated JSON response."
        )

    llm_output = query_llm_with_fallback(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        agent_name="Stock Analyzer Agent",
        max_tokens=1100,
        expect_json=True
    )

    if not llm_output:
        return {
            **state,
            "last_agent": "stock_analyzer",
            "current_step": "Stock Analyzer Agent failed: No response received from LLM.",
            "workflow_failed": True
        }

    selected_sectors = []
    sector_rationales = {}
    sector_candidates = {}
    thought_process = ""

    try:
        cleaned = llm_output.replace("```json", "").replace("```", "").strip()
        json_start = cleaned.find("{")
        json_end = cleaned.rfind("}") + 1
        if json_start == -1 or json_end == 0:
            raise ValueError("No valid JSON object found in Stock Analyzer LLM output.")

        parsed = json.loads(cleaned[json_start:json_end])
        selected_sectors = parsed.get("selected_sectors", [])
        sector_rationales = parsed.get("sector_rationales", {})
        sector_candidates = parsed.get("sector_candidates", {})
        thought_process = parsed.get("thought_process", "")
    except Exception as e:
        error_msg = f"Stock Analyzer JSON parsing failed: {e}"
        print(f"[{error_msg}]")
        return {
            **state,
            "last_agent": "stock_analyzer",
            "current_step": error_msg,
            "workflow_failed": True
        }

    if not selected_sectors or not isinstance(selected_sectors, list):
        return {
            **state,
            "last_agent": "stock_analyzer",
            "current_step": "Stock Analyzer failed: LLM did not identify any target sectors.",
            "workflow_failed": True
        }

    market_data = {}
    valid_sectors = []
    total_pulled = 0

    for sector in selected_sectors:
        candidates = sector_candidates.get(sector, [])
        if not isinstance(candidates, list) or not candidates:
            continue

        print(f"\n[ReAct ACTION]: Verifying live NSE quotes for '{sector}' via Indian Stock API (/stock)...")
        stock_list = []
        seen_tickers = set()

        for candidate in candidates:
            metrics = fetch_live_stock_metrics(str(candidate))
            if metrics and metrics.get("current_price", 0) > 0:
                ticker = metrics["ticker"]
                if ticker in seen_tickers:
                    continue
                seen_tickers.add(ticker)
                metrics["sector"] = sector
                metrics["sector_rationale"] = sector_rationales.get(sector, "")
                stock_list.append(metrics)
                total_pulled += 1
            if len(stock_list) >= 6:
                break

        if len(stock_list) > 0:
            market_data[sector] = stock_list
            valid_sectors.append(sector)

    if total_pulled == 0 or not valid_sectors:
        return {
            **state,
            "last_agent": "stock_analyzer",
            "current_step": "Stock Analyzer failed: Unable to retrieve live equity quotes from Indian Stock API (/stock).",
            "workflow_failed": True
        }

    preview = thought_process[:80] if thought_process else f"Evaluated {len(valid_sectors)} sectors"
    step_msg = f"ReAct [THINK]: {preview}... Verified {total_pulled} live equities across {len(valid_sectors)} sectors from Indian Stock API."

    return {
        **state,
        "selected_sectors": valid_sectors,
        "sector_rationales": sector_rationales,
        "market_data": market_data,
        "analyzer_thought_process": thought_process,
        "last_agent": "stock_analyzer",
        "current_step": step_msg,
        "workflow_failed": False
    }