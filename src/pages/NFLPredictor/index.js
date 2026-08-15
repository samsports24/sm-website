import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Button,
  Spin,
  Empty,
  message,
  Tag,
  Card,
} from 'antd'
import {
  LeftOutlined,
  RightOutlined,
  CheckCircleFilled,
  TrophyOutlined,
  SaveOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { getWeeklyNflSchedule } from '../../redux/actions/leagueActions'
import { privateAPI, attachToken } from '../../config/constants'
import Header from '../../components/Header'
import WeekPagination from '../../components/WeekPagination'
import TeamLogo from '../../components/TeamLogo'
import './nfl-predictor.css'

/* ═══ SamPoints per correct NFL prediction ═══ */
const POINTS = {
  correct: 10000,     // correct match result (home/away — no draws in NFL)
  exactScore: 50000,  // exact final score bonus
}

/* NFL league ID (API-Sports American Football) */
const NFL_LEAGUE_ID = 1

// The season we're PREDICTING. This was hardcoded to 2025 — a season that has
// already been played, so every pick was being filed against finished games.
// The NFL season is named for the year it starts, and it starts in September:
// before then, the season you're predicting is this calendar year's.
const NFL_SEASON = (() => {
  const now = new Date()
  return now.getMonth() < 8 ? now.getFullYear() : now.getFullYear()
})()

/* NFL team logo helper — wants an ABBREVIATION ("kc"), not a team name. */
const teamLogoUrl = (abbr) =>
  `https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/${String(abbr || '').toLowerCase()}.png&w=80&h=80`

const NFLPredictor = () => {
  const dispatch = useDispatch()
  // The settings live at state.user.setting. This read `state.setting`, which
  // does not exist in the root reducer — so SETTING was always undefined, and
  // the page opened on WEEK 1 every single time, whatever week it actually was.
  const SETTING = useSelector((state) => state.user?.setting)
  const user = useSelector((state) => state.user?.userDetails)

  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(SETTING?.week || 1)
  const [picks, setPicks] = useState({})
  const [savedPicks, setSavedPicks] = useState({})
  const [leaderboard, setLeaderboard] = useState([])
  const [myStats, setMyStats] = useState(null)

  /* ── Fetch real NFL games for the week ── */
  const fetchGames = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getWeeklyNflSchedule({ week: currentWeek })
      if (data && Array.isArray(data)) {
        const mapped = data
          .filter(g => g.AwayTeam !== 'BYE' && g.HomeTeam !== 'BYE')
          .map(g => ({
            id: g.GameKey || g.GlobalGameID || `${g.HomeTeam}-${g.AwayTeam}-${currentWeek}`,
            gameKey: g.GameKey,
            date: g.DateTime || g.Day,
            status: g.Status, // Scheduled, InProgress, Final
            homeTeam: g.HomeTeam,
            awayTeam: g.AwayTeam,
            homeScore: g.HomeScore,
            awayScore: g.AwayScore,
            // TWO bugs on these two lines, and together they broke every logo on
            // every card.
            //
            //   1. The field is HomeTeamLogo, not HomeLogo. `g.HomeLogo` was
            //      always undefined, so the fallback ran every time.
            //   2. The fallback builds an ESPN url from an ABBREVIATION, but the
            //      old API-Sports sync stored FULL NAMES. So it produced
            //      ".../nfl/500/kansas city chiefs.png" — a broken image, always.
            //
            // The Tank01 schedule sync now stores codes ("KC"), and this reads
            // the right field first.
            homeLogo: g.HomeTeamLogo || g.HomeLogo || teamLogoUrl(g.HomeTeam),
            awayLogo: g.AwayTeamLogo || g.AwayLogo || teamLogoUrl(g.AwayTeam),
            isFinished: g.Status === 'Final',
            isLive: g.Status === 'InProgress',
          }))
        setGames(mapped)
      } else {
        setGames([])
      }
    } catch (err) {
      console.error('[NFL Predictor] Fetch failed:', err)
      message.error('Could not load NFL schedule')
      setGames([])
    } finally {
      setLoading(false)
    }
  }, [currentWeek])

  useEffect(() => { fetchGames() }, [fetchGames])

  /* ── Load saved picks from backend ── */
  const loadPicks = useCallback(async () => {
    try {
      attachToken()
      const resp = await privateAPI.get(
        `/predictor/picks?competition=nfl&season=${NFL_SEASON}&leagueId=${NFL_LEAGUE_ID}&matchweek=${currentWeek}`
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
      console.warn('[NFL Predictor] Could not load picks:', err.message)
    }
  }, [currentWeek])

  useEffect(() => { loadPicks() }, [loadPicks])

  /* ── Load leaderboard ── */
  useEffect(() => {
    ;(async () => {
      try {
        const resp = await privateAPI.get(
          `/predictor/leaderboard?competition=nfl&season=${NFL_SEASON}&leagueId=${NFL_LEAGUE_ID}&limit=20`
        )
        setLeaderboard(resp.data?.data?.leaderboard || [])
      } catch {}
    })()
  }, [])

  /* ── Pick handlers (NFL has no draws) ── */
  const setResult = (gameId, result) => {
    setPicks(prev => {
      const existing = prev[gameId] || {}
      if (existing.result === result) {
        const { result: _, ...rest } = existing
        return { ...prev, [gameId]: rest }
      }
      return { ...prev, [gameId]: { ...existing, result } }
    })
  }

  /* ── Count unsaved ── */
  const unsavedCount = useMemo(() => {
    let n = 0
    const allKeys = new Set([...Object.keys(picks), ...Object.keys(savedPicks)])
    allKeys.forEach(k => {
      if (JSON.stringify(picks[k]) !== JSON.stringify(savedPicks[k])) n++
    })
    return n
  }, [picks, savedPicks])

  /* ── Save picks ── */
  const savePicks = async () => {
    if (unsavedCount === 0) return
    setSaving(true)
    try {
      attachToken()
      const bulkPicks = []
      for (const [gameIdStr, pick] of Object.entries(picks)) {
        if (!pick.result) continue
        const game = games.find(g => String(g.id) === String(gameIdStr))
        if (!game || game.isFinished || game.isLive) continue

        // No GameKey, no pick. The key IS the game's identity — it's what
        // settlement matches on. A pick we can't tie back to a fixture can
        // never be graded, so refusing to save it beats saving a dead one.
        if (!game.gameKey) {
          console.warn('[Predictor] game has no GameKey, skipping:', game)
          continue
        }

        bulkPicks.push({
          // "nfl", not "weekly". As "weekly" with leagueId 1, these picks were
          // picked up by the SOCCER settle cron — where league 1 is the World
          // Cup — which went looking for them among World Cup fixtures, found
          // nothing, and left every NFL pick unsettled for ever.
          competition: 'nfl',
          leagueId: NFL_LEAGUE_ID,
          season: NFL_SEASON,
          matchweek: currentWeek,
          pickType: 'match',
          // Tank01's gameID ("20260910_BUF@KC"). It used to fall back to `0`
          // when the id wasn't numeric — and it never was — so every pick a user
          // made carried fixtureId 0. With a unique index on
          // (user, fixtureId, pickType), only the FIRST pick of the week could
          // ever be written. The rest collided and were silently dropped.
          fixtureId: game.gameKey,
          pickResult: pick.result,
          pickHomeScore: pick.homeScore != null ? pick.homeScore : null,
          pickAwayScore: pick.awayScore != null ? pick.awayScore : null,
          homeTeamId: null,
          homeTeamName: game.homeTeam,
          awayTeamId: null,
          awayTeamName: game.awayTeam,
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
      console.error('[NFL Predictor] Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  /* ── Date format ── */
  const fmtDate = (d) => {
    if (!d) return ''
    const dt = new Date(d)
    return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }
  const fmtTime = (d) => {
    if (!d) return ''
    const dt = new Date(d)
    return dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="nfl-predictor-page">
      <Header />

      {/* Header */}
      <div className="nfl-predictor-header">
        <div className="nfl-predictor-header-left">
          <span className="nfl-predictor-emoji">🏈</span>
          <div>
            <h2 className="nfl-predictor-title">
              NFL <span className="nfl-predictor-accent">Predictor</span>
            </h2>
            <p className="nfl-predictor-subtitle">
              Predict real NFL game outcomes and earn SamPoints
            </p>
          </div>
        </div>
        {myStats && (
          <div className="nfl-predictor-stats">
            <Tag color="green" icon={<CheckCircleFilled />}>
              {myStats.correctCount || 0}/{myStats.settledCount || 0} correct
            </Tag>
            <Tag color="gold" icon={<TrophyOutlined />}>
              {(myStats.totalAwarded || 0).toLocaleString()} SP earned
            </Tag>
          </div>
        )}
      </div>

      {/* Week selector */}
      <div className="nfl-predictor-week-nav">
        <Button
          icon={<LeftOutlined />}
          disabled={currentWeek <= 1}
          onClick={() => setCurrentWeek(w => w - 1)}
          className="nfl-predictor-week-btn"
        />
        <div className="nfl-predictor-week-label">
          <CalendarOutlined /> Week {currentWeek}
          {currentWeek === SETTING?.week && (
            <Tag color="green" style={{ marginLeft: 8 }}>Current</Tag>
          )}
        </div>
        <Button
          icon={<RightOutlined />}
          disabled={currentWeek >= 22}
          onClick={() => setCurrentWeek(w => w + 1)}
          className="nfl-predictor-week-btn"
        />
      </div>

      {/* Games */}
      {loading ? (
        <div className="nfl-predictor-loading"><Spin size="large" tip="Loading NFL schedule..." /></div>
      ) : games.length === 0 ? (
        <Card className="nfl-predictor-card">
          <Empty description={`No games found for Week ${currentWeek}`} />
        </Card>
      ) : (
        <div className="nfl-predictor-games">
          {games.map(g => {
            const pick = picks[g.id] || {}
            const isLocked = g.isFinished || g.isLive || pick.settled
            const actualResult = g.isFinished
              ? (g.homeScore > g.awayScore ? 'home' : 'away')
              : null
            // A pick is "confirmed" once it's been saved and hasn't been changed
            // since. In that state we dim the un-picked side so the selection
            // reads as locked in.
            const isConfirmed =
              !!savedPicks[g.id]?.result &&
              JSON.stringify(picks[g.id]) === JSON.stringify(savedPicks[g.id])

            return (
              <div
                key={g.id}
                className={`nfl-predictor-game-card ${isLocked ? 'locked' : ''} ${isConfirmed ? 'confirmed' : ''} ${pick.settled && pick.correct ? 'correct' : ''} ${pick.settled && !pick.correct ? 'incorrect' : ''}`}
              >
                {/* Meta */}
                <div className="nfl-predictor-game-meta">
                  <span>{fmtDate(g.date)}</span>
                  <span>{fmtTime(g.date)}</span>
                  {g.isLive && <Tag color="red">LIVE</Tag>}
                  {g.isFinished && <Tag>FINAL</Tag>}
                  {isConfirmed && !isLocked && (
                    <Tag color="green" icon={<CheckCircleFilled />}>Saved</Tag>
                  )}
                  {pick.settled && pick.correct && (
                    <Tag color="green" icon={<CheckCircleFilled />}>
                      +{(pick.awardedPoints || 0).toLocaleString()} SP
                    </Tag>
                  )}
                </div>

                {/* Matchup */}
                <div className="nfl-predictor-matchup">
                  {/* Home */}
                  <div
                    className={`nfl-predictor-team ${pick.result === 'home' ? 'selected' : ''}`}
                    onClick={() => !isLocked && setResult(g.id, 'home')}
                  >
                    <TeamLogo src={g.homeLogo} name={g.homeTeam} size={36} round={false} className="nfl-predictor-logo" style={{ objectFit: 'contain' }} />
                    <span className="nfl-predictor-team-name">{g.homeTeam}</span>
                    {g.isFinished && <span className="nfl-predictor-score">{g.homeScore}</span>}
                  </div>

                  {/* VS */}
                  <div className="nfl-predictor-vs">
                    {g.isFinished ? (
                      <span className="nfl-predictor-final">{g.homeScore} - {g.awayScore}</span>
                    ) : (
                      <span className="nfl-predictor-vs-text">VS</span>
                    )}
                  </div>

                  {/* Away */}
                  <div
                    className={`nfl-predictor-team away ${pick.result === 'away' ? 'selected' : ''}`}
                    onClick={() => !isLocked && setResult(g.id, 'away')}
                  >
                    <TeamLogo src={g.awayLogo} name={g.awayTeam} size={36} round={false} className="nfl-predictor-logo" style={{ objectFit: 'contain' }} />
                    <span className="nfl-predictor-team-name">{g.awayTeam}</span>
                    {g.isFinished && <span className="nfl-predictor-score">{g.awayScore}</span>}
                  </div>
                </div>

                {pick.result && !isLocked && (
                  <div className="nfl-predictor-points">
                    <TrophyOutlined /> {POINTS.correct.toLocaleString()} SP
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Save bar */}
      {unsavedCount > 0 && (
        <div className="nfl-predictor-save-bar">
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={savePicks}
            size="large"
            className="nfl-predictor-save-btn"
          >
            Save &amp; Confirm {unsavedCount} Pick{unsavedCount !== 1 ? 's' : ''}
          </Button>
        </div>
      )}

      {/* Mini leaderboard */}
      {leaderboard.length > 0 && (
        <Card className="nfl-predictor-card nfl-predictor-lb-card" title={<><TrophyOutlined /> NFL Predictor Leaderboard</>}>
          <div className="nfl-predictor-lb">
            {leaderboard.slice(0, 10).map((row, i) => (
              <div key={row._id} className="nfl-predictor-lb-row">
                <span className="nfl-predictor-lb-rank">{i + 1}</span>
                <span className="nfl-predictor-lb-name">{row.userName || `${row.firstName || ''} ${row.lastName || ''}`.trim()}</span>
                <span className="nfl-predictor-lb-acc">{row.correctPicks}/{row.settledPicks}</span>
                <span className="nfl-predictor-lb-pts">{(row.totalAwarded || 0).toLocaleString()} SP</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default NFLPredictor
