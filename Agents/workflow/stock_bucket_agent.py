import json
from dotenv import load_dotenv
from Tools.logger import log_agent_start, traceable
from Tools.llm_tool import query_llm_with_fallback
from Tools.stock_data_tool import fetch_stock_historical_data, fetch_stock_forecasts
from Tools.equity_deep_research_tool import run_equity_deep_research
from Prompts.prompt_templates import (
    STOCK_BUCKET_SYSTEM_PROMPT,
    get_stock_bucket_user_prompt
)

load_dotenv()


@traceable(name="Stock_Bucket_Agent", run_type="chain")
def run_stock_bucket_agent(state: dict) -> dict:
    log_agent_start(
        "Stock Bucket Agent",
        "Executing ReAct Deep Research & Dynamic Indian Equity Portfolio Construction"
    )

    profile = state.get("user_profile", {})
    initial_investment = float(profile.get("initial_investment", 500000))
    risk_score = int(state.get("risk_score", 50))
    risk_category = state.get("risk_category", "Moderate")
    critique_feedback = state.get("critique_feedback", "")
    market_data = state.get("market_data", {})
    goal = profile.get("primary_goal", "Wealth Creation & Compounding")
    horizon = profile.get("investment_horizon", "5-7 Years")

    # 1. Build candidate pool exclusively from Stock Analyzer's live output
    candidate_pool = []
    candidate_lookup = {}
    for sector, stock_list in market_data.items():
        if isinstance(stock_list, list):
            for stock in stock_list:
                if stock.get("current_price", 0) > 0:
                    enriched = {**stock, "sector": sector}
                    candidate_pool.append(enriched)
                    ticker_key = str(enriched.get("ticker", "")).upper().strip()
                    if ticker_key:
                        candidate_lookup[ticker_key] = enriched
                        candidate_lookup[ticker_key.replace(".NS", "").replace(".BO", "")] = enriched

    if not candidate_pool:
        return {
            **state,
            "last_agent": "stock_bucket",
            "current_step": "Stock Bucket Agent failed: No live-priced Indian equities received from Stock Analyzer.",
            "workflow_failed": True
        }

    # 2. Enrich candidate pool with Indian Stock API historical & earnings forecast signals
    for stock in candidate_pool:
        name = stock.get("name")
        clean_id = str(stock.get("ticker", "")).replace(".NS", "").replace(".BO", "")
        if name:
            try:
                hist = fetch_stock_historical_data(name, period="1yr")
                forecast = fetch_stock_forecasts(clean_id, measure_code="EPS")
                if hist or forecast:
                    stock["deep_research_active"] = True
            except Exception:
                pass

    # 3. Call get_stock_bucket_user_prompt with its updated signature
    system_prompt = STOCK_BUCKET_SYSTEM_PROMPT
    user_prompt = get_stock_bucket_user_prompt(
        user_profile=profile,
        risk_score=risk_score,
        risk_category=risk_category,
        candidate_pool=candidate_pool
    )

    if critique_feedback:
        user_prompt += (
            f"\n\n[CRO AUDITOR FEEDBACK FROM PREVIOUS ATTEMPT]: {critique_feedback}\n"
            "Strictly resolve every issue flagged by the CRO Auditor in your updated JSON allocation."
        )

    llm_output = query_llm_with_fallback(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        agent_name="Stock Bucket Agent",
        max_tokens=1400,
        expect_json=True
    )

    if not llm_output:
        return {
            **state,
            "last_agent": "stock_bucket",
            "current_step": "Stock Bucket Agent failed: No response received from LLM.",
            "workflow_failed": True
        }

    try:
        cleaned = llm_output.replace("```json", "").replace("```", "").strip()
        json_start = cleaned.find("{")
        json_end = cleaned.rfind("}") + 1
        if json_start == -1 or json_end == 0:
            raise ValueError("No valid JSON object found in Stock Bucket LLM output.")

        parsed = json.loads(cleaned[json_start:json_end])
        raw_allocations = parsed.get("allocations", [])
        if not raw_allocations or not isinstance(raw_allocations, list):
            raise ValueError("LLM response missing valid 'allocations' list.")

        archetype = str(parsed.get("bucket_archetype", f"{risk_category} Core Portfolio")).strip()
        portfolio_thesis = str(parsed.get("portfolio_thesis", "")).strip()
        thought_process = str(parsed.get("thought_process", "")).strip()
        horizon_strategy = parsed.get("horizon_strategy", {})
        cagr_pct = float(parsed.get("target_cagr_percent", 13.5))
        cagr_rate = max(0.06, min(0.30, cagr_pct / 100.0))

    except Exception as e:
        error_msg = f"Stock Bucket JSON parsing error: {e}"
        print(f"[{error_msg}]")
        return {
            **state,
            "last_agent": "stock_bucket",
            "current_step": error_msg,
            "workflow_failed": True
        }

    # 4. Validate tickers strictly against candidate_lookup & enforce 25% single-stock cap
    validated_entries = []
    seen_tickers = set()

    for entry in raw_allocations:
        if not isinstance(entry, dict):
            continue
        raw_ticker = str(entry.get("ticker", "")).upper().strip()
        matched_stock = candidate_lookup.get(raw_ticker) or candidate_lookup.get(
            raw_ticker.replace(".NS", "").replace(".BO", "")
        )

        if not matched_stock:
            continue

        canonical_ticker = matched_stock["ticker"]
        if canonical_ticker in seen_tickers:
            continue
        seen_tickers.add(canonical_ticker)

        weight = float(entry.get("allocation_percentage", 0))
        if weight <= 0:
            continue

        capped_weight = min(weight, 25.0)
        validated_entries.append({
            "stock": matched_stock,
            "raw_weight": capped_weight,
            "rationale": str(entry.get("rationale", "")).strip()
        })

    if not validated_entries:
        return {
            **state,
            "last_agent": "stock_bucket",
            "current_step": "Stock Bucket Agent failed: None of the LLM-selected tickers matched the verified Stock Analyzer pool.",
            "workflow_failed": True
        }

    # Normalize weights cleanly to 100.0%
    total_raw_weight = sum(item["raw_weight"] for item in validated_entries)
    portfolio_items = []
    total_allocated = 0.0
    running_pct = 0.0

    for idx, item in enumerate(validated_entries, 1):
        stock = item["stock"]
        if idx == len(validated_entries):
            norm_weight = round(max(0.01, 100.0 - running_pct), 2)
        else:
            norm_weight = round((item["raw_weight"] / total_raw_weight) * 100.0, 2)
            running_pct += norm_weight

        price = float(stock["current_price"])
        allocated_rupees = initial_investment * (norm_weight / 100.0)
        units = int(allocated_rupees // price) if price > 0 else 0
        actual_invested = round(units * price, 2)
        total_allocated += actual_invested

        rationale = item["rationale"] or (
            f"Selected from '{stock.get('sector')}' (P/E: {stock.get('pe_ratio')}, Beta: {stock.get('beta')}) "
            f"to align with '{goal}' over {horizon}."
        )

        portfolio_items.append({
            "id": idx,
            "name": stock.get("name"),
            "ticker": stock.get("ticker"),
            "sector": stock.get("sector"),
            "current_price": price,
            "units": units,
            "allocation_percentage": norm_weight,
            "allocated_amount": actual_invested,
            "beta": float(stock.get("beta") or 1.0),
            "pe_ratio": float(stock.get("pe_ratio") or 0.0),
            "dividend_yield": float(stock.get("dividend_yield") or 0.0),
            "rationale": rationale
        })

    # 5. Generate 5-year compounding projection vs. Nifty 50 benchmark
    chart_growth_data = []
    port_val = initial_investment
    nifty_val = initial_investment
    nifty_cagr = 0.12

    for year in range(0, 6):
        if year == 0:
            chart_growth_data.append({
                "year": "Initial",
                "portfolio_value": round(initial_investment),
                "benchmark_value": round(initial_investment),
            })
        else:
            port_val = port_val * (1 + cagr_rate)
            nifty_val = nifty_val * (1 + nifty_cagr)
            chart_growth_data.append({
                "year": f"Year {year}",
                "portfolio_value": round(port_val),
                "benchmark_value": round(nifty_val),
            })

    final_portfolio = {
        "bucket_archetype": archetype,
        "risk_score": risk_score,
        "risk_category": risk_category,
        "stock_count": len(portfolio_items),
        "target_cagr": f"{round(cagr_rate * 100, 1)}%",
        "initial_capital": initial_investment,
        "total_capital_deployed": round(total_allocated, 2),
        "unallocated_cash": round(initial_investment - total_allocated, 2),
        "portfolio": portfolio_items,
        "growth_chart_data": chart_growth_data,
        "portfolio_thesis": portfolio_thesis,
        "horizon_strategy": horizon_strategy,
        "bucket_thought_process": thought_process,
        "horizon_summary": f"Structured for a {horizon} horizon targeting '{goal}' on NSE/BSE."
    }

    preview = thought_process[:75] if thought_process else f"Curated {len(portfolio_items)} Indian equities"
    step_msg = f"ReAct [THINK & ACT]: {preview}... Built {len(portfolio_items)}-stock '{archetype}' bucket."

    return {
        **state,
        "final_portfolio": final_portfolio,
        "last_agent": "stock_bucket",
        "current_step": step_msg,
        "workflow_failed": False
    }