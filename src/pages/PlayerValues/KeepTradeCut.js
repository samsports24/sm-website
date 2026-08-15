import React, { useCallback, useEffect, useState } from 'react'
import { base_url } from '../../config/constants'
import PlayerAvatar from '../../components/PlayerAvatar'
import { C, posColor } from './theme'

// ═══════════════════════════════════════════════════════════════════════════
//  KEEP / TRADE / CUT — the game that produces every value on the platform.
//
//  Three players. Keep one, trade one, cut one. That's it. Each vote is three
//  head-to-head comparisons feeding an Elo rating, and a few thousand of them
//  produce a player value more honest than any formula.
//
//  We never show the current value BEFORE the vote — seeing it would anchor the
//  answer and we'd just be measuring our own numbers back to ourselves.
// ═══════════════════════════════════════════════════════════════════════════

const SLOTS = [
  { key: 'keep', label: 'KEEP', hint: 'most valuable', color: C.green },
  { key: 'trade', label: 'TRADE', hint: 'middle', color: C.gold },
  { key: 'cut', label: 'CUT', hint: 'least valuable', color: C.red },
]

// ── Depth chart, in words ───────────────────────────────────────────────────
// "WR1 · starter" beats "rank: 1". Nobody wants to decode a rank; they want to
// know whether the man actually plays.
const depthLabel = (rank, position) => {
  if (rank == null) return null
  const slot = `${position || ''}${rank}`
  if (rank === 1) return { text: `${slot} · starter`, tone: C.green }
  if (rank === 2) return { text: `${slot} · backup`, tone: C.gold }
  if (rank === 3) return { text: `${slot} · rotational`, tone: C.faint }
  return { text: `${slot} · depth`, tone: C.faint }
}

// ── Where a real NFL team spent a real pick ─────────────────────────────────
//
// For a rookie this is the only hard evidence on the card — no snaps, no points,
// no games. For everyone else it's still context: "4th-round pick, now the
// starter" and "1st-round pick, still 3rd on the depth chart" are two very
// different stories, and the second one is a sell.
//
// It does NOT say "Undrafted" when the data is missing. It used to, and that was
// a lie: the scout-data seed wrote 0 for a round it didn't have, so a zero means
// "undrafted OR we never got it" and nothing can tell those apart. Asserting a
// man went undrafted on that basis is inventing a fact about his career. If we
// don't know, the line simply isn't there.
const draftLine = (draft) => {
  if (!draft || !draft.round) return null
  const pick = draft.pick ? ` · pick ${draft.pick}` : ''
  const team = draft.team ? ` · ${draft.team}` : ''
  return {
    text: `Round ${draft.round}${pick}${team}`,
    // A first-rounder is a very different bet from a seventh-rounder, and the
    // colour should say so before the words do.
    tone: draft.round === 1 ? C.green : draft.round <= 3 ? C.gold : C.faint,
  }
}

// A stat we don't have is "—", never 0. A zero is a claim; a dash is an
// admission. Getting that backwards is how a card lies to someone who's about
// to vote on it.
const Stat = ({ label, value, dim }) => (
  <div style={S.stat}>
    <span style={{ color: C.faint }}>{label}</span>
    <span style={{ fontWeight: 700, color: dim ? C.faint : C.text }}>{value ?? '—'}</span>
  </div>
)

