"""
security_middleware.py
Implements OWASP API Security Top 10 mitigations for FastAPI.
"""
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import time
import re

class OWAPSSecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        # Simple in-memory rate limiter store (use Redis in production)
        self.request_counts = {}

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path

        # 1. OWASP API4:2023 - Unrestricted Resource Consumption (Rate Limiting check)
        current_minute = int(start_time // 60)
        key = f"{client_ip}:{current_minute}"
        self.request_counts[key] = self.request_counts.get(key, 0) + 1
        if self.request_counts[key] > 100:  # Max 100 requests per minute per IP
            raise HTTPException(status_code=429, detail="OWASP Security Alert: Rate limit exceeded.")

        # 2. OWASP API8:2023 - Security Misconfiguration (Add strict security headers)
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["X-XSS-Protection"] = "1; mode=block"

        return response

def sanitize_input(text: str) -> str:
    """OWASP API3:2023 - Broken Object Property / Injection Sanitization."""
    if not isinstance(text, str):
        return str(text)
    # Strip potential script injection or SQL control characters
    sanitized = re.sub(r'[;<>\"\'\\]', '', text)
    return sanitized.strip()