import { motion } from 'framer-motion'
import { Atom, Cloud, Code2, Database, Flame, Globe2, HardDrive, MapPin, MessageCircle, Triangle, Wind, Zap } from 'lucide-react'

const integrations = [
  { name: 'Cloudinary', Icon: Cloud }, { name: 'FastAPI', Icon: Zap }, { name: 'React', Icon: Atom },
  { name: 'SQLite', Icon: Database }, { name: 'Python', Icon: Code2 }, { name: 'WhatsApp', Icon: MessageCircle },
  { name: 'Google Drive', Icon: HardDrive }, { name: 'QGIS', Icon: MapPin }, { name: 'Tailwind', Icon: Wind },
  { name: 'PyTorch', Icon: Flame }, { name: 'GeoJSON', Icon: Globe2 }, { name: 'Vite', Icon: Triangle },
]

export default function IntegrationsSection({ onOpenDeck }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.15,
      },
    },
  }

  const logoVariants = {
    hidden: { y: 25, opacity: 0, scale: 0.86 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 18,
      },
    },
  }

  return (
    <motion.section
      className="integrations-section"
      id="integrations"
      initial={{ y: 65, opacity: 0.88 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="section-heading page-width"
        initial={{ y: 22, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2>DDrishti connects to the tools you<br className="desktop-break" /> already use</h2>
        <p>A connected home for field capture, media, and intelligence.<br />Built around familiar tools and open platforms.</p>
      </motion.div>

      <motion.div
        className="integration-logos"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
      >
        {integrations.map(({ name, Icon }) => (
          <motion.div
            className={`integration-logo logo-${name.toLowerCase().replace(' ', '-')}`}
            key={name}
            variants={logoVariants}
            whileHover={{
              y: -6,
              scale: 1.1,
              transition: { type: 'spring', stiffness: 380, damping: 18 }
            }}
            whileTap={{ scale: 0.96 }}
          >
            <Icon strokeWidth={1.8} />
            <span>{name}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        className="button"
        onClick={() => onOpenDeck(11)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      >
        Explore the integrations
      </motion.button>
    </motion.section>
  )
}
