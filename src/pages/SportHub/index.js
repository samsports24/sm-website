import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { getUserLeagues } from '../../redux/actions/leagueActions'
import { attachToken, serverUrls } from '../../config/constants'
import MessagesBell from '../../components/PlatformChat/MessagesBell'
import EnablePushPrompt from '../../components/EnablePushPrompt'

/* ═══════════════════════════════════════════════════════════
   YOUR EMPIRE — SamSports hub (2026 premium redesign)
   Gold + deep-purple "franchise terminal" layout: left sidebar,
   top nav, hero, product cards, right rail (SamPoints + activity),
   and a bottom feature strip. Art comes from /assets/hub/*.png,
   with emoji/gradient fallbacks until those files are added.
   ═══════════════════════════════════════════════════════════ */

const ASSET = (name) => `${process.env.PUBLIC_URL || ''}/assets/hub/${name}`

// <Art> renders an image and quietly falls back to a gradient tile + emoji if
// the file isn't there yet, so the hub never looks broken pre-artwork.
function Art({ name, emoji, style, fallbackBg }) {
  const [err, setErr] = useState(false)
  if (err) {
    return (
      <div style={{ ...style, background: fallbackBg || 'linear-gradient(135deg,#2a2350,#12101d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: (parseInt(style?.width, 10) || 40) * 0.5 }}>{emoji}</span>
      </div>
    )
  }
  return <img src={ASSET(name)} alt="" style={style} onError={() => setErr(true)} />
}

const PRODUCTS = [
  {
    id: 'rivals-soccer', name: 'SAM RIVALS', subtitle: 'Soccer',
    description: '10 divisions. Monthly seasons. Climb to World Masters.',
    badge: 'RIVALS', accentColor: '#10B981',
    icon: '⚽', art: 'rivals-soccer.png', cardArt: 'card-soccer.png', fullArt: 'rivals-soccer-full.png',
    features: ['H2H Matchups', 'Promotion & Relegation', 'SamPoints Rewards'],
    cta: 'Enter Rivals', group: 'rivals',
    frontEndUrl: process.env.REACT_APP_SOCCER_URL || 'https://football.samsports.io',
    rivalsPath: '/rivals',
  },
  {
    id: 'rivals-nfl', name: 'SAM RIVALS', subtitle: 'American Football',
    description: '4 divisions. 53-man rosters. Dominate the Gridiron.',
    badge: 'RIVALS', accentColor: '#7C3AED',
    icon: '🏈', art: 'rivals-nfl.png', cardArt: 'card-nfl.png', fullArt: 'rivals-nfl-full.png',
    features: ['Thu→Mon Scoring', '3-4 Defense Flex', 'Promotion & Relegation', 'SamPoints Rewards'],
    cta: 'Enter Rivals', frontEndUrl: null, rivalsPath: '/nfl-rivals', group: 'rivals',
  },
  {
    id: 'dynasty32', name: 'Dynasty 32', subtitle: 'A.Football Fantasy',
    description: 'Full dynasty leagues. Draft, trade, and build your empire.',
    badge: 'FANTASY', accentColor: '#EF4444',
    icon: '🏈', art: 'american-football.png', cardArt: 'card-dynasty.png', fullArt: 'dynasty32-full.png',
    features: ['Dynasty Drafts', 'Trade Market', 'Commissioner Tools'],
    cta: 'Enter League', group: 'fantasy',
    sportField: 'football', frontEndUrl: null, dashboardPath: '/dashboard',
  },
  {
    id: 'eleven-fc', name: 'Eleven F.C', subtitle: 'Soccer Fantasy',
    description: 'Classic fantasy soccer. Draft your dream squad.',
    badge: 'FANTASY', accentColor: '#3B82F6',
    icon: '⚽', art: 'eleven-fc.png', cardArt: 'card-eleven.png', fullArt: 'eleven-fc-full.png',
    features: ['Live Scoring', 'Auction Drafts', 'Loan & Buyout Market'],
    cta: 'Enter League', group: 'fantasy',
    sportField: 'soccer',
    frontEndUrl: process.env.REACT_APP_SOCCER_URL || 'https://football.samsports.io',
    dashboardPath: '/dashboard',
  },
]

const NAV = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'rivals', label: 'Rivals', icon: '⚔️' },
  { id: 'leagues', label: 'Leagues', icon: '🏆' },
  { id: 'ktc', label: 'Keep Trade Cut', icon: '🔀' },
  { id: 'mock', label: 'Mock Draft', icon: '⏱️' },
  { id: 'profile', label: 'Profile', icon: '👤' },
]

