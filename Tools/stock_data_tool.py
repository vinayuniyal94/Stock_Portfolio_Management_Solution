import os
import re
import time
import requests
from dotenv import load_dotenv
from Tools.logger import log_tool_call

load_dotenv(override=True)

INDIAN_API_BASE = os.getenv("INDIAN_API_BASE_URL", "https://stock.indianapi.in")
_METRICS_CACHE = {}


def _get_headers() -> dict:
    load_dotenv(override=True)
    api_key = os.getenv("INDIAN_API_KEY", "").strip()
    if not api_key:
        raise EnvironmentError("INDIAN_API_KEY is missing in .env.")
    return {"x-api-key": api_key}


def _extract_float(val):
    """Safely extracts a positive float from numeric, string, or nested {'NSE': ...} objects."""
    if val is None:
        return None
    if isinstance(val, (int, float)):
        num = float(val)
        return num if num > 0 else None
    if isinstance(val, str):
        cleaned = val.replace(",", "").replace("₹", "").replace("%", "").strip()
        try:
            num = float(cleaned)
            return num if num > 0 else None
        except ValueError:
            return None
    if isinstance(val, dict):
        for key in ("NSE", "nse", "BSE", "bse", "lastPrice", "value"):
            if key in val:
                parsed = _extract_float(val[key])
                if parsed is not None:
                    return parsed
    return None


def _normalize_ticker(raw_symbol: str) -> str:
    if not raw_symbol:
        return ""
    clean = str(raw_symbol).strip().upper()
    if clean.endswith(".NS") or clean.endswith(".BO"):
        return clean
    return f"{clean}.NS"


def _flatten_market_items(payload) -> list:
    """Flattens list or nested dict responses (e.g., {'trending_stocks': {'top_gainers': [...]}})."""
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        items = []
        for val in payload.values():
            if isinstance(val, list):
                items.extend(val)
            elif isinstance(val, dict):
                for sub_val in val.values():
                    if isinstance(sub_val, list):
                        items.extend(sub_val)
        return items
    return []


def fetch_trending_stocks() -> list:
    """Fetches live trending stocks from Indian Stock API (/trending)."""
    try:
        url = f"{INDIAN_API_BASE}/trending"
        resp = requests.get(url, headers=_get_headers(), timeout=6)
        if resp.status_code == 200:
            return _flatten_market_items(resp.json())
        print(f"[StockDataTool Warning] fetch_trending_stocks HTTP {resp.status_code}")
    except Exception as e:
        print(f"[StockDataTool Error] fetch_trending_stocks: {e}")
    return []


def fetch_bse_most_active() -> list:
    """Fetches live BSE most active stocks from Indian Stock API (/BSE_most_active)."""
    try:
        url = f"{INDIAN_API_BASE}/BSE_most_active"
        resp = requests.get(url, headers=_get_headers(), timeout=6)
        if resp.status_code == 200:
            return _flatten_market_items(resp.json())
        print(f"[StockDataTool Warning] fetch_bse_most_active HTTP {resp.status_code}")
    except Exception as e:
        print(f"[StockDataTool Error] fetch_bse_most_active: {e}")
    return []


def fetch_nse_most_active() -> list:
    """Fetches live NSE most active stocks from Indian Stock API (/NSE_most_active)."""
    try:
        url = f"{INDIAN_API_BASE}/NSE_most_active"
        resp = requests.get(url, headers=_get_headers(), timeout=6)
        if resp.status_code == 200:
            return _flatten_market_items(resp.json())
        print(f"[StockDataTool Warning] fetch_nse_most_active HTTP {resp.status_code}")
    except Exception as e:
        print(f"[StockDataTool Error] fetch_nse_most_active: {e}")
    return []


