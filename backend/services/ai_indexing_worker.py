import io
import math
import time
import asyncio
from pathlib import Path
from collections import deque
from typing import Optional, Dict, Any, List, Set, Tuple
from PIL import Image

try:
    from backend.config import BUCKETS_DIR, STORAGE_DIR, EXTERNAL_AI_URL
    from backend.database import (
        save_image_ai_inference,
        get_unindexed_media_assets,
        get_project_indexing_counts,
        get_media_asset_by_id
    )
    from backend.services.vision_indexer import VisionIndexer, VisionIndexingError, DEFAULT_FALLBACK_INDEX
    from backend.services.embedding_service import get_embedding_engine
except ImportError:
    from config import BUCKETS_DIR, STORAGE_DIR, EXTERNAL_AI_URL
    from database import (
        save_image_ai_inference,
        get_unindexed_media_assets,
        get_project_indexing_counts,
        get_media_asset_by_id
    )
    from services.vision_indexer import VisionIndexer, VisionIndexingError, DEFAULT_FALLBACK_INDEX
    from services.embedding_service import get_embedding_engine

def prepare_compressed_inference_bytes(image_path: Path, max_dimension: int = 1600, quality: int = 82) -> bytes:
    with Image.open(image_path) as img:
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        elif img.mode != "RGB":
            img = img.convert("RGB")

        w, h = img.size
        if max(w, h) > max_dimension:
            img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

        output_buffer = io.BytesIO()
        img.save(output_buffer, format="JPEG", quality=quality, optimize=True)
        return output_buffer.getvalue()

