import { motion } from 'framer-motion'

// Geometric paper forms, solid accents, and animated vector micro-sequences.
export default function FeatureIllustration({ kind }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={`feature-illustration illustration-${kind}`} aria-hidden="true">
      <circle cx="79" cy="83" r="57" fill="currentColor" opacity=".09" />
      
      {kind === 'search' && (
        <g>
          {/* Base folder / envelope */}
          <path d="M24 67h80v66H24z" fill="#8371db" />
          <path d="m24 67 40 34 40-34M24 133l28-39m52 39L77 94" stroke="#f3eeff" strokeWidth="2" />
          
          {/* Note paper */}
          <motion.rect
            x="39" y="34" width="74" height="59" rx="9"
            fill="#fffdf6" stroke="#7561c7" strokeWidth="1.5"
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
          />
          <motion.path
            d="M51 47h37m-37 9h26"
            stroke="#b3a6e5" strokeWidth="3" strokeLinecap="round"
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
          />
          
          {/* Twinkling star */}
          <motion.path
            d="m33 15 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"
            fill="#7561c7"
            animate={{ scale: [1, 1.35, 1], rotate: [0, 45, 0] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
            style={{ transformOrigin: '33px 26px' }}
          />

          {/* Interactive Scanning Magnifying Glass */}
          <motion.g
            animate={{
              x: [0, 5, -3, 0],
              y: [0, -5, 2, 0],
              rotate: [-3, 5, -2, -3]
            }}
            transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut' }}
            style={{ transformOrigin: '105px 86px' }}
          >
            <circle cx="105" cy="86" r="25" fill="#d8cffb" stroke="#7561c7" strokeWidth="2" />
            <circle cx="105" cy="86" r="17" fill="#fffdf6" />
            <path d="m124 106 17 18" stroke="#7561c7" strokeWidth="10" strokeLinecap="round" />
            <motion.path
              d="m98 86 5 5 10-11"
              stroke="#7561c7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
            />
          </motion.g>
        </g>
      )}

      {kind === 'vision' && (
        <g>
          {/* Framed site card */}
          <rect x="53" y="34" width="82" height="78" rx="3" fill="#fff9ed" stroke="#d5a992" strokeWidth="1.5" />
          <path d="M62 98 85 69l18 19 12-12 13 22Z" fill="#efb59c" />
          
          {/* Floating sun */}
          <motion.circle
            cx="111" cy="54" r="9" fill="#ffc474"
            animate={{ scale: [1, 1.15, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut' }}
          />
          
          {/* Viewfinder brackets: breathing scan animation */}
          <motion.path
            d="M44 51V25h25m49 0h26v26m0 43v26h-26"
            stroke="#e67250"
            strokeWidth="2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }}
            style={{ transformOrigin: '87px 62px' }}
          />
          
          {/* Person / Surveyor profile silhouette */}
          <circle cx="43" cy="88" r="17" fill="#f4835d" />
          <path d="M15 140v-13c0-19 12-29 28-29s28 10 28 29v13" fill="#f4835d" />
          <path d="m69 116 23-19" stroke="#f4835d" strokeWidth="12" strokeLinecap="round" />
          
          {/* Detection target reticle */}
          <motion.g
            animate={{ scale: [1, 1.14, 1] }}
            transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut' }}
            style={{ transformOrigin: '112px 119px' }}
          >
            <circle cx="112" cy="119" r="20" fill="#fff9ed" stroke="#e67250" strokeWidth="1.5" />
            <motion.path
              d="m103 118 7 7 12-14"
              stroke="#e67250"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </motion.g>

          {/* Twinkle star */}
          <motion.path
            d="m27 25 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"
            fill="#e67250"
            animate={{ scale: [1, 1.4, 1], rotate: [0, 45, 0] }}
            transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut', delay: 0.5 }}
            style={{ transformOrigin: '27px 35px' }}
          />
        </g>
      )}

      {kind === 'compare' && (
        <g>
          {/* Card 1: Before baseline */}
          <motion.g
            animate={{ rotate: [-8, -5, -8], y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut' }}
            style={{ transformOrigin: '50px 80px' }}
          >
            <rect x="18" y="39" width="69" height="86" rx="6" fill="#fff9ed" stroke="#cd83a2" strokeWidth="1.5" />
            <path d="m26 104 18-24 15 17 10-12 13 26Z" fill="#edafc8" />
            <circle cx="47" cy="60" r="9" fill="#f6d0df" />
          </motion.g>

          {/* Card 2: After completion */}
          <motion.g
            animate={{ rotate: [7, 4, 7], y: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut', delay: 0.4 }}
            style={{ transformOrigin: '110px 90px' }}
          >
            <rect x="78" y="47" width="65" height="89" rx="6" fill="#fff9ed" stroke="#cd83a2" strokeWidth="1.5" />
            <path d="M89 112V91h11v21m4 0V76h11v36m4 0V86h11v26" fill="#d774a1" />
          </motion.g>

          {/* Cyclical Comparison Arrows */}
          <motion.path
            d="M52 28c17-17 48-14 61 1m-10-1 11 3 1-12M92 144c-18 10-39 6-50-6m10 1-12-3-1 11"
            stroke="#b95f8a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ strokeDashoffset: [0, -20] }}
            strokeDasharray="4 4"
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          />

          {/* Center compare badge */}
          <motion.g
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
            style={{ transformOrigin: '77px 88px' }}
          >
            <circle cx="77" cy="88" r="18" fill="#d774a1" />
            <path d="M67 84h18l-5-5m5 13H67l5 5" stroke="#fff9ed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>
        </g>
      )}

      {kind === 'report' && (
        <g>
          {/* Base folder */}
          <path d="m22 75 58-43 58 43v62H22Z" fill="#62b8bd" />
          
          {/* Report document gliding smoothly upwards */}
          <motion.g
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4.6, ease: 'easeInOut' }}
          >
            <path d="M44 23h57l17 17v72H44Z" fill="#fff9ed" stroke="#569b9d" strokeWidth="1.5" />
            <path d="M101 23v17h17" stroke="#569b9d" strokeWidth="1.5" />
            <path d="M57 50h41m-41 10h41m-41 10h29" stroke="#8bc6c8" strokeWidth="3" strokeLinecap="round" />
          </motion.g>

          {/* Front folder flap */}
          <path d="m22 75 58 41 58-41v62H22Z" fill="#26969d" />
          <path d="m22 137 45-36m71 36-45-36" stroke="#c7eeec" strokeWidth="1.5" />
          
          {/* Certified report seal */}
          <motion.g
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut' }}
            style={{ transformOrigin: '84px 106px' }}
          >
            <circle cx="84" cy="106" r="22" fill="#fff9ed" />
            <motion.path
              d="m73 106 8 8 16-18"
              stroke="#26969d"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </motion.g>

          {/* Twinkle star */}
          <motion.path
            d="m135 25 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"
            fill="#26969d"
            animate={{ scale: [1, 1.35, 1], rotate: [0, 45, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            style={{ transformOrigin: '135px 33px' }}
          />
        </g>
      )}
    </svg>
  )
}
