from Tools.logger import log_agent_start, traceable
from Tools.market_hours import get_indian_market_status, is_market_open_now


@traceable(name="Portfolio_Planner_Agent", run_type="chain")
def run_planner_agent(state: dict) -> dict:
    """
    Planner Agent: Evaluates live Observer telemetry against investor risk score
    and generates actionable BUY / SELL / REBALANCE recommendations.
    """
    log_agent_start("Planner Agent", "Formulating tactical BUY/SELL/REBALANCE signals from live Observer feed")

    observed_feed = state.get("observer_feed", [])
    risk_score = int(state.get("risk_score", 65))
    market_status = state.get("market_status") or get_indian_market_status()

    total_portfolio_value = sum(
        (item.get("ltp", 0) * item.get("units", 0)) for item in observed_feed
    ) or 1.0
    target_equal_weight = 100.0 / max(len(observed_feed), 1)

    planned_actions = []
    for item in observed_feed:
        ticker = item["ticker"]
        symbol = item.get("symbol") or ticker.replace(".NS", "")
        ltp = float(item.get("ltp", 0))
        units = int(item.get("units", 0))
        change_pct = float(item.get("change_pct", 0.0))
        pnl_pct = float(item.get("pnl_pct", 0.0))
        holding_val = ltp * units
        current_weight = round((holding_val / total_portfolio_value) * 100.0, 2)
        weight_drift = round(current_weight - target_equal_weight, 2)

        action = "HOLD"
        suggested_qty = 0
        mode = "advisory"
        urgency = "LOW"
        reason = f"Trading within normal range ({change_pct:+.2f}% | P&L {pnl_pct:+.2f}%). Weight {current_weight}% aligned."

        # 1. Stop-loss / Risk breach check
        stop_loss_limit = -3.0 if risk_score < 50 else (-4.5 if risk_score < 75 else -6.5)
        if pnl_pct <= stop_loss_limit and units > 0:
            action = "SELL"
            suggested_qty = max(1, units // 2)
            mode = "autonomous" if market_status["is_open"] else "queued_market_open"
            urgency = "HIGH"
            reason = (
                f"Drawdown of {pnl_pct:.2f}% breached risk threshold ({stop_loss_limit}% for score {risk_score}/100). "
                f"Recommend trimming {suggested_qty} shares to protect capital."
            )

        # 2. Profit booking / Upper circuit surge
        elif change_pct >= 4.5 or pnl_pct >= 8.0:
            action = "SELL"
            suggested_qty = max(1, units // 4) if units > 1 else 1
            mode = "autonomous" if market_status["is_open"] else "queued_market_open"
            urgency = "MEDIUM"
            reason = (
                f"Strong upside momentum ({change_pct:+.2f}% today, {pnl_pct:+.2f}% overall). "
                f"Book partial gains by selling {suggested_qty} shares."
            )

        # 3. Dip buying / Underweight rebalancing opportunity
        elif pnl_pct <= -1.5 and weight_drift <= -2.0 and ltp > 0:
            action = "BUY"
            suggested_qty = max(1, int((total_portfolio_value * 0.02) // ltp))
            mode = "advisory"
            urgency = "MEDIUM"
            reason = (
                f"Underweight by {abs(weight_drift):.1f}% ({current_weight}% vs {target_equal_weight:.1f}% target) "
                f"at attractive dip ({pnl_pct:+.2f}%). Accumulate {suggested_qty} shares to rebalance."
            )

        # 4. Overweight concentration rebalance
        elif weight_drift >= 5.0 and units > 2:
            action = "REBALANCE"
            suggested_qty = max(1, int(((weight_drift / 100.0) * total_portfolio_value) // ltp))
            mode = "advisory"
            urgency = "MEDIUM"
            reason = (
                f"Position overweight at {current_weight}% (+{weight_drift:.1f}% above target). "
                f"Rebalance by trimming {suggested_qty} shares."
            )

        planned_actions.append({
            "ticker": ticker,
            "symbol": symbol,
            "name": item.get("name", symbol),
            "ltp": ltp,
            "current_units": units,
            "suggested_qty": suggested_qty,
            "current_weight": current_weight,
            "action": action,
            "mode": mode,
            "urgency": urgency,
            "reason": reason,
            "can_execute_now": market_status["is_open"] and action in ("BUY", "SELL", "REBALANCE")
        })

    return {
        **state,
        "market_status": market_status,
        "planned_actions": planned_actions,
        "current_step": f"Planner Agent generated {sum(1 for a in planned_actions if a['action'] != 'HOLD')} actionable signals."
    }