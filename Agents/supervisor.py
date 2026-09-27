from typing import TypedDict, Dict, Any, List
from langgraph.graph import StateGraph, END
from Agents.risk_agent import run_risk_profiling_agent
from Agents.stock_analyzer_agent import run_stock_analyzer_agent
from Agents.stock_bucket_agent import run_stock_bucket_agent

class AgentWorkflowState(TypedDict):
    user_profile: Dict[str, Any]
    risk_score: int
    risk_category: str
    risk_analysis: str
    selected_sectors: List[str]
    market_data: Dict[str, Any]
    final_portfolio: Dict[str, Any]
    current_step: str

def build_portfolio_graph():
    workflow = StateGraph(AgentWorkflowState)

    # Register agent nodes
    workflow.add_node("risk_profiler", run_risk_profiling_agent)
    workflow.add_node("stock_analyzer", run_stock_analyzer_agent)
    workflow.add_node("stock_bucket", run_stock_bucket_agent)

    # Set workflow flow
    workflow.set_entry_point("risk_profiler")
    workflow.add_edge("risk_profiler", "stock_analyzer")
    workflow.add_edge("stock_analyzer", "stock_bucket")
    workflow.add_edge("stock_bucket", END)

    return workflow.compile()

# This is the exact variable imported by server.py
graph_executor = build_portfolio_graph()