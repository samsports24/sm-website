import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * HowToPlayTour — dependency-free guided spotlight tour.
 * Props: steps [{selector?,title,body,note?}], open, onClose, accent, brand
 */
export default function HowToPlayTour({ steps = [], open, onClose, accent = '#7C3AED', brand = 'How to Play' }) {
  const [idx, setIdx] = useState(0)
  const [rect, setRect] = useState(null)
  const timerRef = useRef(null)

  const measure = useCallback(() => {
    const s = steps[idx]
    if (!s || !s.selector) { setRect(null); return }
    const el = document.querySelector(s.selector)
    if (!el) { setRect(null); return }
    try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }) } catch (e) {}
    const r = el.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) { setRect(null); return }
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
  }, [steps, idx])

  useEffect(() => { if (open) setIdx(0) }, [open])

  useLayoutEffect(() => {
    if (!open) return
    measure()
    const loop = () => { measure(); timerRef.current = window.setTimeout(loop, 350) }
    timerRef.current = window.setTimeout(loop, 350)
    const on = () => measure()
    window.addEventListener('resize', on)
    window.addEventListener('scroll', on, true)
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      window.removeEventListener('resize', on)
      window.removeEventListener('scroll', on, true)
    }
  }, [open, measure])

  const close = useCallback(() => { onClose && onClose() }, [onClose])
  const next = useCallback(() => setIdx(v => (v < steps.length - 1 ? v + 1 : (close(), v))), [steps.length, close])
  const prev = useCallback(() => setIdx(v => Math.max(0, v - 1)), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close, next, prev])

  if (!open || !steps[idx]) return null
  const step = steps[idx]

  const vw = window.innerWidth
  const vh = window.innerHeight
  const cardW = Math.min(360, vw - 32)
  const cardH = 250
  const pad = 6
  const hasRect = !!rect

  const spotStyle = hasRect ? {
    position: 'fixed',
    top: rect.top - pad, left: rect.left - pad,
    width: rect.width + pad * 2, height: rect.height + pad * 2,
    borderRadius: 12, boxShadow: '0 0 0 9999px rgba(3,7,18,0.82)',
    border: `2px solid ${accent}`, zIndex: 100000, pointerEvents: 'none',
    transition: 'top .25s ease, left .25s ease, width .25s ease, height .25s ease',
  } : null

  let cardPos
  if (hasRect) {
    const rightX = rect.left + rect.width + 16
    if (rightX + cardW < vw) {
      cardPos = { top: clamp(rect.top - 8, 16, vh - cardH - 16), left: rightX }
    } else {
      const belowY = rect.top + rect.height + 14
      if (belowY + cardH < vh) cardPos = { top: belowY, left: clamp(rect.left, 16, vw - cardW - 16) }
      else cardPos = { top: clamp(rect.top - cardH - 14, 16, vh - cardH - 16), left: clamp(rect.left, 16, vw - cardW - 16) }
    }
  } else {
    cardPos = { top: vh / 2 - 130, left: vw / 2 - cardW / 2 }
  }

  const isLast = idx === steps.length - 1

  return createPortal((
    <>
      {!hasRect && <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(3,7,18,0.82)', zIndex: 99999 }} />}
      {hasRect && <div style={spotStyle} />}
      <div style={{
        position: 'fixed', top: cardPos.top, left: cardPos.left, width: cardW,
        background: '#0b1220', color: '#e5e7eb', border: `1px solid ${accent}55`,
        borderRadius: 14, padding: 18, zIndex: 100001, boxShadow: '0 20px 60px rgba(0,0,0,.55)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: accent }}>{brand}</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{idx + 1} / {steps.length}</span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{step.title}</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.5, color: '#cbd5e1' }}>{step.body}</div>
        {step.note && <div style={{ marginTop: 8, fontSize: 12, color: accent }}>{step.note}</div>}
        <div style={{ display: 'flex', gap: 6, marginTop: 14, marginBottom: 12 }}>
          {steps.map((_, k) => <span key={k} style={{ flex: 1, height: 4, borderRadius: 2, background: k <= idx ? accent : '#1f2937' }} />)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={close} style={btnGhost}>Skip</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {idx > 0 && <button onClick={prev} style={btnGhost}>Back</button>}
            <button onClick={next} style={{ ...btnSolid, background: accent }}>{isLast ? 'Finish' : 'Next'}</button>
          </div>
        </div>
      </div>
    </>
  ), document.body)
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }
const btnGhost = { background: 'transparent', color: '#9ca3af', border: '1px solid #374151', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }
const btnSolid = { color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }
