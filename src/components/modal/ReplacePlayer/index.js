import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import PlayerAvatar from '../../PlayerAvatar'
import { positions as POS_MAP } from '../../../config/constants'
import { getPlayersByPosition, assignPlayerToStarter } from '../../../redux/actions/depthChartAction'
import './replacePlayer.css'

/* ReplacePlayer — the redesigned lineup-slot drawer. UI matches the supplied
   "Replace Player" design; the data + assignment reuse the existing depthChart
   actions (getPlayersByPosition / assignPlayerToStarter).

   The tabs, position/OVR/Projected pills, bye filter and week checkbox are all
   functional: tabs pick the source pool (bench / practiceSquad / injured), the
   pills filter + sort the visible list, and the week checkbox maps to the new
   `applyAllWeeks` flag on assignPlayerToStarter. */

const TABS = [
  { key: 'all', label: 'All Players' },
  { key: 'bench', label: 'Bench' },
  { key: 'practice', label: 'Practice Squad' },
  { key: 'ir', label: 'Injured Reserve' },
]
const EMPTY_MSG = {
  all: 'No available players for this position.',
  bench: 'No available players on your roster for this position.',
  practice: 'No players on your practice squad for this position.',
  ir: 'No players on injured reserve for this position.',
}
const num = (v) => { const n = Number(v); return isNaN(n) ? null : n }
const badge = (slot) => {
  if (slot?.classKey === 'special_team_pk') return 'K'
  if (slot?.classKey === 'special_team_pn') return 'P'
  if (slot?.classKey === 'offense_qb-2') return 'QB2'
  const p = slot?.Position
  return (POS_MAP[p] || p || '').toUpperCase()
}
const ovrOf = (p, scores) => { const pl = p?.players || p || {}; return num(pl.avgPf ?? scores?.apf?.[pl.PlayerID]) }
const projOf = (p, scores) => { const pl = p?.players || p || {}; return num(pl.pf ?? scores?.pf?.[pl.PlayerID]) }

const PlayerLine = ({ p, scores, selected, onSelect }) => {
  const pl = p?.players || p || {}
  const ovr = ovrOf(p, scores)
  const proj = projOf(p, scores)
  return (
    <button className={`rp-row${selected ? ' rp-row--sel' : ''}`} onClick={onSelect}>
      <span className="rp-star" aria-hidden>{selected ? '★' : '☆'}</span>
      <PlayerAvatar name={pl.Name} src={pl.HostedHeadshotNoBackgroundUrl} size={38} />
      <span className="rp-row-id">
        <span className="rp-row-name">{pl.Name || '--'}</span>
        <span className="rp-row-sub">{[pl.Position, pl.Team, pl.Age ? `Age: ${pl.Age}` : null].filter(Boolean).join(' · ')}</span>
      </span>
      <span className="rp-pos">{(POS_MAP[pl.Position] || pl.Position || '').toUpperCase()}</span>
      <span className="rp-stat"><span>OVR</span><b className="rp-ovr">{ovr != null ? Math.round(ovr) : '--'}</b></span>
      <span className="rp-stat"><span>Projected</span><b>{proj != null ? `${proj.toFixed(1)} pts` : '--'}</b></span>
      <span className="rp-stat"><span>Bye</span><b>{pl.ByeWeek || '--'}</b></span>
      <span className={`rp-select${selected ? ' rp-select--on' : ''}`}>{selected ? 'Selected' : 'Select'}</span>
    </button>
  )
}

