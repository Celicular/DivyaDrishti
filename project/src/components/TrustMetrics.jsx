import { motion } from 'framer-motion'
import { Sprout, Droplets, HeartHandshake, Leaf, Landmark, Users, Images, MapPinned, GitBranch } from 'lucide-react'

const communities = [
  { name: 'Field teams', Icon: Sprout }, { name: 'Water missions', Icon: Droplets },
  { name: 'CSR partners', Icon: HeartHandshake }, { name: 'ESG teams', Icon: Leaf },
  { name: 'Government', Icon: Landmark }, { name: 'Communities', Icon: Users },
]
const metrics = [
  { value: '10,000+', caption: 'photos. One searchable archive.', label: 'Find the right evidence', Icon: Images },
  { value: '40+', caption: 'locations. A connected view.', label: 'See the bigger picture', Icon: MapPinned },
  { value: '7', caption: 'steps from field media to report.', label: 'Keep every source connected', Icon: GitBranch },
]

export default function TrustMetrics() {
  const communityContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  }

  const communityItemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 240,
        damping: 18,
      },
    },
  }

  const metricsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.16,
        delayChildren: 0.25,
      },
    },
  }

  const metricCardVariants = {
    hidden: { y: 35, opacity: 0, scale: 0.92 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 250,
        damping: 20,
      },
    },
  }

  return (
    <motion.section
      className="trust-section"
      aria-labelledby="trust-title"
      initial={{ y: 65, opacity: 0.88 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="page-width">
        <motion.div
          className="section-heading"
          initial={{ y: 22, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 id="trust-title">Big impact starts with trusted evidence</h2>
          <p>Built for the people making a difference on the ground.<br />Designed to bring their work into focus.</p>
        </motion.div>

        <motion.div
          className="community-row"
          variants={communityContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-30px' }}
        >
          {communities.map(({ name, Icon }) => (
            <motion.div
              className="community-wordmark"
              key={name}
              variants={communityItemVariants}
              whileHover={{
                scale: 1.12,
                y: -4,
                transition: { type: 'spring', stiffness: 350, damping: 18 }
              }}
            >
              <Icon strokeWidth={1.7} />
              <span>{name}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="metrics-strip"
          variants={metricsContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {metrics.map(({ value, caption, label, Icon }) => (
            <motion.div
              className="metric"
              key={value}
              variants={metricCardVariants}
              whileHover={{
                scale: 1.035,
                y: -4,
                boxShadow: '0 12px 28px rgba(72, 69, 210, 0.12)',
                transition: { type: 'spring', stiffness: 300, damping: 20 }
              }}
            >
              <motion.strong
                initial={{ scale: 0.85 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 220, damping: 14 }}
              >
                {value}
              </motion.strong>
              <p>{caption}</p>
              <span>
                <motion.span
                  whileHover={{ rotate: 15 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  style={{ display: 'inline-flex' }}
                >
                  <Icon size={21} />
                </motion.span>
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <p className="metrics-note">Designed around the scale of a field project. Explore the prototype to see how it works.</p>
      </div>
    </motion.section>
  )
}
