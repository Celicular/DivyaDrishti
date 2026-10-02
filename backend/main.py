import secrets
from pathlib import Path
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Header, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

try:
    from backend.config import BUCKETS_DIR
    from backend.database import (
        init_db,
        get_user_by_identity,
        get_user_by_id,
        list_users,
        create_project,
        list_projects,
        get_project_by_id,
        update_project,
        delete_project,
        create_media_asset,
        list_media_assets,
        get_media_asset_by_id,
        update_media_asset,
        delete_media_asset,
        batch_update_media_assets,
        batch_delete_media_assets
    )
    from backend.auth import verify_password, create_access_token, decode_access_token
    from backend.models import (
        LoginRequest,
        TokenResponse,
        UserResponse,
        HealthResponse,
        ProjectCreateRequest,
        ProjectUpdateRequest,
        ProjectResponse,
        MediaMetadataResponse,
        MediaAssetResponse,
        MediaUpdateRequest,
        MediaBatchUpdateRequest,
        MediaBatchDeleteRequest,
        ReverseGeocodeResponse
    )
    from backend.services.metadata_extractor import process_and_extract_metadata
    from backend.services.geocoder import reverse_geocode
except ImportError:
    from config import BUCKETS_DIR
    from database import (
        init_db,
        get_user_by_identity,
        get_user_by_id,
        list_users,
        create_project,
        list_projects,
        get_project_by_id,
        update_project,
        delete_project,
        create_media_asset,
        list_media_assets,
        get_media_asset_by_id,
        update_media_asset,
        delete_media_asset,
        batch_update_media_assets,
        batch_delete_media_assets
    )
    from auth import verify_password, create_access_token, decode_access_token
    from models import (
        LoginRequest,
        TokenResponse,
        UserResponse,
        HealthResponse,
        ProjectCreateRequest,
        ProjectUpdateRequest,
        ProjectResponse,
        MediaMetadataResponse,
        MediaAssetResponse,
        MediaUpdateRequest,
        MediaBatchUpdateRequest,
        MediaBatchDeleteRequest,
        ReverseGeocodeResponse
    )
    from services.metadata_extractor import process_and_extract_metadata
    from services.geocoder import reverse_geocode

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="DivyaDrishti Backend API",
    description="FastAPI backend with persistent SQLite storage and JWT authentication",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/media", StaticFiles(directory=str(BUCKETS_DIR)), name="media")

def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Bearer authorization header"
        )
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub"))
        user = get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        return user
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(exc)}"
        )

