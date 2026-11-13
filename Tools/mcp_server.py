import sys
import json
from mcp.server.fastmcp import FastMCP
from dotenv import load_dotenv

load_dotenv()

# Initialize the ArthVeda AI MCP Server
mcp = FastMCP("ArthVeda-AI-Portfolio-MCP-Server")

# Current codebase modules (Agents/workflow, Agents/portfolio, Tools, RAG)
from Tools.stock_data_tool import (
    fetch_live_stock_metrics,
    fetch_trending_stocks,
    fetch_nse_most_active
)
from Agents.workflow.risk_agent import run_risk_profiling_agent
from Agents.workflow.stock_analyzer_agent import run_stock_analyzer_agent
from Agents.workflow.stock_bucket_agent import run_stock_bucket_agent
from Agents.portfolio.portfolio_supervisor import run_portfolio_surveillance_graph
from RAG.rag_engine import rag_service


@mcp.tool()
def search_stock_education(query: str) -> str:
    """
    Search SEBI regulations, Indian equity guidelines, and equity metric definitions
    from the Pinecone knowledge base and synthesize an educational response.
    """
    sys.stderr.write(f"[MCP Tool: search_stock_education] Query: {query}\n")
    return rag_service.ask(query)


@mcp.tool()
def get_live_stock_fundamentals(ticker: str) -> str:
    """
    Fetch live market metrics for Indian equities (NSE/BSE) via Indian Stock API
    including LTP, P/E ratio, Beta volatility, and Dividend Yield.
    Ticker format example: 'TCS.NS', 'HDFCBANK.NS', 'RELIANCE.NS'.
    """
    sys.stderr.write(f"[MCP Tool: get_live_stock_fundamentals] Ticker: {ticker}\n")
    metrics = fetch_live_stock_metrics(ticker)
    if not metrics:
        return json.dumps({"error": f"Unable to fetch live metrics for {ticker} from Indian Stock API."})
    return json.dumps(metrics, indent=2)


@mcp.tool()
def get_indian_market_pulse() -> str:
    """
    Fetch real-time trending stocks and NSE most-active equities from Indian Stock API.
    """
    sys.stderr.write("[MCP Tool: get_indian_market_pulse] Fetching trending & NSE most active stocks\n")
    return json.dumps({
        "trending": fetch_trending_stocks()[:10],
        "nse_most_active": fetch_nse_most_active()[:10]
    }, indent=2)


@mcp.tool()
def screen_nse_sectors_and_stocks(risk_score: int, horizon: str = "5-7 Years", goal: str = "Wealth Creation") -> str:
    """
    Dynamically select Indian macroeconomic sectors based on an investor's risk score (1-100),
    providing macroeconomic rationales and screening live candidate NSE stocks per sector.
    """
    sys.stderr.write(f"[MCP Tool: screen_nse_sectors_and_stocks] Score: {risk_score}, Horizon: {horizon}\n")
    state = {
        "risk_score": risk_score,
        "risk_category": "Aggressive" if risk_score >= 75 else "Moderate" if risk_score >= 45 else "Conservative",
        "user_profile": {
            "investment_horizon": horizon,
            "primary_goal": goal
        }
    }
    result = run_stock_analyzer_agent(state)
    return json.dumps({
        "selected_sectors": result.get("selected_sectors", []),
        "sector_rationales": result.get("sector_rationales", {}),
        "market_data": result.get("market_data", {}),
        "workflow_failed": result.get("workflow_failed", False)
    }, indent=2)


@mcp.tool()
def generate_asset_allocation(
    investor_name: str,
    age: int,
    initial_investment_inr: float,
    horizon: str = "5-7 Years",
    employment_stability: str = "High",
    income_slab: str = "₹15L - ₹25L",
    primary_goal: str = "Wealth Creation",
    cagr_expectation: str = "14-16%"
) -> str:
    """
    Executes the full ArthVeda AI advisory pipeline: runs behavioral Risk Profiler,
    dynamically discovers Indian sectors & live NSE stocks via Stock Analyzer, and
    constructs a risk-calibrated equity portfolio bucket with exact share allocations.
    """
    sys.stderr.write(f"[MCP Tool: generate_asset_allocation] Investor: {investor_name}, Capital: ₹{initial_investment_inr}\n")

    state = {
        "user_profile": {
            "investor_name": investor_name,
            "age": age,
            "initial_investment": initial_investment_inr,
            "investment_horizon": horizon,
            "employment_stability": employment_stability,
            "income_slab": income_slab,
            "primary_goal": primary_goal,
            "cagr_expectation": cagr_expectation
        }
    }

    # Execute full 3-agent advisory pipeline
    state = run_risk_profiling_agent(state)
    if state.get("workflow_failed"):
        return json.dumps({"error": state.get("current_step", "Risk profiling failed.")})

    state = run_stock_analyzer_agent(state)
    if state.get("workflow_failed"):
        return json.dumps({"error": state.get("current_step", "Stock analysis failed.")})

    state = run_stock_bucket_agent(state)
    if state.get("workflow_failed"):
        return json.dumps({"error": state.get("current_step", "Stock bucket generation failed.")})

    return json.dumps({
        "risk_score": state.get("risk_score"),
        "risk_category": state.get("risk_category"),
        "risk_analysis": state.get("risk_analysis"),
        "selected_sectors": state.get("selected_sectors"),
        "final_portfolio": state.get("final_portfolio")
    }, indent=2)


@mcp.tool()
def run_portfolio_surveillance(portfolio_stocks_json: str, risk_score: int = 65, risk_category: str = "Moderate") -> str:
    """
    Runs the 4-agent Saved Portfolio Surveillance LangGraph (Observer -> Planner -> Executer -> Notifier)
    on a JSON array of saved holdings.
    """
    sys.stderr.write("[MCP Tool: run_portfolio_surveillance] Executing surveillance graph\n")
    try:
        stocks = json.loads(portfolio_stocks_json)
    except Exception as e:
        return json.dumps({"error": f"Invalid portfolio_stocks_json: {e}"})

    result = run_portfolio_surveillance_graph({
        "portfolio_stocks": stocks,
        "risk_score": risk_score,
        "risk_category": risk_category
    })
    return json.dumps(result, indent=2)


if __name__ == "__main__":
    mcp.run()