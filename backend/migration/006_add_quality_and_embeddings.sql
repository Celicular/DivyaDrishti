ALTER TABLE images_ai_inference ADD COLUMN iq_score REAL DEFAULT 0.8;
ALTER TABLE images_ai_inference ADD COLUMN iq_label TEXT DEFAULT 'medium';
ALTER TABLE images_ai_inference ADD COLUMN embedding BLOB;
ALTER TABLE images_ai_inference ADD COLUMN embedding_json TEXT;

CREATE INDEX IF NOT EXISTS idx_images_ai_iq_label ON images_ai_inference(iq_label);
