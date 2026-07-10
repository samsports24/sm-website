import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { getUserLeagues, selectLeague } from '../../redux/actions/leagueActions'
import { attachToken, serverUrls } from '../../config/constants'

/* ═══════════════════════════════════════════════════════════
   YOUR EMPIRE — NFL Front Office (Hybrid Design)
   Gold branding + Bloomberg ticker + product hub
   Links to Soccer's full War Room for Exchange/Governance
   ═══════════════════════════════════════════════════════════ */

const PRODUCTS = [
  {
    id: 'rivals-soccer', name: 'SAM RIVALS', subtitle: 'Soccer',
    description: '10 divisions. Monthly seasons. Climb to World Masters.',
    badge: 'RIVALS', badgeColor: '#10B981', accentColor: '#10B981',
    icon: '⚽', features: ['H2H Matchups', 'Promotion & Relegation', 'SamPoints Rewards'],
    cta: 'Enter Rivals', active: true, group: 'rivals',
    frontEndUrl: process.env.REACT_APP_SOCCER_URL || 'https://football.samsports.io',
    rivalsPath: '/rivals',
  },
  {
    id: 'rivals-nfl', name: 'SAM RIVALS', subtitle: 'American Football',
    description: '4 divisions. 53-man rosters. Dominate the Gridiron.',
    badge: 'RIVALS', badgeColor: '#7C3AED', accentColor: '#7C3AED',
    icon: '🏈', features: ['Thu→Mon Scoring', '3-4 Defense Flex', 'Promotion & Relegation', 'SamPoints Rewards'],
    cta: 'Enter Rivals', active: true, group: 'rivals',
    frontEndUrl: null, rivalsPath: '/nfl-rivals',
  },
  {
    id: 'dynasty32', name: 'Dynasty 32', subtitle: 'A.Football Fantasy',
    description: 'Full dynasty leagues. Draft, trade, and build your empire.',
    badge: 'FANTASY', badgeColor: '#EF4444', accentColor: '#EF4444',
    icon: '🏈', features: ['Dynasty Drafts', 'Trade Market', 'Commissioner Tools'],
    cta: 'Play Football', active: true, group: 'fantasy',
    sportField: 'football', frontEndUrl: null, dashboardPath: '/dashboard',
  },
  {
    id: 'eleven-fc', name: 'Eleven F.C', subtitle: 'Soccer Fantasy',
    description: 'Classic fantasy soccer. Draft your dream squad.',
    badge: 'FANTASY', badgeColor: '#D4AF37', accentColor: '#D4AF37',
    icon: '⚽', features: ['Live Scoring', 'Auction Drafts', 'Loan & Buyout Market'],
    cta: 'Play Soccer', active: true, group: 'fantasy',
    sportField: 'soccer',
    frontEndUrl: process.env.REACT_APP_SOCCER_URL || 'https://football.samsports.io',
    dashboardPath: '/dashboard',
  },
  {
    id: 'hockey', name: 'Hockey Fantasy', subtitle: 'NHL Fantasy',
    description: 'Ice-cold competition. Coming to SAMSports.',
    badge: 'COMING SOON', badgeColor: '#64748B', accentColor: '#38BDF8',
    icon: '🏒', features: [], cta: null, active: false, group: 'coming',
  },
  {
    id: 'basketball', name: 'Basketball Fantasy', subtitle: 'NBA Fantasy',
    description: 'Hoops action. Coming to SAMSports.',
    badge: 'COMING SOON', badgeColor: '#64748B', accentColor: '#F97316',
    icon: '🏀', features: [], cta: null, active: false, group: 'coming',
  },
]

