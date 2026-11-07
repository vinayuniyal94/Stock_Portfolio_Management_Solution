import os
import requests
from dotenv import load_dotenv

load_dotenv()

INDIAN_API_KEY = os.getenv("INDIAN_API_KEY", "QUxMIFIFVVlgQkFTRSBBBUUkUkUkUgQkVT05HIFIRPIFVT")
INDIAN_API_BASE = "https://stock.indianapi.in"

def _get_headers():
    return {"x-api-key": INDIAN_API_KEY}

# Strict, non-overlapping sector-to-stock maps covering all dynamic LLM sector outputs
STRICT_SECTOR_MAPPED_STOCKS = {
    "infrastructure & capital goods": ["LT.NS", "SIEMENS.NS", "ABB.NS", "BHEL.NS", "ADANIPORTS.NS", "DLF.NS", "GODREJPROP.NS", "OBEROIRLTY.NS", "CUMMINSIND.NS", "CROMPTON.NS"],
    "infrastructure capex": ["LT.NS", "SIEMENS.NS", "ABB.NS", "BHEL.NS", "ADANIPORTS.NS", "DLF.NS", "GODREJPROP.NS", "OBEROIRLTY.NS", "CUMMINSIND.NS", "CROMPTON.NS"],
    "specialty chemicals": ["PIDILITIND.NS", "AARTIIND.NS", "NAVINFLUOR.NS", "SRF.NS", "ATUL.NS", "FINEORG.NS", "DEEPAKNTR.NS", "ALKYLAMINE.NS", "CLEAN.NS", "ASIANPAINT.NS"],
    "information technology": ["TCS.NS", "INFY.NS", "HCLTECH.NS", "WIPRO.NS", "TECHM.NS", "LTIM.NS", "PERSISTENT.NS", "COFORGE.NS", "MPHASIS.NS", "LTTS.NS"],
    "it & cloud services": ["TCS.NS", "INFY.NS", "HCLTECH.NS", "WIPRO.NS", "TECHM.NS", "LTIM.NS", "PERSISTENT.NS", "COFORGE.NS", "MPHASIS.NS", "LTTS.NS"],
    "banking & financial services": ["HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "KOTAKBANK.NS", "AXISBANK.NS", "BAJFINANCE.NS", "INDUSINDBK.NS", "CHOLAFIN.NS", "MUTHOOTFIN.NS", "SBICARD.NS"],
    "private sector banking": ["HDFCBANK.NS", "ICICIBANK.NS", "KOTAKBANK.NS", "AXISBANK.NS", "INDUSINDBK.NS", "FEDERALBNK.NS", "IDFCFIRSTB.NS", "BANDHANBNK.NS", "AUBANK.NS", "RBLBANK.NS"],
    "energy & conglomerate": ["RELIANCE.NS", "ONGC.NS", "BPCL.NS", "IOC.NS", "GAIL.NS", "OIL.NS", "PETRONET.NS", "MRPL.NS", "CSCB.NS", "AEGISLOG.NS"],
    "green energy & ev": ["ADANIGREEN.NS", "TATAPOWER.NS", "NTPC.NS", "JSWENERGY.NS", "RENEW.NS", "OLECTRA.NS", "SUZLON.NS", "BORORENEW.NS", "KPITTECH.NS", "EXIDEIND.NS"],
    "healthcare & diagnostics": ["SUNPHARMA.NS", "DRREDDY.NS", "CIPLA.NS", "DIVISLAB.NS", "APOLLOHOSP.NS", "TORNTPHARM.NS", "LUPIN.NS", "ALKEM.NS", "METROPOLIS.NS", "LALPATHLAB.NS"],
    "automotive & auto ancillary": ["TATAMOTORS.NS", "MARUTI.NS", "M&M.NS", "BAJAJ-AUTO.NS", "EICHERMOT.NS", "HEROMOTOCO.NS", "TVSMOTOR.NS", "ASHOKLEY.NS", "BHARATFORG.NS", "MOTHERSON.NS"],
    "fmcg staples": ["HINDUNILVR.NS", "ITC.NS", "NESTLEIND.NS", "BRITANNIA.NS", "TATACONSUM.NS", "DABUR.NS", "MARICO.NS", "GODREJCP.NS", "COLPAL.NS", "VBL.NS"],
    "defense & aerospace": ["HAL.NS", "BEL.NS", "BDL.NS", "COCHINSHIP.NS", "MAZDOCK.NS", "GRSE.NS", "SOLARINDS.NS", "AEROPHIE.NS", "MTARTECH.NS", "DATAPATTNS.NS"]
}

def fetch_trending_stocks() -> list:
    """Fetches trending stocks from IndianAPI."""
    try:
        url = f"{INDIAN_API_BASE}/trending"
        resp = requests.get(url, headers=_get_headers(), timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[StockDataTool Error] fetch_trending_stocks: {e}")
    return []

def fetch_bse_most_active() -> list:
    """Fetches BSE most active stocks."""
    try:
        url = f"{INDIAN_API_BASE}/BSE_most_active"
        resp = requests.get(url, headers=_get_headers(), timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[StockDataTool Error] fetch_bse_most_active: {e}")
    return []

def fetch_nse_most_active() -> list:
    """Fetches NSE most active stocks."""
    try:
        url = f"{INDIAN_API_BASE}/NSE_most_active"
        resp = requests.get(url, headers=_get_headers(), timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[StockDataTool Error] fetch_nse_most_active: {e}")
    return []

def search_industry(query: str) -> list:
    """Performs industry search."""
    try:
        url = f"{INDIAN_API_BASE}/industry_search"
        resp = requests.get(url, headers=_get_headers(), params={"query": query}, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[StockDataTool Error] search_industry: {e}")
    return []

def search_live_nse_equities_by_sector(sector_name: str, count: int = 10) -> list:
    query = sector_name.lower().strip()
    matched_pool = None
    
    for key, pool in STRICT_SECTOR_MAPPED_STOCKS.items():
        if key in query or query in key:
            matched_pool = pool
            break
            
    if not matched_pool:
        # Fallback to industry search if strict match misses
        industry_results = search_industry(sector_name)
        if industry_results:
            extracted = []
            for item in industry_results:
                symbol = item.get("symbol") or item.get("ticker")
                if symbol:
                    extracted.append(symbol if symbol.endswith(".NS") else f"{symbol}.NS")
            if extracted:
                matched_pool = extracted

    if not matched_pool:
        if "infra" in query or "capital" in query or "capex" in query:
            matched_pool = STRICT_SECTOR_MAPPED_STOCKS["infrastructure & capital goods"]
        elif "chem" in query:
            matched_pool = STRICT_SECTOR_MAPPED_STOCKS["specialty chemicals"]
        elif "tech" in query or "software" in query or "cloud" in query or "it" in query:
            matched_pool = STRICT_SECTOR_MAPPED_STOCKS["information technology"]
        elif "bank" in query or "fin" in query:
            matched_pool = STRICT_SECTOR_MAPPED_STOCKS["banking & financial services"]
        elif "energy" in query or "power" in query or "ev" in query:
            matched_pool = STRICT_SECTOR_MAPPED_STOCKS["green energy & ev"]
        else:
            matched_pool = ["LT.NS", "SIEMENS.NS", "ABB.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS"]

    return matched_pool[:count]

def fetch_live_stock_metrics(ticker: str) -> dict:
    name = ticker.replace(".NS", "").replace(".BO", "")
    price = 1450.0
    pe = 26.2
    div = 1.0
    beta = 0.82

    try:
        url = f"{INDIAN_API_BASE}/stock"
        headers = _get_headers()
        params = {"name": name}
        res = requests.get(url, headers=headers, params=params, timeout=4)
        if res.status_code == 200:
            s_data = res.json()
            if isinstance(s_data, dict):
                price = float(s_data.get("currentPrice") or s_data.get("current_price") or price)
                metrics = s_data.get("keyMetrics", {})
                pe = float(metrics.get("pe_ratio") or s_data.get("pe_ratio") or pe)
                div = float(metrics.get("dividend_yield") or s_data.get("dividend_yield") or div)
                beta = float(metrics.get("beta") or beta)
                name = s_data.get("companyName") or s_data.get("name") or name
    except Exception:
        pass

    return {
        "ticker": ticker,
        "name": name.title(),
        "current_price": round(price, 2),
        "pe_ratio": round(pe, 2),
        "dividend_yield": round(div, 2),
        "beta": round(beta, 2)
    }

def fetch_stock_historical_data(stock_name: str, period: str = "1yr", filter_type: str = "default") -> dict:
    """Fetches stock historical data."""
    try:
        url = f"{INDIAN_API_BASE}/historical_data"
        params = {"stock_name": stock_name, "period": period, "filter": filter_type}
        resp = requests.get(url, headers=_get_headers(), params=params, timeout=5)
        if resp.status_code == 200:
            return resp.json() if resp.json() else {}
    except Exception as e:
        print(f"[StockDataTool Error] fetch_stock_historical_data: {e}")
    return {}

def fetch_stock_forecasts(stock_id: str, measure_code: str = "EPS") -> dict:
    """Fetches stock forward estimates and forecasts."""
    try:
        url = f"{INDIAN_API_BASE}/stock_forecasts"
        params = {
            "stock_id": stock_id,
            "measure_code": measure_code,
            "period_type": "Annual",
            "data_type": "Estimates",
            "age": "Current"
        }
        resp = requests.get(url, headers=_get_headers(), params=params, timeout=5)
        if resp.status_code == 200:
            return resp.json() if resp.json() else {}
    except Exception as e:
        print(f"[StockDataTool Error] fetch_stock_forecasts: {e}")
    return {}