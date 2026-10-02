import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Globe2, ChevronDown, Menu, X } from 'lucide-react'
import { getAuthToken } from '../api/auth'

export default function Navbar({ onOpenDeck }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  const isLoggedIn = !!getAuthToken()

  return (
    <header className="site-header" id="top">
      <Link className="wordmark" to="/" aria-label="DDrishti home">
        DDrishti<span>Field media. Real evidence.</span>
      </Link>
      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} id="main-navigation" aria-label="Main navigation">
        <a href="/#platform" onClick={closeMenu}>Platform <ChevronDown size={14} /></a>
        <a href="/#personas" onClick={closeMenu}>Solutions <ChevronDown size={14} /></a>
        <Link to="/login" onClick={closeMenu}>Evidence Studio</Link>
        <a href="/#integrations" onClick={closeMenu}>Integrations</a>
        <button className="mobile-deck" onClick={() => { closeMenu(); onOpenDeck() }}>Pitch deck</button>
      </nav>
      <div className="header-actions">
        <span className="locale" aria-label="Language: English, region: India"><Globe2 size={19} /></span>
        <button className="deck-link" onClick={() => onOpenDeck()}>Pitch deck</button>
        <Link to={isLoggedIn ? "/dashboard" : "/login"} className="button button-small">
          {isLoggedIn ? "Open Dashboard" : "Sign in / Demo"}
        </Link>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="main-navigation" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X /> : <Menu />}</button>
      </div>
    </header>
  )
}
