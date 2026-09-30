import sys
import json
from mcp.server.fastmcp import FastMCP
from dotenv import load_dotenv

load_dotenv()

# Initialize the MCP Server
mcp = FastMCP("NiveshGuru-Portfolio-MCP-Server")

# Internal modules
from Tools.stock_data_tool import fetch_live_stock_metrics, fetch_dynamic_stocks_for_sector, get_dynamic_nse_sectors
from Agents.risk_agent import run_risk_profiling_agent
from Agents.stock_analyzer_agent import run_stock_analyzer_agent
from Agents.stock_bucket_agent import run_stock_bucket_agent
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
    Fetch live market metrics for Indian equities (NSE/BSE) including LTP, 
    P/E ratio, Beta volatility, Dividend Yield, and Market Cap.
    Ticker format example: 'TCS.NS', 'HDFCBANK.NS', 'RELIANCE.NS'.
    """
    sys.stderr.write(f"[MCP Tool: get_live_stock_fundamentals] Ticker: {ticker}\n")
    metrics = fetch_live_stock_metrics(ticker)
    return json.dumps(metrics, indent=2)

@mcp.tool()
def screen_nse_sectors_and_stocks(risk_score: int, horizon: str = "5-7 Years") -> str:
    """
    Dynamically select 5 macroeconomic sectors based on an investor's risk score (0-100),
    providing macroeconomic rationales and screening 5 candidate NSE stocks per sector.
    """
    sys.stderr.write(f"[MCP Tool: screen_nse_sectors_and_stocks] Score: {risk_score}, Horizon: {horizon}\n")
    mock_state = {
        "risk_score": risk_score,
        "risk_category": "Aggressive" if risk_score > 70 else "Moderate" if risk_score >= 50 else "Conservative",
        "user_profile": {"investment_horizon": horizon}
    }
    result = run_stock_analyzer_agent(mock_state)
    return json.dumps({
        "selected_sectors": result.get("selected_sectors"),
        "sector_rationales": result.get("sector_rationales"),
        "market_data": result.get("market_data")
    }, indent=2)

@mcp.tool()
def generate_asset_allocation(
    investor_name: str,
    age: int,
    initial_investment_inr: float,
    risk_score: int,
    horizon: str = "5-7 Years"
) -> str:
    """
    Executes the full pipeline: screens sectors, analyzes live fundamentals, 
    and constructs a weighted equity portfolio bucket with exact share unit allocations.
    """
    sys.stderr.write(f"[MCP Tool: generate_asset_allocation] Investor: {investor_name}, Capital: ₹{initial_investment_inr}\n")
    
    state = {
        "user_profile": {
            "investor_name": investor_name,
            "age": age,
            "initial_investment": initial_investment_inr,
            "investment_horizon": horizon,
            "employment_stability": "High",
            "income_slab": "₹15L - ₹25L",
            "primary_goal": "Wealth Creation",
            "cagr_expectation": "14-16%"
        },
        "risk_score": risk_score,
        "risk_category": "Aggressive" if risk_score > 70 else "Moderate" if risk_score >= 50 else "Conservative"
    }

    # Pipeline execution
    state = run_stock_analyzer_agent(state)
    state = run_stock_bucket_agent(state)
    return json.dumps(state.get("final_portfolio"), indent=2)

if __name__ == "__main__":
    mcp.run()