import { motion } from 'framer-motion'
import { ArrowRight, UploadCloud, Brain, FolderTree, Search, GitCompare, ShieldCheck, FileSpreadsheet } from 'lucide-react'

export default function EvidenceJourney() {
  const steps = [
    { num: '01', title: 'Upload', desc: 'Raw photos and walkthrough videos from field coordinators.', icon: UploadCloud },
    { num: '02', title: 'Understand', desc: 'Vision AI extracts objects, infrastructure types, and activities.', icon: Brain },
    { num: '03', title: 'Organize', desc: 'Auto-clustering by block, district, GPS cluster, and milestone.', icon: FolderTree },
    { num: '04', title: 'Search', desc: 'Natural-language semantic vector query across 10,000+ files.', icon: Search },
    { num: '05', title: 'Compare', desc: 'Temporal correlation pairs baseline foundation with completion.', icon: GitCompare },
    { num: '06', title: 'Verify', desc: 'Tamper-evident primary ledger backs all field progress claims.', icon: ShieldCheck },
    { num: '07', title: 'Report', desc: 'One-click donor impact decks with direct source-linked citations.', icon: FileSpreadsheet },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.09,
        delayChildren: 0.15,
      },
    },
  }

  const stepVariants = {
    hidden: { y: 28, opacity: 0, scale: 0.94 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
  }

  return (
    <section id="how-it-works" className="py-20 bg-[#FAF9F5] border-t border-[#E8E6DF]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Heading */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16 space-y-3"
          initial={{ y: 22, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#004C3F]">
            <span>From field to impact</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#004C3F] tracking-tight font-heading">
            We connect the entire evidence journey
          </h2>

          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            The original media stays permanently connected to the final story.
          </p>
        </motion.div>

        {/* 7-Step Horizontal / Responsive Flow */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.num}
                className="bg-white border border-[#E2DFD2] rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#004C3F] hover:shadow-lg transition-colors relative group"
                variants={stepVariants}
                whileHover={{
                  y: -7,
                  scale: 1.025,
                  transition: { type: 'spring', stiffness: 350, damping: 20 }
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-[#004C3F] bg-[#E8F8E5] px-2 py-0.5 rounded">
                      {step.num}
                    </span>
                    <Icon className="w-4 h-4 text-[#64748B] group-hover:text-[#004C3F] transition-colors" />
                  </div>

                  <h3 className="text-base font-bold text-[#1E293B] font-heading mb-1.5">
                    {step.title}
                  </h3>

                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-[#004C3F]">
                  <span>Step {step.num}</span>
                  {index < steps.length - 1 && (
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: index * 0.2 }}
                      className="hidden lg:block"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#004C3F]" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Value Proposition Callout */}
        <motion.div
          className="mt-12 bg-white rounded-3xl border border-[#E2DFD2] p-8 text-center max-w-4xl mx-auto shadow-sm"
          initial={{ y: 25, opacity: 0, scale: 0.97 }}
          whileInView={{ y: 0, opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
        >
          <p className="text-base sm:text-lg font-bold text-[#004C3F] font-heading">
            “Scattered field media becomes searchable, verifiable evidence.”
          </p>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Eliminates lost context between ground survey teams, regional offices, and international funders.
          </p>
        </motion.div>

      </div>
    </section>
  )
}
