import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LandingHeader from '../LandingPage/LandingHeader'
import Footer from '../LandingPage/Footer'
import { espnGet } from '../LandingPage/hooks/useESPNData'
import '../../styles/pages/landing.css'
import TeamLogo from '../../components/TeamLogo'

const C = {
  bg: '#02070D', surface: '#061019', surface2: '#08131D', card: '#0B1722',
  border: 'rgba(145,171,187,0.14)', green: '#5BD313', greenBright: '#75EE22',
  text: '#F5F7F8', gray: '#A3ADB7', muted: '#687481', blue: '#3CA6FF', red: '#FF3030', gold: '#F2B516',
  hd: "'Rajdhani',sans-serif", cd: "'Barlow Condensed',sans-serif", bd: "'Barlow',sans-serif",
}
const SOCCER_BACKEND_URL = process.env.REACT_APP_SOCCER_API_URL || 'https://soccerbackend.samsports.io'
const logoOf = (t) => t?.logos?.find(l => (l.rel || []).includes('default'))?.href || t?.logos?.[0]?.href || ''
const statVal = (rec, name) => {
  const s = (rec?.items?.[0]?.stats || []).find(x => x.name === name)
  return s ? Math.round(s.value) : null
}
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : ''
const fmtDateTime = (d) => d ? new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }) + ' · ' + new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''
const scoreOf = (c) => {
  const s = c?.score
  if (s == null) return null
  if (typeof s === 'object') return s.value != null ? Number(s.value) : (s.displayValue != null ? Number(s.displayValue) : null)
  const n = Number(s); return Number.isNaN(n) ? null : n
}
const POS_GROUP = (p) => {
  const a = (p?.position?.abbreviation || p?.position?.name || '').toLowerCase()
  if (a.startsWith('g')) return 'GK'
  if (a.startsWith('d') || a.includes('back')) return 'DEF'
  if (a.startsWith('m')) return 'MID'
  if (a.startsWith('f') || a.startsWith('s') || a.includes('wing')) return 'FWD'
  return 'OTH'
}

