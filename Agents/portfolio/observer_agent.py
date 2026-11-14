import os
import requests
from Tools.logger import log_agent_start, traceable
from Tools.stock_data_tool import (
    fetch_live_stock_metrics,
    fetch_trending_stocks,
    fetch_nse_most_active,
    fetch_bse_most_active
)
from Tools.market_hours import get_indian_market_status, is_market_open_now


def _build_live_pulse_index() -> dict:
    """Indexes intraday percent_change & prices from Indian Stock API live feeds."""
    pulse = {}
    for fetcher in (fetch_trending_stocks, fetch_nse_most_active, fetch_bse_most_active):
        try:
            for item in fetcher():
                if not isinstance(item, dict):
                    continue
                raw_sym = str(
                    item.get("nse_symbol")
                    or item.get("symbol")
                    or item.get("ticker")
                    or item.get("company_name")
                    or ""
                ).upper().replace(".NS", "").replace(".BO", "").strip()
                if not raw_sym:
                    continue
                pct = item.get("percent_change") or item.get("pChange") or item.get("change_pct")
                price = item.get("price") or item.get("lastPrice") or item.get("ltp")
                if pct is not None:
                    try:
                        pulse[raw_sym] = {
                            "percent_change": round(float(str(pct).replace("%", "").strip()), 2),
                            "price": float(str(price).replace(",", "").strip()) if price else None
                        }
                    except ValueError:
                        pass
        except Exception:
            continue
    return pulse


def _fetch_megabull_holdings_index() -> dict:
    """Fetches live holdings from MegaBull /api/holding/my for accurate qty & avgBuyPrice."""
    base_url = os.getenv("MEGABULL_BASE_URL", "https://api.megabull.in")
    api_key = os.getenv("MEGABULL_API_KEY", "")
    if not api_key:
        return {}
    try:
        res = requests.get(
            f"{base_url}/api/holding/my",
            headers={"api-key": api_key, "Content-Type": "application/json"},
            timeout=5
        )
        if res.status_code == 200:
            data = res.json()
            items = data if isinstance(data, list) else data.get("holdings", [])
            idx = {}
            for h in items:
                sym = str(h.get("instrumentName") or h.get("symbol") or "").upper().replace(".NS", "").strip()
                if sym:
                    idx[sym] = {
                        "qty": int(float(h.get("qty") or h.get("quantity") or 0)),
                        "avg_price": float(h.get("avgBuyPrice") or h.get("priceAvg") or h.get("avg_price") or 0)
                    }
            return idx
    except Exception:
        pass
    return {}


@traceable(name="Portfolio_Observer_Agent", run_type="chain")
def run_observer_agent(state: dict) -> dict:
    """
    Observer Agent: Scans live NSE market prices, dynamic intraday & position % changes,
    and circuit limits for saved portfolio holdings.
    """
    log_agent_start("Observer Agent", "Scanning live NSE quotes, dynamic % changes & circuit thresholds")

    stocks = state.get("stocks", [])
    market_status = get_indian_market_status()
    pulse_index = _build_live_pulse_index()
    mb_holdings = _fetch_megabull_holdings_index()

    # If MegaBull has active holdings, ensure we observe all live MegaBull holdings too
    observed_feed = []
    seen_symbols = set()

    combined_list = list(stocks)
    for mb_sym, mb_info in mb_holdings.items():
        if not any(
            str(s.get("ticker") or s.get("name") or "").upper().replace(".NS", "").strip() == mb_sym
            for s in combined_list
        ):
            combined_list.append({
                "ticker": f"{mb_sym}.NS",
                "name": mb_sym,
                "current_price": mb_info["avg_price"],
                "avg_price": mb_info["avg_price"],
                "units": mb_info["qty"]
            })

    for stock in combined_list:
        raw_ticker = str(stock.get("ticker") or stock.get("Symbol") or stock.get("name") or "").upper().strip()
        clean_sym = raw_ticker.replace(".NS", "").replace(".BO", "").strip()
        if not clean_sym or clean_sym in seen_symbols:
            continue
        seen_symbols.add(clean_sym)

        ticker = f"{clean_sym}.NS"
        mb_data = mb_holdings.get(clean_sym, {})
        avg_price = float(mb_data.get("avg_price") or stock.get("avg_price") or stock.get("current_price") or 0)
        qty = int(mb_data.get("qty") or stock.get("units") or stock.get("Quantity") or 0)

        # 1. Fetch live quote from Indian Stock API (/stock)
        live_metrics = fetch_live_stock_metrics(clean_sym)
        ltp = float(live_metrics.get("current_price") or 0)
        company_name = live_metrics.get("name") or stock.get("name") or clean_sym

        # 2. Compute dynamic % change (intraday pulse if available, else live LTP vs avg buy price)
        pulse_hit = pulse_index.get(clean_sym)
        if pulse_hit and pulse_hit.get("percent_change") is not None:
            change_pct = pulse_hit["percent_change"]
            if ltp <= 0 and pulse_hit.get("price"):
                ltp = pulse_hit["price"]
        elif ltp > 0 and avg_price > 0:
            change_pct = round(((ltp - avg_price) / avg_price) * 100, 2)
        else:
            ltp = float(stock.get("current_price") or avg_price or 0)
            change_pct = 0.0

        unrealized_pnl = round((ltp - avg_price) * qty, 2) if (ltp > 0 and avg_price > 0 and qty > 0) else 0.0
        pnl_pct = round(((ltp - avg_price) / avg_price) * 100, 2) if (ltp > 0 and avg_price > 0) else 0.0

        observed_feed.append({
            "ticker": ticker,
            "symbol": clean_sym,
            "name": company_name,
            "ltp": round(ltp, 2),
            "avg_price": round(avg_price, 2),
            "units": qty,
            "change_pct": round(change_pct, 2),
            "pnl_pct": pnl_pct,
            "unrealized_pnl": unrealized_pnl,
            "is_circuit_limit": abs(change_pct) >= 4.5,
            "market_open": market_status["is_open"]
        })

    return {
        **state,
        "market_status": market_status,
        "observer_feed": observed_feed,
        "current_step": f"Observer Agent scanned {len(observed_feed)} live equities ({market_status['status_label']})."
    }