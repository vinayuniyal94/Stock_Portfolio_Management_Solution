import os
import time
import requests
from dotenv import load_dotenv
from Tools.logger import log_tool_call, traceable
from Tools.stock_data_tool import (
    fetch_live_stock_metrics,
    fetch_stock_historical_data,
    fetch_stock_forecasts,
    fetch_trending_stocks,
    fetch_nse_most_active,
    fetch_bse_most_active
)

load_dotenv(override=True)

INDIAN_API_BASE = os.getenv("INDIAN_API_BASE_URL", "https://stock.indianapi.in")
INDIAN_API_KEY = os.getenv("INDIAN_API_KEY", "")
MEGABULL_BASE_URL = os.getenv("MEGABULL_BASE_URL", "https://api.megabull.in")
MEGABULL_API_KEY = os.getenv("MEGABULL_API_KEY", "")

# Canonical company names so indianapi.in resolves P/E, Dividend Yield, 52W High/Low & Historical Series cleanly
CANONICAL_NAME_MAP = {
    "NTPC": "NTPC",
    "TATAPOWER": "Tata Power Company",
    "ADANIGREEN": "Adani Green Energy",
    "CIPLA": "Cipla",
    "DRREDDY": "Dr. Reddy's Laboratories",
    "HCLTECH": "HCL Technologies",
    "INFY": "Infosys",
    "TCS": "Tata Consultancy Services",
    "SUNPHARMA": "Sun Pharmaceutical Industries",
    "RELIANCE": "Reliance Industries",
    "HDFCBANK": "HDFC Bank",
    "ICICIBANK": "ICICI Bank",
    "SBIN": "State Bank of India",
    "LT": "Larsen & Toubro",
    "BHARTIARTL": "Bharti Airtel"
}


def _indian_headers() -> dict:
    return {"x-api-key": INDIAN_API_KEY}


def _megabull_headers() -> dict:
    return {"api-key": MEGABULL_API_KEY, "Content-Type": "application/json"}


def _safe_float(val, default=0.0) -> float:
    if val is None or val == "":
        return default
    try:
        cleaned = str(val).replace(",", "").replace("%", "").replace("₹", "").strip()
        return float(cleaned)
    except ValueError:
        return default


def _extract_nested_list(payload) -> list:
    """Extracts stock rows from nested indianapi.in responses (/trending, /NSE_most_active, etc.)."""
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        trending = payload.get("trending_stocks")
        if isinstance(trending, dict):
            gainers = trending.get("top_gainers") or []
            losers = trending.get("top_losers") or []
            return list(gainers) + list(losers)
        for key in ("data", "stocks", "results", "top_gainers", "most_active"):
            if isinstance(payload.get(key), list):
                return payload[key]
    return []


@traceable(name="Equity_Deep_Research_Account_Telemetry", run_type="tool")
def get_megabull_account_telemetry() -> dict:
    """
    Tool: Fetches live virtual cash balance (/api/user/my), delivery holdings (/api/holding/my),
    and recent order book (/api/order/my) from MegaBull.
    """
    t0 = time.time()
    if not MEGABULL_API_KEY:
        return {"virtual_cash": 0.0, "orders": [], "holdings_count": 0}

    virtual_cash = 0.0
    orders = []
    holdings = []

    try:
        u_res = requests.get(f"{MEGABULL_BASE_URL}/api/user/my", headers=_megabull_headers(), timeout=5)
        if u_res.status_code == 200:
            u_data = u_res.json()
            user_obj = u_data.get("user") if isinstance(u_data, dict) and "user" in u_data else u_data
            if isinstance(user_obj, dict):
                virtual_cash = _safe_float(
                    user_obj.get("virtualMoney")
                    or user_obj.get("availableVirtualMoney")
                    or user_obj.get("balance")
                    or user_obj.get("walletBalance")
                )
    except Exception as e:
        print(f"[MegaBull User Fetch Warning]: {e}")

    try:
        o_res = requests.get(f"{MEGABULL_BASE_URL}/api/order/my", headers=_megabull_headers(), timeout=5)
        if o_res.status_code == 200:
            o_data = o_res.json()
            raw_orders = o_data if isinstance(o_data, list) else (o_data.get("orders") or o_data.get("data") or [])
            orders = raw_orders[:15]
    except Exception as e:
        print(f"[MegaBull Orders Fetch Warning]: {e}")

    try:
        h_res = requests.get(f"{MEGABULL_BASE_URL}/api/holding/my", headers=_megabull_headers(), timeout=5)
        if h_res.status_code == 200:
            h_data = h_res.json()
            holdings = h_data if isinstance(h_data, list) else (h_data.get("holdings") or [])
    except Exception as e:
        print(f"[MegaBull Holdings Fetch Warning]: {e}")

    log_tool_call(
        tool_name="Equity Deep Research: MegaBull Account Telemetry",
        inputs={"endpoints": ["/api/user/my", "/api/holding/my", "/api/order/my"]},
        output_summary=f"Virtual Cash: ₹{virtual_cash:,.2f} | Holdings: {len(holdings)} | Orders: {len(orders)}",
        duration=time.time() - t0
    )

    return {
        "virtual_cash": round(virtual_cash, 2),
        "orders": orders,
        "holdings_count": len(holdings)
    }


