import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Spin } from 'antd'

import Header from '../components/Header'
import { getLeagueStandings } from '../redux'
import HeadingAndWeek from '../components/Pagination/HeadingAndWeek'

import '../styles/pages/leagueStandingsFull.css'

const LeagueStandings = () => {
  const setting = useSelector((state) => state?.user?.setting)
  const USER = useSelector((state) => state.user?.userDetails)
  const currentLeagueId = useSelector((state) => state?.user?.userDetails?.team?.currentLeague?._id)
  const navigate = useNavigate()
  const [standings, setStandings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentLeagueId) {
      getData()
    } else {
      setStandings(null)
      setLoading(false)
    }
  }, [setting?.week, currentLeagueId])

  const getData = async () => {
    setLoading(true)
    const data = await getLeagueStandings(setting?.week)
    setStandings(data)
    setLoading(false)
  }

  const handleTeamClick = (teamId) => {
    if (USER?.team?._id === teamId) {
      navigate('/player-roster')
    } else {
      navigate(`/team-roster/${teamId}`)
    }
  }

  const handleStartersClick = (teamId, teamName) => {
    if (USER?.team?._id === teamId) {
      navigate('/depth-chart')
    } else {
      navigate(`/team-starters/${teamId}`, { state: { teamName } })
    }
  }

  // Group divisions by conference
  const conferences = {}
  standings?.teamRanks?.forEach((div) => {
    const conf = div?.conference || 'League'
    if (!conferences[conf]) conferences[conf] = []
    conferences[conf].push(div)
  })

  return (
    <div className='lsf-page'>
      <Header />
      <HeadingAndWeek />
      <hr className='divider' />

      <div className='lsf-content'>
        <h2 className='lsf-page-title'>League Standings</h2>

        {loading ? (
          <div className='lsf-loader'>
            <Spin size='large' />
          </div>
        ) : (
          <div className='lsf-conferences'>
            {Object.entries(conferences).map(([confName, divisions]) => (
              <div key={confName} className='lsf-conference'>
                <div className='lsf-conf-header'>
                  <span className='lsf-conf-bar' />
                  <h3 className='lsf-conf-name'>{confName}</h3>
                </div>

                {divisions.map((div) => (
                  <DivisionTable
                    key={div._id}
                    division={div}
                    onTeamClick={handleTeamClick}
                    onStartersClick={handleStartersClick}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Division Table ── */
const DivisionTable = ({ division, onTeamClick, onStartersClick }) => {
  const sorted = [...(division?.standing || [])].sort((a, b) => {
    const wDiff = (b.teamScore?.win || 0) - (a.teamScore?.win || 0)
    if (wDiff !== 0) return wDiff
    return (b.teamScore?.avgPf || 0) - (a.teamScore?.avgPf || 0)
  })

  const leaderWins = sorted[0]?.teamScore?.win || 0
  const leaderLosses = sorted[0]?.teamScore?.lose || 0

  const calcGB = (wins, losses) => {
    const gb = ((leaderWins - wins) + (losses - leaderLosses)) / 2
    return gb === 0 ? '—' : gb.toFixed(1)
  }

  return (
    <div className='lsf-division'>
      <div className='lsf-div-label'>
        <span className='lsf-div-dot' />
        <span className='lsf-div-name'>{division._id}</span>
      </div>

      {/* Table */}
      <div className='lsf-table-wrap'>
        <div className='lsf-table-head'>
          <span className='lsf-th lsf-th-rank'>#</span>
          <span className='lsf-th lsf-th-team'>Team</span>
          <span className='lsf-th lsf-th-num'>W</span>
          <span className='lsf-th lsf-th-num'>L</span>
          <span className='lsf-th lsf-th-num'>T</span>
          <span className='lsf-th lsf-th-num'>PCT</span>
          <span className='lsf-th lsf-th-num'>GB</span>
          <span className='lsf-th lsf-th-num'>PF</span>
          <span className='lsf-th lsf-th-num'>PA</span>
          <span className='lsf-th lsf-th-num'>AVG PF</span>
          <span className='lsf-th lsf-th-num'>AVG PA</span>
          <span className='lsf-th lsf-th-rec'>DIV</span>
          <span className='lsf-th lsf-th-rec'>CONF</span>
          <span className='lsf-th lsf-th-act'></span>
        </div>

        {sorted.map((entry, idx) => {
          const s = entry.teamScore || {}
          const team = entry.team || {}
          const w = s.win || 0
          const l = s.lose || 0
          const t = s.tie || 0
          const total = w + l + t
          const pct = total > 0 ? (w / total).toFixed(3) : '.000'
          const gb = calcGB(w, l)
          const isLeader = idx === 0

          return (
            <div
              key={entry._id || idx}
              className={`lsf-row ${isLeader ? 'lsf-row-leader' : ''}`}
            >
              <span className={`lsf-td lsf-th-rank ${isLeader ? 'lsf-rank-top' : ''}`}>
                {idx + 1}
              </span>
              <div
                className='lsf-td lsf-td-team'
                onClick={() => onTeamClick(entry.teamId)}
              >
                {team?.logo ? (
                  <img src={team.logo} className='lsf-logo' alt='' />
                ) : (
                  <div
                    className='lsf-logo-ph'
                    style={{ background: team?.teamColor || '#1A2332' }}
                  >
                    {(team?.name || '?').charAt(0)}
                  </div>
                )}
                <div className='lsf-team-meta'>
                  <span className='lsf-name'>{team?.name || 'Unknown'}</span>
                  {team?.user?.userName && (
                    <span className='lsf-owner'>{team.user.userName}</span>
                  )}
                </div>
              </div>
              <span className='lsf-td lsf-th-num lsf-wins'>{w}</span>
              <span className='lsf-td lsf-th-num'>{l}</span>
              <span className='lsf-td lsf-th-num'>{t}</span>
              <span className='lsf-td lsf-th-num'>{pct}</span>
              <span className='lsf-td lsf-th-num lsf-gb'>{gb}</span>
              <span className='lsf-td lsf-th-num'>{s.pf?.toFixed(1) ?? '—'}</span>
              <span className='lsf-td lsf-th-num'>{s.pa?.toFixed(1) ?? '—'}</span>
              <span className='lsf-td lsf-th-num'>{s.avgPf?.toFixed(1) ?? '—'}</span>
              <span className='lsf-td lsf-th-num'>{s.avgPa?.toFixed(1) ?? '—'}</span>
              <span className='lsf-td lsf-th-rec'>
                {s.divWin ?? 0}-{s.divLose ?? 0}-{s.divTie ?? 0}
              </span>
              <span className='lsf-td lsf-th-rec'>
                {s.confWin ?? 0}-{s.confLose ?? 0}-{s.confTie ?? 0}
              </span>
              <span className='lsf-td lsf-th-act'>
                <button
                  className='lsf-starters-btn'
                  onClick={(e) => {
                    e.stopPropagation()
                    onStartersClick(entry.teamId, team?.name)
                  }}
                >
                  Starters
                </button>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LeagueStandings
