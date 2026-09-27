import os
import time
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
from Tools.logger import log_agent_start, log_llm_call

load_dotenv()

def run_risk_profiling_agent(state: dict) -> dict:
    profile = state.get("user_profile", {})
    investor_name = profile.get("investor_name", "Investor")
    log_agent_start("Risk Profiler Agent", f"Evaluate risk tolerance and asset suitability for {investor_name}")

    age = int(profile.get("age", 30))
    horizon = profile.get("investment_horizon", "5-7 Years")
    cagr = profile.get("cagr_expectation", "14-16%")
    income_slab = profile.get("income_slab", "₹15L - ₹25L")

    # Rule-based quantitative baseline
    score = max(35, min(90, 100 - (age // 2)))
    category = "Aggressive" if score > 70 else "Moderate" if score >= 50 else "Conservative"

    # LLM Risk Synthesis
    system_prompt = "You are a SEBI-registered Risk Profiling Specialist. Provide a 2-sentence rationale for the investor's risk score."
    user_prompt = f"Profile: Age {age}, Income {income_slab}, Goal: {profile.get('primary_goal')}, Horizon: {horizon}, Target CAGR: {cagr}, Score: {score}/100 ({category})."

    t0 = time.time()
    hf_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
    hf_model = os.getenv("HF_CHAT_MODEL", "meta-llama/Llama-3.1-8B-Instruct")
    analysis = f"Based on age {age} and a {horizon} horizon, an allocation toward {category} growth equities is recommended."

    if hf_token and "placeholder" not in hf_token:
        try:
            client = InferenceClient(api_key=hf_token, provider="auto")
            resp = client.chat.completions.create(
                model=hf_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=150
            )
            analysis = resp.choices[0].message.content.strip()
            log_llm_call("Risk Profiler Agent", hf_model, system_prompt, user_prompt, analysis, time.time() - t0)
        except Exception as e:
            print(f"  [Risk Agent LLM Fallback]: {e}")
            log_llm_call("Risk Profiler Agent (Rule Engine)", "Internal Rules", system_prompt, user_prompt, analysis, time.time() - t0, provider="Internal")

    return {
        **state,
        "risk_score": score,
        "risk_category": category,
        "risk_analysis": analysis,
        "current_step": "Risk profiling complete"
    }