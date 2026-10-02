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
- **Auditable Before & After Pairing:** Temporally link baseline foundation photos with commissioned infrastructure.
- **Permanent Ground Truth:** Connect every claim in an impact deck back to primary field media.

---

## 🚀 Current Updates & Features

- **Live Production App**: Deployed at [https://ddrishti.celi.me/](https://ddrishti.celi.me/).
- **Interactive Evidence Studio**:
  - Semantic natural-language query testing (*"Show me water infrastructure projects in Jharkhand before and after construction"*).
  - Side-by-side temporal visual plate comparison with GPS metadata and commissioned status.
  - Verified Ground Truth Ledger documenting coordinates, asset classes, and primary media counts.
- **7-Step Evidence Journey**:
  - Horizontal workflow from raw capture to one-click donor impact reporting (`Upload` → `Understand` → `Organize` → `Search` → `Compare` → `Verify` → `Report`).
- **Interactive Pitch Deck**:
  - Built-in 14-slide comprehensive deck viewer covering problem validation, architecture, tech stack, and roadmap (accessible from the header/footer and keyboard navigation).
- **Choreographed Animation Sequences**:
  - Fluid Framer Motion transitions with SVG path drawing, gliding hero airplane, interactive pastel feature cards, and staggered reveals on stacked end-sections.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + Vite 8 |
| **Styling & Design System** | Tailwind CSS v4 + Vanilla CSS Design Tokens |
| **Typography** | Bricolage Grotesque (Headings) + Plus Jakarta Sans (Body) |
| **Animation Engine** | Framer Motion |
| **Icons** | Lucide React |
| **Routing / Modals** | Native Dialog + State sync |
| **Media Architecture** | Cloudinary pipeline (specified in deck spec) |
| **Backend Architecture** | FastAPI + SQLite + Semantic Embeddings |

---

## 💻 Getting Started Locally

```bash
# Clone the repository
git clone https://github.com/Celicular/DivyaDrishti.git
cd DivyaDrishti/project

# Install dependencies
npm install

# Start local development server
npm run dev

# Or start both backend and frontend automatically (Windows):
.\run.bat
```

---

## 📚 Documentation

- [Full Pitch Deck & Product Specification (14 Slides)](./DIVYADRISHTI_PITCH_DECK.md)
- [Development Roadmap & Architecture](./UNDER_DEVELOPMENT.md)
