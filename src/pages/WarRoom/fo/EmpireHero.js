import React from 'react'
import { SPAmount, T } from './primitives'

/* EmpireHero — the signature, shared centrepiece of the Front Office.
   Matches target_front_office_design.png: welcome eyebrow, gold-accent title,
   crown art on the right, and a boxed 3x2 metric grid. Only real data flows in;
   any field without a real value renders a clean empty state (0 or '—'). */

const STADIUM = `${process.env.PUBLIC_URL || ''}/assets/hub/stadium-hero.png`

function HeroMetric({ label, value, delta, deltaDir, loading }) {
  const dc = deltaDir === 'down' ? T.red : T.green
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: T.muted, marginBottom: 5 }}>{label}</div>
      {loading
        ? <div className="fo-skel" style={{ height: 22, width: 70, borderRadius: 5, background: 'rgba(255,255,255,0.07)' }} />
        : <div className="fo-num" style={{ fontSize: 23, fontWeight: 700, color: T.primary, lineHeight: 1.05 }}>{value}</div>}
      {delta && <div style={{ fontSize: 10.5, color: dc, marginTop: 3, fontWeight: 600 }}>{deltaDir === 'down' ? '▼' : '▲'} {delta}</div>}
    </div>
  )
}

/**
 * @param {{summary?:object, loading?:boolean, onBuy?:Function, onExchange?:Function}} p
 */
export default function EmpireHero({ summary = {}, loading, onBuy, onExchange }) {
  const name = summary.name && summary.name !== 'Your Empire' ? summary.name : 'Your Empire'
  const parts = name.trim().split(' ')
  const last = parts.length > 1 ? parts.pop() : ''
  const head = parts.join(' ')

  const valueSp = summary.valueSp || 0
  const weeklyRevenueSp = summary.weeklyRevenueSp || 0
  const rank = summary.rank
  const franchiseCount = summary.franchiseCount || 0
  const championshipCount = summary.championshipCount || 0
  const winRate = summary.winRate

  const metrics = [
    { label: 'Empire Value', value: <SPAmount value={valueSp} />, delta: summary.valueDelta, deltaDir: 'up' },
    { label: 'Weekly Revenue', value: <span>+<SPAmount value={weeklyRevenueSp} /></span>, delta: summary.revenueDelta, deltaDir: 'up' },
    { label: 'Empire Rank', value: rank ? `#${rank}` : '—' },
    { label: 'Franchises', value: String(franchiseCount) },
    { label: 'Championships', value: String(championshipCount) },
    { label: 'Win Rate', value: winRate != null ? `${Math.round(winRate)}%` : '—' },
  ]

  return (
    <div className="fo-anim" style={{
      position: 'relative', overflow: 'hidden', borderRadius: 'var(--fo-r-hero,22px)',
      border: '1px solid rgba(139,92,246,0.25)', minHeight: 176,
      background: `linear-gradient(100deg, rgba(6,5,14,0.94) 0%, rgba(6,5,14,0.82) 34%, rgba(6,5,14,0.6) 62%, rgba(6,5,14,0.5) 100%), url(${STADIUM}) center 35% / cover no-repeat, #0a0713`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '24px 26px',
    }}>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 460 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: T.secondary, marginBottom: 6 }}>Welcome back,</div>
        <h1 className="fo-display" style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.0, margin: 0, color: '#fff' }}>
          {head}{last && <> <span style={{ color: T.gold }}>{last}</span></>}
        </h1>
        <p style={{ fontSize: 13.5, color: T.secondary, margin: '10px 0 16px' }}>Build, manage, and expand your sports franchise dynasty.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {franchiseCount === 0 && (
            <button onClick={onBuy} style={{ padding: '10px 22px', borderRadius: 12, border: 'none', background: T.gold, color: '#0a0a0a', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Buy Franchise</button>
          )}
          <button onClick={onExchange} style={{ padding: '10px 22px', borderRadius: 12, border: `1px solid ${T.border}`, background: 'rgba(12,19,32,0.6)', color: T.primary, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Go to Exchange</button>
        </div>
      </div>
      <div className="fo-hero-metrics" style={{ position: 'relative', zIndex: 1, minWidth: 320 }}>
        {metrics.map((m) => <HeroMetric key={m.label} loading={loading} {...m} />)}
      </div>
    </div>
  )
}
