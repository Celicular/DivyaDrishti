import os
import sys
import json
import mimetypes
import argparse
from pathlib import Path
import urllib.request
import urllib.parse
import uuid


SYSTEM_PROMPT = """You are DRISHTI Vision, a strict visual evidence extractor.

Your task is to analyze ONE image and return ONE compact JSON object for a visual search index.

CORE RULE:
Describe only what is visibly supported by the image. Never guess. When something is unclear, omit it or use "unknown". An omission is better than an incorrect assumption.

DO NOT INFER:

Names or identities of people

Exact locations unless directly supported by readable text or an obvious landmark

Brands or ownership

Events, dates, occasions, causes, intentions, emotions, relationships, professions, or outcomes

Hidden objects or details outside the visible image

Describe people using visible characteristics only, such as "person in green shirt".

VISIBLE TEXT:
If readable text is visible, include it in "evd" as:
"text visible: <text>"
Do not use the text to infer anything beyond what it literally states.

OUTPUT:
Return exactly ONE JSON object and nothing else.
No markdown, no code fences, no explanations, no comments, and no extra keys.

{
"tag": [],
"sdsc": "",
"ddsc": "",
"obj": [],
"act": [],
"scn": "",
"tim": "",
"evd": [],
"cf": []
}

FIELD RULES:

tag:

Exactly 5 unique tags.

Lowercase.

Each tag should contain 1-3 words.

Use concrete, visually supported search terms.

Order from most relevant to least relevant.

Prefer specific visual concepts over generic words.

Do not use inferred identities, locations, outcomes, or abstract concepts.

sdsc:

A short semantic description useful for image search.

Maximum 25 words.

Mention the main subject, setting, and an important visible detail when possible.

Keep it factual and concise.

ddsc:

Maximum 50 words.

Describe the visible subjects, their arrangement, colors, objects, and environment.

Use only observable information.

No interpretation or inferred meaning.

obj:

List 1-10 clearly visible objects or subjects.

Use lowercase noun phrases.

Put the most prominent items first.

Do not duplicate items.

Do not include objects that are uncertain or only partially implied.

Use [] when no clear objects can be identified.

act:

List only actions visibly happening.

Examples: "walking", "planting", "digging", "carrying", "watering".

Do not use vague activities such as "working" when a specific visible action can be described.

Do not treat standing, sitting, or posing as an action unless the image clearly shows an action.

Use [] when no action is clearly visible.

scn:

Give a short description of the visible environment.

Maximum 8 words.

Examples: "outdoor field", "indoor kitchen", "urban street".

Use "unknown" when the environment cannot be determined.

tim:
Choose exactly one:
"morning", "day", "evening", "night", "unknown"

Determine this only from visible lighting or sky conditions.
Do not infer time from the type of activity.
Use "unknown" for indoor or ambiguous lighting.

evd:

2-6 short, concrete visual observations.

Maximum 12 words per observation.

Describe things that can actually be seen.

Useful observations include colors, positions, visible objects, counts, readable text, and lighting.

Do not write conclusions or interpretations.

cf:

Exactly 8 confidence values between 0.00 and 1.00.

Round to 2 decimal places.

Order:
[tag, sdsc, ddsc, obj, act, scn, tim, evd]

Confidence represents how clearly the corresponding information is supported by the image.

Use high confidence only when the visual evidence is clear.

If a field is empty, confidence should reflect that no clear information was available.

For "unknown" scn or tim, confidence must not exceed 0.60.

FALLBACK:
If the image is missing, unreadable, extremely dark, or contains no usable visual information, return:

{"tag":["unknown","unknown","unknown","unknown","unknown"],"sdsc":"unknown","ddsc":"unknown","obj":[],"act":[],"scn":"unknown","tim":"unknown","evd":[],"cf":[0,0,0,0,0,0,0,0]}

IMPORTANT:
Prioritize accurate visual observations over satisfying every field.
Never invent information just to fill the JSON.
Return the JSON object only
"""

def load_prompt():
    return SYSTEM_PROMPT.strip()

