import { useNavigate } from 'react-router-dom'
import { getUserLeagues, selectLeague, joinLeague } from '../redux'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLanguage } from '../i18n/LanguageContext'
import Logo from '../assets/sam-football.png'
import moment from 'moment'
import EditLeague from '../components/modal/EditLeague'
import DeleteLeague from '../components/modal/DeleteLeague'
import ResetLeague from '../components/modal/ResetLeague'
import JoinLeague from '../components/modal/JoinLeague'
import Header from '../components/Header'
import '../styles/pages/leagueModule.css'

/* My Leagues — first page of the modernized League module.
   Premium league cards, animated summary counters, skeleton loading and an
   engaging empty state. All data + actions preserved (getUserLeagues, selectLeague,
   joinLeague, and the commissioner Edit/Reset/Delete modals). */

/* Count-up hook for the summary figures (subtle, respects reduced motion). */
function useCountUp(target, run) {
  const [n, setN] = useState(0)
  const ref = useRef()
  useEffect(() => {
    if (!run) return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(target); return }
    const start = performance.now(), dur = 900, from = 0
    cancelAnimationFrame(ref.current)
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur)
      setN(from + (target - from) * (1 - Math.pow(1 - p, 3)))
      if (p < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current)
  }, [target, run])
  return n
}

const SummaryCard = ({ icon, accent, label, value, decimals = 0, run }) => {
  const n = useCountUp(Number(value) || 0, run)
  const display = decimals ? n.toFixed(decimals).replace(/^0\./, '.') : Math.round(n).toString()
  return (
    <div className={`lgm-stat lgm-${accent}`}>
      <span className="lgm-stat-icon" aria-hidden>{icon}</span>
      <div>
        <div className="lgm-stat-label">{label}</div>
        <div className="lgm-stat-value">{display}</div>
      </div>
    </div>
  )
}

