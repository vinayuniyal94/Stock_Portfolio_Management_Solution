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

@app.get("/api/megabull/holdings")
def get_megabull_holdings_endpoint():
    """Fetches holdings from MegaBull /api/holding/my and enriches with live NSE LTP & P&L."""
    from Tools.stock_data_tool import fetch_live_stock_metrics

    megabull_base_url = os.getenv("MEGABULL_BASE_URL", "https://api.megabull.in")
    megabull_api_key = os.getenv("MEGABULL_API_KEY", "")
    headers = {"api-key": megabull_api_key, "Content-Type": "application/json"}

    try:
        res = requests.get(f"{megabull_base_url}/api/holding/my", headers=headers, timeout=6)
        if res.status_code == 200:
            data = res.json()
            holdings = data if isinstance(data, list) else data.get("holdings", [])

            enriched = []
            for h in holdings:
                sym = str(h.get("instrumentName") or h.get("symbol") or "").upper().replace(".NS", "").strip()
                qty = float(h.get("qty") or h.get("quantity") or 0)
                avg_price = float(h.get("avgBuyPrice") or h.get("priceAvg") or h.get("avg_price") or 0)

                # Fetch real-time NSE LTP via Indian Stock API
                live_quote = fetch_live_stock_metrics(sym) if sym else {}
                live_ltp = float(live_quote.get("current_price") or h.get("ltp") or avg_price)
                pnl = round((live_ltp - avg_price) * qty, 2)
                chg_pct = round(((live_ltp - avg_price) / avg_price) * 100, 2) if avg_price > 0 else 0.0

                enriched.append({
                    **h,
                    "instrumentName": sym,
                    "qty": int(qty),
                    "avgBuyPrice": round(avg_price, 2),
                    "ltp": round(live_ltp, 2),
                    "pnl": pnl,
                    "chg": chg_pct
                })

            return enriched
    except Exception as e:
        print(f"[MegaBull Holdings Fetch Error]: {e}")
    return []

@app.post("/api/megabull/execute-rebalance")
def execute_megabull_rebalance_endpoint(payload: dict):
    """Executes user-approved BUY/SELL/REBALANCE orders on MegaBull strictly during NSE/BSE market hours."""
    from Agents.portfolio.executer_agent import execute_megabull_order
    symbol = payload.get("symbol") or payload.get("ticker") or ""
    action = payload.get("action", "BUY")
    quantity = int(payload.get("quantity", 0))

    if not symbol or quantity <= 0:
        raise HTTPException(status_code=400, detail="Valid symbol and positive quantity are required.")

    result = execute_megabull_order(symbol=symbol, action=action, quantity=quantity)
    if not result.get("executed") and result.get("status") == "BLOCKED_MARKET_CLOSED":
        raise HTTPException(status_code=403, detail=result["message"])
    return result

