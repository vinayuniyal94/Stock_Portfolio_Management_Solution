import os
import requests
from dotenv import load_dotenv

load_dotenv()

MEGABULL_BASE_URL = os.getenv("MEGABULL_BASE_URL", "https://api.megabull.in")
MEGABULL_API_KEY = os.getenv("MEGABULL_API_KEY", "")

class MegabullTradingService:
    def __init__(self):
        self.headers = {
            "api-key": MEGABULL_API_KEY,
            "Content-Type": "application/json"
        }
        self.instrument_map = {}
        self._load_instruments()

    def _load_instruments(self):
        """Fetches the tradable instruments CSV download URL and maps ticker symbols to instrumentTokens."""
        if not MEGABULL_API_KEY:
            print("[MegaBull Warning]: MEGABULL_API_KEY is not set. Paper trading execution will be simulated.")
            return

        try:
            res = requests.get(f"{MEGABULL_BASE_URL}/api/marketwatch/instruments", headers=self.headers)
            if res.status_code == 200:
                data = res.json()
                csv_url = data.get("downloadUrl")
                if csv_url:
                    import csv
                    import io
                    csv_res = requests.get(csv_url)
                    if csv_res.status_code == 200:
                        reader = csv.DictReader(io.StringIO(csv_res.text))
                        for row in reader:
                            symbol = row.get("tradingSymbol", "").upper()
                            token = row.get("instrumentToken")
                            if symbol and token:
                                self.instrument_map[symbol] = token
                        print(f"[MegaBull]: Loaded {len(self.instrument_map)} instrument tokens successfully.")
        except Exception as e:
            print(f"[MegaBull Error loading instruments]: {e}")
    def get_my_holdings(self):
        """Fetches live delivery holdings from MegaBull."""
        if not MEGABULL_API_KEY:
            return {"status": "error", "message": "API key missing"}
        try:
            res = requests.get(f"{MEGABULL_BASE_URL}/api/holding/my", headers=self.headers)
            if res.status_code == 200:
                return res.json()
            return {"status": "error", "reason": res.text}
        except Exception as e:
            return {"status": "error", "reason": str(e)}

    def get_my_positions(self):
        """Fetches open positions from MegaBull."""
        if not MEGABULL_API_KEY:
            return {"status": "error", "message": "API key missing"}
        try:
            res = requests.get(f"{MEGABULL_BASE_URL}/api/position/my", headers=self.headers)
            if res.status_code == 200:
                return res.json()
            return {"status": "error", "reason": res.text}
        except Exception as e:
            return {"status": "error", "reason": str(e)}

    def execute_portfolio_orders(self, portfolio_stocks: list):
        """
        Takes the final list of stocks recommended by ArthVeda AI agents 
        and places simulated buy orders on MegaBull.
        """
        if not MEGABULL_API_KEY:
            return {"status": "skipped", "message": "API key missing"}

        executed_orders = []
        for stock in portfolio_stocks:
            ticker = stock.get("ticker", "").upper().replace(".NS", "").replace(".BO", "")
            units = stock.get("units", 1)
            price = stock.get("current_price", 1000.0)
            
            # Find matching instrument token or fallback to a default token if not found
            token = self.instrument_map.get(ticker, "256265") # Default fallback token

            payload = {
                "instrumentToken": str(token),
                "qty": int(units),
                "type": "BUY",
                "duration": "CNC", # Delivery / Long term holding
                "orderType": "LIMIT",
                "price": float(price)
            }

            try:
                res = requests.post(f"{MEGABULL_BASE_URL}/api/order/buysell", headers=self.headers, json=payload)
                if res.status_code == 200:
                    order_data = res.json()
                    executed_orders.append({
                        "ticker": ticker,
                        "orderId": order_data.get("id"),
                        "status": "PLACED",
                        "qty": units
                    })
                else:
                    executed_orders.append({
                        "ticker": ticker,
                        "status": "FAILED",
                        "reason": res.text
                    })
            except Exception as e:
                executed_orders.append({
                    "ticker": ticker,
                    "status": "ERROR",
                    "reason": str(e)
                })

        return {"executed_orders": executed_orders}

megabull_service = MegabullTradingService()