@app.get("/", tags=["Root"])
def root_index():
    return {
        "service": "DivyaDrishti Backend API",
        "status": "online",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

@app.get("/health", response_model=HealthResponse, tags=["Health"])
@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    return HealthResponse(
        status="healthy",
        service="DivyaDrishti API",
        database="connected",
        version="1.0.0"
    )

@app.post("/login", response_model=TokenResponse, tags=["Auth"])
@app.post("/api/login", response_model=TokenResponse, tags=["Auth"])
@app.post("/api/auth/login", response_model=TokenResponse, tags=["Auth"])
def login(request: LoginRequest):
    user = get_user_by_identity(request.username_or_email.strip())
    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    token_payload = {
        "sub": str(user["id"]),
        "username": user["username"],
        "email": user["email"],
        "role": user["role"]
    }
    token = create_access_token(token_payload)

    user_info = UserResponse(
        id=user["id"],
        email=user["email"],
        username=user["username"],
        full_name=user["full_name"],
        role=user["role"],
        created_at=str(user.get("created_at", ""))
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user_info
    )

@app.get("/api/auth/me", response_model=UserResponse, tags=["Auth"])
def get_me(authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    return UserResponse(
        id=user["id"],
        email=user["email"],
        username=user["username"],
        full_name=user["full_name"],
        role=user["role"],
        created_at=str(user.get("created_at", ""))
    )

@app.get("/api/users", response_model=List[UserResponse], tags=["Users"])
def get_demo_users():
    users = list_users()
    return [
        UserResponse(
            id=u["id"],
            email=u["email"],
            username=u["username"],
            full_name=u["full_name"],
            role=u["role"],
            created_at=str(u.get("created_at", ""))
        )
        for u in users
    ]

@app.post("/api/projects", response_model=ProjectResponse, tags=["Projects"])
def create_new_project(request: ProjectCreateRequest, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    project = create_project(
        uid=user["id"],
        project_name=request.project_name,
        project_description=request.project_description or "",
        people=request.people or "",
        goals=request.goals or ""
    )
    return ProjectResponse(
        id=project["id"],
        uid=project["uid"],
        project_name=project["project_name"],
        project_description=project["project_description"],
        people=project["people"],
        goals=project["goals"],
        created_at=str(project.get("created_at", ""))
    )

@app.get("/api/projects", response_model=List[ProjectResponse], tags=["Projects"])
def get_user_projects(authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    projects = list_projects(uid=user["id"])
    return [
        ProjectResponse(
            id=p["id"],
            uid=p["uid"],
            project_name=p["project_name"],
            project_description=p["project_description"],
            people=p["people"],
            goals=p["goals"],
            created_at=str(p.get("created_at", ""))
        )
        for p in projects
    ]

@app.get("/api/projects/{project_id}", response_model=ProjectResponse, tags=["Projects"])
def get_project_details(project_id: int, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    project = get_project_by_id(project_id)
    if not project or project["uid"] != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return ProjectResponse(
        id=project["id"],
        uid=project["uid"],
        project_name=project["project_name"],
        project_description=project["project_description"],
        people=project["people"],
        goals=project["goals"],
        created_at=str(project.get("created_at", ""))
    )

@app.put("/api/projects/{project_id}", response_model=ProjectResponse, tags=["Projects"])
def update_existing_project(project_id: int, request: ProjectUpdateRequest, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    existing = get_project_by_id(project_id)
    if not existing or existing["uid"] != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    updated = update_project(
        project_id=project_id,
        uid=user["id"],
        project_name=request.project_name if request.project_name is not None else existing["project_name"],
        project_description=request.project_description if request.project_description is not None else existing["project_description"],
        people=request.people if request.people is not None else existing["people"],
        goals=request.goals if request.goals is not None else existing["goals"]
    )
    return ProjectResponse(
        id=updated["id"],
        uid=updated["uid"],
        project_name=updated["project_name"],
        project_description=updated["project_description"],
        people=updated["people"],
        goals=updated["goals"],
        created_at=str(updated.get("created_at", ""))
    )

@app.delete("/api/projects/{project_id}", tags=["Projects"])
def delete_existing_project(project_id: int, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    success = delete_project(project_id=project_id, uid=user["id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return {"success": True, "message": "Project deleted successfully"}

@app.post("/api/projects/{project_id}/images", response_model=MediaAssetResponse, tags=["Media"])
async def upload_project_image(
    project_id: int,
    file: UploadFile = File(...),
    display_name: str = Form(...),
    is_grouped: bool = Form(False),
    authorization: Optional[str] = Header(None)
):
    user = get_current_user(authorization)
    project = get_project_by_id(project_id)
    if not project or project["uid"] != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 5MB limit"
        )

    mime_type = file.content_type or "image/jpeg"
    if not mime_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are permitted"
        )

    orig_ext = Path(file.filename or "").suffix.lower()
    if orig_ext not in [".jpg", ".jpeg", ".png", ".webp", ".tiff", ".bmp", ".gif"]:
        orig_ext = ".jpg"

    unique_token = secrets.token_hex(12)
    stored_filename = f"{unique_token}{orig_ext}"
    thumb_filename = f"{unique_token}_thumb.jpg"

    project_dir = BUCKETS_DIR / f"project_{project_id}"
    main_path = project_dir / "main" / stored_filename
    thumb_path = project_dir / "thumbs" / thumb_filename

    meta = process_and_extract_metadata(
        file_bytes=file_bytes,
        original_filename=file.filename or stored_filename,
        main_save_path=main_path,
        thumb_save_path=thumb_path
    )

    image_url = f"/media/project_{project_id}/main/{stored_filename}"
    thumbnail_url = f"/media/project_{project_id}/thumbs/{thumb_filename}"

    asset = create_media_asset(
        project_id=project_id,
        uid=user["id"],
        file_name=stored_filename,
        original_file_name=file.filename or stored_filename,
        display_name=display_name.strip() if display_name else (file.filename or stored_filename),
        is_grouped=is_grouped,
        image_url=image_url,
        thumbnail_url=thumbnail_url,
        file_size=len(file_bytes),
        mime_type=mime_type,
        captured_at=meta.get("capture_datetime"),
        is_meta_indexed=meta.get("is_meta_indexed", False),
        is_ai_indexed=meta.get("is_ai_indexed", True),
        is_ai_generated=meta.get("is_ai_generated", False),
        meta=meta
    )

    return MediaAssetResponse(**asset)

@app.get("/api/projects/{project_id}/images", response_model=List[MediaAssetResponse], tags=["Media"])
def get_project_images(project_id: int, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    project = get_project_by_id(project_id)
    if not project or project["uid"] != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    assets = list_media_assets(project_id)
    return [MediaAssetResponse(**a) for a in assets]

@app.get("/api/projects/{project_id}/images/{image_id}", response_model=MediaAssetResponse, tags=["Media"])
def get_single_project_image(project_id: int, image_id: int, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    project = get_project_by_id(project_id)
    if not project or project["uid"] != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    asset = get_media_asset_by_id(image_id)
    if not asset or asset["project_id"] != project_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    return MediaAssetResponse(**asset)

@app.put("/api/projects/{project_id}/images/{image_id}", response_model=MediaAssetResponse, tags=["Media"])
def update_project_image(project_id: int, image_id: int, request: MediaUpdateRequest, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    project = get_project_by_id(project_id)
    if not project or project["uid"] != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    existing = get_media_asset_by_id(image_id)
    if not existing or existing["project_id"] != project_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    updated = update_media_asset(image_id, user["id"], request.display_name or existing["display_name"])
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Update failed"
        )
    return MediaAssetResponse(**updated)

@app.delete("/api/projects/{project_id}/images/{image_id}", tags=["Media"])
def delete_project_image(project_id: int, image_id: int, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    project = get_project_by_id(project_id)
    if not project or project["uid"] != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    existing = get_media_asset_by_id(image_id)
    if not existing or existing["project_id"] != project_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    deleted = delete_media_asset(image_id, user["id"])
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    try:
        main_file = BUCKETS_DIR / f"project_{project_id}" / "main" / deleted["file_name"]
        main_file.unlink(missing_ok=True)
        thumb_stem = Path(deleted["file_name"]).stem
        thumb_file = BUCKETS_DIR / f"project_{project_id}" / "thumbs" / f"{thumb_stem}_thumb.jpg"
        thumb_file.unlink(missing_ok=True)
    except Exception:
        pass
    return {"success": True, "message": "Image deleted successfully"}

@app.post("/api/projects/{project_id}/images/batch-update", response_model=List[MediaAssetResponse], tags=["Media"])
def batch_update_project_images(project_id: int, request: MediaBatchUpdateRequest, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    project = get_project_by_id(project_id)
    if not project or project["uid"] != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    updated = batch_update_media_assets(request.image_ids, user["id"], request.display_name)
    return [MediaAssetResponse(**a) for a in updated]

@app.post("/api/projects/{project_id}/images/batch-delete", tags=["Media"])
def batch_delete_project_images(project_id: int, request: MediaBatchDeleteRequest, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    project = get_project_by_id(project_id)
    if not project or project["uid"] != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    deleted_assets = batch_delete_media_assets(request.image_ids, user["id"])
    for asset in deleted_assets:
        try:
            main_file = BUCKETS_DIR / f"project_{project_id}" / "main" / asset["file_name"]
            main_file.unlink(missing_ok=True)
            thumb_stem = Path(asset["file_name"]).stem
            thumb_file = BUCKETS_DIR / f"project_{project_id}" / "thumbs" / f"{thumb_stem}_thumb.jpg"
            thumb_file.unlink(missing_ok=True)
        except Exception:
            pass
    return {"success": True, "deleted_count": len(deleted_assets), "message": f"{len(deleted_assets)} images deleted successfully"}

@app.get("/api/geo/reverse", response_model=ReverseGeocodeResponse, tags=["Geo"])
@app.get("/geo/reverse", response_model=ReverseGeocodeResponse, tags=["Geo"])
def reverse_geocode_endpoint(latitude: float, longitude: float):
    result = reverse_geocode(latitude, longitude)
    return ReverseGeocodeResponse(
        latitude=latitude,
        longitude=longitude,
        location_name=result.get("location_name"),
        display_name=result.get("display_name")
    )
