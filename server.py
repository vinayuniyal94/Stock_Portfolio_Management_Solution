from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

from RAG.rag_engine import rag_service
from Agents.risk_agent import run_risk_profiling_agent
from Agents.stock_analyzer_agent import run_stock_analyzer_agent
from Agents.stock_bucket_agent import run_stock_bucket_agent

app = FastAPI(title="NiveshGuru Multi-Agent Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Flexible schema that accepts null/None and optional parameters safely
class StepStateRequest(BaseModel):
    user_profile: Dict[str, Any]
    risk_score: Optional[int] = 0
    risk_category: Optional[str] = ""
    risk_analysis: Optional[str] = ""
    selected_sectors: Optional[List[str]] = []
    market_data: Optional[Dict[str, Any]] = {}
    final_portfolio: Optional[Dict[str, Any]] = None

    class Config:
        extra = "allow"  # Prevents 422 on extra front-end attributes

class ChatQueryRequest(BaseModel):
    query: str

@app.post("/api/chat")
async def chat_rag(request: ChatQueryRequest):
    try:
        reply = rag_service.ask(request.query)
        return {"response": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Human Step 1: Risk Profiling Agent
@app.post("/api/agent/risk-profiler")
async def step_risk_agent(payload: StepStateRequest):
    try:
        # Convert Pydantic object to dictionary
        state = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
        updated_state = run_risk_profiling_agent(state)
        return updated_state
    except Exception as e:
        print(f"[ERROR in /api/agent/risk-profiler]: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Human Step 2: Stock Analyzer Agent (yfinance)
@app.post("/api/agent/stock-analyzer")
async def step_analyzer_agent(payload: StepStateRequest):
    try:
        state = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
        updated_state = run_stock_analyzer_agent(state)
        return updated_state
    except Exception as e:
        print(f"[ERROR in /api/agent/stock-analyzer]: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Human Step 3: Stock Bucket Agent
@app.post("/api/agent/stock-bucket")
async def step_bucket_agent(payload: StepStateRequest):
    try:
        state = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
        updated_state = run_stock_bucket_agent(state)
        return updated_state
    except Exception as e:
        print(f"[ERROR in /api/agent/stock-bucket]: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)