@traceable(name="Equity_Deep_Research_Market_Outlook", run_type="tool")
def get_market_regime_outlook() -> dict:
    """
    Tool: Aggregates live market breadth and top movers across Indian Stock API
    (/trending, /NSE_most_active, /BSE_most_active) for agents and Portfolio Analytics.
    """
    t0 = time.time()
    raw_items = []

    for endpoint in ("/trending", "/NSE_most_active", "/BSE_most_active"):
        if not INDIAN_API_KEY:
            break
        try:
            res = requests.get(f"{INDIAN_API_BASE}{endpoint}", headers=_indian_headers(), timeout=5)
            if res.status_code == 200:
                raw_items.extend(_extract_nested_list(res.json()))
        except Exception:
            continue

    if not raw_items:
        raw_items = (fetch_trending_stocks() or []) + (fetch_nse_most_active() or []) + (fetch_bse_most_active() or [])

    gainers = 0
    losers = 0
    seen = set()
    movers = []

    for item in raw_items:
        if not isinstance(item, dict):
            continue
        sym = str(
            item.get("nse_symbol")
            or item.get("ticker")
            or item.get("symbol")
            or item.get("company_name")
            or ""
        ).upper().replace(".NS", "").replace(".BO", "").strip()
        if not sym or sym in seen:
            continue
        seen.add(sym)

        pct = _safe_float(
            item.get("percent_change")
            or item.get("pChange")
            or item.get("change_pct")
            or item.get("net_change")
        )
        if pct > 0:
            gainers += 1
        elif pct < 0:
            losers += 1

        if len(movers) < 8:
            movers.append({"name": sym[:12], "change_pct": round(pct, 2)})

    total = max(gainers + losers, 1)
    bullish_ratio = round((gainers / total) * 100, 1) if (gainers + losers) > 0 else 50.0

    if bullish_ratio >= 58:
        regime = "Bullish Expansion"
        stance = "Strong market breadth across NSE/BSE leaders. Favor momentum compounders and trail stop-losses."
    elif bullish_ratio <= 42:
        regime = "Defensive Consolidation"
        stance = "Broad index pullback detected. Prioritize low-beta healthcare/utilities and stagger dip accumulation."
    else:
        regime = "Selective Sector Rotation"
        stance = "Mixed breadth across large caps. Maintain balanced sector weights and trim overweight concentration."

    result = {
        "regime": regime,
        "stance": stance,
        "breadth": {
            "gainers": gainers,
            "losers": losers,
            "bullish_ratio": bullish_ratio
        },
        "top_movers": movers
    }

    log_tool_call(
        tool_name="Equity Deep Research: Market Regime Outlook",
        inputs={"sources": ["/trending", "/NSE_most_active", "/BSE_most_active"]},
        output_summary=f"Regime: {regime} | Advancing: {gainers} | Declining: {losers} ({bullish_ratio}%)",
        duration=time.time() - t0
    )

    return result


