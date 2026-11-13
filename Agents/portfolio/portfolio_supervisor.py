from typing import TypedDict, Dict, Any, List
from langgraph.graph import StateGraph, END
from Agents.portfolio.observer_agent import run_observer_agent
from Agents.portfolio.planner_agent import run_planner_agent
from Agents.portfolio.executer_agent import run_executer_agent
from Agents.portfolio.notifier_agent import run_notifier_agent

class PortfolioWorkflowState(TypedDict):
    stocks: List[Dict[str, Any]]
    risk_score: int
    risk_category: str
    observer_feed: List[Dict[str, Any]]
    planned_actions: List[Dict[str, Any]]
    execution_summary: List[Dict[str, Any]]
    notifications: List[Dict[str, Any]]
    current_step: str

def build_portfolio_surveillance_graph():
    workflow = StateGraph(PortfolioWorkflowState)

    workflow.add_node("observer", run_observer_agent)
    workflow.add_node("planner", run_planner_agent)
    workflow.add_node("executer", run_executer_agent)
    workflow.add_node("notifier", run_notifier_agent)

    workflow.set_entry_point("observer")
    workflow.add_edge("observer", "planner")
    workflow.add_edge("planner", "executer")
    workflow.add_edge("executer", "notifier")
    workflow.add_edge("notifier", END)

    return workflow.compile()

portfolio_graph_executor = build_portfolio_surveillance_graph()