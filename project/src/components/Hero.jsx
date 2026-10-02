import { motion } from 'framer-motion'
import { Mail, MessagesSquare, Network, Settings, Send, MessageCircleMore } from 'lucide-react'

export default function Hero() {
  const nodeVariants = {
    hidden: { scale: 0, rotate: -15, opacity: 0 },
    visible: (i) => ({
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 280,
        damping: 18,
        delay: 0.4 + i * 0.12,
      },
    }),
  }

  const threadTransition = (delay = 0) => ({
    duration: 1.4,
    ease: [0.16, 1, 0.3, 1],
    delay,
  })

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="page-width hero-stage">
          <svg className="hero-thread" viewBox="0 0 1200 700" fill="none" aria-hidden="true">
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {/* Paper airplane with floating glide animation */}
              <motion.g
                initial={{ x: -75, y: -45, opacity: 0, rotate: -22 }}
                animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.g
                  animate={{ y: [0, -6, 0], rotate: [-1.5, 2, -1.5] }}
                  transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }}
                  style={{ transformOrigin: '77px 70px' }}
                >
                  <path d="M44 30 126 56 77 112 44 30Z" />
                  <path d="m44 30 52 44 30-18M96 74l-19 38 2-47" />
                </motion.g>
              </motion.g>

              {/* Animated thread path: draws itself smoothly on load */}
              <motion.path
                d="M96 74c25 38 48 46 91 46h357c48 0 76 26 76 76v504"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={threadTransition(0.3)}
              />
              <motion.path
                d="M96 453h453c46 0 71 27 71 76v171"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={threadTransition(0.6)}
              />
            </g>
          </svg>

          <div className="hero-copy">
            <motion.h1
              id="hero-title"
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              Field evidence that<br />sparks trust
            </motion.h1>

            <motion.p
              initial={{ y: 22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.75, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              Say hello to DDrishti — the platform that turns your field photos and videos into evidence that makes a difference.
            </motion.p>

            <motion.a
              href="/login"
              className="button"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.45 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Get DDrishti / Demo
            </motion.a>
          </div>

          <motion.div
            className="hero-photo"
            initial={{ scale: 0.92, opacity: 0, y: 25 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.018, transition: { duration: 0.3 } }}
          >
            <img
              src="/images/hero.jpg"
              alt="Two field coordinators reviewing project evidence together in a rural village"
              fetchPriority="high"
              width="1536"
              height="1024"
            />

            {/* Live evidence verification pill (comfortably inset away from the corner curve) */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.85, type: 'spring', stiffness: 240, damping: 18 }}
              whileHover={{ scale: 1.04, y: -2 }}
              style={{
                position: 'absolute',
                bottom: 'clamp(28px, 3.2vw, 48px)',
                left: 'clamp(32px, 4vw, 60px)',
                background: '#ffffff',
                color: '#004C3F',
                padding: '8px 16px',
                borderRadius: '9999px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: 'clamp(11px, 0.85vw, 13px)',
                fontWeight: 600,
                zIndex: 2,
                border: '1px solid rgba(0, 76, 63, 0.16)',
                whiteSpace: 'nowrap',
                pointerEvents: 'auto',
                userSelect: 'none',
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.35, 1], opacity: [0.75, 1, 0.75] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#188f70',
                  display: 'inline-block',
                  flexShrink: 0
                }}
              />
              Ramgarh Site • 38 Photos Verified
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="connection-section" aria-labelledby="connection-title">
        <div className="page-width connection-art" aria-hidden="true">
          {/* Animated SVG colored delta threads drawing downward when scrolled into view */}
          <svg viewBox="0 0 1200 320" fill="none" className="connection-threads">
            <motion.path
              d="M620 0c0 72-260 51-260 148v28"
              stroke="#aaa0de"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 1.1, delay: 0.05, ease: 'easeInOut' }}
            />
            <motion.path
              d="M620 0c0 92-95 104-95 190v32"
              stroke="#e9aa98"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 1.1, delay: 0.15, ease: 'easeInOut' }}
            />
            <motion.path
              d="M620 0c0 109 95 112 95 219v28"
              stroke="#8dcdcf"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 1.1, delay: 0.25, ease: 'easeInOut' }}
            />
            <motion.path
              d="M620 0c0 98 230 53 230 168v46"
              stroke="#dea3bc"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 1.1, delay: 0.35, ease: 'easeInOut' }}
            />
          </svg>

          {/* Node 1: Search */}
          <motion.div
            className="connection-node node-search"
            custom={0}
            variants={nodeVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-20px' }}
            whileHover={{ scale: 1.18, rotate: 6 }}
            animate={{ y: [0, -3.5, 0] }}
            transition={{ y: { repeat: Infinity, duration: 3.4, ease: 'easeInOut' } }}
          >
            <MessagesSquare />
            <Mail className="node-detail" />
          </motion.div>

          {/* Node 2: People */}
          <motion.div
            className="connection-node node-people"
            custom={1}
            variants={nodeVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-20px' }}
            whileHover={{ scale: 1.18, rotate: -6 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ y: { repeat: Infinity, duration: 3.8, ease: 'easeInOut', delay: 0.4 } }}
          >
            <Network />
          </motion.div>

          {/* Node 3: Verify */}
          <motion.div
            className="connection-node node-verify"
            custom={2}
            variants={nodeVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-20px' }}
            whileHover={{ scale: 1.18, rotate: 6 }}
            animate={{ y: [0, -3.5, 0] }}
            transition={{ y: { repeat: Infinity, duration: 3.6, ease: 'easeInOut', delay: 0.8 } }}
          >
            <Settings />
            <Send className="node-detail" />
          </motion.div>

          {/* Node 4: Chat */}
          <motion.div
            className="connection-node node-chat"
            custom={3}
            variants={nodeVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-20px' }}
            whileHover={{ scale: 1.18, rotate: -6 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ y: { repeat: Infinity, duration: 4.1, ease: 'easeInOut', delay: 1.2 } }}
          >
            <MessageCircleMore />
          </motion.div>
        </div>

        <motion.div
          className="section-heading"
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 id="connection-title">Wide reach<br />Close connection</h2>
          <p>The complete toolkit to turn everyday field media into lasting, verifiable impact.</p>
        </motion.div>
      </section>
    </>
  )
}