@traceable(name="Equity_Deep_Research_Stock_Dossier", run_type="tool")
def run_equity_deep_research(symbol: str, period: str = "1yr") -> dict:
    """
    Tool: Deep multi-source research dossier combining MegaBull live holding telemetry (/api/holding/my)
    with Indian Stock API (/stock, /historical_data, /stock_target_price, /corporate_actions, /stock_forecasts).
    Used by Stock Bucket Agent, Planner Agent, and Portfolio Analytics UI.
    """
    t0 = time.time()
    clean_sym = symbol.upper().replace(".NS", "").replace(".BO", "").strip()
    canonical_name = CANONICAL_NAME_MAP.get(clean_sym, clean_sym)

    # 1. MegaBull live holding lookup
    mb_pos = {}
    if MEGABULL_API_KEY:
        try:
            mb_res = requests.get(f"{MEGABULL_BASE_URL}/api/holding/my", headers=_megabull_headers(), timeout=5)
            if mb_res.status_code == 200:
                raw_mb = mb_res.json()
                items = raw_mb if isinstance(raw_mb, list) else raw_mb.get("holdings", [])
                for item in items:
                    item_sym = str(item.get("instrumentName") or item.get("symbol") or "").upper().replace(".NS", "").strip()
                    if item_sym == clean_sym:
                        mb_pos = item
                        break
        except Exception as e:
            print(f"[MegaBull Stock Drilldown Warning]: {e}")

    # 2. Full /stock fundamental payload from Indian Stock API
    raw_stock = {}
    if INDIAN_API_KEY:
        for query_candidate in dict.fromkeys([canonical_name, clean_sym]):
            try:
                s_res = requests.get(
                    f"{INDIAN_API_BASE}/stock",
                    headers=_indian_headers(),
                    params={"name": query_candidate},
                    timeout=6
                )
                if s_res.status_code == 200 and s_res.json():
                    raw_stock = s_res.json()
                    break
            except Exception:
                continue

    live_metrics = fetch_live_stock_metrics(canonical_name)
    key_metrics = raw_stock.get("keyMetrics") or {}
    current_price_obj = raw_stock.get("currentPrice") or {}

    ltp = _safe_float(
        live_metrics.get("current_price")
        or (current_price_obj.get("NSE") if isinstance(current_price_obj, dict) else current_price_obj)
        or mb_pos.get("avgBuyPrice")
    )
    pe_ratio = _safe_float(
        live_metrics.get("pe_ratio")
        or key_metrics.get("pe")
        or key_metrics.get("priceToEarnings")
        or raw_stock.get("peRatio")
    )
    beta = _safe_float(
        live_metrics.get("beta")
        or key_metrics.get("beta")
        or raw_stock.get("beta"),
        default=1.0
    )
    div_yield = _safe_float(
        live_metrics.get("dividend_yield")
        or key_metrics.get("dividendYield")
        or raw_stock.get("dividendYield")
    )
    week_52_high = _safe_float(raw_stock.get("yearHigh") or key_metrics.get("52WeekHigh"))
    week_52_low = _safe_float(raw_stock.get("yearLow") or key_metrics.get("52WeekLow"))
    company_full_name = raw_stock.get("companyName") or live_metrics.get("name") or canonical_name
    industry = raw_stock.get("industry") or live_metrics.get("industry") or "NSE Listed Equity"

    # 3. Historical Price Series (/historical_data)
    price_history = []
    for hist_query in dict.fromkeys([company_full_name, canonical_name, clean_sym]):
        hist_raw = fetch_stock_historical_data(hist_query, period=period, filter_type="price")
        if isinstance(hist_raw, dict):
            datasets = hist_raw.get("datasets") or []
            if datasets and isinstance(datasets, list):
                values = datasets[0].get("values") or []
                for pt in values[-36:]:
                    if isinstance(pt, (list, tuple)) and len(pt) >= 2:
                        p_val = _safe_float(pt[1])
                        if p_val > 0:
                            price_history.append({"date": str(pt[0])[:10], "price": round(p_val, 2)})
                    elif isinstance(pt, dict):
                        p_val = _safe_float(pt.get("value") or pt.get("close") or pt.get("price"))
                        if p_val > 0:
                            price_history.append({
                                "date": str(pt.get("date") or pt.get("label") or "")[:10],
                                "price": round(p_val, 2)
                            })
        if price_history:
            break

    # 4. Analyst Target Price & Corporate Actions
    target_price_info = {}
    corporate_events = []
    if INDIAN_API_KEY:
        try:
            tp_res = requests.get(
                f"{INDIAN_API_BASE}/stock_target_price",
                headers=_indian_headers(),
                params={"stock_id": clean_sym},
                timeout=4
            )
            if tp_res.status_code == 200 and isinstance(tp_res.json(), dict):
                target_price_info = tp_res.json()
        except Exception:
            pass

        try:
            ca_res = requests.get(
                f"{INDIAN_API_BASE}/corporate_actions",
                headers=_indian_headers(),
                params={"stock_name": canonical_name},
                timeout=4
            )
            if ca_res.status_code == 200:
                corporate_events = _extract_nested_list(ca_res.json())[:4]
        except Exception:
            pass

    qty = int(_safe_float(mb_pos.get("qty") or mb_pos.get("quantity")))
    avg_buy = _safe_float(mb_pos.get("avgBuyPrice") or mb_pos.get("priceAvg"))
    pnl = round((ltp - avg_buy) * qty, 2) if (qty > 0 and avg_buy > 0 and ltp > 0) else 0.0
    pnl_pct = round(((ltp - avg_buy) / avg_buy) * 100, 2) if (avg_buy > 0 and ltp > 0) else 0.0

    dossier = {
        "symbol": clean_sym,
        "ticker": f"{clean_sym}.NS",
        "company_name": company_full_name,
        "industry": industry,
        "fundamentals": {
            "ltp": round(ltp, 2),
            "pe_ratio": round(pe_ratio, 2) if pe_ratio > 0 else None,
            "beta": round(beta, 2),
            "dividend_yield": round(div_yield, 2),
            "week_52_high": round(week_52_high, 2) if week_52_high > 0 else None,
            "week_52_low": round(week_52_low, 2) if week_52_low > 0 else None
        },
        "megabull_holding": {
            "qty": qty,
            "avg_buy_price": round(avg_buy, 2),
            "invested_value": round(avg_buy * qty, 2),
            "current_value": round(ltp * qty, 2),
            "unrealized_pnl": pnl,
            "unrealized_pnl_pct": pnl_pct
        },
        "price_history": price_history,
        "target_price": target_price_info,
        "corporate_actions": corporate_events,
        "forecasts": fetch_stock_forecasts(clean_sym, measure_code="EPS") or {}
    }

    log_tool_call(
        tool_name="Equity Deep Research: Stock Dossier",
        inputs={"symbol": clean_sym, "canonical_name": canonical_name, "period": period},
        output_summary=f"LTP: ₹{ltp} | P/E: {dossier['fundamentals']['pe_ratio']} | History Pts: {len(price_history)}",
        duration=time.time() - t0
    )

    return dossier