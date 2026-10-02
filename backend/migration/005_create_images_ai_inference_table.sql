CREATE TABLE IF NOT EXISTS images_ai_inference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    image_id INTEGER NOT NULL UNIQUE,
    tag TEXT NOT NULL,
    sdsc TEXT NOT NULL,
    ddsc TEXT NOT NULL,
    obj TEXT NOT NULL,
    act TEXT NOT NULL,
    scn TEXT NOT NULL,
    tim TEXT NOT NULL,
    evd TEXT NOT NULL,
    cf TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (image_id) REFERENCES media_assets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_images_ai_inference_image_id ON images_ai_inference(image_id);
CREATE INDEX IF NOT EXISTS idx_images_ai_inference_project_id ON images_ai_inference(project_id);
