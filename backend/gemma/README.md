# Gemma 4 E4B Multimodal Inference API

Standalone FastAPI gateway that wraps llama.cpp's OpenAI-compatible server for Gemma 4 E4B Q4 GGUF multimodal inference.

## Architecture

```text
Client (Web / Mobile / Scripts)
  │
  │ HTTP POST :13795 (Bearer / X-API-Key)
  ▼
FastAPI Gateway (:13795)

  │
  │ Internal HTTP (:9100)
  ▼
llama.cpp Server (:9100)
  │
  ▼
gemma_models volume (/models/gemma-4-e4b)
  ├── model.gguf
  └── mmproj.gguf
```

## Setup & Model Download

The service is configured to **automatically download** the Gemma 4 E4B INT4 model (`gemma-4-E4B_q4_0-it.gguf`) and its multimodal projector directly from Hugging Face on initial launch into the persistent `gemma_models` volume.

### 1. Add Your Hugging Face Token in `.env`
Because Google Gemma models are gated on Hugging Face:
1. Accept the model license on Hugging Face: [google/gemma-4-E4B-it-qat-q4_0-gguf](https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-gguf)
2. Generate an Access Token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. Set your token in `.env`:
   ```env
   HF_TOKEN=hf_your_token_here
   ```

### 2. Start the Service
```bash
docker compose up -d
```
On initial launch, `llama.cpp` will download the model weights directly into the persistent `gemma_models` volume. Once downloaded, the model is permanently cached and will start instantly on subsequent restarts.


## API Key Authentication

Set your secret in `.env`:
```env
GEMMA_API_KEY_SECRET=your_secret_key_here
```

### Generate Key via CLI
```bash
python gemma/generate_key.py
```

### Generate Key via API
```bash
curl -X POST http://localhost:13795/v1/auth/key \
  -H "Content-Type: application/json" \
  -d '{"secret": "your_secret_key_here"}'
```

### Send Requests with Key
Clients can provide the key using either header:
- `Authorization: Bearer <API_KEY>`
- `X-API-Key: <API_KEY>`

## Endpoints

### 1. Healthcheck
```bash
curl http://localhost:13795/health
```

### 2. Text Chat (`POST /v1/chat`)
```bash
curl -X POST http://localhost:13795/v1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <API_KEY>" \
  -d '{
    "message": "Explain quantum computing in simple terms.",
    "temperature": 0.7,
    "max_tokens": 1024
  }'
```

### 3. Streaming Chat (`POST /v1/chat/stream`)
```bash
curl -N -X POST http://localhost:13795/v1/chat/stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <API_KEY>" \
  -d '{
    "message": "Tell me a short story."
  }'
```

### 4. Multimodal Vision (`POST /v1/vision`)
```bash
curl -X POST http://localhost:13795/v1/vision \
  -H "Authorization: Bearer <API_KEY>" \
  -F "image=@photo.jpg" \
  -F "message=Describe what is happening in this image."
```

### 5. Structured JSON Output (`POST /v1/json`)
```bash
curl -X POST http://localhost:13795/v1/json \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <API_KEY>" \
  -d '{
    "message": "Extract items from receipt: 2 apples $3, 1 bread $2",
    "schema": {
      "type": "object",
      "properties": {
        "items": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": {"type": "string"},
              "price": {"type": "number"}
            },
            "required": ["name", "price"]
          }
        },
        "total": {"type": "number"}
      },
      "required": ["items", "total"]
    }
  }'
```