export default function KeepTradeCut({ onVoted }) {
  const [trio, setTrio] = useState(null)
  const [picks, setPicks] = useState({})     // playerId -> 'keep' | 'trade' | 'cut'
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [count, setCount] = useState(0)

  const load = useCallback(async () => {
    setResult(null); setPicks({}); setErr(null)
    try {
      const r = await fetch(`${base_url}/values/matchup`)
      const j = await r.json()
      if (!j.success) throw new Error(j.message || 'No matchup available')
      const uniq = new Set((j.players || []).map((p) => p.id))
      if (!j.players || j.players.length !== 3 || uniq.size !== 3) {
        throw new Error('Got a bad matchup — try again')
      }
      setTrio(j.players)
    } catch (e) {
      setErr(e.message)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const choose = (playerId, slot) => {
    setPicks((prev) => {
      const next = { ...prev }

      // If another player already holds this slot, SWAP with him rather than
      // silently dropping his pick — dropping it was leaving you at two
      // selections with Submit greyed out and no way to see why.
      const holder = Object.keys(next).find((pid) => next[pid] === slot && pid !== playerId)
      const mine = next[playerId]
      if (holder) {
        if (mine) next[holder] = mine   // straight swap
        else delete next[holder]        // he loses it; he'll be auto-filled below
      }
      next[playerId] = slot

      // Two chosen? The third player can only be one thing. Fill it in for them.
      const ids = trio.map((p) => p.id)
      const assigned = Object.keys(next)
      if (assigned.length === 2) {
        const lastPlayer = ids.find((id) => !assigned.includes(id))
        const used = Object.values(next)
        const lastSlot = ['keep', 'trade', 'cut'].find((s) => !used.includes(s))
        if (lastPlayer && lastSlot) next[lastPlayer] = lastSlot
      }
      return next
    })
  }

  const complete = trio && Object.keys(picks).length === 3 && new Set(Object.values(picks)).size === 3

  const submit = async () => {
    if (!complete || busy) return
    setBusy(true); setErr(null)
    const body = {}
    Object.entries(picks).forEach(([pid, slot]) => { body[slot] = pid })
    try {
      const r = await fetch(`${base_url}/values/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const j = await r.json()
      if (!j.success) throw new Error(j.message || 'Vote failed')
      setResult(j.result)
      setCount((c) => c + 1)
      onVoted?.()
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (err && !trio) {
    return (
      <div style={S.wrap}>
        <div style={{ color: C.red, fontSize: 14 }}>{err}</div>
      </div>
    )
  }
  if (!trio) return <div style={S.wrap}><div style={{ color: C.dim }}>Loading a matchup…</div></div>

  return (
    <div style={S.wrap}>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <h2 style={S.h2}>Your call.</h2>
        <p style={{ color: C.dim, fontSize: 14, maxWidth: 520, margin: '8px auto 0', lineHeight: 1.6 }}>
          Keep the most valuable, trade the second, cut the least. Every vote moves the
          board — this is where SamSports values come from.
        </p>
        {count > 0 && (
          <div style={{ color: C.green, fontSize: 12, fontWeight: 700, marginTop: 10 }}>
            {count} {count === 1 ? 'vote' : 'votes'} this session — thank you
          </div>
        )}
      </div>

      <div style={S.grid}>
        {trio.map((p) => {
          const mine = picks[p.id]
          const res = result?.find((r) => r.id === p.id)
          const depth = depthLabel(p.depthRank, p.position)
          const drafted = draftLine(p.draft)
          const games = p.gamesPlayed != null && p.teamGames
            ? `${p.gamesPlayed} of ${p.teamGames}`
            : null

          return (
            <div key={p.id} style={{ ...S.card, borderColor: mine ? SLOTS.find((s) => s.key === mine).color : C.line }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                {/* PlayerAvatar already falls back to initials when there's no
                    photo, and respects the admin image toggle. */}
                <PlayerAvatar name={p.name} src={p.photo} size={48} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ ...S.pos, background: posColor(p.position) }}>{p.position}</span>
                    <span style={{ fontSize: 12, color: C.faint }}>{p.team}</span>
                  </div>
                  <div style={S.name}>{p.name}</div>
                </div>
              </div>

              {!result && (
                <>
                  {depth && (
                    <div style={{ fontSize: 12, fontWeight: 700, color: depth.tone, marginBottom: 8 }}>
                      {depth.text}
                    </div>
                  )}
                  {drafted && (
                    <div style={{ fontSize: 12, fontWeight: 700, color: drafted.tone, marginBottom: 8 }}>
                      {drafted.text}
                    </div>
                  )}
                  {p.injury && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.red, marginBottom: 8 }}>
                      {p.injury}
                    </div>
                  )}

                  <div style={S.stats}>
                    {/* A rookie has no snaps, no points and no games — by
                        definition, not by accident. Three rows of "—" tell you
                        nothing and make the card look broken. Say it once. */}
                    {p.rookie ? (
                      <Stat label="NFL experience" value="Rookie — no games yet" dim />
                    ) : (
                      <>
                        <Stat label="Points / game" value={p.ppg} dim={p.ppg == null} />
                        <Stat label="Snap share" value={p.snapPct != null ? `${p.snapPct}%` : null} dim={p.snapPct == null} />
                        <Stat label="Games" value={games} dim={!games} />
                      </>
                    )}
                    <Stat
                      label="Age · contract"
                      value={
                        p.age
                          ? `${p.age}${p.contractYearsLeft != null
                              ? ` · ${p.contractYearsLeft} yr${p.contractYearsLeft === 1 ? '' : 's'}`
                              : ''}`
                          : null
                      }
                      dim={!p.age}
                    />
                  </div>
                </>
              )}

              {result ? (
                // After the vote, reveal the value — the payoff that keeps people clicking.
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ fontSize: 30, fontWeight: 900, color: C.gold, fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {res?.value ?? '—'}
                  </div>
                  <div style={{ fontSize: 11, color: C.faint }}>
                    SAM Value · {res?.votes ?? 0} votes
                    {res?.provisional && <span style={{ color: C.gold }}> · provisional</span>}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  {SLOTS.map((s) => {
                    const on = mine === s.key
                    return (
                      <button
                        key={s.key}
                        onClick={() => choose(p.id, s.key)}
                        style={{
                          ...S.slotBtn,
                          background: on ? s.color : 'transparent',
                          color: on ? '#0B0E14' : C.dim,
                          borderColor: on ? s.color : C.line,
                        }}
                      >
                        {s.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {err && <div style={{ color: C.red, textAlign: 'center', marginTop: 14, fontSize: 13 }}>{err}</div>}

      <div style={{ textAlign: 'center', marginTop: 22 }}>
        {result ? (
          <button onClick={load} style={S.cta}>Next three →</button>
        ) : (
          <>
            <button onClick={submit} disabled={!complete || busy} style={{ ...S.cta, ...(complete && !busy ? {} : S.off) }}>
              {busy ? 'Submitting…' : 'Submit'}
            </button>
            {!complete && (
              <div style={{ fontSize: 12, color: C.faint, marginTop: 8 }}>
                Pick two and we&apos;ll fill in the third.
              </div>
            )}
            <div style={{ marginTop: 10 }}>
              <button onClick={load} style={S.skip}>I don&apos;t know these players — skip</button>
            </div>
            {/* Say it out loud. Otherwise people assume the value is MISSING
                rather than withheld, and think the page is broken. */}
            <div style={{ fontSize: 11, color: C.faint, marginTop: 12 }}>
              Values stay hidden until you vote — so the crowd isn&apos;t just reading our numbers back to us.
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const S = {
  wrap: { background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: '28px 22px' },
  h2: { fontSize: 26, fontWeight: 900, margin: 0, fontFamily: "'Rajdhani', sans-serif" },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 },
  card: { background: '#0E121B', border: '1px solid', borderRadius: 14, padding: 16, transition: 'border-color .15s ease' },
  pos: { fontSize: 10, fontWeight: 800, color: '#fff', borderRadius: 5, padding: '3px 6px', minWidth: 30, textAlign: 'center', flexShrink: 0 },
  name: { fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  stats: { borderTop: `1px solid ${C.line}`, paddingTop: 8, marginBottom: 12 },
  stat: { display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0', gap: 8 },
  slotBtn: { flex: 1, border: '1px solid', borderRadius: 8, padding: '9px 0', fontWeight: 900, fontSize: 11, cursor: 'pointer', letterSpacing: 0.5 },
  cta: { background: C.green, color: '#06210f', border: 'none', borderRadius: 10, padding: '13px 40px', fontWeight: 900, fontSize: 14, cursor: 'pointer' },
  off: { background: '#252c3b', color: C.faint, cursor: 'not-allowed' },
  skip: { background: 'transparent', border: 'none', color: C.faint, fontSize: 12, cursor: 'pointer', textDecoration: 'underline' },
}
