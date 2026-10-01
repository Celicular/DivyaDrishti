import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CheckCircle2 } from 'lucide-react'

export default function AskEvidenceDemo({ onOpenDeck }) {
  const [searchQuery, setSearchQuery] = useState(
    'Show me water infrastructure projects in Jharkhand before and after construction'
  )
  const [activeTab, setActiveTab] = useState('water') // 'water', 'agro'
  const [searchMessage, setSearchMessage] = useState('Explore two example projects in this interactive demo.')

  const handleSearch = (event) => {
    event.preventDefault()
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      setSearchMessage('Enter a search or choose one of the example projects below.')
      return
    }
    if (/afforest|sapling|tree|watershed|deoghar|plant|soil|agro/.test(query)) {
      setActiveTab('agro')
      setSearchMessage('Showing the community afforestation example.')
    } else if (/water|tank|jharkhand|ramgarh|construction|solar|tap/.test(query)) {
      setActiveTab('water')
      setSearchMessage('Showing the Jharkhand water infrastructure example.')
    } else {
      setSearchMessage('This prototype includes water infrastructure and afforestation examples. Choose either project below to explore its evidence.')
    }
  }

  const demoData = {
    water: {
      site: 'Swaccha Jal Yojana — Ramgarh, Jharkhand',
      beforeImg: '/images/water_before.jpg',
      afterImg: '/images/water_after.jpg',
      beforeDate: 'March 2026',
      afterDate: 'August 2026',
      beforeCaption: 'Foundation excavation & steel rebar grid',
      afterCaption: 'Completed solar water storage tank & community drinking taps',
      location: 'Ramgarh District, Jharkhand (23.6345° N, 85.5123° E)',
      infrastructure: 'Solar-Powered Elevated Water Tank & Tap Stand',
      milestone: 'Commissioned & Fully Operational',
      primaryEvidence: '38 Geotagged Photos, 7 Walkthrough Videos',
      claim: '“14 water systems were installed across 6 locations”',
    },
    agro: {
      site: 'Deoghar Watershed & Community Afforestation',
      beforeImg: '/images/water_before.jpg',
      afterImg: '/images/afforest.jpg',
      beforeDate: 'January 2026',
      afterDate: 'July 2026',
      beforeCaption: 'Baseline dry soil and survey layout',
      afterCaption: 'Community planting plots with native sapling survival',
      location: 'Deoghar & Dumka Blocks, Jharkhand (24.4826° N, 86.7001° E)',
      infrastructure: 'Terraced Watershed & Native Sapling Plots',
      milestone: 'Active Sapling Growth & Soil Stabilization',
      primaryEvidence: '32 Geotagged Photos, 5 Aerial Drone Surveys',
      claim: '“40+ community afforestation plots monitored across eastern zone”',
    },
  }

  const current = demoData[activeTab]

  return (
    <section id="ask-evidence" className="py-20 bg-[#FAF9F6] border-t border-[#EDECE6]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Heading */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12 space-y-3"
          initial={{ y: 22, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#004C3F] tracking-[-0.03em] font-heading">
            Ask your evidence
          </h2>
          <p className="text-base sm:text-lg text-[#556960] font-normal leading-relaxed">
            No folders. No guessing. Just natural language retrieval connected directly to verified primary media.
          </p>
        </motion.div>

        {/* Minimalist Search Bar (Brevo clean style) */}
        <div className="max-w-3xl mx-auto mb-10">
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-full p-2.5 sm:p-3 border border-[#D5D2C7] shadow-sm flex items-center gap-3 transition-all focus-within:border-[#004C3F] focus-within:ring-2 focus-within:ring-[#BAEF8A]"
          >
            <Search className="w-5 h-5 text-[#556960] ml-3 shrink-0" />
            
            <input
              type="text"
              aria-label="Search field evidence"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm sm:text-base font-normal text-[#1E293B] focus:outline-none"
              placeholder="Ask anything about field projects..."
            />

            <motion.button 
              type="submit"
              className="rounded-full bg-[#004C3F] hover:bg-[#063B31] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 transition-all shrink-0"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Search
            </motion.button>
          </form>
          <p role="status" className="text-center text-xs text-[#556960] mt-3">{searchMessage}</p>

          {/* Quick Query Filters */}
          <div className="mt-3 flex items-center justify-center gap-6 text-xs text-[#556960]">
            <button
              onClick={() => {
                setActiveTab('water')
                setSearchMessage('Showing the Jharkhand water infrastructure example.')
                setSearchQuery('Show me water infrastructure projects in Jharkhand before and after construction')
              }}
              className={`hover:text-[#004C3F] transition-colors ${
                activeTab === 'water' ? 'font-bold text-[#004C3F] underline underline-offset-4' : ''
              }`}
            >
              Jharkhand Water Infrastructure
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setActiveTab('agro')
                setSearchMessage('Showing the community afforestation example.')
                setSearchQuery('Afforestation sapling growth proof in Deoghar 2026')
              }}
              className={`hover:text-[#004C3F] transition-colors ${
                activeTab === 'agro' ? 'font-bold text-[#004C3F] underline underline-offset-4' : ''
              }`}
            >
              Community Afforestation & Watershed
            </button>
          </div>
        </div>

        {/* Main Evidence Studio Interface */}
        <div className="max-w-5xl mx-auto bg-white rounded-[36px] border border-[#E8E6DF] p-6 sm:p-10 shadow-lg">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#F0EEE6] gap-2">
                <div>
                  <div className="text-xs font-semibold text-[#556960] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#188f70]" /> Evidence Studio • Verified Result
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#1E293B] font-heading mt-0.5">
                    {current.site}
                  </h3>
                </div>

                <div className="text-xs text-[#556960] font-medium bg-[#F4F8F3] text-[#004C3F] px-3 py-1 rounded-full border border-[#D7E9D5]">
                  47 matching assets in vector index
                </div>
              </div>

              {/* Before & After Visual Comparison (Clean, professional, editorial) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                
                {/* Before Photo Card */}
                <motion.div
                  className="rounded-[24px] overflow-hidden border border-[#EDECE6] bg-[#FAF9F6]"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={current.beforeImg}
                      alt="Baseline site state before construction"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <div className="text-xs font-semibold text-[#8B6E2C] uppercase tracking-wider">
                      Baseline — {current.beforeDate}
                    </div>
                    <div className="text-sm font-semibold text-[#1E293B] mt-1">
                      {current.beforeCaption}
                    </div>
                  </div>
                </motion.div>

                {/* After Photo Card */}
                <motion.div
                  className="rounded-[24px] overflow-hidden border border-[#D5EAD8] bg-[#FAF9F6]"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={current.afterImg}
                      alt="Commissioned site state after construction"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <div className="text-xs font-semibold text-[#004C3F] uppercase tracking-wider">
                      Commissioned — {current.afterDate}
                    </div>
                    <div className="text-sm font-semibold text-[#1E293B] mt-1">
                      {current.afterCaption}
                    </div>
                  </div>
                </motion.div>

              </div>

              {/* Structured Ground Truth Ledger Table */}
              <motion.div
                className="mt-8 border border-[#E8E6DF] rounded-2xl overflow-hidden text-xs sm:text-sm"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="bg-[#FAF9F6] px-5 py-3 border-b border-[#E8E6DF] font-bold text-[#004C3F] font-heading">
                  Verified Ground Truth Ledger
                </div>

                <div className="divide-y divide-[#F0EEE6]">
                  <div className="grid grid-cols-1 sm:grid-cols-12 px-5 py-3.5">
                    <span className="sm:col-span-4 text-[#64748B] font-medium">GPS Location</span>
                    <span className="sm:col-span-8 text-[#1E293B] font-semibold">{current.location}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 px-5 py-3.5">
                    <span className="sm:col-span-4 text-[#64748B] font-medium">Asset Class</span>
                    <span className="sm:col-span-8 text-[#1E293B] font-semibold">{current.infrastructure}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 px-5 py-3.5">
                    <span className="sm:col-span-4 text-[#64748B] font-medium">Milestone Status</span>
                    <span className="sm:col-span-8 text-[#004C3F] font-bold">{current.milestone}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 px-5 py-3.5">
                    <span className="sm:col-span-4 text-[#64748B] font-medium">Primary Evidence Stack</span>
                    <span className="sm:col-span-8 text-[#1E293B] font-semibold">{current.primaryEvidence}</span>
                  </div>
                </div>
              </motion.div>

              {/* Auditable Claim Proof Banner */}
              <motion.div
                className="mt-6 rounded-2xl bg-[#004C3F] text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <div>
                  <div className="text-xs font-semibold text-[#BAEF8A] uppercase tracking-wider">
                    Audited Report Claim
                  </div>
                  <div className="text-base sm:text-lg font-bold font-heading mt-0.5">
                    {current.claim}
                  </div>
                </div>

                <motion.button
                  onClick={onOpenDeck}
                  className="rounded-full bg-[#BAEF8A] hover:bg-[#AEEB7A] text-[#004C3F] text-xs font-bold px-6 py-2.5 transition-all shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Inspect Audit Trail
                </motion.button>
              </motion.div>
            </motion.div>
          </AnimatePresence>

        </div>

      </div>
    </section>
  )
}
