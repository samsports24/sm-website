import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { base_url } from '../../config/constants'
import SiteHeader from '../../components/SiteHeader'
import KeepTradeCut from './KeepTradeCut'
import PlayerCard from './PlayerCard'
import MarketGaps from './MarketGaps'
import { C, posColor, POSITIONS } from './theme'

// ═══════════════════════════════════════════════════════════════════════════
//  SAM VALUE — the rankings board, crowdsourced from Keep/Trade/Cut votes.
//
//  What makes this ours rather than a KeepTradeCut clone: we value EVERY
//  position. KTC ranks about 500 skill players. Our game rosters 53 men under a
//  salary cap, so we price offensive linemen, edge rushers and punters too.
//  Nobody else in fantasy does that.
// ═══════════════════════════════════════════════════════════════════════════

export default function PlayerValues() {
  const [rows, setRows] = useState([])
  const [movers, setMovers] = useState({ risers: [], fallers: [] })
  const [pos, setPos] = useState('ALL')
  const [q, setQ] = useState('')
  const [meta, setMeta] = useState({ total: 0, dataPoints: 0 })
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [open, setOpen] = useState(null) // which player's card is expanded

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${base_url}/values/rankings?position=${pos}&limit=300`).then((r) => r.json()),
        fetch(`${base_url}/values/movers`).then((r) => r.json()),
      ])
      if (!r1.success) throw new Error(r1.message || 'Could not load rankings')
      setRows(r1.players || [])
      setMeta({ total: r1.total || 0, dataPoints: r1.dataPoints || 0 })
      if (r2.success) setMovers({ risers: r2.risers || [], fallers: r2.fallers || [] })
      setErr(null)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }, [pos])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter((r) => r.name.toLowerCase().includes(s) || (r.team || '').toLowerCase().includes(s))
  }, [rows, q])

  // Draw a line between tiers, the way KTC does — it's what makes a long list readable.
  let lastTier = null

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh' }}>
      <SiteHeader activeSport="fantasy" />

      {/* Hero */}
      <div style={S.hero}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 20px' }}>
          <div style={S.kicker}>SAM VALUE</div>
          <h1 style={S.h1}>What is a player actually worth?</h1>
          <p style={S.sub}>
            Not a formula. A vote. Values are crowdsourced from{' '}
            <b style={{ color: C.text }}>{meta.dataPoints.toLocaleString()}</b> head-to-head
            comparisons made by managers like you, and they update in real time.
          </p>
          <p style={{ ...S.sub, marginTop: 12, fontSize: 14 }}>
            We price <b style={{ color: C.green }}>every position</b> — linemen, edge rushers,
            punters. You roster 53 men under a cap, so you need to know what a left tackle is
            worth. No other fantasy site will tell you.
          </p>
        </div>
      </div>

      <div style={S.body}>
        {/* The voting game */}
        <div style={{ marginBottom: 34 }}>
          <KeepTradeCut onVoted={load} />
        </div>

        {/* Where the computed number and the voted number disagree. */}
        <MarketGaps />

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', margin: '28px 0 14px' }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1, minWidth: 0 }}>
            {POSITIONS.map((p) => (
              <button
                key={p}
                onClick={() => setPos(p)}
                style={{
                  ...S.posBtn,
                  ...(pos === p
                    ? { background: p === 'ALL' ? C.green : posColor(p), color: '#fff', borderColor: 'transparent' }
                    : {}),
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search players…"
            style={S.input}
          />
        </div>

        {/* Board + the Insights rail (Top Risers / Top Fallers), side by side
            like KeepTradeCut. On a narrow screen the rail wraps under the board. */}
        <div style={S.boardWrap}>
          <div style={S.card}>
            <div style={{ ...S.row, ...S.head }}>
              <span style={{ width: 30, flexShrink: 0 }}>#</span>
              <span style={{ flex: 1 }}>PLAYER</span>
              <span style={{ width: 56, flexShrink: 0 }}>POS</span>
              <span style={{ width: 60, textAlign: 'right', flexShrink: 0 }}>7D</span>
              <span style={{ width: 72, textAlign: 'right', flexShrink: 0 }}>VALUE</span>
            </div>
            <div style={{ fontSize: 11, color: C.faint, padding: '6px 0 2px' }}>
              Tap a player to see his value history and how the crowd actually voted on him.
            </div>

            {loading && <div style={{ padding: 24, color: C.dim }}>Loading the board…</div>}
            {err && <div style={{ padding: 24, color: C.red }}>{err}</div>}
            {!loading && !err && filtered.length === 0 && (
              <div style={{ padding: 24, color: C.dim }}>
                No values yet. Seed them on the server with{' '}
                <code style={{ color: C.gold }}>node seed_player_values.js</code>
              </div>
            )}

            {filtered.map((r) => {
              const newTier = r.tier !== lastTier
              lastTier = r.tier
              return (
                <React.Fragment key={r.id}>
                  {newTier && pos === 'ALL' && !q && (
                    <div style={S.tierBar}>Tier {r.tier}</div>
                  )}
                  <div
                    style={{ ...S.row, cursor: 'pointer', background: open === r.id ? 'rgba(255,255,255,0.03)' : 'transparent' }}
                    onClick={() => setOpen(open === r.id ? null : r.id)}
                  >
                    <span style={{ width: 30, color: C.faint, fontWeight: 700, flexShrink: 0 }}>{r.rank}</span>
                    <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Name clips with an ellipsis instead of wrapping to a
                          second line — a wrapped "Josh / Allen" is what made the
                          rows look broken. */}
                      <span style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.name}
                      </span>
                      <span style={{ color: C.faint, fontSize: 12, flexShrink: 0 }}>{r.team}</span>
                      {r.provisional && (
                        <span style={{ ...S.chip, color: C.gold, borderColor: `${C.gold}55`, flexShrink: 0 }}>provisional</span>
                      )}
                    </span>
                    <span style={{ width: 56, flexShrink: 0 }}>
                      <span style={{ ...S.pos, background: posColor(r.position) }}>{r.posRank}</span>
                    </span>
                    <span style={{
                      width: 60, textAlign: 'right', fontWeight: 700, fontSize: 13, flexShrink: 0,
                      color: r.trend7d > 0 ? C.green : r.trend7d < 0 ? C.red : C.faint,
                    }}>
                      {r.trend7d > 0 ? '▲' : r.trend7d < 0 ? '▼' : '–'}
                      {r.trend7d !== 0 && Math.abs(r.trend7d)}
                    </span>
                    <span style={{
                      width: 72, textAlign: 'right', fontWeight: 900, fontSize: 16, flexShrink: 0,
                      color: C.gold, fontFamily: "'Barlow Condensed', sans-serif",
                    }}>
                      {r.value}
                    </span>
                  </div>
                  {open === r.id && <PlayerCard playerId={r.id} onClose={() => setOpen(null)} />}
                </React.Fragment>
              )
            })}
          </div>

          {/* Insights rail — always shown, like the reference. Empty until the
              daily snapshot cron has a few days of votes to trend against. */}
          <aside style={S.rail}>
            <div style={S.railKicker}>INSIGHTS</div>
            <Movers title="Top 5 Risers (7 days)" list={movers.risers} up />
            <Movers title="Top 5 Fallers (7 days)" list={movers.fallers} />
          </aside>
        </div>

        <div style={{ color: C.faint, fontSize: 12, marginTop: 14, lineHeight: 1.7 }}>
          Values run 0–9999 and are relative, not absolute: a 9000 player is worth roughly two
          6000s in a trade. Players marked provisional have fewer than 25 votes — treat them
          with suspicion until the crowd catches up.
        </div>
      </div>
    </div>
  )
}

const Movers = ({ title, list, up }) => (
  <div style={S.card}>
    <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10, color: up ? C.green : C.red }}>
      {title}
    </div>
    {list.length === 0 && (
      <div style={{ color: C.faint, fontSize: 12 }}>
        Nothing yet — trends need a few days of votes.
      </div>
    )}
    {list.map((p) => (
      <div key={p.id} style={{ ...S.row, padding: '7px 0' }}>
        <span style={{ ...S.pos, background: posColor(p.position), marginRight: 8 }}>{p.position}</span>
        <span style={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: 13 }}>{p.name}</span>
        <span style={{ color: up ? C.green : C.red, fontWeight: 800, fontSize: 13 }}>
          {up ? '+' : ''}{p.trend7d}
        </span>
      </div>
    ))}
  </div>
)

const S = {
  hero: {
    padding: '64px 0 48px',
    background: 'radial-gradient(1100px 400px at 25% -10%, rgba(212,168,67,0.16), transparent 70%), #0B0E14',
    borderBottom: `1px solid ${C.line}`,
  },
  kicker: { color: C.gold, fontWeight: 800, fontSize: 12, letterSpacing: 2, marginBottom: 12 },
  h1: { fontSize: 46, fontWeight: 900, margin: 0, lineHeight: 1.05, fontFamily: "'Rajdhani', sans-serif" },
  sub: { color: C.dim, fontSize: 16, maxWidth: 620, marginTop: 14, lineHeight: 1.6 },

  body: { maxWidth: 1180, margin: '0 auto', padding: '32px 20px 80px' },
  // The board grows to fill; the rail is fixed at 300 and does NOT grow — the
  // previous flexGrow:1 let it swallow half the page and crush the table so
  // names wrapped. min 460 keeps the board wide enough that a name + POS + value
  // sit on one line; below that width the rail wraps underneath instead.
  card: { background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, flex: '1 1 460px', minWidth: 0 },
  moverGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 },

  boardWrap: { display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' },
  rail: { display: 'flex', flexDirection: 'column', gap: 14, flex: '1 1 280px', maxWidth: 340 },
  railKicker: { color: C.faint, fontWeight: 800, fontSize: 11, letterSpacing: 1.5 },

  row: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: `1px solid ${C.line}` },
  head: { fontSize: 10, letterSpacing: 1, color: C.faint, fontWeight: 800, paddingBottom: 8 },
  tierBar: {
    fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: C.faint,
    padding: '10px 0 6px', borderBottom: `1px solid ${C.line}`,
  },
  pos: { fontSize: 10, fontWeight: 800, color: '#fff', borderRadius: 5, padding: '3px 7px', display: 'inline-block', minWidth: 34, textAlign: 'center' },
  chip: { fontSize: 9, fontWeight: 800, border: '1px solid', borderRadius: 20, padding: '2px 7px', marginLeft: 8 },

  posBtn: { background: 'transparent', border: `1px solid ${C.line}`, color: C.dim, borderRadius: 20, padding: '6px 14px', fontSize: 11, fontWeight: 800, cursor: 'pointer', flexShrink: 0 },
  input: { background: '#0E121B', border: `1px solid ${C.line}`, borderRadius: 8, padding: '8px 12px', color: C.text, outline: 'none', width: 200 },
}
