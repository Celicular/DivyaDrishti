import { motion } from 'framer-motion'

export default function CtaBanner() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 22, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 240,
        damping: 18,
      },
    },
  }

  return (
    <motion.section
      className="cta-section"
      initial={{ y: 65, opacity: 0.88 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="section-heading"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
      >
        <motion.h2 variants={itemVariants}>Ready to get started?</motion.h2>
        <motion.p variants={itemVariants}>See your field media in a whole new way. Explore the free prototype.</motion.p>
        <motion.a
          href="#ask-evidence"
          className="button"
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        >
          Get DDrishti
        </motion.a>
      </motion.div>
    </motion.section>
  )
}
