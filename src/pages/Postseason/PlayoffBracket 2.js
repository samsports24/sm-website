import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Spin, Empty, Button, Tag } from 'antd'
import { TrophyOutlined } from '@ant-design/icons'
import Header from '../../components/Header'
import { getPostseasonState } from '../../redux/actions/postseasonAction'

const WEEK_LABELS = {
  19: 'Wild Card',
  20: 'Divisional',
  21: 'Conf Finals',
  23: 'Super Bowl LXI',
}

const PlayoffBracket = () => {
  const { state: ps, loading } = useSelector((s) => s.postseason)
  const [activeConf, setActiveConf] = useState('both')

  useEffect(() => {
    getPostseasonState()
  }, [])

  const conf1 = ps?.qualifiedTeams?.filter((t) => t.conference === 1) || []
  const conf2 = ps?.qualifiedTeams?.filter((t) => t.conference === 2) || []

  const wcGames1 = ps?.bracket?.wildCard?.filter((g) => g.conference === 1) || []
  const wcGames2 = ps?.bracket?.wildCard?.filter((g) => g.conference === 2) || []
  const divGames1 = ps?.bracket?.divisional?.filter((g) => g.conference === 1) || []
  const divGames2 = ps?.bracket?.divisional?.filter((g) => g.conference === 2) || []
  const ccGames = ps?.bracket?.conferenceChamp || []
  const sb = ps?.bracket?.superBowl

  return (
    <div className="postseason-page">
      <Header />
      <main className="postseason-main ps-bracket-main">
        <Spin spinning={loading}>
          {/* Title bar */}
          <div className="ps-bracket-header">
            <div>
              <h1>
                <TrophyOutlined className="ps-trophy" />
                {WEEK_LABELS[ps?.currentWeek] || 'Playoffs'}, Week {ps?.currentWeek || '—'}
              </h1>
              <p className="ps-bracket-subtitle">Dynasty 32 Single-Elimination Bracket</p>
            </div>
            <div className="ps-conf-toggle">
              {['both', 'conf1', 'conf2'].map((v) => (
                <button
                  key={v}
                  onClick={() => setActiveConf(v)}
                  className={`ps-toggle-btn ${activeConf === v ? 'ps-toggle-active' : ''}`}
                >
                  {v === 'both' ? 'Both' : v === 'conf1' ? 'Conf 1' : 'Conf 2'}
                </button>
              ))}
            </div>
          </div>

          {/* Week timeline */}
          <div className="ps-timeline">
            {[19, 20, 21, 23].map((wk) => (
              <div
                key={wk}
                className={`ps-tl-step ${
                  wk === ps?.currentWeek ? 'ps-tl-active' :
                  wk < (ps?.currentWeek || 0) ? 'ps-tl-done' : 'ps-tl-upcoming'
                }`}
              >
                Wk {wk}: {WEEK_LABELS[wk]}
              </div>
            ))}
          </div>

          {ps ? (
            <div className="ps-bracket-grid">
              {/* Conference 1 */}
              {(activeConf === 'both' || activeConf === 'conf1') && (
                <ConferenceBracket
                  label="Conference 1"
                  confTeams={conf1}
                  wcGames={wcGames1}
                  divGames={divGames1}
                  ccGame={ccGames.find((g) => g.conference === 1)}
                  currentWeek={ps.currentWeek}
                />
              )}

              {/* Super Bowl */}
              {activeConf === 'both' && sb && (
                <div className="ps-superbowl-col">
                  <div className="ps-sb-card">
                    <div className="ps-sb-header">
                      <TrophyOutlined />
                      <span>Super Bowl LXI</span>
                    </div>
                    {sb.homeTeam ? (
                      <div className="ps-sb-matchup">
                        <BracketTeam team={sb.homeTeam} isWinner={sb.winner && String(sb.winner._id || sb.winner) === String(sb.homeTeam._id || sb.homeTeam)} />
                        <span className="ps-sb-vs">VS</span>
                        <BracketTeam team={sb.awayTeam} isWinner={sb.winner && String(sb.winner._id || sb.winner) === String(sb.awayTeam._id || sb.awayTeam)} />
                      </div>
                    ) : (
                      <p className="ps-sb-tbd">TBD vs TBD</p>
                    )}
                    {sb.completed && sb.winner && (
                      <div className="ps-sb-champion">
                        <TrophyOutlined /> CHAMPION
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Conference 2 */}
              {(activeConf === 'both' || activeConf === 'conf2') && (
                <ConferenceBracket
                  label="Conference 2"
                  confTeams={conf2}
                  wcGames={wcGames2}
                  divGames={divGames2}
                  ccGame={ccGames.find((g) => g.conference === 2)}
                  currentWeek={ps.currentWeek}
                />
              )}
            </div>
          ) : (
            <Empty description="Postseason not yet initialized" />
          )}
        </Spin>
      </main>
    </div>
  )
}

// ── Conference Bracket Column ───────────────────────────────
const ConferenceBracket = ({ label, confTeams, wcGames, divGames, ccGame, currentWeek }) => {
  const seed1 = confTeams.find((t) => t.seed === 1)

  return (
    <div className="ps-conf-bracket">
      <div className="ps-conf-bracket-header">
        <div className="ps-conf-bar" />
        <h2>{label}</h2>
      </div>

      {/* BYE team */}
      {seed1 && currentWeek === 19 && (
        <div className="ps-bye-card">
          <Tag color="gold">BYE</Tag>
          <span className="ps-bye-team">#{seed1.seed} {seed1.team?.name || 'Seed 1'}</span>
        </div>
      )}

      {/* Wild Card */}
      {wcGames.length > 0 && (
        <div className="ps-round-section">
          <h4 className="ps-round-label">Wild Card</h4>
          {wcGames.map((game, i) => (
            <MatchupCard key={i} game={game} />
          ))}
        </div>
      )}

      {/* Divisional */}
      {divGames.length > 0 && (
        <div className="ps-round-section">
          <h4 className="ps-round-label">
            Divisional
            {divGames.some((g) => g.reseeded) && (
              <span className="ps-reseed-tag">↻ Re-seeded</span>
            )}
          </h4>
          {divGames.map((game, i) => (
            <MatchupCard key={i} game={game} />
          ))}
        </div>
      )}

      {/* Conference Finals */}
      {ccGame && (
        <div className="ps-round-section">
          <h4 className="ps-round-label">Conf Finals</h4>
          <MatchupCard game={ccGame} />
        </div>
      )}
    </div>
  )
}

// ── Matchup Card ────────────────────────────────────────────
const MatchupCard = ({ game }) => {
  const homeTeam = game.homeTeam
  const awayTeam = game.awayTeam
  const isComplete = game.completed

  return (
    <div className={`ps-matchup-card ${isComplete ? 'ps-matchup-done' : ''}`}>
      <BracketTeam
        team={homeTeam}
        seed={game.homeSeed}
        score={game.homeScore}
        isWinner={isComplete && game.winner && String(game.winner._id || game.winner) === String(homeTeam?._id || homeTeam)}
        isLoser={isComplete && game.winner && String(game.winner._id || game.winner) !== String(homeTeam?._id || homeTeam)}
      />
      <div className="ps-matchup-divider">
        <span>VS</span>
      </div>
      <BracketTeam
        team={awayTeam}
        seed={game.awaySeed}
        score={game.awayScore}
        isWinner={isComplete && game.winner && String(game.winner._id || game.winner) === String(awayTeam?._id || awayTeam)}
        isLoser={isComplete && game.winner && String(game.winner._id || game.winner) !== String(awayTeam?._id || awayTeam)}
      />
    </div>
  )
}

// ── Team Pill ───────────────────────────────────────────────
const BracketTeam = ({ team, seed, score, isWinner, isLoser }) => {
  return (
    <div className={`ps-bracket-team ${isWinner ? 'ps-team-winner' : ''} ${isLoser ? 'ps-team-loser' : ''}`}>
      {seed && <span className="ps-bracket-seed">#{seed}</span>}
      <div
        className="ps-bracket-logo"
        style={{ backgroundImage: `url(${team?.logo || ''})` }}
      />
      <span className="ps-bracket-name">{team?.name || team?.abbreviation || 'TBD'}</span>
      {score !== undefined && score !== null && (
        <span className="ps-bracket-score">{score}</span>
      )}
      {isWinner && <span className="ps-winner-icon">✓</span>}
    </div>
  )
}

export default PlayoffBracket
