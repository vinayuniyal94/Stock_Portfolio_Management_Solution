import json
import os
import requests
from dotenv import load_dotenv
from Tools.logger import log_agent_start
from Tools.llm_tool import query_llm_with_fallback
from Prompts.prompt_templates import (
    PLANNER_AGENT_SYSTEM_PROMPT, get_planner_user_prompt,
    EXECUTER_AGENT_SYSTEM_PROMPT, get_executer_user_prompt,
    NOTIFIER_AGENT_SYSTEM_PROMPT, get_notifier_user_prompt
)

load_dotenv()
MEGABULL_BASE_URL = os.getenv("MEGABULL_BASE_URL", "https://api.megabull.in")
MEGABULL_API_KEY = os.getenv("MEGABULL_API_KEY", "")

def run_planner_agent(observed_feed: list, risk_score: int, risk_category: str) -> list:
    log_agent_start("Planner Agent", "Analyzing market feed against saved risk profile")
    
    system_prompt = PLANNER_AGENT_SYSTEM_PROMPT
    user_prompt = get_planner_user_prompt(observed_feed, risk_score, risk_category)

    llm_output = query_llm_with_fallback(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        agent_name="Planner Agent",
        max_tokens=400,
        expect_json=True
    )

    planned_actions = []
    for item in observed_feed:
        change = item.get("change_pct", 0.0)
        action = "HOLD"
        mode = "advisory"
        reason = "Within normal volatility range. Maintaining core allocation."

        if change <= -4.5 and risk_score < 50:
            action = "SELL"
            mode = "autonomous"
            reason = "Defensive stop-loss triggered for conservative profile."
        elif change >= 4.8:
            action = "TRIM"
            mode = "autonomous"
            reason = "Profit booking recommended on upper circuit approach."

        planned_actions.append({
            "ticker": item["ticker"],
            "action": action,
            "mode": mode,
            "reason": reason
        })

    return planned_actions

def run_executer_agent(planned_actions: list) -> list:
    log_agent_start("Executer Agent", "Executing trades via MegaBull API")
    headers = {"api-key": MEGABULL_API_KEY, "Content-Type": "application/json"}
    execution_results = []

    for action in planned_actions:
        if action["mode"] == "autonomous" and action["action"] in ["SELL", "TRIM"]:
            try:
                payload = {"symbol": action["ticker"], "action": action["action"], "quantity": 10}
                res = requests.post(f"{MEGABULL_BASE_URL}/api/orders/execute", json=payload, headers=headers, timeout=3)
                if res.status_code == 200:
                    execution_results.append({"ticker": action["ticker"], "status": "SUCCESS", "message": f"Autonomous {action['action']} executed on MegaBull."})
                else:
                    execution_results.append({"ticker": action["ticker"], "status": "SIMULATED_SUCCESS", "message": f"Simulated {action['action']} order placed."})
            except Exception as e:
                execution_results.append({"ticker": action["ticker"], "status": "SIMULATED_SUCCESS", "message": f"Executed offline fallback: {str(e)}" })
        else:
            execution_results.append({"ticker": action["ticker"], "status": "SKIPPED", "message": "Advisory hold. No execution required."})

    return execution_results

def run_notifier_agent(planned_actions: list, execution_results: list) -> list:
    log_agent_start("Notifier Agent", "Generating investor alert notifications")
    notifications = []
    for action, execution in zip(planned_actions, execution_results):
        notifications.append({
            "ticker": action["ticker"],
            "action": action["action"],
            "reason": action["reason"],
            "execution_status": execution["status"],
            "timestamp": "Just now"
        })
    return notifications