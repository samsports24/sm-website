import React, { useEffect, useState, useCallback } from 'react'
import { Spin, Empty, Tag, InputNumber, Button, Modal, message } from 'antd'
import { TrophyOutlined, SettingOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import Header from '../../components/Header'
import { soccerAPI, attachSoccerToken } from '../../soccer/config/constants'

import '../../styles/pages/worldCup.css'

const PHASE_LABELS = {
  setup: 'Setup',
  group_stage: 'Group Stage',
  round_of_32: 'Round of 32',
  round_of_16: 'Round of 16',
  quarter_final: 'Quarter-Finals',
  semi_final: 'Semi-Finals',
  third_place: '3rd Place Match',
  final: 'Final',
  completed: 'Tournament Complete',
}

const WorldCup = () => {
  const user = useSelector((s) => s.user.userDetails)
  const leagueId = user?.team?.currentLeague?._id

  const [loading, setLoading] = useState(true)
  const [wcState, setWcState] = useState(null)
  const [activeTab, setActiveTab] = useState('groups')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [initLoading, setInitLoading] = useState(false)
  // Commissioner: score recording
  const [scoreModal, setScoreModal] = useState(null) // { type, groupName?, matchIndex?, round?, fixture }
  const [scores, setScores] = useState({ home: 0, away: 0, homePen: 0, awayPen: 0 })
  const [savingScore, setSavingScore] = useState(false)

  const isCommissioner = user?.team?.currentLeague?.createdBy === user?._id

  const fetchState = useCallback(async () => {
    if (!leagueId) return
    try {
      setLoading(true)
      attachSoccerToken()
      const { data } = await soccerAPI.get(`/api/v1/world-cup/${leagueId}/state`)
      setWcState(data?.data || data)
    } catch (err) {
      console.log('WC fetch error:', err?.response?.data || err.message)
    } finally {
      setLoading(false)
    }
  }, [leagueId])

  useEffect(() => {
    fetchState()
  }, [fetchState])

  const handleInitialize = async () => {
    try {
      setInitLoading(true)
      attachSoccerToken()
      await soccerAPI.post(`/api/v1/world-cup/${leagueId}/initialize`)
      await fetchState()
    } catch (err) {
      console.error('Init error:', err?.response?.data || err.message)
      message.error(err?.response?.data?.message || 'Failed to initialize')
    } finally {
      setInitLoading(false)
    }
  }

  const handleReset = async () => {
    Modal.confirm({
      title: 'Reset World Cup?',
      content: 'This will erase all group draws, results, and bracket progress.',
      okText: 'Reset',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          attachSoccerToken()
          await soccerAPI.delete(`/api/v1/world-cup/${leagueId}/reset`)
          await fetchState()
          message.success('World Cup reset')
        } catch (err) {
          message.error('Reset failed')
        }
      },
    })
  }

  // Open score modal for a fixture
  const openScoreModal = (fixture, type, extra = {}) => {
    setScores({ home: fixture.homeScore || 0, away: fixture.awayScore || 0, homePen: 0, awayPen: 0 })
    setScoreModal({ type, fixture, ...extra })
  }

  const submitScore = async () => {
    if (!scoreModal) return
    try {
      setSavingScore(true)
      attachSoccerToken()
      if (scoreModal.type === 'group') {
        await soccerAPI.post(`/api/v1/world-cup/${leagueId}/group-result`, {
          groupName: scoreModal.groupName,
          matchNumber: scoreModal.fixture.matchNumber,
          homeScore: scores.home,
          awayScore: scores.away,
        })
      } else {
        await soccerAPI.post(`/api/v1/world-cup/${leagueId}/knockout-result`, {
          round: scoreModal.round,
          matchIndex: scoreModal.matchIndex,
          homeScore: scores.home,
          awayScore: scores.away,
          ...(scores.home === scores.away ? { homePenalties: scores.homePen, awayPenalties: scores.awayPen } : {}),
        })
      }
      message.success('Score recorded')
      setScoreModal(null)
      await fetchState()
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to save score')
    } finally {
      setSavingScore(false)
    }
  }

  const phase = wcState?.phase || 'setup'
  const isKnockout = ['round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final', 'completed'].includes(phase)

  // ── Setup Phase ──
  if (!loading && (!wcState || phase === 'setup')) {
    return (
      <div className='wc-page'>
        <Header />
        <div className='wc-setup'>
          <TrophyOutlined style={{ fontSize: 64, color: '#D4AF37' }} />
          <h1>FIFA World Cup 2026</h1>
          <p>48 Teams · 12 Groups · Knockout Bracket</p>
          {isCommissioner ? (
            <button className='wc-init-btn' onClick={handleInitialize} disabled={initLoading}>
              {initLoading ? 'Drawing Groups...' : 'Draw Groups & Start Tournament'}
            </button>
          ) : (
            <p className='wc-waiting'>Waiting for commissioner to draw groups...</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='wc-page'>
      <Header />
      <Spin spinning={loading}>
        <div className='wc-container'>
          {/* ── Phase Banner ── */}
          <div className='wc-phase-banner'>
            <TrophyOutlined className='wc-trophy' />
            <div>
              <h1>{PHASE_LABELS[phase] || 'World Cup'}</h1>
              <p className='wc-phase-sub'>FIFA World Cup 2026 · 48 Teams · Matchday {wcState?.currentMatchday || 1}</p>
            </div>
            {wcState?.champion && (
              <Tag color='gold' className='wc-champion-tag'>
                Champion: {wcState.champion?.name || 'TBD'}
              </Tag>
            )}
          </div>

          {/* ── Tab Selector ── */}
          <div className='wc-tabs'>
            <button className={`wc-tab ${activeTab === 'groups' ? 'wc-tab-active' : ''}`} onClick={() => setActiveTab('groups')}>
              Groups
            </button>
            <button className={`wc-tab ${activeTab === 'bracket' ? 'wc-tab-active' : ''}`} onClick={() => setActiveTab('bracket')}>
              Knockout Bracket
            </button>
            <button className={`wc-tab ${activeTab === 'fixtures' ? 'wc-tab-active' : ''}`} onClick={() => setActiveTab('fixtures')}>
              Fixtures
            </button>
            <button className={`wc-tab ${activeTab === 'predictor' ? 'wc-tab-active' : ''}`} onClick={() => setActiveTab('predictor')}>
              Predictor
            </button>
            {isCommissioner && (
              <button className={`wc-tab ${activeTab === 'commissioner' ? 'wc-tab-active' : ''}`} onClick={() => setActiveTab('commissioner')}>
                <SettingOutlined /> Commissioner
              </button>
            )}
          </div>

          {/* ── Group Stage View ── */}
          {activeTab === 'groups' && (
            <div className='wc-groups-grid'>
              {(wcState?.groups || []).map((group) => (
                <div
                  key={group.groupName}
                  className={`wc-group-card ${selectedGroup === group.groupName ? 'wc-group-selected' : ''}`}
                  onClick={() => setSelectedGroup(selectedGroup === group.groupName ? null : group.groupName)}
                >
                  <div className='wc-group-header'>
                    <span className='wc-group-letter'>Group {group.groupName}</span>
                    {group.isComplete && <Tag color='green' className='wc-group-done'>Done</Tag>}
                  </div>
                  <table className='wc-group-table'>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Team</th>
                        <th>P</th>
                        <th>W</th>
                        <th>D</th>
                        <th>L</th>
                        <th>GF</th>
                        <th>GA</th>
                        <th>GD</th>
                        <th>Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortStandings(group.teams).map((entry, idx) => {
                        const qualifies = idx < 2
                        const third = idx === 2
                        return (
                          <tr
                            key={entry.team?._id || idx}
                            className={qualifies ? 'wc-row-qualify' : third ? 'wc-row-third' : 'wc-row-elim'}
                          >
                            <td>{idx + 1}</td>
                            <td className='wc-team-cell'>
                              {entry.team?.logo && <img src={entry.team.logo} alt='' className='wc-team-logo' />}
                              <span>{entry.team?.name || 'TBD'}</span>
                            </td>
                            <td>{entry.played}</td>
                            <td>{entry.wins}</td>
                            <td>{entry.draws}</td>
                            <td>{entry.losses}</td>
                            <td>{entry.goalsFor}</td>
                            <td>{entry.goalsAgainst}</td>
                            <td>{entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}</td>
                            <td className='wc-pts'>{entry.points}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {/* Group Fixtures (expanded) */}
                  {selectedGroup === group.groupName && (
                    <div className='wc-group-fixtures'>
                      {[1, 2, 3].map((md) => {
                        const mdFixtures = (group.fixtures || []).filter((f) => f.matchday === md)
                        return (
                          <div key={md} className='wc-matchday-block'>
                            <span className='wc-matchday-label'>Matchday {md}</span>
                            {mdFixtures.map((fix) => (
                              <div key={fix.matchNumber || fix._id} className={`wc-fixture ${fix.completed ? 'wc-fixture-done' : ''}`}>
                                <span className='wc-fix-team'>{fix.homeTeam?.name || 'TBD'}</span>
                                <span className='wc-fix-score'>
                                  {fix.completed ? `${fix.homeScore} - ${fix.awayScore}` : 'vs'}
                                </span>
                                <span className='wc-fix-team'>{fix.awayTeam?.name || 'TBD'}</span>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Knockout Bracket View ── */}
          {activeTab === 'bracket' && (
            <div className='wc-bracket'>
              {!isKnockout && !wcState?.bracket?.roundOf32?.some((m) => m.homeTeam) ? (
                <Empty description='Knockout bracket will appear after group stage completes' />
              ) : (
                <div className='wc-bracket-rounds'>
                  <BracketRound title='Round of 32' matches={wcState?.bracket?.roundOf32 || []} />
                  <BracketRound title='Round of 16' matches={wcState?.bracket?.roundOf16 || []} />
                  <BracketRound title='Quarter-Finals' matches={wcState?.bracket?.quarterFinal || []} />
                  <BracketRound title='Semi-Finals' matches={wcState?.bracket?.semiFinal || []} />
                  <BracketRound title='Final' matches={wcState?.bracket?.final ? [wcState.bracket.final] : []} />
                  {wcState?.bracket?.thirdPlace?.homeTeam && (
                    <div className='wc-third-place-section'>
                      <h3>3rd Place Match</h3>
                      <MatchCard match={wcState.bracket.thirdPlace} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── All Fixtures View ── */}
          {activeTab === 'fixtures' && (
            <div className='wc-all-fixtures'>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((md) => {
                const mdLabel = md <= 3 ? `Group Stage — Matchday ${md}`
                  : md === 4 ? 'Round of 32'
                  : md === 5 ? 'Round of 16'
                  : md === 6 ? 'Quarter-Finals'
                  : md === 7 ? 'Semi-Finals'
                  : md === 8 ? '3rd Place Match'
                  : 'Final'

                const fixtures = getFixturesByMatchday(wcState, md)
                if (fixtures.length === 0) return null

                return (
                  <div key={md} className='wc-matchday-section'>
                    <h3 className='wc-md-title'>{mdLabel}</h3>
                    <div className='wc-fixtures-list'>
                      {fixtures.map((fix, i) => (
                        <MatchCard key={fix.matchNumber || i} match={fix} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Predictor Tab (iframe) ── */}
          {activeTab === 'predictor' && (
            <div className='wc-predictor'>
              <iframe
                src='/WorldCupPredictor-Live.html'
                title='World Cup Predictor'
                className='wc-predictor-iframe'
                loading='lazy'
                allow='clipboard-write'
              />
            </div>
          )}

          {/* ── Commissioner Management Tab ── */}
          {activeTab === 'commissioner' && isCommissioner && (
            <div className='wc-commissioner'>
              <div className='wc-comm-header'>
                <SettingOutlined style={{ fontSize: 24, color: '#D4AF37' }} />
                <div>
                  <h2>Tournament Management</h2>
                  <p>Phase: <Tag color='gold'>{PHASE_LABELS[phase]}</Tag></p>
                </div>
                <Button danger size='small' onClick={handleReset} style={{ marginLeft: 'auto' }}>
                  Reset Tournament
                </Button>
              </div>

              {/* Group Stage: Record match results */}
              {phase === 'group_stage' && (
                <div className='wc-comm-section'>
                  <h3>Record Group Match Results</h3>
                  <p className='wc-comm-hint'>Click on a pending match to enter the score.</p>
                  {(wcState?.groups || []).map((group) => {
                    const pending = (group.fixtures || []).filter((f) => !f.completed)
                    if (pending.length === 0) return null
                    return (
                      <div key={group.groupName} className='wc-comm-group'>
                        <h4>Group {group.groupName} — {pending.length} pending</h4>
                        {pending.map((fix) => (
                          <div
                            key={fix.matchNumber}
                            className='wc-comm-fixture'
                            onClick={() => openScoreModal(fix, 'group', { groupName: group.groupName })}
                          >
                            <span>{fix.homeTeam?.name || 'TBD'}</span>
                            <span className='wc-comm-vs'>vs</span>
                            <span>{fix.awayTeam?.name || 'TBD'}</span>
                            <span className='wc-comm-md'>MD{fix.matchday}</span>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Knockout: Record knockout results */}
              {isKnockout && phase !== 'completed' && (
                <div className='wc-comm-section'>
                  <h3>Record Knockout Results</h3>
                  {['roundOf32', 'roundOf16', 'quarterFinal', 'semiFinal'].map((round) => {
                    const matches = wcState?.bracket?.[round] || []
                    const pending = matches.filter((m) => !m.completed && m.homeTeam && m.awayTeam)
                    if (pending.length === 0) return null
                    const roundLabel = { roundOf32: 'Round of 32', roundOf16: 'Round of 16', quarterFinal: 'Quarter-Finals', semiFinal: 'Semi-Finals' }
                    return (
                      <div key={round} className='wc-comm-group'>
                        <h4>{roundLabel[round]} — {pending.length} pending</h4>
                        {pending.map((m, idx) => (
                          <div
                            key={m.matchNumber || idx}
                            className='wc-comm-fixture'
                            onClick={() => openScoreModal(m, 'knockout', { round, matchIndex: matches.indexOf(m) })}
                          >
                            <span>{m.homeTeam?.name || 'TBD'}</span>
                            <span className='wc-comm-vs'>vs</span>
                            <span>{m.awayTeam?.name || 'TBD'}</span>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                  {/* Third place + Final */}
                  {wcState?.bracket?.thirdPlace?.homeTeam && !wcState?.bracket?.thirdPlace?.completed && (
                    <div className='wc-comm-group'>
                      <h4>3rd Place Match</h4>
                      <div className='wc-comm-fixture' onClick={() => openScoreModal(wcState.bracket.thirdPlace, 'knockout', { round: 'thirdPlace', matchIndex: 0 })}>
                        <span>{wcState.bracket.thirdPlace.homeTeam?.name}</span>
                        <span className='wc-comm-vs'>vs</span>
                        <span>{wcState.bracket.thirdPlace.awayTeam?.name}</span>
                      </div>
                    </div>
                  )}
                  {wcState?.bracket?.final?.homeTeam && !wcState?.bracket?.final?.completed && (
                    <div className='wc-comm-group'>
                      <h4>Final</h4>
                      <div className='wc-comm-fixture' onClick={() => openScoreModal(wcState.bracket.final, 'knockout', { round: 'final', matchIndex: 0 })}>
                        <span>{wcState.bracket.final.homeTeam?.name}</span>
                        <span className='wc-comm-vs'>vs</span>
                        <span>{wcState.bracket.final.awayTeam?.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {phase === 'completed' && (
                <div className='wc-comm-section'>
                  <h3 style={{ color: '#D4AF37' }}>Tournament Complete!</h3>
                  <p>Champion: {wcState?.champion?.name || '—'}</p>
                  <p>Runner-up: {wcState?.runnerUp?.name || '—'}</p>
                  <p>Third Place: {wcState?.thirdPlaceWinner?.name || '—'}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Score Recording Modal ── */}
          <Modal
            open={!!scoreModal}
            title='Record Match Score'
            onCancel={() => setScoreModal(null)}
            onOk={submitScore}
            confirmLoading={savingScore}
            okText='Save Score'
          >
            {scoreModal && (
              <div className='wc-score-modal'>
                <div className='wc-score-teams'>
                  <span>{scoreModal.fixture?.homeTeam?.name || 'Home'}</span>
                  <span>vs</span>
                  <span>{scoreModal.fixture?.awayTeam?.name || 'Away'}</span>
                </div>
                <div className='wc-score-inputs'>
                  <div>
                    <label>Home Score</label>
                    <InputNumber min={0} value={scores.home} onChange={(v) => setScores((s) => ({ ...s, home: v || 0 }))} />
                  </div>
                  <div>
                    <label>Away Score</label>
                    <InputNumber min={0} value={scores.away} onChange={(v) => setScores((s) => ({ ...s, away: v || 0 }))} />
                  </div>
                </div>
                {scoreModal.type === 'knockout' && scores.home === scores.away && (
                  <div className='wc-pen-inputs'>
                    <p style={{ color: '#D4AF37', fontSize: 12 }}>Scores are tied — enter penalty shootout result:</p>
                    <div className='wc-score-inputs'>
                      <div>
                        <label>Home Penalties</label>
                        <InputNumber min={0} value={scores.homePen} onChange={(v) => setScores((s) => ({ ...s, homePen: v || 0 }))} />
                      </div>
                      <div>
                        <label>Away Penalties</label>
                        <InputNumber min={0} value={scores.awayPen} onChange={(v) => setScores((s) => ({ ...s, awayPen: v || 0 }))} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Modal>
        </div>
      </Spin>
    </div>
  )
}

// ── Sub-components ──

const BracketRound = ({ title, matches }) => (
  <div className='wc-bracket-round'>
    <h3 className='wc-round-title'>{title}</h3>
    <div className='wc-round-matches'>
      {matches.map((m, i) => (
        <MatchCard key={m.matchNumber || i} match={m} compact />
      ))}
    </div>
  </div>
)

const MatchCard = ({ match, compact }) => {
  if (!match) return null
  const home = match.homeTeam
  const away = match.awayTeam
  const isWinner = (team) => match.winner && String(match.winner?._id || match.winner) === String(team?._id || team)

  return (
    <div className={`wc-match-card ${match.completed ? 'wc-match-done' : ''} ${compact ? 'wc-match-compact' : ''}`}>
      <div className={`wc-match-team ${isWinner(home) ? 'wc-match-winner' : ''}`}>
        {home?.logo && <img src={home.logo} alt='' className='wc-match-logo' />}
        <span>{home?.name || 'TBD'}</span>
        <span className='wc-match-score'>{match.completed ? match.homeScore : ''}</span>
      </div>
      <div className={`wc-match-team ${isWinner(away) ? 'wc-match-winner' : ''}`}>
        {away?.logo && <img src={away.logo} alt='' className='wc-match-logo' />}
        <span>{away?.name || 'TBD'}</span>
        <span className='wc-match-score'>{match.completed ? match.awayScore : ''}</span>
      </div>
      {match.decidedByPenalties && (
        <span className='wc-pen-tag'>PEN ({match.homePenalties}-{match.awayPenalties})</span>
      )}
    </div>
  )
}

// ── Helpers ──

function sortStandings(teams) {
  return [...(teams || [])].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
    return 0
  })
}

function getFixturesByMatchday(state, md) {
  if (!state) return []
  // Group stage: matchdays 1-3 from groups
  if (md <= 3) {
    const fixtures = []
    for (const g of state.groups || []) {
      for (const f of g.fixtures || []) {
        if (f.matchday === md) fixtures.push(f)
      }
    }
    return fixtures
  }
  // Knockout rounds
  const roundMap = { 4: 'roundOf32', 5: 'roundOf16', 6: 'quarterFinal', 7: 'semiFinal' }
  if (roundMap[md]) return state.bracket?.[roundMap[md]] || []
  if (md === 8) return state.bracket?.thirdPlace ? [state.bracket.thirdPlace] : []
  if (md === 9) return state.bracket?.final ? [state.bracket.final] : []
  return []
}

export default WorldCup
