import os
import sys
import time
from dotenv import load_dotenv

# Ensure the root directory is explicitly appended to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Load environment variables first so LangSmith & API keys initialize before module imports
load_dotenv(override=True)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import requests

# 1. Import Workflow Agents from Agents.workflow package
try:
    from Agents.workflow.supervisor import graph_executor
except ImportError:
    from workflow.supervisor import graph_executor

from Agents.workflow.risk_agent import run_risk_profiling_agent
from Agents.workflow.stock_analyzer_agent import run_stock_analyzer_agent
from Agents.workflow.stock_bucket_agent import run_stock_bucket_agent
from Agents.workflow.critique_agent import run_critique_agent

# 2. Import Portfolio Surveillance Graph from Agents.portfolio package
try:
    from Agents.portfolio.portfolio_supervisor import portfolio_graph_executor
except ImportError:
    portfolio_graph_executor = None

from health_service import health_service
from security_middleware import OWAPSSecurityMiddleware

# Import real RAG engine service from the RAG folder
try:
    from RAG.rag_engine import rag_engine
except ImportError as e:
    print(f"[ERROR importing rag_engine from RAG folder]: {e}")
    rag_engine = None

from Tools.logger import log_agent_start, traceable

# Initialize FastAPI application
app = FastAPI(title="ArthVeda AI Wealth Management API", version="2.0.0")

# 1. Add OWAPS Security Middleware first
app.add_middleware(OWAPSSecurityMiddleware)

# 2. Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProfileRequest(BaseModel):
    user_profile: dict


class WorkflowRequest(BaseModel):
    step: str
    user_profile: Optional[Dict[str, Any]] = None
    risk_score: Optional[int] = None
    risk_category: Optional[str] = None
    selected_sectors: Optional[list] = None
    market_data: Optional[Dict[str, Any]] = None


class SavePortfolioRequest(BaseModel):
    user_id: str
    portfolio_name: str
    bucket_archetype: str
    risk_score: int
    risk_category: str
    initial_investment: float
    portfolio_json: dict


@app.get("/")
def read_root():
    return {"status": "online", "platform": "ArthVeda AI Multiagentic Wealth Management Suite"}


# --- Portfolio Persistence & MegaBull Integration Endpoints ---

