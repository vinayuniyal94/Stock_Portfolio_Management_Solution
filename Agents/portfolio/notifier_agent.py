def run_notifier_agent(state: dict) -> dict:
    """
    Notifier Agent: Synthesizes execution outcomes and market observations into investor alerts.
    """
    planned_actions = state.get("planned_actions", [])
    execution_summary = state.get("execution_summary", [])

    notifications = []
    for action, execution in zip(planned_actions, execution_summary):
        notifications.append({
            "ticker": action["ticker"],
            "action": action["action"],
            "reason": action["reason"],
            "execution_status": execution["status"],
            "timestamp": "Just now"
        })

    return {
        **state,
        "notifications": notifications,
        "current_step": "Notifier Agent synthesized audit alerts."
    }