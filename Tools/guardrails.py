import re

class GuardrailsManager:
    """
    Enterprise Security Guardrails for ArthVeda AI:
    - PII Redaction (Masks PAN, Aadhaar, Emails, Phone Numbers, Credit Cards)
    - Prompt Injection & Jailbreak Defense (Blocks system override commands, malicious injections, excessive length)
    """

    EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
    PHONE_REGEX = re.compile(r'(?<!\d)(?:\+?91[\-\s]?)?[6-9]\d{9}(?!\d)')
    PAN_REGEX = re.compile(r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b')
    AADHAAR_REGEX = re.compile(r'\b\d{4}\s?\d{4}\s?\d{4}\b')
    CREDIT_CARD_REGEX = re.compile(r'\b(?:\d[ -]*?){13,16}\b')

    INJECTION_PATTERNS = [
        r"ignore previous instructions",
        r"ignore all prior commands",
        r"disregard safety guidelines",
        r"you are now DAN",
        r"developer mode enabled",
        r"system override",
        r"reveal system prompt",
        r"print internal instructions",
        r"bypass security"
    ]

    @classmethod
    def sanitize_pii(cls, text: str) -> str:
        """Redacts sensitive PII from inputs before passing to agents/LLMs."""
        if not isinstance(text, str):
            return text
        
        text = cls.EMAIL_REGEX.sub("[REDACTED_EMAIL]", text)
        text = cls.PHONE_REGEX.sub("[REDACTED_PHONE]", text)
        text = cls.PAN_REGEX.sub("[REDACTED_PAN]", text)
        text = cls.AADHAAR_REGEX.sub("[REDACTED_AADHAAR]", text)
        text = cls.CREDIT_CARD_REGEX.sub("[REDACTED_CC]", text)
        
        return text

    @classmethod
    def detect_prompt_injection(cls, text: str) -> tuple[bool, str]:
        """Scans query/text for agentic jailbreak and prompt injection attempts."""
        if not isinstance(text, str):
            return False, ""

        normalized = text.lower()
        for pattern in cls.INJECTION_PATTERNS:
            if re.search(pattern, normalized):
                return True, f"Security Violation: Malicious prompt injection pattern detected ('{pattern}')."

        if len(text) > 5000:
            return True, "Security Violation: Input payload exceeds maximum token length limit."

        return False, ""

    @classmethod
    def validate_and_sanitize_input(cls, user_input: str) -> dict:
        """Runs full guardrail suite on incoming text strings."""
        if not user_input:
            return {"safe": True, "reason": "Empty input", "sanitized_text": ""}

        is_attack, reason = cls.detect_prompt_injection(user_input)
        if is_attack:
            return {
                "safe": False,
                "reason": reason,
                "sanitized_text": ""
            }

        sanitized = cls.sanitize_pii(user_input)
        return {
            "safe": True,
            "reason": "Passed security and PII screening.",
            "sanitized_text": sanitized
        }

    @classmethod
    def sanitize_profile(cls, profile: dict) -> dict:
        """Recursively sanitizes string fields in user profile dicts to prevent PII leaks."""
        if not isinstance(profile, dict):
            return profile
        
        sanitized_profile = profile.copy()
        for key, val in sanitized_profile.items():
            if isinstance(val, str):
                sanitized_profile[key] = cls.sanitize_pii(val)
            elif isinstance(val, dict):
                sanitized_profile[key] = cls.sanitize_profile(val)
        return sanitized_profile

guardrails = GuardrailsManager()