import json
import base64
from typing import Optional, Dict, Any, List, AsyncGenerator
import httpx

try:
    from backend.gemma.api.config import (
        LLAMA_URL,
        MODEL_NAME,
        REQUEST_TIMEOUT,
        MAX_TOKENS,
        TEMPERATURE
    )
except ImportError:
    try:
        from gemma.api.config import (
            LLAMA_URL,
            MODEL_NAME,
            REQUEST_TIMEOUT,
            MAX_TOKENS,
            TEMPERATURE
        )
    except ImportError:
        from api.config import (
            LLAMA_URL,
            MODEL_NAME,
            REQUEST_TIMEOUT,
            MAX_TOKENS,
            TEMPERATURE
        )

class LlamaInferenceError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 500):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)

async def check_llama_health() -> bool:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{LLAMA_URL}/health")
            return resp.status_code == 200
    except Exception:
        return False

async def chat_completion(
    messages: List[Dict[str, Any]],
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    response_format: Optional[Dict[str, Any]] = None
) -> str:
    payload: Dict[str, Any] = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": temperature if temperature is not None else TEMPERATURE,
        "max_tokens": max_tokens if max_tokens is not None else MAX_TOKENS,
    }
    if response_format:
        payload["response_format"] = response_format

    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            resp = await client.post(f"{LLAMA_URL}/v1/chat/completions", json=payload)
            if resp.status_code >= 400:
                code = "INVALID_REQUEST" if resp.status_code < 500 else "INFERENCE_ERROR"
                raise LlamaInferenceError(code, f"llama.cpp error: {resp.text}", resp.status_code)
            data = resp.json()
            choices = data.get("choices", [])
            if not choices:
                raise LlamaInferenceError("INFERENCE_ERROR", "No choices returned by inference engine.", 500)
            return choices[0].get("message", {}).get("content", "")
    except httpx.ConnectError:
        raise LlamaInferenceError("MODEL_UNAVAILABLE", "llama.cpp inference service is unreachable.", 503)
    except httpx.TimeoutException:
        raise LlamaInferenceError("TIMEOUT", "Inference request timed out.", 504)
    except LlamaInferenceError:
        raise
    except Exception as exc:
        raise LlamaInferenceError("INFERENCE_ERROR", str(exc), 500)

async def chat_completion_stream(
    messages: List[Dict[str, Any]],
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None
) -> AsyncGenerator[str, None]:
    payload: Dict[str, Any] = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": temperature if temperature is not None else TEMPERATURE,
        "max_tokens": max_tokens if max_tokens is not None else MAX_TOKENS,
        "stream": True,
    }
    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            async with client.stream("POST", f"{LLAMA_URL}/v1/chat/completions", json=payload) as response:
                if response.status_code >= 400:
                    body = await response.aread()
                    raise LlamaInferenceError("INFERENCE_ERROR", f"Streaming failed: {body.decode()}", response.status_code)
                async for line in response.aiter_lines():
                    clean_line = line.strip()
                    if not clean_line or clean_line.startswith(":"):
                        continue
                    if clean_line.startswith("data: "):
                        data_str = clean_line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data_str)
                            choices = chunk.get("choices", [])
                            if choices:
                                delta = choices[0].get("delta", {})
                                content = delta.get("content", "")
                                if content:
                                    yield content
                        except json.JSONDecodeError:
                            continue
    except httpx.ConnectError:
        raise LlamaInferenceError("MODEL_UNAVAILABLE", "llama.cpp inference service is unreachable.", 503)
    except httpx.TimeoutException:
        raise LlamaInferenceError("TIMEOUT", "Inference stream timed out.", 504)
    except LlamaInferenceError:
        raise
    except Exception as exc:
        raise LlamaInferenceError("INFERENCE_ERROR", str(exc), 500)

async def vision_completion(
    image_bytes: bytes,
    mime_type: str,
    message: str,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None
) -> str:
    base64_str = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{mime_type};base64,{base64_str}"
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": message
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": data_url
                    }
                }
            ]
        }
    ]
    return await chat_completion(messages, temperature, max_tokens)
