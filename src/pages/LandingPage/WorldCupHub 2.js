import React, { useState, useEffect, useMemo, useCallback } from 'react'
import FormationPitch from './FormationPitch'

// ═══════════════════════════════════════════════════════════════
//  WORLD CUP 2026 HUB
//  Pre-tournament: groups, schedule, rosters, countdown, articles
//  Live: multi-match grid with auto-commentary & SAM metrics
// ═══════════════════════════════════════════════════════════════

const SOCCER_API = process.env.REACT_APP_SOCCER_API_URL || 'https://soccerbackend.samsports.io'

// World Cup 2026 starts June 11, 2026
const WC_START = new Date('2026-06-11T00:00:00Z')
const WC_END = new Date('2026-07-19T23:59:59Z')

// ── Helpers ──
const getPhase = () => {
  const now = new Date()
  if (now < WC_START) return 'pre'
  if (now <= WC_END) return 'live'
  return 'post'
}

const getCountdown = () => {
  const diff = WC_START - new Date()
  if (diff <= 0) return null
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { d, h, m, s }
}

// ── Auto-Commentary Generator ──
const generateCommentary = (events, homeTeam, awayTeam) => {
  if (!events || !events.length) return []
  return events
    .filter(e => e.type === 'Goal' || e.type === 'Card' || e.type === 'subst')
    .map((e, idx) => {
      const team = e.team?.name || ''
      const player = e.player?.name || 'Unknown'
      const assist = e.assist?.name
      const min = e.time?.elapsed || '?'
      const extra = e.time?.extra ? `+${e.time.extra}` : ''
      const timeStr = `${min}'${extra}`

      let text = ''
      let type = 'event'

      if (e.type === 'Goal') {
        if (e.detail === 'Own Goal') {
          text = `OWN GOAL! ${player} (${team}) puts it into his own net at ${timeStr}.`
        } else if (e.detail === 'Penalty') {
          text = `PENALTY GOAL! ${player} (${team}) converts from the spot at ${timeStr}.`
        } else {
          text = `GOAL! ${player} scores for ${team} at ${timeStr}!${assist ? ` Assisted by ${assist}.` : ''}`
        }
        type = 'goal'
      } else if (e.type === 'Card') {
        if (e.detail === 'Red Card') {
          text = `RED CARD! ${player} (${team}) is sent off at ${timeStr}.`
          type = 'red'
        } else {
          text = `Yellow card shown to ${player} (${team}) at ${timeStr}.`
          type = 'yellow'
        }
      } else if (e.type === 'subst') {
        text = `Substitution for ${team} at ${timeStr}: ${e.assist?.name || '?'} comes on for ${player}.`
        type = 'sub'
      }

      return { id: idx, time: min, extra: e.time?.extra, text, type }
    })
    .sort((a, b) => b.time - a.time)
}

// ── SAM Score Calculator (simplified for live display) ──
const calcSamScore = (playerStats) => {
  if (!playerStats) return 0
  let score = 0
  const g = playerStats.goals?.total || 0
  const a = playerStats.goals?.assists || 0
  const saves = playerStats.goals?.saves || 0
  const passes = playerStats.passes?.accuracy ? parseInt(playerStats.passes.accuracy) : 0
  const tackles = playerStats.tackles?.total || 0
  const shots = playerStats.shots?.on || 0
  const dribbles = playerStats.dribbles?.success || 0

  score += g * 8
  score += a * 5
  score += saves * 3
  score += (passes > 80 ? 2 : passes > 60 ? 1 : 0)
  score += tackles * 1.5
  score += shots * 0.5
  score += dribbles * 1
  return Math.round(score * 10) / 10
}

