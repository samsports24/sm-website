import React, { useState } from 'react'
import { notification } from 'antd'
import { useSelector } from 'react-redux'
import PlayerAvatar from '../../PlayerAvatar'
import { PlayerPoached } from '../../../redux/actions/rosterAction'
import { getPf } from '../../../config/helperFunctions'

/* ── Roster Board player pop-up ──
   Shows a scouted player's details, stats, contract and market value, plus a
   Poach action for another team's unprotected practice-squad players.
   All data read defensively — any field without a value is hidden, not faked. */

const num = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v))
const money = (v) => (num(v) == null ? null : `$${(Number(v) / 1_000_000).toFixed(1)}M`)
const scoreOf = (pl) => {
  if (Array.isArray(pl?.playerScore)) return Number(getPf(pl.playerScore)?.apf) || 0
  if (Array.isArray(pl?.scores)) return Number(getPf(pl.scores)?.apf) || 0
  return Number(pl?.projectedPoints ?? pl?.projected ?? pl?.pf ?? pl?.avgPf ?? 0) || 0
}
const ovrOf = (pl) => num(pl?.OVR ?? pl?.overall ?? pl?.ovr ?? pl?.rating)

const RosterPlayerPopup = ({ entry, teamId, teamName, isOwnTeam, onClose, onPoached }) => {
  const user = useSelector((s) => s.user?.userDetails)
  const SETTING = useSelector((s) => s?.user?.setting)
  const currentLeague = useSelector((s) => s.league?.currentLeague)
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const pl = entry?.players
  if (!pl) return null

  const poachingDisabled = currentLeague?.practiceSquadPoachingEnabled === false
  const isPractice = !!pl.inPracticeSquad
  const isProtected = !!pl.isPlayerProtected
  const canPoach = !isOwnTeam && isPractice && !isProtected

  const ovr = ovrOf(pl)
  const proj = scoreOf(pl)
  const salary = money(pl.currentYearSalaryCap ?? pl.salary ?? pl.contractSalary)
  const marketVal = num(pl.marketValue ?? pl.value ?? pl.ktcValue ?? pl.tradeValue)

  const statRows = [
    ['Pass Yds', pl.PassingYards], ['Pass TD', pl.PassingTouchdowns],
    ['Rush Yds', pl.RushingYards], ['Rush TD', pl.RushingTouchdowns],
    ['Rec', pl.Receptions], ['Rec Yds', pl.ReceivingYards],
    ['Tackles', pl.Tackles ?? pl.TacklesForLoss], ['Sacks', pl.Sacks],
    ['INT', pl.Interceptions ?? pl.PassingInterceptions], ['FG', pl.FieldGoalsMade],
  ].filter(([, v]) => num(v) != null).slice(0, 6)

  const doPoach = async () => {
    setBusy(true)
    try {
      const res = await PlayerPoached({
        league: user?.team?.currentLeague?._id || currentLeague?._id,
        PlayerID: pl.PlayerID,
        player_id: pl._id,
        team: teamId,
        season: SETTING?.season,
        week: SETTING?.week,
        playercurrentsalaryprice: pl.currentYearSalaryCap,
        poachBy: { teamName: user?.team?.name, teamid: user?.team?._id, user: user?._id },
      })
      if (res !== false) {
        notification.success({ message: `Poach initiated for ${pl.Name}`, duration: 3 })
        ;(onPoached || onClose)?.()
      }
    } finally {
      setBusy(false)
      setConfirm(false)
    }
  }

  const statusChips = []
  if (pl.isActive === false || isPractice) statusChips.push({ t: isPractice ? 'PRACTICE SQUAD' : 'INACTIVE', c: '#f6c453' })
  else statusChips.push({ t: 'ACTIVE', c: '#24d26c' })
  if (isProtected) statusChips.push({ t: 'PROTECTED', c: '#06b6d4' })
  if (entry?.source === 'dynasty') statusChips.push({ t: 'DYNASTY', c: '#b794ff' })
  if (entry?.source === 'supplemental') statusChips.push({ t: 'SUPPLEMENTAL', c: '#3b82f6' })

  return (
    <div className="rb-pp-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className="rb-pp" role="dialog" aria-modal="true" aria-label={`${pl.Name} details`}>
        <button className="rb-pp-x" onClick={onClose} aria-label="Close">×</button>

        <div className="rb-pp-head">
          <div className="rb-pp-avatar"><PlayerAvatar name={pl.Name} src={pl.HostedHeadshotNoBackgroundUrl} size={70} /></div>
          <div className="rb-pp-headmain">
            <div className="rb-pp-name">{pl.Name || 'Unknown'}</div>
            <div className="rb-pp-meta">{[pl.Position, pl.Team, pl.Number ? `#${pl.Number}` : null].filter(Boolean).join(' · ')}</div>
            <div className="rb-pp-chips">
              {statusChips.map((c, i) => (
                <span key={i} className="rb-pp-chip" style={{ color: c.c, borderColor: c.c }}>{c.t}</span>
              ))}
            </div>
          </div>
          {ovr != null && (
            <div className="rb-pp-ovr"><div className="rb-pp-ovr-num">{ovr}</div><div className="rb-pp-ovr-lbl">OVR</div></div>
          )}
        </div>

        <div className="rb-pp-tiles">
          <Tile v={proj.toFixed(1)} l="Proj" accent="#b794ff" />
          {teamName && <Tile v={teamName} l="Team" small />}
          {salary && <Tile v={salary} l="Salary" />}
          {marketVal != null && <Tile v={marketVal.toLocaleString()} l="Value" accent="#24d26c" />}
        </div>

        {statRows.length > 0 && (
          <div className="rb-pp-sec">
            <div className="rb-pp-sec-title" style={{ color: '#24d26c' }}>Statistics</div>
            <div className="rb-pp-statgrid">
              {statRows.map(([k, v]) => (
                <div key={k} className="rb-pp-statrow"><span>{k}</span><b>{Number(v).toLocaleString()}</b></div>
              ))}
            </div>
          </div>
        )}

        {(salary || marketVal != null) && (
          <div className="rb-pp-two">
            {salary && (
              <div>
                <div className="rb-pp-sec-title" style={{ color: '#f6c453' }}>Contract</div>
                <div className="rb-pp-kv"><span>Salary</span><b>{salary}</b></div>
                {pl.contractYears != null && <div className="rb-pp-kv"><span>Years</span><b>{pl.contractYears}</b></div>}
              </div>
            )}
            {marketVal != null && (
              <div>
                <div className="rb-pp-sec-title" style={{ color: '#b794ff' }}>Market Value</div>
                <div className="rb-pp-val">{marketVal.toLocaleString()}</div>
              </div>
            )}
          </div>
        )}

        <div className="rb-pp-actions">
          {canPoach ? (
            confirm ? (
              <>
                <button className="rb-pp-btn rb-pp-btn-poach" disabled={busy} onClick={doPoach}>
                  {busy ? 'Poaching…' : `Confirm poach ${pl.Name?.split(' ')?.slice(-1)[0] || ''}`}
                </button>
                <button className="rb-pp-btn rb-pp-btn-ghost" disabled={busy} onClick={() => setConfirm(false)}>Cancel</button>
              </>
            ) : (
              <button
                className="rb-pp-btn rb-pp-btn-poach"
                disabled={poachingDisabled}
                title={poachingDisabled ? 'Poaching disabled by commissioner' : ''}
                onClick={() => setConfirm(true)}
              >
                {poachingDisabled ? 'Poaching Disabled' : 'Poach Player'}
              </button>
            )
          ) : (
            <div className="rb-pp-note">
              {isOwnTeam
                ? 'This is one of your own players.'
                : isProtected
                  ? 'Protected — cannot be poached.'
                  : isPractice
                    ? 'Available to poach when eligible.'
                    : 'Only unprotected practice-squad players can be poached.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const Tile = ({ v, l, accent, small }) => (
  <div className="rb-pp-tile">
    <div className="rb-pp-tile-v" style={{ color: accent || '#fff', fontSize: small ? 14 : undefined }}>{v}</div>
    <div className="rb-pp-tile-l">{l}</div>
  </div>
)

export default RosterPlayerPopup
