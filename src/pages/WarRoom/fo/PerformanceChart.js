import React from 'react'
import { formatSP, T } from './primitives'

/* Empire performance / treasury / analytics chart.
   Dependency-free inline SVG (the server build pipeline doesn't run
   `npm install`, so we avoid an external charting dep). Same props as before. */

/**
 * @param {{data:{label:string,value:number}[], color?:string, height?:number, ariaLabel?:string}} p
 */
export default function PerformanceChart({ data = [], color = '#4ADE80', height = 220, ariaLabel = 'Empire performance over time' }) {
  const [hover, setHover] = React.useState(null)
  if (!data.length) {
    return <div role="img" aria-label="No performance data yet" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: 13 }}>No performance data yet.</div>
  }
  const W = 600, H = height, padL = 44, padR = 10, padT = 12, padB = 26
  const vals = data.map((d) => d.value)
  const min = Math.min(...vals, 0)
  const max = Math.max(...vals, 1)
  const span = max - min || 1
  const iw = W - padL - padR
  const ih = H - padT - padB
  const x = (i) => padL + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw)
  const y = (v) => padT + ih - ((v - min) / span) * ih
  const pts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ')
  const area = `${padL},${padT + ih} ${pts} ${padL + iw},${padT + ih}`
  const gid = `fograd-${color.replace('#', '')}`
  const yTicks = [max, min + span / 2, min]

  return (
    <div role="img" aria-label={ariaLabel} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: 'block' }} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="rgba(233,231,223,0.06)" />
            <text x={padL - 6} y={y(v) + 3} textAnchor="end" fontSize="9" fill={T.muted}>{formatSP(v, false)}</text>
          </g>
        ))}
        <polygon points={area} fill={`url(#${gid})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <g key={i}>
            {hover === i && <circle cx={x(i)} cy={y(d.value)} r="3.5" fill={color} />}
            <rect x={x(i) - iw / (2 * data.length)} y={padT} width={iw / data.length} height={ih} fill="transparent" onMouseEnter={() => setHover(i)} />
          </g>
        ))}
        {data.length <= 12 && data.map((d, i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="9" fill={T.muted}>{d.label}</text>
        ))}
      </svg>
      {hover != null && (
        <div style={{ fontSize: 12, color: T.secondary, marginTop: 2 }}>
          {data[hover].label}: <b style={{ color }}>{formatSP(data[hover].value)}</b>
        </div>
      )}
    </div>
  )
}
