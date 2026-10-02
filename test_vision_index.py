import sys
import json
import argparse
from pathlib import Path

try:
    from backend.services.vision_indexer import VisionIndexer, VisionIndexingError
except ImportError:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from backend.services.vision_indexer import VisionIndexer, VisionIndexingError

def main():
    parser = argparse.ArgumentParser(description="DRISHTI Visual Evidence Extractor")
    parser.add_argument("image", nargs="?", default="test_image.jpg", help="Path to image file")
    parser.add_argument("--enable-thinking", action="store_true", help="Enable reasoning thinking tokens")
    parser.add_argument("--url", default=None, help="Vision API endpoint URL")
    args = parser.parse_args()

    root_dir = Path(__file__).resolve().parent
    image_path = Path(args.image)

    if not image_path.is_absolute():
        image_path = root_dir / image_path

    if not image_path.exists():
        candidates = (
            list(root_dir.glob("*.jpg"))
            + list(root_dir.glob("*.jpeg"))
            + list(root_dir.glob("*.png"))
            + list(root_dir.glob("*.webp"))
        )
        print(f"Error: Target image file not found at: {image_path}")
        if candidates:
            print("Found available images in root directory:")
            for c in candidates:
                print(f"  - {c.name}")
        print("\nUsage:")
        print("  python test_vision_index.py [path_to_image] [--enable-thinking] [--url URL]")
        sys.exit(1)

    indexer = VisionIndexer(api_url=args.url)

    try:
        sanitized_index = indexer.extract(
            image_input=image_path,
            enable_thinking=args.enable_thinking
        )
        print(json.dumps(sanitized_index, indent=2))
    except VisionIndexingError as e:
        print(f"Indexing Error: {e.message}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
