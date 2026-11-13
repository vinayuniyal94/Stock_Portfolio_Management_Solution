import os
import json
import time
from dotenv import load_dotenv
from openai import OpenAI
from Tools.logger import log_llm_call, traceable
from Tools.network_tool import probe_openai_reachability

load_dotenv(override=True)

try:
    from langsmith.wrappers import wrap_openai
except ImportError:
    def wrap_openai(client):
        return client

# Initialize OpenAI client wrapped for LangSmith observability
_openai_client = None
if os.getenv("OPENAI_API_KEY") and "placeholder" not in os.getenv("OPENAI_API_KEY"):
    try:
        raw_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        _openai_client = wrap_openai(raw_client)
    except Exception:
        _openai_client = None


@traceable(name="OpenAI_LLM_Call", run_type="llm")
def query_llm_with_fallback(
    system_prompt: str,
    user_prompt: str,
    agent_name: str = "Agent",
    temperature: float = 0.2,
    max_tokens: int = 500,
    expect_json: bool = False
) -> str:
    """
    Executes OpenAI exclusively as the primary LLM provider with full
    LangSmith tracing and CLI observability logging.
    """
    openai_key = os.getenv("OPENAI_API_KEY")
    openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    if not openai_key or not _openai_client:
        print(f"[{agent_name}] OpenAI API key is missing or invalid.")
        return ""

    if probe_openai_reachability(timeout=1.0):
        try:
            t0 = time.time()
            kwargs = {
                "model": openai_model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            if expect_json:
                kwargs["response_format"] = {"type": "json_object"}

            resp = _openai_client.chat.completions.create(**kwargs)
            output_text = resp.choices[0].message.content.strip()
            if output_text:
                log_llm_call(
                    agent_name=f"{agent_name} (OpenAI)",
                    model_name=openai_model,
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    output_text=output_text,
                    latency=time.time() - t0,
                    provider="OpenAI API"
                )
                return output_text
        except Exception as e:
            print(f"[{agent_name}] OpenAI request failed: {e}")

    print(f"[{agent_name}] OpenAI endpoint unreachable or failed. Handing over to deterministic engine.")
    return ""