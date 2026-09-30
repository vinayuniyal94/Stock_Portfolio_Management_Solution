import socket
import time
from Tools.logger import log_tool_call

def probe_huggingface_reachability(timeout: float = 1.0) -> bool:
    """Probes TCP socket reachability to Hugging Face Serverless API router."""
    t0 = time.time()
    try:
        sock = socket.create_connection(("api-inference.huggingface.co", 443), timeout=timeout)
        sock.close()
        reachable = True
    except Exception:
        reachable = False

    log_tool_call(
        tool_name="Probe HF Reachability",
        inputs={"host": "api-inference.huggingface.co", "timeout": timeout},
        output_summary="ONLINE" if reachable else "OFFLINE / TIMEOUT",
        duration=time.time() - t0
    )
    return reachable

def probe_openai_reachability(timeout: float = 1.0) -> bool:
    """Probes TCP socket reachability to OpenAI API endpoint."""
    t0 = time.time()
    try:
        sock = socket.create_connection(("api.openai.com", 443), timeout=timeout)
        sock.close()
        reachable = True
    except Exception:
        reachable = False

    log_tool_call(
        tool_name="Probe OpenAI Reachability",
        inputs={"host": "api.openai.com", "timeout": timeout},
        output_summary="ONLINE" if reachable else "OFFLINE / TIMEOUT",
        duration=time.time() - t0
    )
    return reachable