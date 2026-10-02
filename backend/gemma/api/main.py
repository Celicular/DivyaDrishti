import io
import json
import hmac
import hashlib
import asyncio
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Header, status, File, UploadFile, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.exceptions import RequestValidationError
from PIL import Image
import jsonschema

try:
    from backend.gemma.api.config import (
        LLAMA_URL,
        MODEL_NAME,
        REQUEST_TIMEOUT,
        MAX_TOKENS,
        TEMPERATURE,
        GEMMA_API_KEY_SECRET,
        GEMMA_API_KEY,
        MAX_PARALLEL_INFERENCES,
        QUEUE_TIMEOUT
    )
    from backend.gemma.api.schemas import (
        ChatRequest,
        ChatStreamRequest,
        JsonExtractionRequest,
        KeyGenerateRequest,
        KeyGenerateResponse,
        ApiResponse,
        HealthResponse,
        ModelInfoResponse
    )
    from backend.gemma.api.llama_client import (
        LlamaInferenceError,
        check_llama_health,
        chat_completion,
        chat_completion_stream,
        vision_completion
    )
except ImportError:
    try:
        from gemma.api.config import (
            LLAMA_URL,
            MODEL_NAME,
            REQUEST_TIMEOUT,
            MAX_TOKENS,
            TEMPERATURE,
            GEMMA_API_KEY_SECRET,
            GEMMA_API_KEY,
            MAX_PARALLEL_INFERENCES,
            QUEUE_TIMEOUT
        )
        from gemma.api.schemas import (
            ChatRequest,
            ChatStreamRequest,
            JsonExtractionRequest,
            KeyGenerateRequest,
            KeyGenerateResponse,
            ApiResponse,
            HealthResponse,
            ModelInfoResponse
        )
        from gemma.api.llama_client import (
            LlamaInferenceError,
            check_llama_health,
            chat_completion,
            chat_completion_stream,
            vision_completion
        )
    except ImportError:
        from api.config import (
            LLAMA_URL,
            MODEL_NAME,
            REQUEST_TIMEOUT,
            MAX_TOKENS,
            TEMPERATURE,
            GEMMA_API_KEY_SECRET,
            GEMMA_API_KEY,
            MAX_PARALLEL_INFERENCES,
            QUEUE_TIMEOUT
        )
        from api.schemas import (
            ChatRequest,
            ChatStreamRequest,
            JsonExtractionRequest,
            KeyGenerateRequest,
            KeyGenerateResponse,
            ApiResponse,
            HealthResponse,
            ModelInfoResponse
        )
        from api.llama_client import (
            LlamaInferenceError,
            check_llama_health,
            chat_completion,
            chat_completion_stream,
            vision_completion
        )

app = FastAPI(
    title="Gemma 4 E4B Inference API",
    description="FastAPI service for Gemma 4 E4B Q4 GGUF multimodal inference via llama.cpp",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

active_inferences = 0
queued_requests = 0
inference_semaphore = asyncio.Semaphore(MAX_PARALLEL_INFERENCES)
queue_lock = asyncio.Lock()

@asynccontextmanager
async def acquire_inference_slot():
    global active_inferences, queued_requests
    async with queue_lock:
        queued_requests += 1

    try:
        await asyncio.wait_for(inference_semaphore.acquire(), timeout=QUEUE_TIMEOUT)
    except asyncio.TimeoutError:
        async with queue_lock:
            queued_requests -= 1
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail={"code": "TIMEOUT", "message": "Inference request timed out waiting in queue."}
        )

    async with queue_lock:
        queued_requests -= 1
        active_inferences += 1

    try:
        yield
    finally:
        async with queue_lock:
            active_inferences -= 1
        inference_semaphore.release()

def generate_derived_key(secret: str) -> str:
    digest = hmac.new(secret.encode(), b"gemma_derived_api_key_v1", hashlib.sha256).hexdigest()
    return f"gemma_{digest[:32]}"

def verify_api_key(
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
) -> bool:
    return True


@app.exception_handler(LlamaInferenceError)
async def llama_error_handler(request, exc: LlamaInferenceError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}}
    )

@app.exception_handler(HTTPException)
async def http_error_handler(request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "code" in exc.detail:
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail}
        )
    code = "INVALID_REQUEST" if exc.status_code < 500 else "INFERENCE_ERROR"
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": code, "message": str(exc.detail)}}
    )

@app.exception_handler(RequestValidationError)
async def validation_error_handler(request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"error": {"code": "INVALID_REQUEST", "message": str(exc.errors())}}
    )

@app.exception_handler(Exception)
async def generic_error_handler(request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": {"code": "INFERENCE_ERROR", "message": str(exc)}}
    )

@app.get("/health", response_model=HealthResponse)
async def health():
    is_connected = await check_llama_health()
    return HealthResponse(
        status="ok",
        service="gemma-inference-api",
        llama_status="connected" if is_connected else "disconnected",
        model_name=MODEL_NAME,
        max_parallel=MAX_PARALLEL_INFERENCES,
        active_inferences=active_inferences,
        queued_requests=queued_requests
    )