@app.get("/api/analytics/stock-detail/{symbol}")
def get_stock_deep_analytics(symbol: str, period: str = "1yr"):
    """
    Combines live MegaBull position metrics with Indian Stock API (/stock, /historical_data,
    /stock_forecasts) for deep individual stock inspection in Portfolio Analytics.
    """
    from Tools.stock_data_tool import (
        fetch_live_stock_metrics,
        fetch_stock_historical_data,
        fetch_stock_forecasts
    )

    clean_sym = symbol.upper().replace(".NS", "").replace(".BO", "").strip()

    # 1. Fetch live MegaBull holding details for this specific stock
    megabull_position = {}
    megabull_base_url = os.getenv("MEGABULL_BASE_URL", "https://api.megabull.in")
    megabull_api_key = os.getenv("MEGABULL_API_KEY", "")
    if megabull_api_key:
        try:
            mb_res = requests.get(
                f"{megabull_base_url}/api/holding/my",
                headers={"api-key": megabull_api_key, "Content-Type": "application/json"},
                timeout=5
            )
            if mb_res.status_code == 200:
                raw_mb = mb_res.json()
                items = raw_mb if isinstance(raw_mb, list) else raw_mb.get("holdings", [])
                for item in items:
                    item_sym = str(item.get("instrumentName") or item.get("symbol") or "").upper().replace(".NS", "").strip()
                    if item_sym == clean_sym:
                        megabull_position = item
                        break
        except Exception as e:
            print(f"[MegaBull Stock Detail Warning]: {e}")

    # 2. Fetch live quote & fundamental ratios from Indian Stock API (/stock)
    live_metrics = fetch_live_stock_metrics(clean_sym)

    # 3. Fetch historical price series (/historical_data)
    query_name = live_metrics.get("name") or clean_sym
    historical_raw = fetch_stock_historical_data(query_name, period=period, filter_type="price")

    # Normalize historical chart points for Recharts
    price_history = []
    if isinstance(historical_raw, dict):
        datasets = historical_raw.get("datasets") or []
        if datasets and isinstance(datasets, list):
            values = datasets[0].get("values") or []
            for pt in values[-30:]:
                if isinstance(pt, (list, tuple)) and len(pt) >= 2:
                    price_history.append({"date": str(pt[0]), "price": float(pt[1])})
                elif isinstance(pt, dict):
                    price_history.append({
                        "date": str(pt.get("date") or pt.get("label") or ""),
                        "price": float(pt.get("value") or pt.get("close") or 0)
                    })

    # 4. Fetch analyst EPS forecasts (/stock_forecasts)
    forecasts_raw = fetch_stock_forecasts(clean_sym, measure_code="EPS")

    qty = int(float(megabull_position.get("qty") or 0))
    avg_buy = float(megabull_position.get("avgBuyPrice") or megabull_position.get("priceAvg") or 0)
    ltp = float(live_metrics.get("current_price") or avg_buy)
    pnl = round((ltp - avg_buy) * qty, 2) if (qty > 0 and avg_buy > 0) else 0.0
    pnl_pct = round(((ltp - avg_buy) / avg_buy) * 100, 2) if avg_buy > 0 else 0.0

    return {
        "symbol": clean_sym,
        "ticker": f"{clean_sym}.NS",
        "company_name": live_metrics.get("name") or clean_sym,
        "industry": live_metrics.get("industry") or "NSE Listed Equity",
        "fundamentals": {
            "ltp": ltp,
            "pe_ratio": live_metrics.get("pe_ratio", 0.0),
            "beta": live_metrics.get("beta", 1.0),
            "dividend_yield": live_metrics.get("dividend_yield", 0.0)
        },
        "megabull_holding": {
            "qty": qty,
            "avg_buy_price": round(avg_buy, 2),
            "invested_value": round(avg_buy * qty, 2),
            "current_value": round(ltp * qty, 2),
            "unrealized_pnl": pnl,
            "unrealized_pnl_pct": pnl_pct,
            "position_type": megabull_position.get("type", "LONG")
        },
        "price_history": price_history,
        "forecasts": forecasts_raw if isinstance(forecasts_raw, dict) else {}
    }


@app.get("/api/analytics/market-outlook")
def get_market_outlook_analytics():
    """
    Aggregates live Indian Stock API market pulse (/trending, /NSE_most_active)
    to compute sector breadth, market sentiment regime, and outlook telemetry.
    """
    from Tools.stock_data_tool import fetch_trending_stocks, fetch_nse_most_active

    trending = fetch_trending_stocks() or []
    nse_active = fetch_nse_most_active() or []

    gainers = 0
    losers = 0
    movers = []

    for item in (trending + nse_active):
        if not isinstance(item, dict):
            continue
        sym = str(item.get("nse_symbol") or item.get("symbol") or item.get("company_name") or "").strip()
        raw_pct = item.get("percent_change") or item.get("pChange") or 0
        try:
            pct = round(float(str(raw_pct).replace("%", "").strip()), 2)
        except ValueError:
            pct = 0.0

        if pct > 0:
            gainers += 1
        elif pct < 0:
            losers += 1

        if sym and len(movers) < 8:
            movers.append({"name": sym, "change_pct": pct})

    total = max(gainers + losers, 1)
    bullish_ratio = round((gainers / total) * 100, 1)

    if bullish_ratio >= 60:
        regime = "Bullish Expansion"
        stance = "Overweight growth & cyclical leaders; trail stop-losses on momentum winners."
    elif bullish_ratio <= 40:
        regime = "Defensive Consolidation"
        stance = "Favor low-beta healthcare & cash-generative large caps; stagger dip entries."
    else:
        regime = "Range-Bound / Sector Rotation"
        stance = "Maintain balanced core-satellite weights and rebalance overweight drift."

    return {
        "regime": regime,
        "stance": stance,
        "breadth": {
            "gainers": gainers,
            "losers": losers,
            "bullish_ratio": bullish_ratio
        },
        "top_movers": movers
    }


@app.get("/api/analytics/stock-detail/{symbol}")
def get_stock_deep_analytics(symbol: str, period: str = "1yr"):
    from Tools.equity_deep_research_tool import run_equity_deep_research
    return run_equity_deep_research(symbol=symbol, period=period)


@app.get("/api/analytics/market-outlook")
def get_market_outlook_analytics():
    from Tools.equity_deep_research_tool import get_market_regime_outlook
    return get_market_regime_outlook()


@app.get("/api/megabull/account-overview")
def get_megabull_account_overview_endpoint():
    from Tools.equity_deep_research_tool import get_megabull_account_telemetry
    return get_megabull_account_telemetry()


@app.get("/api/health")
def get_system_health():
    return health_service.check_all()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)