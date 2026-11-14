import os
import requests
from Tools.logger import log_agent_start, traceable
from Tools.market_hours import get_indian_market_status, is_market_open_now


def execute_megabull_order(symbol: str, action: str, quantity: int) -> dict:
    """
    Executes a single BUY or SELL order on MegaBull ONLY if NSE/BSE market is open.
    """
    market_status = get_indian_market_status()
    if not market_status["is_open"]:
        return {
            "status": "BLOCKED_MARKET_CLOSED",
            "executed": False,
            "market_status": market_status,
            "message": f"Order blocked: {market_status['reason']}"
        }

    megabull_base_url = os.getenv("MEGABULL_BASE_URL", "https://api.megabull.in")
    megabull_api_key = os.getenv("MEGABULL_API_KEY", "")
    headers = {"api-key": megabull_api_key, "Content-Type": "application/json"}

    clean_symbol = symbol.replace(".NS", "").replace(".BO", "").upper().strip()
    mb_side = "BUY" if action.upper() == "BUY" else "SELL"

    payload = {
        "symbol": clean_symbol,
        "action": mb_side,
        "quantity": int(quantity),
        "order_type": "MARKET"
    }

    try:
        res = requests.post(
            f"{megabull_base_url}/api/orders/execute",
            json=payload,
            headers=headers,
            timeout=6
        )
        if res.status_code in (200, 201):
            return {
                "status": "EXECUTED",
                "executed": True,
                "market_status": market_status,
                "message": f"Executed {mb_side} {quantity} qty of {clean_sym} on MegaBull.",
                "broker_response": res.json()
            }
        return {
            "status": "BROKER_REJECTED",
            "executed": False,
            "market_status": market_status,
            "message": f"MegaBull returned HTTP {res.status_code}: {res.text[:140]}"
        }
    except Exception as e:
        return {
            "status": "EXECUTION_ERROR",
            "executed": False,
            "market_status": market_status,
            "message": f"MegaBull connection error: {str(e)}"
        }


@traceable(name="Portfolio_Executer_Agent", run_type="chain")
def run_executer_agent(state: dict) -> dict:
    """
    Executer Agent: Coordinates autonomous MegaBull order execution strictly within NSE/BSE market hours.
    """
    log_agent_start("Executer Agent", "Validating NSE/BSE market hours & coordinating MegaBull orders")

    planned_actions = state.get("planned_actions", [])
    market_status = get_indian_market_status()
    execution_summary = []

    for item in planned_actions:
        action = item.get("action", "HOLD")
        ticker = item.get("ticker", "")
        qty = int(item.get("suggested_qty", 0))

        if action == "HOLD" or qty <= 0:
            execution_summary.append({
                "ticker": ticker,
                "status": "HOLD",
                "message": "Within risk bounds. No trade required."
            })
            continue

        if not market_status["is_open"]:
            execution_summary.append({
                "ticker": ticker,
                "status": "QUEUED_MARKET_CLOSED",
                "message": f"{action} {qty} qty queued — {market_status['reason']}"
            })
            continue

        if item.get("mode") == "autonomous":
            exec_res = execute_megabull_order(ticker, action, qty)
            execution_summary.append({
                "ticker": ticker,
                "status": exec_res["status"],
                "message": exec_res["message"]
            })
        else:
            execution_summary.append({
                "ticker": ticker,
                "status": "AWAITING_USER_APPROVAL",
                "message": f"Market is OPEN. Ready for 1-click {action} ({qty} qty) on MegaBull."
            })

    return {
        **state,
        "market_status": market_status,
        "execution_summary": execution_summary,
        "current_step": f"Executer Agent completed ({market_status['status_label']})."
    }