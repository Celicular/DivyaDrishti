import { Code2, ArrowUpRight } from 'lucide-react'

export default function Footer({ onOpenDeck }) {
  return (
    <footer className="site-footer">
      <div className="footer-width">
        <div className="footer-top">
          <a className="wordmark" href="#top">
            DDrishti
            <span>Field media. Real evidence.</span>
          </a>

          <nav className="footer-nav" aria-label="Footer links">
            <a href="/login">Evidence Studio</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#integrations">Integrations</a>
            <button type="button" onClick={() => onOpenDeck()} className="footer-btn">
              Pitch Deck
            </button>
            <a
              className="github-link"
              href="https://github.com/Celicular/DivyaDrishti"
              target="_blank"
              rel="noreferrer"
            >
              <Code2 size={18} />
              <span>GitHub</span>
              <ArrowUpRight size={14} />
            </a>
          </nav>
        </div>

        <div className="footer-bottom">
          <span>© 2026 DDrishti · Built for Code Cubicle 6.0</span>
          <span>Built by Celi | Himadri Shekhar</span>
          <a
            href="https://github.com/Celicular/DivyaDrishti/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
          >
            MIT License
          </a>
        </div>
      </div>
    </footer>
  )
}
