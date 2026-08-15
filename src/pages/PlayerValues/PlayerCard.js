import React, { useEffect, useState } from 'react'
import { base_url } from '../../config/constants'
import SPVPanel from './SPVPanel'
import { C, posColor } from './theme'

// ═══════════════════════════════════════════════════════════════════════════
//  PLAYER CARD — what's behind the number.
//
//  A single value tells you what the crowd concluded. It doesn't tell you how
//  they got there. A player kept 780 times and cut 669 is genuinely divisive,
//  and that's worth knowing before you trade for him — the value alone would
//  just say "mid".
//
//  So: rank + position rank, the value's history as a sparkline, and the raw
//  keep / trade / cut tally underneath.
// ═══════════════════════════════════════════════════════════════════════════

const Sparkline = ({ history, value, width = 260, height = 70 }) => {
  const pts = (history || []).filter((h) => h.value != null)
  if (pts.length < 2) {
    return (
      <div style={{
        width, height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: C.faint, fontSize: 11, border: `1px dashed ${C.line}`, borderRadius: 8,
      }}>
        Not enough history yet — check back in a few days
      </div>
    )
  }

  const vals = pts.map((p) => p.value)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const span = Math.max(1, max - min)
  const pad = 6

  const x = (i) => pad + (i / (pts.length - 1)) * (width - pad * 2 - 40)
  const y = (v) => height - pad - ((v - min) / span) * (height - pad * 2)

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.value)}`).join(' ')
  const area = `${line} L ${x(pts.length - 1)} ${height - pad} L ${x(0)} ${height - pad} Z`
  const rising = vals[vals.length - 1] >= vals[0]
  const stroke = rising ? C.green : C.red

  const fmt = (d) => {
    const dt = new Date(d)
    return `${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}-${dt.getFullYear()}`
  }

  return (
    <div>
      <svg width={width} height={height}>
        <defs>
          <linearGradient id={`spark-${stroke.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#spark-${stroke.slice(1)})`} />
        <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
        <circle cx={x(pts.length - 1)} cy={y(vals[vals.length - 1])} r="4" fill={stroke} />
        <text
          x={x(pts.length - 1) + 10}
          y={y(vals[vals.length - 1]) + 5}
          fill={stroke}
          fontSize="15"
          fontWeight="800"
        >
          {value}
        </text>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.faint, marginTop: 2 }}>
        <span>{fmt(pts[0].date)}</span>
        <span>{fmt(pts[pts.length - 1].date)}</span>
      </div>
    </div>
  )
}