const FEATURES = [
  { icon: '🪙', art: 'earn-sampoints.png', title: 'Earn SamPoints', desc: 'Compete, climb, unlock rewards.', color: '#22C55E' },
  { icon: '🚀', art: 'climb-divisions.png', title: 'Climb Divisions', desc: 'Rise through the rankings.', color: '#A78BFA' },
  { icon: '👑', art: 'build-empire.png', title: 'Build Your Empire', desc: 'Draft, trade, dominate.', color: '#3B82F6' },
  { icon: '👔', art: 'gm-mode.png', title: 'GM Mode', desc: 'Manage your team, control your finances.', color: '#D4AF37' },
]

// Small "x minutes ago" formatter for the activity feed.
const timeAgo = (d) => {
  if (!d) return ''
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// Colour-coded clock per event category (drawn as SVG — no raster image):
//   green = draft complete   purple = your turn / on the clock
//   gold  = league / trade    red    = rivals events
const activityClockColor = (a = {}) => {
  const t = `${a.type || ''} ${a.module || ''} ${a.title || ''} ${a.message || ''}`.toLowerCase()
  if (t.includes('rival')) return '#EF4444'
  if (t.includes('on the clock') || t.includes('your pick') || t.includes("you're up") || t.includes('your turn')) return '#A855F7'
  if (t.includes('draft')) return '#22C55E'
  return '#E0B23C'
}

// Clean stopwatch icon, tinted to the event colour.
const ClockIcon = ({ color = '#A855F7', size = 20 }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="none" aria-hidden>
    <rect x="13.5" y="2" width="5" height="3.4" rx="1.4" fill={color} />
    <rect x="14.7" y="4.6" width="2.6" height="3" fill={color} />
    <rect x="5.4" y="6.2" width="5" height="2.6" rx="1.3" transform="rotate(-42 7.9 7.5)" fill={color} />
    <rect x="21.6" y="6.2" width="5" height="2.6" rx="1.3" transform="rotate(42 24.1 7.5)" fill={color} />
    <circle cx="16" cy="19.5" r="10.2" fill={`${color}1f`} stroke={color} strokeWidth="2" />
    <line x1="16" y1="19.5" x2="16" y2="12.6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="16" y1="19.5" x2="20.8" y2="21.6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="16" cy="19.5" r="1.5" fill={color} />
  </svg>
)

const SportHub = () => {
  const navigate = useNavigate()
  const user = useSelector(state => state?.user?.userDetails)
  const leagues = useSelector(state => state?.league)
  const [leagueCounts, setLeagueCounts] = useState({ football: 0, soccer: 0 })
  const [activity, setActivity] = useState([])
  const [hovered, setHovered] = useState(null)
  const [narrow, setNarrow] = useState(typeof window !== 'undefined' && window.innerWidth <= 980)

  const samPoints = user?.earnedSamPoints || 0
  const rivalsProducts = PRODUCTS.filter(p => p.group === 'rivals')
  const fantasyProducts = PRODUCTS.filter(p => p.group === 'fantasy')
  const totalLeagues = leagueCounts.football + leagueCounts.soccer

  useEffect(() => {
    attachToken()
    getUserLeagues()
    fetchLeagueCounts()
    fetchActivity()
    const onResize = () => setNarrow(window.innerWidth <= 980)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const soccerBase = () => {
    const soccerServer = serverUrls.find(s => s.key === 'eleven_fc')
    return soccerServer?.url || process.env.REACT_APP_SOCCER_API_URL || 'https://soccerbackend.samsports.io'
  }

  const fetchLeagueCounts = async () => {
    try {
      const footballCount = (leagues?.userLeagues || []).length + (leagues?.futureLeagues || []).length
      setLeagueCounts(prev => ({ ...prev, football: footballCount }))
    } catch (e) { /* noop */ }
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const res = await axios.get(`${soccerBase()}/api/v1/leagues/my-leagues`, {
        headers: { Authorization: `Bearer ${token}` }, timeout: 5000,
      })
      const data = res?.data?.data
      if (data) {
        const list = Array.isArray(data) ? data : [...(data.userLeagues || []), ...(data.futureLeagues || [])]
        setLeagueCounts(prev => ({ ...prev, soccer: list.length }))
      }
    } catch (e) { /* noop */ }
  }

  // Recent activity — real data from the soccer notifications feed (this account
  // is soccer-heavy; NFL activity can be merged in a later pass).
  const fetchActivity = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const res = await axios.get(`${soccerBase()}/api/v1/notifications`, {
        headers: { Authorization: `Bearer ${token}` }, timeout: 6000,
      })
      const raw = res?.data?.data || res?.data?.notifications || res?.data || []
      const list = Array.isArray(raw) ? raw : (raw.notifications || raw.data || [])
      setActivity(list.slice(0, 6))
    } catch (e) { /* feed just stays empty */ }
  }

  const goToFullEmpire = (path = '/war-room') => {
    const token = localStorage.getItem('token')
    const soccerUrl = process.env.REACT_APP_SOCCER_URL || 'https://football.samsports.io'
    window.location.href = `${soccerUrl}${path}?token=${token}`
  }

  const handleProductClick = useCallback((product) => {
    const token = localStorage.getItem('token')
    if (product.group === 'rivals') {
      if (product.frontEndUrl) window.location.href = `${product.frontEndUrl}${product.rivalsPath}?token=${token}`
      else if (product.rivalsPath) navigate(product.rivalsPath)
    } else if (product.group === 'fantasy') {
      if (product.frontEndUrl) window.location.href = `${product.frontEndUrl}?token=${token}`
      else if (product.dashboardPath) navigate(product.dashboardPath)
    }
  }, [navigate])

  const getLeagueCount = (product) =>
    product.sportField === 'football' ? leagueCounts.football
      : product.sportField === 'soccer' ? leagueCounts.soccer : 0

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const onNav = (id) => {
    if (id === 'home') scrollTo('hub-top')
    else if (id === 'rivals') scrollTo('rivals')
    else if (id === 'leagues') navigate('/dashboard')
    else if (id === 'ktc') navigate('/values')
    else if (id === 'mock') navigate('/mock-draft')
    else if (id === 'livescore') navigate('/')
    else if (id === 'fantasy') navigate('/fantasy')
    else if (id === 'rewards' || id === 'marketplace' || id === 'governance') goToFullEmpire('/war-room')
    else if (id === 'profile' || id === 'settings') navigate('/edit-profile')
  }

  const spBadge = (
    <div style={S.spPill}>
      <div style={S.spPillIc}>SP</div>
      <div>
        <div style={S.spPillLab}>SamPoints</div>
        <div style={S.spPillVal}>{samPoints.toLocaleString()}</div>
      </div>
    </div>
  )

  const ProductCard = ({ p, showStatus }) => {
    const count = showStatus ? getLeagueCount(p) : 0
    const on = hovered === p.id

    // Full pre-designed card art (title, features and CTA baked in): render the
    // image as the whole clickable box, no HTML overlay.
    if (p.fullArt) {
      return (
        <div
          style={{
            borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
            border: `1px solid ${on ? p.accentColor : 'rgba(255,255,255,0.08)'}`,
            boxShadow: on ? `0 12px 34px -14px ${p.accentColor}66` : 'none',
            transform: on ? 'translateY(-2px)' : 'none',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
          }}
          onMouseEnter={() => setHovered(p.id)} onMouseLeave={() => setHovered(null)}
          onClick={() => handleProductClick(p)}
        >
          <Art name={p.fullArt} emoji={p.icon} style={{ display: 'block', width: '100%', height: 'auto' }} fallbackBg={`radial-gradient(120% 120% at 80% 20%, ${p.accentColor}33, transparent 60%)`} />
        </div>
      )
    }

    return (
      <div
        style={{ ...S.card, borderColor: on ? p.accentColor : S.card.borderColor, boxShadow: on ? `0 12px 34px -14px ${p.accentColor}66` : 'none', transform: on ? 'translateY(-2px)' : 'none' }}
        onMouseEnter={() => setHovered(p.id)} onMouseLeave={() => setHovered(null)}
        onClick={() => handleProductClick(p)}
      >
        <Art name={p.cardArt} emoji="" style={S.cardArt} fallbackBg={`radial-gradient(120% 120% at 80% 20%, ${p.accentColor}33, transparent 60%)`} />
        {/* Dominant accent-colour gradient with the photo left faint in the
            background — a coloured card with just a hint of the image. */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `linear-gradient(120deg, ${p.accentColor}C0 0%, ${p.accentColor}70 46%, ${p.accentColor}2E 100%), linear-gradient(180deg, rgba(3,3,6,0.72) 0%, rgba(3,3,6,0.96) 100%)` }} />
        <div style={S.cardBody}>
          <div style={S.cardHead}>
            <Art name={p.art} emoji={p.icon} style={S.cardIcon} fallbackBg={`${p.accentColor}22`} />
            <div style={{ flex: 1 }}>
              <div style={S.cardNameRow}>
                <span style={S.cardName}>{p.name}</span>
                <span style={{ ...S.badge, color: p.accentColor, borderColor: `${p.accentColor}66`, background: `${p.accentColor}18` }}>{p.badge}</span>
              </div>
              <div style={S.cardSub}>{p.subtitle}</div>
            </div>
          </div>
          <p style={S.cardDesc}>{p.description}</p>
          <div style={S.chips}>
            {p.features.map((f, i) => (
              <span key={i} style={{ ...S.chip, color: p.accentColor, borderColor: `${p.accentColor}33` }}>{f}</span>
            ))}
          </div>
          {showStatus && (
            <div style={S.statusRow}>
              <span style={{ ...S.statusDot, background: count > 0 ? '#22C55E' : '#5C6785' }} />
              <span style={S.statusText}>{count > 0 ? `${count} active league${count > 1 ? 's' : ''}` : 'No active leagues'}</span>
            </div>
          )}
          <button
            style={{ ...S.cardCta, background: `linear-gradient(135deg, ${p.accentColor}, ${p.accentColor}cc)`, color: '#0a0a0f' }}
            onClick={(e) => { e.stopPropagation(); handleProductClick(p) }}
          >
            {p.cta} →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div id="hub-top" style={S.shell}>
      {/* ── Left sidebar ── */}
      {!narrow && (
        <aside style={S.sidebar}>
          <div style={S.brand}>
            <img src="/samsports-logo.png" alt="SamSports" style={S.brandIc} />
            <span style={S.brandTxt}>samsports</span>
          </div>
          <nav style={S.nav}>
            {NAV.map((n, i) => (
              <button key={n.id} style={{ ...S.navItem, ...(i === 0 ? S.navItemOn : {}) }} onClick={() => onNav(n.id)}>
                <span style={S.navIc}>{n.icon}</span>{n.label}
              </button>
            ))}
          </nav>
          <div style={S.inviteCard}>
            <div style={S.inviteTitle}>🎁 Invite & Earn</div>
            <div style={S.inviteDesc}>Invite friends and earn SamPoints.</div>
            <button style={S.inviteBtn} onClick={() => onNav('rewards')}>Invite Now</button>
          </div>
          <div style={S.profileRow} onClick={() => navigate('/edit-profile')}>
            <div style={S.profileAv}>SP</div>
            <div>
              <div style={S.profileName}>{user?.userName || user?.name || 'Sam Player'}</div>
              <div style={S.profileSub}>View Profile</div>
            </div>
          </div>
        </aside>
      )}

      {/* ── Main column ── */}
      <div style={S.mainWrap}>
        {/* Top bar */}
        <header style={S.topbar}>
          {narrow && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/samsports-logo.png" alt="SamSports" style={{ width: 26, height: 26, objectFit: 'contain' }} />
              <span style={S.brandTxtSm}>samsports</span>
            </span>
          )}
          {!narrow && (
            <nav style={S.topNav}>
              {['Dashboard', 'Rivals', 'Leagues', 'Livescore', 'Fantasy'].map((t, i) => (
                <button key={t} style={{ ...S.topNavItem, ...(i === 0 ? S.topNavOn : {}) }}
                  onClick={() => onNav(['home', 'rivals', 'leagues', 'livescore', 'fantasy'][i])}>{t}</button>
              ))}
            </nav>
          )}
          <div style={S.topRight}>
            <MessagesBell />
            {spBadge}
          </div>
        </header>

        <div style={{ ...S.body, flexDirection: narrow ? 'column' : 'row' }}>
          {/* Center content */}
          <main style={S.main}>
            <div style={{ padding: narrow ? '0 4px' : 0 }}>
              <EnablePushPrompt context="alerts" />
            </div>

            {/* Hero */}
            <section style={S.hero}>
              <Art name="hero-bg.png" emoji="" style={S.heroBg} fallbackBg="transparent" />
              <div style={S.heroScrim} />
              <div style={S.heroLeft}>
                <div style={S.heroTitleRow}>
                  <Art name="crown" emoji="👑" style={S.heroCrown} fallbackBg="transparent" />
                  <div>
                    <h1 style={S.heroTitle}>Your <span style={{ color: '#D4AF37' }}>Empire</span></h1>
                    <div style={S.heroSub}>Fantasy Sports Reimagined</div>
                  </div>
                </div>
                <div style={S.statRow}>
                  {[
                    ['SamPoints', samPoints.toLocaleString(), '#D4AF37'],
                    ['NFL Leagues', String(leagueCounts.football), '#fff'],
                    ['Soccer Leagues', String(leagueCounts.soccer), '#fff'],
                    ['Total Franchises', String(totalLeagues), '#D4AF37'],
                  ].map(([l, v, c]) => (
                    <div key={l} style={S.stat}>
                      <div style={S.statLab}>{l}</div>
                      <div style={{ ...S.statVal, color: c }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <Art name="trophy.png" emoji="🏆" style={S.heroArt} fallbackBg="radial-gradient(circle at 50% 40%, rgba(212,175,55,.25), transparent 65%)" />
              <div style={S.empireLink} onClick={() => goToFullEmpire('/war-room')}>
                <div style={S.empireLinkTitle}>🏛️ Full Empire Dashboard</div>
                <div style={S.empireLinkDesc}>Manage franchises, trade on the Marketplace, vote in Governance.</div>
                <span style={S.empireArrow}>→</span>
              </div>
            </section>

            {/* Rivals */}
            <section id="rivals" style={S.section}>
              <div style={S.secHead}>
                <div style={S.secTitleWrap}><span style={S.secIc}>⚔️</span><span style={S.secTitle}>League of Rivals</span><span style={S.secDesc}>Competitive H2H — climb divisions, earn SamPoints</span></div>
                <button style={S.viewAll} onClick={() => onNav('rivals')}>View All Rivals</button>
              </div>
              <div style={{ ...S.grid, gridTemplateColumns: narrow ? '1fr' : '1fr 1fr' }}>
                {rivalsProducts.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            </section>

            {/* Fantasy */}
            <section id="leagues" style={S.section}>
              <div style={S.secHead}>
                <div style={S.secTitleWrap}><span style={S.secIc}>🏆</span><span style={S.secTitle}>Fantasy Leagues</span><span style={S.secDesc}>Classic fantasy — draft your squad, manage your empire</span></div>
                <button style={S.viewAll} onClick={() => onNav('leagues')}>View All Leagues</button>
              </div>
              <div style={{ ...S.grid, gridTemplateColumns: narrow ? '1fr' : '1fr 1fr' }}>
                {fantasyProducts.map(p => <ProductCard key={p.id} p={p} showStatus />)}
              </div>
            </section>

          </main>

          {/* Right rail */}
          <aside style={{ ...S.rail, width: narrow ? '100%' : 320 }}>
            <div style={S.balanceCard} onClick={() => goToFullEmpire('/war-room')} role="button">
              <Art name="gm-mode-card.png" emoji="🪙" style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 14, cursor: 'pointer' }} fallbackBg="linear-gradient(135deg,#1a1330,#12101d)" />
            </div>

            <div style={S.railCard}>
              <div style={S.railHead}><span style={S.railTitle}>Recent Activity</span><button style={S.railLink} onClick={() => onNav('home')}>View All</button></div>
              {activity.length === 0 ? (
                <div style={S.emptyFeed}>No recent activity yet. Play a match, make a trade, or set a lineup to see it here.</div>
              ) : (
                activity.map((a, i) => (
                  <div key={a._id || i} style={S.feedRow}>
                    {(() => { const c = activityClockColor(a); return (
                      <span style={{ ...S.feedIc, background: `${c}1a`, border: `1px solid ${c}44` }}>
                        <ClockIcon color={c} />
                      </span>
                    ) })()}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={S.feedTitle}>{a.title || 'Activity'}</div>
                      <div style={S.feedSub}>{a.message || ''}</div>
                    </div>
                    <span style={S.feedTime}>{timeAgo(a.createdAt)}</span>
                  </div>
                ))
              )}
            </div>

            <div style={S.mobileCard}>
              <div style={S.mobileInfo}>
                <div style={S.mobileTitle}>Get the Mobile App</div>
                <div style={S.mobileDesc}>Manage your team, compete and earn on the go.</div>
                <span style={S.mobileSoon}>Coming Soon</span>
              </div>
              <div style={S.phone}>
                <span style={S.phoneNotch} />
                <div style={S.phoneScreen}>
                  <img src="/samsports-logo.png" alt="" style={S.phoneLogo} />
                  <div style={S.phoneBrand}>samsports</div>
                  <div style={S.phoneBarGold} />
                  <div style={S.phoneBar} />
                  <div style={S.phoneBar} />
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Full-width feature band */}
        <div style={S.featureBand}>
          <section style={{ ...S.featureStrip, gridTemplateColumns: narrow ? '1fr 1fr' : 'repeat(4,1fr)' }}>
            {FEATURES.map(f => (
              <div key={f.title} style={S.feature}>
                {f.art
                  ? <Art name={f.art} emoji={f.icon} style={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0 }} fallbackBg="transparent" />
                  : <span style={{ ...S.featureIc, color: f.color }}>{f.icon}</span>}
                <div>
                  <div style={S.featureTitle}>{f.title}</div>
                  <div style={S.featureDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════ STYLES — Gold / Deep-Purple ═══════════════════════════ */
const GOLD = '#D4AF37'
const PANEL = '#12101d'
const PANEL2 = '#171426'
const BD = 'rgba(255,255,255,0.07)'
const MUT = '#8a8399'

const S = {
  shell: {
    display: 'flex', minHeight: '100vh', background: '#0a0a12', color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  /* Sidebar */
  sidebar: {
    width: 232, flexShrink: 0, borderRight: `1px solid ${BD}`, padding: '18px 14px',
    display: 'flex', flexDirection: 'column', gap: 8, background: '#0c0b15',
    position: 'sticky', top: 0, height: '100vh',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 14px' },
  brandIc: { width: 32, height: 32, objectFit: 'contain' },
  brandTxt: { fontSize: 17, fontWeight: 800, letterSpacing: '-0.3px', fontFamily: "var(--font-heading, 'Rajdhani', sans-serif)" },
  brandTxtSm: { fontSize: 15, fontWeight: 800, fontFamily: "var(--font-heading, 'Rajdhani', sans-serif)" },
  nav: { display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10,
    background: 'transparent', border: 'none', color: '#b3adc4', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all .15s',
  },
  navItemOn: { background: 'rgba(124,58,237,0.15)', color: '#fff', boxShadow: 'inset 3px 0 0 #7C3AED' },
  navIc: { fontSize: 16, width: 18, textAlign: 'center' },
  inviteCard: {
    marginTop: 'auto', background: 'linear-gradient(135deg,#1c1533,#140f24)',
    border: `1px solid rgba(124,58,237,0.3)`, borderRadius: 14, padding: 14,
  },
  inviteTitle: { fontSize: 13, fontWeight: 800, color: '#c4b5fd' },
  inviteDesc: { fontSize: 11.5, color: MUT, margin: '4px 0 10px', lineHeight: 1.4 },
  inviteBtn: { width: '100%', padding: '8px 0', border: 'none', borderRadius: 8, background: '#7C3AED', color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' },
  profileRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderRadius: 10, cursor: 'pointer' },
  profileAv: { width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#E8C760,#B8912F)', color: '#1a1400', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 },
  profileName: { fontSize: 13, fontWeight: 700 },
  profileSub: { fontSize: 11, color: MUT },

  /* Main */
  mainWrap: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' },
  topbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
    padding: '14px 22px', borderBottom: `1px solid ${BD}`, position: 'sticky', top: 0,
    background: 'rgba(10,10,18,0.85)', backdropFilter: 'blur(10px)', zIndex: 20,
  },
  topNav: { display: 'flex', gap: 6 },
  topNavItem: { background: 'transparent', border: 'none', color: MUT, fontSize: 14, fontWeight: 700, padding: '8px 12px', cursor: 'pointer', borderRadius: 8 },
  topNavOn: { color: '#fff', boxShadow: 'inset 0 -2px 0 #7C3AED' },
  topRight: { display: 'flex', alignItems: 'center', gap: 14 },
  spPill: { display: 'flex', alignItems: 'center', gap: 10, background: PANEL, border: `1px solid rgba(212,175,55,0.25)`, borderRadius: 12, padding: '7px 14px' },
  spPillIc: { width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#E8C760,#B8912F)', color: '#1a1400', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11 },
  spPillLab: { fontSize: 10, color: MUT, textTransform: 'uppercase', letterSpacing: '0.5px' },
  spPillVal: { fontSize: 15, fontWeight: 800, color: GOLD },

  body: { display: 'flex', gap: 20, padding: 22, alignItems: 'flex-start' },
  main: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 22 },

  /* Hero */
  hero: {
    position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(135deg,#1a1330 0%,#12101d 55%,#0d0b16 100%)',
    border: `1px solid ${BD}`, borderRadius: 18, padding: 24, display: 'grid',
    gridTemplateColumns: '1fr auto', gridTemplateRows: 'auto auto', gap: 16, alignItems: 'center',
  },
  heroBg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, zIndex: 0, pointerEvents: 'none' },
  heroScrim: { position: 'absolute', inset: 0, zIndex: 0, background: 'linear-gradient(90deg, rgba(13,11,22,0.94) 0%, rgba(13,11,22,0.7) 45%, rgba(13,11,22,0.4) 100%)', pointerEvents: 'none' },
  heroLeft: { position: 'relative', zIndex: 1 },
  heroTitleRow: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 },
  heroCrown: { width: 46, height: 46, objectFit: 'contain' },
  heroTitle: { fontSize: 30, fontWeight: 900, margin: 0, letterSpacing: '-0.6px' },
  heroSub: { fontSize: 13, color: MUT, marginTop: 2 },
  statRow: { display: 'flex', gap: 26, flexWrap: 'wrap' },
  stat: {},
  statLab: { fontSize: 10.5, color: MUT, textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 },
  statVal: { fontSize: 22, fontWeight: 900, marginTop: 3 },
  heroArt: { width: 190, height: 150, objectFit: 'contain', gridRow: '1 / span 2', gridColumn: 2, position: 'relative', zIndex: 1 },
  empireLink: {
    gridColumn: '1 / -1', position: 'relative', zIndex: 1, cursor: 'pointer',
    background: 'linear-gradient(135deg,rgba(212,175,55,0.08),rgba(124,58,237,0.06))',
    border: `1px solid rgba(212,175,55,0.2)`, borderRadius: 12, padding: '14px 18px',
  },
  empireLinkTitle: { fontSize: 14, fontWeight: 800, color: GOLD },
  empireLinkDesc: { fontSize: 12, color: MUT, marginTop: 3 },
  empireArrow: { position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', color: GOLD, fontSize: 20 },

  /* Sections */
  section: {},
  secHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' },
  secTitleWrap: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  secIc: { fontSize: 17 },
  secTitle: { fontSize: 19, fontWeight: 800 },
  secDesc: { fontSize: 12.5, color: MUT },
  viewAll: { background: PANEL, border: `1px solid ${BD}`, color: '#c7c2d6', fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 8, cursor: 'pointer' },
  grid: { display: 'grid', gap: 16, alignItems: 'stretch' },

  /* Product card — hugs its content (no forced stretch) */
  card: {
    position: 'relative', overflow: 'hidden', background: PANEL, border: `1px solid ${BD}`,
    borderRadius: 16, cursor: 'pointer', transition: 'all .22s',
  },
  cardArt: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, pointerEvents: 'none' },
  cardScrim: { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,10,18,0.92) 0%, rgba(10,10,18,0.62) 55%, rgba(10,10,18,0.35) 100%)', pointerEvents: 'none' },
  cardBody: { position: 'relative', padding: 18, display: 'flex', flexDirection: 'column', height: '100%' },
  cardHead: { display: 'flex', alignItems: 'center', gap: 13, marginBottom: 12 },
  cardIcon: { width: 46, height: 46, borderRadius: 12, objectFit: 'contain', background: 'rgba(0,0,0,0.25)' },
  cardNameRow: { display: 'flex', alignItems: 'center', gap: 9 },
  cardName: { fontSize: 16, fontWeight: 800, letterSpacing: '-0.2px' },
  cardSub: { fontSize: 12, color: MUT, marginTop: 2 },
  badge: { fontSize: 9.5, fontWeight: 800, letterSpacing: '0.6px', padding: '3px 8px', borderRadius: 6, border: '1px solid' },
  cardDesc: { fontSize: 13, color: '#c3bdd0', lineHeight: 1.5, margin: '0 0 12px' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 7, border: '1px solid', background: 'rgba(255,255,255,0.03)' },
  statusRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
  statusDot: { width: 7, height: 7, borderRadius: '50%' },
  statusText: { fontSize: 12, color: MUT },
  cardCta: { width: '100%', padding: '12px 0', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer', letterSpacing: '0.3px', marginTop: 'auto' },

  /* Feature strip */
  featureBand: { padding: '0 22px 22px' },
  featureStrip: { display: 'grid', gap: 16, background: PANEL, border: `1px solid ${BD}`, borderRadius: 16, padding: '20px 26px' },
  feature: { display: 'flex', alignItems: 'center', gap: 12 },
  featureIc: { fontSize: 24 },
  featureTitle: { fontSize: 15, fontWeight: 800 },
  featureDesc: { fontSize: 12.5, color: MUT, marginTop: 2, lineHeight: 1.35 },

  /* Right rail */
  rail: { flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 },
  balanceCard: { background: 'transparent', borderRadius: 16, padding: 0, cursor: 'pointer', overflow: 'hidden' },
  balanceTop: { display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 },
  balanceIc: { width: 44, height: 44, borderRadius: 11, objectFit: 'contain' },
  balanceLab: { fontSize: 12, color: MUT },
  balanceVal: { fontSize: 24, fontWeight: 900, color: GOLD, lineHeight: 1.1 },
  balanceSub: { fontSize: 10.5, color: MUT, marginTop: 2 },
  balanceBtn: { width: '100%', padding: '11px 0', border: 'none', borderRadius: 10, background: 'linear-gradient(135deg,#E8C760,#B8912F)', color: '#1a1400', fontWeight: 800, fontSize: 13, cursor: 'pointer' },

  railCard: { background: PANEL, border: `1px solid ${BD}`, borderRadius: 16, padding: 16 },
  railHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  railTitle: { fontSize: 15, fontWeight: 800 },
  railLink: { background: 'transparent', border: 'none', color: '#a78bfa', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  emptyFeed: { fontSize: 12, color: MUT, lineHeight: 1.5, padding: '4px 0 6px' },
  feedRow: { display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0', borderTop: `1px solid ${BD}` },
  feedIc: { width: 32, height: 32, borderRadius: 9, background: PANEL2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 },
  feedTitle: { fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  feedSub: { fontSize: 11.5, color: MUT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  feedTime: { fontSize: 11, color: '#6b6580', flexShrink: 0 },

  mobileCard: { display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(135deg,#1a1338,#100d1f)', border: `1px solid rgba(124,58,237,0.3)`, borderRadius: 16, padding: 18, overflow: 'hidden' },
  mobileInfo: { flex: 1, minWidth: 0 },
  mobileTitle: { fontSize: 16, fontWeight: 800 },
  mobileDesc: { fontSize: 12, color: MUT, margin: '6px 0 12px', lineHeight: 1.45 },
  mobileSoon: { display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '0.5px', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.5)', borderRadius: 999, padding: '5px 12px' },
  phone: { position: 'relative', width: 92, height: 178, flexShrink: 0, borderRadius: 22, background: '#000', border: '4px solid #241c3d', boxShadow: '0 14px 32px -12px rgba(124,58,237,0.55)', padding: 6 },
  phoneNotch: { position: 'absolute', top: 9, left: '50%', transform: 'translateX(-50%)', width: 26, height: 4, borderRadius: 3, background: '#241c3d', zIndex: 2 },
  phoneScreen: { width: '100%', height: '100%', borderRadius: 15, background: 'linear-gradient(160deg,#1a1440,#0c0a18)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20, gap: 8 },
  phoneLogo: { width: 32, height: 32, objectFit: 'contain' },
  phoneBrand: { fontSize: 10.5, fontWeight: 800, letterSpacing: '-0.2px', marginBottom: 2, fontFamily: "var(--font-heading, 'Rajdhani', sans-serif)" },
  phoneBarGold: { width: '70%', height: 13, borderRadius: 4, background: 'linear-gradient(90deg,#E8C760,#B8912F)' },
  phoneBar: { width: '70%', height: 9, borderRadius: 4, background: 'rgba(255,255,255,0.08)' },
}

export default SportHub
