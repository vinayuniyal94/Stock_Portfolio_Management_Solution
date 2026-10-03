import json
from Tools.logger import log_agent_start
from Tools.llm_tool import query_llm_with_fallback
from Prompts.prompt_templates import (
    RISK_AGENT_SYSTEM_PROMPT,
    get_risk_agent_user_prompt
)

def run_risk_profiling_agent(state: dict) -> dict:
    """
    Analyzes the user's intake profile, calculates their risk score,
    and determines their risk category and investment parameters.
    """
    log_agent_start("Risk Profiler Agent", "Evaluating investor profile and calculating risk metrics")

    user_profile = state.get("user_profile", {})
    
    system_prompt = RISK_AGENT_SYSTEM_PROMPT
    user_prompt = get_risk_agent_user_prompt(user_profile=user_profile)

    llm_output = query_llm_with_fallback(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        agent_name="Risk Profiler Agent",
        max_tokens=350,
        expect_json=True
    )

    risk_score = 65
    risk_category = "Moderate"
    risk_analysis = "Balanced capital growth strategy suitable for medium-term compounding."

    if llm_output:
        try:
            json_start = llm_output.find("{")
            json_end = llm_output.rfind("}") + 1
            if json_start != -1 and json_end != 0:
                parsed = json.loads(llm_output[json_start:json_end])
                risk_score = int(parsed.get("risk_score", 65))
                risk_category = parsed.get("risk_category", "Moderate")
                risk_analysis = parsed.get("risk_analysis", risk_analysis)
        except Exception:
            pass

    return {
        **state,
        "risk_score": risk_score,
        "risk_category": risk_category,
        "risk_analysis": risk_analysis,
        "last_agent": "risk_profiler",  # Set flag for Critique Agent tracking
        "current_step": "Risk profiling complete. Awaiting CRO audit."
    }