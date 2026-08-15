import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { base_url } from '../../config/constants'
import {
  BENCH, buildTemplate, templateSize, makeTeams, buildOrder,
  botPick, botBid, applyPick, canDraft, gradeTeams,
  priceOf, maxAffordable, capHit, draftBlockedReason,
  pickWarning, rosterStatus,
} from './engine'
import DraftBoard from './DraftBoard'
import SiteHeader from '../../components/SiteHeader'
import { C, posColor, POS_TABS_FULL, POS_TABS_OFFENSE, beep } from './theme'

// ═══════════════════════════════════════════════════════════════════════════
//  MOCK DRAFT ROOM — playable against bots, no account needed.
//  Roster rules come from the backend so the mock matches the real game:
//    SAM 53-man  → 11 offense (5 linemen), 11 defense, K + P, 29 bench
//    Offense only → 11 starters + 9 bench
// ═══════════════════════════════════════════════════════════════════════════

const PICK_SECONDS = 60
const SPEEDS = { slow: 2000, normal: 900, fast: 280, instant: 40 }

// Persist an in-progress draft so a browser refresh resumes exactly where it
// was. Bump the version suffix if the shape below ever changes.
const DRAFT_KEY = 'samsports_mockdraft_v1'

// Auction runs on SP under the salary cap. No money changes hands.
const sp = (n) => `${n}M SP`

