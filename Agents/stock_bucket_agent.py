from Tools.logger import log_agent_start

def run_stock_bucket_agent(state: dict) -> dict:
    log_agent_start("Stock Bucket Agent", "Allocate capital and calculate equity share lots")

    profile = state.get("user_profile", {})
    initial_investment = float(profile.get("initial_investment", 500000))
    risk_category = state.get("risk_category", "Moderate")
    market_data = state.get("market_data", {})

    selected_stocks = []
    for sector, stocks in market_data.items():
        if stocks:
            selected_stocks.append(stocks[0])

    alloc_pct = round(100.0 / len(selected_stocks), 1) if selected_stocks else 33.3
    portfolio_items = []

    for stock in selected_stocks:
        allocated_amount = round(initial_investment * (alloc_pct / 100.0), 2)
        price = stock.get("current_price", 1000.0)
        units = int(allocated_amount // price) if price > 0 else 0

        portfolio_items.append({
            "name": stock.get("name"),
            "ticker": stock.get("ticker"),
            "sector": stock.get("sector"),
            "current_price": price,
            "units": units,
            "allocation_percentage": alloc_pct,
            "allocated_amount": allocated_amount,
            "rationale": f"Market leader in {stock.get('sector')} (P/E: {stock.get('pe_ratio')}, Beta: {stock.get('beta')})."
        })

    final_portfolio = {
        "expected_cagr": "14-16% Projected" if risk_category == "Aggressive" else "11-13% Projected",
        "portfolio": portfolio_items,
        "horizon_strategy": {
            "short_term": "Capital protection via high-weight bluechip allocation.",
            "mid_term": "Sector earnings expansion driving steady capital compounding.",
            "long_term": "Rupee-cost averaging beating benchmark Nifty 50 returns."
        }
    }

    return {
        **state,
        "final_portfolio": final_portfolio,
        "current_step": "Final portfolio bucket generated"
    }