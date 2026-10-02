import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Dict, Any
try:
    from backend.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
except ImportError:
    from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}:{key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt, expected_hash = hashed_password.split(":")
        calculated_key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100000)
        return secrets.compare_digest(calculated_key.hex(), expected_hash)
    except Exception:
        return False

def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")

def b64url_decode(data: str) -> bytes:
    padding = "=" * (4 - (len(data) % 4)) if len(data) % 4 != 0 else ""
    return base64.urlsafe_b64decode((data + padding).encode("utf-8"))

def create_access_token(data: Dict[str, Any], expires_delta_seconds: int = None) -> str:
    if expires_delta_seconds is None:
        expires_delta_seconds = ACCESS_TOKEN_EXPIRE_MINUTES * 60

    try:
        import jwt
        payload = data.copy()
        payload["exp"] = int(time.time()) + expires_delta_seconds
        payload["iat"] = int(time.time())
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    except ImportError:
        header = {"alg": "HS256", "typ": "JWT"}
        payload = data.copy()
        payload["exp"] = int(time.time()) + expires_delta_seconds
        payload["iat"] = int(time.time())
        encoded_header = b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
        encoded_payload = b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
        signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
        signature = hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
        encoded_signature = b64url_encode(signature)
        return f"{encoded_header}.{encoded_payload}.{encoded_signature}"

def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        import jwt
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except ImportError:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Invalid token format")
        encoded_header, encoded_payload, encoded_signature = parts
        signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
        expected_sig = b64url_encode(hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest())
        if not secrets.compare_digest(encoded_signature, expected_sig):
            raise ValueError("Invalid token signature")
        payload = json.loads(b64url_decode(encoded_payload).decode("utf-8"))
        if "exp" in payload and payload["exp"] < time.time():
            raise ValueError("Token expired")
        return payload
