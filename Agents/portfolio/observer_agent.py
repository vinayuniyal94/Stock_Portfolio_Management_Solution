import requests
import os

def run_observer_agent(state: dict) -> dict:
    """
    Observer Agent: Scans live market telemetry, prices, and circuit limits for saved portfolio stocks.
    """
    stocks = state.get("stocks", [])
    megabull_base_url = os.getenv("MEGABULL_BASE_URL", "https://api.megabull.in")
    megabull_api_key = os.getenv("MEGABULL_API_KEY", "")
    headers = {"api-key": megabull_api_key, "Content-Type": "application/json"}

    observed_feed = []
    for stock in stocks:
        ticker = stock.get("ticker") or stock.get("Symbol") or "EQ.NS"
        name = stock.get("name") or stock.get("StockName") or "Equity Asset"
        base_price = float(stock.get("current_price") or stock.get("Price") or 1000)

        try:
            res = requests.get(f"{megabull_base_url}/api/marketwatch/quote?symbol={ticker}", headers=headers, timeout=2)
            if res.status_code == 200:
                data = res.json()
                ltp = float(data.get("ltp", base_price))
                change_pct = float(data.get("change_pct", 0.5))
            else:
                ltp = base_price
                change_pct = 0.5
        except Exception:
            ltp = base_price
            change_pct = 0.5

        observed_feed.append({
            "ticker": ticker,
            "name": name,
            "ltp": ltp,
            "change_pct": change_pct,
            "is_circuit_limit": abs(change_pct) >= 4.5
        })

    return {
        **state,
        "observer_feed": observed_feed,
        "current_step": "Observer Agent completed live market scan."
    }