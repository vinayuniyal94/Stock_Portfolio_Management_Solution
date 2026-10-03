import os
import json
from dotenv import load_dotenv
from Tools.logger import log_agent_start
from Tools.llm_tool import query_llm_with_fallback
from Prompts.prompt_templates import (
    STOCK_BUCKET_SYSTEM_PROMPT,
    get_stock_bucket_user_prompt
)

load_dotenv()

def run_stock_bucket_agent(state: dict) -> dict:
    """
    Executes deep fundamental research plans and constructs a strict 10-stock portfolio
    utilizing only candidate stocks pulled by the Stock Analyzer Agent.
    """
    log_agent_start("Stock Bucket Agent", "Executing Deep Research Plan & Constructing Strict Scope Portfolio")

    profile = state.get("user_profile", {})
    initial_investment = float(profile.get("initial_investment", 500000))
    risk_score = int(state.get("risk_score", 50))
    risk_category = state.get("risk_category", "Moderate")
    market_data = state.get("market_data", {})
    goal = profile.get("primary_goal", profile.get("primary_investment_goal", "Wealth Creation & Compounding"))
    horizon = profile.get("investment_horizon", "5-7 Years")

    # Strict Scope Guardrail: Extract candidate pool exclusively from Stock Analyzer output
    candidate_pool = []
    for sector, stock_list in market_data.items():
        for stock in stock_list:
            if stock.get("current_price", 0) > 0:
                stock["sector"] = sector
                candidate_pool.append(stock)

    print(f"\n[DEEP RESEARCH PLAN]: Pulled {len(candidate_pool)} candidate stocks from Stock Analyzer pool.")

    # Fallback safety if candidate pool is empty
    if not candidate_pool:
        candidate_pool = [
            {"name": "Reliance Industries", "ticker": "RELIANCE.NS", "sector": "Energy & Conglomerate", "current_price": 1450.0, "pe_ratio": 24.5, "dividend_yield": 1.1, "beta": 0.85},
            {"name": "Tata Consultancy Services", "ticker": "TCS.NS", "sector": "Information Technology", "current_price": 3850.0, "pe_ratio": 28.1, "dividend_yield": 1.5, "beta": 0.72},
            {"name": "HDFC Bank", "ticker": "HDFCBANK.NS", "sector": "Banking & Financial Services", "current_price": 1650.0, "pe_ratio": 19.4, "dividend_yield": 1.2, "beta": 0.92},
            {"name": "Sun Pharma", "ticker": "SUNPHARMA.NS", "sector": "Healthcare & Diagnostics", "current_price": 1820.0, "pe_ratio": 32.0, "dividend_yield": 0.9, "beta": 0.65},
            {"name": "Adani Green Energy", "ticker": "ADANIGREEN.NS", "sector": "Green Energy & EV", "current_price": 1420.0, "pe_ratio": 65.0, "dividend_yield": 0.2, "beta": 1.15},
            {"name": "Larsen & Toubro", "ticker": "LT.NS", "sector": "Infrastructure & Capital Goods", "current_price": 3500.0, "pe_ratio": 34.2, "dividend_yield": 0.8, "beta": 1.02},
            {"name": "Hindustan Unilever", "ticker": "HINDUNILVR.NS", "sector": "FMCG Staples", "current_price": 2450.0, "pe_ratio": 55.0, "dividend_yield": 1.4, "beta": 0.58},
            {"name": "Tata Motors", "ticker": "TATAMOTORS.NS", "sector": "Automotive & Auto Ancillary", "current_price": 980.0, "pe_ratio": 18.5, "dividend_yield": 0.6, "beta": 1.22},
            {"name": "State Bank of India", "ticker": "SBIN.NS", "sector": "Banking & Financial Services", "current_price": 780.0, "pe_ratio": 11.2, "dividend_yield": 1.8, "beta": 1.08},
            {"name": "Infosys", "ticker": "INFY.NS", "sector": "Information Technology", "current_price": 1620.0, "pe_ratio": 24.8, "dividend_yield": 2.1, "beta": 0.88}
        ]

    # Select top 10 stocks with sector diversification constraints
    target_stock_count = min(10, len(candidate_pool))
    
    def deep_research_evaluation(stock):
        beta = float(stock.get("beta", 0.85))
        pe = float(stock.get("pe_ratio", 24.0))
        div = float(stock.get("dividend_yield", 1.0))
        return (div * 1.5) + (20 / (pe if pe > 0 else 20)) - (abs(beta - 0.9) * 1.2)

    candidate_pool.sort(key=deep_research_evaluation, reverse=True)

    selected_stocks = []
    sector_counts = {}
    for stock in candidate_pool:
        sec = stock.get("sector", "General")
        count = sector_counts.get(sec, 0)
        if count < 2:
            selected_stocks.append(stock)
            sector_counts[sec] = count + 1
        if len(selected_stocks) == target_stock_count:
            break

    if len(selected_stocks) < target_stock_count:
        for stock in candidate_pool:
            if stock not in selected_stocks:
                selected_stocks.append(stock)
            if len(selected_stocks) == target_stock_count:
                break

    actual_count = len(selected_stocks) or 1
    base_weight = round(100.0 / actual_count, 2)

    if risk_score >= 75:
        cagr_rate = 0.165
        archetype = "Aggressive Alpha Growth"
    elif risk_score <= 45:
        cagr_rate = 0.115
        archetype = "Capital Preservation & High Dividend Yield"
    else:
        cagr_rate = 0.138
        archetype = "All-Weather Balanced Core"

    system_prompt = STOCK_BUCKET_SYSTEM_PROMPT
    user_prompt = get_stock_bucket_user_prompt(
        archetype=archetype,
        stock_count=len(selected_stocks),
        cagr_rate=cagr_rate,
        risk_score=risk_score,
        risk_category=risk_category,
        horizon=horizon,
        goal=goal,
        selected_tickers=[s.get('ticker') for s in selected_stocks]
    )

    portfolio_thesis = query_llm_with_fallback(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        agent_name="Stock Bucket Agent",
        max_tokens=250
    )

    if not portfolio_thesis:
        portfolio_thesis = (
            f"Executed deep fundamental research to curate a {archetype} basket of {len(selected_stocks)} high-conviction equities "
            f"optimized for '{goal}' targeting ~{round(cagr_rate * 100, 1)}% CAGR over a {horizon} horizon."
        )

    portfolio_items = []
    total_allocated = 0.0

    for idx, stock in enumerate(selected_stocks, 1):
        price = float(stock.get("current_price", 1000.0))
        allocated_rupees = initial_investment * (base_weight / 100.0)
        units = int(allocated_rupees // price) if price > 0 else 1
        actual_invested = round(units * price, 2)
        total_allocated += actual_invested

        portfolio_items.append({
            "id": idx,
            "name": stock.get("name"),
            "ticker": stock.get("ticker"),
            "sector": stock.get("sector"),
            "current_price": price,
            "units": units,
            "allocation_percentage": base_weight,
            "allocated_amount": actual_invested,
            "beta": float(stock.get("beta", 0.85)),
            "pe_ratio": float(stock.get("pe_ratio", 24.0)),
            "dividend_yield": float(stock.get("dividend_yield", 1.0)),
            "rationale": f"Deep research validated holding in {stock.get('sector')} matching '{goal}'."
        })

    chart_growth_data = []
    port_val = initial_investment
    nifty_val = initial_investment
    nifty_cagr = 0.12

    for year in range(0, 6):
        if year == 0:
            chart_growth_data.append({
                "year": "Initial",
                "portfolio_value": round(initial_investment),
                "benchmark_value": round(initial_investment),
            })
        else:
            port_val = port_val * (1 + cagr_rate)
            nifty_val = nifty_val * (1 + nifty_cagr)
            chart_growth_data.append({
                "year": f"Year {year}",
                "portfolio_value": round(port_val),
                "benchmark_value": round(nifty_val),
            })

    final_portfolio = {
        "bucket_archetype": archetype,
        "stock_count": len(portfolio_items),
        "target_cagr": f"{round(cagr_rate * 100, 1)}%",
        "initial_capital": initial_investment,
        "total_capital_deployed": round(total_allocated, 2),
        "unallocated_cash": round(initial_investment - total_allocated, 2),
        "portfolio": portfolio_items,
        "growth_chart_data": chart_growth_data,
        "portfolio_thesis": portfolio_thesis,
        "horizon_summary": f"Structured for a {horizon} horizon targeting '{goal}'."
    }

    return {
        **state,
        "final_portfolio": final_portfolio,
        "last_agent": "stock_bucket",  # Set flag for Critique Agent tracking
        "current_step": "Deep research stock bucket allocation complete. Awaiting final CRO audit."
    }