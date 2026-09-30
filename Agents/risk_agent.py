import os
import time
from dotenv import load_dotenv
from Tools.logger import log_agent_start
from Tools.llm_tool import query_llm_with_fallback
from Prompts.prompt_templates import (
    RISK_PROFILER_SYSTEM_PROMPT,
    get_risk_profiler_user_prompt
)

load_dotenv()

def calculate_quantitative_risk_score(profile: dict) -> tuple[int, str]:
    # (Existing scoring calculation logic remains intact)
    age = profile.get("age", 35)
    income_slab = profile.get("income_slab", "₹15L - ₹25L")
    stability = profile.get("employment_stability", "High")
    horizon = profile.get("investment_horizon", "5-7 Years")
    cagr = profile.get("cagr_expectation", "14-16%")

    score = 50
    if age < 30: score += 18
    elif age <= 45: score += 12
    elif age <= 60: score += 4
    else: score -= 10

    if stability == "High": score += 10
    elif stability == "Low": score -= 10

    if "25L" in income_slab: score += 12
    elif "15L" in income_slab: score += 8

    if "7+" in horizon: score += 14
    elif "5-7" in horizon: score += 10
    elif "1-3" in horizon: score -= 12

    if "18" in cagr: score += 10
    elif "10" in cagr: score -= 8

    final_score = max(10, min(95, score))
    category = "Aggressive" if final_score >= 75 else "Moderate" if final_score >= 50 else "Conservative"
    return final_score, category

def run_risk_profiling_agent(state: dict) -> dict:
    profile = state.get("user_profile", {})
    name = profile.get("investor_name", "Investor")
    log_agent_start("Risk Profiler Agent", f"Process profile for {name}")

    score, category = calculate_quantitative_risk_score(profile)

    # Use centralized prompt templates
    system_prompt = RISK_PROFILER_SYSTEM_PROMPT
    user_prompt = get_risk_profiler_user_prompt(profile, score, category)

    reasoning = query_llm_with_fallback(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        agent_name="Risk Profiler Agent",
        max_tokens=200
    )

    if not reasoning:
        reasoning = (
            f"Based on investor age of {profile.get('age')} and a {profile.get('investment_horizon')} horizon, "
            f"the portfolio mandate is calibrated to {category} equity allocations with an institutional score of {score}/100."
        )

    return {
        **state,
        "risk_score": score,
        "risk_category": category,
        "risk_analysis": reasoning,
        "current_step": "Risk profiling completed"
    }