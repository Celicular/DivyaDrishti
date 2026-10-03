import sqlite3
import json
from typing import Optional, List, Dict, Any

try:
    from backend.config import DB_PATH
    from backend.migration.runner import run_migrations
    from backend.seeds.runner import run_seeds
except ImportError:
    from config import DB_PATH
    from migration.runner import run_migrations
    from seeds.runner import run_seeds

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    conn = get_connection()
    run_migrations(conn)
    run_seeds(conn)
    conn.close()

def get_user_by_identity(identity: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, email, username, password_hash, full_name, role, created_at FROM users WHERE email = ? OR username = ?",
        (identity, identity)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, email, username, password_hash, full_name, role, created_at FROM users WHERE id = ?",
        (user_id,)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def list_users() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, username, full_name, role, created_at FROM users")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def create_project(uid: int, project_name: str, project_description: str = "", people: str = "", goals: str = "") -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO projects (uid, project_name, project_description, people, goals)
        VALUES (?, ?, ?, ?, ?)
        """,
        (uid, project_name.strip(), project_description.strip(), people.strip(), goals.strip())
    )
    project_id = cursor.lastrowid
    conn.commit()
    cursor.execute(
        "SELECT id, uid, project_name, project_description, people, goals, created_at FROM projects WHERE id = ?",
        (project_id,)
    )
    row = cursor.fetchone()
    conn.close()
    return dict(row)

def list_projects(uid: Optional[int] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    if uid is not None:
        cursor.execute(
            "SELECT id, uid, project_name, project_description, people, goals, created_at FROM projects WHERE uid = ? ORDER BY id DESC",
            (uid,)
        )
    else:
        cursor.execute(
            "SELECT id, uid, project_name, project_description, people, goals, created_at FROM projects ORDER BY id DESC"
        )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_project_by_id(project_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, uid, project_name, project_description, people, goals, created_at FROM projects WHERE id = ?",
        (project_id,)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def update_project(project_id: int, uid: int, project_name: str, project_description: str = "", people: str = "", goals: str = "") -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE projects
        SET project_name = ?, project_description = ?, people = ?, goals = ?
        WHERE id = ? AND uid = ?
        """,
        (project_name.strip(), project_description.strip(), people.strip(), goals.strip(), project_id, uid)
    )
    conn.commit()
    cursor.execute(
        "SELECT id, uid, project_name, project_description, people, goals, created_at FROM projects WHERE id = ?",
        (project_id,)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def delete_project(project_id: int, uid: int) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM projects WHERE id = ? AND uid = ?", (project_id, uid))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def _format_media_row(conn: sqlite3.Connection, asset_dict: Dict[str, Any]) -> Dict[str, Any]:
    asset_dict["is_grouped"] = bool(asset_dict.get("is_grouped"))
    asset_dict["is_meta_indexed"] = bool(asset_dict.get("is_meta_indexed"))
    asset_dict["is_ai_indexed"] = bool(asset_dict.get("is_ai_indexed"))
    asset_dict["is_ai_generated"] = bool(asset_dict.get("is_ai_generated"))

    if asset_dict.get("captured_at"):
        raw_cap = str(asset_dict["captured_at"]).strip()
        import re
        m = re.match(r"^(\d{4}):(\d{2}):(\d{2})(.*)$", raw_cap)
        if m:
            clean_dt = f"{m.group(1)}-{m.group(2)}-{m.group(3)}{m.group(4)}"
            asset_dict["captured_at"] = clean_dt
            cursor_temp = conn.cursor()
            cursor_temp.execute("UPDATE media_assets SET captured_at = ? WHERE id = ?", (clean_dt, asset_dict["id"]))
            conn.commit()

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM image_metadata WHERE image_id = ?", (asset_dict["id"],))
    meta_row = cursor.fetchone()
    if meta_row:
        meta_dict = dict(meta_row)
        meta_dict["c2pa_manifest_detected"] = bool(meta_dict.get("c2pa_manifest_detected"))

        if meta_dict.get("capture_datetime"):
            raw_meta_dt = str(meta_dict["capture_datetime"]).strip()
            import re
            m = re.match(r"^(\d{4}):(\d{2}):(\d{2})(.*)$", raw_meta_dt)
            if m:
                clean_meta_dt = f"{m.group(1)}-{m.group(2)}-{m.group(3)}{m.group(4)}"
                meta_dict["capture_datetime"] = clean_meta_dt
                cursor.execute("UPDATE image_metadata SET capture_datetime = ? WHERE id = ?", (clean_meta_dt, meta_dict["id"]))
                conn.commit()

        loc = meta_dict.get("location_name")
        lat = meta_dict.get("latitude")
        lon = meta_dict.get("longitude")

        if lat is not None and lon is not None:
            if (round(lat, 4) == 0.0 and round(lon, 4) == 0.0) or loc in ("0.0, 0.0", "0, 0", "0.0000, 0.0000"):
                meta_dict["location_name"] = "Location unavailable"
                cursor.execute("UPDATE image_metadata SET location_name = 'Location unavailable' WHERE id = ?", (meta_dict["id"],))
                conn.commit()
            elif not loc:
                try:
                    from backend.services.geocoder import reverse_geocode
                except ImportError:
                    from services.geocoder import reverse_geocode
                try:
                    geo = reverse_geocode(lat, lon)
                    loc_name = geo.get("location_name")
                    if not loc_name or loc_name in ("0.0, 0.0", "0, 0", "0.0000, 0.0000"):
                        loc_name = "Location unavailable"
                    meta_dict["location_name"] = loc_name
                    cursor.execute("UPDATE image_metadata SET location_name = ? WHERE id = ?", (loc_name, meta_dict["id"]))
                    conn.commit()
                except Exception:
                    pass

        asset_dict["metadata"] = meta_dict
    else:
        asset_dict["metadata"] = None

    cursor.execute("SELECT * FROM images_ai_inference WHERE image_id = ?", (asset_dict["id"],))
    ai_row = cursor.fetchone()
    if ai_row:
        ai_dict = dict(ai_row)
        for key in ("tag", "obj", "act", "evd", "cf"):
            if isinstance(ai_dict.get(key), str):
                try:
                    ai_dict[key] = json.loads(ai_dict[key])
                except Exception:
                    ai_dict[key] = []
        if isinstance(ai_dict.get("embedding"), (bytes, bytearray)):
            ai_dict["has_embedding"] = True
            del ai_dict["embedding"]
        asset_dict["ai_inference"] = ai_dict
    else:
        asset_dict["ai_inference"] = None

    return asset_dict

def create_media_asset(
    project_id: int,
    uid: int,
    file_name: str,
    original_file_name: str,
    display_name: str,
    is_grouped: bool,
    image_url: str,
    thumbnail_url: str,
    file_size: int,
    mime_type: str,
    captured_at: Optional[str],
    is_meta_indexed: bool,
    is_ai_indexed: bool,
    is_ai_generated: bool,
    meta: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO media_assets (
            project_id, uid, file_name, original_file_name, display_name,
            is_grouped, image_url, thumbnail_url, file_size, mime_type,
            captured_at, is_meta_indexed, is_ai_indexed, is_ai_generated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            project_id, uid, file_name, original_file_name, display_name,
            1 if is_grouped else 0, image_url, thumbnail_url, file_size, mime_type,
            captured_at, 1 if is_meta_indexed else 0, 1 if is_ai_indexed else 0, 1 if is_ai_generated else 0
        )
    )
    image_id = cursor.lastrowid
    if meta:
        cursor.execute(
            """
            INSERT INTO image_metadata (
                image_id, latitude, longitude, altitude, location_name, capture_datetime,
                camera_make, camera_model, lens_model, description, creator,
                organization, width, height, software, copyright, unique_id,
                c2pa_manifest_detected, raw_metadata_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                image_id,
                meta.get("latitude"),
                meta.get("longitude"),
                meta.get("altitude"),
                meta.get("location_name"),
                meta.get("capture_datetime"),
                meta.get("camera_make"),
                meta.get("camera_model"),
                meta.get("lens_model"),
                meta.get("description"),
                meta.get("creator"),
                meta.get("organization"),
                meta.get("width"),
                meta.get("height"),
                meta.get("software"),
                meta.get("copyright"),
                meta.get("unique_id"),
                1 if meta.get("c2pa_manifest_detected") else 0,
                meta.get("raw_metadata_json")
            )
        )
    conn.commit()
    cursor.execute("SELECT * FROM media_assets WHERE id = ?", (image_id,))
    row = cursor.fetchone()
    result = _format_media_row(conn, dict(row))
    conn.close()
    return result

def list_media_assets(project_id: int) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM media_assets WHERE project_id = ? ORDER BY id DESC", (project_id,))
    rows = cursor.fetchall()
    results = [_format_media_row(conn, dict(row)) for row in rows]
    conn.close()
    return results

def get_media_asset_by_id(image_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM media_assets WHERE id = ?", (image_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    result = _format_media_row(conn, dict(row))
    conn.close()
    return result

def update_media_asset(image_id: int, uid: int, display_name: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE media_assets SET display_name = ? WHERE id = ? AND uid = ?", (display_name.strip(), image_id, uid))
    conn.commit()
    cursor.execute("SELECT * FROM media_assets WHERE id = ?", (image_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    result = _format_media_row(conn, dict(row))
    conn.close()
    return result

def delete_media_asset(image_id: int, uid: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM media_assets WHERE id = ? AND uid = ?", (image_id, uid))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    asset = dict(row)
    cursor.execute("DELETE FROM media_assets WHERE id = ? AND uid = ?", (image_id, uid))
    conn.commit()
    conn.close()
    return asset

def batch_update_media_assets(image_ids: List[int], uid: int, display_name: str) -> List[Dict[str, Any]]:
    if not image_ids:
        return []
    conn = get_connection()
    cursor = conn.cursor()
    placeholders = ",".join("?" for _ in image_ids)
    cursor.execute(
        f"UPDATE media_assets SET display_name = ? WHERE uid = ? AND id IN ({placeholders})",
        [display_name.strip(), uid] + image_ids
    )
    conn.commit()
    cursor.execute(
        f"SELECT * FROM media_assets WHERE id IN ({placeholders})",
        image_ids
    )
    rows = cursor.fetchall()
    results = [_format_media_row(conn, dict(r)) for r in rows]
    conn.close()
    return results

def batch_delete_media_assets(image_ids: List[int], uid: int) -> List[Dict[str, Any]]:
    if not image_ids:
        return []
    conn = get_connection()
    cursor = conn.cursor()
    placeholders = ",".join("?" for _ in image_ids)
    cursor.execute(
        f"SELECT * FROM media_assets WHERE uid = ? AND id IN ({placeholders})",
        [uid] + image_ids
    )
    rows = cursor.fetchall()
    deleted_assets = [dict(r) for r in rows]
    cursor.execute(
        f"DELETE FROM media_assets WHERE uid = ? AND id IN ({placeholders})",
        [uid] + image_ids
    )
    conn.commit()
    conn.close()
    return deleted_assets

def save_image_ai_inference(project_id: int, image_id: int, ai_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    tag_str = json.dumps(ai_data.get("tag", []))
    sdsc_str = str(ai_data.get("sdsc", "")).strip()
    ddsc_str = str(ai_data.get("ddsc", "")).strip()
    obj_str = json.dumps(ai_data.get("obj", []))
    act_str = json.dumps(ai_data.get("act", []))
    scn_str = str(ai_data.get("scn", "unknown")).strip()
    tim_str = str(ai_data.get("tim", "unknown")).strip()
    evd_str = json.dumps(ai_data.get("evd", []))
    cf_str = json.dumps(ai_data.get("cf", []))
    iq_score = float(ai_data.get("iq_score", 0.70))
    iq_label = str(ai_data.get("iq_label", "medium")).strip().lower()

    raw_embed = ai_data.get("embedding")
    embedding_bytes = None
    embedding_json_str = None
    if raw_embed is not None:
        if isinstance(raw_embed, (bytes, bytearray)):
            embedding_bytes = bytes(raw_embed)
        elif hasattr(raw_embed, "tobytes"):
            embedding_bytes = raw_embed.tobytes()
            embedding_json_str = json.dumps(raw_embed.tolist())
        elif isinstance(raw_embed, list):
            import numpy as np
            embedding_bytes = np.array(raw_embed, dtype=np.float32).tobytes()
            embedding_json_str = json.dumps(raw_embed)

    cursor.execute(
        """
        INSERT INTO images_ai_inference (
            project_id, image_id, tag, sdsc, ddsc, obj, act, scn, tim, evd, cf,
            iq_score, iq_label, embedding, embedding_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(image_id) DO UPDATE SET
            tag = excluded.tag,
            sdsc = excluded.sdsc,
            ddsc = excluded.ddsc,
            obj = excluded.obj,
            act = excluded.act,
            scn = excluded.scn,
            tim = excluded.tim,
            evd = excluded.evd,
            cf = excluded.cf,
            iq_score = excluded.iq_score,
            iq_label = excluded.iq_label,
            embedding = excluded.embedding,
            embedding_json = excluded.embedding_json,
            updated_at = CURRENT_TIMESTAMP
        """,
        (
            project_id, image_id, tag_str, sdsc_str, ddsc_str, obj_str, act_str, scn_str, tim_str, evd_str, cf_str,
            iq_score, iq_label, embedding_bytes, embedding_json_str
        )
    )
    cursor.execute("UPDATE media_assets SET is_ai_indexed = 1 WHERE id = ?", (image_id,))
    conn.commit()
    cursor.execute("SELECT * FROM images_ai_inference WHERE image_id = ?", (image_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        res = dict(row)
        for key in ("tag", "obj", "act", "evd", "cf"):
            if isinstance(res.get(key), str):
                try:
                    res[key] = json.loads(res[key])
                except Exception:
                    res[key] = []
        if isinstance(res.get("embedding"), (bytes, bytearray)):
            res["has_embedding"] = True
            del res["embedding"]
        return res
    return ai_data

def get_image_ai_inference(image_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM images_ai_inference WHERE image_id = ?", (image_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    res = dict(row)
    for key in ("tag", "obj", "act", "evd", "cf"):
        if isinstance(res.get(key), str):
            try:
                res[key] = json.loads(res[key])
            except Exception:
                res[key] = []
    if isinstance(res.get("embedding"), (bytes, bytearray)):
        res["has_embedding"] = True
        del res["embedding"]
    return res

def mark_images_for_reindex(image_ids: List[int], project_id: Optional[int], uid: int) -> List[Dict[str, Any]]:
    if not image_ids:
        return []
    conn = get_connection()
    cursor = conn.cursor()
    placeholders = ",".join("?" for _ in image_ids)
    if project_id is not None:
        cursor.execute(
            f"""
            SELECT id, project_id, file_name, display_name
            FROM media_assets
            WHERE project_id = ? AND uid = ? AND id IN ({placeholders})
            """,
            [project_id, uid] + image_ids
        )
    else:
        cursor.execute(
            f"""
            SELECT id, project_id, file_name, display_name
            FROM media_assets
            WHERE uid = ? AND id IN ({placeholders})
            """,
            [uid] + image_ids
        )
    target_assets = [dict(r) for r in cursor.fetchall()]
    if not target_assets:
        conn.close()
        return []

    valid_ids = [a["id"] for a in target_assets]
    valid_placeholders = ",".join("?" for _ in valid_ids)

    cursor.execute(
        f"UPDATE media_assets SET is_ai_indexed = 0 WHERE id IN ({valid_placeholders})",
        valid_ids
    )
    cursor.execute(
        f"DELETE FROM images_ai_inference WHERE image_id IN ({valid_placeholders})",
        valid_ids
    )
    conn.commit()
    conn.close()
    return target_assets

def get_unindexed_media_assets(project_id: Optional[int] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    if project_id is not None:
        cursor.execute(
            "SELECT id, project_id, uid, file_name, original_file_name, display_name FROM media_assets WHERE is_ai_indexed = 0 AND project_id = ? ORDER BY id ASC",
            (project_id,)
        )
    else:
        cursor.execute(
            "SELECT id, project_id, uid, file_name, original_file_name, display_name FROM media_assets WHERE is_ai_indexed = 0 ORDER BY id ASC"
        )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_project_indexing_counts(project_id: int) -> Dict[str, int]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM media_assets WHERE project_id = ?", (project_id,))
    total_row = cursor.fetchone()
    total = total_row[0] if total_row else 0
    cursor.execute("SELECT COUNT(*) FROM media_assets WHERE project_id = ? AND is_ai_indexed = 1", (project_id,))
    indexed_row = cursor.fetchone()
    indexed = indexed_row[0] if indexed_row else 0
    conn.close()
    return {
        "total": total,
        "indexed": indexed,
        "pending": max(0, total - indexed)
    }

def search_explore_assets(
    uid: int,
    project_ids: Optional[List[int]] = None,
    query_vector: Optional[Any] = None,
    similar_to_image_id: Optional[int] = None,
    tim: Optional[str] = None,
    iq_label: Optional[str] = None,
    min_iq_score: Optional[float] = None,
    scn: Optional[str] = None,
    sort_by: Optional[str] = "relevance",
    limit: int = 100,
    offset: int = 0
) -> Dict[str, Any]:
    import numpy as np

    user_projects = list_projects(uid=uid)
    user_project_ids = {p["id"] for p in user_projects}
    project_name_map = {p["id"]: p["project_name"] for p in user_projects}

    if project_ids:
        target_project_ids = [pid for pid in project_ids if pid in user_project_ids]
    else:
        target_project_ids = list(user_project_ids)

    if not target_project_ids:
        return {
            "total_matches": 0,
            "results": [],
            "facets": {
                "tim_counts": {},
                "iq_counts": {},
                "project_counts": {},
                "total_with_gps": 0
            }
        }

    conn = get_connection()
    cursor = conn.cursor()

    if similar_to_image_id is not None and query_vector is None:
        cursor.execute(
            "SELECT id, tag, sdsc, ddsc, obj, act, scn, tim, evd, iq_label, embedding FROM images_ai_inference WHERE image_id = ?",
            (similar_to_image_id,)
        )
        sim_row = cursor.fetchone()
        if sim_row:
            if sim_row["embedding"]:
                query_vector = np.frombuffer(sim_row["embedding"], dtype=np.float32)
            else:
                try:
                    from backend.services.embedding_service import get_embedding_engine
                except ImportError:
                    from services.embedding_service import get_embedding_engine
                eng = get_embedding_engine()
                row_data = dict(sim_row)
                for k in ("tag", "obj", "act", "evd"):
                    if isinstance(row_data.get(k), str):
                        try:
                            row_data[k] = json.loads(row_data[k])
                        except Exception:
                            row_data[k] = [s.strip() for s in row_data[k].split(",") if s.strip()]
                    elif row_data.get(k) is None:
                        row_data[k] = []
                passage = eng.build_evidence_passage(row_data)
                query_vector = eng.generate_embedding(passage)
                cursor.execute(
                    "UPDATE images_ai_inference SET embedding = ?, embedding_json = ? WHERE id = ?",
                    (query_vector.tobytes(), json.dumps(query_vector.tolist()), row_data["id"])
                )
                conn.commit()

    placeholders = ",".join("?" for _ in target_project_ids)
    sql = f"""
    SELECT 
        m.id, m.project_id, m.uid, m.file_name, m.original_file_name, m.display_name,
        m.image_url, m.thumbnail_url, m.file_size, m.mime_type, m.upload_time,
        m.captured_at, m.is_ai_indexed,
        ai.iq_score, ai.iq_label, ai.tim, ai.scn, ai.tag, ai.obj, ai.act, ai.sdsc, ai.ddsc, ai.evd,
        ai.embedding,
        meta.latitude, meta.longitude, meta.location_name
    FROM media_assets m
    LEFT JOIN images_ai_inference ai ON m.id = ai.image_id
    LEFT JOIN image_metadata meta ON m.id = meta.image_id
    WHERE m.uid = ? AND m.project_id IN ({placeholders})
    """
    params: List[Any] = [uid] + target_project_ids

    if tim and tim.lower() not in ("all", ""):
        sql += " AND LOWER(ai.tim) = ?"
        params.append(tim.lower().strip())

    if iq_label and iq_label.lower() not in ("all", ""):
        sql += " AND LOWER(ai.iq_label) = ?"
        params.append(iq_label.lower().strip())

    if min_iq_score is not None:
        sql += " AND ai.iq_score >= ?"
        params.append(float(min_iq_score))

    if scn and scn.strip():
        sql += " AND LOWER(ai.scn) LIKE ?"
        params.append(f"%{scn.strip().lower()}%")

    if similar_to_image_id is not None:
        sql += " AND m.id != ?"
        params.append(similar_to_image_id)

    cursor.execute(sql, params)
    raw_rows = cursor.fetchall()
    conn.close()

    items = []
    tim_counts: Dict[str, int] = {}
    iq_counts: Dict[str, int] = {}
    project_counts: Dict[str, int] = {}
    total_with_gps = 0

    candidate_embeddings = []
    candidate_items = []

    for r in raw_rows:
        row_dict = dict(r)
        pid = row_dict["project_id"]
        row_dict["project_name"] = project_name_map.get(pid, "")

        for field in ("tag", "obj", "act", "evd"):
            val = row_dict.get(field)
            if isinstance(val, str):
                try:
                    row_dict[field] = json.loads(val)
                except Exception:
                    row_dict[field] = [s.strip() for s in val.split(",") if s.strip()]
            elif val is None:
                row_dict[field] = []

        raw_tim = (row_dict.get("tim") or "unknown").strip().lower()
        tim_counts[raw_tim] = tim_counts.get(raw_tim, 0) + 1

        raw_iq = (row_dict.get("iq_label") or "unknown").strip().lower()
        iq_counts[raw_iq] = iq_counts.get(raw_iq, 0) + 1

        pid_key = str(pid)
        project_counts[pid_key] = project_counts.get(pid_key, 0) + 1

        if row_dict.get("latitude") is not None and row_dict.get("longitude") is not None:
            total_with_gps += 1

        emb_bytes = row_dict.get("embedding")
        if "embedding" in row_dict:
            del row_dict["embedding"]

        if emb_bytes and len(emb_bytes) >= 1536:
            row_dict["has_embedding"] = True
            candidate_embeddings.append(np.frombuffer(emb_bytes, dtype=np.float32))
            candidate_items.append(row_dict)
        else:
            row_dict["has_embedding"] = False
            row_dict["similarity_score"] = None
            items.append(row_dict)

    if query_vector is not None and candidate_embeddings:
        q_norm = query_vector / (np.linalg.norm(query_vector) + 1e-9)
        cand_matrix = np.vstack(candidate_embeddings)
        norms = np.linalg.norm(cand_matrix, axis=1, keepdims=True) + 1e-9
        cand_matrix_norm = cand_matrix / norms
        sims = np.dot(cand_matrix_norm, q_norm)
        for idx, item in enumerate(candidate_items):
            score = float(sims[idx])
            item["similarity_score"] = round(max(0.0, min(1.0, score)), 4)
            items.append(item)
    else:
        for item in items:
            item["similarity_score"] = None
        for item in candidate_items:
            item["similarity_score"] = None
            items.append(item)

    if query_vector is not None and (not sort_by or sort_by == "relevance"):
        items.sort(key=lambda x: x.get("similarity_score") or 0.0, reverse=True)
    elif sort_by == "quality_desc":
        items.sort(key=lambda x: x.get("iq_score") or 0.0, reverse=True)
    elif sort_by == "quality_asc":
        items.sort(key=lambda x: x.get("iq_score") or 0.0)
    elif sort_by == "oldest":
        items.sort(key=lambda x: str(x.get("upload_time") or x.get("captured_at") or ""))
    elif sort_by == "relevance":
        items.sort(key=lambda x: x.get("similarity_score") or 0.0, reverse=True)
    else:
        items.sort(key=lambda x: str(x.get("upload_time") or x.get("captured_at") or ""), reverse=True)

    total_matches = len(items)
    sliced_results = items[offset : offset + limit]

    return {
        "total_matches": total_matches,
        "results": sliced_results,
        "facets": {
            "tim_counts": tim_counts,
            "iq_counts": iq_counts,
            "project_counts": project_counts,
            "total_with_gps": total_with_gps
        }
    }

def backfill_missing_embeddings() -> int:
    try:
        from backend.services.embedding_service import get_embedding_engine
    except ImportError:
        from services.embedding_service import get_embedding_engine

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, tag, sdsc, ddsc, obj, act, scn, tim, evd, iq_label FROM images_ai_inference WHERE embedding IS NULL")
    rows = cursor.fetchall()
    if not rows:
        conn.close()
        return 0

    engine = get_embedding_engine()
    count = 0
    for r in rows:
        ai_data = dict(r)
        for key in ("tag", "obj", "act", "evd"):
            val = ai_data.get(key)
            if isinstance(val, str):
                try:
                    ai_data[key] = json.loads(val)
                except Exception:
                    ai_data[key] = [s.strip() for s in val.split(",") if s.strip()]
            elif val is None:
                ai_data[key] = []

        passage = engine.build_evidence_passage(ai_data)
        vec = engine.generate_embedding(passage)
        emb_bytes = vec.tobytes()
        emb_json = json.dumps(vec.tolist())
        cursor.execute(
            "UPDATE images_ai_inference SET embedding = ?, embedding_json = ? WHERE id = ?",
            (emb_bytes, emb_json, ai_data["id"])
        )
        count += 1

    conn.commit()
    conn.close()
    return count

