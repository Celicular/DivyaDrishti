import sqlite3
from typing import Optional, Dict, Any
import httpx

try:
    from backend.config import DB_PATH
except ImportError:
    from config import DB_PATH

def _get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def reverse_geocode(latitude: float, longitude: float) -> Dict[str, Any]:
    if latitude is None or longitude is None:
        return {
            "latitude": None,
            "longitude": None,
            "location_name": None,
            "display_name": None
        }

    if round(latitude, 4) == 0.0 and round(longitude, 4) == 0.0:
        return {
            "latitude": latitude,
            "longitude": longitude,
            "location_name": "Location unavailable",
            "display_name": "Location unavailable"
        }

    lat_key = f"{round(latitude, 3):.3f}"
    lon_key = f"{round(longitude, 3):.3f}"

    conn = _get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT location_name, display_name FROM geo_cache WHERE lat_key = ? AND lon_key = ?",
        (lat_key, lon_key)
    )
    cached = cursor.fetchone()
    if cached:
        conn.close()
        cached_loc = cached["location_name"]
        if cached_loc in ("0.0, 0.0", "0, 0", "0.0000, 0.0000"):
            cached_loc = "Location unavailable"
        return {
            "latitude": latitude,
            "longitude": longitude,
            "location_name": cached_loc,
            "display_name": cached["display_name"]
        }

    location_name = None
    display_name = None

    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={latitude}&lon={longitude}&zoom=14"
        headers = {"User-Agent": "DDrishti-Verification-System/1.0 (ddrishti.local)"}
        with httpx.Client(timeout=4.0) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                display_name = data.get("display_name")
                address = data.get("address", {})

                city = (
                    address.get("city") or
                    address.get("town") or
                    address.get("village") or
                    address.get("state_district") or
                    address.get("suburb") or
                    address.get("county") or
                    address.get("municipality")
                )
                state = address.get("state") or address.get("region")
                country = address.get("country")

                if city and state:
                    location_name = f"{city}, {state}"
                elif city and country:
                    location_name = f"{city}, {country}"
                elif state and country:
                    location_name = f"{state}, {country}"
                elif display_name:
                    parts = [p.strip() for p in display_name.split(",") if p.strip()]
                    location_name = ", ".join(parts[:2]) if len(parts) >= 2 else display_name
    except Exception:
        pass

    if not location_name or location_name in ("0.0, 0.0", "0, 0", "0.0000, 0.0000"):
        location_name = "Location unavailable"

    try:
        cursor.execute(
            """
            INSERT OR REPLACE INTO geo_cache (lat_key, lon_key, location_name, display_name)
            VALUES (?, ?, ?, ?)
            """,
            (lat_key, lon_key, location_name, display_name)
        )
        conn.commit()
    except Exception:
        pass

    conn.close()

    return {
        "latitude": latitude,
        "longitude": longitude,
        "location_name": location_name,
        "display_name": display_name
    }