/* Reusable panel shell */
const Panel = ({ title, action, children, style }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, ...style }}>
    {title && (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontFamily: C.cd, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: C.muted }}>{title}</span>
        {action}
      </div>
    )}
    {children}
  </div>
)
const Empty = ({ text }) => (
  <div style={{ padding: '14px 4px', fontFamily: C.bd, fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>{text}</div>
)

const TeamPage = () => {
  const { sport, league, teamId } = useParams()
  const navigate = useNavigate()
  const user = useSelector(s => s?.user)
  const isAuthenticated = !!user?.userDetails?._id

  const [team, setTeam] = useState(null)
  const [players, setPlayers] = useState([])
  const [results, setResults] = useState([])
  const [fixtures, setFixtures] = useState([])
  const [form, setForm] = useState([])
  const [related, setRelated] = useState([])
  const [standings, setStandings] = useState([])
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [fav, setFav] = useState(false)

  const handleLogout = useCallback(() => { localStorage.removeItem('token'); navigate('/') }, [navigate])
  const goTeam = (id) => id && navigate(`/team/${sport}/${league}/${id}`)

  useEffect(() => {
    let alive = true
    setLoading(true); setTab('overview')
    ;(async () => {
      try {
        const [detail, roster, schedule, teamsList, standingsData] = await Promise.all([
          espnGet(sport, league, `teams/${teamId}`),
          espnGet(sport, league, `teams/${teamId}/roster`),
          espnGet(sport, league, `teams/${teamId}/schedule`),
          espnGet(sport, league, 'teams'),
          espnGet(sport, league, 'standings'),
        ])
        if (!alive) return
        setTeam(detail?.team || null)
        setInsights(null)
        // Non-blocking API-Football enrichment (soccer only): top scorers, injuries, team stats
        if (sport === 'soccer' && detail?.team?.displayName) {
          fetch(`${SOCCER_BACKEND_URL}/api/v1/match-detail/team-insights?name=${encodeURIComponent(detail.team.displayName)}&espnLeague=${league}`)
            .then(r => r.json()).then(j => { if (alive && j?.found) setInsights(j) }).catch(() => {})
        }
        const raw = roster?.athletes || []
        const list = []
        if (Array.isArray(raw)) {
          if (raw.length && raw[0]?.items) raw.forEach(g => (g.items || []).forEach(p => list.push(p)))
          else raw.forEach(p => list.push(p))
        }
        setPlayers(list)
        const evs = schedule?.events || []
        const parsed = evs.map(ev => {
          const comp = ev?.competitions?.[0]; if (!comp) return null
          const cs = comp.competitors || []
          const me = cs.find(c => String(c.id) === String(teamId) || String(c.team?.id) === String(teamId))
          const opp = cs.find(c => c !== me)
          if (!me || !opp) return null
          const st = comp.status?.type || ev.status?.type || {}
          const completed = !!st.completed || st.state === 'post'
          const ms = scoreOf(me), os = scoreOf(opp)
          let result = null
          if (completed && ms != null && os != null) result = ms > os ? 'W' : ms < os ? 'L' : 'D'
          return { id: ev.id, date: ev.date, home: me.homeAway === 'home', opp: opp.team, ms, os, completed, result, venue: comp.venue?.fullName }
        }).filter(Boolean)
        const res = parsed.filter(p => p.completed).sort((a, b) => new Date(b.date) - new Date(a.date))
        const fix = parsed.filter(p => !p.completed).sort((a, b) => new Date(a.date) - new Date(b.date))
        setResults(res); setFixtures(fix)
        setForm(res.filter(r => r.result).slice(0, 5).reverse())
        const rawTeams = teamsList?.sports?.[0]?.leagues?.[0]?.teams || []
        setRelated(rawTeams.map(x => x.team).filter(t => t && String(t.id) !== String(teamId)))
        setStandings(standingsData?.children?.[0]?.standings?.entries || standingsData?.standings?.entries || [])
      } catch (e) { if (alive) setTeam(null) }
      if (alive) setLoading(false)
    })()
    return () => { alive = false }
  }, [sport, league, teamId])

  const squadOverview = useMemo(() => {
    const g = { GK: 0, DEF: 0, MID: 0, FWD: 0, OTH: 0 }
    let ageSum = 0, ageN = 0
    const nats = new Set()
    players.forEach(p => {
      g[POS_GROUP(p)]++
      if (p.age) { ageSum += Number(p.age); ageN++ }
      if (p.citizenship) nats.add(p.citizenship)
    })
    return { g, total: players.length, avgAge: ageN ? (ageSum / ageN).toFixed(1) : null, nats: nats.size }
  }, [players])

  const shell = (children) => (
    <div className="ls-page" style={{ background: C.bg, color: C.text, minHeight: '100vh' }}>
      <LandingHeader isAuthenticated={isAuthenticated} onLoginClick={() => navigate('/')} onLogout={handleLogout} />
      {children}
      <Footer />
    </div>
  )

  if (loading) return shell(<div style={{ padding: 80, textAlign: 'center', fontFamily: C.bd, color: C.muted }}>Loading team…</div>)
  if (!team) return shell(
    <div style={{ padding: 80, textAlign: 'center', fontFamily: C.bd, color: C.muted }}>
      Team not found. <span style={{ color: C.green, cursor: 'pointer' }} onClick={() => navigate('/')}>Back to scores</span>
    </div>
  )

  const crest = logoOf(team)
  const leagueName = team.defaultLeague?.name || league
  const wins = statVal(team.record, 'wins'), ties = statVal(team.record, 'ties'), losses = statVal(team.record, 'losses')
  const hasRecord = wins != null || ties != null || losses != null
  const nextFix = fixtures[0]
  const homeVenue = (fixtures.concat(results)).find(x => x.home && x.venue)?.venue || nextFix?.venue || '—'
  const label = { fontFamily: C.cd, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: C.muted }
  const formColor = (r) => r === 'W' ? C.green : r === 'L' ? C.red : C.gray

  const Row = ({ r }) => (
    <div onClick={() => goTeam(r.opp?.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.border}`, cursor: 'pointer' }}>
      <span style={{ fontFamily: C.cd, fontSize: 11, color: C.muted, width: 52 }}>{fmtDate(r.date)}</span>
      {logoOf(r.opp) && <TeamLogo src={logoOf(r.opp)} name={r.opp?.shortDisplayName || r.opp?.displayName} size={20} round={false} style={{ objectFit: 'contain' }} />}
      <span style={{ fontFamily: C.hd, fontSize: 13, fontWeight: 700, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.home ? 'vs' : '@'} {r.opp?.shortDisplayName || r.opp?.displayName}</span>
      {r.completed
        ? <span style={{ fontFamily: C.hd, fontWeight: 800, fontSize: 13, color: formColor(r.result) }}>{r.ms}-{r.os}</span>
        : <span style={{ fontFamily: C.cd, fontSize: 11, color: C.gray }}>{new Date(r.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>}
      {r.result && <span style={{ width: 18, height: 18, borderRadius: 4, background: `${formColor(r.result)}22`, color: formColor(r.result), fontFamily: C.hd, fontWeight: 800, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.result}</span>}
    </div>
  )
  const KV = ({ k, v, vColor }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontFamily: C.bd, fontSize: 12.5, color: C.gray }}>{k}</span>
      <span style={{ fontFamily: C.hd, fontSize: 14, fontWeight: 700, color: vColor || C.text }}>{v}</span>
    </div>
  )

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'squad', label: `Squad${players.length ? ` (${players.length})` : ''}` },
    { key: 'fixtures', label: 'Fixtures & Results' },
    { key: 'standings', label: 'Standings' },
  ]

  return shell(
    <div style={{ maxWidth: 1824, margin: '0 auto', padding: '0 48px 44px' }}>
      {/* breadcrumb */}
      <div style={{ fontFamily: C.cd, fontSize: 12, color: C.muted, padding: '16px 0 10px' }}>
        <span style={{ cursor: 'pointer', color: C.gray }} onClick={() => navigate('/')}>Scores</span>
        <span style={{ margin: '0 8px' }}>›</span><span style={{ color: C.gray }}>{leagueName}</span>
        <span style={{ margin: '0 8px' }}>›</span><span style={{ color: C.text }}>{team.displayName}</span>
      </div>

      {/* HERO */}
      <div style={{ position: 'relative', borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', background: `linear-gradient(120deg, #${team.color || '0b1722'}2e, ${C.surface} 60%)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '22px 26px', flexWrap: 'wrap' }}>
          {crest && <TeamLogo src={crest} name={team.displayName} size={96} round={false} style={{ objectFit: 'contain' }} />}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: C.hd, fontSize: 34, fontWeight: 800, letterSpacing: 0.4 }}>{team.displayName}</span>
              <button onClick={() => setFav(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: fav ? C.gold : C.muted, fontSize: 20 }}>{fav ? '★' : '☆'}</button>
            </div>
            <div style={{ fontFamily: C.cd, fontSize: 14, color: C.gray, marginTop: 2 }}>{leagueName}</div>
            {team.standingSummary && <div style={{ fontFamily: C.cd, fontSize: 13, color: C.green, marginTop: 6, fontWeight: 700 }}>{team.standingSummary}</div>}
            <div style={{ display: 'flex', gap: 26, marginTop: 12, flexWrap: 'wrap' }}>
              <div><div style={label}>Manager</div><div style={{ fontFamily: C.hd, fontSize: 14, fontWeight: 700 }}>—</div></div>
              <div><div style={label}>Stadium</div><div style={{ fontFamily: C.hd, fontSize: 14, fontWeight: 700 }}>{homeVenue}</div></div>
              <div><div style={label}>Capacity</div><div style={{ fontFamily: C.hd, fontSize: 14, fontWeight: 700 }}>—</div></div>
            </div>
          </div>
          {/* next match */}
          <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, minWidth: 210 }}>
            <div style={{ ...label, marginBottom: 8 }}>Next Match</div>
            {nextFix ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => goTeam(nextFix.opp?.id)}>
                {logoOf(nextFix.opp) && <TeamLogo src={logoOf(nextFix.opp)} name={nextFix.opp?.shortDisplayName || nextFix.opp?.displayName} size={34} round={false} style={{ objectFit: 'contain' }} />}
                <div>
                  <div style={{ fontFamily: C.hd, fontSize: 14, fontWeight: 700 }}>{nextFix.home ? 'vs' : '@'} {nextFix.opp?.shortDisplayName || nextFix.opp?.displayName}</div>
                  <div style={{ fontFamily: C.cd, fontSize: 11, color: C.gray, marginTop: 2 }}>{fmtDateTime(nextFix.date)}</div>
                </div>
              </div>
            ) : <div style={{ fontFamily: C.bd, fontSize: 12, color: C.muted }}>No upcoming fixture.</div>}
          </div>
          {/* form + record */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {form.length > 0 && (
              <div>
                <div style={{ ...label, marginBottom: 6 }}>Current Form</div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {form.map((r, i) => <span key={i} style={{ width: 26, height: 26, borderRadius: 5, background: `${formColor(r.result)}22`, color: formColor(r.result), fontFamily: C.hd, fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.result}</span>)}
                </div>
              </div>
            )}
            {hasRecord && (
              <div>
                <div style={{ ...label, marginBottom: 6 }}>Season Record</div>
                <div style={{ display: 'flex', gap: 18 }}>
                  {[['W', wins, C.green], ['D', ties, C.gray], ['L', losses, C.red]].map(([k, v, col]) => (
                    <div key={k} style={{ textAlign: 'center' }}><div style={{ fontFamily: C.hd, fontSize: 24, fontWeight: 800, color: col }}>{v ?? '—'}</div><div style={label}>{k}</div></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${C.border}`, margin: '18px 0 20px', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ fontFamily: C.cd, fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: tab === t.key ? C.greenBright : C.muted, borderBottom: tab === t.key ? `2px solid ${C.green}` : '2px solid transparent' }}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW — full panel grid */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, alignItems: 'start' }}>
          <Panel title="Fixtures & Results">
            {results.length ? results.slice(0, 5).map(r => <Row key={r.id} r={r} />) : fixtures.length ? fixtures.slice(0, 5).map(r => <Row key={r.id} r={r} />) : <Empty text="Fixtures appear once the season schedule is released." />}
          </Panel>

          <Panel title="League Standing">
            {standings.length ? standings.slice(0, 6).map((e, i) => {
              const t = e.team || {}; const mine = String(t.id) === String(teamId)
              const pts = (e.stats || []).find(x => x.name === 'points')
              return (
                <div key={t.id || i} onClick={() => goTeam(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${C.border}`, cursor: 'pointer', background: mine ? 'rgba(91,211,19,0.10)' : 'transparent', borderRadius: mine ? 5 : 0 }}>
                  <span style={{ fontFamily: C.cd, fontSize: 12, color: mine ? C.green : C.muted, width: 18, fontWeight: 700 }}>{i + 1}</span>
                  {logoOf(t) && <TeamLogo src={logoOf(t)} name={t.shortDisplayName || t.displayName} size={18} round={false} style={{ objectFit: 'contain' }} />}
                  <span style={{ fontFamily: C.hd, fontSize: 12.5, fontWeight: 700, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: mine ? C.greenBright : C.text }}>{t.shortDisplayName || t.displayName}</span>
                  <span style={{ fontFamily: C.hd, fontSize: 13, fontWeight: 800 }}>{pts ? (pts.displayValue ?? Math.round(pts.value)) : '—'}</span>
                </div>
              )
            }) : <Empty text="The league table populates when the season starts." />}
          </Panel>

          <Panel title="Top Performers">
            {insights?.topScorers?.length ? insights.topScorers.map((p, i) => {
              const s = (p.statistics || []).find(x => x.team?.id === insights.teamAfId) || p.statistics?.[0] || {}
              return (
                <div key={p.player?.id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  {p.player?.photo && <img src={p.player.photo} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', background: C.card }} />}
                  <span style={{ fontFamily: C.hd, fontSize: 13.5, fontWeight: 700, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.player?.name}</span>
                  <span style={{ fontFamily: C.cd, fontSize: 12, color: C.gray }}>{s.goals?.total ?? 0}G · {s.goals?.assists ?? 0}A</span>
                  {s.games?.rating && <span style={{ fontFamily: C.hd, fontSize: 12.5, fontWeight: 800, color: C.green, width: 34, textAlign: 'right' }}>{Number(s.games.rating).toFixed(1)}</span>}
                </div>
              )
            }) : <Empty text={sport === 'soccer' ? 'Goals, assists and ratings populate once matches are played this season.' : 'Top performers populate once games are played this season.'} />}
          </Panel>

          <Panel title="Squad Overview" action={<span style={{ fontFamily: C.cd, fontSize: 10, color: C.green, cursor: 'pointer' }} onClick={() => setTab('squad')}>VIEW SQUAD</span>}>
            {players.length ? (
              <>
                {sport === 'soccer' ? (
                  <>
                    <KV k="Goalkeepers" v={squadOverview.g.GK} />
                    <KV k="Defenders" v={squadOverview.g.DEF} />
                    <KV k="Midfielders" v={squadOverview.g.MID} />
                    <KV k="Forwards" v={squadOverview.g.FWD} />
                  </>
                ) : (
                  <KV k="Players" v={squadOverview.total} />
                )}
                <KV k="Average Age" v={squadOverview.avgAge || '—'} />
                <KV k="Nationalities" v={squadOverview.nats} />
              </>
            ) : <Empty text="Squad appears when rosters are published." />}
          </Panel>

          <Panel title="Injured Players">
            {insights?.injuries?.length ? (() => {
              const seen = new Set(); const uniq = []
              insights.injuries.forEach(x => { const id = x.player?.id; if (id && !seen.has(id)) { seen.add(id); uniq.push(x) } })
              return uniq.slice(0, 8).map((x, i) => (
                <div key={x.player?.id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  {x.player?.photo && <img src={x.player.photo} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', background: C.card }} />}
                  <span style={{ fontFamily: C.hd, fontSize: 13.5, fontWeight: 700, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.player?.name}</span>
                  <span style={{ fontFamily: C.cd, fontSize: 11, color: C.red }}>{x.player?.reason || x.player?.type || 'Out'}</span>
                </div>
              ))
            })() : <Empty text="No reported injuries. Injury reports populate during the season." />}
          </Panel>

          <Panel title="Team Statistics">
            {sport === 'soccer' ? (
              <>
                {(() => {
                  const st = insights?.statistics
                  const val = {
                    'Matches Played': st?.fixtures?.played?.total,
                    'Goals Scored': st?.goals?.for?.total?.total,
                    'Goals Conceded': st?.goals?.against?.total?.total,
                    'Clean Sheets': st?.clean_sheet?.total,
                  }
                  return ['Matches Played', 'Goals Scored', 'Goals Conceded', 'Clean Sheets', 'Possession', 'Pass Accuracy', 'xG', 'xGA', 'Shots / Game', 'Tackles / Game']
                    .map(s => <KV key={s} k={s} v={val[s] != null ? val[s] : '—'} />)
                })()}
                <div style={{ marginTop: 8, fontFamily: C.cd, fontSize: 10.5, color: C.muted }}>Fills in as the season progresses.</div>
              </>
            ) : (
              <Empty text="Season statistics populate as games are played." />
            )}
          </Panel>

          <Panel title="AI Team Reports">
            <Empty text={`AI tactical analysis, season reviews and predictions for ${team.shortDisplayName || team.displayName} appear here.`} />
          </Panel>

          <Panel title="Latest News">
            <Empty text={`News about ${team.shortDisplayName || team.displayName} appears here.`} />
          </Panel>

          <Panel title="Fantasy Hub" action={<span style={{ fontFamily: C.cd, fontSize: 10, color: C.green, cursor: 'pointer' }} onClick={() => navigate('/fantasy')}>FANTASY</span>}>
            <KV k="Top Fantasy Scorer" v="—" />
            <KV k="Most Selected" v="—" />
            <KV k="Players in Auction" v="—" />
            <KV k="Team Value Trend" v="—" />
            <div style={{ marginTop: 8, fontFamily: C.cd, fontSize: 10.5, color: C.muted }}>Populates when the fantasy season opens.</div>
          </Panel>

          {/* Upcoming Opponents — wide */}
          <Panel title="Upcoming Opponents" style={{ gridColumn: '1 / -1' }}>
            {fixtures.length ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
                {fixtures.slice(0, 8).map(r => (
                  <div key={r.id} onClick={() => goTeam(r.opp?.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 9px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${C.border}` }}>
                    {logoOf(r.opp) && <TeamLogo src={logoOf(r.opp)} name={r.opp?.shortDisplayName || r.opp?.displayName} size={22} round={false} style={{ objectFit: 'contain' }} />}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: C.hd, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.opp?.shortDisplayName || r.opp?.displayName}</div>
                      <div style={{ fontFamily: C.cd, fontSize: 10, color: C.muted }}>{r.home ? 'Home' : 'Away'} · {fmtDate(r.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <Empty text="Upcoming opponents appear when the schedule is released." />}
          </Panel>

          {/* Rivals & Related — wide */}
          {related.length > 0 && (
            <Panel title={`${leagueName} Teams`} style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
                {related.map(t => (
                  <div key={t.id} onClick={() => goTeam(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${C.border}` }}>
                    {logoOf(t) && <TeamLogo src={logoOf(t)} name={t.shortDisplayName || t.displayName} size={20} round={false} style={{ objectFit: 'contain' }} />}
                    <span style={{ fontFamily: C.hd, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.shortDisplayName || t.displayName}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      )}

      {/* SQUAD */}
      {tab === 'squad' && (
        players.length ? (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 70px 110px 60px', gap: 8, padding: '10px 16px', borderBottom: `1px solid ${C.border}` }}>
              {['#', 'Player', 'Pos', 'Nationality', 'Age'].map((h, i) => <span key={i} style={label}>{h}</span>)}
            </div>
            {players.map((p, i) => (
              <div key={p.id || i} style={{ display: 'grid', gridTemplateColumns: '48px 1fr 70px 110px 60px', gap: 8, alignItems: 'center', padding: '9px 16px', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontFamily: C.cd, fontSize: 13, color: C.muted }}>{p.jersey || '—'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  {p.headshot?.href && <img src={p.headshot.href} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', background: C.card }} />}
                  <span style={{ fontFamily: C.hd, fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.fullName || p.displayName}</span>
                </span>
                <span style={{ fontFamily: C.cd, fontSize: 12, color: C.gray }}>{p.position?.abbreviation || p.position?.name || '—'}</span>
                <span style={{ fontFamily: C.cd, fontSize: 12, color: C.gray, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  {p.flag?.href && <img src={p.flag.href} alt="" style={{ width: 16, height: 11, objectFit: 'cover' }} />}
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.citizenship || ''}</span>
                </span>
                <span style={{ fontFamily: C.cd, fontSize: 13, color: C.gray }}>{p.age || '—'}</span>
              </div>
            ))}
          </div>
        ) : <Panel><Empty text="Squad not available for this team yet." /></Panel>
      )}

      {/* FIXTURES */}
      {tab === 'fixtures' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, alignItems: 'start' }}>
          <Panel title="Upcoming">{fixtures.length ? fixtures.map(r => <Row key={r.id} r={r} />) : <Empty text="No upcoming fixtures." />}</Panel>
          <Panel title="Results">{results.length ? results.map(r => <Row key={r.id} r={r} />) : <Empty text="No results yet." />}</Panel>
        </div>
      )}

      {/* STANDINGS */}
      {tab === 'standings' && (
        standings.length ? (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 44px 44px 44px 44px 52px 52px', gap: 6, padding: '10px 16px', borderBottom: `1px solid ${C.border}` }}>
              {['#', 'Team', 'P', 'W', 'D', 'L', 'GD', 'Pts'].map((h, i) => <span key={i} style={{ ...label, textAlign: i > 1 ? 'center' : 'left' }}>{h}</span>)}
            </div>
            {standings.map((e, i) => {
              const t = e.team || {}
              const g = (n) => { const s = (e.stats || []).find(x => x.name === n || x.type === n); return s ? (s.displayValue ?? Math.round(s.value)) : '—' }
              const mine = String(t.id) === String(teamId)
              return (
                <div key={t.id || i} onClick={() => goTeam(t.id)} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 44px 44px 44px 44px 52px 52px', gap: 6, alignItems: 'center', padding: '9px 16px', borderBottom: `1px solid ${C.border}`, cursor: 'pointer', background: mine ? 'rgba(91,211,19,0.10)' : 'transparent' }}>
                  <span style={{ fontFamily: C.cd, fontSize: 12, color: mine ? C.green : C.muted, fontWeight: 700 }}>{i + 1}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    {logoOf(t) && <TeamLogo src={logoOf(t)} name={t.shortDisplayName || t.displayName} size={20} round={false} style={{ objectFit: 'contain' }} />}
                    <span style={{ fontFamily: C.hd, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: mine ? C.greenBright : C.text }}>{t.shortDisplayName || t.displayName}</span>
                  </span>
                  {['gamesPlayed', 'wins', 'ties', 'losses', 'pointDifferential', 'points'].map((n, j) => (
                    <span key={n} style={{ fontFamily: C.cd, fontSize: 12.5, textAlign: 'center', color: j === 5 ? C.text : C.gray, fontWeight: j === 5 ? 800 : 500 }}>{g(n)}</span>
                  ))}
                </div>
              )
            })}
          </div>
        ) : <Panel><Empty text="Standings populate when the season starts." /></Panel>
      )}
    </div>
  )
}

export default TeamPage