const SportHub = () => {
  const navigate = useNavigate()
  const user = useSelector(state => state?.user?.userDetails)
  const leagues = useSelector(state => state?.league)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [leagueCounts, setLeagueCounts] = useState({ football: 0, soccer: 0 })

  const samPoints = user?.earnedSamPoints || 0
  const rivalsProducts = PRODUCTS.filter(p => p.group === 'rivals')
  const fantasyProducts = PRODUCTS.filter(p => p.group === 'fantasy')
  const comingSoon = PRODUCTS.filter(p => p.group === 'coming')

  useEffect(() => {
    attachToken()
    getUserLeagues()
    fetchLeagueCounts()
  }, [])

  const fetchLeagueCounts = async () => {
    try {
      const footballCount = (leagues?.userLeagues || []).length + (leagues?.futureLeagues || []).length
      setLeagueCounts(prev => ({ ...prev, football: footballCount }))
    } catch (e) {}
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const soccerServer = serverUrls.find(s => s.key === 'eleven_fc')
      const soccerUrl = soccerServer?.url || process.env.REACT_APP_SOCCER_API_URL || 'https://soccerbackend.samsports.io'
      const res = await axios.get(`${soccerUrl}/api/v1/leagues/my-leagues`, {
        headers: { Authorization: `Bearer ${token}` }, timeout: 5000,
      })
      const data = res?.data?.data
      if (data) {
        const list = Array.isArray(data) ? data : [...(data.userLeagues || []), ...(data.futureLeagues || [])]
        setLeagueCounts(prev => ({ ...prev, soccer: list.length }))
      }
    } catch (e) {}
  }

  const handleProductClick = useCallback((product) => {
    if (product.group === 'rivals') {
      if (product.frontEndUrl) {
        const token = localStorage.getItem('token')
        window.location.href = `${product.frontEndUrl}${product.rivalsPath}?token=${token}`
      } else if (product.rivalsPath) {
        navigate(product.rivalsPath)
      }
    } else if (product.group === 'fantasy') {
      if (product.frontEndUrl) {
        const token = localStorage.getItem('token')
        window.location.href = `${product.frontEndUrl}?token=${token}`
      } else if (product.dashboardPath) {
        navigate(product.dashboardPath)
      }
    }
  }, [navigate])

  const getLeagueCount = (product) => {
    if (product.sportField === 'football') return leagueCounts.football
    if (product.sportField === 'soccer') return leagueCounts.soccer
    return 0
  }

  const goToFullEmpire = () => {
    const token = localStorage.getItem('token')
    const soccerUrl = process.env.REACT_APP_SOCCER_URL || 'https://football.samsports.io'
    window.location.href = `${soccerUrl}/war-room?token=${token}`
  }

  const totalLeagues = leagueCounts.football + leagueCounts.soccer

  return (
    <div style={S.page}>

      {/* ══════ TICKER STRIP ══════ */}
      <div style={S.ticker}>
        {[
          { label: 'SAMPOINTS', val: samPoints.toLocaleString(), cls: 'gold' },
          { label: 'NFL LEAGUES', val: String(leagueCounts.football), cls: 'white' },
          { label: 'SOCCER LEAGUES', val: String(leagueCounts.soccer), cls: 'white' },
          { label: 'TOTAL FRANCHISES', val: String(totalLeagues), cls: 'gold' },
        ].map((t, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={S.tickerDivider} />}
            <div style={S.tickerItem}>
              <span style={S.tickerLabel}>{t.label}</span>
              <span style={t.cls === 'gold' ? S.tickerGold : S.tickerWhite}>{t.val}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ══════ EMPIRE HEADER ══════ */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <span style={S.crown}>👑</span>
          <div>
            <h1 style={S.title}>Your <span style={S.titleGold}>Empire</span></h1>
            <p style={S.subtitle}>Fantasy Sports Reimagined</p>
          </div>
        </div>
        <div style={S.headerRight}>
          <div style={S.spBadge}>
            <div style={S.spIcon}>SP</div>
            <div>
              <div style={S.spLabel}>SamPoints</div>
              <div style={S.spValue}>{samPoints.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════ FULL EMPIRE LINK ══════ */}
      <div style={S.empireLink}>
        <div style={S.empireLinkInner} onClick={goToFullEmpire}>
          <div>
            <div style={S.empireLinkTitle}>🏛️ Full Empire Dashboard</div>
            <div style={S.empireLinkDesc}>Manage all franchises, trade on the Marketplace, vote in Governance</div>
          </div>
          <span style={S.empireLinkArrow}></span>
        </div>
      </div>

      {/* ── SAM RIVALS ── */}
      <div style={S.section}>
        <div style={S.sectionHeader}>
          <div style={S.sectionBadge}>
            <span style={S.sectionIcon}>⚔️</span>
            <span style={S.sectionTitle}>SAM RIVALS</span>
          </div>
          <span style={S.sectionDesc}>Competitive H2H — climb divisions, earn SamPoints</span>
        </div>
        <div style={S.grid}>
          {rivalsProducts.map(product => (
            <div key={product.id}
              style={{
                ...S.card,
                borderColor: hoveredCard === product.id ? '#D4AF37' : '#2a2200',
                transform: hoveredCard === product.id ? 'translateY(-2px)' : 'none',
                boxShadow: hoveredCard === product.id ? '0 8px 30px rgba(212,175,55,0.1)' : 'none',
              }}
              onMouseEnter={() => setHoveredCard(product.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleProductClick(product)}>
              <div style={S.cardHeader}>
                <div style={S.cardIconWrap}><span style={S.cardIcon}>{product.icon}</span></div>
                <div style={{ flex: 1 }}>
                  <div style={S.cardNameRow}>
                    <span style={S.cardName}>{product.name}</span>
                    <span style={{ ...S.badge, background: `${product.accentColor}22`, color: product.accentColor, borderColor: `${product.accentColor}44` }}>{product.badge}</span>
                  </div>
                  <span style={S.cardSubtitle}>{product.subtitle}</span>
                </div>
              </div>
              <p style={S.cardDesc}>{product.description}</p>
              <div style={S.featureList}>
                {product.features.map((f, i) => (
                  <span key={i} style={{ ...S.featureTag, borderColor: `${product.accentColor}33`, color: product.accentColor }}>{f}</span>
                ))}
              </div>
              <button style={S.ctaButton} onClick={(e) => { e.stopPropagation(); handleProductClick(product) }}>
                {product.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Fantasy Leagues ── */}
      <div style={S.section}>
        <div style={S.sectionHeader}>
          <div style={S.sectionBadge}>
            <span style={S.sectionIcon}>🏆</span>
            <span style={S.sectionTitle}>Fantasy Leagues</span>
          </div>
          <span style={S.sectionDesc}>Classic fantasy — draft your squad, manage your empire</span>
        </div>
        <div style={S.grid}>
          {fantasyProducts.map(product => {
            const count = getLeagueCount(product)
            return (
              <div key={product.id}
                style={{
                  ...S.card,
                  borderColor: hoveredCard === product.id ? '#D4AF37' : '#2a2200',
                  transform: hoveredCard === product.id ? 'translateY(-2px)' : 'none',
                  boxShadow: hoveredCard === product.id ? '0 8px 30px rgba(212,175,55,0.1)' : 'none',
                }}
                onMouseEnter={() => setHoveredCard(product.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleProductClick(product)}>
                <div style={S.cardHeader}>
                  <div style={S.cardIconWrap}><span style={S.cardIcon}>{product.icon}</span></div>
                  <div style={{ flex: 1 }}>
                    <div style={S.cardNameRow}>
                      <span style={S.cardName}>{product.name}</span>
                      <span style={{ ...S.badge, background: `${product.accentColor}22`, color: product.accentColor, borderColor: `${product.accentColor}44` }}>{product.badge}</span>
                    </div>
                    <span style={S.cardSubtitle}>{product.subtitle}</span>
                  </div>
                </div>
                <p style={S.cardDesc}>{product.description}</p>
                <div style={S.featureList}>
                  {product.features.map((f, i) => (
                    <span key={i} style={{ ...S.featureTag, borderColor: `${product.accentColor}33`, color: product.accentColor }}>{f}</span>
                  ))}
                </div>
                <div style={S.leagueStatus}>
                  <span style={{ ...S.leagueStatusDot, background: count > 0 ? '#00ff87' : '#64748B' }} />
                  <span style={S.leagueStatusText}>{count > 0 ? `${count} active league${count > 1 ? 's' : ''}` : 'No active leagues'}</span>
                </div>
                <button style={S.ctaButton} onClick={(e) => { e.stopPropagation(); handleProductClick(product) }}>
                  {product.cta}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Coming Soon ── */}
      <div style={S.section}>
        <div style={S.sectionHeader}>
          <div style={S.sectionBadge}>
            <span style={S.sectionIcon}>🚀</span>
            <span style={S.sectionTitle}>Coming Soon</span>
          </div>
        </div>
        <div style={S.comingSoonGrid}>
          {comingSoon.map(product => (
            <div key={product.id} style={S.comingSoonCard}>
              <span style={{ fontSize: 28 }}>{product.icon}</span>
              <div>
                <div style={S.comingSoonName}>{product.name}</div>
                <div style={S.comingSoonDesc}>{product.description}</div>
              </div>
              <span style={{ ...S.comingSoonBadge, color: product.accentColor, borderColor: `${product.accentColor}33` }}>COMING SOON</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Empire CTA ── */}
      <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>
        <button style={S.empireBottomBtn} onClick={goToFullEmpire}>
          🏛️ Open Full Empire Dashboard
        </button>
        <div style={{ fontSize: 12, color: '#8a7a44', marginTop: 10 }}>
          Marketplace · Trophies · Governance · Team Sales
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STYLES — Empire Gold Theme
   ═══════════════════════════════════════════════════════════ */
const S = {
  page: {
    minHeight: '100vh', background: '#050505', color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: 1100, margin: '0 auto',
  },

  // Ticker
  ticker: {
    display: 'flex', gap: 0, padding: '10px 32px',
    background: 'linear-gradient(90deg, #060600, #0a0a00, #060600)',
    borderBottom: '1px solid #2a2200', overflowX: 'auto',
  },
  tickerItem: { display: 'flex', alignItems: 'center', gap: 6, padding: '0 20px', whiteSpace: 'nowrap' },
  tickerDivider: { width: 1, background: '#2a2200', alignSelf: 'stretch', margin: '-2px 0' },
  tickerLabel: { fontSize: 10, fontWeight: 700, color: '#8a7a44', textTransform: 'uppercase', letterSpacing: 1 },
  tickerGold: { fontSize: 13, fontWeight: 700, color: '#D4AF37' },
  tickerWhite: { fontSize: 13, fontWeight: 700, color: '#fff' },

  // Header
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '24px 32px 16px',
    background: 'linear-gradient(135deg, #1a1400 0%, #0a0a00 50%, #0d0800 100%)',
    borderBottom: '1px solid #2a2200',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  crown: { fontSize: 40 },
  title: { fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: '-0.5px', lineHeight: 1.1 },
  titleGold: { color: '#D4AF37' },
  subtitle: { fontSize: 13, color: '#8a7a44', margin: '2px 0 0' },
  spBadge: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: '#1a1400', border: '1px solid #2a2200',
    borderRadius: 12, padding: '10px 18px',
  },
  spIcon: {
    width: 36, height: 36, borderRadius: 8,
    background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: 12, color: '#0a0a0a', letterSpacing: '0.5px',
  },
  spLabel: { fontSize: 11, color: '#8a7a44', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 },
  spValue: { fontSize: 18, fontWeight: 700, color: '#D4AF37' },

  // Empire link
  empireLink: { padding: '16px 32px 0' },
  empireLinkInner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderRadius: 12,
    background: 'linear-gradient(135deg, #1a1400 0%, #0d0d00 100%)',
    border: '1px solid #2a2200', cursor: 'pointer',
    transition: 'all 0.2s',
  },
  empireLinkTitle: { fontSize: 15, fontWeight: 800, color: '#D4AF37' },
  empireLinkDesc: { fontSize: 12, color: '#8a7a44', marginTop: 2 },
  empireLinkArrow: { fontSize: 20, color: '#D4AF37', fontWeight: 700 },

  // Sections
  section: { padding: '0 32px', marginTop: 32 },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, flexWrap: 'wrap' },
  sectionBadge: { display: 'flex', alignItems: 'center', gap: 8 },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' },
  sectionDesc: { fontSize: 13, color: '#8a7a44', fontWeight: 400 },

  // Grid
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 },
  card: {
    background: '#0d0d00', border: '1px solid #2a2200',
    borderRadius: 14, padding: '22px 24px',
    transition: 'all 0.25s', cursor: 'pointer',
    display: 'flex', flexDirection: 'column',
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 },
  cardIconWrap: {
    width: 48, height: 48, borderRadius: 12,
    background: '#1a1400', border: '1px solid #2a2200',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  cardIcon: { fontSize: 24 },
  cardNameRow: { display: 'flex', alignItems: 'center', gap: 10 },
  cardName: { fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' },
  badge: {
    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
    border: '1px solid', letterSpacing: '0.8px', textTransform: 'uppercase',
  },
  cardSubtitle: { fontSize: 13, color: '#8a7a44', fontWeight: 400 },
  cardDesc: { fontSize: 14, color: '#aaa', lineHeight: 1.5, margin: '0 0 14px 0' },
  featureList: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  featureTag: {
    fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
    border: '1px solid', letterSpacing: '0.3px',
  },
  leagueStatus: {
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
    padding: '8px 12px', background: '#1a1400', borderRadius: 8, border: '1px solid #2a2200',
  },
  leagueStatusDot: { width: 6, height: 6, borderRadius: '50%' },
  leagueStatusText: { fontSize: 13, color: '#8a7a44' },
  ctaButton: {
    width: '100%', padding: '12px 0', border: 'none', borderRadius: 10,
    background: '#D4AF37', color: '#0a0a0a', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', letterSpacing: '0.3px', transition: 'opacity 0.2s',
    marginTop: 'auto', boxShadow: '0 4px 15px rgba(212,175,55,0.2)',
  },

  // Coming soon
  comingSoonGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16,
  },
  comingSoonCard: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '18px 22px', background: '#0d0d00',
    border: '1px solid #2a2200', borderRadius: 12, opacity: 0.5,
  },
  comingSoonName: { fontSize: 15, fontWeight: 600 },
  comingSoonDesc: { fontSize: 12, color: '#8a7a44', marginTop: 2 },
  comingSoonBadge: {
    marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '4px 10px',
    borderRadius: 6, border: '1px solid', letterSpacing: '0.8px', whiteSpace: 'nowrap',
  },

  // Bottom CTA
  empireBottomBtn: {
    padding: '14px 40px', borderRadius: 12, fontSize: 15, fontWeight: 800,
    cursor: 'pointer', border: '2px solid #D4AF37', background: 'transparent',
    color: '#D4AF37', transition: 'all 0.3s', letterSpacing: '0.5px',
  },
}

export default SportHub
