import os
import torch
import numpy as np
from pathlib import Path
from typing import Optional
from huggingface_hub import snapshot_download
from transformers import AutoTokenizer, AutoModel

DEFAULT_MODELS_DIR = Path(os.getenv("MODELS_DIR", str(Path(__file__).resolve().parent.parent / "models")))
MODEL_REPO = os.getenv("EMBEDDING_MODEL_NAME", "BAAI/bge-small-en-v1.5")
MODEL_SUBDIR_NAME = "bge-small-en-v1.5"

class EmbeddingEngine:
    def __init__(self, models_dir: Optional[Path] = None, repo_id: str = MODEL_REPO):
        self.models_dir = Path(models_dir) if models_dir else DEFAULT_MODELS_DIR
        self.repo_id = repo_id
        self.local_model_path = self.models_dir / MODEL_SUBDIR_NAME
        self.tokenizer = None
        self.model = None
        self._device = "cuda" if torch.cuda.is_available() else "cpu"

    def ensure_model_downloaded(self) -> Path:
        self.models_dir.mkdir(parents=True, exist_ok=True)
        config_file = self.local_model_path / "config.json"
        if not config_file.exists():
            snapshot_download(
                repo_id=self.repo_id,
                local_dir=str(self.local_model_path),
                local_dir_use_symlinks=False,
                ignore_patterns=["*.msgpack", "*.h5", "*.ot"]
            )
        return self.local_model_path

    def load_model(self) -> None:
        if self.model is not None:
            return
        local_path = self.ensure_model_downloaded()
        self.tokenizer = AutoTokenizer.from_pretrained(str(local_path))
        self.model = AutoModel.from_pretrained(str(local_path)).to(self._device)
        self.model.eval()

    def build_evidence_passage(self, ai_data: dict) -> str:
        tags = ", ".join(ai_data.get("tag", []))
        objs = ", ".join(ai_data.get("obj", []))
        acts = ", ".join(ai_data.get("act", []))
        evds = ". ".join(ai_data.get("evd", []))
        sdsc = ai_data.get("sdsc", "")
        ddsc = ai_data.get("ddsc", "")
        scn = ai_data.get("scn", "")
        tim = ai_data.get("tim", "")
        iq_label = ai_data.get("iq_label", "")

        parts = [
            f"Quality: {iq_label}." if iq_label else "",
            f"Scene: {scn}, {tim} lighting." if scn else "",
            f"Summary: {sdsc}" if sdsc else "",
            f"Visual Details: {ddsc}" if ddsc else "",
            f"Identified Objects: {objs}" if objs else "",
            f"Visible Actions: {acts}" if acts else "",
            f"Search Tags: {tags}" if tags else "",
            f"Evidence: {evds}" if evds else ""
        ]
        return " ".join([p for p in parts if p]).strip()

    def generate_embedding(self, text: str) -> np.ndarray:
        self.load_model()
        encoded = self.tokenizer(
            [text],
            padding=True,
            truncation=True,
            max_length=512,
            return_tensors="pt"
        ).to(self._device)

        with torch.no_grad():
            outputs = self.model(**encoded)
            cls_repr = outputs[0][:, 0]
            normalized = torch.nn.functional.normalize(cls_repr, p=2, dim=1)
            return normalized.cpu().numpy()[0].astype(np.float32)

    def generate_query_embedding(self, query: str) -> np.ndarray:
        clean_query = query.strip()
        formatted_query = f"Represent this sentence for searching relevant passages: {clean_query}"
        return self.generate_embedding(formatted_query)

_engine_instance: Optional[EmbeddingEngine] = None

def get_embedding_engine() -> EmbeddingEngine:
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = EmbeddingEngine()
    return _engine_instance
