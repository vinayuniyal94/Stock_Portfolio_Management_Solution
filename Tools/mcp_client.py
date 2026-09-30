import asyncio
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def run_client_demo():
    # Configure connection to our local mcp_server.py
    server_params = StdioServerParameters(
        command=sys.executable,
        args=["mcp_server.py"],
        env=None
    )

    print("\n" + "=" * 80)
    print(" [MCP CLIENT]: Connecting to NiveshGuru MCP Server...")
    print("=" * 80)

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # 1. Initialize session
            await session.initialize()
            print(" Connected successfully.")

            # 2. Discover available tools
            tools_list = await session.list_tools()
            print(f"\n Available Exposed Tools ({len(tools_list.tools)}):")
            for t in tools_list.tools:
                print(f"   • {t.name}: {t.description.splitlines()[0]}")

            # 3. Test Tool: Live NSE Quote
            print("\n--- [Calling Tool: get_live_stock_fundamentals ('TCS.NS')] ---")
            res_stock = await session.call_tool("get_live_stock_fundamentals", {"ticker": "TCS.NS"})
            print(res_stock.content[0].text)

            # 4. Test Tool: Pinecone RAG Search
            print("\n--- [Calling Tool: search_stock_education ('What is Beta ratio?')] ---")
            res_rag = await session.call_tool("search_stock_education", {"query": "What is Beta ratio?"})
            print(res_rag.content[0].text)

            # 5. Test Tool: Full Portfolio Generation
            print("\n--- [Calling Tool: generate_asset_allocation] ---")
            res_portfolio = await session.call_tool("generate_asset_allocation", {
                "investor_name": "Third-Party Agent User",
                "age": 30,
                "initial_investment_inr": 250000,
                "risk_score": 75,
                "horizon": "5-7 Years"
            })
            print(res_portfolio.content[0].text[:400] + "\n... (truncated)")

if __name__ == "__main__":
    asyncio.run(run_client_demo())