import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import LandingHeader from '../../pages/LandingPage/LandingHeader'
import LiveTicker from '../../pages/LandingPage/LiveTicker'
import LoginModal from '../LoginModal'
import { espnGet } from '../../pages/LandingPage/hooks/useESPNData'
import { getStatus } from '../../pages/LandingPage/constants'
// The header + ticker styles live in the landing stylesheet, which is only
// pulled in by the (lazy-loaded) landing page. Land straight on /fantasy and
// they'd never load, so import them here too.
import '../../styles/pages/landing.css'

// ═══════════════════════════════════════════════════════════════════════════
//  SITE HEADER — the nav + live score ticker + auth buttons, for pages outside
//  the landing page (Fantasy, Mock Draft, anything public we add later).
//  Reuses the real LandingHeader and LiveTicker so there's one look, not two.
// ═══════════════════════════════════════════════════════════════════════════

// Scoreboards worth showing above the fold. Cheap: one call each, cached 60s.
const FEEDS = [
  { sport: 'football', league: 'nfl', tag: 'A.FOOTBALL' },
  { sport: 'basketball', league: 'nba', tag: 'NBA' },
  { sport: 'baseball', league: 'mlb', tag: 'MLB' },
  { sport: 'hockey', league: 'nhl', tag: 'NHL' },
  { sport: 'soccer', league: 'fifa.world', tag: 'WORLD CUP' },
]

export default function SiteHeader({ activeSport = 'fantasy' }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)
  const isAuthenticated = !!user?.userDetails?._id

  const [loginOpen, setLoginOpen] = useState(false)
  const [tickerItems, setTickerItems] = useState([])

  const handleLogout = useCallback(() => {
    ;['token', 'userName', 'userId', 'week', 'AssignLeague', 'leagueroom', 'roomId',
      'paid', 'myinvitationtype', 'selectedGame', 'imagePath', 'lrTeamId', 'modalShown',
      'email', 'onboardingComplete', 'selectedSports', 'authToken',
    ].forEach((k) => localStorage.removeItem(k))
    dispatch({ type: 'SET_USER_DETAILS', payload: { user: null, setting: null, record: null } })
  }, [dispatch])

  // Sport tabs belong to the landing page — send people back there with the
  // sport they picked rather than half-rendering a scoreboard here.
  const handleSportChange = (sportKey) => navigate(`/?sport=${sportKey}`)

  useEffect(() => {
    let cancelled = false

    const build = async () => {
      const items = []
      await Promise.all(
        FEEDS.map(async (f) => {
          try {
            const data = await espnGet(f.sport, f.league, 'scoreboard')
            const events = data?.events || []
            events.slice(0, 6).forEach((ev) => {
              const comp = ev.competitions?.[0]
              if (!comp) return
              const cs = comp.competitors || []
              const home = cs.find((c) => c.homeAway === 'home') || cs[0]
              const away = cs.find((c) => c.homeAway === 'away') || cs[1]
              if (!home || !away) return
              const st = getStatus(comp)
              const live = st.state === 'live' || st.state === 'halftime'
              const upcoming = st.state === 'scheduled'

              // Shape must match what LiveTicker renders: homeAbbr / awayAbbr /
              // score / statusLabel / statusCls / category.
              const kickoff = ev.date
                ? new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''

              items.push({
                id: ev.id,
                tag: f.tag,
                homeAbbr: home.team?.abbreviation || home.team?.shortDisplayName || '',
                awayAbbr: away.team?.abbreviation || away.team?.shortDisplayName || '',
                score: upcoming ? 'vs' : `${home.score ?? 0}-${away.score ?? 0}`,
                statusLabel: live ? (st.label || 'LIVE') : upcoming ? kickoff : (st.label || 'Final'),
                statusCls: live ? 'live' : upcoming ? 'ns' : 'ft',
                category: live ? 'live' : upcoming ? 'upcoming' : 'finished',
                sortKey: live ? 0 : upcoming ? 1 : 2,
              })
            })
          } catch (e) { /* one dead feed shouldn't blank the whole ticker */ }
        })
      )

      if (cancelled) return
      items.sort((a, b) => a.sortKey - b.sortKey)
      setTickerItems(items.slice(0, 24))
    }

    build()
    const t = setInterval(build, 60000) // live scores go stale fast
    return () => { cancelled = true; clearInterval(t) }
  }, [])

  return (
    <>
      <LandingHeader
        activeSport={activeSport}
        onSportChange={handleSportChange}
        isAuthenticated={isAuthenticated}
        onLoginClick={() => setLoginOpen(true)}
        onLogout={handleLogout}
      />
      <LiveTicker tickerItems={tickerItems} />
      <LoginModal visible={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
