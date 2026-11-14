import time
from datetime import datetime, time as dt_time
from zoneinfo import ZoneInfo
from Tools.logger import log_tool_call, traceable

IST = ZoneInfo("Asia/Kolkata")
NSE_OPEN_TIME = dt_time(9, 15)
NSE_CLOSE_TIME = dt_time(15, 30)


@traceable(name="Check_Indian_Market_Hours", run_type="tool")
def get_indian_market_status(log_invocation: bool = True) -> dict:
    """
    Tool: Checks whether the Indian Stock Market (NSE / BSE) regular equity session
    is currently open (Monday to Friday, 09:15 AM to 03:30 PM IST).
    Returns a structured status dictionary used by Observer, Planner, Executer, and Notifier agents.
    """
    t0 = time.time()
    now_ist = datetime.now(IST)
    weekday = now_ist.weekday()  # 0 = Monday ... 6 = Sunday
    current_t = now_ist.time()

    is_weekday = weekday < 5
    is_within_hours = NSE_OPEN_TIME <= current_t <= NSE_CLOSE_TIME
    is_open = is_weekday and is_within_hours

    if is_open:
        status_label = "MARKET OPEN (NSE/BSE Live)"
        reason = f"Regular trading session active ({now_ist.strftime('%I:%M %p IST')})."
    elif not is_weekday:
        status_label = "MARKET CLOSED (Weekend)"
        reason = f"NSE/BSE closed on {now_ist.strftime('%A')}. Regular session resumes Monday 09:15 AM IST."
    elif current_t < NSE_OPEN_TIME:
        status_label = "PRE-MARKET (Closed)"
        reason = f"Current time {now_ist.strftime('%I:%M %p IST')}. Regular session opens at 09:15 AM IST."
    else:
        status_label = "MARKET CLOSED (After Hours)"
        reason = f"Current time {now_ist.strftime('%I:%M %p IST')}. Regular session closed at 03:30 PM IST."

    result = {
        "is_open": is_open,
        "status_label": status_label,
        "reason": reason,
        "ist_timestamp": now_ist.strftime("%Y-%m-%d %H:%M:%S IST"),
        "day_of_week": now_ist.strftime("%A"),
        "window": "Mon–Fri, 09:15 AM – 03:30 PM IST",
        "scheduled_observer_slots": ["11:00 AM IST", "03:00 PM IST"]
    }

    if log_invocation:
        log_tool_call(
            tool_name="Indian Market Hours Check (IST)",
            inputs={"ist_time": result["ist_timestamp"], "day": result["day_of_week"]},
            output_summary=f"{status_label} — {reason}",
            duration=time.time() - t0
        )

    return result


def is_market_open_now() -> bool:
    """Convenience boolean check for order execution guardrails."""
    return bool(get_indian_market_status(log_invocation=False).get("is_open", False))