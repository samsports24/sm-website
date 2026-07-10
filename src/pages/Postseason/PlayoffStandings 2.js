import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Spin, Empty } from 'antd'
import Header from '../../components/Header'
import { getPostseasonState } from '../../redux/actions/postseasonAction'

const PlayoffStandings = () => {
  const { state: ps, loading } = useSelector((s) => s.postseason)

  useEffect(() => {
    getPostseasonState()
  }, [])

  const conf1 = ps?.qualifiedTeams?.filter((t) => t.conference === 1).sort((a, b) => a.seed - b.seed) || []
  const conf2 = ps?.qualifiedTeams?.filter((t) => t.conference === 2).sort((a, b) => a.seed - b.seed) || []

  return (
    <div className="postseason-page">
      <Header />
      <main className="postseason-main ps-standings-main">
        <Spin spinning={loading}>
          <div className="ps-standings-header">
            <h1>Playoff Standings</h1>
            <p>14-Team Single Elimination &middot; Week {ps?.currentWeek || '—'}</p>
          </div>

          {ps ? (
            <div className="ps-standings-grid">
              <ConferenceStandings label="Conference 1" teams={conf1} />
              <ConferenceStandings label="Conference 2" teams={conf2} />
            </div>
          ) : (
            <Empty description="Postseason has not been initialized" />
          )}
        </Spin>
      </main>
    </div>
  )
}

const ConferenceStandings = ({ label, teams }) => {
  return (
    <div className="ps-conf-col">
      <div className="ps-conf-header">
        <div className="ps-conf-accent" />
        <h2>{label}</h2>
      </div>

      <div className="ps-conf-table">
        <div className="ps-conf-table-head">
          <span className="ps-th ps-th-seed">#</span>
          <span className="ps-th ps-th-team">Team</span>
          <span className="ps-th ps-th-record">Record</span>
          <span className="ps-th ps-th-pf">PF</span>
          <span className="ps-th ps-th-type">Type</span>
          <span className="ps-th ps-th-status">Status</span>
        </div>

        {teams.map((entry, idx) => {
          const team = entry.team
          const winPct = (entry.regSeasonWins + entry.regSeasonLosses) > 0
            ? (entry.regSeasonWins / (entry.regSeasonWins + entry.regSeasonLosses) * 100).toFixed(1)
            : '0.0'

          return (
            <React.Fragment key={entry.seed}>
              {/* Seed 7 line, visual cutoff between guaranteed and wild card */}
              {idx === 4 && (
                <div className="ps-wc-divider">
                  <span>── Wild Card Line ──</span>
                </div>
              )}
              <div
                className={`ps-conf-row ${entry.isEliminated ? 'ps-row-eliminated' : ''} ${
                  entry.seed === 1 ? 'ps-row-bye' : ''
                }`}
              >
                <span className="ps-td ps-td-seed">
                  <span className={`ps-seed-badge ${entry.seed === 1 ? 'ps-seed-1' : ''}`}>
                    {entry.seed}
                  </span>
                </span>
                <span className="ps-td ps-td-team">
                  <div className="ps-team-logo-sm"
                    style={{ backgroundImage: `url(${team?.logo || ''})` }}
                  />
                  <span className="ps-team-name">{team?.name || 'Unknown'}</span>
                  <span className="ps-team-abbr">{team?.abbreviation || ''}</span>
                </span>
                <span className="ps-td ps-td-record">
                  {entry.regSeasonWins}-{entry.regSeasonLosses}
                  <span className="ps-win-pct">{winPct}%</span>
                </span>
                <span className="ps-td ps-td-pf">
                  {entry.regSeasonPointsFor?.toFixed(1) || '0.0'}
                </span>
                <span className="ps-td ps-td-type">
                  {entry.isDivisionWinner ? (
                    <span className="ps-type-div">DIV</span>
                  ) : (
                    <span className="ps-type-wc">WC</span>
                  )}
                </span>
                <span className="ps-td ps-td-status">
                  {entry.isEliminated ? (
                    <span className="ps-status-out">ELIMINATED</span>
                  ) : entry.seed === 1 && ps?.currentWeek === 19 ? (
                    <span className="ps-status-bye">BYE</span>
                  ) : (
                    <span className="ps-status-alive">ALIVE</span>
                  )}
                </span>
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default PlayoffStandings
