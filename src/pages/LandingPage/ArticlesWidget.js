import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getArticlesGroupedByLeague, getPlatformSettings } from '../../soccer/services/articleService'

const LEAGUE_LABELS = {
  premier_league: "English Premier",
  la_liga: "Spanish First Division",
  serie_a: "Italian First Division",
  bundesliga: "German First Division",
  ligue_1: "French First Division",
  ekstraklasa: "Polish First Division",
  champions_league: "European Cup",
  mls: "MLS",
  liga_portugal: "Liga Portugal",
}

const LEAGUE_GRADIENTS = {
  premier_league: "linear-gradient(135deg, #3d195b 0%, #1a0d2e 50%, #2d1650 100%)",
  la_liga: "linear-gradient(135deg, #1a237e 0%, #0d1240 50%, #1a1a3a 100%)",
  serie_a: "linear-gradient(135deg, #024494 0%, #01224a 50%, #013366 100%)",
  bundesliga: "linear-gradient(135deg, #8b0a0a 0%, #1a0d0d 50%, #2a1a1a 100%)",
  ligue_1: "linear-gradient(135deg, #091c3e 0%, #0d1722 50%, #0f1f30 100%)",
  ekstraklasa: "linear-gradient(135deg, #8b1a0a 0%, #1a0d0d 50%, #2a1a1a 100%)",
  champions_league: "linear-gradient(135deg, #0d1b4a 0%, #0a1230 50%, #0d1940 100%)",
  mls: "linear-gradient(135deg, #1a2a1a 0%, #0d1f0d 50%, #1a2a1a 100%)",
  liga_portugal: "linear-gradient(135deg, #004d29 0%, #002d19 50%, #003d20 100%)",
}

const LEAGUE_BADGE_COLORS = {
  premier_league: "#3d195b",
  la_liga: "#e53935",
  serie_a: "#024494",
  bundesliga: "#d20515",
  ligue_1: "#091c3e",
  ekstraklasa: "#e63312",
  champions_league: "#1a73e8",
  mls: "#2d6a2e",
  liga_portugal: "#004d29",
}

const TYPE_BADGES = {
  pre_match: "PREVIEW",
  post_match: "REVIEW",
  custom: "SAM REPORT",
}

const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * Single league carousel — reuses the Key Stories CSS classes
 */
