from Tools.logger import log_agent_start, traceable
from Tools.market_hours import get_indian_market_status, is_market_open_now


@traceable(name="Portfolio_Notifier_Agent", run_type="chain")
def run_notifier_agent(state: dict) -> dict:
    """
    Notifier Agent: Generates actionable BUY / SELL / REBALANCE notifications
    with NSE/BSE market-hours execution eligibility flags.
    """
    log_agent_start("Notifier Agent", "Synthesizing actionable investor alerts & MegaBull trade triggers")

    planned_actions = state.get("planned_actions", [])
    execution_summary = state.get("execution_summary", [])
    market_status = state.get("market_status") or get_indian_market_status()

    exec_map = {e["ticker"]: e for e in execution_summary}
    notifications = []

    for plan in planned_actions:
        ticker = plan["ticker"]
        exec_info = exec_map.get(ticker, {})
        action = plan.get("action", "HOLD")
        qty = int(plan.get("suggested_qty", 0))

        notifications.append({
            "ticker": ticker,
            "symbol": plan.get("symbol") or ticker.replace(".NS", ""),
            "name": plan.get("name", ticker),
            "ltp": plan.get("ltp", 0),
            "current_units": plan.get("current_units", 0),
            "suggested_qty": qty,
            "action": action,
            "urgency": plan.get("urgency", "LOW"),
            "reason": plan.get("reason", ""),
            "execution_status": exec_info.get("status", "PENDING"),
            "execution_message": exec_info.get("message", ""),
            "market_open": market_status["is_open"],
            "market_status_label": market_status["status_label"],
            "can_execute_now": bool(market_status["is_open"] and action in ("BUY", "SELL", "REBALANCE") and qty > 0)
        })

    return {
        **state,
        "market_status": market_status,
        "notifications": notifications,
        "current_step": "Notifier Agent dispatched actionable portfolio alerts."
    }