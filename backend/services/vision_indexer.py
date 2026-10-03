import os
import re
import json
import copy
import mimetypes
from pathlib import Path
from typing import Optional, Union, Dict, Any, Tuple
import httpx

IQ_LABEL_RANGES: Dict[str, Tuple[float, float]] = {
    "unusable": (0.10, 0.29),
    "low": (0.30, 0.49),
    "medium": (0.50, 0.69),
    "high": (0.70, 0.89),
    "very high": (0.90, 1.00)
}
VALID_IQ_LABELS = set(IQ_LABEL_RANGES.keys())

DEFAULT_FALLBACK_INDEX: Dict[str, Any] = {
    "tag": ["unknown", "unknown", "unknown", "unknown", "unknown"],
    "sdsc": "unknown",
    "ddsc": "unknown",
    "obj": [],
    "act": [],
    "scn": "unknown",
    "tim": "unknown",
    "evd": [],
    "cf": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    "iq_score": 0.50,
    "iq_label": "medium"
}

class VisionIndexingError(Exception):
    def __init__(self, message: str, status_code: int = 500, details: Optional[Any] = None):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)

class VisionIndexer:
    def __init__(
        self,
        api_url: Optional[str] = None,
        prompt_path: Optional[Union[str, Path]] = None,
        timeout: float = 300.0
    ):
        try:
            from backend.config import GEMMA_INTERNAL_URL
        except ImportError:
            try:
                from config import GEMMA_INTERNAL_URL
            except ImportError:
                GEMMA_INTERNAL_URL = None

        raw_url = (
            api_url
            or os.getenv("VISION_API_URL")
            or GEMMA_INTERNAL_URL
            or os.getenv("EXTERNAL_AI_URL")
            or "https://ddapi.celi.me/ai"
        ).rstrip("/")
        self.api_url = raw_url if raw_url.endswith("/v1/vision") else f"{raw_url}/v1/vision"
        self.prompt_path = Path(prompt_path) if prompt_path else None
        self.timeout = timeout
        self._prompt_cache: Optional[str] = None

    def _locate_prompt_file(self) -> Optional[Path]:
        if self.prompt_path and self.prompt_path.exists():
            return self.prompt_path

        current_file = Path(__file__).resolve()
        candidates = [
            current_file.parent.parent / "prompts" / "drishti_vision.txt",
            current_file.parent.parent / "systemprompt.md",
            current_file.parent.parent.parent / "backend" / "prompts" / "drishti_vision.txt",
            current_file.parent.parent.parent / "backend" / "systemprompt.md",
            Path.cwd() / "backend" / "prompts" / "drishti_vision.txt",
            Path.cwd() / "backend" / "systemprompt.md"
        ]

        for cand in candidates:
            if cand.exists():
                return cand
        return None

    def load_prompt(self) -> str:
        if self._prompt_cache is not None:
            return self._prompt_cache

        target = self._locate_prompt_file()
        if target:
            try:
                content = target.read_text(encoding="utf-8").strip()
                if content:
                    self._prompt_cache = content
                    return self._prompt_cache
            except Exception:
                pass

        fallback_prompt = (
            "You are DRISHTI Vision, a strict visual evidence extractor.\n"
            "Return exactly ONE compact JSON object: "
            "{\"tag\":[],\"sdsc\":\"\",\"ddsc\":\"\",\"obj\":[],\"act\":[],\"scn\":\"\",\"tim\":\"\",\"evd\":[],\"cf\":[]}"
        )
        self._prompt_cache = fallback_prompt
        return self._prompt_cache

    def sanitize_response(self, raw_input: Any) -> Dict[str, Any]:
        target: Any = raw_input
        if isinstance(raw_input, dict):
            if "response" in raw_input:
                target = raw_input["response"]

        if isinstance(target, str):
            cleaned = re.sub(r"<(think|thought)>.*?</\1>", "", target, flags=re.DOTALL)
            cleaned = re.sub(r"^(.*?)</(think|thought)>", "", cleaned, flags=re.DOTALL).strip()

            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            elif cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
            if match:
                cleaned = match.group(1)

            try:
                parsed = json.loads(cleaned)
            except json.JSONDecodeError:
                return copy.deepcopy(DEFAULT_FALLBACK_INDEX)
        elif isinstance(target, dict):
            parsed = target
        else:
            return copy.deepcopy(DEFAULT_FALLBACK_INDEX)

        if not isinstance(parsed, dict):
            return copy.deepcopy(DEFAULT_FALLBACK_INDEX)

        sanitized: Dict[str, Any] = {
            "tag": [str(t).lower().strip() for t in parsed.get("tag", []) if str(t).strip()][:5] if isinstance(parsed.get("tag"), list) else [],
            "sdsc": str(parsed.get("sdsc", "")).strip(),
            "ddsc": str(parsed.get("ddsc", "")).strip(),
            "obj": [str(o).lower().strip() for o in parsed.get("obj", []) if str(o).strip()] if isinstance(parsed.get("obj"), list) else [],
            "act": [str(a).lower().strip() for a in parsed.get("act", []) if str(a).strip()] if isinstance(parsed.get("act"), list) else [],
            "scn": str(parsed.get("scn", "unknown")).strip() or "unknown",
            "tim": str(parsed.get("tim", "unknown")).strip() or "unknown",
            "evd": [str(e).strip() for e in parsed.get("evd", []) if str(e).strip()] if isinstance(parsed.get("evd"), list) else [],
            "cf": [float(c) for c in parsed.get("cf", []) if isinstance(c, (int, float))][:8] if isinstance(parsed.get("cf"), list) else []
        }

        while len(sanitized["tag"]) < 5:
            sanitized["tag"].append("unknown")

        while len(sanitized["cf"]) < 8:
            sanitized["cf"].append(0.0)

        raw_score = parsed.get("iq_score", 0.70)
        try:
            iq_score = round(max(0.10, min(1.00, float(raw_score))), 2)
        except (ValueError, TypeError):
            iq_score = 0.70

        raw_label = str(parsed.get("iq_label", "")).lower().strip()
        if raw_label in IQ_LABEL_RANGES:
            iq_label = raw_label
            min_s, max_s = IQ_LABEL_RANGES[iq_label]
            iq_score = round(max(min_s, min(max_s, iq_score)), 2)
        else:
            if iq_score < 0.30:
                iq_label = "unusable"
            elif iq_score < 0.50:
                iq_label = "low"
            elif iq_score < 0.70:
                iq_label = "medium"
            elif iq_score < 0.90:
                iq_label = "high"
            else:
                iq_label = "very high"

        sanitized["iq_score"] = iq_score
        sanitized["iq_label"] = iq_label

        return sanitized

    def _prepare_image_payload(
        self,
        image_input: Union[str, Path, bytes],
        filename: Optional[str] = None,
        mime_type: Optional[str] = None
    ) -> Tuple[str, bytes, str]:
        if isinstance(image_input, (str, Path)):
            path = Path(image_input)
            if not path.exists():
                raise FileNotFoundError(f"Image file not found: {path}")
            file_bytes = path.read_bytes()
            resolved_filename = filename or path.name
            guessed_mime, _ = mimetypes.guess_type(str(path))
            resolved_mime = mime_type or guessed_mime or "image/jpeg"
            return resolved_filename, file_bytes, resolved_mime
        elif isinstance(image_input, bytes):
            resolved_filename = filename or "image.jpg"
            resolved_mime = mime_type or "image/jpeg"
            return resolved_filename, image_input, resolved_mime
        else:
            raise TypeError("image_input must be a file path (str/Path) or bytes.")

    def extract(
        self,
        image_input: Union[str, Path, bytes],
        enable_thinking: bool = False,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> Dict[str, Any]:
        fname, fbytes, fmime = self._prepare_image_payload(image_input)
        prompt = self.load_prompt()

        data: Dict[str, Any] = {
            "message": prompt,
            "enable_thinking": "true" if enable_thinking else "false"
        }
        if temperature is not None:
            data["temperature"] = str(temperature)
        if max_tokens is not None:
            data["max_tokens"] = str(max_tokens)

        files = {
            "image": (fname, fbytes, fmime)
        }

        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.post(self.api_url, data=data, files=files)
                if resp.status_code >= 400:
                    raise VisionIndexingError(
                        f"Vision endpoint error: {resp.text}",
                        status_code=resp.status_code
                    )
                raw_json = resp.json()
                return self.sanitize_response(raw_json)
        except httpx.ConnectError:
            raise VisionIndexingError("Vision inference endpoint is unreachable.", status_code=503)
        except httpx.TimeoutException:
            raise VisionIndexingError("Vision inference request timed out.", status_code=504)
        except VisionIndexingError:
            raise
        except Exception as e:
            raise VisionIndexingError(f"Unexpected vision indexing error: {str(e)}", status_code=500)

    async def aextract(
        self,
        image_input: Union[str, Path, bytes],
        enable_thinking: bool = False,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> Dict[str, Any]:
        fname, fbytes, fmime = self._prepare_image_payload(image_input)
        prompt = self.load_prompt()

        data: Dict[str, Any] = {
            "message": prompt,
            "enable_thinking": "true" if enable_thinking else "false"
        }
        if temperature is not None:
            data["temperature"] = str(temperature)
        if max_tokens is not None:
            data["max_tokens"] = str(max_tokens)

        files = {
            "image": (fname, fbytes, fmime)
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(self.api_url, data=data, files=files)
                if resp.status_code >= 400:
                    raise VisionIndexingError(
                        f"Vision endpoint error: {resp.text}",
                        status_code=resp.status_code
                    )
                raw_json = resp.json()
                return self.sanitize_response(raw_json)
        except httpx.ConnectError:
            raise VisionIndexingError("Vision inference endpoint is unreachable.", status_code=503)
        except httpx.TimeoutException:
            raise VisionIndexingError("Vision inference request timed out.", status_code=504)
        except VisionIndexingError:
            raise
        except Exception as e:
            raise VisionIndexingError(f"Unexpected vision indexing error: {str(e)}", status_code=500)

def extract_visual_evidence(
    image_input: Union[str, Path, bytes],
    enable_thinking: bool = False,
    api_url: Optional[str] = None
) -> Dict[str, Any]:
    indexer = VisionIndexer(api_url=api_url)
    return indexer.extract(image_input=image_input, enable_thinking=enable_thinking)