def build_multipart_formdata(fields: dict, files: dict):
    boundary = f"----WebKitFormBoundary{uuid.uuid4().hex}"
    body = bytearray()

    for field_name, value in fields.items():
        body.extend(f"--{boundary}\r\n".encode("utf-8"))
        body.extend(f'Content-Disposition: form-data; name="{field_name}"\r\n\r\n'.encode("utf-8"))
        body.extend(f"{value}\r\n".encode("utf-8"))

    for file_field, (filename, file_bytes, content_type) in files.items():
        body.extend(f"--{boundary}\r\n".encode("utf-8"))
        body.extend(f'Content-Disposition: form-data; name="{file_field}"; filename="{filename}"\r\n'.encode("utf-8"))
        body.extend(f"Content-Type: {content_type}\r\n\r\n".encode("utf-8"))
        body.extend(file_bytes)
        body.extend(b"\r\n")

    body.extend(f"--{boundary}--\r\n".encode("utf-8"))
    content_type = f"multipart/form-data; boundary={boundary}"
    return body, content_type

def main():
    parser = argparse.ArgumentParser(description="Test DRISHTI visual evidence extractor")
    parser.add_argument("image", nargs="?", default="test_image.jpg", help="Path to image file")
    parser.add_argument("--enable-thinking", action="store_true", help="Enable reasoning thinking tokens")
    args = parser.parse_args()

    root_dir = Path(__file__).resolve().parent
    image_path = Path(args.image)

    if not image_path.is_absolute():
        image_path = root_dir / image_path

    if not image_path.exists():
        candidates = list(root_dir.glob("*.jpg")) + list(root_dir.glob("*.jpeg")) + list(root_dir.glob("*.png")) + list(root_dir.glob("*.webp"))
        print(f"Error: Target image file not found at: {image_path}")
        if candidates:
            print("Found available images in root directory:")
            for c in candidates:
                print(f"  - {c.name}")
        print("\nUsage:")
        print("  python test_vision_index.py [path_to_image] [--enable-thinking]")
        sys.exit(1)

    prompt = load_prompt()
    api_url = os.getenv("VISION_API_URL", "https://ddapi.celi.me/ai/v1/vision")

    mime_type, _ = mimetypes.guess_type(str(image_path))
    if not mime_type:
        mime_type = "image/jpeg"

    with open(image_path, "rb") as f:
        image_bytes = f.read()

    print(f"Target Image: {image_path.name} ({len(image_bytes):,} bytes, {mime_type})")
    print(f"Vision Endpoint: {api_url}")
    print(f"Thinking Enabled: {args.enable_thinking}")
    print("Calling Gemma Vision model with DRISHTI visual evidence extractor prompt...")

    fields = {
        "message": prompt,
        "enable_thinking": "true" if args.enable_thinking else "false"
    }
    files = {
        "image": (image_path.name, image_bytes, mime_type)
    }

    body, content_type = build_multipart_formdata(fields, files)

    req = urllib.request.Request(
        url=api_url,
        data=body,
        headers={
            "Content-Type": content_type,
            "User-Agent": "DRISHTI-Vision-Tester/1.0"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=300) as response:
            raw_data = response.read().decode("utf-8")
            status_code = response.status

        print(f"\nResponse received (Status {status_code}):\n")
        try:
            parsed_response = json.loads(raw_data)
            output_content = parsed_response.get("response", raw_data)
            raw_llama = parsed_response.get("raw_llama")

            if raw_llama:
                print("--- RAW LLAMA ENGINE OUTPUT ---")
                print(json.dumps(raw_llama, indent=2))
                print("\n--- EXTRACTED RESPONSE ---")

            if isinstance(output_content, str):
                cleaned = output_content.strip()
                if cleaned.startswith("```json"):
                    cleaned = cleaned[7:]
                if cleaned.startswith("```"):
                    cleaned = cleaned[3:]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()

                try:
                    index_json = json.loads(cleaned)
                    print(json.dumps(index_json, indent=2))
                except json.JSONDecodeError:
                    print(output_content)
            elif isinstance(output_content, dict):
                print(json.dumps(output_content, indent=2))
            else:
                print(raw_data)

        except json.JSONDecodeError:
            print(raw_data)

    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"\nHTTP Error {e.code}: {e.reason}")
        print(f"Details: {err_msg}")
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"\nConnection Error: {e.reason}")
        sys.exit(1)
    except Exception as e:
        print(f"\nUnexpected Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
