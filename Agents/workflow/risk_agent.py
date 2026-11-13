# import json
# from Tools.logger import log_agent_start
# from Tools.llm_tool import query_llm_with_fallback
# from Prompts.prompt_templates import (
#     RISK_AGENT_SYSTEM_PROMPT,
#     get_risk_agent_user_prompt
# )

# def run_risk_profiling_agent(state: dict) -> dict:
#     """
#     Robust ReAct Risk Profiler Agent ensuring bulletproof JSON parsing
#     and high-confidence outputs to pass CRO Critique audits.
#     """
#     log_agent_start("Risk Profiler Agent", "Executing Robust ReAct Risk Assessment")

#     user_profile = state.get("user_profile", {})
    
#     system_prompt = RISK_AGENT_SYSTEM_PROMPT
#     user_prompt = get_risk_agent_user_prompt(user_profile=user_profile)

#     llm_output = query_llm_with_fallback(
#         system_prompt=system_prompt,
#         user_prompt=user_prompt,
#         agent_name="Risk Profiler Agent",
#         max_tokens=600,
#         expect_json=True
#     )

#     risk_score = 65
#     risk_category = "Moderate"
#     risk_analysis = "Balanced capital growth strategy backed by steady salaried stability and a 5-7 year compounding horizon."
#     thought_process = "Evaluated user stability, income slab, and capital horizon."

#     if llm_output:
#         try:
#             json_start = llm_output.find("{")
#             json_end = llm_output.rfind("}") + 1
#             if json_start != -1 and json_end != 0:
#                 parsed = json.loads(llm_output[json_start:json_end])
#                 risk_score = int(parsed.get("risk_score", 65))
#                 risk_category = parsed.get("risk_category", "Moderate")
#                 risk_analysis = parsed.get("risk_analysis", risk_analysis)
#                 thought_process = parsed.get("thought_process", thought_process)
#         except Exception as e:
#             print(f"[Risk Agent Parsing Warning]: {e}. Falling back to default robust parameters.")

#     # Guardrail bounds validation
#     risk_score = max(10, min(95, risk_score))

#     step_msg = f"ReAct [THINK]: {thought_process[:80]}... Computed Risk Score: {risk_score}/100 ({risk_category})."

#     return {
#         **state,
#         "risk_score": risk_score,
#         "risk_category": risk_category,
#         "risk_analysis": risk_analysis,
#         "risk_thought_process": thought_process,
#         "last_agent": "risk_profiler",
#         "current_step": step_msg,
#         "workflow_failed": False
#     }


import json
from Tools.logger import log_agent_start, traceable
from Tools.llm_tool import query_llm_with_fallback
from Prompts.prompt_templates import (
    RISK_AGENT_SYSTEM_PROMPT,
    get_risk_agent_user_prompt
)


def _derive_category_from_score(score: int) -> str:
    """Derives standardized risk tier purely from the LLM-computed numeric score."""
    if score >= 75:
        return "Aggressive"
    elif score >= 45:
        return "Moderate"
    return "Conservative"


@traceable(name="Risk_Profiler_Agent", run_type="chain")
def run_risk_profiling_agent(state: dict) -> dict:
    """
    Pure LLM-driven ReAct Risk Profiler Agent.
    Zero hardcoded scores or static rationales: all outputs come directly
    from the agent's behavioral and quantitative LLM reasoning.
    """
    log_agent_start("Risk Profiler Agent", "Executing Pure LLM ReAct Risk Assessment")

    user_profile = state.get("user_profile", {})
    critique_feedback = state.get("critique_feedback", "")

    system_prompt = RISK_AGENT_SYSTEM_PROMPT
    user_prompt = get_risk_agent_user_prompt(user_profile=user_profile)

    # Inject CRO Critique feedback if this is a self-correction pass
    if critique_feedback:
        user_prompt += (
            f"\n\n[CRO AUDITOR FEEDBACK FROM PREVIOUS ATTEMPT]: {critique_feedback}\n"
            "Address this feedback strictly in your updated JSON response."
        )

    llm_output = query_llm_with_fallback(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        agent_name="Risk Profiler Agent",
        max_tokens=700,
        expect_json=True
    )

    if not llm_output:
        return {
            **state,
            "last_agent": "risk_profiler",
            "current_step": "Risk Profiler Agent failed: No response received from LLM.",
            "workflow_failed": True
        }

    try:
        cleaned = llm_output.replace("```json", "").replace("```", "").strip()
        json_start = cleaned.find("{")
        json_end = cleaned.rfind("}") + 1
        if json_start == -1 or json_end == 0:
            raise ValueError("No valid JSON object found in Risk Profiler LLM response.")

        parsed = json.loads(cleaned[json_start:json_end])

        # Strictly require LLM-generated fields (no hardcoded defaults)
        if "risk_score" not in parsed or not parsed.get("risk_analysis"):
            raise ValueError("LLM response missing required 'risk_score' or 'risk_analysis' keys.")

        raw_score = int(float(parsed["risk_score"]))
        risk_score = max(1, min(100, raw_score))

        risk_category = str(parsed.get("risk_category", "")).strip()
        if not risk_category:
            risk_category = _derive_category_from_score(risk_score)

        risk_analysis = str(parsed["risk_analysis"]).strip()
        thought_process = str(parsed.get("thought_process", "")).strip()

    except Exception as e:
        error_msg = f"Risk Profiler parsing error: {str(e)}"
        print(f"[{error_msg}]")
        return {
            **state,
            "last_agent": "risk_profiler",
            "current_step": error_msg,
            "workflow_failed": True
        }

    preview = thought_process[:80] if thought_process else risk_analysis[:80]
    step_msg = f"ReAct [THINK]: {preview}... Computed Risk Score: {risk_score}/100 ({risk_category})."

    return {
        **state,
        "risk_score": risk_score,
        "risk_category": risk_category,
        "risk_analysis": risk_analysis,
        "risk_thought_process": thought_process,
        "last_agent": "risk_profiler",
        "current_step": step_msg,
        "workflow_failed": False
    }