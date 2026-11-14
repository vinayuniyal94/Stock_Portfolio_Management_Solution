from typing import TypedDict, Dict, Any, List
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from Tools.logger import traceable
from Agents.portfolio.observer_agent import run_observer_agent
from Agents.portfolio.planner_agent import run_planner_agent
from Agents.portfolio.executer_agent import run_executer_agent
from Agents.portfolio.notifier_agent import run_notifier_agent

# Load LangSmith environment variables before compiling the LangGraph workflow
load_dotenv(override=True)


class PortfolioWorkflowState(TypedDict):
    stocks: List[Dict[str, Any]]
    risk_score: int
    risk_category: str
    market_status: Dict[str, Any]
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


_compiled_portfolio_graph = build_portfolio_surveillance_graph()


class TracedPortfolioGraphExecutor:
    """
    Drop-in wrapper around compiled LangGraph so existing calls to
    `portfolio_graph_executor.invoke(state)` automatically create a named
    parent run in LangSmith with full child spans for Observer, Planner,
    Executer, and Notifier agents.
    """

    @traceable(name="ArthVeda_Portfolio_Rebalance_Graph", run_type="chain")
    def invoke(self, initial_state: dict) -> dict:
        return _compiled_portfolio_graph.invoke(initial_state)


portfolio_graph_executor = TracedPortfolioGraphExecutor()