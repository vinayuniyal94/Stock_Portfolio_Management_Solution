import os
import requests
from dotenv import load_dotenv

load_dotenv(override=True)

MEGABULL_BASE_URL = os.getenv("MEGABULL_BASE_URL", "https://api.megabull.in")
MEGABULL_API_KEY = os.getenv("MEGABULL_API_KEY", "")


def fetch_megabull_live_holdings() -> dict:
    """
    Fetches live holdings, quantities, average buy prices, LTP, and P&L
    directly from the MegaBull Paper Trading API.
    """
    if not MEGABULL_API_KEY:
        return {"status": "error", "message": "MEGABULL_API_KEY is missing in .env", "holdings": []}

    headers = {
        "api-key": MEGABULL_API_KEY,
        "Content-Type": "application/json"
    }

    for endpoint in ("/api/holdings", "/api/portfolio/holdings", "/api/portfolio"):
        try:
            res = requests.get(f"{MEGABULL_BASE_URL}{endpoint}", headers=headers, timeout=6)
            if res.status_code == 200:
                payload = res.json()
                raw_list = (
                    payload if isinstance(payload, list)
                    else payload.get("holdings") or payload.get("data") or payload.get("positions") or []
                )
                normalized = []
                for idx, item in enumerate(raw_list, 1):
                    symbol = str(item.get("instrument") or item.get("symbol") or item.get("tradingsymbol") or "").upper()
                    qty = int(float(item.get("qty") or item.get("quantity") or 0))
                    avg_price = float(item.get("avg_price") or item.get("average_price") or item.get("avg") or 0)
                    ltp = float(item.get("ltp") or item.get("last_price") or item.get("current_price") or avg_price)
                    pnl = float(item.get("pnl") or round((ltp - avg_price) * qty, 2))
                    chg_pct = float(item.get("chg") or item.get("percent_change") or (round(((ltp - avg_price) / avg_price) * 100, 2) if avg_price > 0 else 0.0))

                    if symbol and qty > 0:
                        normalized.append({
                            "id": idx,
                            "name": symbol.replace(".NS", ""),
                            "ticker": symbol if symbol.endswith(".NS") else f"{symbol}.NS",
                            "sector": item.get("sector") or "NSE Equity",
                            "avg_price": round(avg_price, 2),
                            "current_price": round(ltp, 2),
                            "units": qty,
                            "allocated_amount": round(ltp * qty, 2),
                            "pnl": round(pnl, 2),
                            "change_pct": round(chg_pct, 2)
                        })

                return {
                    "status": "success",
                    "count": len(normalized),
                    "total_pnl": round(sum(h["pnl"] for h in normalized), 2),
                    "total_value": round(sum(h["allocated_amount"] for h in normalized), 2),
                    "holdings": normalized
                }
        except Exception as e:
            print(f"[MegaBull Sync Warning] {endpoint}: {e}")

    return {"status": "error", "message": "Unable to fetch live holdings from MegaBull API.", "holdings": []}