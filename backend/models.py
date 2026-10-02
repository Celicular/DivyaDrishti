from typing import Optional, List
from pydantic import BaseModel, Field

class LoginRequest(BaseModel):
    username_or_email: str = Field(..., example="field_lead")
    password: str = Field(..., example="Demo@2026")

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: str
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class HealthResponse(BaseModel):
    status: str
    service: str
    database: str
    version: str

class ProjectCreateRequest(BaseModel):
    project_name: str = Field(..., min_length=1, max_length=150)
    project_description: Optional[str] = ""
    people: Optional[str] = ""
    goals: Optional[str] = ""

class ProjectUpdateRequest(BaseModel):
    project_name: Optional[str] = Field(None, min_length=1, max_length=150)
    project_description: Optional[str] = None
    people: Optional[str] = None
    goals: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    uid: int
    project_name: str
    project_description: Optional[str] = ""
    people: Optional[str] = ""
    goals: Optional[str] = ""
    created_at: Optional[str] = None

class MediaMetadataResponse(BaseModel):
    id: Optional[int] = None
    image_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    altitude: Optional[float] = None
    location_name: Optional[str] = None
    capture_datetime: Optional[str] = None
    camera_make: Optional[str] = None
    camera_model: Optional[str] = None
    lens_model: Optional[str] = None
    description: Optional[str] = None
    creator: Optional[str] = None
    organization: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    software: Optional[str] = None
    copyright: Optional[str] = None
    unique_id: Optional[str] = None
    c2pa_manifest_detected: bool = False
    raw_metadata_json: Optional[str] = None

class ReverseGeocodeResponse(BaseModel):
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    display_name: Optional[str] = None

class MediaAssetResponse(BaseModel):
    id: int
    project_id: int
    uid: int
    file_name: str
    original_file_name: str
    display_name: str
    is_grouped: bool
    image_url: str
    thumbnail_url: str
    file_size: int
    mime_type: str
    upload_time: Optional[str] = None
    captured_at: Optional[str] = None
    is_meta_indexed: bool
    is_ai_indexed: bool
    is_ai_generated: bool
    metadata: Optional[MediaMetadataResponse] = None
    ai_inference: Optional[dict] = None

class MediaUpdateRequest(BaseModel):
    display_name: Optional[str] = Field(None, min_length=1, max_length=200)

class MediaBatchUpdateRequest(BaseModel):
    image_ids: List[int] = Field(..., min_length=1)
    display_name: str = Field(..., min_length=1, max_length=200)

class MediaBatchDeleteRequest(BaseModel):
    image_ids: List[int] = Field(..., min_length=1)

class IndexingStatusResponse(BaseModel):
    is_indexing: bool
    total_images: int
    indexed_count: int
    pending_count: int
    currently_indexing: List[int]
    estimated_remaining_seconds: int