def fetch_live_stock_metrics(stock_query: str) -> dict:
    """
    Fetches live stock quote and fundamentals from Indian Stock API (/stock?name=...).
    Automatically handles 'Company Name (TICKER)' strings by testing both clean name and symbol.
    Returns empty dict {} if unavailable—zero hardcoded fallback prices.
    """
    query_variants = _build_query_candidates(stock_query)
    if not query_variants:
        return {}

    cache_key = query_variants[0].upper()
    if cache_key in _METRICS_CACHE and (time.time() - _METRICS_CACHE[cache_key]["_ts"]) < 60:
        cached = dict(_METRICS_CACHE[cache_key])
        cached.pop("_ts", None)
        return cached

    t0 = time.time()
    url = f"{INDIAN_API_BASE}/stock"

    for clean_query in query_variants:
        try:
            res = requests.get(url, headers=_get_headers(), params={"name": clean_query}, timeout=6)
            if res.status_code != 200:
                continue

            s_data = res.json()
            if not isinstance(s_data, dict):
                continue

            raw_price = (
                s_data.get("currentPrice")
                or s_data.get("current_price")
                or s_data.get("price")
                or s_data.get("lastPrice")
            )
            price = _extract_float(raw_price)
            if price is None or price <= 0:
                continue

            metrics = s_data.get("keyMetrics") if isinstance(s_data.get("keyMetrics"), dict) else {}
            pe = _extract_float(
                metrics.get("pe_ratio")
                or metrics.get("trailingPE")
                or s_data.get("pe_ratio")
                or s_data.get("trailingPE")
            )
            div = _extract_float(
                metrics.get("dividend_yield")
                or metrics.get("dividendYield")
                or s_data.get("dividend_yield")
            )
            beta = _extract_float(
                metrics.get("beta")
                or s_data.get("beta")
            )

            company_name = s_data.get("companyName") or s_data.get("name") or clean_query
            stock_details = s_data.get("stockDetails") if isinstance(s_data.get("stockDetails"), dict) else {}
            api_nse = (
                s_data.get("nse_symbol")
                or stock_details.get("NSECode")
                or s_data.get("symbol")
                or (query_variants[-1] if len(query_variants) > 1 else clean_query)
            )
            final_ticker = _normalize_ticker(str(api_nse).split(".")[0])

            result = {
                "ticker": final_ticker,
                "name": str(company_name).strip(),
                "current_price": round(price, 2),
                "pe_ratio": round(pe, 2) if pe is not None else 0.0,
                "dividend_yield": round(div, 2) if div is not None else 0.0,
                "beta": round(beta, 2) if beta is not None else 1.0,
                "industry": str(s_data.get("industry") or "").strip()
            }

            log_tool_call(
                tool_name="Indian Stock API (/stock)",
                inputs={"name": clean_query},
                output_summary=f"{final_ticker} ({result['name']}) | LTP: ₹{result['current_price']} | P/E: {result['pe_ratio']} | Beta: {result['beta']}",
                duration=time.time() - t0
            )

            _METRICS_CACHE[cache_key] = {**result, "_ts": time.time()}
            return result

        except Exception as e:
            print(f"[StockDataTool Error] fetch_live_stock_metrics('{clean_query}'): {e}")

    print(f"[StockDataTool Warning] No valid positive price returned for '{stock_query}' (tried {query_variants}).")
    return {}

def fetch_stock_historical_data(stock_name: str, period: str = "1yr", filter_type: str = "default") -> dict:
    """Fetches stock historical data from Indian Stock API."""
    try:
        url = f"{INDIAN_API_BASE}/historical_data"
        params = {"stock_name": stock_name, "period": period, "filter": filter_type}
        resp = requests.get(url, headers=_get_headers(), params=params, timeout=6)
        if resp.status_code == 200:
            return resp.json() if resp.json() else {}
    except Exception as e:
        print(f"[StockDataTool Error] fetch_stock_historical_data: {e}")
    return {}


def fetch_stock_forecasts(stock_id: str, measure_code: str = "EPS") -> dict:
    """Fetches stock forward estimates and forecasts from Indian Stock API."""
    try:
        url = f"{INDIAN_API_BASE}/stock_forecasts"
        params = {
            "stock_id": stock_id,
            "measure_code": measure_code,
            "period_type": "Annual",
            "data_type": "Estimates",
            "age": "Current"
        }
        resp = requests.get(url, headers=_get_headers(), params=params, timeout=6)
        if resp.status_code == 200:
            return resp.json() if resp.json() else {}
    except Exception as e:
        print(f"[StockDataTool Error] fetch_stock_forecasts: {e}")
    return {}

def _build_query_candidates(raw_query: str) -> list[str]:
    """
    Expands strings like 'Tata Consultancy Services (TCS)' into clean queries:
    ['Tata Consultancy Services', 'TCS'] so Indian Stock API /stock resolves reliably.
    """
    cleaned = raw_query.replace(".NS", "").replace(".BO", "").strip()
    candidates = []

    # Check for parenthetical ticker e.g. "Company Name (TICKER)"
    match = re.match(r"^(.*?)\s*\(([^)]+)\)\s*$", cleaned)
    if match:
        comp_name = match.group(1).strip()
        sym = match.group(2).strip()
        if comp_name:
            candidates.append(comp_name)
        if sym and sym not in candidates:
            candidates.append(sym)
    else:
        candidates.append(cleaned)

    return candidates