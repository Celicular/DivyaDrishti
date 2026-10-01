import { useState } from 'react'
import Dialog from './Dialog'

export default function DeckModal({ initialSlide = 1, onClose }) {
  const [activeSlide, setActiveSlide] = useState(initialSlide)
  const slides = [
    {
      num: 1,
      title: '01 / Title & Vision',
      heading: 'DivyaDrishti (DDrishti)',
      content: 'Dynamic Resource for Intelligent Search, Hosting, and Tracking Initiatives.\nTagline: FIELD MEDIA → EVIDENCE.\nBuilt for Code Cubicle 6.0 | Geek Room.',
    },
    {
      num: 2,
      title: '02 / The Hook',
      heading: 'Thousands of photos. Millions of moments. One moment that matters.',
      content: 'Finding it is still almost impossible.\nField teams capture the work.\nManual sorting hides the evidence.',
    },
    {
      num: 3,
      title: '03 / The Problem',
      heading: 'The evidence exists. Finding it doesn’t.',
      content: 'Scale: 10,000+ photos, 500+ videos, 40 locations across months of activity.\nThe Bottleneck: Manual sorting, Manual tagging, Manual reporting.\nCritical questions: "Where are the Ranchi project photos?", "Which photos prove the work happened?", "Turn all of this into a report."',
    },
    {
      num: 4,
      title: '04 / The Solution',
      heading: 'Meet DivyaDrishti — Upload once. Understand everything.',
      content: 'Scattered field media becomes searchable, verifiable evidence.\n5 Core Pillars: Understand, Organize, Search, Compare, Report.',
    },
    {
      num: 5,
      title: '05 / How It Works',
      heading: 'Raw media becomes useful evidence',
      content: '1. Upload Media (Photos & Videos)\n2. Cloudinary (Upload, store, transform)\n3. AI Analysis (Vision AI + embeddings)\n4. Metadata (Tags, location, time)\n5. Semantic Search (Find by meaning)\n6. Compare + Report (Sources stay connected)',
    },
    {
      num: 6,
      title: '06 / The WOW Feature',
      heading: 'Ask your evidence — "No folders. No guessing. Just ask."',
      content: 'Natural language search: "Show me water infrastructure projects in Jharkhand before and after construction."\nInstant Before vs. After pairing across 47 verified assets in Ramgarh & Jamshedpur.',
    },
    {
      num: 7,
      title: '07 / AI Under the Hood',
      heading: 'We don’t just store the media. We understand it.',
      content: 'Image: IMG_4821.jpg parsed for:\n- Object: Water tank\n- Activity: Installation\n- Location: Jamshedpur\n- Time: 14 June 2026\n- Project: Water Access\nCore AI pillars: Objects, Activity, Location, Search Index.',
    },
    {
      num: 8,
      title: '08 / Traceability',
      heading: 'Every insight has a source',
      content: 'Report claim: "14 water systems were installed"\nTraceability link [View Evidence →] opens 38 Photos, 7 Videos, 6 Locations, active Jan–Aug 2026.\nEvery generated statement leads back to original media.',
    },
    {
      num: 9,
      title: '09 / From Evidence to Report',
      heading: 'One click. From thousands of assets to a report.',
      content: 'Automated Impact Report:\nWater Access Initiative / 2026\n- 17 Locations\n- 843 Verified assets\n- 14 Installations\nBefore & After photo plates with project narrative.',
    },
    {
      num: 10,
      title: '10 / Who Uses It?',
      heading: 'Field work, made visible — One Shared Evidence Layer',
      content: 'NGOs: Document project progress\nGovernment: Verify field activities\nSustainability teams: Track environmental work\nDonors: See funded-project evidence\nCampaign teams: Turn real work into stories',
    },
    {
      num: 11,
      title: '11 / Tech Stack',
      heading: 'The stack behind DDrishti',
      content: 'Frontend: React + Vite, Tailwind CSS\nBackend: FastAPI, SQLite\nMedia: Cloudinary (upload, store, transform)\nVision AI: Understand the media\nEmbeddings: Search by meaning',
    },
    {
      num: 12,
      title: '12 / Why This Is Different',
      heading: 'We connect the entire evidence journey',
      content: '01 Upload → 02 Understand → 03 Organize → 04 Search → 05 Compare → 06 Verify → 07 Report.\nThe original media stays connected to the final story.',
    },
    {
      num: 13,
      title: '13 / Impact',
      heading: 'What changes?',
      content: 'BEFORE:\nThousands of files, manual tagging, manual searching, manual comparison, hours of reporting.\nWITH DIVYADRISHTI:\nCentralized media, automatic understanding, natural-language search, before/after comparison, automated reports, traceable evidence.',
    },
    {
      num: 14,
      title: '14 / Vision',
      heading: 'The work already happened. We make it visible.',
      content: 'Turn field media into proof.\nBuilt for Code Cubicle 6.0 | Geek Room.',
    },
  ]


  const current = slides[activeSlide - 1]
  return (
    <Dialog title="The DDrishti story" onClose={onClose}>
      <div className="deck-body">
        <nav className="deck-nav" aria-label="Pitch deck slides">{slides.map((slide) => <button key={slide.num} onClick={() => setActiveSlide(slide.num)} aria-current={activeSlide === slide.num ? 'step' : undefined}>{slide.title}</button>)}</nav>
        <article className="deck-slide" aria-live="polite">
          <div><span className="eyebrow">SLIDE {String(current.num).padStart(2, '0')} / 14</span><h3>{current.heading}</h3><p className="deck-content">{current.content}</p></div>
          <div className="deck-controls"><button className="button" disabled={activeSlide === 1} onClick={() => setActiveSlide(activeSlide - 1)}>Previous</button><button className="button" disabled={activeSlide === slides.length} onClick={() => setActiveSlide(activeSlide + 1)}>Next</button></div>
        </article>
      </div>
    </Dialog>
  )
}