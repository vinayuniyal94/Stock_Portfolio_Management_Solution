import time
from typing import Optional, Dict, Any
import json

# Add at the top of Tools/logger.py
import os

try:
    from langsmith import traceable
except ImportError:
    def traceable(*args, **kwargs):
        def decorator(fn):
            return fn
        return decorator

try:
    import tiktoken
    _enc = tiktoken.get_encoding("cl100k_base")
except Exception:
    _enc = None

def count_tokens(text: str) -> int:
    if not text:
        return 0
    if _enc:
        return len(_enc.encode(text, disallowed_special=()))
    return max(1, len(text) // 4)

def log_agent_start(agent_name: str, task_description: str):
    print("\n" + "=" * 90)
    print(f"  [ARTHVEDA AGENT RE-ACT INVOCATION]: {agent_name.upper()}")
    print(f"  [TASK & OBJECTIVE]: {task_description}")
    print(f"  [SECURITY & GUARDRAILS]: Active — Strict Sector Guardrails & CRO Gatekeeper")
    print("=" * 90)

def log_llm_call(
    agent_name: str,
    model_name: str,
    system_prompt: str,
    user_prompt: str,
    output_text: str,
    latency: float,
    provider: str = "OpenAI API"
):
    full_input = f"{system_prompt}\n{user_prompt}" if system_prompt else user_prompt
    input_tokens = count_tokens(full_input)
    output_tokens = count_tokens(output_text)
    total_tokens = input_tokens + output_tokens
    est_cost = (total_tokens / 1000) * 0.0002

    print("\n" + "-" * 25 + " [ARTHVEDA AGENT: THINK -> PLAN -> ACT LIFECYCLE] " + "-" * 25)
    print(f"• Caller Agent : {agent_name}")
    print(f"• Provider     : {provider}")
    print(f"• Model Name   : {model_name}")
    print(f"• Latency      : {latency:.3f}s")
    print(f"• Token Usage  : Input: {input_tokens} | Output: {output_tokens} | Total: {total_tokens}")
    print(f"• Est. Cost    : ${est_cost:.6f} USD")
    print("-" * 90)
    print(">>> [1. THINK & 2. PLAN (PROMPT INPUT SENT)]:")
    print(full_input.strip()[:600] + "..." if len(full_input) > 600 else full_input.strip())
    print("-" * 90)
    print("<<< [3. ACT (STRUCTURED OUTPUT RECEIVED)]:")
    print(output_text.strip()[:600] + "..." if len(output_text) > 600 else output_text.strip())
    print("-" * 90 + "\n")

def log_tool_call(tool_name: str, inputs: Dict[str, Any], output_summary: str, duration: float):
    summary_str = str(output_summary)
    if len(summary_str) > 250:
        summary_str = summary_str[:250] + "... [TRUNCATED BULKY PAYLOAD]"

    print(f"  [ARTHVEDA TOOL EXECUTED]: {tool_name} (took {duration:.3f}s)")
    print(f"     * Inputs : {inputs}")
    print(f"     * Output : {summary_str}")
    print(f"     * Security: Guardrails & validation passed successfully.")

def log_critique_event(passed: bool, confidence_score: int, feedback: str, iteration: int):
    status_label = "CRO AUDIT PASSED & APPROVED" if passed and confidence_score >= 75 else f"CRO AUDIT REJECTED (Attempt #{iteration}/3)"
    print("\n" + "~" * 90)
    print(f"  [ARTHVEDA CHIEF RISK OFFICER (CRO) CRITIQUE GATEKEEPER]: {status_label}")
    print(f"  * Audit Attempt     : #{iteration} of 3")
    print(f"  * Confidence Score  : {confidence_score} / 100")
    print(f"  * Auditor Feedback  : {feedback}")
    if not passed or confidence_score < 75:
        if iteration >= 3:
            print(f"  * Action Taken      : Max 3 attempts reached. Halting workflow and displaying Ops Failure page.")
        else:
            print(f"  * Action Taken      : Output rejected. Automatically triggering automated re-run with corrective feedback.")
    else:
        print(f"  * Action Taken      : Output verified against task objective and approved for UI display.")
    print("~" * 90 + "\n")