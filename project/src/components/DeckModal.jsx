import { useState } from 'react'
import Dialog from './Dialog'

export default function DeckModal({ initialSlide = 1, onClose }) {
  const [activeSlide, setActiveSlide] = useState(initialSlide)
  const slides = [
    {
      num: 1,
      title: '01 / Mission & Purpose',
      heading: 'AI-Powered Media Intelligence for Field Impact',
      content: 'DivyaDrishti (DDrishti) is an enterprise-grade AI media intelligence and evidence verification platform.\n\nDesigned to understand unstructured field media, organize evidence by project, location, and timeline, and empower organizations to transform raw visual data into verifiable insights and audit-ready impact stories.\n\nFrom remote field operations to donor disclosures: turning ground truth into trusted evidence.',
    },
    {
      num: 2,
      title: '02 / The Ground Reality',
      heading: 'Thousands of photos. Zero verifiable proof.',
      content: 'Field teams and NGOs capture thousands of site photos on WhatsApp and mobile drives.\nCritical bottlenecks:\n• Lost Location & Telemetry: Stripped GPS coordinates and missing timestamps\n• Untrusted Provenance: No validation against AI manipulation or image tampering\n• Unsearchable Media: Manual tagging fails at scale\n• Unsubstantiated Reports: Claims cannot be traced back to primary evidence.',
    },
    {
      num: 3,
      title: '03 / How It Works',
      heading: 'Upload once. Understand everything.',
      content: '1. Ingest & Store: Structured project bucket architecture with automatic compression.\n2. Forensic Extraction: Automated sensor EXIF extraction (GPS, altitude, camera model).\n3. Provenance Guard: C2PA manifest & synthetic AI manipulation verification.\n4. Drishti Vision AI: Multimodal feature extraction (activities, objects, environment, quality score).\n5. Semantic Embeddings: 384-dimensional dense vectors for conceptual search.',
    },
    {
      num: 4,
      title: '04 / The Experience',
      heading: 'Ask your evidence — Natural Language & Visual Discovery',
      content: '• Semantic Explore: Search naturally ("workers watering young saplings with hose") via cosine similarity over AI-inferred dense vectors.\n• Visual Similar Clustering: Instant discovery of contextually related evidence across sites.\n• Forensic Lightbox: Direct audit trail of coordinates, map links, and AI confidence.\n• Batch Control: Instant re-indexing and bulk metadata editing.',
    },
    {
      num: 5,
      title: '05 / Roadmap & Next',
      heading: 'Closing the Loop: From Field Evidence to Impact Stories',
      content: 'What we are launching next:\n• Automated Report Generation: One-click audit-grade PDF summaries with verified media citations\n• Video & Drone Analysis: Temporal action recognition and keyframe search for field footage\n• Campaign Poster Generation: Auto-branded visual assets for public transparency and donors\n\nDivyaDrishti: The work already happened. We make it visible and provable.',
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