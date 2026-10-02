ALTER TABLE image_metadata ADD COLUMN location_name TEXT;

CREATE TABLE IF NOT EXISTS geo_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lat_key TEXT NOT NULL,
    lon_key TEXT NOT NULL,
    location_name TEXT NOT NULL,
    display_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lat_key, lon_key)
);
