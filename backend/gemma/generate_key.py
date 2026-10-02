import os
import sys
import hmac
import hashlib

def generate_key(secret: str) -> str:
    digest = hmac.new(secret.encode(), b"gemma_derived_api_key_v1", hashlib.sha256).hexdigest()
    return f"gemma_{digest[:32]}"

if __name__ == "__main__":
    secret = sys.argv[1] if len(sys.argv) > 1 else os.getenv("GEMMA_API_KEY_SECRET", "ddrishti_gemma_secret_hackathon_2026_cc6")
    api_key = generate_key(secret)
    print(f"Secret: {secret}")
    print(f"Generated API Key: {api_key}")
    print(f"Header: Authorization: Bearer {api_key}")