// ══════════════════════════════════════
//  COUNTDOWN WIDGET
// ══════════════════════════════════════
const CountdownWidget = () => {
  const [cd, setCd] = useState(getCountdown)

  useEffect(() => {
    const iv = setInterval(() => setCd(getCountdown()), 1000)
    return () => clearInterval(iv)
  }, [])

  if (!cd) return null

  return (
    <div style={S.countdown}>
      <div style={S.cdLabel}>WORLD CUP 2026 KICKS OFF IN</div>
      <div style={S.cdBoxes}>
        {[
          { val: cd.d, unit: 'DAYS' },
          { val: cd.h, unit: 'HRS' },
          { val: cd.m, unit: 'MIN' },
          { val: cd.s, unit: 'SEC' },
        ].map((x) => (
          <div key={x.unit} style={S.cdBox}>
            <span style={S.cdNum}>{String(x.val).padStart(2, '0')}</span>
            <span style={S.cdUnit}>{x.unit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════
//  GROUP TABLE
// ══════════════════════════════════════
const GroupTable = ({ group, teams, provisional, onTeamClick }) => (
  <div style={S.group}>
    <div style={S.groupHeader}>
      Group {group}
      {provisional && <span style={S.provisionalBadge}>Provisional</span>}
    </div>
    <table style={S.table}>
      <thead>
        <tr>
          <th style={{ ...S.th, textAlign: 'left', width: '45%' }}>Team</th>
          <th style={S.th}>P</th>
          <th style={S.th}>W</th>
          <th style={S.th}>D</th>
          <th style={S.th}>L</th>
          <th style={S.th}>GD</th>
          <th style={{ ...S.th, color: '#22C55E' }}>Pts</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((t, i) => (
          <tr key={t.teamId || i} style={i < 2 ? S.qualRow : {}}>
            <td style={{ ...S.td, textAlign: 'left' }}>
              <div style={S.teamCell}>
                {t.teamLogo && <img src={t.teamLogo} alt="" style={S.teamLogo} />}
                <span
                  style={{ ...S.teamName, cursor: onTeamClick ? 'pointer' : 'default' }}
                  onClick={() => onTeamClick && onTeamClick({ teamId: t.teamId, teamName: t.teamName, teamLogo: t.teamLogo })}
                >{t.teamName}</span>
              </div>
            </td>
            <td style={S.td}>{t.played || 0}</td>
            <td style={S.td}>{t.wins || 0}</td>
            <td style={S.td}>{t.draws || 0}</td>
            <td style={S.td}>{t.losses || 0}</td>
            <td style={S.td}>{t.goalDifference || 0}</td>
            <td style={{ ...S.td, color: '#22C55E', fontWeight: 700 }}>{t.points || 0}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

// ══════════════════════════════════════
//  MATCH CARD (multi-match grid)
// ══════════════════════════════════════
const MatchCard = ({ match, onClick, isExpanded }) => {
  const home = match.teams?.home || {}
  const away = match.teams?.away || {}
  const status = match.fixture?.status?.short || ''
  const elapsed = match.fixture?.status?.elapsed
  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(status)
  const isFT = ['FT', 'AET', 'PEN'].includes(status)

  return (
    <div style={{ ...S.matchCard, ...(isExpanded ? S.matchCardExpanded : {}), ...(isLive ? S.matchCardLive : {}) }} onClick={onClick}>
      {isLive && <div style={S.liveIndicator}><span style={S.liveDot} /> LIVE {elapsed ? `${elapsed}'` : ''}</div>}
      {isFT && <div style={S.ftBadge}>FT</div>}
      {!isLive && !isFT && (
        <div style={S.matchTime}>
          {new Date(match.fixture?.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}

      <div style={S.matchTeams}>
        <div style={S.matchTeamRow}>
          {home.logo && <img src={home.logo} alt="" style={S.matchLogo} />}
          <span style={S.matchTeamName}>{home.name || '?'}</span>
          <span style={S.matchScore}>{home.goals ?? '-'}</span>
        </div>
        <div style={S.matchTeamRow}>
          {away.logo && <img src={away.logo} alt="" style={S.matchLogo} />}
          <span style={S.matchTeamName}>{away.name || '?'}</span>
          <span style={S.matchScore}>{away.goals ?? '-'}</span>
        </div>
      </div>

      {match._group && <div style={S.matchGroup}>{match._group}</div>}
    </div>
  )
}

// ══════════════════════════════════════
//  EXPANDED MATCH DETAIL (commentary + SAM)
// ══════════════════════════════════════
const MatchDetail = ({ match, commentary, samScores }) => {
  const [detailTab, setDetailTab] = useState('commentary')
  const home = match.teams?.home || {}
  const away = match.teams?.away || {}

  const tabs = [
    { key: 'commentary', label: 'Commentary' },
    { key: 'stats', label: 'Stats' },
    { key: 'lineups', label: 'Lineups' },
    { key: 'sam', label: 'SAM Metric' },
  ]

  const renderCommentary = () => {
    if (!commentary?.length) return <div style={S.empty}>Commentary will appear when the match starts</div>
    return (
      <div style={S.commentaryList}>
        {commentary.map(c => (
          <div key={c.id} style={{ ...S.commentaryItem, ...(c.type === 'goal' ? S.commentaryGoal : c.type === 'red' ? S.commentaryRed : {}) }}>
            <span style={S.commentaryTime}>{c.time}&apos;{c.extra ? `+${c.extra}` : ''}</span>
            <span style={S.commentaryText}>{c.text}</span>
          </div>
        ))}
      </div>
    )
  }

  const renderStats = () => {
    const stats = match.statistics || []
    if (!stats.length) return <div style={S.empty}>Statistics not available yet</div>
    const homeSt = stats[0]?.statistics || []
    const awaySt = stats[1]?.statistics || []
    const pairs = homeSt.map((h, i) => ({
      label: h.type,
      home: h.value ?? '—',
      away: awaySt[i]?.value ?? '—',
    }))
    return (
      <div>
        {pairs.map(p => (
          <div key={p.label} style={S.statRow}>
            <span style={S.statVal}>{p.home}</span>
            <span style={S.statLabel}>{p.label}</span>
            <span style={S.statVal}>{p.away}</span>
          </div>
        ))}
      </div>
    )
  }

  const renderSam = () => {
    if (!samScores || !samScores.length) return <div style={S.empty}>SAM scores update during the match</div>
    return (
      <div style={S.samGrid}>
        <div style={S.samTeamCol}>
          <div style={S.samTeamHeader}>{home.name}</div>
          {samScores.filter(p => p.team === home.name).sort((a, b) => b.score - a.score).map(p => (
            <div key={p.name} style={S.samPlayer}>
              <span style={S.samPlayerName}>{p.name}</span>
              <span style={S.samScore}>{p.score}</span>
            </div>
          ))}
        </div>
        <div style={S.samTeamCol}>
          <div style={S.samTeamHeader}>{away.name}</div>
          {samScores.filter(p => p.team === away.name).sort((a, b) => b.score - a.score).map(p => (
            <div key={p.name} style={S.samPlayer}>
              <span style={S.samPlayerName}>{p.name}</span>
              <span style={S.samScore}>{p.score}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={S.matchDetail}>
      {/* Scoreboard */}
      <div style={S.detailScore}>
        <div style={S.detailTeam}>
          {home.logo && <img src={home.logo} alt="" style={S.detailLogo} />}
          <span>{home.name}</span>
        </div>
        <div style={S.detailScoreNum}>{home.goals ?? 0} : {away.goals ?? 0}</div>
        <div style={S.detailTeam}>
          {away.logo && <img src={away.logo} alt="" style={S.detailLogo} />}
          <span>{away.name}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={S.detailTabs}>
        {tabs.map(t => (
          <button key={t.key} style={detailTab === t.key ? S.detailTabActive : S.detailTabBtn} onClick={() => setDetailTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={S.detailContent}>
        {detailTab === 'commentary' && renderCommentary()}
        {detailTab === 'stats' && renderStats()}
        {detailTab === 'lineups' && (
          match.lineups?.length
            ? <FormationPitch lineups={match.lineups} events={match.events} samScores={samScores} />
            : <div style={S.empty}>Lineups not available yet</div>
        )}
        {detailTab === 'sam' && renderSam()}
      </div>
    </div>
  )
}

// ══════════════════════════════════════
//  BRACKET VIEW (Road to the Final)
// ══════════════════════════════════════
const BracketMatchup = ({ home, away, round, matchNum, onTeamClick }) => (
  <div style={BS.matchup}>
    <div style={BS.matchupTeam}>
      {home?.logo && <img src={home.logo} alt="" style={BS.matchupLogo} />}
      <span
        style={{ ...BS.matchupName, ...(home?.winner ? BS.winner : {}), ...(home?.id && onTeamClick ? { cursor: 'pointer' } : {}) }}
        onClick={() => home?.id && onTeamClick && onTeamClick({ teamId: home.id, teamName: home.name, teamLogo: home.logo })}
      >{home?.name || 'TBD'}</span>
      <span style={BS.matchupScore}>{home?.goals ?? ''}</span>
    </div>
    <div style={{ ...BS.matchupTeam, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      {away?.logo && <img src={away.logo} alt="" style={BS.matchupLogo} />}
      <span
        style={{ ...BS.matchupName, ...(away?.winner ? BS.winner : {}), ...(away?.id && onTeamClick ? { cursor: 'pointer' } : {}) }}
        onClick={() => away?.id && onTeamClick && onTeamClick({ teamId: away.id, teamName: away.name, teamLogo: away.logo })}
      >{away?.name || 'TBD'}</span>
      <span style={BS.matchupScore}>{away?.goals ?? ''}</span>
    </div>
  </div>
)

const BracketView = ({ fixtures, onTeamClick }) => {
  // Parse knockout fixtures from API data
  const knockout = useMemo(() => {
    const rounds = {
      'Round of 32': [],
      'Round of 16': [],
      'Quarter-finals': [],
      'Semi-finals': [],
      'Final': [],
    }

    if (fixtures?.length) {
      fixtures.forEach(f => {
        const round = f._group || f.fixture?.round || ''
        const home = f.teams?.home || {}
        const away = f.teams?.away || {}
        const status = f.fixture?.status?.short || 'NS'
        const isFT = ['FT', 'AET', 'PEN'].includes(status)

        const match = {
          id: f.fixture?.id,
          home: { name: home.name || 'TBD', logo: home.logo, goals: home.goals, winner: isFT && (home.goals > away.goals), id: home.id },
          away: { name: away.name || 'TBD', logo: away.logo, goals: away.goals, winner: isFT && (away.goals > home.goals), id: away.id },
          date: f.fixture?.date,
          status,
        }

        if (round.includes('32')) rounds['Round of 32'].push(match)
        else if (round.includes('16')) rounds['Round of 16'].push(match)
        else if (round.toLowerCase().includes('quarter')) rounds['Quarter-finals'].push(match)
        else if (round.toLowerCase().includes('semi')) rounds['Semi-finals'].push(match)
        else if (round.toLowerCase().includes('final') && !round.toLowerCase().includes('semi') && !round.toLowerCase().includes('quarter')) rounds['Final'].push(match)
      })
    }

    return rounds
  }, [fixtures])

  const roundOrder = ['Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final']
  const hasKnockout = roundOrder.some(r => knockout[r]?.length > 0)

  // Pre-tournament: show the bracket structure with group winners/runners-up placeholders
  const renderPreTournamentBracket = () => (
    <div>
      <div style={BS.roadmapInfo}>
        The knockout stage begins after the group stage. The top 2 from each group plus the 8 best 3rd-place teams advance to the Round of 32.
      </div>
      <div style={BS.bracketFlow}>
        {roundOrder.map((round, idx) => {
          const matchCount = round === 'Round of 32' ? 16 : round === 'Round of 16' ? 8 : round === 'Quarter-finals' ? 4 : round === 'Semi-finals' ? 2 : 1
          return (
            <div key={round} style={BS.roundCol}>
              <div style={BS.roundHeader}>{round}</div>
              <div style={BS.roundMatches}>
                {Array.from({ length: matchCount }).map((_, i) => (
                  <BracketMatchup key={i} home={{ name: 'TBD' }} away={{ name: 'TBD' }} round={round} matchNum={i} onTeamClick={onTeamClick} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // Live/post-tournament: show actual results
  const renderLiveBracket = () => (
    <div style={BS.bracketFlow}>
      {roundOrder.map(round => {
        const matches = knockout[round] || []
        if (!matches.length) return null
        return (
          <div key={round} style={BS.roundCol}>
            <div style={BS.roundHeader}>{round}</div>
            <div style={BS.roundMatches}>
              {matches.map((m, i) => (
                <BracketMatchup key={m.id || i} home={m.home} away={m.away} round={round} matchNum={i} onTeamClick={onTeamClick} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div>
      <div style={BS.bracketTitle}>Road to the Final</div>
      <div style={BS.bracketSubtitle}>48 teams &rarr; 32 knockout &rarr; 16 &rarr; 8 &rarr; 4 &rarr; 2 &rarr; Champion</div>

      {/* Bracket path explanation */}
      <div style={BS.pathFlow}>
        {['Group Stage', 'Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final'].map((stage, i, arr) => (
          <React.Fragment key={stage}>
            <div style={BS.pathStage}>
              <div style={BS.pathDot} />
              <span style={BS.pathLabel}>{stage}</span>
            </div>
            {i < arr.length - 1 && <div style={BS.pathLine} />}
          </React.Fragment>
        ))}
      </div>

      {/* Scrollable bracket */}
      <div style={BS.bracketScroll}>
        {hasKnockout ? renderLiveBracket() : renderPreTournamentBracket()}
      </div>
    </div>
  )
}

// Bracket styles
const BS = {
  bracketTitle: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 18,
    fontWeight: 800,
    color: '#DAA520',
    marginBottom: 4,
  },
  bracketSubtitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  pathFlow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    padding: '16px 0',
    marginBottom: 20,
    overflowX: 'auto',
  },
  pathStage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  pathDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: 'rgba(218, 165, 32, 0.2)',
    border: '2px solid #DAA520',
  },
  pathLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 9,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  pathLine: {
    flex: 1,
    minWidth: 20,
    height: 2,
    background: 'linear-gradient(90deg, #DAA520, rgba(218,165,32,0.2))',
    marginTop: -18,
  },
  bracketScroll: {
    overflowX: 'auto',
    paddingBottom: 12,
  },
  bracketFlow: {
    display: 'flex',
    gap: 12,
    minWidth: 'max-content',
  },
  roundCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 180,
  },
  roundHeader: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 12,
    fontWeight: 700,
    color: '#DAA520',
    letterSpacing: 0.5,
    textAlign: 'center',
    padding: '6px 10px',
    background: 'rgba(218, 165, 32, 0.06)',
    borderRadius: 6,
    border: '1px solid rgba(218, 165, 32, 0.1)',
    marginBottom: 4,
  },
  roundMatches: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    justifyContent: 'space-around',
    flex: 1,
  },
  matchup: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  matchupTeam: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 10px',
  },
  matchupLogo: {
    width: 16,
    height: 16,
    objectFit: 'contain',
    flexShrink: 0,
  },
  matchupName: {
    flex: 1,
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.6)',
  },
  matchupScore: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    minWidth: 16,
    textAlign: 'right',
  },
  winner: {
    color: '#22C55E',
    fontWeight: 700,
  },
  roadmapInfo: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 1.6,
    marginBottom: 16,
    padding: '12px 16px',
    background: 'rgba(218, 165, 32, 0.04)',
    border: '1px solid rgba(218, 165, 32, 0.08)',
    borderRadius: 8,
  },
}

// ══════════════════════════════════════
//  TEAM DETAIL POPUP
// ══════════════════════════════════════
const TeamDetailPopup = ({ teamId, teamName, teamLogo, onClose }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!teamId) return
    setLoading(true)
    fetch(`${SOCCER_API}/api/v1/world-cup/team/${teamId}`)
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.success) setData(json.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [teamId])

  const posLabel = { Goalkeeper: 'GK', Defender: 'DEF', Midfielder: 'MID', Attacker: 'FWD' }

  return (
    <div style={TS.backdrop} onClick={onClose}>
      <div style={TS.popup} onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button style={TS.close} onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div style={TS.header}>
          <img src={data?.team?.logo || teamLogo || ''} alt="" style={TS.teamLogo} />
          <div>
            <div style={TS.teamName}>{data?.team?.name || teamName}</div>
            <div style={TS.teamCountry}>{data?.team?.country || ''}</div>
          </div>
        </div>

        {/* Stats overview */}
        {data?.stats && (
          <div style={TS.statsRow}>
            {[
              { label: 'W', val: data.stats.wins },
              { label: 'D', val: data.stats.draws },
              { label: 'L', val: data.stats.losses },
              { label: 'GF', val: data.stats.goalsFor },
              { label: 'GA', val: data.stats.goalsAgainst },
              { label: 'CS', val: data.stats.cleanSheets },
            ].map(s => (
              <div key={s.label} style={TS.statBox}>
                <span style={TS.statNum}>{s.val}</span>
                <span style={TS.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Squad */}
        {loading ? (
          <div style={S.empty}>Loading squad...</div>
        ) : data?.squad?.length ? (
          <div style={TS.squadSection}>
            <div style={TS.squadTitle}>Squad</div>
            <div style={TS.squadHeader}>
              <span style={{ ...TS.squadCol, width: 30 }}>#</span>
              <span style={{ ...TS.squadCol, flex: 1 }}>Player</span>
              <span style={{ ...TS.squadCol, width: 36 }}>Pos</span>
              <span style={{ ...TS.squadCol, width: 30 }}>Age</span>
              <span style={{ ...TS.squadCol, width: 50, color: '#22C55E' }}>SAM</span>
              <span style={{ ...TS.squadCol, width: 24 }}>G</span>
              <span style={{ ...TS.squadCol, width: 24 }}>A</span>
            </div>
            <div style={TS.squadList}>
              {data.squad.map((p, idx) => {
                const prevPos = idx > 0 ? data.squad[idx - 1].position : null
                const showDivider = prevPos && prevPos !== p.position
                return (
                  <div key={p.id || idx}>
                    {showDivider && <div style={TS.posDivider} />}
                    <div style={TS.playerRow}>
                      <span style={{ ...TS.playerCol, width: 30, color: 'rgba(255,255,255,0.25)' }}>{p.number || '-'}</span>
                      <div style={{ ...TS.playerCol, flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {p.photo && <img src={p.photo} alt="" style={TS.playerPhoto} />}
                        <span style={TS.playerName}>{p.name}</span>
                      </div>
                      <span style={{ ...TS.playerCol, width: 36, color: 'rgba(218,165,32,0.7)' }}>{posLabel[p.position] || p.position}</span>
                      <span style={{ ...TS.playerCol, width: 30 }}>{p.age || '-'}</span>
                      <span style={{ ...TS.playerCol, width: 50, color: p.samScore > 0 ? '#22C55E' : 'rgba(255,255,255,0.2)', fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", fontSize: 14 }}>
                        {p.samScore > 0 ? p.samScore : '-'}
                      </span>
                      <span style={{ ...TS.playerCol, width: 24 }}>{p.goals || '-'}</span>
                      <span style={{ ...TS.playerCol, width: 24 }}>{p.assists || '-'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={S.empty}>Squad data will be available closer to the tournament</div>
        )}
      </div>
    </div>
  )
}

// Team popup styles
const TS = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)',
  },
  popup: {
    position: 'relative',
    width: '92%',
    maxWidth: 560,
    maxHeight: '85vh',
    overflowY: 'auto',
    background: 'linear-gradient(165deg, #0d1320 0%, #111b2e 50%, #0a1018 100%)',
    border: '1px solid rgba(218, 165, 32, 0.15)',
    borderRadius: 16,
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxShadow: '0 24px 80px -12px rgba(0,0,0,0.7), 0 0 40px -10px rgba(218,165,32,0.1)',
  },
  close: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  teamLogo: {
    width: 48,
    height: 48,
    objectFit: 'contain',
  },
  teamName: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 22,
    fontWeight: 800,
    color: '#fff',
  },
  teamCountry: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statsRow: {
    display: 'flex',
    gap: 8,
    padding: '12px 0',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  statBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  statNum: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    color: '#DAA520',
  },
  statLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 9,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
  },
  squadSection: {},
  squadTitle: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 8,
  },
  squadHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 8px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  squadCol: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 9,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  squadList: {
    maxHeight: 380,
    overflowY: 'auto',
  },
  playerRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 8px',
    borderBottom: '1px solid rgba(255,255,255,0.02)',
    transition: 'background 0.15s',
  },
  playerCol: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  playerPhoto: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    objectFit: 'cover',
    background: 'rgba(255,255,255,0.05)',
  },
  playerName: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
  },
  posDivider: {
    height: 1,
    background: 'rgba(218,165,32,0.08)',
    margin: '4px 0',
  },
}

// ══════════════════════════════════════
//  SCHEDULE / FIXTURE LIST
// ══════════════════════════════════════
const ScheduleView = ({ fixtures }) => {
  // Group fixtures by date
  const grouped = useMemo(() => {
    const map = {}
    fixtures.forEach(f => {
      const date = new Date(f.fixture?.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      if (!map[date]) map[date] = []
      map[date].push(f)
    })
    return Object.entries(map)
  }, [fixtures])

  if (!fixtures?.length) return <div style={S.empty}>Schedule will be available soon</div>

  return (
    <div>
      {grouped.map(([date, matches]) => (
        <div key={date}>
          <div style={S.schedDate}>{date}</div>
          {matches.map(m => {
            const home = m.teams?.home || {}
            const away = m.teams?.away || {}
            const time = new Date(m.fixture?.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            const isFT = ['FT', 'AET', 'PEN'].includes(m.fixture?.status?.short)
            return (
              <div key={m.fixture?.id} style={S.schedRow}>
                <div style={S.schedTeam}>
                  {home.logo && <img src={home.logo} alt="" style={S.schedLogo} />}
                  {home.name || 'TBD'}
                </div>
                <div style={S.schedCenter}>
                  {isFT ? <span style={S.schedScore}>{home.goals} - {away.goals}</span> : <span style={S.schedTime}>{time}</span>}
                </div>
                <div style={{ ...S.schedTeam, justifyContent: 'flex-end' }}>
                  {away.name || 'TBD'}
                  {away.logo && <img src={away.logo} alt="" style={S.schedLogo} />}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════
//  MAIN WORLD CUP HUB COMPONENT
// ══════════════════════════════════════
const WorldCupHub = () => {
  const phase = getPhase()
  const [activeView, setActiveView] = useState(phase === 'live' ? 'matches' : 'overview')
  const [groups, setGroups] = useState([])
  const [fixtures, setFixtures] = useState([])
  const [liveMatches, setLiveMatches] = useState([])
  const [expandedMatch, setExpandedMatch] = useState(null)
  const [expandedData, setExpandedData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [articles, setArticles] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [samXI, setSamXI] = useState(null)

  // Fetch World Cup data from soccer server
  const fetchWCData = useCallback(async () => {
    try {
      const [grpRes, fixRes] = await Promise.all([
        fetch(`${SOCCER_API}/api/v1/world-cup/groups`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${SOCCER_API}/api/v1/world-cup/fixtures`).then(r => r.ok ? r.json() : null).catch(() => null),
      ])

      if (grpRes?.success) {
        // Only show groups A-L (12 groups of 4), filter out any API artifact groups
        const validGroups = (grpRes.data || []).filter(g => g.group && g.group.length === 1 && g.group >= 'A' && g.group <= 'L' && g.teams?.length <= 4)
        setGroups(validGroups)
      }
      if (fixRes?.success) {
        const all = fixRes.data || []
        setFixtures(all)
        // Separate live matches
        const live = all.filter(f => ['1H', '2H', 'HT', 'ET', 'P'].includes(f.fixture?.status?.short))
        setLiveMatches(live)
      }
    } catch (err) {
      console.warn('[WC Hub] Fetch error:', err.message)
    }
    setLoading(false)
  }, [])

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    try {
      const res = await fetch(`${SOCCER_API}/api/v1/world-cup/articles`).then(r => r.ok ? r.json() : null).catch(() => null)
      if (res?.success) setArticles(res.data || [])
    } catch (e) { /* silent */ }
  }, [])

  // Fetch SAM XI
  const fetchSamXI = useCallback(async () => {
    try {
      const res = await fetch(`${SOCCER_API}/api/v1/world-cup/sam-xi`).then(r => r.ok ? r.json() : null).catch(() => null)
      if (res?.success) setSamXI(res.data)
    } catch (e) { /* silent */ }
  }, [])

  useEffect(() => {
    fetchWCData()
    fetchArticles()
    fetchSamXI()
    // Poll live matches every 60s during tournament
    if (phase === 'live') {
      const iv = setInterval(fetchWCData, 60000)
      return () => clearInterval(iv)
    }
  }, [fetchWCData, fetchArticles, fetchSamXI, phase])

  // Fetch expanded match details
  const handleMatchExpand = useCallback(async (match) => {
    const fId = match.fixture?.id
    if (expandedMatch === fId) {
      setExpandedMatch(null)
      setExpandedData(null)
      return
    }
    setExpandedMatch(fId)
    try {
      const res = await fetch(`${SOCCER_API}/api/v1/world-cup/match/${fId}`).then(r => r.ok ? r.json() : null)
      if (res?.success) setExpandedData(res.data)
    } catch (e) {
      console.warn('[WC Hub] Match detail error:', e.message)
    }
  }, [expandedMatch])

  const handleTeamClick = useCallback((team) => {
    if (team?.teamId) setSelectedTeam(team)
  }, [])

  const views = phase === 'live'
    ? [
        { key: 'matches', label: 'Live Matches' },
        { key: 'groups', label: 'Groups' },
        { key: 'bracket', label: 'Bracket' },
        { key: 'schedule', label: 'Schedule' },
        { key: 'articles', label: 'Articles' },
        { key: 'samxi', label: 'SAM XI' },
        // Predictor tab: auto-hide 7 days after World Cup final (July 19, 2026)
        ...(Date.now() < new Date('2026-07-26T23:59:59Z').getTime()
          ? [{ key: 'predictor', label: 'Predictor' }]
          : []),
      ]
    : [
        { key: 'overview', label: 'Overview' },
        { key: 'groups', label: 'Groups' },
        { key: 'bracket', label: 'Bracket' },
        { key: 'schedule', label: 'Schedule' },
        { key: 'articles', label: 'Articles' },
        { key: 'samxi', label: 'SAM XI' },
        // Predictor tab: auto-hide 7 days after World Cup final (July 19, 2026)
        ...(Date.now() < new Date('2026-07-26T23:59:59Z').getTime()
          ? [{ key: 'predictor', label: 'Predictor' }]
          : []),
      ]

  // ── Render views ──

  const renderOverview = () => (
    <div>
      <CountdownWidget />

      {/* Featured articles */}
      {articles.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Latest News</div>
          <div style={AS.overviewList}>
            {articles.slice(0, 5).map((a, i) => (
              <a key={a._id || i} href={a.link || '#'} target="_blank" rel="noopener noreferrer" style={AS.overviewItem}>
                <span style={AS.overviewNum}>{String(i + 1).padStart(2, '0')}</span>
                <div style={AS.overviewContent}>
                  <div style={AS.overviewTitle}>{a.title}</div>
                  <span style={AS.tag}>{a.tag || 'News'}</span>
                </div>
              </a>
            ))}
            <button style={AS.viewAllBtn} onClick={() => setActiveView('articles')}>View all articles</button>
          </div>
        </div>
      )}

      {/* Group previews */}
      {groups.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Group Stage</div>
          <div style={S.groupsGrid}>
            {groups.map(g => <GroupTable key={g.group} group={g.group} teams={g.teams} provisional={g._provisional} onTeamClick={handleTeamClick} />)}
          </div>
        </div>
      )}

      {/* Upcoming matches */}
      {fixtures.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Upcoming Matches</div>
          <ScheduleView fixtures={fixtures.filter(f => f.fixture?.status?.short === 'NS').slice(0, 10)} />
        </div>
      )}
    </div>
  )

  const renderLiveMatches = () => {
    const todayMatches = fixtures.filter(f => {
      const mDate = new Date(f.fixture?.date).toDateString()
      return mDate === new Date().toDateString()
    })
    const live = todayMatches.filter(f => ['1H', '2H', 'HT', 'ET', 'P'].includes(f.fixture?.status?.short))
    const upcoming = todayMatches.filter(f => f.fixture?.status?.short === 'NS')
    const finished = todayMatches.filter(f => ['FT', 'AET', 'PEN'].includes(f.fixture?.status?.short))

    return (
      <div>
        {live.length > 0 && (
          <div style={S.section}>
            <div style={S.sectionTitle}><span style={S.liveDot} /> Live Now</div>
            <div style={S.matchGrid}>
              {live.map(m => (
                <div key={m.fixture?.id}>
                  <MatchCard match={m} onClick={() => handleMatchExpand(m)} isExpanded={expandedMatch === m.fixture?.id} />
                  {expandedMatch === m.fixture?.id && expandedData && (
                    <MatchDetail
                      match={expandedData}
                      commentary={generateCommentary(expandedData.events, expandedData.teams?.home, expandedData.teams?.away)}
                      samScores={expandedData._samScores || []}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Coming Up</div>
            <div style={S.matchGrid}>
              {upcoming.map(m => <MatchCard key={m.fixture?.id} match={m} onClick={() => handleMatchExpand(m)} />)}
            </div>
          </div>
        )}

        {finished.length > 0 && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Completed</div>
            <div style={S.matchGrid}>
              {finished.map(m => (
                <div key={m.fixture?.id}>
                  <MatchCard match={m} onClick={() => handleMatchExpand(m)} isExpanded={expandedMatch === m.fixture?.id} />
                  {expandedMatch === m.fixture?.id && expandedData && (
                    <MatchDetail
                      match={expandedData}
                      commentary={generateCommentary(expandedData.events, expandedData.teams?.home, expandedData.teams?.away)}
                      samScores={expandedData._samScores || []}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!live.length && !upcoming.length && !finished.length && (
          <div style={S.empty}>No matches scheduled for today</div>
        )}
      </div>
    )
  }

  const renderGroups = () => {
    if (!groups.length) return <div style={S.empty}>Group standings will be available when the tournament starts</div>
    return (
      <div style={S.groupsGrid}>
        {groups.map(g => <GroupTable key={g.group} group={g.group} teams={g.teams} provisional={g._provisional} onTeamClick={handleTeamClick} />)}
      </div>
    )
  }

  const renderArticles = () => {
    if (!articles.length) return <div style={S.empty}>Articles coming soon</div>
    const hero = articles[0]
    const secondary = articles.slice(1, 4)
    const rest = articles.slice(4)

    const timeAgo = (dateStr) => {
      if (!dateStr) return ''
      const diff = Date.now() - new Date(dateStr).getTime()
      const mins = Math.floor(diff / 60000)
      if (mins < 60) return `${mins}m ago`
      const hrs = Math.floor(mins / 60)
      if (hrs < 24) return `${hrs}h ago`
      const days = Math.floor(hrs / 24)
      return `${days}d ago`
    }

    return (
      <div>
        {/* Hero article */}
        <a href={hero.link || '#'} target="_blank" rel="noopener noreferrer" style={AS.hero}>
          <div style={AS.heroOverlay}>
            <span style={AS.heroTag}>{hero.tag || 'News'}</span>
            <div style={AS.heroTitle}>{hero.title}</div>
            {hero.excerpt && <div style={AS.heroExcerpt}>{hero.excerpt}</div>}
            <div style={AS.heroMeta}>{timeAgo(hero.date)}</div>
          </div>
        </a>

        {/* Secondary row — 3 cards */}
        {secondary.length > 0 && (
          <div style={AS.secondaryRow}>
            {secondary.map((a, i) => (
              <a key={a._id || i} href={a.link || '#'} target="_blank" rel="noopener noreferrer" style={AS.secondaryCard}>
                <span style={AS.tag}>{a.tag || 'News'}</span>
                <div style={AS.secondaryTitle}>{a.title}</div>
                <div style={AS.meta}>{timeAgo(a.date)}</div>
              </a>
            ))}
          </div>
        )}

        {/* Remaining articles — compact list */}
        {rest.length > 0 && (
          <div style={AS.listSection}>
            <div style={AS.listHeader}>More Headlines</div>
            {rest.map((a, i) => (
              <a key={a._id || i} href={a.link || '#'} target="_blank" rel="noopener noreferrer" style={AS.listItem}>
                <div style={AS.listLeft}>
                  <span style={AS.listNum}>{String(i + 4).padStart(2, '0')}</span>
                  <div>
                    <div style={AS.listTitle}>{a.title}</div>
                    <div style={AS.listMeta}>
                      <span style={AS.tag}>{a.tag || 'News'}</span>
                      <span style={AS.metaDot}>&middot;</span>
                      <span style={AS.meta}>{timeAgo(a.date)}</span>
                    </div>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </a>
            ))}
          </div>
        )}
      </div>
    )
  }

  // SAM XI player popup state
  const [samXIPlayer, setSamXIPlayer] = useState(null)

  const renderSamXI = () => {
    if (!samXI) return <div style={S.empty}>Loading SAM Team of the Tournament...</div>

    const players = samXI.players || []
    const isPre = samXI.preTournament

    // 4-3-3 formation rows (top to bottom: FWD, MID, DEF, GK)
    const gk = players.filter(p => p.position === 'G')
    const defs = players.filter(p => p.position === 'D')
    const mids = players.filter(p => p.position === 'M')
    const fwds = players.filter(p => p.position === 'F')

    const posLabels = { G: 'GK', D: 'DEF', M: 'MID', F: 'FWD' }
    const posColors = { G: '#f59e0b', D: '#3b82f6', M: '#22C55E', F: '#ef4444' }

    const shortName = (name) => {
      if (!name) return '?'
      const parts = name.trim().split(' ')
      if (parts.length <= 1) return name
      return parts[parts.length - 1]
    }

    // SVG pitch dimensions — horizontal / landscape
    const W = 700, H = 340

    // 4-3-3 positions — horizontal: GK on left, FWD on right (x%, y%)
    const positions = [
      // GK (1) — far left
      ...gk.map(p => ({ ...p, px: 8, py: 50 })),
      // Defenders (4) — left-center
      ...defs.map((p, i) => ({ ...p, px: 25, py: [12, 37, 63, 88][i] || 50 })),
      // Midfielders (3) — center
      ...mids.map((p, i) => ({ ...p, px: 50, py: [18, 50, 82][i] || 50 })),
      // Forwards (3) — right
      ...fwds.map((p, i) => ({ ...p, px: 78, py: [18, 50, 82][i] || 50 })),
    ]

    return (
      <div>
        {/* Header */}
        <div style={XI.header}>
          <div style={XI.titleRow}>
            <div>
              <div style={XI.title}>SAM Team of the Tournament</div>
              <div style={XI.subtitle}>Best performing XI based on SAM Metric scores{isPre ? ' (Pre-tournament projection)' : ''}</div>
            </div>
            <div style={XI.formation}>4-3-3</div>
          </div>
          {samXI.lastUpdated && (
            <div style={XI.updated}>Updated {new Date(samXI.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          )}
        </div>

        {/* 3D Pitch with SamSports banners */}
        <div style={XI.pitch3dScene}>
          {/* Top banner — SamSports advertising board */}
          <div style={XI.bannerTop}>
            <div style={XI.bannerInner}>
              {[0,1,2,3].map(i => (
                <span key={i} style={XI.bannerText}>
                  <span style={XI.bannerSam}>SAM</span>SPORTS
                  <span style={XI.bannerDot}>&nbsp;&bull;&nbsp;</span>
                </span>
              ))}
            </div>
          </div>

          {/* 3D Perspective Pitch */}
          <div style={XI.pitch3dWrap}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
              <defs>
                <linearGradient id="pitchGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1a5c2a" />
                  <stop offset="20%" stopColor="#145222" />
                  <stop offset="40%" stopColor="#1a5c2a" />
                  <stop offset="60%" stopColor="#145222" />
                  <stop offset="80%" stopColor="#1a5c2a" />
                  <stop offset="100%" stopColor="#145222" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="shadow3d">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Pitch background */}
              <rect x="0" y="0" width={W} height={H} rx="4" fill="url(#pitchGrad)" />

              {/* Vertical grass stripes */}
              {[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map(i => (
                <rect key={i} x={i * (W / 14)} y="0" width={W / 14} height={H} fill={i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} />
              ))}

              {/* Pitch outline */}
              <rect x="12" y="12" width={W - 24} height={H - 24} rx="2" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />

              {/* Center line (vertical) */}
              <line x1={W / 2} y1="12" x2={W / 2} y2={H - 12} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />

              {/* Center circle */}
              <circle cx={W / 2} cy={H / 2} r="40" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <circle cx={W / 2} cy={H / 2} r="2.5" fill="rgba(255,255,255,0.18)" />

              {/* Left penalty box (GK side) */}
              <rect x="12" y={(H - 160) / 2} width="65" height="160" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <rect x="12" y={(H - 70) / 2} width="26" height="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <path d={`M 77 ${(H - 160) / 2 + 25} Q 95 ${H / 2} 77 ${(H + 160) / 2 - 25}`} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

              {/* Right penalty box */}
              <rect x={W - 77} y={(H - 160) / 2} width="65" height="160" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <rect x={W - 38} y={(H - 70) / 2} width="26" height="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <path d={`M ${W - 77} ${(H - 160) / 2 + 25} Q ${W - 95} ${H / 2} ${W - 77} ${(H + 160) / 2 - 25}`} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

              {/* Corner arcs */}
              <path d="M 12 22 Q 12 12 22 12" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <path d={`M ${W - 12} 22 Q ${W - 12} 12 ${W - 22} 12`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <path d={`M 12 ${H - 22} Q 12 ${H - 12} 22 ${H - 12}`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <path d={`M ${W - 12} ${H - 22} Q ${W - 12} ${H - 12} ${W - 22} ${H - 12}`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

              {/* Players with 3D shadow effect */}
              {positions.map((p, idx) => {
                const cx = (p.px / 100) * (W - 32) + 16
                const cy = (p.py / 100) * (H - 50) + 25
                const pc = posColors[p.position] || '#22C55E'
                const R = 18
                return (
                  <g key={p.id || idx} style={{ cursor: 'pointer' }} onClick={() => setSamXIPlayer(p)} filter="url(#shadow3d)">
                    {/* Glow */}
                    <circle cx={cx} cy={cy} r={R + 3} fill="none" stroke={pc} strokeWidth="1" opacity="0.2" filter="url(#glow)" />

                    {/* Circle bg */}
                    <circle cx={cx} cy={cy} r={R} fill="#0d1a0d" stroke={pc} strokeWidth="1.5" opacity="0.95" />

                    {/* Photo or initial */}
                    {p.photo ? (
                      <g transform={`translate(${cx}, ${cy})`}>
                        <clipPath id={`clip-${p.id || idx}`}><circle cx="0" cy="0" r={R - 2} /></clipPath>
                        <image href={p.photo} x={-(R - 2)} y={-(R - 2)} width={(R - 2) * 2} height={(R - 2) * 2} clipPath={`url(#clip-${p.id || idx})`} preserveAspectRatio="xMidYMid slice" />
                      </g>
                    ) : (
                      <text x={cx} y={cy + 5} textAnchor="middle" fill={pc} fontFamily="Rajdhani, sans-serif" fontSize="15" fontWeight="700">
                        {(p.name || '?')[0]}
                      </text>
                    )}

                    {/* SAM badge (right) */}
                    {p.avgSam > 0 && (
                      <g>
                        <rect x={cx + 9} y={cy + 8} width="22" height="12" rx="3" fill="#22C55E" />
                        <text x={cx + 20} y={cy + 17} textAnchor="middle" fill="#0a250a" fontFamily="Rajdhani, sans-serif" fontSize="8" fontWeight="800">{p.avgSam}</text>
                      </g>
                    )}

                    {/* Name plate below */}
                    <rect x={cx - 28} y={cy + R + 2} width="56" height="14" rx="3" fill="rgba(0,0,0,0.7)" />
                    <text x={cx} y={cy + R + 12} textAnchor="middle" fill="#fff" fontFamily="'Barlow Condensed', sans-serif" fontSize="8.5" fontWeight="700">
                      {shortName(p.name)}
                    </text>
                    <text x={cx} y={cy + R + 23} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontFamily="'Barlow Condensed', sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.3">
                      {p.team}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Bottom banner — SamSports advertising board */}
          <div style={XI.bannerBottom}>
            <div style={XI.bannerInner}>
              {[0,1,2,3].map(i => (
                <span key={i} style={XI.bannerText}>
                  <span style={XI.bannerSam}>SAM</span>SPORTS
                  <span style={XI.bannerDot}>&nbsp;&bull;&nbsp;</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Player list below pitch */}
        <div style={XI.listSection}>
          <div style={XI.listHeader}>Full SAM XI Breakdown</div>
          <div style={XI.listTable}>
            <div style={XI.listHeaderRow}>
              <span style={{ ...XI.listCol, width: 30 }}>#</span>
              <span style={{ ...XI.listCol, flex: 1, textAlign: 'left' }}>Player</span>
              <span style={{ ...XI.listCol, width: 36 }}>Pos</span>
              <span style={{ ...XI.listCol, width: 80, textAlign: 'left' }}>Team</span>
              <span style={{ ...XI.listCol, width: 40 }}>Apps</span>
              <span style={{ ...XI.listCol, width: 26 }}>G</span>
              <span style={{ ...XI.listCol, width: 26 }}>A</span>
              <span style={{ ...XI.listCol, width: 50, color: '#22C55E' }}>SAM</span>
            </div>
            {players.map((p, i) => (
              <div key={p.id || i} style={XI.listRow} onClick={() => setSamXIPlayer(p)}>
                <span style={{ ...XI.listVal, width: 30, color: 'rgba(218,165,32,0.3)' }}>{i + 1}</span>
                <div style={{ ...XI.listVal, flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {p.photo && <img src={p.photo} alt="" style={XI.listPhoto} />}
                  <span style={{ color: '#fff', fontWeight: 600, cursor: 'pointer' }}>{p.name}</span>
                </div>
                <span style={{ ...XI.listVal, width: 36, color: posColors[p.position] || 'rgba(218,165,32,0.6)' }}>{posLabels[p.position] || p.position}</span>
                <div style={{ ...XI.listVal, width: 80, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {p.teamLogo && <img src={p.teamLogo} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />}
                  <span>{p.team}</span>
                </div>
                <span style={{ ...XI.listVal, width: 40 }}>{p.appearances || '-'}</span>
                <span style={{ ...XI.listVal, width: 26 }}>{p.goals || '-'}</span>
                <span style={{ ...XI.listVal, width: 26 }}>{p.assists || '-'}</span>
                <span style={{ ...XI.listVal, width: 50, color: p.avgSam > 0 ? '#22C55E' : 'rgba(255,255,255,0.2)', fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", fontSize: 14 }}>
                  {p.avgSam > 0 ? p.avgSam : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Player Stats Popup */}
        {samXIPlayer && (
          <div style={XI.popBackdrop} onClick={() => setSamXIPlayer(null)}>
            <div style={XI.popCard} onClick={e => e.stopPropagation()}>
              <button style={XI.popClose} onClick={() => setSamXIPlayer(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>

              {/* Hero */}
              <div style={XI.popHero}>
                <div style={{ ...XI.popPosBadge, background: posColors[samXIPlayer.position] || '#22C55E' }}>{posLabels[samXIPlayer.position]}</div>
                <div style={XI.popPhotoWrap}>
                  {samXIPlayer.photo ? (
                    <img src={samXIPlayer.photo} alt="" style={XI.popPhoto} />
                  ) : (
                    <div style={XI.popPhotoPlaceholder}>{(samXIPlayer.name || '?')[0]}</div>
                  )}
                </div>
                <div style={XI.popName}>{samXIPlayer.name}</div>
                <div style={XI.popTeamRow}>
                  {samXIPlayer.teamLogo && <img src={samXIPlayer.teamLogo} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />}
                  <span style={XI.popTeam}>{samXIPlayer.team}</span>
                </div>
              </div>

              {/* SAM Score Hero */}
              <div style={XI.popSamHero}>
                <div style={XI.popSamLabel}>SAM SCORE</div>
                <div style={XI.popSamValue}>{samXIPlayer.avgSam > 0 ? samXIPlayer.avgSam : '-'}</div>
                {samXIPlayer.bestSam > 0 && <div style={XI.popSamBest}>Best: {samXIPlayer.bestSam}</div>}
              </div>

              {/* Stats Grid */}
              <div style={XI.popStatsGrid}>
                {[
                  { label: 'Appearances', val: samXIPlayer.appearances || 0, icon: '▶' },
                  { label: 'Goals', val: samXIPlayer.goals || 0, icon: '⚽' },
                  { label: 'Assists', val: samXIPlayer.assists || 0, icon: '🎯' },
                  { label: 'Avg SAM', val: samXIPlayer.avgSam || '-', icon: '📊' },
                ].map(s => (
                  <div key={s.label} style={XI.popStatBox}>
                    <div style={XI.popStatVal}>{s.val}</div>
                    <div style={XI.popStatLabel}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Performance bars */}
              <div style={XI.popBarsSection}>
                <div style={XI.popBarsTitle}>Performance Breakdown</div>
                {[
                  { label: 'Goals', val: (samXIPlayer.goals || 0) * 8, max: 40, color: '#ef4444' },
                  { label: 'Assists', val: (samXIPlayer.assists || 0) * 5, max: 25, color: '#3b82f6' },
                  { label: 'Match Impact', val: samXIPlayer.avgSam || 0, max: 30, color: '#22C55E' },
                ].map(bar => (
                  <div key={bar.label} style={XI.popBarRow}>
                    <span style={XI.popBarLabel}>{bar.label}</span>
                    <div style={XI.popBarTrack}>
                      <div style={{ ...XI.popBarFill, width: `${Math.min(100, (bar.val / bar.max) * 100)}%`, background: bar.color }} />
                    </div>
                    <span style={{ ...XI.popBarVal, color: bar.color }}>{bar.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
    {/* ── Full-page Predictor overlay ── */}
    {activeView === 'predictor' && (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1000, background: '#020617',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 16px', background: '#0f172a',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <button
            onClick={() => setActiveView('overview')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '8px 14px', color: '#e2e8f0',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            &#8592; Back to World Cup
          </button>
          <span style={{ color: '#d4af37', fontWeight: 700, fontSize: 15 }}>World Cup 2026 Predictor</span>
        </div>
        <iframe
          id='wcp-iframe'
          src='/WorldCupPredictor-Live.html?v=3'
          title='World Cup Predictor'
          style={{
            flex: 1, width: '100%', border: 'none',
            display: 'block', background: '#020617',
          }}
          loading='lazy'
          allow='clipboard-write'
          onLoad={() => {
            try {
              const uid = localStorage.getItem('userId')
              const name = localStorage.getItem('userName')
              const country = localStorage.getItem('userCountry') || ''
              if (uid && name) {
                const frame = document.getElementById('wcp-iframe')
                if (frame && frame.contentWindow) {
                  frame.contentWindow.postMessage({
                    type: 'wcp:auth',
                    user: { id: uid, displayName: name, country },
                    token: localStorage.getItem('token') || null,
                  }, '*')
                }
              }
            } catch (e) { /* silent */ }
          }}
        />
      </div>
    )}
    <div style={S.hub}>
      {/* Hub Header */}
      <div style={S.hubHeader}>
        <div style={S.hubTitleRow}>
          <div>
            <h2 style={S.hubTitle}>World Cup 2026</h2>
            <p style={S.hubSubtitle}>USA &middot; Mexico &middot; Canada</p>
          </div>
          {liveMatches.length > 0 && (
            <div style={S.liveCount}>
              <span style={S.liveDot} />
              {liveMatches.length} LIVE
            </div>
          )}
        </div>

        {/* Sub-navigation */}
        <div style={S.viewTabs}>
          {views.map(v => (
            <button
              key={v.key}
              style={activeView === v.key ? S.viewTabActive : S.viewTabBtn}
              onClick={() => setActiveView(v.key)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={S.hubContent}>
        {loading ? (
          <div style={S.empty}>Loading World Cup data...</div>
        ) : (
          <>
            {activeView === 'overview' && renderOverview()}
            {activeView === 'matches' && renderLiveMatches()}
            {activeView === 'groups' && renderGroups()}
            {activeView === 'bracket' && <BracketView fixtures={fixtures} onTeamClick={handleTeamClick} />}
            {activeView === 'schedule' && <ScheduleView fixtures={fixtures} />}
            {activeView === 'articles' && renderArticles()}
            {activeView === 'samxi' && renderSamXI()}
            {activeView === 'predictor' && null /* rendered full-page below */}
          </>
        )}
      </div>

      {/* Team Detail Popup */}
      {selectedTeam && (
        <TeamDetailPopup
          teamId={selectedTeam.teamId}
          teamName={selectedTeam.teamName}
          teamLogo={selectedTeam.teamLogo}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </div>
    </>
  )
}

// ══════════════════════════════════════
//  STYLES
// ══════════════════════════════════════
const S = {
  hub: { display: 'flex', flexDirection: 'column', gap: 0 },
  hubHeader: {
    background: 'linear-gradient(135deg, #1a0a00 0%, #3d1800 40%, #6b2f00 70%, #3d1800 100%)',
    border: '1px solid rgba(218, 165, 32, 0.25)',
    borderRadius: 12,
    padding: '20px 20px 0',
    marginBottom: 16,
  },
  hubTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  hubTitle: {
    margin: 0,
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 26,
    fontWeight: 800,
    color: '#DAA520',
    letterSpacing: 0.5,
  },
  hubSubtitle: {
    margin: '2px 0 0',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 12,
    color: 'rgba(218, 165, 32, 0.5)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  liveCount: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    color: '#ef4444',
    letterSpacing: 1,
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '4px 10px',
    borderRadius: 20,
  },
  viewTabs: { display: 'flex', gap: 4, borderTop: '1px solid rgba(218, 165, 32, 0.12)', paddingTop: 10 },
  viewTabBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(218, 165, 32, 0.45)',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 14px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    letterSpacing: 0.5,
    transition: 'color 0.15s',
  },
  viewTabActive: {
    background: 'transparent',
    border: 'none',
    color: '#DAA520',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 12,
    fontWeight: 700,
    padding: '8px 14px',
    cursor: 'pointer',
    borderBottom: '2px solid #DAA520',
    letterSpacing: 0.5,
  },
  hubContent: { minHeight: 300 },

  // Countdown
  countdown: {
    background: 'linear-gradient(135deg, #1a0a00, #2d1500)',
    border: '1px solid rgba(218, 165, 32, 0.2)',
    borderRadius: 12,
    padding: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  cdLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    color: 'rgba(218, 165, 32, 0.5)',
    letterSpacing: 3,
    marginBottom: 16,
  },
  cdBoxes: { display: 'flex', justifyContent: 'center', gap: 12 },
  cdBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(218, 165, 32, 0.06)',
    border: '1px solid rgba(218, 165, 32, 0.15)',
    borderRadius: 10,
    padding: '12px 16px',
    minWidth: 60,
  },
  cdNum: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 32,
    fontWeight: 700,
    color: '#DAA520',
    lineHeight: 1,
  },
  cdUnit: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 9,
    fontWeight: 600,
    color: 'rgba(218, 165, 32, 0.4)',
    letterSpacing: 1.5,
    marginTop: 4,
  },

  // Sections
  section: { marginBottom: 20 },
  sectionTitle: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 16,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  // Groups
  groupsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 },
  group: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  groupHeader: {
    padding: '8px 14px',
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    color: '#DAA520',
    background: 'rgba(218, 165, 32, 0.06)',
    borderBottom: '1px solid rgba(218, 165, 32, 0.1)',
    letterSpacing: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  provisionalBadge: {
    fontSize: 8,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.05)',
    padding: '2px 6px',
    borderRadius: 4,
    letterSpacing: 0.5,
    fontFamily: "'Barlow Condensed', sans-serif",
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '6px 8px',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 9,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  td: {
    padding: '7px 8px',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
  },
  qualRow: { background: 'rgba(34, 197, 94, 0.04)' },
  teamCell: { display: 'flex', alignItems: 'center', gap: 8 },
  teamLogo: { width: 18, height: 18, objectFit: 'contain' },
  teamName: { fontSize: 12, fontWeight: 600, color: '#fff', transition: 'color 0.15s' },

  // Match grid
  matchGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 },
  matchCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 14,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  matchCardLive: { borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.03)' },
  matchCardExpanded: { borderColor: 'rgba(218, 165, 32, 0.3)' },
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10,
    fontWeight: 700,
    color: '#ef4444',
    letterSpacing: 1,
    marginBottom: 8,
  },
  liveDot: {
    display: 'inline-block',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#ef4444',
    boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  ftBadge: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  matchTime: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 8,
  },
  matchTeams: { display: 'flex', flexDirection: 'column', gap: 6 },
  matchTeamRow: { display: 'flex', alignItems: 'center', gap: 8 },
  matchLogo: { width: 20, height: 20, objectFit: 'contain' },
  matchTeamName: { flex: 1, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 600, color: '#fff' },
  matchScore: { fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: '#fff', minWidth: 20, textAlign: 'right' },
  matchGroup: {
    marginTop: 8,
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 9,
    color: 'rgba(218, 165, 32, 0.4)',
    letterSpacing: 0.5,
  },

  // Match detail
  matchDetail: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(218, 165, 32, 0.15)',
    borderRadius: 10,
    padding: 16,
    marginTop: 10,
    gridColumn: '1 / -1',
  },
  detailScore: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 16 },
  detailTeam: { display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 600, color: '#fff' },
  detailLogo: { width: 28, height: 28, objectFit: 'contain' },
  detailScoreNum: { fontFamily: "'Rajdhani', sans-serif", fontSize: 28, fontWeight: 800, color: '#DAA520' },
  detailTabs: { display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 12 },
  detailTabBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.35)',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    padding: '6px 12px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
  },
  detailTabActive: {
    background: 'transparent',
    border: 'none',
    color: '#DAA520',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    padding: '6px 12px',
    cursor: 'pointer',
    borderBottom: '2px solid #DAA520',
  },
  detailContent: { minHeight: 100 },

  // Commentary
  commentaryList: { display: 'flex', flexDirection: 'column', gap: 6 },
  commentaryItem: {
    display: 'flex',
    gap: 10,
    padding: '8px 10px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: 6,
    borderLeft: '3px solid rgba(255,255,255,0.08)',
  },
  commentaryGoal: { borderLeftColor: '#22C55E', background: 'rgba(34, 197, 94, 0.04)' },
  commentaryRed: { borderLeftColor: '#ef4444', background: 'rgba(239, 68, 68, 0.04)' },
  commentaryTime: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    color: '#DAA520',
    minWidth: 36,
    flexShrink: 0,
  },
  commentaryText: { fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 },

  // Stats
  statRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  statVal: { fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700, color: '#fff', minWidth: 40, textAlign: 'center' },
  statLabel: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5 },

  // SAM scores
  samGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  samTeamCol: { display: 'flex', flexDirection: 'column', gap: 4 },
  samTeamHeader: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, color: '#DAA520', marginBottom: 6, letterSpacing: 0.5 },
  samPlayer: { display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: 4 },
  samPlayerName: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  samScore: { fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700, color: '#22C55E' },

  // Schedule
  schedDate: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    color: '#DAA520',
    letterSpacing: 1,
    padding: '10px 0 6px',
    borderBottom: '1px solid rgba(218, 165, 32, 0.1)',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  schedRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 10px',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    gap: 10,
  },
  schedTeam: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
  },
  schedLogo: { width: 18, height: 18, objectFit: 'contain' },
  schedCenter: { minWidth: 60, textAlign: 'center' },
  schedScore: { fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: '#fff' },
  schedTime: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.35)' },

  // Common
  empty: {
    padding: 40,
    textAlign: 'center',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
  },
}

// ── Article Styles (AS) ──
const AS = {
  // Hero
  hero: {
    display: 'block',
    textDecoration: 'none',
    position: 'relative',
    background: 'linear-gradient(135deg, rgba(218,165,32,0.08) 0%, rgba(218,165,32,0.02) 100%)',
    border: '1px solid rgba(218,165,32,0.15)',
    borderRadius: 14,
    padding: '28px 24px',
    marginBottom: 14,
    transition: 'border-color 0.2s, background 0.2s',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  heroOverlay: { position: 'relative', zIndex: 1 },
  heroTag: {
    display: 'inline-block',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 9,
    fontWeight: 700,
    color: '#0d1320',
    background: '#DAA520',
    padding: '3px 8px',
    borderRadius: 4,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  heroTitle: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 22,
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1.2,
    marginBottom: 8,
  },
  heroExcerpt: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 1.6,
    maxWidth: 600,
    marginBottom: 10,
  },
  heroMeta: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10,
    color: 'rgba(218,165,32,0.5)',
    letterSpacing: 0.5,
  },

  // Secondary row
  secondaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
    marginBottom: 16,
  },
  secondaryCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    textDecoration: 'none',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: '16px 14px',
    transition: 'border-color 0.2s',
    cursor: 'pointer',
  },
  secondaryTitle: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    lineHeight: 1.25,
    flex: 1,
  },

  // Shared
  tag: {
    display: 'inline-block',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 8,
    fontWeight: 700,
    color: '#DAA520',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  meta: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10,
    color: 'rgba(255,255,255,0.25)',
  },
  metaDot: {
    color: 'rgba(255,255,255,0.12)',
    margin: '0 5px',
    fontSize: 10,
  },

  // Compact list
  listSection: {
    borderTop: '1px solid rgba(255,255,255,0.04)',
    paddingTop: 14,
  },
  listHeader: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    textDecoration: 'none',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  listLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  listNum: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    color: 'rgba(218,165,32,0.25)',
    minWidth: 22,
    flexShrink: 0,
    marginTop: 1,
  },
  listTitle: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 1.3,
    marginBottom: 4,
  },
  listMeta: {
    display: 'flex',
    alignItems: 'center',
  },

  // Overview (compact for the overview tab)
  overviewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    background: 'rgba(255,255,255,0.015)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  overviewItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    textDecoration: 'none',
    padding: '11px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  overviewNum: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    color: 'rgba(218,165,32,0.3)',
    minWidth: 20,
    flexShrink: 0,
  },
  overviewContent: {
    flex: 1,
    minWidth: 0,
  },
  overviewTitle: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.3,
    marginBottom: 3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  viewAllBtn: {
    background: 'transparent',
    border: 'none',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    color: '#DAA520',
    letterSpacing: 0.5,
    padding: '10px 14px',
    cursor: 'pointer',
    textAlign: 'left',
  },
}

// ── SAM XI Styles ──
const XI = {
  header: { marginBottom: 16 },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  title: { fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 800, color: '#22C55E' },
  subtitle: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5, marginTop: 2 },
  formation: { fontFamily: "'Rajdhani', sans-serif", fontSize: 24, fontWeight: 800, color: 'rgba(34,197,94,0.2)', letterSpacing: 2 },
  updated: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 0.5 },

  // 3D Pitch scene
  pitch3dScene: {
    marginBottom: 20,
    perspective: '800px',
    perspectiveOrigin: '50% 30%',
  },
  pitch3dWrap: {
    borderRadius: 4,
    overflow: 'hidden',
    background: '#0d1a0d',
    transform: 'rotateX(15deg) scale(0.95)',
    transformOrigin: '50% 50%',
    boxShadow: '0 20px 60px -10px rgba(0,0,0,0.7), 0 0 40px -5px rgba(34,197,94,0.06)',
    border: '1px solid rgba(34,197,94,0.12)',
  },
  bannerTop: {
    background: 'linear-gradient(90deg, #1a1a2e, #0f3460, #1a1a2e)',
    border: '1px solid rgba(212,168,67,0.3)',
    borderBottom: 'none',
    borderRadius: '8px 8px 0 0',
    padding: '5px 0',
    overflow: 'hidden',
    transform: 'rotateX(15deg) scale(0.95) translateY(2px)',
    transformOrigin: '50% 100%',
  },
  bannerBottom: {
    background: 'linear-gradient(90deg, #1a1a2e, #0f3460, #1a1a2e)',
    border: '1px solid rgba(212,168,67,0.3)',
    borderTop: 'none',
    borderRadius: '0 0 8px 8px',
    padding: '5px 0',
    overflow: 'hidden',
    transform: 'rotateX(15deg) scale(0.95) translateY(-2px)',
    transformOrigin: '50% 0%',
  },
  bannerInner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0,
    whiteSpace: 'nowrap',
  },
  bannerText: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 13,
    fontWeight: 800,
    color: '#D4A843',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textShadow: '0 0 8px rgba(212,168,67,0.4)',
  },
  bannerSam: {
    color: '#fff',
    textShadow: '0 0 10px rgba(255,255,255,0.3)',
  },
  bannerDot: {
    color: 'rgba(212,168,67,0.3)',
    fontSize: 10,
  },

  // List
  listSection: { background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '16px 14px' },
  listHeader: { fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 },
  listTable: {},
  listHeaderRow: { display: 'flex', alignItems: 'center', padding: '6px 4px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  listCol: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'center' },
  listRow: { display: 'flex', alignItems: 'center', padding: '8px 4px', borderBottom: '1px solid rgba(255,255,255,0.025)', cursor: 'pointer', transition: 'background 0.15s' },
  listVal: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  listPhoto: { width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', background: 'rgba(255,255,255,0.05)' },

  // Player stats popup
  popBackdrop: { position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' },
  popCard: {
    position: 'relative', width: '92%', maxWidth: 380, maxHeight: '85vh', overflowY: 'auto',
    background: 'linear-gradient(165deg, #0a1018 0%, #0d1a2e 50%, #0a1018 100%)',
    border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, padding: '0 0 20px', display: 'flex', flexDirection: 'column',
    boxShadow: '0 24px 80px -12px rgba(0,0,0,0.8), 0 0 60px -10px rgba(34,197,94,0.08)',
  },
  popClose: {
    position: 'absolute', top: 14, right: 14, zIndex: 2, width: 28, height: 28,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
    color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  },
  popHero: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    padding: '28px 20px 16px',
    background: 'linear-gradient(180deg, rgba(34,197,94,0.06) 0%, transparent 100%)',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  popPosBadge: {
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, color: '#fff',
    padding: '2px 10px', borderRadius: 10, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4,
  },
  popPhotoWrap: {
    width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
    border: '3px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(34,197,94,0.15)',
  },
  popPhoto: { width: '100%', height: '100%', objectFit: 'cover' },
  popPhotoPlaceholder: { fontFamily: "'Rajdhani', sans-serif", fontSize: 32, fontWeight: 700, color: '#22C55E' },
  popName: { fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', textAlign: 'center' },
  popTeamRow: { display: 'flex', alignItems: 'center', gap: 6 },
  popTeam: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 },

  // SAM hero
  popSamHero: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '14px 20px',
    background: 'rgba(34,197,94,0.04)', margin: '0 16px', borderRadius: 12, border: '1px solid rgba(34,197,94,0.1)',
    marginTop: 12,
  },
  popSamLabel: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, color: 'rgba(34,197,94,0.5)', letterSpacing: 2 },
  popSamValue: { fontFamily: "'Rajdhani', sans-serif", fontSize: 40, fontWeight: 800, color: '#22C55E', lineHeight: 1 },
  popSamBest: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.25)' },

  // Stats grid
  popStatsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, padding: '14px 16px 0' },
  popStatBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 4px',
    background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)',
  },
  popStatVal: { fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1 },
  popStatLabel: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5, textTransform: 'uppercase' },

  // Performance bars
  popBarsSection: { padding: '14px 16px 0' },
  popBarsTitle: { fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 10 },
  popBarRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  popBarLabel: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', width: 70, flexShrink: 0 },
  popBarTrack: { flex: 1, height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' },
  popBarFill: { height: '100%', borderRadius: 3, transition: 'width 0.6s ease' },
  popBarVal: { fontFamily: "'Rajdhani', sans-serif", fontSize: 12, fontWeight: 700, width: 30, textAlign: 'right', flexShrink: 0 },
}

export default WorldCupHub
