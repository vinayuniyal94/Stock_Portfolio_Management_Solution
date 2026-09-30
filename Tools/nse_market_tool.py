import os
import time
import requests
from typing import Dict, Any, Optional
from Tools.logger import log_tool_call

_NSE_CACHE: Dict[str, Dict[str, Any]] = {}

class NSEDirectAPIClient:
    def __init__(self):
        self.base_url = os.getenv("NSE_BASE_URL", "https://www.nseindia.com")
        self.quote_url = os.getenv("NSE_QUOTE_API", "https://www.nseindia.com/api/quote-equity?symbol=")
        self.timeout = float(os.getenv("NSE_TIMEOUT_SECONDS", 5.0))
        
        # Standard browser headers required to bypass NSE 403 anti-scraping blocks
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Referer": "https://www.nseindia.com/",
            "Connection": "keep-alive"
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        self._cookie_timestamp = 0

    def _refresh_session_cookies(self):
        """Initializes handshake with NSE home page to acquire session cookies."""
        now = time.time()
        # Refresh cookie if older than 5 minutes
        if now - self._cookie_timestamp > 300:
            try:
                self.session.get(self.base_url, timeout=self.timeout)
                self._cookie_timestamp = now
            except Exception as e:
                print(f"[Warning] Failed to seed NSE cookies: {e}")

    def fetch_live_quote(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Fetches official real-time quotes directly from NSE India.
        Expects symbols like 'TCS', 'INFY', 'HDFCBANK', or 'RELIANCE'.
        """
        clean_symbol = symbol.replace(".NS", "").upper()
        
        # Memory Cache check
        if clean_symbol in _NSE_CACHE and (time.time() - _NSE_CACHE[clean_symbol].get("_fetched_at", 0)) < 60:
            return _NSE_CACHE[clean_symbol]

        t0 = time.time()
        self._refresh_session_cookies()
        url = f"{self.quote_url}{clean_symbol}"

        try:
            response = self.session.get(url, timeout=self.timeout)
            if response.status_code == 200:
                data = response.json()
                price_info = data.get("priceInfo", {})
                info = data.get("info", {})

                current_price = float(price_info.get("lastPrice", 0.0))
                p_change = float(price_info.get("pChange", 0.0))
                week_high = float(price_info.get("weekHighLow", {}).get("max", 0.0))
                week_low = float(price_info.get("weekHighLow", {}).get("min", 0.0))
                company_name = info.get("companyName", clean_symbol)

                if current_price > 0:
                    metrics = {
                        "ticker": f"{clean_symbol}.NS",
                        "symbol": clean_symbol,
                        "name": company_name,
                        "current_price": round(current_price, 2),
                        "percent_change": round(p_change, 2),
                        "fifty_two_week_high": round(week_high, 2),
                        "fifty_two_week_low": round(week_low, 2),
                        "source": "NSE Direct Live Feed",
                        "_fetched_at": time.time()
                    }
                    _NSE_CACHE[clean_symbol] = metrics
                    log_tool_call(
                        tool_name="Direct NSE API",
                        inputs={"symbol": clean_symbol},
                        output_summary=f"LTP: ₹{metrics['current_price']} ({metrics['percent_change']}%)",
                        duration=time.time() - t0
                    )
                    return metrics
        except Exception as e:
            print(f"[NSE API Tool Warning] Direct NSE query failed for {clean_symbol}: {e}")

        return None

nse_live_client = NSEDirectAPIClient()

def fetch_nse_direct_metric(symbol: str) -> Optional[Dict[str, Any]]:
    """Entry point tool for agents."""
    return nse_live_client.fetch_live_quote(symbol)