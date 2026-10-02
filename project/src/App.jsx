import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FeatureCards from './components/FeatureCards'
import HighlightBanner from './components/HighlightBanner'
import AudienceSwitcher from './components/AudienceSwitcher'
import TrustMetrics from './components/TrustMetrics'
import AwardsRow from './components/AwardsRow'
import IntegrationsSection from './components/IntegrationsSection'
import CtaBanner from './components/CtaBanner'
import Footer from './components/Footer'
import DeckModal from './components/DeckModal'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function LandingPage() {
  const [deckSlide, setDeckSlide] = useState(null)
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
      {deckSlide !== null && <DeckModal key={deckSlide} initialSlide={deckSlide} onClose={() => setDeckSlide(null)} />}
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