const LeagueCard = ({ data, active, yourLeague, fromHome }) => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.user.userDetails)
  const userId = localStorage.getItem('userId')
  const [menuOpen, setMenuOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const { name, draftStart, leagueType, leagueLogo, totalPlayers } = data
  const teamCount = data?.teams?.length || totalPlayers || 0
  const maxTeams = data?.numberOfTeams || 32
  const fill = Math.min(Math.round((teamCount / maxTeams) * 100), 100)
  const isPrivate = String(leagueType).toLowerCase() === 'private'
  const isCommissioner = user?.isCommissioner
  const accent = isPrivate ? 'blue' : 'purple'

  const enter = async () => { if (!active) await selectLeague({ leagueId: data?._id }, navigate); else navigate('/dashboard') }
  const join = async () => {
    setBusy(true)
    try {
      localStorage.setItem('selectedGame', 'football')
      await joinLeague({ email: user?.email, leagueId: data?.leagueId, leagueType, teamName: `team ${user?.userName}`, userId })
      navigate('/dashboard')
    } finally { setBusy(false) }
  }
  const del = async () => { const { deleteLeagueCommissioner } = await import('../redux'); await deleteLeagueCommissioner({ _id: data?._id }) }
  const reset = async () => { const { resetLeagueCommissioner } = await import('../redux'); await resetLeagueCommissioner({ _id: data?._id }) }

  return (
    <div className={`lgm-card lgm-${accent}${active ? ' lgm-card--active' : ''}`}>
      <span className="lgm-card-accent" />
      <span className="lgm-card-wave" aria-hidden>{'\u{1F3C8}'}</span>

      <div className="lgm-card-logo">
        <img src={leagueLogo || Logo} alt="" onError={(e) => { e.target.src = Logo }} />
      </div>

      <div className="lgm-card-main">
        <div className="lgm-card-titlerow">
          <span className="lgm-card-name">{name}</span>
          <span className={`lgm-badge lgm-badge--${isPrivate ? 'private' : 'public'}`}>{isPrivate ? 'PRIVATE' : 'PUBLIC'}</span>
        </div>
        <div className="lgm-card-meta">
          <span><b>{teamCount} / {maxTeams}</b> Players</span>
          <span className="lgm-dot" />
          <span>Draft: {moment(draftStart).format('MMM D, YYYY')} {moment(draftStart).format('h:mm A')} CST</span>
        </div>
        <div className="lgm-card-barrow">
          <div className="lgm-bar"><div className="lgm-bar-fill" style={{ width: `${fill}%` }} /></div>
          <span className="lgm-fill-label">{fill}% Filled</span>
        </div>
      </div>

      <div className="lgm-card-actions">
        {yourLeague ? (
          <button className={`lgm-status ${active ? 'lgm-status--active' : 'lgm-status--joined'}`} onClick={enter}>
            {active ? 'Active' : 'Joined'} <span aria-hidden>&#10004;</span>
          </button>
        ) : fromHome ? (
          <button className="lgm-join-btn" onClick={join} disabled={busy}>{busy ? '…' : 'Join'}</button>
        ) : (
          <JoinLeague data={data} />
        )}

        <div className="lgm-kebab-wrap">
          <button className="lgm-kebab" aria-label="League actions" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>&#8942;</button>
          {menuOpen && (
            <>
              <div className="lgm-kebab-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="lgm-menu" role="menu">
                <button role="menuitem" onClick={() => { setMenuOpen(false); enter() }}>Enter League</button>
                {isCommissioner && <div className="lgm-menu-commish"><EditLeague data={data} isCommissioner={isCommissioner} /></div>}
                {isCommissioner && data?.mainCommissioner === user?._id && <div className="lgm-menu-commish"><ResetLeague deleteHandler={reset} deleteLoading={false} /></div>}
                {isCommissioner && data?.teams?.length === 0 && data?.users?.length === 0 && <div className="lgm-menu-commish"><DeleteLeague deleteHandler={del} deleteLoading={false} /></div>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const CardSkeleton = () => (
  <div className="lgm-card lgm-card--skel">
    <div className="lgm-skel lgm-skel-logo" />
    <div className="lgm-card-main">
      <div className="lgm-skel" style={{ width: '40%', height: 18 }} />
      <div className="lgm-skel" style={{ width: '65%', height: 12, marginTop: 10 }} />
      <div className="lgm-skel" style={{ width: '100%', height: 8, marginTop: 14, borderRadius: 6 }} />
    </div>
  </div>
)

const SORTS = ['Status', 'Newest', 'Fill %', 'Draft Date']

const MyLeague = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const leagues = useSelector((state) => state.league)
  const user = useSelector((state) => state.user.userDetails)
  const isAuthenticated = localStorage.getItem('token')
  const [loaded, setLoaded] = useState(false)
  const [sort, setSort] = useState('Status')

  useEffect(() => { (async () => { if (isAuthenticated) await getUserLeagues(); setLoaded(true) })() }, [])

  const userLeagues = leagues?.userLeagues || []
  const futureLeagues = leagues?.futureLeagues || []
  const nonUserLeagues = (leagues?.nonUserLeagues || []).filter((v) => v._id !== '64fc5edaf8f2513bd263845a')
  const hasLeagues = userLeagues.length > 0
  const hasAny = hasLeagues || futureLeagues.length > 0 || nonUserLeagues.length > 0

  const sortedUser = useMemo(() => {
    const arr = [...userLeagues]
    if (sort === 'Newest') arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    else if (sort === 'Draft Date') arr.sort((a, b) => new Date(a.draftStart || 0) - new Date(b.draftStart || 0))
    else if (sort === 'Fill %') arr.sort((a, b) => ((b.teams?.length || 0) / (b.numberOfTeams || 32)) - ((a.teams?.length || 0) / (a.numberOfTeams || 32)))
    return arr
  }, [userLeagues, sort])

  const upcomingDrafts = [...userLeagues, ...futureLeagues].filter((l) => l.draftStart && new Date(l.draftStart) > new Date()).length
  const championships = user?.championships || 0
  const winPct = user?.winPercentage != null ? Number(user.winPercentage) : 0

  return (
    <div className="lgm-page">
      <Header />
      <div className="lgm-inner">
      {/* Header */}
      <div className="lgm-hdr">
        <div>
          <span className="lgm-hdr-tick" />
          <h1 className="lgm-title">{t('myLeagues')}</h1>
          <p className="lgm-sub">Manage your active leagues and teams.</p>
        </div>
        <div className="lgm-hdr-actions">
          <button className="lgm-btn lgm-btn--primary" onClick={() => navigate('/onboarding')}><span aria-hidden>+</span> Create League</button>
          <button className="lgm-btn lgm-btn--ghost" onClick={() => navigate('/popular-league')}><span aria-hidden>&#128269;</span> Browse Leagues</button>
        </div>
      </div>

      {/* Summary */}
      <div className="lgm-stats">
        <SummaryCard icon={'\u{1F465}'} accent="purple" label="Active Leagues" value={userLeagues.length} run={loaded} />
        <SummaryCard icon={'\u{1F4C5}'} accent="blue" label="Upcoming Drafts" value={upcomingDrafts} run={loaded} />
        <SummaryCard icon={'\u{1F3C6}'} accent="gold" label="Championships" value={championships} run={loaded} />
        <SummaryCard icon={'\u{1F4C8}'} accent="green" label="Win %" value={winPct} decimals={3} run={loaded} />
      </div>

      {/* List header */}
      <div className="lgm-listhdr">
        <h2 className="lgm-section-title">Your Leagues {hasLeagues ? `(${userLeagues.length})` : ''}</h2>
        {hasLeagues && (
          <label className="lgm-sort">Sort by:
            <select value={sort} onChange={(e) => setSort(e.target.value)}>{SORTS.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
        )}
      </div>

      {/* Body */}
      {!loaded ? (
        <div className="lgm-list">{[0, 1].map((i) => <CardSkeleton key={i} />)}</div>
      ) : !hasAny ? (
        <div className="lgm-empty">
          <div className="lgm-empty-badge" aria-hidden>{'\u{1F3C6}'}</div>
          <h2 className="lgm-empty-title">Start your dynasty</h2>
          <p className="lgm-empty-desc">You haven&apos;t joined a league yet. Create your own and invite friends, or browse open leagues to jump in.</p>
          <div className="lgm-empty-btns">
            <button className="lgm-btn lgm-btn--primary" onClick={() => navigate('/onboarding')}>+ Create League</button>
            <button className="lgm-btn lgm-btn--ghost" onClick={() => navigate('/popular-league')}>Browse Leagues</button>
          </div>
        </div>
      ) : (
        <div className="lgm-list">
          {sortedUser.map((v, i) => (
            <LeagueCard key={`u-${i}`} data={v} active={user?.team?.currentLeague?._id === v?._id} yourLeague />
          ))}
          {futureLeagues.map((v, i) => <LeagueCard key={`f-${i}`} data={v} active={false} yourLeague={false} />)}
          {!hasLeagues && nonUserLeagues.map((v, i) => (
            <LeagueCard key={`n-${i}`} data={v} active={user?.team?.currentLeague?._id === v?._id} yourLeague={false} fromHome />
          ))}

          {/* Create-new tile */}
          <button className="lgm-create-tile" onClick={() => navigate('/onboarding')}>
            <span className="lgm-create-plus" aria-hidden>+</span>
            <span>
              <span className="lgm-create-title">Create a new league</span>
              <span className="lgm-create-desc">Start your own league and invite your friends.</span>
            </span>
          </button>
        </div>
      )}
      </div>
    </div>
  )
}

export default MyLeague