class AIIndexingWorker:
    def __init__(self, concurrency: int = 2):
        self.concurrency = concurrency
        self.priority_queue: deque = deque()
        self.normal_queue: deque = deque()
        self.queued_ids: Set[int] = set()
        self.currently_indexing_ids: Set[int] = set()
        self.lock = asyncio.Lock()
        self.wakeup_event = asyncio.Event()
        self.running = False
        self.worker_task: Optional[asyncio.Task] = None
        self.rolling_mean_batch_seconds: float = 8.0
        self.vision_indexer = VisionIndexer()
        self.retry_counts: Dict[int, int] = {}
        self.subscribers: Set[asyncio.Queue] = set()

    def _resolve_image_path(self, project_id: int, file_name: str) -> Optional[Path]:
        candidates = [
            BUCKETS_DIR / f"project_{project_id}" / "main" / file_name,
            STORAGE_DIR / f"project_{project_id}" / "main" / file_name,
            BUCKETS_DIR / file_name,
            STORAGE_DIR / file_name
        ]
        for path in candidates:
            if path.exists() and path.is_file():
                return path
        return None

    async def broadcast_event(self, event_data: Dict[str, Any]) -> None:
        stale_subscribers = []
        for sub in list(self.subscribers):
            try:
                sub.put_nowait(event_data)
            except asyncio.QueueFull:
                stale_subscribers.append(sub)
        for stale in stale_subscribers:
            self.subscribers.discard(stale)

    async def register_subscriber(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue(maxsize=100)
        self.subscribers.add(q)
        return q

    def remove_subscriber(self, q: asyncio.Queue) -> None:
        self.subscribers.discard(q)

    async def enqueue_image(self, image_id: int, project_id: int, file_name: str, is_priority: bool = False) -> None:
        async with self.lock:
            if image_id in self.currently_indexing_ids:
                return

            if is_priority:
                if image_id in self.queued_ids:
                    self.normal_queue = deque([item for item in self.normal_queue if item["image_id"] != image_id])
                self.priority_queue.appendleft({"image_id": image_id, "project_id": project_id, "file_name": file_name})
                self.queued_ids.add(image_id)
            else:
                if image_id not in self.queued_ids:
                    self.normal_queue.append({"image_id": image_id, "project_id": project_id, "file_name": file_name})
                    self.queued_ids.add(image_id)

        self.wakeup_event.set()

    async def force_index_image(self, image_id: int, project_id: int, file_name: Optional[str] = None) -> bool:
        resolved_file = file_name
        if not resolved_file:
            asset = get_media_asset_by_id(image_id)
            if asset:
                resolved_file = asset.get("file_name")

        if not resolved_file:
            return False

        await self.enqueue_image(image_id=image_id, project_id=project_id, file_name=resolved_file, is_priority=True)
        return True

    async def batch_reindex_images(self, assets: List[Dict[str, Any]]) -> int:
        enqueued_count = 0
        for asset in assets:
            await self.enqueue_image(
                image_id=asset["id"],
                project_id=asset["project_id"],
                file_name=asset["file_name"],
                is_priority=True
            )
            enqueued_count += 1
        self.wakeup_event.set()
        return enqueued_count

    async def hydrate_unindexed_from_db(self, project_id: Optional[int] = None) -> int:
        unindexed = get_unindexed_media_assets(project_id)
        enqueued_count = 0
        for asset in unindexed:
            img_id = asset["id"]
            p_id = asset["project_id"]
            fname = asset["file_name"]
            await self.enqueue_image(image_id=img_id, project_id=p_id, file_name=fname, is_priority=False)
            enqueued_count += 1
        return enqueued_count

    def get_status(self, project_id: int) -> Dict[str, Any]:
        counts = get_project_indexing_counts(project_id)
        total = counts["total"]
        indexed = counts["indexed"]
        pending = counts["pending"]

        current_for_proj = [
            img_id for img_id in self.currently_indexing_ids
        ]

        is_indexing = len(current_for_proj) > 0 or any(
            t["project_id"] == project_id for t in self.priority_queue
        ) or any(
            t["project_id"] == project_id for t in self.normal_queue
        )

        remaining_batches = math.ceil(pending / self.concurrency) if pending > 0 else 0
        est_seconds = round(remaining_batches * self.rolling_mean_batch_seconds)

        return {
            "is_indexing": is_indexing,
            "total_images": total,
            "indexed_count": indexed,
            "pending_count": pending,
            "currently_indexing": current_for_proj,
            "estimated_remaining_seconds": est_seconds
        }

    async def _process_single_image(self, task: Dict[str, Any]) -> None:
        image_id = task["image_id"]
        project_id = task["project_id"]
        file_name = task["file_name"]

        image_path = self._resolve_image_path(project_id, file_name)
        if not image_path:
            save_image_ai_inference(
                project_id=project_id,
                image_id=image_id,
                ai_data=DEFAULT_FALLBACK_INDEX
            )
            await self.broadcast_event({
                "type": "indexing_failed",
                "image_id": image_id,
                "project_id": project_id,
                "error": "File not found on disk"
            })
            return

        try:
            compressed_bytes = await asyncio.to_thread(prepare_compressed_inference_bytes, image_path)
            extracted_data = await self.vision_indexer.aextract(
                image_input=compressed_bytes,
                enable_thinking=False
            )
            try:
                engine = get_embedding_engine()
                passage = engine.build_evidence_passage(extracted_data)
                vector = await asyncio.to_thread(engine.generate_embedding, passage)
                extracted_data["embedding"] = vector
            except Exception:
                extracted_data["embedding"] = None

            save_image_ai_inference(
                project_id=project_id,
                image_id=image_id,
                ai_data=extracted_data
            )
            await self.broadcast_event({
                "type": "indexed",
                "image_id": image_id,
                "project_id": project_id,
                "data": extracted_data
            })
        except VisionIndexingError as e:
            retries = self.retry_counts.get(image_id, 0)
            if retries < 2 and e.status_code in (503, 504):
                self.retry_counts[image_id] = retries + 1
                await asyncio.sleep(5.0)
                await self.enqueue_image(image_id, project_id, file_name, is_priority=False)
        except Exception as exc:
            await self.broadcast_event({
                "type": "indexing_failed",
                "image_id": image_id,
                "project_id": project_id,
                "error": str(exc)
            })

    async def _worker_loop(self) -> None:
        while self.running:
            tasks_to_process: List[Dict[str, Any]] = []

            async with self.lock:
                while len(tasks_to_process) < self.concurrency:
                    if self.priority_queue:
                        task = self.priority_queue.popleft()
                        self.queued_ids.discard(task["image_id"])
                        tasks_to_process.append(task)
                        self.currently_indexing_ids.add(task["image_id"])
                    elif self.normal_queue:
                        task = self.normal_queue.popleft()
                        self.queued_ids.discard(task["image_id"])
                        tasks_to_process.append(task)
                        self.currently_indexing_ids.add(task["image_id"])
                    else:
                        break

            if not tasks_to_process:
                self.wakeup_event.clear()
                try:
                    await asyncio.wait_for(self.wakeup_event.wait(), timeout=5.0)
                except asyncio.TimeoutError:
                    pass
                continue

            batch_start = time.time()
            try:
                if len(tasks_to_process) == 1:
                    await self._process_single_image(tasks_to_process[0])
                else:
                    await asyncio.gather(
                        *[self._process_single_image(t) for t in tasks_to_process],
                        return_exceptions=True
                    )
            finally:
                batch_duration = max(1.0, time.time() - batch_start)
                normalized_duration = (
                    batch_duration * 1.3
                    if len(tasks_to_process) == 1 and self.concurrency > 1
                    else batch_duration
                )
                self.rolling_mean_batch_seconds = round(
                    0.3 * normalized_duration + 0.7 * self.rolling_mean_batch_seconds,
                    2
                )
                async with self.lock:
                    for t in tasks_to_process:
                        self.currently_indexing_ids.discard(t["image_id"])

                await self.broadcast_event({
                    "type": "batch_completed",
                    "processed_count": len(tasks_to_process)
                })

    def start(self) -> None:
        if not self.running:
            self.running = True
            self.worker_task = asyncio.create_task(self._worker_loop())

    async def stop(self) -> None:
        self.running = False
        self.wakeup_event.set()
        if self.worker_task:
            try:
                await asyncio.wait_for(self.worker_task, timeout=5.0)
            except (asyncio.TimeoutError, asyncio.CancelledError):
                pass
            self.worker_task = None

_indexing_worker_instance: Optional[AIIndexingWorker] = None

def get_indexing_worker() -> AIIndexingWorker:
    global _indexing_worker_instance
    if _indexing_worker_instance is None:
        _indexing_worker_instance = AIIndexingWorker(concurrency=2)
    return _indexing_worker_instance
