import os
import sys

# Ensure the root directory is explicitly appended to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Import graph_executor from the Agents folder where supervisor.py is located
try:
    from Agents.supervisor import graph_executor
except ImportError:
    from supervisor import graph_executor

# Import individual agent modules for step-by-step critique gating
from Agents.risk_agent import run_risk_profiling_agent
from Agents.stock_analyzer_agent import run_stock_analyzer_agent
from Agents.stock_bucket_agent import run_stock_bucket_agent
from Agents.critique_agent import run_critique_agent

# Import your real RAG engine service from the RAG folder
try:
    from RAG.rag_engine import rag_engine
except ImportError as e:
    print(f"[ERROR importing rag_engine from RAG folder]: {e}")
    rag_engine = None

from Tools.logger import log_agent_start

load_dotenv()

# Initialize FastAPI application
app = FastAPI(title="ArthVeda AI Wealth Management API", version="2.0.0")

# Configure CORS middleware
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
    selected_sectors: Optional[list] = None
    market_data: Optional[Dict[str, Any]] = None

@app.get("/")
def read_root():
    return {"status": "online", "platform": "ArthVeda AI Multiagentic Wealth Management Suite"}

@app.post("/api/agent/risk-profiler")
def run_risk_profiler_endpoint(req: ProfileRequest):
    try:
        initial_state = {"user_profile": req.user_profile, "critique_iterations": 0}
        state = run_risk_profiling_agent(initial_state)
        # Apply CRO Critique audit gate
        for _ in range(2):
            state = run_critique_agent(state)
            if not state.get("needs_revision", False):
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
        # Apply CRO Critique audit gate
        for _ in range(2):
            state = run_critique_agent(state)
            if not state.get("needs_revision", False):
                break
            state = run_stock_analyzer_agent(state)
        return state
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agent/stock-bucket")
def run_stock_bucket_endpoint(req: ProfileRequest):
    try:
        log_agent_start("Full LangGraph Workflow", "Executing ReAct Risk Profiler -> Stock Analyzer -> Stock Bucket -> CRO Critique Gatekeeper Loop")
        
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

# Unified /api/run-workflow endpoint with step-by-step CRO Critique gating and auto-correction
@app.post("/api/run-workflow")
def run_workflow_endpoint(payload: WorkflowRequest):
    try:
        step = payload.step
        profile = payload.user_profile or {}
        
        if step == "risk_profiler":
            state = {"user_profile": profile, "critique_iterations": 0}
            state = run_risk_profiling_agent(state)
            for _ in range(3):
                state = run_critique_agent(state)
                if state.get("workflow_failed", False):
                    break
                if not state.get("needs_revision", False):
                    break
                state = run_risk_profiling_agent(state)
            return state
            
        elif step == "stock_analyzer":
            state = {
                "user_profile": profile,
                "risk_score": payload.risk_score or 65,
                "risk_category": profile.get("stated_risk_appetite", "Moderate"),
                "critique_iterations": 0
            }
            state = run_stock_analyzer_agent(state)
            for _ in range(3):
                state = run_critique_agent(state)
                if state.get("workflow_failed", False):
                    break
                if not state.get("needs_revision", False):
                    break
                state = run_stock_analyzer_agent(state)
            return state
            
        elif step == "stock_bucket":
            initial_state = {
                "user_profile": profile,
                "risk_score": payload.risk_score or 65,
                "risk_category": profile.get("stated_risk_appetite", "Moderate"),
                "selected_sectors": payload.selected_sectors or [],
                "market_data": payload.market_data or {},
                "critique_iterations": 0
            }
            final_state = graph_executor.invoke(initial_state)
            return final_state.get("final_portfolio", final_state)
            
        raise HTTPException(status_code=400, detail=f"Unknown workflow step: {step}")
    except Exception as e:
        print(f"[Workflow Execution Error]: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
# Robust Chat Assistant Endpoint connected to real Pinecone RAG engine
@app.post("/api/chat")
def chat_assistant_endpoint(payload: dict):
    try:
        user_message = (
            payload.get("message") or 
            payload.get("query") or 
            payload.get("text") or 
            ""
        )
        
        if not user_message:
            raise HTTPException(status_code=400, detail="Message content cannot be empty.")

        import time
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
                "llm": "gpt-4o-mini",
                "chunks": chunks_count,
                "inputTokens": len(user_message) * 2,
                "outputTokens": len(answer) * 2,
                "latencyMs": elapsed_ms
            },
            "status": "success"
        }
    except Exception as e:
        print(f"[Chat Assistant Error]: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)