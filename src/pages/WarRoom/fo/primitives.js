import React from 'react'

/* ═══════════════════════════════════════════════════════════════
   Front Office — reusable primitives (CRA + JS + Ant Design stack).
   Small, typed-by-JSDoc components consumed by every FO page. Styles
   use the --fo-* CSS tokens from warRoom.css (no competing system).
   ═══════════════════════════════════════════════════════════════ */

// Consistent SP formatter (see master prompt). Keeps big numbers readable.
// formatSP(5500000) -> "5.5M SP"; formatSP(422300000) -> "422.3M SP"
export function formatSP(v, withUnit = true) {
  const n = typeof v === 'string' ? Number(v) : Number(v || 0)
  if (!isFinite(n)) return withUnit ? '- SP' : '-'
  const abs = Math.abs(n)
  let s
  if (abs >= 1_000_000) s = `${(n / 1_000_000).toFixed(1)}M`
  else if (abs >= 1_000) s = `${(n / 1_000).toFixed(0)}K`
  else s = `${Math.round(n).toLocaleString()}`
  return withUnit ? `${s} SP` : s
}

export const T = {
  primary: 'var(--fo-text-primary, #ECEAE3)',
  secondary: 'var(--fo-text-secondary, #9aa4b5)',
  muted: 'var(--fo-text-muted, #69748B)',
  surface: 'var(--fo-surface-1, #0A0E17)',
  border: 'var(--fo-border-subtle, rgba(233,231,223,0.08))',
  gold: 'var(--fo-gold, #F7C948)',
  green: 'var(--fo-green, #4ADE80)',
  red: 'var(--fo-red, #FF6B6B)',
  purple: 'var(--fo-purple, #8B5CF6)',
  blue: 'var(--fo-blue, #3B82F6)',
}

// Full-value accessible SamPoints label.
export function SPAmount({ value, style, className }) {
  const full = `${Math.round(Number(value || 0)).toLocaleString()} SP`
  return (
    <span className={className} title={full} aria-label={full} style={style}>
      {formatSP(value)}
    </span>
  )
}

const SPORTS = {
  nfl: { label: 'A.Football', color: T.blue },
  soccer: { label: 'Soccer', color: T.green },
}
export function SportBadge({ sport = 'nfl' }) {
  const s = SPORTS[String(sport).toLowerCase()] || SPORTS.nfl
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: s.color, background: `${s.color}18`, border: `1px solid ${s.color}44`, borderRadius: 6, padding: '2px 8px' }}>
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />{s.label}
    </span>
  )
}

const STATUS = {
  active: { c: T.green, label: 'Active' },
  pending: { c: T.gold, label: 'Pending' },
  sold: { c: T.muted, label: 'Sold' },
  cancelled: { c: T.red, label: 'Cancelled' },
  passed: { c: T.green, label: 'Passed' },
  rejected: { c: T.red, label: 'Rejected' },
  upcoming: { c: T.blue, label: 'Upcoming' },
  live: { c: T.green, label: 'Live' },
  won: { c: T.green, label: 'Won' },
  healthy: { c: T.green, label: 'Healthy' },
}
// Status conveyed by icon + text, never colour alone (a11y).
export function StatusBadge({ status = 'active', children }) {
  const s = STATUS[String(status).toLowerCase()] || { c: T.muted, label: status }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: s.c, background: `${s.c}16`, border: `1px solid ${s.c}3a`, borderRadius: 999, padding: '3px 9px' }}>
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: s.c }} />{children || s.label}
    </span>
  )
}

/**
 * MetricCard — a labelled figure with optional delta + sparkline.
 * @param {{label:string, value:React.ReactNode, delta?:string, deltaDir?:'up'|'down'|'flat', accent?:string, sub?:string, loading?:boolean}} p
 */
export function MetricCard({ label, value, delta, deltaDir = 'up', accent, sub, loading }) {
  const dc = deltaDir === 'down' ? T.red : deltaDir === 'flat' ? T.muted : T.green
  const arrow = deltaDir === 'down' ? '▼' : deltaDir === 'flat' ? '·' : '▲'
  return (
    <div style={{ background: 'linear-gradient(180deg,#0B1018,#080B12)', border: `1px solid ${T.border}`, borderRadius: 'var(--fo-r-card,16px)', padding: '16px 18px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.1, textTransform: 'uppercase', color: T.muted }}>{label}</span>
      {loading
        ? <span style={{ marginTop: 8, height: 24, width: '60%', borderRadius: 6, background: 'rgba(255,255,255,0.06)' }} className="fo-skel" />
        : <span className="fo-num" style={{ marginTop: 6, fontSize: 24, fontWeight: 700, color: accent || T.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>}
      {(delta || sub) && (
        <span style={{ marginTop: 4, fontSize: 11, color: delta ? dc : T.muted }}>{delta ? `${arrow} ${delta}` : sub}</span>
      )}
    </div>
  )
}

/**
 * QuickActionCard — icon + title + subtitle button.
 * @param {{icon:React.ReactNode,title:string,sub?:string,color?:string,onClick?:Function,disabled?:boolean}} p
 */
export function QuickActionCard({ icon, title, sub, color = T.green, onClick, disabled }) {
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} title={disabled ? 'Unavailable' : title}
      style={{ textAlign: 'left', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 'var(--fo-r-button,13px)', padding: 14, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 12, width: '100%', minWidth: 0 }}>
      <span aria-hidden style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: `${color}22` }}>{icon}</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13.5, fontWeight: 800, color: T.primary }}>{title}</span>
        {sub && <span style={{ display: 'block', fontSize: 10.5, color: T.muted }}>{sub}</span>}
      </span>
    </button>
  )
}

/**
 * EmptyState — engaging, actionable empty state (never a blank table).
 * @param {{icon?:React.ReactNode,title:string,message:string,actionLabel?:string,onAction?:Function,progressLabel?:string,progressPct?:number,accent?:string}} p
 */
export function EmptyState({ icon = '🏆', title, message, actionLabel, onAction, progressLabel, progressPct, accent = T.gold }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div aria-hidden style={{ width: 76, height: 76, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, background: `radial-gradient(circle at 50% 40%, ${accent}26, transparent 70%)`, border: `1px solid ${accent}33` }}>{icon}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: T.primary }}>{title}</div>
      <div style={{ fontSize: 13, color: T.secondary, maxWidth: 360, lineHeight: 1.5 }}>{message}</div>
      {progressPct != null && (
        <div style={{ width: 'min(320px, 80%)', marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.muted, marginBottom: 5 }}>
            <span>{progressLabel || 'Progress'}</span><span>{Math.round(progressPct)}%</span>
          </div>
          <div style={{ height: 7, borderRadius: 4, background: '#1a2030' }}><div style={{ width: `${Math.min(100, progressPct)}%`, height: '100%', borderRadius: 4, background: accent }} /></div>
        </div>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction} style={{ marginTop: 8, padding: '9px 18px', borderRadius: 10, border: 'none', background: accent, color: '#0a0a0a', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>{actionLabel}</button>
      )}
    </div>
  )
}
