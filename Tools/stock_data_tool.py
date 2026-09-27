import time
import yfinance as yf
from typing import Dict, Any, List
from Tools.logger import log_tool_call

_CACHE: Dict[str, Dict[str, Any]] = {}

INDIAN_SECTOR_UNIVERSE = {
    "Banking & Financials": ["HDFCBANK.NS", "ICICIBANK.NS", "KOTAKBANK.NS", "SBIN.NS"],
    "Information Technology": ["TCS.NS", "INFY.NS", "HCLTECH.NS", "WIPRO.NS"],
    "Automotive & EV": ["TATAMOTORS.NS", "M&M.NS", "MARUTI.NS", "BAJAJ-AUTO.NS"],
    "Pharma & Healthcare": ["SUNPHARMA.NS", "DRREDDY.NS", "CIPLA.NS", "DIVISLAB.NS"],
    "Energy & Infrastructure": ["RELIANCE.NS", "LT.NS", "NTPC.NS", "POWERGRID.NS"],
    "FMCG & Consumption": ["ITC.NS", "HINDUNILATR.NS", "NESTLEIND.NS", "TITAN.NS"]
}

def fetch_stock_metrics(ticker: str) -> Dict[str, Any]:
    t0 = time.time()
    if ticker in _CACHE:
        log_tool_call("yfinance API (Cached)", {"ticker": ticker}, f"LTP: ₹{_CACHE[ticker]['current_price']}", 0.001)
        return _CACHE[ticker]

    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        current_price = info.get("currentPrice") or info.get("regularMarketPrice") or info.get("previousClose") or 0.0
        pe_ratio = info.get("trailingPE") or info.get("forwardPE") or 0.0
        beta = info.get("beta") if info.get("beta") is not None else 1.0
        mcap = info.get("marketCap") or 0
        name = info.get("shortName") or info.get("longName") or ticker.replace(".NS", "")

        metrics = {
            "ticker": ticker,
            "name": name,
            "current_price": round(float(current_price), 2),
            "pe_ratio": round(float(pe_ratio), 2),
            "beta": round(float(beta), 2),
            "market_cap_inr_cr": round(mcap / 1e7, 2),
            "fifty_two_week_high": info.get("fiftyTwoWeekHigh", 0.0),
            "fifty_two_week_low": info.get("fiftyTwoWeekLow", 0.0),
        }
        _CACHE[ticker] = metrics
        log_tool_call("yfinance API", {"ticker": ticker}, f"LTP: ₹{metrics['current_price']}, Beta: {metrics['beta']}, PE: {metrics['pe_ratio']}", time.time() - t0)
        return metrics

    except Exception as e:
        default_metrics = {
            "ticker": ticker,
            "name": ticker.replace(".NS", ""),
            "current_price": 1000.0,
            "pe_ratio": 22.5,
            "beta": 1.0,
            "market_cap_inr_cr": 50000.0,
            "fifty_two_week_high": 1100.0,
            "fifty_two_week_low": 850.0,
        }
        log_tool_call("yfinance API (Fallback)", {"ticker": ticker, "error": str(e)}, f"Default metrics applied", time.time() - t0)
        return default_metrics

def get_sector_stocks(sector: str) -> List[str]:
    return INDIAN_SECTOR_UNIVERSE.get(sector, ["HDFCBANK.NS", "TCS.NS"])