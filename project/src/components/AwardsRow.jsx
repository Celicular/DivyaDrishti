import { motion } from 'framer-motion'
import { Code2, Cloud, ScanEye, Zap } from 'lucide-react'

const badges = [
  { title: 'Code Cubicle', detail: '6.0 HACKATHON', img: '/images/code_cubicle_logo.png', color: '#ed7961' },
  { title: 'Geek Room', detail: 'COMMUNITY', img: '/images/geekroom_logo.webp', color: '#edb955' },
  { title: 'Open source', detail: 'MIT LICENSE', Icon: Code2, color: '#ab79c6' },
  { title: 'Cloudinary', detail: 'MEDIA PIPELINE', Icon: Cloud, color: '#64b795' },
  { title: 'Vision AI', detail: 'MEDIA INSIGHTS', Icon: ScanEye, color: '#7683d4' },
  { title: 'FastAPI', detail: 'BUILT FOR SPEED', Icon: Zap, color: '#3fb4ad' },
]

export default function AwardsRow() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.11,
        delayChildren: 0.18,
      },
    },
  }

  const badgeVariants = {
    hidden: { y: 35, opacity: 0, scale: 0.86, rotate: -3 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 18,
      },
    },
  }

  return (
    <motion.section
      className="awards-section"
      id="built-with"
      initial={{ y: 65, opacity: 0.88 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="page-width">
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Built with purpose
        </motion.h2>

        <motion.div
          className="badge-row"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {badges.map(({ title, detail, img, Icon, color }) => (
            <motion.div
              className="award-badge"
              key={title}
              style={{ '--badge-color': color }}
              variants={badgeVariants}
              whileHover={{
                y: -10,
                scale: 1.08,
                rotate: [0, -2, 2, 0],
                transition: { type: 'spring', stiffness: 350, damping: 16 }
              }}
              whileTap={{ scale: 0.96 }}
            >
              <div className="badge-shield">
                {img ? (
                  <img src={img} alt="" loading="lazy" width="42" height="42" />
                ) : (
                  <Icon size={33} strokeWidth={1.6} />
                )}
                <strong>{title}</strong>
                <span>{detail}</span>
                <small>DDRISHTI</small>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
