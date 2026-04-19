import React, { useMemo, useState } from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'

const STAT_COLS = [
  { key: 'record', label: 'W-L-T', width: 52 },
  { key: 'pct', label: 'PCT', width: 42 },
  { key: 'pf', label: 'PF', width: 38 },
  { key: 'pa', label: 'PA', width: 38 },
  { key: 'diff', label: '+/-', width: 38 },
]

const LeagueStandings = ({ data, maxHeight }) => {
  const navigate = useNavigate()
  const [collapsedDivs, setCollapsedDivs] = useState({})

  const teamRanks = data?.teamRanks || []
  const teams = data?.teams || []

  const hasDivisions = useMemo(() => teams.some((t) => t?.division?.name), [teams])

  const divisionGroups = useMemo(() => {
    if (!teamRanks.length || !teams.length) return []

    if (!hasDivisions) {
      const allTeams = teamRanks.map((rank) => {
        const team = teams.find((t) => String(rank?.teamId) === String(t?._id))
        return { rank, team }
      })
      allTeams.sort((a, b) => {
        const wDiff = (b.rank?.teamScore?.win || 0) - (a.rank?.teamScore?.win || 0)
        if (wDiff !== 0) return wDiff
        return (b.rank?.teamScore?.avgPf || 0) - (a.rank?.teamScore?.avgPf || 0)
      })
      return [{ division: null, conference: null, teams: allTeams }]
    }

    const groups = {}
    teamRanks.forEach((rank) => {
      const team = teams.find((t) => String(rank?.teamId) === String(t?._id))
      const divName = team?.division?.name || 'Unassigned'
      const confName = team?.conference?.name || ''
      if (!groups[divName]) groups[divName] = { division: divName, conference: confName, teams: [] }
      groups[divName].teams.push({ rank, team })
    })
    Object.values(groups).forEach((g) => {
      g.teams.sort((a, b) => {
        const wDiff = (b.rank?.teamScore?.win || 0) - (a.rank?.teamScore?.win || 0)
        if (wDiff !== 0) return wDiff
        return (b.rank?.teamScore?.avgPf || 0) - (a.rank?.teamScore?.avgPf || 0)
      })
    })
    return Object.values(groups).sort((a, b) => (a.division || '').localeCompare(b.division || ''))
  }, [teamRanks, teams, hasDivisions])

  const toggleDiv = (name) => setCollapsedDivs((prev) => ({ ...prev, [name]: !prev[name] }))

  const getStat = (s, key) => {
    switch (key) {
      case 'record': {
        const w = s.win ?? 0
        const l = s.lose ?? 0
        const t = s.tie ?? 0
        return `${w}-${l}${t ? `-${t}` : ''}`
      }
      case 'pct': {
        const w = s.win ?? 0
        const l = s.lose ?? 0
        const t = s.tie ?? 0
        const total = w + l + t
        return total > 0 ? (w / total).toFixed(3).replace(/^0/, '') : '.000'
      }
      case 'pf': return s.avgPf?.toFixed(1) ?? '0.0'
      case 'pa': return s.avgPa?.toFixed(1) ?? '0.0'
      case 'diff': {
        const d = (s.avgPf || 0) - (s.avgPa || 0)
        const str = d.toFixed(1)
        return d > 0 ? `+${str}` : str
      }
      default: return '—'
    }
  }

  const getDiffClass = (s) => {
    const d = (s.avgPf || 0) - (s.avgPa || 0)
    if (d > 0) return 'ls-diff-pos'
    if (d < 0) return 'ls-diff-neg'
    return ''
  }

  return (
    <div className='ls'>
      {/* ── Header ── */}
      <div className='ls-hdr'>
        <div className='ls-hdr-left'>
          <div className='ls-hdr-icon'>
            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
              <polyline points='22 12 18 12 15 21 9 3 6 12 2 12' />
            </svg>
          </div>
          <h3 className='ls-hdr-title'>Standings</h3>
        </div>
        <span className='ls-hdr-link' onClick={() => navigate('/league-standings')}>
          Details <BiRightArrowAlt size={14} />
        </span>
      </div>

      {/* ── Column Headers ── */}
      <div className='ls-cols'>
        <span className='ls-col-rank'>#</span>
        <span className='ls-col-team'>TEAM</span>
        {STAT_COLS.map((c) => (
          <span key={c.key} className='ls-col-stat' style={{ width: c.width }}>
            {c.label}
          </span>
        ))}
      </div>

      {/* ── Body ── */}
      <div className='ls-body' style={{ maxHeight: maxHeight || '1100px' }}>
        {divisionGroups.map((group, gi) => {
          const collapsed = collapsedDivs[group.division] === true
          return (
            <div key={group.division || gi} className='ls-div'>
              {/* Division header */}
              {group.division && (
                <div className='ls-div-hdr' onClick={() => toggleDiv(group.division)}>
                  <div className='ls-div-left'>
                    <span className='ls-div-dot' />
                    <span className='ls-div-name'>{group.division}</span>
                    {group.conference && <span className='ls-div-conf'>{group.conference}</span>}
                  </div>
                  <span className={`ls-chev ${collapsed ? 'ls-chev--closed' : ''}`}>&#9662;</span>
                </div>
              )}

              {/* Rows */}
              {!collapsed && (
                <div className='ls-rows'>
                  {group.teams.map(({ rank, team }, idx) => {
                    const s = rank?.teamScore || {}
                    const isFirst = idx === 0
                    return (
                      <div key={rank?._id || idx} className={`ls-row ${isFirst ? 'ls-row--first' : ''}`}>
                        <span className={`ls-rank ${isFirst ? 'ls-rank--first' : ''}`}>{idx + 1}</span>
                        <div className='ls-team'>
                          {team?.logo ? (
                            <img src={team.logo} className='ls-logo' alt='' />
                          ) : (
                            <div className='ls-logo-ph' style={{ background: team?.teamColor || '#22C55E' }}>
                              {(team?.name || '?').charAt(0)}
                            </div>
                          )}
                          <div className='ls-team-info'>
                            <span className='ls-team-name'>{team?.name || 'Unknown'}</span>
                            {team?.user?.name && <span className='ls-owner'>{team.user.name}</span>}
                          </div>
                        </div>
                        {STAT_COLS.map((c) => (
                          <span
                            key={c.key}
                            className={`ls-val ${c.key === 'record' ? 'ls-val--bold' : ''} ${c.key === 'diff' ? getDiffClass(s) : ''}`}
                            style={{ width: c.width }}
                          >
                            {getStat(s, c.key)}
                          </span>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {divisionGroups.length === 0 && (
          <div className='ls-empty'>No standings data yet</div>
        )}
      </div>
    </div>
  )
}

export default LeagueStandings