export default function ReplacePlayer({ open, onClose, slot, formation, onDone, locked }) {
  const SETTING = useSelector((s) => s?.user?.setting)
  const curWeek = num(SETTING?.week)
  const [loading, setLoading] = useState(true)
  const [starter, setStarter] = useState(null)
  const [bench, setBench] = useState([])
  const [practiceSquad, setPracticeSquad] = useState([])
  const [injured, setInjured] = useState([])
  const [scores, setScores] = useState(null)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState(null) // null | 'ovr' | 'proj'
  const [hideBye, setHideBye] = useState(false)
  const [sel, setSel] = useState(null)
  // Week checkbox: unchecked = "Just Week N" (single week, the default/original
  // behaviour); checked = "Apply from Week N onward" (applyAllWeeks = true).
  const [applyOnward, setApplyOnward] = useState(false)
  const [saving, setSaving] = useState(false)

  const isBackup = slot?.Position === 'backup qb'
  const pos = badge(slot)

  useEffect(() => {
    if (!open || !slot) return
    let cancelled = false
    setLoading(true); setSel(null)
    setTab('all'); setSearch(''); setPosFilter('ALL'); setSortBy(null); setHideBye(false)
    ;(async () => {
      try {
        const res = await getPlayersByPosition({
          position: isBackup ? 'QB' : slot?.Position?.toUpperCase(),
          classKey: slot?.classKey,
          week: SETTING?.week,
          formation,
        })
        if (cancelled) return
        setStarter(res?.starterPlayer || null)
        setBench(Array.isArray(res?.bench) ? res.bench : [])
        setPracticeSquad(Array.isArray(res?.practiceSquad) ? res.practiceSquad : [])
        setInjured(Array.isArray(res?.injured) ? res.injured : [])
        setScores(res?.scores || null)
      } catch (e) { /* keep empty */ }
      setLoading(false)
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, slot?.classKey])

  // Source pool driven by the active tab. NOTE: the backend `bench` pool is
  // already scoped to the user's own roster (it comes from their SquadLineup),
  // so there is no separate "on my roster" flag to distinguish "All Players"
  // from "Bench" — both surface the same available pool.
  const source = useMemo(() => {
    if (tab === 'practice') return practiceSquad
    if (tab === 'ir') return injured
    return bench
  }, [tab, bench, practiceSquad, injured])

  // Positions actually present in the current pool. For single-position slots
  // this is one entry (static label); multi-position slots (FLEX / DT-DE etc.)
  // get a real dropdown offering only the positions the slot accepts.
  const availablePositions = useMemo(() => {
    const set = new Set()
    source.forEach((x) => { const p = (x?.players?.Position || '').toUpperCase(); if (p) set.add(p) })
    return Array.from(set).sort()
  }, [source])

  const list = useMemo(() => {
    let l = source
    if (search.trim()) { const q = search.toLowerCase(); l = l.filter((x) => (x?.players?.Name || '').toLowerCase().includes(q)) }
    if (posFilter !== 'ALL' && availablePositions.includes(posFilter)) {
      l = l.filter((x) => (x?.players?.Position || '').toUpperCase() === posFilter)
    }
    if (hideBye && curWeek != null) {
      l = l.filter((x) => num(x?.players?.ByeWeek) !== curWeek)
    }
    if (sortBy) {
      const val = sortBy === 'proj' ? projOf : ovrOf
      l = [...l].sort((a, b) => {
        const av = val(a, scores); const bv = val(b, scores)
        return (bv == null ? -Infinity : bv) - (av == null ? -Infinity : av)
      })
    }
    return l
  }, [source, search, posFilter, availablePositions, hideBye, curWeek, sortBy, scores])

  const confirm = async () => {
    if (!sel || locked) return
    setSaving(true)
    try {
      await assignPlayerToStarter({
        oldPlayerId: starter?.players?._id || '',
        playerId: sel,
        classKey: slot?.classKey,
        isBackup,
        week: SETTING?.week,
        applyAllWeeks: applyOnward,
      })
      await onDone?.()
      onClose()
    } finally { setSaving(false) }
  }

  if (!open || !slot) return null
  const sp = starter?.players
  const sOvr = num(sp?.avgPf ?? scores?.apf?.[sp?.PlayerID])
  const sProj = num(sp?.pf ?? scores?.pf?.[sp?.PlayerID])
  const weekLabel = curWeek != null ? curWeek : (SETTING?.week || 'One')

  return (
    <div className="rp-overlay" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="rp-modal">
        <button className="rp-x" onClick={onClose} aria-label="Close">✕</button>
        <div className="rp-title">Replace Player</div>
        <div className="rp-subtitle">Select a player to replace <b>{sp?.Name || 'this slot'}{pos ? ` (${pos})` : ''}</b></div>

        {/* Current starter */}
        <div className="rp-current">
          <PlayerAvatar name={sp?.Name} src={sp?.HostedHeadshotNoBackgroundUrl} size={52} />
          <div className="rp-current-id">
            <div className="rp-current-name">{sp?.Name || 'Empty slot'}</div>
            <div className="rp-current-sub">{[sp?.Position, sp?.Team].filter(Boolean).join(' · ') || pos}</div>
          </div>
          <span className="rp-pos">{pos}</span>
          <span className="rp-stat"><span>OVR</span><b className="rp-ovr">{sOvr != null ? Math.round(sOvr) : '--'}</b></span>
          <span className="rp-stat"><span>Projected</span><b>{sProj != null ? `${sProj.toFixed(1)} pts` : '--'}</b></span>
          <span className="rp-stat"><span>Bye</span><b>{sp?.ByeWeek || '--'}</b></span>
          <span className="rp-starter-tag">Starter</span>
        </div>
        <div className="rp-arrow" aria-hidden>&#8595;</div>

        {/* Tabs */}
        <div className="rp-tabs">
          {TABS.map((t) => <button key={t.key} className={`rp-tab${tab === t.key ? ' rp-tab--on' : ''}`} onClick={() => { setTab(t.key); setPosFilter('ALL') }}>{t.label}</button>)}
        </div>

        {/* Controls */}
        <div className="rp-controls">
          <div className="rp-search"><span aria-hidden>&#128269;</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search players…" /></div>
          {availablePositions.length > 1 ? (
            <select className="rp-pill rp-pill-select" value={posFilter} onChange={(e) => setPosFilter(e.target.value)} aria-label="Filter by position">
              <option value="ALL">All Pos</option>
              {availablePositions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          ) : (
            <span className="rp-pill rp-pill--static">{pos || availablePositions[0] || 'POS'}</span>
          )}
          <button type="button" className={`rp-pill${sortBy === 'ovr' ? ' rp-pill--on' : ''}`} onClick={() => setSortBy(sortBy === 'ovr' ? null : 'ovr')}>OVR ▾</button>
          <button type="button" className={`rp-pill${sortBy === 'proj' ? ' rp-pill--on' : ''}`} onClick={() => setSortBy(sortBy === 'proj' ? null : 'proj')}>Projected ▾</button>
          <button type="button" className={`rp-pill${hideBye ? ' rp-pill--on' : ''}`} onClick={() => setHideBye((v) => !v)} title="Hide players on a bye this week">⚑ Hide bye</button>
        </div>

        {/* List */}
        <div className="rp-list">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <div className="rp-skel" key={i} />)
          ) : list.length === 0 ? (
            <div className="rp-empty">{EMPTY_MSG[tab] || EMPTY_MSG.all}</div>
          ) : list.map((p, i) => (
            <PlayerLine key={p?.players?.PlayerID || i} p={p} scores={scores} selected={sel === p?.players?._id} onSelect={() => setSel(p?.players?._id)} />
          ))}
        </div>

        {/* Illegal-squad notice — you can browse, but can't save a lineup yet */}
        {locked && (
          <div className="rp-locked" role="alert">
            <span aria-hidden>&#9888;</span>
            Illegal squad — set exactly 46 active and 7 inactive players in My Squad before you can save your lineup.
          </div>
        )}

        {/* Footer */}
        <div className="rp-footer">
          <label className="rp-check">
            <input type="checkbox" checked={applyOnward} onChange={(e) => setApplyOnward(e.target.checked)} />
            {applyOnward ? `Apply from Week ${weekLabel} onward` : `Just Week ${weekLabel}`}
          </label>
          <div className="rp-footer-btns">
            <button className="rp-btn rp-btn--ghost" onClick={onClose}>Cancel</button>
            <button className="rp-btn rp-btn--go" disabled={!sel || saving || locked} onClick={confirm} title={locked ? 'Fix your squad (46 active + 7 inactive) to save a lineup' : undefined}>{saving ? 'Saving…' : locked ? 'Locked' : 'Confirm Replacement'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