export default function PlayerCard({ playerId, onClose }) {
  const [p, setP] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let dead = false
    fetch(`${base_url}/values/player/${playerId}`)
      .then((r) => r.json())
      .then((j) => {
        if (dead) return
        if (!j.success) throw new Error(j.message)
        setP(j.player)
      })
      .catch((e) => !dead && setErr(e.message))
    return () => { dead = true }
  }, [playerId])

  if (err) return <div style={{ padding: 16, color: C.red, fontSize: 13 }}>{err}</div>
  if (!p) return <div style={{ padding: 16, color: C.dim, fontSize: 13 }}>Loading…</div>

  const col = posColor(p.position)
  const totalVotes = (p.keeps || 0) + (p.trades || 0) + (p.cuts || 0)

  return (
    <div style={S.wrap}>
      {/* Left rail: rank, position rank, value, and the keep/trade/cut receipt */}
      <div style={{ ...S.rail, background: `linear-gradient(180deg, ${col}, ${col}CC)` }}>
        <div style={S.railRank}>{p.rank}</div>
      </div>

      <div style={S.railDark}>
        <div style={S.posRank}>{p.posRank}</div>
        <div style={S.divider} />
        <div style={S.bigValue}>{p.value}</div>
        <div style={S.divider} />
        <div style={{ ...S.tally, color: C.green }}>{p.keeps}</div>
        <div style={{ ...S.tally, color: C.text }}>{p.trades}</div>
        <div style={{ ...S.tally, color: C.red }}>{p.cuts}</div>
        <div style={{ fontSize: 8, color: C.faint, letterSpacing: 0.5, marginTop: 4 }}>K / T / C</div>
      </div>

      {/* Right: who he is, and how his value has moved */}
      <div style={S.main}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={S.name}>{p.name}</div>
            <div style={{ color: C.dim, fontSize: 13, marginTop: 4 }}>
              {[p.position, p.team, p.age ? `${p.age} y.o.` : null].filter(Boolean).join('  –  ')}
            </div>
            <div style={{ color: C.faint, fontSize: 12, marginTop: 3 }}>
              {[
                p.experience ? `${p.experience} exp.` : null,
                p.byeWeek ? `Wk. ${p.byeWeek} Bye` : null,
              ].filter(Boolean).join('  –  ') || 'No bye/experience data'}
            </div>
          </div>
          <button onClick={onClose} style={S.close}>✕</button>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <Sparkline history={p.history} value={p.value} />

          <div style={{ minWidth: 150 }}>
            <Stat label="Tier" value={`Tier ${p.tier}`} />
            <Stat
              label="7-day"
              value={`${p.trend7d > 0 ? '+' : ''}${p.trend7d}`}
              color={p.trend7d > 0 ? C.green : p.trend7d < 0 ? C.red : C.faint}
            />
            <Stat label="Votes" value={totalVotes || p.votes} />
            {p.provisional && (
              <div style={{ fontSize: 11, color: C.gold, marginTop: 8, lineHeight: 1.5 }}>
                Provisional — under 25 votes. Don&apos;t trust this number yet.
              </div>
            )}
          </div>
        </div>

        {totalVotes > 0 && (
          <>
            {/* The bar makes divisiveness visible: a long green bar next to a long
                red one means the community can't agree, which a value can't say. */}
            <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 16 }}>
              <div style={{ flex: p.keeps, background: C.green }} />
              <div style={{ flex: p.trades, background: 'rgba(255,255,255,0.25)' }} />
              <div style={{ flex: p.cuts, background: C.red }} />
            </div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 6 }}>
              Kept {p.keeps} · traded {p.trades} · cut {p.cuts}
              {p.cuts > p.keeps && (
                <span style={{ color: C.gold }}> — the crowd is split on him</span>
              )}
            </div>
          </>
        )}

        {/* Everything above is what the crowd thinks. This is what the tape says. */}
        <SPVPanel playerId={playerId} />
      </div>
    </div>
  )
}

const Stat = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${C.line}` }}>
    <span style={{ color: C.faint, fontSize: 12 }}>{label}</span>
    <span style={{ fontWeight: 800, fontSize: 13, color: color || C.text }}>{value}</span>
  </div>
)

const S = {
  wrap: {
    display: 'flex', background: '#0E121B', border: `1px solid ${C.line}`,
    borderRadius: 12, overflow: 'hidden', margin: '4px 0 10px',
  },
  rail: { width: 62, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  railRank: { fontSize: 30, fontWeight: 900, color: '#fff', fontFamily: "'Barlow Condensed', sans-serif" },
  railDark: {
    width: 74, background: '#111826', flexShrink: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '14px 0',
  },
  posRank: { fontSize: 13, fontWeight: 800, color: C.text },
  bigValue: { fontSize: 20, fontWeight: 900, color: C.text, fontFamily: "'Barlow Condensed', sans-serif" },
  divider: { width: 18, height: 1, background: 'rgba(255,255,255,0.18)', margin: '9px 0' },
  tally: { fontSize: 12, fontWeight: 700, lineHeight: 1.45 },
  main: { flex: 1, minWidth: 0, padding: '16px 18px' },
  name: { fontSize: 22, fontWeight: 900, fontFamily: "'Rajdhani', sans-serif" },
  close: { background: 'transparent', border: 'none', color: C.faint, fontSize: 15, cursor: 'pointer' },
}
