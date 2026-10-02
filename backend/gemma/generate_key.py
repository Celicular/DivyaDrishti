import os
import sys
import hmac
import hashlib
from pathlib import Path

def generate_key(secret: str) -> str:
    digest = hmac.new(secret.encode(), b"gemma_derived_api_key_v1", hashlib.sha256).hexdigest()
    return f"gemma_{digest[:32]}"

def get_secret() -> str:
    if len(sys.argv) > 1:
        return sys.argv[1].strip()
    if os.getenv("GEMMA_API_KEY_SECRET"):
        return os.getenv("GEMMA_API_KEY_SECRET").strip()
    env_paths = [
        Path(__file__).resolve().parent / ".env",
        Path(__file__).resolve().parent.parent / ".env"
    ]
    for env_path in env_paths:
        if env_path.is_file():
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    clean = line.strip()
                    if clean.startswith("GEMMA_API_KEY_SECRET="):
                        val = clean.split("=", 1)[1].strip()
                        if val:
                            return val
    return "ddrishti_gemma_secret_hackathon_2026_cc6"

if __name__ == "__main__":
    secret = get_secret()
    api_key = generate_key(secret)
    print(f"Secret: {secret}")
    print(f"Generated API Key: {api_key}")
    print(f"Header (Bearer): Authorization: Bearer {api_key}")
    print(f"Header (X-API-Key): X-API-Key: {api_key}")
