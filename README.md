# DivyaDrishti (DDrishti)

**Dynamic Resource for Intelligent Search, Hosting, and Tracking Initiatives**  
*Turning scattered field photos and videos into verified evidence that sparks trust.*

🚀 **Live Deployment**: [https://ddrishti.celi.me/](https://ddrishti.celi.me/)  
🏆 **Hackathon**: Built for **Code Cubicle 6.0** | Geek Room  
👨‍💻 **Author**: Built by **Celi | Himadri Shekhar**  
📜 **License**: [MIT](./LICENSE)

---

## 🌟 What is DDrishti?

Field teams capture thousands of photos and videos across remote project sites, but finding the right evidence when donors, governments, or auditors ask is often impossible. 

**DivyaDrishti** connects ground reality to verifiable impact:
- **No folders. No guessing.** Search naturally across thousands of geotagged assets.
- **Multimodal AI Visual Indexing:** Deep semantic feature extraction and forensic analysis powered by local edge vision models.
- **Auditable Before & After Pairing:** Temporally link baseline foundation photos with commissioned infrastructure.
- **Permanent Ground Truth:** Connect every claim in an impact deck back to primary field media.

---

## 🧠 Multimodal Vision Intelligence Pipeline

DDrishti integrates an on-premise multimodal vision inference engine capable of automated forensic analysis and semantic indexing at scale.

![DDrishti AI Multimodal Vision Pipeline](./docs/images/drishti_vision_pipeline.jpg)

### AI Vision Architecture Highlights
- **Gemma 4 E4B Multimodal Integration**: Operates a quantized local vision-language backbone extracting 8-dimensional evidence signatures:
  - `tag`: Top 5 primary semantic classification tags.
  - `sdsc`: Short single-sentence visual summary.
  - `ddsc`: Comprehensive multi-sentence forensic visual description.
  - `obj`: Identified real-world entities, structures, and objects.
  - `act`: Inferred ongoing activities, operations, and human actions.
  - `scn`: Environmental scene and context classification.
  - `tim`: Lighting and time-of-day condition detection.
  - `cf`: Quantified classification confidence vector.
- **Dual-Queue Worker (`AIIndexingWorker`)**: Background execution with separate `Priority` (user-triggered) and `Standard` queues governed by a strict 2-slot concurrency gate.
- **Zero-Loss Temp Compression**: Media sent to inference is dynamically pre-compressed in RAM (82% JPEG, max 1600px edge), accelerating model processing by ~60% while leaving bucket storage media 100% pristine and unaltered.
- **Odd Queue Handling & Startup Hydration**: Auto-detects unindexed assets across project restarts and safely dispatches uneven remaining batches without stalling.

---

## 🚀 Key Features

![DDrishti AI Evidence Inspector & Dashboard](./docs/images/drishti_evidence_inspector.jpg)

### 1. Interactive Evidence Studio & Workstation
- **Fluid Widescreen Layout**: Full-bleed workstation experience utilizing 100% of available screen width, featuring a sticky `100vh` sidebar that never scrolls away or stretches with deep gallery lists.
- **Interactive Lightbox Inspector**: Dual-tab forensic drawer switching between hardware sensor EXIF metadata and rich AI Evidence details (semantic tags, quote summaries, scene details, and object lists).
- **"Force Index Now" Priority Promotion**: Jump single images straight to the front of the inference queue with real-time status feedback.
- **Live Indexing Status Bar**: Real-time progress bar docked at the bottom of the workspace calculating dynamic rolling ETA (`~Xs / ~Xm remaining`).
- **Thumbnail Status Badges**: Visual indicator pills marking items pending AI inference or containing verified GPS telemetry.

### 2. Verified Ground Truth Ledger
- **Semantic Natural-Language Search**: Query natural scenarios (*"Show me water infrastructure projects in Sikkim before and after construction"*).
- **Side-by-Side Temporal Comparison**: Synchronized visual plate inspection pairing baseline and commissioned state photos.
- **Auditable Coordinates & Metadata**: Geotagged coordinate verification ensuring provenance and ground-truth validity.

### 3. Integrated Pitch Deck & Walkthrough
- Built-in 14-slide interactive deck viewer detailing problem validation, architecture, tech stack, and execution roadmap directly from the header navigation.

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19 + Vite 8 | Reactive user interface & state management |
| **Styling & Design System** | Tailwind CSS v4 + Vanilla CSS Tokens | Widescreen fluid layout, custom design tokens |
| **Animation Engine** | Framer Motion | Fluid transitions, hero path animations |
| **Icons** | Lucide React | Clean, scalable visual iconography |
| **Backend API** | FastAPI (Python 3.11+) | Async REST endpoints & background worker coordination |
| **Vision Inference Engine** | Google Gemma 4 E4B + llama.cpp | Edge multimodal vision & forensic JSON extraction |
| **Storage & Database** | SQLite + Local Media Buckets | Relational evidence indexing & asset storage |

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+
- (Optional for AI Indexing) Docker or local llama.cpp vision server running on port 9100

### 1. Clone & Setup
```bash
git clone https://github.com/Celicular/DivyaDrishti.git
cd DivyaDrishti
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run backend API
python -m uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd ../project
npm install
npm run dev
```

### 4. Automated Windows Launch
```bash
.\run.bat
```

---

## 📚 Documentation

- [Full Pitch Deck & Product Specification (14 Slides)](./DIVYADRISHTI_PITCH_DECK.md)
- [Development Roadmap & Architecture](./UNDER_DEVELOPMENT.md)
