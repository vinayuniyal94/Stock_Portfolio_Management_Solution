from typing import TypedDict, Dict, Any, List
from langgraph.graph import StateGraph, END
from Agents.risk_agent import run_risk_profiling_agent
from Agents.stock_analyzer_agent import run_stock_analyzer_agent
from Agents.stock_bucket_agent import run_stock_bucket_agent
from Agents.critique_agent import run_critique_agent

class AgentWorkflowState(TypedDict):
    """
    Defines the global multi-agent state schema tracking stage progression,
    audit confidence, feedback loops, and revisions.
    """
    user_profile: Dict[str, Any]
    risk_score: int
    risk_category: str
    risk_analysis: str
    selected_sectors: List[str]
    market_data: Dict[str, Any]
    final_portfolio: Dict[str, Any]
    last_agent: str             # Tracks which agent was just executed
    critique_iterations: int    # Tracks re-correction loop counts
    critique_feedback: str      # Auditor feedback remarks
    critique_confidence: int    # Quantitative confidence score (0-100)
    needs_revision: bool        # Flag indicating if re-correction is required
    current_step: str

def route_after_critique(state: AgentWorkflowState):
    """
    Conditional router after the Critique Agent evaluates an output.
    - If revision is needed and limits allow, it loops back to the exact agent that failed.
    - Otherwise, it advances to the next logical stage or terminates at END.
    """
    needs_revision = state.get("needs_revision", False)
    last_agent = state.get("last_agent", "")
    
    if needs_revision:
        # Loop back directly to the agent that needs correction
        if last_agent == "risk_profiler":
            return "risk_profiler"
        elif last_agent == "stock_analyzer":
            return "stock_analyzer"
        elif last_agent == "stock_bucket":
            return "stock_bucket"

    # Forward routing progression when audit passes
    if last_agent == "risk_profiler":
        return "stock_analyzer"
    elif last_agent == "stock_analyzer":
        return "stock_bucket"
    elif last_agent == "stock_bucket":
        return END

    return END

def build_portfolio_graph():
    """
    Constructs and compiles the multi-stage LangGraph workflow where the
    Critique Agent acts as an active gatekeeper and auditor for every agent.
    """
    workflow = StateGraph(AgentWorkflowState)

    # Register all agent nodes
    workflow.add_node("risk_profiler", run_risk_profiling_agent)
    workflow.add_node("stock_analyzer", run_stock_analyzer_agent)
    workflow.add_node("stock_bucket", run_stock_bucket_agent)
    workflow.add_node("critique_agent", run_critique_agent)

    # Define workflow entry and sequential edges leading into the Critique Agent gate
    workflow.set_entry_point("risk_profiler")
    workflow.add_edge("risk_profiler", "critique_agent")
    workflow.add_edge("stock_analyzer", "critique_agent")
    workflow.add_edge("stock_bucket", "critique_agent")

    # Conditional routing from Critique Agent back to respective agents or forward/END
    workflow.add_conditional_edges(
        "critique_agent",
        route_after_critique,
        {
            "risk_profiler": "risk_profiler",
            "stock_analyzer": "stock_analyzer",
            "stock_bucket": "stock_bucket",
            END: END
        }
    )

    return workflow.compile()

# Compile the multi-stage graph executor instance
graph_executor = build_portfolio_graph()