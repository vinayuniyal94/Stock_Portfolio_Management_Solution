import os
import json
import time
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
from openai import OpenAI
from Tools.logger import log_llm_call
from Tools.network_tool import probe_huggingface_reachability, probe_openai_reachability

load_dotenv()

# Initialize OpenAI client if token exists
_openai_client = None
if os.getenv("OPENAI_API_KEY") and "placeholder" not in os.getenv("OPENAI_API_KEY"):
    try:
        _openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    except Exception:
        _openai_client = None

def query_llm_with_fallback(
    system_prompt: str,
    user_prompt: str,
    agent_name: str = "Agent",
    temperature: float = 0.2,
    max_tokens: int = 500,
    expect_json: bool = False
) -> str:
    """
    Executes Hugging Face as primary provider.
    Automatically cascades to OpenAI if HF fails or times out.
    """
    hf_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
    hf_model = os.getenv("HF_CHAT_MODEL", "meta-llama/Llama-3.1-8B-Instruct")
    hf_timeout = float(os.getenv("LLM_SOCKET_TIMEOUT_SECONDS", 4.0))

    # ==========================================
    # 1. PRIMARY ATTEMPT: HUGGING FACE
    # ==========================================
    if hf_token and "placeholder" not in hf_token:
        if probe_huggingface_reachability(timeout=1.0):
            try:
                t0 = time.time()
                client = InferenceClient(api_key=hf_token, provider="auto", timeout=hf_timeout)
                resp = client.chat.completions.create(
                    model=hf_model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    max_tokens=max_tokens,
                    temperature=temperature
                )
                output_text = resp.choices[0].message.content.strip()
                if output_text:
                    log_llm_call(
                        agent_name=f"{agent_name} (Primary: HF)",
                        model_name=hf_model,
                        system_prompt=system_prompt,
                        user_prompt=user_prompt,
                        output_text=output_text,
                        latency=time.time() - t0,
                        provider="Hugging Face Serverless"
                    )
                    return output_text
            except Exception as e:
                print(f"[{agent_name}] Hugging Face failed ({e}). Switching to OpenAI fallback...")
        else:
            print(f"[{agent_name}] Hugging Face unreachable. Switching directly to OpenAI fallback...")

    # ==========================================
    # 2. FALLBACK ATTEMPT: OPENAI
    # ==========================================
    openai_key = os.getenv("OPENAI_API_KEY")
    openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    if openai_key and _openai_client:
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
                        agent_name=f"{agent_name} (Fallback: OpenAI)",
                        model_name=openai_model,
                        system_prompt=system_prompt,
                        user_prompt=user_prompt,
                        output_text=output_text,
                        latency=time.time() - t0,
                        provider="OpenAI API"
                    )
                    return output_text
            except Exception as e:
                print(f"[{agent_name}] OpenAI fallback failed: {e}")

    # ==========================================
    # 3. IF BOTH FAIL
    # ==========================================
    print(f"[{agent_name}] All LLM endpoints failed or unreachable. Handing over to deterministic engine.")
    return ""