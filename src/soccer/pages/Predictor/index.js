import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Card,
  Button,
  Spin,
  Empty,
  message,
  Tag,
  Tooltip,
  Badge,
} from 'antd'
import {
  LeftOutlined,
  RightOutlined,
  CheckCircleFilled,
  TrophyOutlined,
  SaveOutlined,
  FireOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import useSoccerLeague from '../../hooks/useSoccerLeague'
import { privateAPI, attachToken } from '../../../config/constants'
import './predictor.css'

/* ═══ API-Football league IDs for the 5 soccer leagues ═══ */
const REAL_LEAGUE_API_IDS = {
  premier_league: 39,
  la_liga: 140,
  serie_a: 135,
  bundesliga: 78,
  ligue_1: 61,
  champions_league: 2,
}

/* ═══ SamPoints per correct prediction ═══ */
const POINTS = {
  correct: 10000,     // correct match result (home/draw/away)
  exactScore: 50000,  // exact scoreline bonus
}

const API_FOOTBALL_KEY = '41e84d22fdba4b127a20890f19105e8b'
const API_FOOTBALL_BASE = 'https://v3.football.api-sports.io'

const Predictor = () => {
  const { league, realLeague, leagueName, leagueFlag, leagueColor, matchweek, season } = useSoccerLeague()

  const [fixtures, setFixtures] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(matchweek || 1)
  const [picks, setPicks] = useState({})       // { fixtureId: { result, homeScore, awayScore } }
  const [savedPicks, setSavedPicks] = useState({})
  const [leaderboard, setLeaderboard] = useState([])
  const [myStats, setMyStats] = useState(null)

  // Resolve API-Football league ID from the real league
  const apiLeagueId = useMemo(() => {
    if (!realLeague) return null
    return REAL_LEAGUE_API_IDS[realLeague] || null
  }, [realLeague])

  // Current season for API-Football (e.g. 2025)
  const apiSeason = useMemo(() => {
    if (!season) return new Date().getFullYear()
    // Season string might be "2025-26" → take first part
    const yr = String(season).split('-')[0]
    return parseInt(yr) || new Date().getFullYear()
  }, [season])

  /* ── Fetch real fixtures from API-Football ── */
  const fetchFixtures = useCallback(async () => {
    if (!apiLeagueId) return
    setLoading(true)
    try {
      const resp = await fetch(
        `${API_FOOTBALL_BASE}/fixtures?league=${apiLeagueId}&season=${apiSeason}&round=Regular Season - ${currentWeek}`,
        { headers: { 'x-apisports-key': API_FOOTBALL_KEY } }
      )
      const json = await resp.json()
      const matches = (json.response || []).map(f => ({
        id: f.fixture.id,
        date: f.fixture.date,
        status: f.fixture.status.short,
        statusLong: f.fixture.status.long,
        homeTeam: {
          id: f.teams.home.id,
          name: f.teams.home.name,
          logo: f.teams.home.logo,
        },
        awayTeam: {
          id: f.teams.away.id,
          name: f.teams.away.name,
          logo: f.teams.away.logo,
        },
        homeGoals: f.goals.home,
        awayGoals: f.goals.away,
        isFinished: ['FT', 'AET', 'PEN'].includes(f.fixture.status.short),
        isLive: ['1H', '2H', 'HT', 'ET', 'BT', 'P'].includes(f.fixture.status.short),
      }))
      // Sort: live first, then by date
      matches.sort((a, b) => {
        if (a.isLive && !b.isLive) return -1
        if (!a.isLive && b.isLive) return 1
        return new Date(a.date) - new Date(b.date)
      })
      setFixtures(matches)
    } catch (err) {
      console.error('[Predictor] Fixture fetch failed:', err)
      message.error('Could not load fixtures')
    } finally {
      setLoading(false)
    }
  }, [apiLeagueId, apiSeason, currentWeek])

  useEffect(() => { fetchFixtures() }, [fetchFixtures])

  /* ── Load saved picks from backend ── */
  const loadPicks = useCallback(async () => {
    try {
      attachToken()
      const resp = await privateAPI.get(
        `/predictor/picks?competition=weekly&season=${apiSeason}&leagueId=${apiLeagueId}&matchweek=${currentWeek}`
      )
      const serverPicks = resp.data?.data?.picks || []
      const loaded = {}
      for (const p of serverPicks) {
        if (p.fixtureId) {
          loaded[p.fixtureId] = {
            result: p.pickResult,
            homeScore: p.pickHomeScore,
            awayScore: p.pickAwayScore,
            settled: p.settled,
            correct: p.correct,
            awardedPoints: p.awardedPoints,
          }
        }
      }
      setPicks(loaded)
      setSavedPicks(loaded)
      setMyStats(resp.data?.data?.stats || null)
    } catch (err) {
      console.warn('[Predictor] Could not load picks:', err.message)
    }
  }, [apiLeagueId, apiSeason, currentWeek])

  useEffect(() => { if (apiLeagueId) loadPicks() }, [loadPicks, apiLeagueId])

  /* ── Load leaderboard ── */
  useEffect(() => {
    if (!apiLeagueId) return
    ;(async () => {
      try {
        const resp = await privateAPI.get(
          `/predictor/leaderboard?competition=weekly&season=${apiSeason}&leagueId=${apiLeagueId}&limit=20`
        )
        setLeaderboard(resp.data?.data?.leaderboard || [])
      } catch {}
    })()
  }, [apiLeagueId, apiSeason])

  /* ── Pick handlers ── */
  const setResult = (fixtureId, result) => {
    setPicks(prev => {
      const existing = prev[fixtureId] || {}
      // Toggle off if same
      if (existing.result === result) {
        const { result: _, ...rest } = existing
        return { ...prev, [fixtureId]: rest }
      }
      return { ...prev, [fixtureId]: { ...existing, result } }
    })
  }

  const setScore = (fixtureId, side, value) => {
    const num = value === '' ? null : Math.max(0, parseInt(value) || 0)
    setPicks(prev => {
      const existing = prev[fixtureId] || {}
      return {
        ...prev,
        [fixtureId]: {
          ...existing,
          [side === 'home' ? 'homeScore' : 'awayScore']: num,
        },
      }
    })
  }

  /* ── Count unsaved changes ── */
  const unsavedCount = useMemo(() => {
    let n = 0
    const allKeys = new Set([...Object.keys(picks), ...Object.keys(savedPicks)])
    allKeys.forEach(k => {
      if (JSON.stringify(picks[k]) !== JSON.stringify(savedPicks[k])) n++
    })
    return n
  }, [picks, savedPicks])

  /* ── Save picks to backend ── */
  const savePicks = async () => {
    if (unsavedCount === 0) return
    setSaving(true)
    try {
      attachToken()
      const bulkPicks = []
      for (const [fixtureIdStr, pick] of Object.entries(picks)) {
        if (!pick.result) continue
        const fixtureId = Number(fixtureIdStr)
        const fixture = fixtures.find(f => f.id === fixtureId)
        if (!fixture || fixture.isFinished || fixture.isLive) continue

        bulkPicks.push({
          competition: 'weekly',
          leagueId: apiLeagueId,
          season: apiSeason,
          matchweek: currentWeek,
          pickType: 'match',
          fixtureId,
          pickResult: pick.result,
          pickHomeScore: pick.homeScore != null ? pick.homeScore : null,
          pickAwayScore: pick.awayScore != null ? pick.awayScore : null,
          homeTeamId: fixture.homeTeam.id,
          homeTeamName: fixture.homeTeam.name,
          awayTeamId: fixture.awayTeam.id,
          awayTeamName: fixture.awayTeam.name,
          basePoints: POINTS.correct,
          multiplier: 1,
        })
      }

      if (bulkPicks.length > 0) {
        await privateAPI.post('/predictor/picks/bulk', { picks: bulkPicks })
      }

      setSavedPicks({ ...picks })
      message.success(`Saved ${bulkPicks.length} prediction${bulkPicks.length !== 1 ? 's' : ''}!`)
    } catch (err) {
      message.error('Could not save predictions')
      console.error('[Predictor] Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  /* ── Format date ── */
  const fmtDate = (d) => {
    const dt = new Date(d)
    return dt.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })
  }
  const fmtTime = (d) => {
    const dt = new Date(d)
    return dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  if (!apiLeagueId) {
    return (
      <div className="predictor-page">
        <Card className="predictor-card">
          <Empty description="Predictor is not available for this league type." />
        </Card>
      </div>
    )
  }

  return (
    <div className="predictor-page">
      {/* Header */}
      <div className="predictor-header" style={{ borderColor: leagueColor }}>
        <div className="predictor-header-left">
          <span className="predictor-league-flag">{leagueFlag}</span>
          <div>
            <h2 className="predictor-title">
              {leagueName} <span className="predictor-title-accent">Predictor</span>
            </h2>
            <p className="predictor-subtitle">
              Predict real match outcomes and earn SamPoints
            </p>
          </div>
        </div>
        {myStats && (
          <div className="predictor-stats-pills">
            <Tag color="green" icon={<CheckCircleFilled />}>
              {myStats.correctCount || 0}/{myStats.settledCount || 0} correct
            </Tag>
            <Tag color="gold" icon={<TrophyOutlined />}>
              {(myStats.totalAwarded || 0).toLocaleString()} SP earned
            </Tag>
          </div>
        )}
      </div>

      {/* Matchweek selector */}
      <div className="predictor-week-nav">
        <Button
          icon={<LeftOutlined />}
          disabled={currentWeek <= 1}
          onClick={() => setCurrentWeek(w => w - 1)}
          className="predictor-week-btn"
        />
        <div className="predictor-week-label">
          <CalendarOutlined /> Matchweek {currentWeek}
          {currentWeek === matchweek && <Badge status="processing" text="Current" className="predictor-current-badge" />}
        </div>
        <Button
          icon={<RightOutlined />}
          onClick={() => setCurrentWeek(w => w + 1)}
          className="predictor-week-btn"
        />
      </div>

      {/* Fixtures */}
      {loading ? (
        <div className="predictor-loading"><Spin size="large" tip="Loading fixtures..." /></div>
      ) : fixtures.length === 0 ? (
        <Card className="predictor-card">
          <Empty description={`No fixtures found for Matchweek ${currentWeek}`} />
        </Card>
      ) : (
        <div className="predictor-fixtures">
          {fixtures.map(f => {
            const pick = picks[f.id] || {}
            const isLocked = f.isFinished || f.isLive || pick.settled
            const actualResult = f.isFinished
              ? (f.homeGoals > f.awayGoals ? 'home' : f.homeGoals < f.awayGoals ? 'away' : 'draw')
              : null

            return (
              <div
                key={f.id}
                className={`predictor-fixture-card ${isLocked ? 'locked' : ''} ${pick.settled && pick.correct ? 'correct' : ''} ${pick.settled && !pick.correct ? 'incorrect' : ''}`}
              >
                {/* Match info bar */}
                <div className="predictor-fixture-meta">
                  <span className="predictor-fixture-date">{fmtDate(f.date)}</span>
                  <span className="predictor-fixture-time">{fmtTime(f.date)}</span>
                  {f.isLive && <Tag color="red" className="predictor-live-tag">LIVE</Tag>}
                  {f.isFinished && <Tag color="default">FT</Tag>}
                  {pick.settled && pick.correct && (
                    <Tag color="green" icon={<CheckCircleFilled />}>
                      +{(pick.awardedPoints || 0).toLocaleString()} SP
                    </Tag>
                  )}
                </div>

                {/* Teams row */}
                <div className="predictor-matchup">
                  {/* Home */}
                  <div className={`predictor-team ${pick.result === 'home' ? 'selected' : ''}`}
                    onClick={() => !isLocked && setResult(f.id, 'home')}
                  >
                    <img src={f.homeTeam.logo} alt="" className="predictor-team-logo" />
                    <span className="predictor-team-name">{f.homeTeam.name}</span>
                    {f.isFinished && <span className="predictor-actual-score">{f.homeGoals}</span>}
                  </div>

                  {/* Draw / VS */}
                  <div className="predictor-vs-container">
                    {f.isFinished ? (
                      <span className="predictor-final-score">{f.homeGoals} - {f.awayGoals}</span>
                    ) : (
                      <button
                        className={`predictor-draw-btn ${pick.result === 'draw' ? 'selected' : ''}`}
                        onClick={() => !isLocked && setResult(f.id, 'draw')}
                        disabled={isLocked}
                      >
                        DRAW
                      </button>
                    )}
                  </div>

                  {/* Away */}
                  <div className={`predictor-team ${pick.result === 'away' ? 'selected' : ''}`}
                    onClick={() => !isLocked && setResult(f.id, 'away')}
                  >
                    <img src={f.awayTeam.logo} alt="" className="predictor-team-logo" />
                    <span className="predictor-team-name">{f.awayTeam.name}</span>
                    {f.isFinished && <span className="predictor-actual-score">{f.awayGoals}</span>}
                  </div>
                </div>

                {/* Optional: exact score prediction */}
                {!isLocked && pick.result && (
                  <div className="predictor-score-inputs">
                    <Tooltip title="Predict exact score for 50k bonus SamPoints">
                      <FireOutlined className="predictor-bonus-icon" />
                    </Tooltip>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      className="predictor-score-input"
                      placeholder="0"
                      value={pick.homeScore != null ? pick.homeScore : ''}
                      onChange={e => setScore(f.id, 'home', e.target.value)}
                    />
                    <span className="predictor-score-dash">—</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      className="predictor-score-input"
                      placeholder="0"
                      value={pick.awayScore != null ? pick.awayScore : ''}
                      onChange={e => setScore(f.id, 'away', e.target.value)}
                    />
                    <span className="predictor-score-label">Exact score bonus</span>
                  </div>
                )}

                {/* Points indicator */}
                {pick.result && !isLocked && (
                  <div className="predictor-points-indicator">
                    <TrophyOutlined /> {POINTS.correct.toLocaleString()} SP
                    {pick.homeScore != null && pick.awayScore != null && (
                      <span> + {POINTS.exactScore.toLocaleString()} bonus</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Save bar */}
      {unsavedCount > 0 && (
        <div className="predictor-save-bar">
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={savePicks}
            size="large"
            className="predictor-save-btn"
            style={{ background: leagueColor, borderColor: leagueColor }}
          >
            Save {unsavedCount} Prediction{unsavedCount !== 1 ? 's' : ''}
          </Button>
        </div>
      )}

      {/* Mini leaderboard */}
      {leaderboard.length > 0 && (
        <Card className="predictor-card predictor-leaderboard-card" title={<><TrophyOutlined /> Predictor Leaderboard</>}>
          <div className="predictor-leaderboard">
            {leaderboard.slice(0, 10).map((row, i) => (
              <div key={row._id} className="predictor-lb-row">
                <span className="predictor-lb-rank">{i + 1}</span>
                <span className="predictor-lb-name">{row.userName || `${row.firstName || ''} ${row.lastName || ''}`.trim()}</span>
                <span className="predictor-lb-correct">{row.correctPicks}/{row.settledPicks}</span>
                <span className="predictor-lb-points">{(row.totalAwarded || 0).toLocaleString()} SP</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default Predictor