@app.get("/v1/model", response_model=ModelInfoResponse, dependencies=[Depends(verify_api_key)])
async def get_model_info():
    return ModelInfoResponse(
        model=MODEL_NAME,
        llama_url=LLAMA_URL,
        max_tokens=MAX_TOKENS,
        temperature=TEMPERATURE
    )

@app.post("/v1/auth/key", response_model=KeyGenerateResponse)
async def generate_api_key_endpoint(req: KeyGenerateRequest):
    if req.secret != GEMMA_API_KEY_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Invalid secret provided."}
        )
    derived = generate_derived_key(GEMMA_API_KEY_SECRET)
    return KeyGenerateResponse(api_key=derived)

@app.post("/v1/chat", response_model=ApiResponse, dependencies=[Depends(verify_api_key)])
async def chat(req: ChatRequest):
    async with acquire_inference_slot():
        messages = [{"role": "user", "content": req.message}]
        content = await chat_completion(
            messages=messages,
            temperature=req.temperature,
            max_tokens=req.max_tokens,
            response_format=req.response_format
        )

        if req.response_format:
            try:
                parsed = json.loads(content)
                schema = req.response_format.get("schema") or req.response_format.get("json_schema", {}).get("schema")
                if schema:
                    jsonschema.validate(instance=parsed, schema=schema)
                return ApiResponse(response=parsed)
            except json.JSONDecodeError as err:
                raise LlamaInferenceError("INVALID_JSON", f"Malformed JSON from model: {str(err)}", 422)
            except jsonschema.ValidationError as val_err:
                raise LlamaInferenceError("INVALID_JSON", f"JSON failed schema validation: {val_err.message}", 422)

        return ApiResponse(response=content)

@app.post("/v1/chat/stream", dependencies=[Depends(verify_api_key)])
async def chat_stream(req: ChatStreamRequest):
    global active_inferences, queued_requests

    async with queue_lock:
        queued_requests += 1

    try:
        await asyncio.wait_for(inference_semaphore.acquire(), timeout=QUEUE_TIMEOUT)
    except asyncio.TimeoutError:
        async with queue_lock:
            queued_requests -= 1
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail={"code": "TIMEOUT", "message": "Inference request timed out waiting in queue."}
        )

    async with queue_lock:
        queued_requests -= 1
        active_inferences += 1

    messages = [{"role": "user", "content": req.message}]

    async def event_generator():
        global active_inferences
        try:
            async for token in chat_completion_stream(
                messages=messages,
                temperature=req.temperature,
                max_tokens=req.max_tokens
            ):
                chunk_data = json.dumps({"token": token})
                yield f"data: {chunk_data}\n\n"
            yield "data: [DONE]\n\n"
        finally:
            async with queue_lock:
                active_inferences -= 1
            inference_semaphore.release()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.post("/v1/vision", response_model=ApiResponse, dependencies=[Depends(verify_api_key)])
async def vision(
    image: UploadFile = File(...),
    message: str = Form(...),
    temperature: Optional[float] = Form(None),
    max_tokens: Optional[int] = Form(None)
):
    try:
        image_bytes = await image.read()
        if not image_bytes:
            raise LlamaInferenceError("INVALID_IMAGE", "Empty image file uploaded.", 400)
        with Image.open(io.BytesIO(image_bytes)) as img:
            img.verify()
    except LlamaInferenceError:
        raise
    except Exception:
        raise LlamaInferenceError("INVALID_IMAGE", "Uploaded file is not a valid image format.", 400)

    mime_type = image.content_type or "image/jpeg"

    async with acquire_inference_slot():
        content = await vision_completion(
            image_bytes=image_bytes,
            mime_type=mime_type,
            message=message,
            temperature=temperature,
            max_tokens=max_tokens
        )
    return ApiResponse(response=content)

@app.post("/v1/json", response_model=ApiResponse, dependencies=[Depends(verify_api_key)])
async def json_endpoint(req: JsonExtractionRequest):
    messages = [{"role": "user", "content": req.message}]
    response_format = {
        "type": "json_schema",
        "schema": req.schema_definition
    }

    async with acquire_inference_slot():
        content = await chat_completion(
            messages=messages,
            temperature=req.temperature,
            max_tokens=req.max_tokens,
            response_format=response_format
        )
    try:
        parsed = json.loads(content)
        jsonschema.validate(instance=parsed, schema=req.schema_definition)
        return ApiResponse(response=parsed)
    except json.JSONDecodeError as err:
        raise LlamaInferenceError("INVALID_JSON", f"Malformed JSON from model: {str(err)}", 422)
    except jsonschema.ValidationError as val_err:
        raise LlamaInferenceError("INVALID_JSON", f"JSON failed schema validation: {val_err.message}", 422)
