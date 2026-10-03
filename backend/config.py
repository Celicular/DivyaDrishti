import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_DIR = Path(os.getenv("DB_DIR", str(BASE_DIR)))
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / os.getenv("DB_NAME", "ddrishti.db")
SECRET_KEY = os.getenv("SECRET_KEY", "ddrishti_jwt_super_secret_key_prod_2026")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
STORAGE_DIR = Path(os.getenv("STORAGE_DIR", str(BASE_DIR / "storage")))
BUCKETS_DIR = STORAGE_DIR / "buckets"
BUCKETS_DIR.mkdir(parents=True, exist_ok=True)
USE_EXTERNAL_AI_API = os.getenv("USE_EXTERNAL_AI_API", "true").lower() in ("true", "1", "yes")
EXTERNAL_AI_URL = os.getenv("EXTERNAL_AI_URL", "https://ddapi.celi.me/ai").rstrip("/")
INTERNAL_AI_URL = os.getenv("INTERNAL_AI_URL", os.getenv("GEMMA_INTERNAL_URL", "http://gemma-api:13795")).rstrip("/")
GEMMA_INTERNAL_URL = EXTERNAL_AI_URL if USE_EXTERNAL_AI_API else INTERNAL_AI_URL


