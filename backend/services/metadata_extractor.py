import io
import re
import json
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
from PIL import Image, ExifTags

def _normalize_datetime(val: Any) -> Optional[str]:
    if not val:
        return None
    raw = str(val).strip("\x00").strip()
    if not raw:
        return None
    m = re.match(r"^(\d{4}):(\d{2}):(\d{2})(.*)$", raw)
    if m:
        return f"{m.group(1)}-{m.group(2)}-{m.group(3)}{m.group(4)}"
    return raw

def _convert_ratio_to_float(val: Any) -> float:
    if hasattr(val, 'numerator') and hasattr(val, 'denominator'):
        return float(val.numerator) / float(val.denominator) if val.denominator != 0 else 0.0
    if isinstance(val, (tuple, list)) and len(val) == 2:
        return float(val[0]) / float(val[1]) if val[1] != 0 else 0.0
    return float(val)

def _convert_dms_to_dd(dms: Any, ref: Optional[str]) -> Optional[float]:
    if not dms or not isinstance(dms, (tuple, list)) or len(dms) < 3:
        return None
    try:
        degrees = _convert_ratio_to_float(dms[0])
        minutes = _convert_ratio_to_float(dms[1])
        seconds = _convert_ratio_to_float(dms[2])
        dd = degrees + (minutes / 60.0) + (seconds / 3600.0)
        if ref and ref.upper() in ["S", "W"]:
            dd = -dd
        return round(dd, 7)
    except Exception:
        return None

def _extract_gps(gps_ifd: Dict[int, Any]) -> Tuple[Optional[float], Optional[float], Optional[float]]:
    named_gps = {}
    for tag_id, val in gps_ifd.items():
        name = ExifTags.GPSTAGS.get(tag_id, str(tag_id))
        named_gps[name] = val

    lat = _convert_dms_to_dd(named_gps.get("GPSLatitude"), named_gps.get("GPSLatitudeRef"))
    lon = _convert_dms_to_dd(named_gps.get("GPSLongitude"), named_gps.get("GPSLongitudeRef"))
    
    alt_val = named_gps.get("GPSAltitude")
    alt = None
    if alt_val is not None:
        try:
            alt = round(_convert_ratio_to_float(alt_val), 2)
            alt_ref = named_gps.get("GPSAltitudeRef", 0)
            if alt_ref == 1 or alt_ref == b"\x01":
                alt = -alt
        except Exception:
            alt = None

    return lat, lon, alt

def _detect_ai_and_c2pa(file_bytes: bytes, software: Optional[str], description: Optional[str]) -> Tuple[bool, bool]:
    lower_bytes = file_bytes.lower()
    c2pa_detected = (
        b"c2pa" in lower_bytes or
        b"c2pa.manifest" in lower_bytes or
        b"urn:c2pa:" in lower_bytes or
        b"\xd8\xfc\xe3\xd3\x4f\x48\x47\xd9\xa8\xb4\x2e\x37\x02\x22\xd3\xb7" in file_bytes or
        b"jumb" in lower_bytes
    )
    
    ai_keywords = [
        b"midjourney",
        b"dall-e",
        b"dalle",
        b"stable diffusion",
        b"stablediffusion",
        b"adobe firefly",
        b"firefly",
        b"synthid",
        b"novelai",
        b"bing image creator",
        b"comfyui",
        b"automatic1111"
    ]
    ai_detected = any(kw in lower_bytes for kw in ai_keywords)
    
    text_check = f"{software or ''} {description or ''}".lower()
    if any(kw.decode("utf-8") in text_check for kw in ai_keywords):
        ai_detected = True

    return c2pa_detected, ai_detected

