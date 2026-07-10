/**
 * SamSports Animation Components — Framer Motion
 *
 * Reusable animated wrappers for the desktop website.
 * Install: npm install framer-motion
 *
 * Usage:
 *   import { FadeIn, SlideUp, ScaleOnHover, StaggerList } from '../Animations'
 *   <FadeIn><YourComponent /></FadeIn>
 *   <SlideUp delay={0.2}><Card /></SlideUp>
 *   <ScaleOnHover><Button /></ScaleOnHover>
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ═══════════════════════════════════════════════════════════════
//  FADE IN — Appears with opacity transition
// ═══════════════════════════════════════════════════════════════
export const FadeIn = ({ children, delay = 0, duration = 0.4, className = '', style = {} }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration, delay, ease: 'easeOut' }}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
)

// ═══════════════════════════════════════════════════════════════
//  SLIDE UP — Slides up from below with fade
// ═══════════════════════════════════════════════════════════════
export const SlideUp = ({ children, delay = 0, duration = 0.5, distance = 20, className = '', style = {} }) => (
  <motion.div
    initial={{ opacity: 0, y: distance }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -distance }}
    transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
)

// ═══════════════════════════════════════════════════════════════
//  SLIDE IN — Slides from left or right
// ═══════════════════════════════════════════════════════════════
export const SlideIn = ({ children, direction = 'left', delay = 0, duration = 0.5, distance = 30, className = '', style = {} }) => (
  <motion.div
    initial={{ opacity: 0, x: direction === 'left' ? -distance : distance }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: direction === 'left' ? -distance : distance }}
    transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
)

// ═══════════════════════════════════════════════════════════════
//  SCALE ON HOVER — Sleeper-style press/hover effect
// ═══════════════════════════════════════════════════════════════
export const ScaleOnHover = ({ children, scale = 1.03, tapScale = 0.97, className = '', style = {} }) => (
  <motion.div
    whileHover={{ scale }}
    whileTap={{ scale: tapScale }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    className={className}
    style={{ cursor: 'pointer', ...style }}
  >
    {children}
  </motion.div>
)

// ═══════════════════════════════════════════════════════════════
//  STAGGER LIST — Children animate in one by one
// ═══════════════════════════════════════════════════════════════
export const StaggerList = ({ children, stagger = 0.08, className = '', style = {} }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: {},
      visible: { transition: { staggerChildren: stagger } },
    }}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
)

export const StaggerItem = ({ children, className = '', style = {} }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 15 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    }}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
)

// ═══════════════════════════════════════════════════════════════
//  PULSE — Subtle breathing animation (for live indicators)
// ═══════════════════════════════════════════════════════════════
export const Pulse = ({ children, className = '', style = {} }) => (
  <motion.div
    animate={{ scale: [1, 1.05, 1] }}
    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
)

// ═══════════════════════════════════════════════════════════════
//  COUNTER — Animated number counting up
// ═══════════════════════════════════════════════════════════════
export const AnimatedNumber = ({ value, duration = 1, className = '', style = {}, format = (v) => Math.round(v).toLocaleString() }) => {
  const ref = React.useRef(null)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    const start = parseInt(node.textContent.replace(/[^0-9]/g, '')) || 0
    const end = typeof value === 'number' ? value : parseInt(value) || 0
    if (start === end) { node.textContent = format(end); return }

    const startTime = performance.now()
    const animate = (now) => {
      const progress = Math.min((now - startTime) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      const current = start + (end - start) * eased
      node.textContent = format(current)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value, duration, format])

  return <span ref={ref} className={className} style={style}>{format(typeof value === 'number' ? value : 0)}</span>
}

// ═══════════════════════════════════════════════════════════════
//  PAGE TRANSITION — Wrap page content for route transitions
// ═══════════════════════════════════════════════════════════════
export const PageTransition = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
)

// ═══════════════════════════════════════════════════════════════
//  CARD HOVER — Elevated card effect on hover
// ═══════════════════════════════════════════════════════════════
export const CardHover = ({ children, className = '', style = {} }) => (
  <motion.div
    whileHover={{
      y: -4,
      boxShadow: '0 8px 30px rgba(0, 255, 135, 0.1)',
      borderColor: 'rgba(0, 255, 135, 0.3)',
    }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className={className}
    style={{ cursor: 'pointer', ...style }}
  >
    {children}
  </motion.div>
)

// ═══════════════════════════════════════════════════════════════
//  ANIMATE PRESENCE WRAPPER — For conditional rendering
// ═══════════════════════════════════════════════════════════════
export { AnimatePresence }

export default {
  FadeIn,
  SlideUp,
  SlideIn,
  ScaleOnHover,
  StaggerList,
  StaggerItem,
  Pulse,
  AnimatedNumber,
  PageTransition,
  CardHover,
  AnimatePresence,
}