const LeagueCarousel = ({ league, articles, showLogos = true }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const trackRef = useRef(null)
  const navigate = useNavigate()

  const maxIndex = Math.max(0, articles.length - 3)

  useEffect(() => {
    if (trackRef.current) {
      const slideWidth = 100 / 3
      const offset = currentIndex * -slideWidth
      trackRef.current.style.transform = `translateX(calc(${offset}% - ${currentIndex * 14 / 3}px))`
    }
  }, [currentIndex])

  const goToPrevious = () => setCurrentIndex((p) => (p === 0 ? maxIndex : p - 1))
  const goToNext = () => setCurrentIndex((p) => (p >= maxIndex ? 0 : p + 1))

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX)
  const handleTouchEnd = (e) => {
    const end = e.changedTouches[0].clientX
    if (touchStart - end > 50) goToNext()
    if (touchStart - end < -50) goToPrevious()
  }

  const gradient = LEAGUE_GRADIENTS[league] || LEAGUE_GRADIENTS.premier_league
  const badgeColor = LEAGUE_BADGE_COLORS[league] || "#3d195b"
  const leagueName = LEAGUE_LABELS[league] || league

  return (
    <div className="ls-news-carousel-wrap" style={{ borderTop: 'none', paddingTop: 0 }}>
      {/* League header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 3,
            height: 16,
            borderRadius: 2,
            background: badgeColor,
          }} />
          <span style={{
            fontFamily: 'var(--ls-font-hd)',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: 'var(--ls-gray)',
          }}>
            {leagueName}
          </span>
          <span style={{
            fontSize: 9,
            color: 'var(--ls-gdim, #475569)',
            fontFamily: 'var(--ls-font-cd)',
          }}>
            {articles.length} {articles.length === 1 ? 'report' : 'reports'}
          </span>
        </div>
        <button
          onClick={() => navigate(`/articles?league=${league}`)}
          className="ls-sam-reports-viewall"
        >
          View All &rsaquo;
        </button>
      </div>

      {/* Carousel Track */}
      <div
        className="ls-news-carousel-track-wrap"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div ref={trackRef} className="ls-news-carousel-track">
          {articles.map((article) => {
            const badge = TYPE_BADGES[article.type] || "SAM REPORT"

            return (
              <a
                key={article._id}
                className="ls-nc-slide"
                href={`/articles?article=${article.slug}`}
                onClick={(e) => {
                  e.preventDefault()
                  navigate(`/articles?article=${article.slug}`)
                }}
                style={{ cursor: 'pointer', textDecoration: 'none' }}
              >
                {/* League gradient background */}
                <div className="ls-nc-slide-fallback" style={{ background: gradient }} />

                {/* Team watermark (logos or names) */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 20,
                  zIndex: 1,
                  opacity: showLogos ? 0.15 : 0.08,
                  pointerEvents: 'none',
                }}>
                  {showLogos && article.homeTeamLogo ? (
                    <img src={article.homeTeamLogo} alt="" style={{
                      width: 64, height: 64, objectFit: 'contain',
                      filter: 'brightness(2) grayscale(0.5)',
                    }} />
                  ) : (
                    <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>{article.homeTeam}</span>
                  )}
                  {showLogos && article.awayTeamLogo ? (
                    <img src={article.awayTeamLogo} alt="" style={{
                      width: 64, height: 64, objectFit: 'contain',
                      filter: 'brightness(2) grayscale(0.5)',
                    }} />
                  ) : (
                    <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>{article.awayTeam}</span>
                  )}
                </div>

                {/* Dark gradient overlay */}
                <div className="ls-nc-slide-overlay" />

                {/* Content */}
                <div className="ls-nc-slide-content">
                  <div className="ls-nc-slide-badge" style={{ background: badgeColor }}>
                    {badge}
                  </div>
                  <h3 className="ls-nc-slide-title">{article.title}</h3>
                  <p className="ls-nc-slide-meta">{formatDate(article.createdAt)}</p>
                </div>
              </a>
            )
          })}
        </div>
      </div>

      {/* Arrow buttons */}
      {articles.length > 3 && (
        <>
          <button className="ls-news-carousel-arrow left" onClick={goToPrevious} aria-label="Previous">&lsaquo;</button>
          <button className="ls-news-carousel-arrow right" onClick={goToNext} aria-label="Next">&rsaquo;</button>
        </>
      )}
    </div>
  )
}

/**
 * ArticlesWidget — Per-league SAM Reports carousels for the landing page.
 * Each league with published articles gets its own Key Stories-style carousel.
 */
const ArticlesWidget = ({ limit = 6 }) => {
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLogos, setShowLogos] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [articlesRes, settingsRes] = await Promise.allSettled([
          getArticlesGroupedByLeague(limit),
          getPlatformSettings(),
        ])
        if (articlesRes.status === 'fulfilled') setLeagues(articlesRes.value.data?.data?.leagues || [])
        if (settingsRes.status === 'fulfilled') {
          const d = settingsRes.value?.data?.data || settingsRes.value?.data || {}
          setShowLogos(d.articleTeamLogosEnabled !== false)
        }
      } catch {
        setLeagues([])
      }
      setLoading(false)
    }
    load()
  }, [limit])

  if (loading) return null
  if (leagues.length === 0) return null

  return (
    <div>
      {/* Section header */}
      <div className="ls-news-carousel-wrap" style={{ paddingBottom: 0 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div className="ls-news-carousel-hd" style={{ marginBottom: 0 }}>
            SAM Reports
          </div>
          <button
            onClick={() => navigate('/articles')}
            className="ls-sam-reports-viewall"
          >
            All Reports &rsaquo;
          </button>
        </div>
      </div>

      {/* Per-league carousels */}
      {leagues.map((group) => (
        <LeagueCarousel
          key={group.league}
          league={group.league}
          articles={group.articles}
          showLogos={showLogos}
        />
      ))}
    </div>
  )
}

export default ArticlesWidget
