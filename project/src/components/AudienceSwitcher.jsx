import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const audiences = [
  { id: 'ngos', name: 'NGOs & Field Teams', quote: 'Our teams upload their field photos once. Every water tank, every milestone, every before-and-after story is finally in one place.', author: 'NGOs & field teams', image: '/images/director.jpg' },
  { id: 'govt', name: 'Government Missions', quote: 'From remote villages to district offices, connect completion reports to the photos and locations that show the work on the ground.', author: 'Government & rural development', image: '/images/water_after.jpg' },
  { id: 'sustainability', name: 'Sustainability & ESG', quote: 'Follow sapling growth, watershed restoration, and community projects. Keep the original evidence connected to every impact story.', author: 'Sustainability & ESG teams', image: '/images/afforest.jpg' },
  { id: 'donors', name: 'Donors & CSR Funds', quote: 'Go beyond the quarterly report. Follow a project’s story all the way back to the field photos and videos behind it.', author: 'Donors & CSR partners', image: '/images/water_after.jpg' },
  { id: 'media', name: 'Media & Campaigns', quote: 'Spend less time hunting through shared folders and more time telling stories. Find the moments that make your impact visible.', author: 'Media & campaign teams', image: '/images/hero.jpg' },
]

export default function AudienceSwitcher() {
  const [activeId, setActiveId] = useState('ngos')
  const current = audiences.find((audience) => audience.id === activeId)

  return (
    <section id="personas" className="audience-section page-width">
      <div className="audience-copy">
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Everyone builds trust<br />with DDrishti
        </motion.h2>

        <div className="audience-tabs" role="tablist" aria-label="Who uses DDrishti" aria-orientation="vertical">
          {audiences.map((item, index) => {
            const isSelected = item.id === activeId
            return (
              <button
                key={item.id}
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={isSelected}
                aria-controls="audience-story"
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveId(item.id)}
                onKeyDown={(event) => {
                  let next
                  if (event.key === 'ArrowDown') next = (index + 1) % audiences.length
                  if (event.key === 'ArrowUp') next = (index - 1 + audiences.length) % audiences.length
                  if (event.key === 'Home') next = 0
                  if (event.key === 'End') next = audiences.length - 1
                  if (next !== undefined) {
                    event.preventDefault()
                    setActiveId(audiences[next].id)
                    document.getElementById(`tab-${audiences[next].id}`).focus()
                  }
                }}
              >
                {isSelected && (
                  <motion.span
                    initial={{ x: -6, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    <ArrowRight size={21} />
                  </motion.span>
                )}
                {item.name}
              </button>
            )
          })}
        </div>

        <motion.a
          href="#ask-evidence"
          className="button"
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Explore a field story
        </motion.a>
      </div>

      <div className="audience-story" id="audience-story" role="tabpanel" aria-labelledby={`tab-${activeId}`} tabIndex={0}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            <blockquote className="quote-bubble">
              <p>“{current.quote}”</p>
              <svg className="quote-thread" viewBox="0 0 180 200" fill="none" aria-hidden="true">
                <motion.path
                  d="M180 0v54c0 72-125 43-125 115v31"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.85, ease: 'easeInOut' }}
                />
              </svg>
            </blockquote>

            <motion.figure
              className="story-portrait"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.img
                src={current.image}
                alt={`Field impact: ${current.author}`}
                loading="lazy"
                width="360"
                height="260"
                whileHover={{ scale: 1.035, transition: { type: 'spring', stiffness: 300 } }}
              />
              <figcaption>{current.author}</figcaption>
            </motion.figure>
            <span className="story-note">An illustration of what’s possible</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
