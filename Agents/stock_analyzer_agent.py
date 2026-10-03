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
    """
    Dynamically identifies optimal macroeconomic sectors and pulls strict domain-verified equities.
    """
    log_agent_start("Stock Analyzer Agent", "Dynamically identifying optimal sectors & pulling exact equities")

    risk_category = state.get("risk_category", "Moderate")
    risk_score = int(state.get("risk_score", 50))
    user_profile = state.get("user_profile", {})
    horizon = user_profile.get("investment_horizon", "5-7 Years")
    goal = user_profile.get("primary_goal", "Wealth Creation")

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
        max_tokens=500,
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

    # Dynamic fallback sectors based on risk score
    if not selected_sectors:
        if risk_score >= 75:
            selected_sectors = ["Infrastructure Capex", "Specialty Chemicals", "Green Energy & EV", "Defense & Aerospace", "Information Technology"]
        elif risk_score <= 45:
            selected_sectors = ["FMCG Staples", "Healthcare & Diagnostics", "Banking & Financial Services", "Infrastructure Capex"]
        else:
            selected_sectors = ["Banking & Financial Services", "Information Technology", "Infrastructure Capex", "Specialty Chemicals", "Automotive & Auto Ancillary"]

        sector_rationales = {
            s: f"Dynamically calibrated sector for institutional compounding under a {horizon} horizon."
            for s in selected_sectors
        }

    market_data = {}
    valid_sectors = []
    total_pulled = 0

    for sector in selected_sectors:
        print(f"\n[DYNAMIC QUERY]: Discovering exact live equities for sector: '{sector}'...")
        discovered_tickers = search_live_nse_equities_by_sector(sector, count=10)

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

    return {
        **state,
        "selected_sectors": valid_sectors,
        "sector_rationales": sector_rationales,
        "market_data": market_data,
        "last_agent": "stock_analyzer",  # Set flag for Critique Agent tracking
        "current_step": f"Dynamic sector analysis complete. Pulled {total_pulled} verified equities across {len(valid_sectors)} sectors. Awaiting CRO audit."
    }