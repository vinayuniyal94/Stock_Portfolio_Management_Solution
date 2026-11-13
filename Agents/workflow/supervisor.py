from typing import TypedDict, Dict, Any, List
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from Tools.logger import traceable
from Agents.workflow.risk_agent import run_risk_profiling_agent
from Agents.workflow.stock_analyzer_agent import run_stock_analyzer_agent
from Agents.workflow.stock_bucket_agent import run_stock_bucket_agent
from Agents.workflow.critique_agent import run_critique_agent

load_dotenv(override=True)


class AgentWorkflowState(TypedDict):
    user_profile: Dict[str, Any]
    risk_score: int
    risk_category: str
    risk_analysis: str
    risk_thought_process: str
    selected_sectors: List[str]
    sector_rationales: Dict[str, Any]
    market_data: Dict[str, Any]
    analyzer_thought_process: str
    final_portfolio: Dict[str, Any]
    last_agent: str             
    critique_iterations: int    
    critique_feedback: str      
    critique_confidence: int    
    needs_revision: bool        
    workflow_failed: bool
    current_step: str


def route_after_critique(state: AgentWorkflowState):
    needs_revision = state.get("needs_revision", False)
    last_agent = state.get("last_agent", "")
    
    if needs_revision:
        if last_agent == "risk_profiler":
            return "risk_profiler"
        elif last_agent == "stock_analyzer":
            return "stock_analyzer"
        elif last_agent == "stock_bucket":
            return "stock_bucket"

    if last_agent == "risk_profiler":
        return "stock_analyzer"
    elif last_agent == "stock_analyzer":
        return "stock_bucket"
    elif last_agent == "stock_bucket":
        return END

    return END


def build_portfolio_graph():
    workflow = StateGraph(AgentWorkflowState)

    workflow.add_node("risk_profiler", run_risk_profiling_agent)
    workflow.add_node("stock_analyzer", run_stock_analyzer_agent)
    workflow.add_node("stock_bucket", run_stock_bucket_agent)
    workflow.add_node("critique_agent", run_critique_agent)

    workflow.set_entry_point("risk_profiler")
    workflow.add_edge("risk_profiler", "critique_agent")
    workflow.add_edge("stock_analyzer", "critique_agent")
    workflow.add_edge("stock_bucket", "critique_agent")

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


graph_executor = build_portfolio_graph()


@traceable(name="ArthVeda_Advisory_LangGraph_Run", run_type="chain")
def invoke_advisory_workflow(initial_state: dict) -> dict:
    """Traced entry point for full LangGraph workflow invocations."""
    return graph_executor.invoke(initial_state)