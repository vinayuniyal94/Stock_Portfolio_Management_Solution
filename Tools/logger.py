import time
from typing import Optional, Dict, Any

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
    print(f"  [AGENT INVOCATION]: {agent_name.upper()}")
    print(f"  [TASK]: {task_description}")
    print("=" * 90)

def log_llm_call(
    agent_name: str,
    model_name: str,
    system_prompt: str,
    user_prompt: str,
    output_text: str,
    latency: float,
    provider: str = "Hugging Face Serverless"
):
    full_input = f"{system_prompt}\n{user_prompt}" if system_prompt else user_prompt
    input_tokens = count_tokens(full_input)
    output_tokens = count_tokens(output_text)
    total_tokens = input_tokens + output_tokens
    est_cost = (total_tokens / 1000) * 0.0002

    print("\n" + "-" * 35 + " [LLM CALL METRICS] " + "-" * 35)
    print(f"• Caller Agent : {agent_name}")
    print(f"• Provider     : {provider}")
    print(f"• Model Name   : {model_name}")
    print(f"• Latency      : {latency:.3f}s")
    print(f"• Token Usage  : Input: {input_tokens} | Output: {output_tokens} | Total: {total_tokens}")
    print(f"• Est. Cost    : ${est_cost:.6f} USD")
    print("-" * 90)
    print(">>> [PROMPT INPUT SENT TO LLM]:")
    print(full_input.strip())
    print("-" * 90)
    print("<<< [RAW OUTPUT RECEIVED FROM LLM]:")
    print(output_text.strip())
    print("-" * 90 + "\n")

def log_tool_call(tool_name: str, inputs: Dict[str, Any], output_summary: str, duration: float):
    print(f"  [TOOL EXECUTED]: {tool_name} (took {duration:.3f}s)")
    print(f"     * Inputs : {inputs}")
    print(f"     * Output : {output_summary}")