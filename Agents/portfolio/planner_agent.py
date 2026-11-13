def run_planner_agent(state: dict) -> dict:
    """
    Planner Agent: Analyzes market observations against the investor's saved risk profile.
    """
    observed_feed = state.get("observer_feed", [])
    risk_score = int(state.get("risk_score", 65))

    planned_actions = []
    for item in observed_feed:
        change = item["change_pct"]
        action = "HOLD"
        mode = "advisory"
        reason = f"Stable volatility range for risk score {risk_score}/100."

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

    return {
        **state,
        "planned_actions": planned_actions,
        "current_step": "Planner Agent formulated tactical rebalancing strategy."
    }