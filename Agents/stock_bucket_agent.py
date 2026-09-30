import os
import json
import time
from dotenv import load_dotenv
from Tools.logger import log_agent_start
from Tools.llm_tool import query_llm_with_fallback
from Prompts.prompt_templates import (
    STOCK_BUCKET_SYSTEM_PROMPT,
    get_stock_bucket_user_prompt
)

load_dotenv()

def run_stock_bucket_agent(state: dict) -> dict:
    log_agent_start("Stock Bucket Agent", "Synthesize dynamic 8-14 stock portfolio with compounding model")

    profile = state.get("user_profile", {})
    initial_investment = float(profile.get("initial_investment", 500000))
    risk_score = int(state.get("risk_score", 50))
    risk_category = state.get("risk_category", "Moderate")
    market_data = state.get("market_data", {})
    goal = profile.get("primary_goal", "Wealth Creation")
    horizon = profile.get("investment_horizon", "5-7 Years")

    if risk_score >= 75:
        target_stock_count = 9
        cagr_rate = 0.165
        archetype = "Aggressive Alpha Growth"
    elif risk_score <= 45:
        target_stock_count = 13
        cagr_rate = 0.115
        archetype = "Capital Preservation & High Dividend Yield"
    else:
        target_stock_count = 11
        cagr_rate = 0.138
        archetype = "All-Weather Balanced Core"

    all_candidates = []
    for sector, stock_list in market_data.items():
        for st in stock_list:
            if st.get("current_price", 0) > 0:
                all_candidates.append(st)

    def compute_stock_suitability(stock):
        beta = stock.get("beta", 1.0)
        pe = stock.get("pe_ratio", 20.0)
        div = stock.get("dividend_yield", 1.0)
        if risk_score >= 75:
            return (beta * 1.5) + (div * 0.2) - (0.01 * pe if pe > 60 else 0)
        elif risk_score <= 45:
            return (div * 2.0) - (abs(beta - 0.7) * 2.0) - (0.02 * pe)
        else:
            return (div * 1.0) - (abs(beta - 1.0) * 1.5)

    all_candidates.sort(key=compute_stock_suitability, reverse=True)

    chosen_stocks = []
    sector_counts = {}
    for st in all_candidates:
        sec = st.get("sector", "General")
        current_count = sector_counts.get(sec, 0)
        if current_count < 3:
            chosen_stocks.append(st)
            sector_counts[sec] = current_count + 1
        if len(chosen_stocks) == target_stock_count:
            break

    if len(chosen_stocks) < target_stock_count:
        for st in all_candidates:
            if st not in chosen_stocks:
                chosen_stocks.append(st)
            if len(chosen_stocks) == target_stock_count:
                break

    actual_count = len(chosen_stocks) or 1
    base_weight = round(100.0 / actual_count, 2)

    # Invoke centralized prompt template
    system_prompt = STOCK_BUCKET_SYSTEM_PROMPT
    user_prompt = get_stock_bucket_user_prompt(
        archetype=archetype,
        stock_count=len(chosen_stocks),
        cagr_rate=cagr_rate,
        risk_score=risk_score,
        risk_category=risk_category,
        horizon=horizon,
        goal=goal,
        selected_tickers=[s.get('ticker') for s in chosen_stocks]
    )

    portfolio_thesis = query_llm_with_fallback(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        agent_name="Stock Bucket Agent",
        max_tokens=200
    )

    if not portfolio_thesis:
        portfolio_thesis = (
            f"Constructed an {archetype} basket diversified across {len(chosen_stocks)} holdings. "
            f"Calibrated to generate ~{round(cagr_rate * 100, 1)}% CAGR while mitigating downside risk."
        )

    portfolio_items = []
    total_allocated = 0.0

    for idx, stock in enumerate(chosen_stocks, 1):
        price = stock.get("current_price", 1000.0)
        allocated_rupees = initial_investment * (base_weight / 100.0)
        units = int(allocated_rupees // price) if price > 0 else 0
        actual_invested = round(units * price, 2)
        total_allocated += actual_invested

        beta = stock.get("beta", 1.0)
        div = stock.get("dividend_yield", 0.0)
        sector = stock.get("sector", "Equity")

        if risk_score >= 75:
            reason = f"High-beta ({beta}) leadership in {sector} capturing equity upside."
        elif risk_score <= 45:
            reason = f"Defensive buffer in {sector} offering lower volatility ({beta}) and steady dividends ({div}%)."
        else:
            reason = f"Compounding core holding in {sector} with balanced market risk (Beta: {beta})."

        portfolio_items.append({
            "id": idx,
            "name": stock.get("name"),
            "ticker": stock.get("ticker"),
            "sector": sector,
            "current_price": price,
            "units": units,
            "allocation_percentage": base_weight,
            "allocated_amount": actual_invested,
            "beta": beta,
            "pe_ratio": stock.get("pe_ratio", 20.0),
            "dividend_yield": div,
            "rationale": reason
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
        "horizon_summary": f"Structured for a {horizon} horizon with a primary goal of '{goal}'."
    }

    return {
        **state,
        "final_portfolio": final_portfolio,
        "current_step": "Dynamic stock bucket allocation complete"
    }