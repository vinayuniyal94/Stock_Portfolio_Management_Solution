import json
import time
from Tools.logger import log_agent_start
from Tools.llm_tool import query_llm_with_fallback
from Tools.stock_data_tool import (
    search_live_nse_equities_by_sector,
    fetch_live_stock_metrics
)
from Prompts.prompt_templates import (
    STOCK_ANALYZER_SYSTEM_PROMPT,
    get_stock_analyzer_user_prompt
)

def run_stock_analyzer_agent(state: dict) -> dict:
    log_agent_start("Stock Analyzer Agent", "Dynamically identify industries & pull live NSE market data")

    risk_category = state.get("risk_category", "Moderate")
    risk_score = int(state.get("risk_score", 50))
    user_profile = state.get("user_profile", {})
    horizon = user_profile.get("investment_horizon", "5-7 Years")
    goal = user_profile.get("primary_goal", "Wealth Creation")

    # 1. LLM identifies sectors dynamically based on mandate (No static pool)
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
        max_tokens=450,
        expect_json=True
    )

    selected_sectors = []
    sector_rationales = {}

    if llm_output:
        try:
            json_start = llm_output.find("{")
            json_end = llm_output.rfind("}") + 1
            if json_start != -1 and json_end != 0:
                parsed = json.loads(llm_output[json_start:json_end])
                selected_sectors = parsed.get("selected_sectors", [])
                sector_rationales = parsed.get("sector_rationales", {})
        except Exception as e:
            print(f"[Parsing Error] Stock analyzer JSON parse failed: {e}")

    # Dynamic fallback based on calculated score if LLM is unavailable
    if len(selected_sectors) < 5:
        if risk_score >= 75:
            selected_sectors = ["Defense & Aerospace", "Clean Mobility & EV", "Cloud & AI Enterprise", "Capital Goods & Capex", "Private Credit & Banking"]
        elif risk_score <= 45:
            selected_sectors = ["FMCG Staples", "Pharmaceuticals & Healthcare", "Power Transmission & Utilities", "Public Sector Bluechips", "Telecom Infrastructure"]
        else:
            selected_sectors = ["Banking & Financial Services", "Information Technology", "Automotive & Auto Ancillary", "Healthcare Diagnostics", "Renewable Energy"]

        sector_rationales = {
            s: f"Strategically selected based on institutional quantitative score of {risk_score}/100 and a {horizon} mandate."
            for s in selected_sectors
        }

    # 2. Query live stocks from NSE / Yahoo APIs for each identified industry
    market_data = {}
    for sector in selected_sectors:
        print(f"\n[DYNAMIC QUERY]: Discovering live NSE equities for '{sector}'...")
        discovered_tickers = search_live_nse_equities_by_sector(sector, count=5)

        stock_list = []
        for ticker in discovered_tickers:
            metrics = fetch_live_stock_metrics(ticker)
            if metrics.get("current_price", 0) > 0:
                metrics["sector"] = sector
                metrics["sector_rationale"] = sector_rationales.get(sector, "")
                stock_list.append(metrics)

        market_data[sector] = stock_list

    return {
        **state,
        "selected_sectors": selected_sectors,
        "sector_rationales": sector_rationales,
        "market_data": market_data,
        "current_step": "Live dynamic industry discovery & quote acquisition complete"
    }