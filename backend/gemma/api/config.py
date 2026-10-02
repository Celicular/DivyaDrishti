import os

LLAMA_URL = os.getenv("LLAMA_URL", "http://localhost:9100").rstrip("/")
MODEL_NAME = os.getenv("MODEL_NAME", "gemma-4-e4b")
REQUEST_TIMEOUT = float(os.getenv("REQUEST_TIMEOUT", "300"))
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "2048"))
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))
GEMMA_API_KEY_SECRET = os.getenv("GEMMA_API_KEY_SECRET", "ddrishti_gemma_secret_hackathon_2026_cc6")
GEMMA_API_KEY = os.getenv("GEMMA_API_KEY", "")
PORT = int(os.getenv("PORT", "13795"))
MAX_PARALLEL_INFERENCES = int(os.getenv("MAX_PARALLEL_INFERENCES", "4"))
QUEUE_TIMEOUT = float(os.getenv("QUEUE_TIMEOUT", "120.0"))
