import { useState } from 'react'
import Dialog from './Dialog'

export default function DeckModal({ initialSlide = 1, onClose }) {
  const [activeSlide, setActiveSlide] = useState(initialSlide)
  const slides = [
    {
      num: 1,
      title: '01 / Title & Vision',
      heading: 'DivyaDrishti (DDrishti)',
      content: 'Dynamic Resource for Intelligent Search, Hosting, and Tracking Initiatives.\nTagline: FIELD MEDIA → VERIFIABLE EVIDENCE.\nBuilt for Code Cubicle 6.0 | Geek Room.',
    },
    {
      num: 2,
      title: '02 / The Field Reality',
      heading: 'Thousands of field photos. Zero verifiable structure.',
      content: 'Field teams, NGOs, and CSR partners capture massive volumes of progress photos on phones and WhatsApp.\nManual sorting hides the truth, strips EXIF sensor data, and leaves impact claims unverifiable.',
    },
    {
      num: 3,
      title: '03 / The Problem',
      heading: 'The evidence exists. Finding and proving it is broken.',
      content: '1. Lost Location & Time: Field photos lose critical GPS telemetry and timestamps in transit.\n2. Inconsistent Manual Tagging: Thousands of unorganized photos sitting in raw drives.\n3. Synthetic Media Risks: No automated check for AI-generated or tampered imagery.\n4. Disconnected Auditing: Progress reports make claims that cannot be traced to primary media.',
    },
    {
      num: 4,
      title: '04 / The Solution',
      heading: 'Meet DivyaDrishti — Upload once. Understand everything.',
      content: 'DivyaDrishti transforms raw field imagery into an auditable, geotagged, and semantically searchable evidence layer.\nDesigned specifically for ground-level project validation, CSR tracking, and transparent impact audits.',
    },
    {
      num: 5,
      title: '05 / Live Ingestion Pipeline',
      heading: 'How field media becomes verified evidence',
      content: '1. Structured Project Storage: Isolated project buckets with automated LANCZOS thumbnails.\n2. EXIF & Geolocation Parser: Extracts GPS coordinates, altitude, and device metadata.\n3. Reverse Geocoding: Resolves coordinates into verified district, street, and landmark names.\n4. Authenticity & C2PA Guard: Scans for AI-generation footprints and metadata integrity.\n5. Drishti Vision AI: Multimodal understanding of activities, objects, and environmental context.\n6. 384-dim Dense Embeddings: Converts visual intelligence into semantic vector representations.',
    },
    {
      num: 6,
      title: '06 / Explore & Semantic Search',
      heading: 'Ask your evidence — "No keywords or folders needed."',
      content: 'Search naturally in plain English: "workers watering young saplings with hose" or "community cleanup in urban forest".\nCalculates real-time cosine similarity against 384-dimensional dense semantic vectors inferred from the imagery, complete with match percentage scoring.',
    },
    {
      num: 7,
      title: '07 / Visual Similarity Discovery',
      heading: 'Instant semantic clustering across field assets',
      content: 'Discover related field activities across sites without relying on filenames or manual folders.\nVisual similarity is computed directly over the multi-attribute semantic AI vectors, grouping related evidence like tree guards, mulching, or excavation instantly.',
    },
    {
      num: 8,
      title: '08 / Telemetry & Provenance Audit',
      heading: 'Inspect every photo down to sensor and GPS telemetry',
      content: 'Interactive Lightbox inspector providing complete forensic proof:\n- Camera make, model, exposure, and ISO\n- Exact GPS coordinates with one-click Google Maps verification\n- Detected environmental tags and activity classification\n- Authenticity badge confirming real field capture vs synthetic AI.',
    },
    {
      num: 9,
      title: '09 / Coming Next: Video Analysis',
      heading: 'Up Next: Frame-by-Frame Video & Drone Intelligence',
      content: 'Expanding DivyaDrishti to ingest and index video footage from handheld devices and surveillance drones:\n- Keyframe extraction at major scene and activity transitions\n- Temporal action detection for construction, plantation, and community events\n- In-video object tracking and timestamped semantic search within video streams.',
    },
    {
      num: 10,
      title: '10 / Coming Next: Report Generation',
      heading: 'Up Next: One-Click Verifiable Impact Reports',
      content: 'Automated synthesis from field media directly into audit-grade donor and stakeholder documents:\n- Instant executive summary PDF generation with verified KPI counts\n- Synchronized Before vs After evidence plates\n- Direct clickable citation links backing every quantitative claim with primary evidence.',
    },
    {
      num: 11,
      title: '11 / Coming Next: Poster Generation',
      heading: 'Up Next: Automated Impact Posters & Campaign Creatives',
      content: 'Turn field proof into public engagement and CSR transparency assets with one click:\n- Auto-branded campaign posters featuring real verified field imagery\n- Key impact badges, GPS location tags, and partner logos\n- Export-ready formats for social media, print billboards, and stakeholder presentations.',
    },
    {
      num: 12,
      title: '12 / Future Roadmap & Research',
      heading: 'Unconfirmed Features & Research Roadmap',
      content: 'High-impact capabilities currently under evaluation:\n- Drone Flight Path & Orthomosaic Stitching: Merging aerial drone surveys with NDVI vegetation health analysis\n- Offline-First Field PWA: Mobile capture with local offline SQLite caching and background sync\n- Multi-Stakeholder Cryptographic Sign-Off: Multi-signature approval workflows before CSR fund disbursement\n- Satellite Cross-Verification: Correlating ground geotagged photos with Sentinel-2 satellite time-series data.',
    },
    {
      num: 13,
      title: '13 / Live Tech Architecture',
      heading: 'Built with modern, production-grade technology',
      content: 'Frontend: React 19, Vite, Tailwind CSS, Lucide Icons, Framer Motion\nBackend: FastAPI (Python async runtime)\nDatabase: SQLite with relational project and media schema\nStorage: Local structured project bucket storage + LANCZOS thumbnailing\nAI Core: Drishti Vision Multimodal Indexing + 384-dim Dense Semantic Embeddings\nGeospatial: Native EXIF GPS parser + Reverse Geocoding.',
    },
    {
      num: 14,
      title: '14 / The Mission',
      heading: 'The work already happened. We make it visible and provable.',
      content: 'Transforming CSR, NGO, and government project accountability from trust-based claims to verifiable, searchable evidence.\nBuilt for Code Cubicle 6.0 | Geek Room.',
    },
  ]

  const current = slides[activeSlide - 1]
  return (
    <Dialog title="The DDrishti story" onClose={onClose}>
      <div className="deck-body">
        <nav className="deck-nav" aria-label="Pitch deck slides">
          {slides.map((slide) => (
            <button
              key={slide.num}
              onClick={() => setActiveSlide(slide.num)}
              aria-current={activeSlide === slide.num ? 'step' : undefined}
            >
              {slide.title}
            </button>
          ))}
        </nav>
        <article className="deck-slide" aria-live="polite">
          <div>
            <span className="eyebrow">SLIDE {String(current.num).padStart(2, '0')} / {slides.length}</span>
            <h3>{current.heading}</h3>
            <p className="deck-content">{current.content}</p>
          </div>
          <div className="deck-controls">
            <button
              className="button"
              disabled={activeSlide === 1}
              onClick={() => setActiveSlide(activeSlide - 1)}
            >
              Previous
            </button>
            <button
              className="button"
              disabled={activeSlide === slides.length}
              onClick={() => setActiveSlide(activeSlide + 1)}
            >
              Next
            </button>
          </div>
        </article>
      </div>
    </Dialog>
  )
}