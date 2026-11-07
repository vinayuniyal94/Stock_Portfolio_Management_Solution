import json
from Tools.logger import log_agent_start
from Tools.llm_tool import query_llm_with_fallback
from Tools.stock_data_tool import (
    search_live_nse_equities_by_sector,
    fetch_live_stock_metrics,
    fetch_trending_stocks,
    fetch_nse_most_active
)
from Prompts.prompt_templates import (
    STOCK_ANALYZER_SYSTEM_PROMPT,
    get_stock_analyzer_user_prompt
)

def run_stock_analyzer_agent(state: dict) -> dict:
    log_agent_start("Stock Analyzer Agent", "Executing ReAct [Think -> Plan -> Act] Dynamic Sector Discovery with Trending/Active Intel")

    risk_category = state.get("risk_category", "Moderate")
    risk_score = int(state.get("risk_score", 50))
    user_profile = state.get("user_profile", {})
    horizon = user_profile.get("investment_horizon", "5-7 Years")
    goal = user_profile.get("primary_goal", "Wealth Creation")

    # Fetch real-time trending and active market signals for enhanced reasoning
    trending = fetch_trending_stocks()
    nse_active = fetch_nse_most_active()

    system_prompt = STOCK_ANALYZER_SYSTEM_PROMPT
    user_prompt = get_stock_analyzer_user_prompt(
        risk_score=risk_score,
        risk_category=risk_category,
        horizon=horizon,
        goal=goal
    )

    llm_output = query_llm_with_fallback(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        agent_name="Stock Analyzer Agent",
        max_tokens=700,
        expect_json=True
    )

    selected_sectors = []
    sector_rationales = {}
    thought_process = "Analyzing independent macro sectors for portfolio diversification using market momentum."

    if llm_output:
        try:
            json_start = llm_output.find("{")
            json_end = llm_output.rfind("}") + 1
            if json_start != -1 and json_end != 0:
                parsed = json.loads(llm_output[json_start:json_end])
                selected_sectors = parsed.get("selected_sectors", [])
                sector_rationales = parsed.get("sector_rationales", {})
                thought_process = parsed.get("thought_process", thought_process)
        except Exception as e:
            print(f"[Stock Analyzer Parsing Error]: {e}")

    if not selected_sectors:
        if risk_score >= 75:
            selected_sectors = ["Infrastructure Capex", "Green Energy & EV", "Information Technology"]
        elif risk_score <= 45:
            selected_sectors = ["FMCG Staples", "Healthcare & Diagnostics", "Banking & Financial Services"]
        else:
            selected_sectors = ["Banking & Financial Services", "Information Technology", "Infrastructure Capex"]

        sector_rationales = {
            s: f"Independently chosen sector tailored for {horizon} horizon."
            for s in selected_sectors
        }

    market_data = {}
    valid_sectors = []
    total_pulled = 0

    for sector in selected_sectors:
        print(f"\n[ReAct ACTION]: Discovering exact live equities for sector: '{sector}'...")
        discovered_tickers = search_live_nse_equities_by_sector(sector, count=6)

        stock_list = []
        for ticker in discovered_tickers:
            metrics = fetch_live_stock_metrics(ticker)
            if metrics.get("current_price", 0) > 0:
                metrics["sector"] = sector
                metrics["sector_rationale"] = sector_rationales.get(sector, "")
                stock_list.append(metrics)
                total_pulled += 1

        if len(stock_list) > 0:
            market_data[sector] = stock_list
            valid_sectors.append(sector)

    step_msg = f"ReAct [THINK]: {thought_process[:80]}... Pulled {total_pulled} equities across {len(valid_sectors)} sectors using live API feeds."

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