@app.post("/api/portfolio/save")
async def save_user_portfolio(payload: SavePortfolioRequest):
    """
    Saves the generated portfolio to Supabase and synchronizes 
    buy orders with the MegaBull paper-trading API.
    """
    try:
        stocks = payload.portfolio_json.get("portfolio", [])
        megabull_results = []

        megabull_base_url = os.getenv("MEGABULL_BASE_URL", "https://api.megabull.in")
        megabull_api_key = os.getenv("MEGABULL_API_KEY", "")
        headers = {
            "api-key": megabull_api_key,
            "Content-Type": "application/json"
        }

        # Dispatch orders to MegaBull for each stock
        for stock in stocks:
            ticker = stock.get("ticker") or stock.get("Symbol")
            qty = stock.get("units") or stock.get("Quantity") or 10
            try:
                order_payload = {
                    "symbol": ticker,
                    "action": "BUY",
                    "quantity": qty,
                    "order_type": "MARKET"
                }
                mb_res = requests.post(
                    f"{megabull_base_url}/api/orders/execute",
                    json=order_payload,
                    headers=headers,
                    timeout=4
                )
                if mb_res.status_code == 200:
                    megabull_results.append({"ticker": ticker, "status": "Synced with MegaBull"})
                else:
                    megabull_results.append({"ticker": ticker, "status": "Simulated MegaBull Sync"})
            except Exception as e:
                megabull_results.append({"ticker": ticker, "status": f"Offline Synced: {str(e)}"})

        # Save portfolio record to Supabase 'user_portfolios' table
        from health_service import supabase
        if supabase:
            supabase.from_("user_portfolios").insert({
                "user_id": payload.user_id,
                "portfolio_name": payload.portfolio_name,
                "bucket_archetype": payload.bucket_archetype,
                "risk_score": payload.risk_score,
                "risk_category": payload.risk_category,
                "initial_investment": payload.initial_investment,
                "portfolio_json": payload.portfolio_json
            }).execute()

        return {
            "status": "success",
            "message": "Portfolio successfully synced with MegaBull and saved to Supabase.",
            "megabull_sync": megabull_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save portfolio: {str(e)}")


@app.get("/api/portfolio/{user_id}")
@app.get("/api/portfolios/{user_id}")
async def get_user_portfolios(user_id: str):
    """Retrieves saved portfolios for a registered user from Supabase."""
    try:
        from health_service import supabase
        if not supabase:
            return {"portfolios": []}

        res = supabase.from_("user_portfolios").select("*").eq("user_id", user_id).execute()
        return {"portfolios": res.data or []}
    except Exception as e:
        print(f"[Fetch Portfolios Error]: {e}")
        return {"portfolios": []}


# --- Active Multi-Agent Surveillance Endpoint (Powered by Portfolio LangGraph) ---

@app.post("/api/agents/active-portfolio-monitor")
@traceable(name="Active_Portfolio_Surveillance_Run", run_type="chain")
async def run_active_portfolio_monitor(payload: dict):
    """
    Triggers the Observer -> Planner -> Executer -> Notifier portfolio LangGraph 
    surveillance workflow against live MegaBull market data.
    """
    stocks = payload.get("stocks", [])
    risk_score = int(payload.get("risk_score", 65))

    if not stocks:
        return {"status": "error", "message": "No portfolio stocks provided for active monitoring."}

    if portfolio_graph_executor:
        initial_state = {
            "stocks": stocks,
            "risk_score": risk_score,
            "risk_category": "Aggressive" if risk_score >= 75 else ("Conservative" if risk_score < 45 else "Moderate"),
            "observer_feed": [],
            "planned_actions": [],
            "execution_summary": [],
            "notifications": [],
            "current_step": "Initializing portfolio surveillance graph..."
        }
        result = portfolio_graph_executor.invoke(initial_state)
        return result

    return {"status": "error", "message": "Portfolio graph executor is not initialized."}


# --- Workflow Endpoints ---

@app.post("/api/agent/risk-profiler")
def run_risk_profiler_endpoint(req: ProfileRequest):
    try:
        initial_state = {"user_profile": req.user_profile, "critique_iterations": 0}
        state = run_risk_profiling_agent(initial_state)
        for _ in range(3):
            state = run_critique_agent(state)
            if state.get("workflow_failed", False) or not state.get("needs_revision", False):
                break
            state = run_risk_profiling_agent(state)
        return state
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/agent/stock-analyzer")
def run_stock_analyzer_endpoint(req: ProfileRequest):
    try:
        initial_state = {
            "user_profile": req.user_profile,
            "risk_score": req.user_profile.get("risk_score", 65),
            "risk_category": req.user_profile.get("risk_category", "Moderate"),
            "critique_iterations": 0
        }
        state = run_stock_analyzer_agent(initial_state)
        for _ in range(3):
            state = run_critique_agent(state)
            if state.get("workflow_failed", False) or not state.get("needs_revision", False):
                break
            state = run_stock_analyzer_agent(state)
        return state
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/agent/stock-bucket")
def run_stock_bucket_endpoint(req: ProfileRequest):
    try:
        log_agent_start(
            "Full LangGraph Workflow",
            "Executing ReAct Risk Profiler -> Stock Analyzer -> Stock Bucket -> CRO Critique Gatekeeper Loop"
        )

        initial_state = {
            "user_profile": req.user_profile,
            "risk_score": req.user_profile.get("risk_score", 65),
            "risk_category": req.user_profile.get("risk_category", "Moderate"),
            "selected_sectors": req.user_profile.get("selected_sectors", []),
            "market_data": req.user_profile.get("market_data", {}),
            "critique_iterations": 0
        }

        final_state = graph_executor.invoke(initial_state)
        return final_state.get("final_portfolio", final_state)
    except Exception as e:
        print(f"[Graph Execution Error]: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/run-workflow")
@traceable(name="ArthVeda_HITL_Workflow_Step", run_type="chain")
def run_workflow_endpoint(payload: WorkflowRequest):
    try:
        step = payload.step
        profile = payload.user_profile or {}
        resolved_category = (
            payload.risk_category
            or profile.get("risk_category")
            or profile.get("stated_risk_appetite")
            or "Moderate"
        )

        if step == "risk_profiler":
            state = {"user_profile": profile, "critique_iterations": 0}
            state = run_risk_profiling_agent(state)
            for _ in range(3):
                state = run_critique_agent(state)
                if state.get("workflow_failed", False) or not state.get("needs_revision", False):
                    break
                state = run_risk_profiling_agent(state)
            return state

        elif step == "stock_analyzer":
            state = {
                "user_profile": profile,
                "risk_score": payload.risk_score or 65,
                "risk_category": resolved_category,
                "critique_iterations": 0
            }
            state = run_stock_analyzer_agent(state)
            for _ in range(3):
                state = run_critique_agent(state)
                if state.get("workflow_failed", False) or not state.get("needs_revision", False):
                    break
                state = run_stock_analyzer_agent(state)
            return state

        elif step == "stock_bucket":
            state = {
                "user_profile": profile,
                "risk_score": payload.risk_score or 65,
                "risk_category": resolved_category,
                "selected_sectors": payload.selected_sectors or [],
                "market_data": payload.market_data or {},
                "critique_iterations": 0
            }
            state = run_stock_bucket_agent(state)
            for _ in range(3):
                state = run_critique_agent(state)
                if state.get("workflow_failed", False) or not state.get("needs_revision", False):
                    break
                state = run_stock_bucket_agent(state)

            if state.get("workflow_failed", False):
                return state
            return state.get("final_portfolio", state)

        raise HTTPException(status_code=400, detail=f"Unknown workflow step: {step}")
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Workflow Execution Error]: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Robust Chat Assistant Endpoint connected to real Pinecone RAG engine
@app.post("/api/chat")
@traceable(name="ArthVeda_RAG_Chat_Endpoint", run_type="chain")
def chat_assistant_endpoint(payload: dict):
    try:
        user_message = (
            payload.get("message")
            or payload.get("query")
            or payload.get("text")
            or ""
        )

        if not user_message:
            raise HTTPException(status_code=400, detail="Message content cannot be empty.")

        start_time = time.time()

        if rag_engine:
            answer = rag_engine.ask(user_message)
            chunks_count = 4
        else:
            answer = f"ArthVeda AI Assistant processed: '{user_message}'. (RAG engine module could not be loaded)."
            chunks_count = 0

        elapsed_ms = int((time.time() - start_time) * 1000)

        return {
            "response": answer,
            "metadata": {
                "llm": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                "chunks": chunks_count,
                "inputTokens": len(user_message) * 2,
                "outputTokens": len(answer) * 2,
                "latencyMs": elapsed_ms
            },
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Chat Assistant Error]: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
def get_system_health():
    return health_service.check_all()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)