from typing import Optional, Dict, Any, Union
from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    response_format: Optional[Dict[str, Any]] = None
    enable_thinking: bool = False

class ChatStreamRequest(BaseModel):
    message: str = Field(..., min_length=1)
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    enable_thinking: bool = False

class JsonExtractionRequest(BaseModel):
    message: str = Field(..., min_length=1)
    schema_definition: Dict[str, Any] = Field(..., alias="schema")
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    enable_thinking: bool = False

class KeyGenerateRequest(BaseModel):
    secret: str = Field(..., min_length=1)

class KeyGenerateResponse(BaseModel):
    api_key: str
    token_type: str = "Bearer"

class ApiResponse(BaseModel):
    response: Any
    raw_llama: Optional[Any] = None

class ErrorDetail(BaseModel):
    code: str
    message: str

class ErrorResponse(BaseModel):
    error: ErrorDetail

class HealthResponse(BaseModel):
    status: str
    service: str
    llama_status: str
    model_name: str
    max_parallel: int
    active_inferences: int
    queued_requests: int


class ModelInfoResponse(BaseModel):
    model: str
    llama_url: str
    max_tokens: int
    temperature: float
