import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FeatureCards from './components/FeatureCards'
import HighlightBanner from './components/HighlightBanner'
import AskEvidenceDemo from './components/AskEvidenceDemo'
import AudienceSwitcher from './components/AudienceSwitcher'
import TrustMetrics from './components/TrustMetrics'
import AwardsRow from './components/AwardsRow'
import EvidenceJourney from './components/EvidenceJourney'
import IntegrationsSection from './components/IntegrationsSection'
import CtaBanner from './components/CtaBanner'
import Footer from './components/Footer'
import DeckModal from './components/DeckModal'
import Dialog from './components/Dialog'

export default function App() {
  const [deckSlide, setDeckSlide] = useState(null)
  const [hash, setHash] = useState(() => window.location.hash)
  const studioOpen = hash === '#ask-evidence' || hash === '#how-it-works'

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [])

  const closeStudio = () => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    setHash('')
  }
  const openDeck = (slide = 1) => setDeckSlide(slide)

  return (
    <div className="landing-page">
      <a href="#main-content" className="skip-link button">Skip to content</a>
      <Navbar onOpenDeck={openDeck} />
      <main id="main-content">
        <Hero />
        <FeatureCards />
        <HighlightBanner onOpenDeck={openDeck} />
        <AudienceSwitcher />
        <TrustMetrics />
        <div className="awards-backdrop"><AwardsRow /></div>
        <div className="integrations-backdrop"><IntegrationsSection onOpenDeck={openDeck} /></div>
        <div className="cta-backdrop"><CtaBanner /></div>
      </main>
      <Footer onOpenDeck={openDeck} />
      {studioOpen && <Dialog title="Evidence Studio" onClose={closeStudio} className="studio-dialog">
        {hash === '#how-it-works' ? <><EvidenceJourney /><AskEvidenceDemo onOpenDeck={() => openDeck(8)} /></> : <><AskEvidenceDemo onOpenDeck={() => openDeck(8)} /><EvidenceJourney /></>}
      </Dialog>}
      {deckSlide !== null && <DeckModal key={deckSlide} initialSlide={deckSlide} onClose={() => setDeckSlide(null)} />}
    </div>
  )
}