export default function MockDraft() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [phase, setPhase] = useState('setup')
  const [mode, setMode] = useState('full')          // full | offense
  const [format, setFormat] = useState(params.get('format') || 'snake')
  const [teamCount, setTeamCount] = useState(10)
  const [draftSlot, setDraftSlot] = useState('random')
  const [speed, setSpeed] = useState('normal')

  const [presets, setPresets] = useState(null)
  const [pool, setPool] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadErr, setLoadErr] = useState(null)

  const [tpl, setTpl] = useState([])
  const [cap, setCap] = useState(320)
  const [floor, setFloor] = useState(280)
  const [size, setSize] = useState(53)

  const [draftId, setDraftId] = useState(null)
  const [teams, setTeams] = useState([])
  const [order, setOrder] = useState([])
  const [picks, setPicks] = useState([])
  const [pickIdx, setPickIdx] = useState(0)
  const [rounds, setRounds] = useState(53)
  const [drafted, setDrafted] = useState({})
  const [clock, setClock] = useState(PICK_SECONDS)
  const [paused, setPaused] = useState(false)

  const [tab, setTab] = useState('board')
  const [posTab, setPosTab] = useState('ALL')
  const [search, setSearch] = useState('')
  const [queue, setQueue] = useState([])
  const [selected, setSelected] = useState(null)

  // Auction
  const [nominee, setNominee] = useState(null)
  const [bid, setBid] = useState(0)
  const [bidder, setBidder] = useState(null)
  const [nominatingTeam, setNominatingTeam] = useState(0)
  const [going, setGoing] = useState(0)

  const isAuction = format === 'auction'
  const timerRef = useRef(null)
  const wasMyTurn = useRef(false)

  const [narrow, setNarrow] = useState(typeof window !== 'undefined' && window.innerWidth < 1024)
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 1024)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // ── Roster rules, straight from the backend ──────────────────────────────
  useEffect(() => {
    fetch(`${base_url}/mock-draft/config`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setPresets(j.presets) })
      .catch(() => setLoadErr('Could not load the roster rules'))
  }, [])

  // ── Restore an in-progress draft after a refresh ─────────────────────────
  const restoredRef = useRef(false)
  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true
    let snap
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      snap = JSON.parse(raw)
    } catch (e) {
      try { localStorage.removeItem(DRAFT_KEY) } catch (_) { /* ignore */ }
      return
    }
    if (!snap || snap.v !== 1 || snap.phase !== 'drafting') return
    try {
      setMode(snap.mode); setFormat(snap.format); setTeamCount(snap.teamCount)
      setDraftSlot(snap.draftSlot); setSpeed(snap.speed)
      setTpl(snap.tpl || []); setCap(snap.cap); setFloor(snap.floor); setSize(snap.size)
      setDraftId(snap.draftId || null)
      setTeams(snap.teams || []); setOrder(snap.order || []); setPicks(snap.picks || [])
      setPickIdx(snap.pickIdx || 0); setRounds(snap.rounds)
      setDrafted(snap.drafted || {}); setQueue(snap.queue || []); setPool(snap.pool || [])
      setNominee(snap.nominee || null); setBid(snap.bid || 0)
      setBidder(snap.bidder ?? null); setNominatingTeam(snap.nominatingTeam || 0)
      setGoing(snap.going || 0)
      setClock(PICK_SECONDS); setPaused(false)
      setTab(snap.format === 'auction' ? 'team' : 'board')
      setPhase('drafting')
    } catch (e) {
      try { localStorage.removeItem(DRAFT_KEY) } catch (_) { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const preset = presets?.[mode]
  const posTabs = mode === 'offense' ? POS_TABS_OFFENSE : POS_TABS_FULL

  const loadPool = useCallback(async (need) => {
    setLoading(true); setLoadErr(null)
    try {
      const res = await fetch(`${base_url}/mock-draft/pool?mode=${mode}&limit=${Math.min(2000, Math.max(400, need))}`)
      const json = await res.json()
      if (!json.success || !json.players?.length) throw new Error(json.message || 'No players available')
      setPool(json.players)
      return json.players
    } catch (e) {
      setLoadErr(e.message || 'Could not load players')
      return []
    } finally { setLoading(false) }
  }, [mode])

  const available = useMemo(() => pool.filter((p) => !drafted[p.id]), [pool, drafted])

  // ── Persist / clear the in-progress draft ────────────────────────────────
  useEffect(() => {
    if (phase === 'setup') return // nothing to save; start()/restore manage the key
    if (phase === 'done') { try { localStorage.removeItem(DRAFT_KEY) } catch (e) { /* ignore */ } return }
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        v: 1, phase, mode, format, teamCount, draftSlot, speed,
        tpl, cap, floor, size, draftId,
        teams, order, picks, pickIdx, rounds, drafted, queue, pool,
        nominee, bid, bidder, nominatingTeam, going,
      }))
    } catch (e) { /* quota exceeded or non-serialisable — draft just won't persist */ }
  }, [phase, mode, format, teamCount, draftSlot, speed, tpl, cap, floor, size, draftId,
      teams, order, picks, pickIdx, rounds, drafted, queue, pool,
      nominee, bid, bidder, nominatingTeam, going])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return available
      .filter((p) => (posTab === 'ALL' ? true : p.pos === posTab))
      .filter((p) => !q || p.name.toLowerCase().includes(q) || (p.team || '').toLowerCase().includes(q))
      .slice(0, 120)
  }, [available, posTab, search])

  const onClock = order[pickIdx]
  const me = teams.find((t) => t.isYou)
  const myTurn = isAuction ? true : !!teams[onClock]?.isYou

  useEffect(() => {
    if (phase !== 'drafting' || isAuction) return
    if (myTurn && !wasMyTurn.current) { beep(); setTab('team') }
    wasMyTurn.current = myTurn
  }, [myTurn, phase, isAuction])

  // ── Start ────────────────────────────────────────────────────────────────
  const start = async () => {
    if (!preset) return
    const template = buildTemplate(preset)
    const rosterSize = templateSize(template)

    const players = await loadPool(teamCount * rosterSize + 60)
    if (!players.length) return

    // Never start a draft we can't finish: run fewer rounds if the board is thin.
    const r = Math.max(1, Math.min(rosterSize, Math.floor(players.length / teamCount)))

    try { localStorage.removeItem(DRAFT_KEY) } catch (e) { /* ignore */ } // starting a new one
    setDraftId(`mock-${Date.now()}`)
    setTpl(template)
    setSize(rosterSize)
    setCap(preset.capSP)
    setFloor(preset.floorSP || Math.round(preset.capSP * 0.875))
    setRounds(r)
    setTeams(makeTeams(teamCount, draftSlot === 'random' ? Math.floor(Math.random() * teamCount) : draftSlot - 1, preset.capSP))
    setDrafted({}); setPicks([]); setQueue([]); setPickIdx(0); setSelected(null)
    setOrder(isAuction ? [] : buildOrder(format, teamCount, r))
    setNominee(null); setBid(0); setBidder(null); setNominatingTeam(0); setGoing(0)
    setClock(PICK_SECONDS); setPaused(false)
    setPosTab('ALL')
    setTab(isAuction ? 'team' : 'board')
    setPhase('drafting')
  }

  // ── Snake / linear ───────────────────────────────────────────────────────
  const makePick = useCallback((teamId, player) => {
    if (!player) {
      // The board is empty at this position for everyone: never no-op (that's
      // what used to hang the draft) — advance the clock so the loop continues.
      // eslint-disable-next-line no-console
      console.warn('[MockDraft] no pick available — skipping to advance', { draftId, pickIdx, teamId })
      setPickIdx((i) => i + 1)
      setClock(PICK_SECONDS)
      return
    }
    setTeams((prev) => applyPick(tpl, prev, teamId, player))
    setDrafted((prev) => ({ ...prev, [player.id]: { teamId } }))
    setPicks((prev) => { const n = [...prev]; n[pickIdx] = { ...player, teamId, _price: priceOf(player) }; return n })
    setQueue((prev) => prev.filter((q) => q !== player.id))
    setSelected(null)
    setPickIdx((i) => i + 1)
    setClock(PICK_SECONDS)
  }, [tpl, pickIdx, draftId])

  // Round-aware options the bot uses to weight talent early vs. roster
  // completion + cap-floor compliance late, and to tag its fallback logs.
  const botOpts = useCallback(() => ({
    floor, round: Math.floor(pickIdx / Math.max(1, teamCount)) + 1,
    totalRounds: rounds, draftId, pickNo: pickIdx + 1,
  }), [floor, pickIdx, teamCount, rounds, draftId])

  useEffect(() => {
    if (phase !== 'drafting' || isAuction || paused) return
    if (order.length && pickIdx >= order.length) { setPhase('done'); return }
    const team = teams[onClock]
    if (!team) return

    if (!team.isYou) {
      const t = setTimeout(() => makePick(team.id, botPick(tpl, team, available, size, botOpts())), SPEEDS[speed])
      return () => clearTimeout(t)
    }

    timerRef.current = setInterval(() => {
      setClock((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current)
          const queued = queue.map((id) => available.find((p) => p.id === id)).filter(Boolean)
          const pick = queued.find((p) => canDraft(tpl, team, p, size)) || botPick(tpl, team, available, size, botOpts())
          makePick(team.id, pick)
          return PICK_SECONDS
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, isAuction, paused, pickIdx, order.length, onClock, teams, available, queue, tpl, size, speed, makePick, botOpts])

  // ── Watchdog: the loop must ALWAYS progress ──────────────────────────────
  // If a bot's pick somehow never lands (a thrown timer, an empty board, a
  // wedged state) and pickIdx sits still, force it forward so the draft can
  // never freeze — the exact symptom of the old "CPU stopped picking" bug.
  useEffect(() => {
    if (phase !== 'drafting' || isAuction || paused) return
    if (!order.length || pickIdx >= order.length) return
    const team = teams[onClock]
    if (!team || team.isYou) return // the human is governed by the pick clock
    const ms = Math.max(4000, SPEEDS[speed] * 6 + 4000)
    const watchdog = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.warn('[MockDraft/watchdog] pick stalled — forcing advance', { draftId, pickIdx, team: team.name })
      setPickIdx((i) => (i === pickIdx ? i + 1 : i))
    }, ms)
    return () => clearTimeout(watchdog)
  }, [phase, isAuction, paused, pickIdx, order.length, onClock, teams, speed, draftId])

  // ── Auction ──────────────────────────────────────────────────────────────
  const allFull = teams.length > 0 && teams.every((t) => t.roster.length >= size)

  useEffect(() => {
    if (phase !== 'drafting' || !isAuction || paused) return
    if (allFull || !available.length) { setPhase('done'); return }

    if (!nominee) {
      const t = teams[nominatingTeam]
      if (!t) return
      if (t.isYou) return
      const timer = setTimeout(() => {
        const p = botPick(tpl, t, available, size, { ignoreSalary: true, floor, draftId })
        if (!p) { setNominatingTeam((n) => (n + 1) % teams.length); return }
        setNominee(p); setBid(1); setBidder(t.id); setGoing(0)
      }, SPEEDS[speed])
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      const contenders = teams.filter((t) => t.id !== bidder && !t.isYou && t.roster.length < size)
      let raised = null
      for (const t of contenders) {
        const b = botBid(tpl, t, nominee, bid, size, cap)
        if (b > bid) { raised = { team: t.id, amount: b }; break }
      }
      if (raised) { setBid(raised.amount); setBidder(raised.team); setGoing(0); return }

      if (going < 2) { setGoing((g) => g + 1); return } // going once, going twice…

      setTeams((prev) => applyPick(tpl, prev, bidder, nominee, bid))
      setDrafted((prev) => ({ ...prev, [nominee.id]: { teamId: bidder, price: bid } }))
      setPicks((prev) => [...prev, { ...nominee, teamId: bidder, _price: bid }])
      setQueue((prev) => prev.filter((q) => q !== nominee.id))
      setNominee(null); setBid(0); setBidder(null); setGoing(0)
      setNominatingTeam((n) => (n + 1) % teams.length)
    }, going > 0 ? 1200 : SPEEDS[speed])
    return () => clearTimeout(timer)
  }, [phase, isAuction, paused, nominee, bid, bidder, going, teams, available, nominatingTeam, tpl, size, cap, allFull, speed])

  const maxBid = (t) => (t ? t.budget - Math.max(0, size - t.roster.length - 1) : 0)
  const nominate = (p) => { if (!nominee && teams[nominatingTeam]?.isYou) { setNominee(p); setBid(1); setBidder(me.id); setGoing(0) } }
  const raiseBy = (n) => {
    if (!me || bidder === me.id) return
    if (bid + n > maxBid(me)) return
    setBid((b) => b + n); setBidder(me.id); setGoing(0)
  }
  // A human pick, guarded: hard-blocked if illegal (over cap / no slot), and
  // warned-then-blocked (confirm to override) if it would strand the roster —
  // can't reach the floor, or can't fill a required position with what's left.
  const attemptPick = (teamId, player) => {
    if (!player || !me || !canDraft(tpl, me, player, size)) return
    const warn = pickWarning(tpl, me, player, size, cap, floor, available)
    if (warn && !window.confirm(`${warn}\n\nDraft ${player.name} anyway?`)) return
    makePick(teamId, player)
  }
  const draftSelected = () => {
    if (!selected || !myTurn || !me || !canDraft(tpl, me, selected, size)) return
    attemptPick(onClock, selected)
  }

  // ═══ SETUP ═══
  if (phase === 'setup') {
    const full = presets?.full
    const off = presets?.offense
    const activeRoster = preset?.activeRoster || 53
    const picksTotal = teamCount * activeRoster

    return (
      <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>
        <SiteHeader activeSport="fantasy" />
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 20px 72px' }}>
          <button onClick={() => navigate('/fantasy')} style={S.link}>← Fantasy</button>
          <h1 style={S.h1}>Mock Draft</h1>
          <p style={{ color: C.dim, marginBottom: 34, maxWidth: 560, lineHeight: 1.6 }}>
            The real SamSports draft against bots, on a real clock. No account, nothing saved.
          </p>

          <Field label="League mode">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
              {[
                { v: 'full', p: full },
                { v: 'offense', p: off },
              ].map(({ v, p }) => (
                <div key={v} onClick={() => setMode(v)} style={{ ...S.optCard, ...(mode === v ? S.optOn : {}) }}>
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>{p?.label || (v === 'full' ? 'SAM Metric — 53-man' : 'Offense only')}</div>
                  <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.55 }}>
                    {v === 'full'
                      ? 'Full roster: 11 offense with all five linemen, 11 defense, kicker and punter, 29 bench.'
                      : 'Skill positions only: 11 starters, 9 bench, 20-man roster.'}
                  </div>
                  {p && (
                    <div style={{ fontSize: 11, color: C.faint, marginTop: 8 }}>
                      {p.activeRoster} players · {p.starterCount} starters · {p.capSP}M SP cap
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Field>

          {preset && (
            <Field label="Starting lineup">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {preset.starters.map((s) => (
                  <span key={s.slot} style={{ ...S.slotChip, borderColor: `${posColor(s.slot)}66`, color: posColor(s.slot) }}>
                    {s.count}× {s.slot}
                  </span>
                ))}
                <span style={{ ...S.slotChip, borderColor: C.line, color: C.faint }}>{preset.bench}× BENCH</span>
              </div>
            </Field>
          )}

          <Field label="Format">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12 }}>
              {[
                { v: 'snake', l: 'Snake', d: 'Order reverses each round.' },
                { v: 'linear', l: 'Linear', d: 'Same order every round.' },
                { v: 'auction', l: 'Auction', d: `${preset?.capSP || 320}M SP cap. Bid on anyone.` },
              ].map((f) => (
                <div key={f.v} onClick={() => setFormat(f.v)} style={{ ...S.optCard, ...(format === f.v ? S.optOn : {}) }}>
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>{f.l}</div>
                  <div style={{ fontSize: 12, color: C.dim }}>{f.d}</div>
                </div>
              ))}
            </div>
          </Field>

          <Field label="Teams">
            <Chips
              options={[8, 10, 12, 14, 16, 20, 24, 32].map((n) => ({ v: n, l: String(n) }))}
              value={teamCount}
              onChange={(v) => { setTeamCount(v); if (draftSlot !== 'random' && draftSlot > v) setDraftSlot('random') }}
            />
          </Field>

          {!isAuction && (
            <Field label="Your draft slot">
              <Chips
                options={[{ v: 'random', l: 'Random' }, ...Array.from({ length: teamCount }, (_, i) => ({ v: i + 1, l: String(i + 1) }))]}
                value={draftSlot} onChange={setDraftSlot}
              />
            </Field>
          )}

          <Field label="Bot speed">
            <Chips
              options={[
                { v: 'slow', l: 'Slow' }, { v: 'normal', l: 'Normal' },
                { v: 'fast', l: 'Fast' }, { v: 'instant', l: 'Instant' },
              ]}
              value={speed} onChange={setSpeed}
            />
          </Field>

          {loadErr && <div style={{ color: C.red, marginBottom: 16 }}>{loadErr}</div>}

          <button onClick={start} disabled={loading || !preset} style={S.cta}>
            {loading ? 'Loading players…' : preset ? 'Start mock draft' : 'Loading rules…'}
          </button>

          <div style={{ color: C.faint, fontSize: 12, marginTop: 12, lineHeight: 1.7 }}>
            {teamCount} teams · {activeRoster}-man roster · {picksTotal} picks · {PICK_SECONDS}s per pick
            {picksTotal > 700 && (
              <div style={{ color: C.gold }}>
                That&apos;s a long board. Run the bots on Fast or Instant unless you have an hour.
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ═══ RESULTS ═══
  if (phase === 'done') {
    const grades = gradeTeams(teams)
    const starters = (me?.roster || []).filter((p) => p._slot !== BENCH)
    return (
      <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>
        <SiteHeader activeSport="fantasy" />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 80px' }}>
          <h1 style={{ ...S.h1, marginBottom: 4 }}>Draft complete</h1>
          <p style={{ color: C.dim, marginBottom: 28 }}>
            Your grade <b style={{ color: C.green, fontSize: 22 }}>{grades[me?.id]}</b>
            <span style={{ color: C.faint }}> · {me?.roster.length} players, {starters.length} starters · cap hit </span>
            <b style={{ color: capHit(me || { roster: [] }) > cap ? C.red : C.gold }}>{sp(capHit(me || { roster: [] }))}</b>
            <span style={{ color: C.faint }}> of {sp(cap)}</span>
            {me && capHit(me) < floor && (
              <span style={{ color: C.red }}> · under the {sp(floor)} floor</span>
            )}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '360px 1fr', gap: 16, marginBottom: 28 }}>
            <div style={S.card}>
              <div style={S.cardTitle}>Your starting lineup</div>
              {starters.map((p, i) => (
                <div key={i} style={S.row}>
                  <span style={{ ...S.posTag, background: posColor(p._slot) }}>{p._slot}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>{p.name}</span>
                  <span style={{ color: C.faint, fontSize: 11 }}>{p.team}</span>
                  <span style={{ color: C.gold, marginLeft: 8, fontWeight: 700 }}>{sp(p._price || 0)}</span>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>Grades</div>
              {teams.map((t) => (
                <div key={t.id} style={{ ...S.row, justifyContent: 'space-between' }}>
                  <span style={{ color: t.isYou ? C.green : C.text, fontWeight: t.isYou ? 800 : 600 }}>{t.name}</span>
                  <span style={{ fontWeight: 900, color: C.gold }}>{grades[t.id]}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/select-game')} style={S.cta}>Play for real — sign up</button>
            <button onClick={() => setPhase('setup')} style={S.ghost}>Run another mock</button>
          </div>
        </div>
      </div>
    )
  }

  // ═══ ROOM ═══
  const round = Math.floor(pickIdx / teamCount) + 1
  const upcoming = order.slice(pickIdx, pickIdx + 12)
  const myNext = order.indexOf(me?.id, pickIdx)
  const picksAway = myNext >= 0 ? myNext - pickIdx : -1

  // Always-visible cap tracker figures, recomputed every render (so they update
  // the instant a pick lands).
  const capUsed = me ? capHit(me) : 0
  const capRemaining = cap - capUsed
  const spotsRemaining = me ? Math.max(0, size - me.roster.length) : size
  const stillMustSpend = Math.max(0, floor - capUsed)
  const avgPerPick = spotsRemaining > 0 ? capRemaining / spotsRemaining : 0
  const status = rosterStatus(me, tpl, size, cap, floor)

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>
      <div style={S.stickyHead}>
      <div style={{ ...S.topBar, position: 'static' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <button onClick={() => setPhase('setup')} style={S.link}>← Exit</button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, letterSpacing: 1.4, color: C.faint }}>
              {isAuction ? `AUCTION · ${mode === 'full' ? '53-MAN' : 'OFFENSE'}` : `ROUND ${round} OF ${rounds} · PICK ${(pickIdx % teamCount) + 1}`}
            </div>
            <div style={{ fontWeight: 800, fontSize: 17, fontFamily: "'Rajdhani', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isAuction
                ? (nominee ? `${nominee.name} — ${sp(bid)}` : `${teams[nominatingTeam]?.name} to nominate`)
                : (myTurn ? "You're on the clock" : `${teams[onClock]?.name} is picking`)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {me && (
            <Budget
              label="CAP SPACE"
              value={sp(me.budget)}
              sub={isAuction ? `max bid ${sp(maxBid(me))}` : `max ${sp(maxAffordable(me, size))} per player`}
            />
          )}
          {!isAuction && myTurn && <div style={{ ...S.clock, color: clock <= 15 ? C.red : C.green }}>{clock}s</div>}
          {!isAuction && !myTurn && picksAway > 0 && (
            <div style={{ fontSize: 12, color: C.dim }}>
              {'Up in '}<b style={{ color: C.text }}>{picksAway}</b>{picksAway === 1 ? ' pick' : ' picks'}
            </div>
          )}
          <button onClick={() => setPaused((p) => !p)} style={S.ghostSm}>{paused ? '▶ Resume' : '⏸ Pause'}</button>
        </div>
      </div>

      {me && (
        <CapTracker
          cap={cap} used={capUsed} remaining={capRemaining} floor={floor}
          mustSpend={stillMustSpend} spots={spotsRemaining} avg={avgPerPick}
          status={status}
        />
      )}
      </div>

      {!isAuction && (
        <div style={S.ticker}>
          {upcoming.map((teamId, i) => {
            const t = teams[teamId]
            const idx = pickIdx + i
            return (
              <div key={idx} style={{
                ...S.tick,
                ...(i === 0 ? { borderColor: C.green, background: 'rgba(34,197,94,0.12)' } : {}),
                ...(t?.isYou ? { color: C.green, fontWeight: 800 } : {}),
              }}>
                <span style={{ color: C.faint, marginRight: 6, fontSize: 10 }}>
                  {Math.floor(idx / teamCount) + 1}.{(idx % teamCount) + 1}
                </span>
                {t?.isYou ? 'YOU' : t?.name}
              </div>
            )
          })}
        </div>
      )}

      {isAuction && nominee && (
        <div style={S.blockBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <span style={{ ...S.posTag, background: posColor(nominee.pos) }}>{nominee.pos}</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: 20, fontFamily: "'Rajdhani', sans-serif" }}>{nominee.name}</div>
              <div style={{ fontSize: 12, color: C.dim }}>{nominee.team}{nominee.adp ? ` · ADP ${nominee.adp}` : ''}</div>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: C.gold, lineHeight: 1 }}>{sp(bid)}</div>
            <div style={{ fontSize: 11, color: bidder === me?.id ? C.green : C.dim }}>
              {bidder === me?.id ? 'You lead' : teams[bidder]?.name}
              {going === 1 && ' · going once'}
              {going === 2 && ' · going twice'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 5, 25].map((n) => (
              <button key={n} onClick={() => raiseBy(n)}
                disabled={bidder === me?.id || bid + n > maxBid(me)}
                style={{ ...S.bidBtn, ...((bidder === me?.id || bid + n > maxBid(me)) ? S.off : {}) }}>
                +{n}M
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ ...S.body, gridTemplateColumns: narrow ? '1fr' : 'minmax(0,470px) minmax(0,1fr)' }}>
        {/* Players */}
        <div style={{ ...S.card, padding: 0, display: 'flex', flexDirection: 'column', maxHeight: narrow ? 540 : 'calc(100vh - 220px)' }}>
          <div style={{ padding: 12, borderBottom: `1px solid ${C.line}` }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search players…" style={S.input} />
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
              {posTabs.map((p) => (
                <button key={p} onClick={() => setPosTab(p)}
                  style={{ ...S.posBtn, ...(posTab === p ? { background: posColor(p === 'ALL' ? '' : p), color: '#fff', borderColor: 'transparent' } : {}) }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.map((p) => {
              const legal = me && canDraft(tpl, me, p, size)
              const blocked = me && draftBlockedReason(tpl, me, p, size)
              const isSel = selected?.id === p.id
              return (
                <div key={p.id} onClick={() => setSelected(isSel ? null : p)}
                  style={{ ...S.pRow, ...(isSel ? { background: 'rgba(34,197,94,0.10)' } : {}) }}>
                  <span style={{ ...S.posTag, background: posColor(p.pos) }}>{p.pos}</span>
                  {p.photo
                    ? <img src={p.photo} alt="" style={S.avatar} onError={(e) => { e.target.style.visibility = 'hidden' }} />
                    : <div style={{ ...S.avatar, background: '#1b2233' }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}{p.injured && <span style={{ color: C.red, marginLeft: 6, fontSize: 11 }}>INJ</span>}
                    </div>
                    <div style={{ fontSize: 11, color: C.faint }}>
                      {p.team}{p.adp ? ` · ADP ${p.adp}` : ` · #${p.rank}`}{p.proj ? ` · ${p.proj} proj` : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 4 }}>
                    <div style={{ fontWeight: 800, fontSize: 12, color: blocked && blocked.startsWith('Over') ? C.red : C.gold }}>
                      {priceOf(p)}M
                    </div>
                    <div style={{ fontSize: 9, color: C.faint }}>SP</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setQueue((q) => q.includes(p.id) ? q.filter((x) => x !== p.id) : [...q, p.id]) }}
                    style={{ ...S.star, color: queue.includes(p.id) ? C.gold : C.faint }} title="Queue">
                    {queue.includes(p.id) ? '★' : '☆'}
                  </button>
                  {isAuction ? (
                    <button onClick={(e) => { e.stopPropagation(); nominate(p) }}
                      disabled={!!nominee || !teams[nominatingTeam]?.isYou || !legal}
                      style={{ ...S.draftBtn, ...((!!nominee || !teams[nominatingTeam]?.isYou || !legal) ? S.off : {}) }}>
                      Nominate
                    </button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); attemptPick(onClock, p) }}
                      disabled={!myTurn || !legal}
                      style={{ ...S.draftBtn, ...((!myTurn || !legal) ? S.off : {}) }}
                      title={blocked || ''}>
                      Draft
                    </button>
                  )}
                </div>
              )
            })}
            {filtered.length === 0 && <div style={{ padding: 20, color: C.dim }}>Nobody left matching that.</div>}
          </div>

          {selected && myTurn && !isAuction && (
            <div style={S.draftBar}>
              <span style={{ ...S.posTag, background: posColor(selected.pos) }}>{selected.pos}</span>
              <div style={{ flex: 1, minWidth: 0, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selected.name}
              </div>
              <button onClick={draftSelected} style={S.cta}>Draft</button>
            </div>
          )}
        </div>

        {/* Board / team / queue */}
        <div style={{ ...S.card, padding: 0, display: 'flex', flexDirection: 'column', maxHeight: narrow ? 'none' : 'calc(100vh - 220px)' }}>
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.line}` }}>
            {[
              ...(isAuction ? [] : [{ k: 'board', l: 'Board' }]),
              { k: 'team', l: `My team (${me?.roster.length || 0}/${size})` },
              { k: 'queue', l: `Queue (${queue.length})` },
            ].map((t) => (
              <button key={t.k} onClick={() => setTab(t.k)} style={{ ...S.tab, ...(tab === t.k ? S.tabOn : {}) }}>{t.l}</button>
            ))}
          </div>

          <div style={{ overflow: 'auto', flex: 1, padding: tab === 'board' ? 0 : 14 }}>
            {tab === 'board' && !isAuction && (
              <>
                <div style={{
                  display: 'flex', gap: 8, flexWrap: 'wrap', padding: '10px 12px',
                  borderBottom: `1px solid ${C.line}`, background: '#0D111A',
                  position: 'sticky', top: 0, zIndex: 3,
                }}>
                  {posTabs.filter((p) => p !== 'ALL').map((p) => (
                    <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: C.dim }}>
                      <span style={{ width: 9, height: 9, borderRadius: 2, background: posColor(p) }} />
                      {p}
                    </span>
                  ))}
                </div>
                <DraftBoard teams={teams} order={order} picks={picks} pickIdx={pickIdx} teamCount={teamCount} rounds={rounds} compact />
              </>
            )}

            {tab === 'team' && (
              <>
                {tpl.map((r) => {
                  const filled = (me?.roster || []).filter((p) => p._slot === r.slot)
                  return (
                    <div key={r.slot} style={{ marginBottom: 10 }}>
                      {r.slot === BENCH && (
                        <div style={{ fontSize: 10, letterSpacing: 1.2, color: C.faint, margin: '14px 0 6px' }}>
                          BENCH ({filled.length}/{r.count})
                        </div>
                      )}
                      {Array.from({ length: r.count }, (_, i) => (
                        (r.slot === BENCH && !filled[i]) ? null : (
                          <div key={r.slot + i} style={{ ...S.row, opacity: filled[i] ? 1 : 0.4 }}>
                            <span style={{ ...S.posTag, background: filled[i] ? posColor(r.slot === BENCH ? filled[i].pos : r.slot) : '#252c3b' }}>
                              {r.slot === BENCH ? filled[i].pos : r.slot}
                            </span>
                            <span style={{ flex: 1, minWidth: 0 }}>{filled[i] ? filled[i].name : '—'}</span>
                            {filled[i]?._price != null && <span style={{ color: C.gold, fontWeight: 700 }}>{sp(filled[i]._price)}</span>}
                          </div>
                        )
                      ))}
                    </div>
                  )
                })}

                {me && (
                  <div style={{ marginTop: 16, padding: 12, background: '#0E121B', borderRadius: 10, border: `1px solid ${C.line}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                      <span style={{ color: C.dim }}>Cap hit</span>
                      <span style={{ fontWeight: 800, color: capHit(me) > cap ? C.red : C.gold }}>
                        {sp(capHit(me))} / {sp(cap)}
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, position: 'relative' }}>
                      <div style={{ width: `${Math.min(100, (capHit(me) / cap) * 100)}%`, height: '100%', background: C.gold, borderRadius: 3 }} />
                      <div style={{ position: 'absolute', left: `${(floor / cap) * 100}%`, top: -2, width: 2, height: 10, background: C.red }} title="salary floor" />
                    </div>
                    <div style={{ fontSize: 10, color: C.faint, marginTop: 6 }}>
                      Floor {sp(floor)} · you must stay under the cap and still fill {size} spots
                    </div>
                  </div>
                )}

                {isAuction && (
                  <div style={{ marginTop: 18 }}>
                    <div style={S.cardTitle}>Cap space (all teams)</div>
                    {teams.map((t) => (
                      <div key={t.id} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                          <span style={{ color: t.isYou ? C.green : C.dim }}>{t.name}</span>
                          <span style={{ color: C.gold }}>{sp(t.budget)} · {t.roster.length}/{size}</span>
                        </div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
                          <div style={{ width: `${(t.budget / cap) * 100}%`, height: '100%', background: t.isYou ? C.green : C.blue, borderRadius: 2 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'queue' && (
              queue.length === 0
                ? <div style={{ color: C.dim, fontSize: 13 }}>
                    Star players to queue them. If your clock runs out we draft the top of your queue
                    instead of whoever the autopick fancies.
                  </div>
                : queue.map((id, i) => {
                    const p = pool.find((x) => x.id === id)
                    if (!p) return null
                    const gone = !!drafted[id]
                    return (
                      <div key={id} style={{ ...S.row, opacity: gone ? 0.35 : 1 }}>
                        <span style={{ color: C.faint, width: 18 }}>{i + 1}</span>
                        <span style={{ ...S.posTag, background: posColor(p.pos) }}>{p.pos}</span>
                        <span style={{ flex: 1, minWidth: 0, textDecoration: gone ? 'line-through' : 'none' }}>{p.name}</span>
                        <button onClick={() => setQueue((q) => q.filter((x) => x !== id))} style={S.star}>✕</button>
                      </div>
                    )
                  })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── bits ───────────────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div style={{ marginBottom: 26 }}>
    <div style={{ fontSize: 11, letterSpacing: 1.4, color: C.faint, marginBottom: 10, textTransform: 'uppercase' }}>{label}</div>
    {children}
  </div>
)

const Chips = ({ options, value, onChange }) => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    {options.map((o) => (
      <button key={String(o.v)} onClick={() => onChange(o.v)} style={{ ...S.chip, ...(value === o.v ? S.chipOn : {}) }}>{o.l}</button>
    ))}
  </div>
)

const Budget = ({ label, value, sub }) => (
  <div style={{ textAlign: 'right' }}>
    <div style={{ fontSize: 10, color: C.faint, letterSpacing: 1 }}>{label}</div>
    <div style={{ fontWeight: 900, color: C.gold, fontSize: 18, lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: 10, color: C.faint }}>{sub}</div>
  </div>
)

// Always-visible cap tracker + roster-status indicator. Sticks under the header
// so it never scrolls out of view while the player list scrolls.
const fmtM = (n) => `$${Math.round(n)}M`
const CapStat = ({ label, value, color }) => (
  <span style={{ whiteSpace: 'nowrap' }}>
    <span style={{ color: C.faint }}>{label}: </span>
    <b style={{ color: color || C.text }}>{value}</b>
  </span>
)
const CapDot = () => <span style={{ color: C.faint }} aria-hidden>·</span>
const CapTracker = ({ cap, used, remaining, floor, mustSpend, spots, avg, status }) => {
  const statusColor = status.state === 'Legal Roster' ? C.green
    : status.state === 'Over Salary Cap' ? C.red
    : status.state === 'Below Cap Floor' || status.state === 'Missing Required Position' ? C.gold
    : C.dim
  return (
    <div style={S.capBar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: 12 }}>
        <CapStat label="Cap Used" value={`${fmtM(used)} of ${fmtM(cap)}`} color={used > cap ? C.red : C.gold} />
        <CapDot />
        <CapStat label="Remaining" value={fmtM(remaining)} color={remaining < 0 ? C.red : C.text} />
        <CapDot />
        <CapStat label="Floor" value={fmtM(floor)} />
        <CapDot />
        <CapStat label="Still Must Spend" value={fmtM(mustSpend)} color={mustSpend > 0 ? C.gold : C.green} />
        <CapDot />
        <CapStat label="Spots" value={String(spots)} />
        <CapDot />
        <CapStat label="Avg/Pick" value={`$${avg.toFixed(2)}M`} />
      </div>
      <div style={{ ...S.statusPill, color: statusColor, borderColor: `${statusColor}66` }}
        title={status.text} role="status">
        <span style={{ fontWeight: 900 }} aria-hidden>{status.icon}</span>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{status.text}</span>
      </div>
    </div>
  )
}

const S = {
  h1: { fontSize: 42, fontWeight: 900, margin: '16px 0 8px', fontFamily: "'Rajdhani', sans-serif" },
  card: { background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 },
  cardTitle: { fontWeight: 800, marginBottom: 10, fontSize: 14 },
  body: { display: 'grid', gap: 14, padding: 14, maxWidth: 1560, margin: '0 auto' },

  stickyHead: { position: 'sticky', top: 0, zIndex: 20 },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 18px', background: C.panel, borderBottom: `1px solid ${C.line}` },
  capBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '8px 18px', background: '#0D111A', borderBottom: `1px solid ${C.line}` },
  statusPill: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '5px 12px', border: '1px solid', borderRadius: 20, maxWidth: '52%' },
  clock: { fontSize: 30, fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif", minWidth: 62, textAlign: 'right' },

  ticker: { display: 'flex', gap: 8, padding: '10px 18px', overflowX: 'auto', borderBottom: `1px solid ${C.line}`, background: '#0D111A' },
  tick: { flexShrink: 0, fontSize: 12, color: C.dim, border: `1px solid ${C.line}`, borderRadius: 8, padding: '6px 12px', whiteSpace: 'nowrap' },

  blockBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '14px 18px', background: 'linear-gradient(90deg, rgba(212,168,67,0.12), transparent)', borderBottom: `1px solid ${C.line}`, flexWrap: 'wrap' },
  bidBtn: { background: C.gold, color: '#1a1405', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 900, cursor: 'pointer' },

  pRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderBottom: `1px solid ${C.line}`, cursor: 'pointer' },
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: `1px solid ${C.line}` },
  avatar: { width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: '#1b2233' },
  posTag: { fontSize: 10, fontWeight: 800, color: '#fff', borderRadius: 5, padding: '3px 6px', minWidth: 38, textAlign: 'center', flexShrink: 0 },
  slotChip: { fontSize: 11, fontWeight: 800, border: '1px solid', borderRadius: 20, padding: '5px 12px' },
  star: { background: 'transparent', border: 'none', fontSize: 15, cursor: 'pointer', color: C.faint },
  draftBtn: { background: C.green, color: '#06210f', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 800, cursor: 'pointer', flexShrink: 0, fontSize: 12 },
  off: { background: '#252c3b', color: C.faint, cursor: 'not-allowed' },
  draftBar: { display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderTop: `1px solid ${C.line}`, background: '#0D111A' },

  tab: { flex: 1, background: 'transparent', border: 'none', borderBottom: '2px solid transparent', color: C.dim, padding: '12px 8px', fontWeight: 700, cursor: 'pointer', fontSize: 13 },
  tabOn: { color: C.text, borderBottomColor: C.green },

  input: { width: '100%', background: '#0E121B', border: `1px solid ${C.line}`, borderRadius: 8, padding: '9px 12px', color: C.text, marginBottom: 10, outline: 'none' },
  posBtn: { background: 'transparent', border: `1px solid ${C.line}`, color: C.dim, borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 800, cursor: 'pointer', flexShrink: 0 },

  chip: { background: C.card, border: `1px solid ${C.line}`, color: C.dim, borderRadius: 10, padding: '9px 16px', fontWeight: 700, cursor: 'pointer' },
  chipOn: { borderColor: C.green, color: C.text, background: 'rgba(34,197,94,0.1)' },
  optCard: { background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: 15, cursor: 'pointer' },
  optOn: { borderColor: C.green, background: 'rgba(34,197,94,0.08)' },

  cta: { background: C.green, color: '#06210f', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 900, fontSize: 14, cursor: 'pointer' },
  ghost: { background: 'transparent', border: `1px solid ${C.line}`, color: C.text, borderRadius: 10, padding: '12px 24px', fontWeight: 700, cursor: 'pointer' },
  ghostSm: { background: 'transparent', border: `1px solid ${C.line}`, color: C.dim, borderRadius: 8, padding: '7px 12px', fontWeight: 700, cursor: 'pointer', fontSize: 12 },
  link: { background: 'transparent', border: 'none', color: C.dim, cursor: 'pointer', padding: 0, fontSize: 13 },
}
