import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import FeatureIllustration from './FeatureIllustration'

const features = [
  { kind: 'search', title: 'Search Platform', tagline: 'Smart questions. Meaningful answers.', description: 'Find the right moment in thousands of photos. Just ask in your own words.' },
  { kind: 'vision', title: 'Vision Intelligence', tagline: 'Your media, understood.', description: 'Turn field photos into useful insights with automatic tags, locations, and milestones.' },
  { kind: 'compare', title: 'Temporal Compare', tagline: 'Real progress, in the picture.', description: 'Connect before and after moments to see how your projects are making a difference.' },
  { kind: 'report', title: 'Auditable Reporting', tagline: 'Every story, backed by evidence.', description: 'Create impact reports with a direct connection to the original photos and videos.' },
]

export default function FeatureCards() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { y: 40, opacity: 0, scale: 0.96 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 240,
        damping: 22,
      },
    },
  }

  return (
    <section id="platform" className="features-section page-width" aria-label="Explore the DDrishti platform">
      <motion.div
        className="feature-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {features.map((feature) => (
          <motion.a
            key={feature.kind}
            className={`feature-card feature-${feature.kind}`}
            href="/login"
            variants={cardVariants}
            whileHover={{
              y: -8,
              scale: 1.018,
              transition: { type: 'spring', stiffness: 350, damping: 22 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <FeatureIllustration kind={feature.kind} />
            <div className="feature-copy">
              <h3>{feature.title}</h3>
              <p className="feature-tagline">{feature.tagline}</p>
              <p>{feature.description}</p>
              <motion.span
                className="text-link"
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                Find out more <ArrowRight size={16} />
              </motion.span>
            </div>
          </motion.a>
        ))}
      </motion.div>
    </section>
  )
}
