import os
import requests
from dotenv import load_dotenv

load_dotenv()

MEGABULL_BASE_URL = os.getenv("MEGABULL_BASE_URL", "https://api.megabull.in")
MEGABULL_API_KEY = os.getenv("MEGABULL_API_KEY", "")

headers = {
    "api-key": MEGABULL_API_KEY,
    "Content-Type": "application/json"
}

def test_endpoint(name, path, method="GET", payload=None):
    url = f"{MEGABULL_BASE_URL}{path}"
    print(f"\n--- Testing [{name}] : {method} {url} ---")
    try:
        if method == "GET":
            res = requests.get(url, headers=headers)
        elif method == "POST":
            res = requests.post(url, headers=headers, json=payload)
        
        print(f"Status Code: {res.status_code}")
        try:
            data = res.json()
            print("Response JSON snippet:", str(data)[:300])
            return data
        except Exception:
            print("Response Text:", res.text[:300])
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    print(f"Base URL: {MEGABULL_BASE_URL}")
    print(f"API Key Present: {bool(MEGABULL_API_KEY)}")
    
    # Test 1: Get Instruments / Marketwatch
    test_endpoint("Instruments", "/api/marketwatch/instruments")
    
    # Test 2: Get My Holdings
    test_endpoint("My Holdings", "/api/holding/my")
    
    # Test 3: Get My Positions
    test_endpoint("My Positions", "/api/position/my")