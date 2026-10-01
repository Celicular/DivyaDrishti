import { motion } from 'framer-motion'

export default function HighlightBanner({ onOpenDeck }) {
  return (
    <section className="news-section" id="our-story">
      <div className="page-width news-layout">
        <div className="news-art" aria-hidden="true">
          <motion.div
            className="brand-bubble"
            initial={{ scale: 0.86, rotate: -4, opacity: 0 }}
            whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            whileHover={{ scale: 1.04, rotate: -1.5 }}
          >
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 4.4, ease: 'easeInOut' }}
            >
              DDrishti
            </motion.span>
            
            <svg className="bubble-fold" viewBox="0 0 80 50" fill="none">
              <path d="m6 48 36-32 27 32M42 16l8 32M29 27l7 21" stroke="currentColor" strokeWidth="1" />
            </svg>
            
            <svg className="news-thread" viewBox="0 0 200 230" fill="none">
              <motion.path
                d="M0 0v35c0 72 112 54 112 151v44"
                stroke="currentColor"
                strokeWidth="1.7"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeInOut' }}
              />
            </svg>
          </motion.div>
        </div>

        <motion.div
          className="news-copy"
          initial={{ x: 30, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eyebrow">A NEW WAY TO SEE YOUR IMPACT</span>
          <h2>Field media is now<br />verifiable evidence.</h2>
          <p>The work already happened. Discover how DDrishti makes it visible.</p>
          <motion.button
            className="button"
            onClick={() => onOpenDeck()}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          >
            Why DDrishti?
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
