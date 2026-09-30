import os
import sys
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uvicorn
from supabase import create_client, Client

# Supabase Initialization
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ivlrzhllmdhrffbaekfl.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_nbxw94AF7wQCz8uigXQaSQ_PlfKwvDn")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

from RAG.rag_engine import rag_service
from Agents.risk_agent import run_risk_profiling_agent
from Agents.stock_analyzer_agent import run_stock_analyzer_agent
from Agents.stock_bucket_agent import run_stock_bucket_agent

app = FastAPI(title="ArthVeda AI Multi-Agent Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StepStateRequest(BaseModel):
    user_profile: Dict[str, Any]
    risk_score: Optional[int] = 0
    risk_category: Optional[str] = ""
    risk_analysis: Optional[str] = ""
    selected_sectors: Optional[List[str]] = []
    market_data: Optional[Dict[str, Any]] = {}
    final_portfolio: Optional[Dict[str, Any]] = None

    class Config:
        extra = "allow"

class ChatQueryRequest(BaseModel):
    query: str

class UserAuthRequest(BaseModel):
    email: str
    password: str
    username: Optional[str] = None

class SavePortfolioRequest(BaseModel):
    user_id: str
    portfolio_name: Optional[str] = "Core Wealth Bucket"
    initial_investment: float
    risk_score: int
    risk_category: str
    bucket_archetype: str
    portfolio_json: Dict[str, Any]

@app.get("/")
def health_check():
    return {"status": "online", "service": "ArthVeda AI Multi-Agent Platform"}

# --- SUPABASE AUTH & PORTFOLIO ENDPOINTS ---

@app.post("/api/auth/register")
async def register_user(payload: UserAuthRequest):
    try:
        # Fallback username generation if not provided
        uname = payload.username or payload.email.split("@")[0]

        existing = supabase.table("users").select("*").eq("email", payload.email).execute()
        if existing.data and len(existing.data) > 0:
            raise HTTPException(status_code=400, detail="An account with this email already exists.")

        res = supabase.table("users").insert({
            "username": uname,
            "email": payload.email,
            "password_hash": payload.password
        }).execute()

        if res.data:
            return {"status": "success", "user": res.data[0]}
        raise HTTPException(status_code=400, detail="Registration failed.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login")
async def login_user(payload: UserAuthRequest):
    try:
        res = supabase.table("users").select("*").eq("email", payload.email).eq("password_hash", payload.password).execute()
        if res.data and len(res.data) > 0:
            user = res.data[0]
            portfolios = supabase.table("user_portfolios").select("*").eq("user_id", user["id"]).execute()
            return {"status": "success", "user": user, "portfolios": portfolios.data}
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/portfolio/save")
async def save_user_portfolio(payload: SavePortfolioRequest):
    try:
        res = supabase.table("user_portfolios").insert({
            "user_id": payload.user_id,
            "portfolio_name": payload.portfolio_name,
            "initial_investment": payload.initial_investment,
            "risk_score": payload.risk_score,
            "risk_category": payload.risk_category,
            "bucket_archetype": payload.bucket_archetype,
            "portfolio_json": payload.portfolio_json
        }).execute()
        return {"status": "success", "saved": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/portfolio/{user_id}")
async def get_user_portfolios(user_id: str):
    try:
        res = supabase.table("user_portfolios").select("*").eq("user_id", user_id).execute()
        
        # If no portfolio exists yet for this user, seed a default professional portfolio
        if not res.data:
            default_portfolio = {
                "user_id": user_id,
                "portfolio_name": "Core Wealth Compounding Bucket",
                "initial_investment": 500000,
                "risk_score": 72,
                "risk_category": "Aggressive Alpha Growth",
                "bucket_archetype": "High-Conviction Equity Growth",
                "portfolio_json": {
                    "portfolio": [
                        {"id": 1, "name": "Sun Pharmaceutical Ind L", "ticker": "SUNPHARMA.NS", "sector": "Healthcare & Diagnostics", "current_price": 1838.3, "units": 30, "allocated_amount": 55149, "allocation_percentage": 11.1, "beta": 0.12},
                        {"id": 2, "name": "Torrent Pharmaceuticals L", "ticker": "TORNTPHARM.NS", "sector": "Healthcare & Diagnostics", "current_price": 4828, "units": 11, "allocated_amount": 53108, "allocation_percentage": 11.1, "beta": 0.14},
                        {"id": 3, "name": "Reliance Industries Ltd", "ticker": "RELIANCE.NS", "sector": "Green Energy & EV", "current_price": 1194.1, "units": 46, "allocated_amount": 54928.6, "allocation_percentage": 11.1, "beta": 0.15},
                        {"id": 4, "name": "Divis Laboratories Ltd", "ticker": "DIVISLAB.NS", "sector": "Healthcare & Diagnostics", "current_price": 9350.5, "units": 5, "allocated_amount": 46752.5, "allocation_percentage": 11.1, "beta": 0.24},
                        {"id": 5, "name": "Indian Oil Corp Ltd", "ticker": "IOC.NS", "sector": "Green Energy & EV", "current_price": 134.89, "units": 411, "allocated_amount": 55439.79, "allocation_percentage": 11.1, "beta": 0.77},
                        {"id": 6, "name": "Adani Enterprises Limited", "ticker": "ADANIENT.NS", "sector": "Green Energy & EV", "current_price": 2916.3, "units": 19, "allocated_amount": 55409.7, "allocation_percentage": 11.1, "beta": 0.8}
                    ]
                }
            }
            insert_res = supabase.table("user_portfolios").insert(default_portfolio).execute()
            return {"portfolios": insert_res.data}

        return {"portfolios": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- AGENT & CHAT ENDPOINTS ---

@app.post("/api/chat")
async def chat_rag(request: ChatQueryRequest):
    try:
        reply = rag_service.ask(request.query)
        return {"response": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agent/risk-profiler")
async def step_risk_agent(payload: StepStateRequest):
    try:
        state = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
        return run_risk_profiling_agent(state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agent/stock-analyzer")
async def step_analyzer_agent(payload: StepStateRequest):
    try:
        state = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
        return run_stock_analyzer_agent(state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agent/stock-bucket")
def step_bucket_agent(payload: StepStateRequest):
    try:
        state = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
        return run_stock_bucket_agent(state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)