def process_and_extract_metadata(
    file_bytes: bytes,
    original_filename: str,
    main_save_path: Path,
    thumb_save_path: Path
) -> Dict[str, Any]:
    main_save_path.parent.mkdir(parents=True, exist_ok=True)
    thumb_save_path.parent.mkdir(parents=True, exist_ok=True)

    with open(main_save_path, "wb") as f:
        f.write(file_bytes)

    with Image.open(io.BytesIO(file_bytes)) as img:
        width, height = img.size
        
        thumb_img = img.copy()
        thumb_img.thumbnail((450, 450), Image.Resampling.LANCZOS)
        if thumb_img.mode in ("RGBA", "P"):
            thumb_img = thumb_img.convert("RGB")
        thumb_img.save(thumb_save_path, "JPEG", quality=85, optimize=True)

        exif = img.getexif()
        raw_tags = {}
        gps_ifd = {}
        exif_ifd = {}

        if exif:
            for tag_id, val in exif.items():
                name = ExifTags.TAGS.get(tag_id, str(tag_id))
                try:
                    if isinstance(val, bytes):
                        val_str = val.decode("utf-8", errors="ignore").strip("\x00")
                    else:
                        val_str = str(val)
                    raw_tags[name] = val_str
                except Exception:
                    pass

            try:
                gps_ifd = exif.get_ifd(ExifTags.IFD.GPSInfo)
            except Exception:
                gps_ifd = {}

            try:
                exif_ifd = exif.get_ifd(ExifTags.IFD.Exif)
            except Exception:
                exif_ifd = {}

        if not gps_ifd and hasattr(img, "_getexif") and callable(img._getexif):
            try:
                legacy_exif = img._getexif() or {}
                if 34853 in legacy_exif and isinstance(legacy_exif[34853], dict):
                    gps_ifd = legacy_exif[34853]
            except Exception:
                pass

        lat, lon, alt = _extract_gps(gps_ifd)

        location_name = None
        if lat is not None and lon is not None:
            if round(lat, 4) == 0.0 and round(lon, 4) == 0.0:
                location_name = "Location unavailable"
            else:
                try:
                    from backend.services.geocoder import reverse_geocode
                except ImportError:
                    from services.geocoder import reverse_geocode
                try:
                    geo_info = reverse_geocode(lat, lon)
                    location_name = geo_info.get("location_name")
                    if not location_name or location_name in ("0.0, 0.0", "0, 0", "0.0000, 0.0000"):
                        location_name = "Location unavailable"
                except Exception:
                    location_name = "Location unavailable"

        camera_make = raw_tags.get("Make")
        camera_model = raw_tags.get("Model")
        software = raw_tags.get("Software")
        description = raw_tags.get("ImageDescription")
        creator = raw_tags.get("Artist")
        copyright_val = raw_tags.get("Copyright")

        lens_model = None
        unique_id = None
        capture_datetime = _normalize_datetime(raw_tags.get("DateTime"))

        if exif_ifd:
            named_exif_ifd = {}
            for t_id, v in exif_ifd.items():
                name = ExifTags.TAGS.get(t_id, str(t_id))
                named_exif_ifd[name] = v
            
            if "DateTimeOriginal" in named_exif_ifd:
                dt_val = named_exif_ifd["DateTimeOriginal"]
                capture_datetime = _normalize_datetime(dt_val) if dt_val else capture_datetime
            if "LensModel" in named_exif_ifd:
                lens_model = str(named_exif_ifd["LensModel"]).strip("\x00")
            if "ImageUniqueID" in named_exif_ifd:
                unique_id = str(named_exif_ifd["ImageUniqueID"]).strip("\x00")

        c2pa_detected, ai_detected = _detect_ai_and_c2pa(file_bytes, software, description)

        is_meta_indexed = bool(
            lat is not None or
            capture_datetime or
            camera_make or
            camera_model or
            software or
            description
        )

        raw_metadata_json = json.dumps({
            "tags": raw_tags,
            "has_gps": lat is not None,
            "format": img.format,
            "mode": img.mode
        }, ensure_ascii=False)

        return {
            "width": width,
            "height": height,
            "latitude": lat,
            "longitude": lon,
            "altitude": alt,
            "location_name": location_name,
            "capture_datetime": capture_datetime,
            "camera_make": camera_make,
            "camera_model": camera_model,
            "lens_model": lens_model,
            "description": description,
            "creator": creator,
            "organization": None,
            "software": software,
            "copyright": copyright_val,
            "unique_id": unique_id,
            "c2pa_manifest_detected": c2pa_detected,
            "is_ai_generated": ai_detected,
            "is_meta_indexed": is_meta_indexed,
            "is_ai_indexed": True,
            "raw_metadata_json": raw_metadata_json
        }
