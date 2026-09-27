from Tools.logger import log_agent_start
from Tools.stock_data_tool import fetch_stock_metrics, get_sector_stocks

def run_stock_analyzer_agent(state: dict) -> dict:
    log_agent_start("Stock Analyzer Agent", "Screen Indian equities across candidate sectors via yfinance")

    selected_sectors = state.get("selected_sectors", [])
    if not selected_sectors:
        selected_sectors = ["Banking & Financials", "Information Technology", "Automotive & EV"]

    risk_category = state.get("risk_category", "Moderate")
    market_data = {}

    for sector in selected_sectors:
        tickers = get_sector_stocks(sector)
        sector_results = []
        for ticker in tickers[:2]:
            metrics = fetch_stock_metrics(ticker)
            metrics["sector"] = sector
            metrics["suitability"] = "High" if (risk_category == "Aggressive" or metrics["beta"] <= 1.1) else "Medium"
            sector_results.append(metrics)
        market_data[sector] = sector_results

    return {
        **state,
        "selected_sectors": selected_sectors,
        "market_data": market_data,
        "current_step": "Stock analysis and fundamental screening completed"
    }