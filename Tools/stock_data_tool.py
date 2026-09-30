import time
import requests
from typing import Dict, Any, List, Optional
from Tools.logger import log_tool_call

_CACHE: Dict[str, Dict[str, Any]] = {}

def search_live_nse_equities_by_sector(sector_keyword: str, count: int = 5) -> List[str]:
    """
    Dynamically searches live NSE equity tickers matching any sector or theme
    identified by the agent. No static lists or hardcoded arrays.
    """
    import yfinance as yf
    t0 = time.time()
    discovered_tickers = []

    # Strategy A: Use yfinance dynamic search across Indian exchanges
    try:
        search_results = yf.Search(f"{sector_keyword} India", max_results=12)
        quotes = getattr(search_results, "quotes", []) or []
        for q in quotes:
            symbol = q.get("symbol", "")
            # Only select Indian NSE/BSE active equity symbols
            if symbol.endswith(".NS") or symbol.endswith(".BO"):
                discovered_tickers.append(symbol)
            elif not "." in symbol and q.get("exchange") in ["NSI", "NSE", "BSE"]:
                discovered_tickers.append(f"{symbol}.NS")

            if len(discovered_tickers) >= count:
                break
    except Exception as e:
        print(f"[Live Discovery Warning] Search for '{sector_keyword}' error: {e}")

    # Strategy B: Dynamic Screener Query if Search yielded insufficient results
    if len(discovered_tickers) < count:
        try:
            sector_mapping = {
                "technology": "Technology",
                "banking": "Financial Services",
                "financial": "Financial Services",
                "auto": "Consumer Cyclical",
                "automobile": "Consumer Cyclical",
                "pharma": "Healthcare",
                "healthcare": "Healthcare",
                "energy": "Energy",
                "power": "Utilities",
                "fmcg": "Consumer Defensive",
                "metals": "Basic Materials",
                "infrastructure": "Industrials"
            }
            standard_sector = None
            for key, val in sector_mapping.items():
                if key in sector_keyword.lower():
                    standard_sector = val
                    break

            if standard_sector:
                query = yf.EquityQuery(
                    'and',
                    [
                        yf.EquityQuery('eq', ['exchange', 'NSI']),
                        yf.EquityQuery('eq', ['sector', standard_sector])
                    ]
                )
                screener = yf.screen(query, sortField='intradaymarketcap', sortAsc=False, size=count * 2)
                quotes = screener.get("quotes", [])
                for q in quotes:
                    sym = q.get("symbol")
                    if sym and sym not in discovered_tickers:
                        discovered_tickers.append(sym)
                    if len(discovered_tickers) >= count:
                        break
        except Exception as e:
            print(f"[Dynamic Screener Warning] Screener error: {e}")

    # Deduplicate and return
    final_tickers = list(dict.fromkeys(discovered_tickers))[:count]
    log_tool_call(
        tool_name="Live NSE Equity Discovery",
        inputs={"sector_keyword": sector_keyword, "target_count": count},
        output_summary=f"Found {len(final_tickers)} live tickers: {final_tickers}",
        duration=time.time() - t0
    )
    return final_tickers

def fetch_live_stock_metrics(ticker: str) -> Dict[str, Any]:
    """
    Fetches strictly real-time quotes directly from live APIs.
    Logs actual network latency and API timestamps.
    """
    t0 = time.time()
    if ticker in _CACHE and (time.time() - _CACHE[ticker].get("_timestamp", 0)) < 30:
        return _CACHE[ticker]

    import yfinance as yf
    clean_symbol = ticker.replace(".NS", "").replace(".BO", "")

    try:
        stock = yf.Ticker(ticker)
        fast_info = getattr(stock, "fast_info", None)

        current_price = 0.0
        if fast_info:
            current_price = getattr(fast_info, "last_price", 0.0) or getattr(fast_info, "previous_close", 0.0) or 0.0

        info = stock.info or {}
        if current_price <= 0:
            current_price = info.get("currentPrice") or info.get("regularMarketPrice") or 0.0

        if current_price > 0:
            pe_ratio = info.get("trailingPE") or info.get("forwardPE") or 0.0
            beta = info.get("beta") if info.get("beta") is not None else 1.0
            div_yield = info.get("dividendYield") or 0.0
            mcap = info.get("marketCap") or (getattr(fast_info, "market_cap", 0) if fast_info else 0)

            metrics = {
                "ticker": ticker,
                "name": info.get("shortName") or info.get("longName") or clean_symbol,
                "current_price": round(float(current_price), 2),
                "pe_ratio": round(float(pe_ratio), 2),
                "beta": round(float(beta), 2),
                "dividend_yield": round(float(div_yield) * 100, 2) if div_yield < 1 else round(float(div_yield), 2),
                "market_cap_inr_cr": round(float(mcap) / 1e7, 2),
                "source": "Live Yahoo Finance / NSE Feed",
                "_timestamp": time.time(),
                "fetched_at_epoch": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            }
            _CACHE[ticker] = metrics

            log_tool_call(
                tool_name="Live Equity Valuation API",
                inputs={"ticker": ticker},
                output_summary=f"LTP: ₹{metrics['current_price']} | Beta: {metrics['beta']} | PE: {metrics['pe_ratio']}",
                duration=time.time() - t0
            )
            return metrics

    except Exception as e:
        print(f"[Error fetching live quotes for {ticker}]: {e}")

    # Fallback to direct NSE API
    from Tools.nse_market_tool import fetch_nse_direct_metric
    direct_nse = fetch_nse_direct_metric(clean_symbol)
    if direct_nse and direct_nse.get("current_price", 0) > 0:
        direct_nse["_timestamp"] = time.time()
        return direct_nse

    return {
        "ticker": ticker,
        "name": clean_symbol,
        "current_price": 0.0,
        "pe_ratio": 0.0,
        "beta": 1.0,
        "dividend_yield": 0.0,
        "market_cap_inr_cr": 0.0,
        "source": "Unreachable",
        "_timestamp": time.time()
    }