import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Server, 
  Activity, 
  Compass, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Terminal,
  Database,
  Radio
} from 'lucide-react'

export default function App() {
  const [activeTab, setActiveTab] = useState('overview')

  const pillars = [
    {
      icon: Search,
      title: 'Intelligent Search',
      tag: 'Discovery Engine',
      description: 'Unified indexing, semantic exploration, and rapid multi-source contextual discovery across projects.',
      metrics: 'Latency < 45ms',
    },
    {
      icon: Server,
      title: 'Resource Hosting',
      tag: 'Distribution',
      description: 'Reliable environment deployment, asset storage, and resilient edge delivery pipelines.',
      metrics: 'Multi-region mesh',
    },
    {
      icon: Activity,
      title: 'Tracking Initiatives',
      tag: 'Telemetry',
      description: 'Real-time telemetry, milestone velocity tracking, and automated performance health audits.',
      metrics: 'Live stream active',
    },
  ]

  const systemStatus = [
    { label: 'Core Architecture', status: 'In Design', time: 'Active' },
    { label: 'Search Pipeline', status: 'Prototyping', time: 'Phase 1' },
    { label: 'Host Routing Mesh', status: 'Pending', time: 'Scheduled' },
    { label: 'Telemetry Daemon', status: 'WIP', time: 'Sprint 1' },
  ]

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-200 flex flex-col justify-between selection:bg-sky-900 selection:text-sky-100">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0e1422] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 font-semibold text-base shadow-sm">
              <Compass className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <span className="font-semibold text-slate-100 text-lg tracking-tight">Divya Drishti</span>
              <span className="text-xs text-slate-500 block leading-none font-mono">v0.1.0-alpha</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Development Phase</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded border border-slate-700 bg-slate-900/90 text-slate-400 text-xs font-mono">
            <Radio className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
            <span>Under Active Construction</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Divya Drishti
          </h1>

          <p className="text-xl sm:text-2xl text-slate-300 font-normal leading-relaxed">
            Dynamic Resource for Intelligent Search, Hosting, and Tracking Initiatives
          </p>

          <p className="text-base text-slate-400 max-w-2xl leading-relaxed">
            A comprehensive, high-throughput ecosystem engineered for unified project indexing, distributed asset hosting, and live milestone telemetry. We are preparing the primary platform release.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-md text-sm font-medium text-slate-200">
              <Clock className="h-4 w-4 text-amber-400" />
              <span>Platform Launch Coming Soon</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-md text-sm font-mono text-slate-400">
              <Cpu className="h-4 w-4 text-sky-400" />
              <span>Stack: React 19 • Vite • Tailwind • Framer</span>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid / Eye-Engaging Telemetry */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.12 }}
                className="rounded-lg border border-slate-800 bg-[#0e1422] p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                      {pillar.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{pillar.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{pillar.description}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Status: Pending</span>
                  <span className="text-sky-400/90">{pillar.metrics}</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Console / Status Tracker Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 rounded-lg border border-slate-800 bg-[#0b0f19] p-5"
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
              <Terminal className="h-4 w-4 text-slate-400" />
              <span className="font-semibold text-slate-300">System Initialization Feed</span>
            </div>
            <span className="text-xs font-mono text-slate-500">Live Architecture Board</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {systemStatus.map((item) => (
              <div key={item.label} className="bg-[#0e1422] border border-slate-800/80 rounded p-3">
                <div className="text-xs font-medium text-slate-400 truncate">{item.label}</div>
                <div className="mt-1 flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-semibold">{item.status}</span>
                  <span className="text-sky-400">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0e1422] px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            © 2026 Divya Drishti Contributors. Released under the MIT License.
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-mono">React 19 • Vite • Tailwind CSS • Framer Motion • Axios</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
