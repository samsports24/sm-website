import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePartner } from '../../contexts/PartnerContext'
import { publicAPI } from '../../config/constants'
import PartnerAdverts from './PartnerAdverts'
import LoginModal from '../../components/LoginModal'
import Footer from './Footer'
import '../../styles/pages/landing.css'

/**
 * Simple branded landing page for partner venues.
 * Shows: logo, welcome message, league links, adverts, login/signup.
 */
const PartnerSimpleLanding = () => {
  const navigate = useNavigate()
  const { logo, businessName, primaryColor, welcomeMessage, subdomain } = usePartner()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [adverts, setAdverts] = useState([])
  const [currentAd, setCurrentAd] = useState(0)

  useEffect(() => {
    if (!subdomain) return
    publicAPI.get(`/partner/adverts/public/${subdomain}`)
      .then(res => {
        const ads = (res?.data?.data || []).filter(a => a.active && a.position === 'landing-banner')
        setAdverts(ads)
      })
      .catch(() => {})
  }, [subdomain])

  // Auto-rotate adverts
  useEffect(() => {
    if (adverts.length <= 1) return
    const t = setInterval(() => setCurrentAd(p => (p + 1) % adverts.length), 5000)
    return () => clearInterval(t)
  }, [adverts.length])

  return (
    <div className="psl-page">
      {/* Background gradient */}
      <div className="psl-bg" />

      {/* Header */}
      <header className="psl-header">
        <div className="psl-header-inner">
          {logo && <img src={logo} alt={businessName} className="psl-header-logo" />}
          <span className="psl-header-name">{businessName}</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="psl-hero">
        <div className="psl-hero-inner">
          {logo && (
            <div className="psl-hero-logo-wrap">
              <img src={logo} alt={businessName} className="psl-hero-logo" />
            </div>
          )}
          <h1 className="psl-hero-title">{businessName}</h1>
          <p className="psl-hero-sub">
            {welcomeMessage || 'Welcome to our fantasy sports platform. Join a league, compete with friends, and win!'}
          </p>
          <div className="psl-hero-actions">
            <button className="psl-btn-primary" onClick={() => navigate('/select-game')}>
              JOIN A LEAGUE
            </button>
            <button className="psl-btn-secondary" onClick={() => setLoginModalOpen(true)}>
              LOG IN
            </button>
          </div>
          <div className="psl-powered">
            Powered by <span>SamSports</span>
          </div>
        </div>
      </section>

      {/* Advert Banner */}
      {adverts.length > 0 && (
        <section className="psl-adverts">
          <a
            href={adverts[currentAd]?.linkUrl || '#'}
            target={adverts[currentAd]?.linkUrl ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="psl-advert-banner"
            onClick={e => !adverts[currentAd]?.linkUrl && e.preventDefault()}
          >
            <img
              src={adverts[currentAd]?.imageUrl}
              alt={adverts[currentAd]?.title || 'Sponsored'}
              className="psl-advert-img"
            />
            {adverts[currentAd]?.title && adverts[currentAd]?.title !== 'Ad' && (
              <div className="psl-advert-overlay">
                <span>{adverts[currentAd].title}</span>
              </div>
            )}
          </a>
          {adverts.length > 1 && (
            <div className="psl-advert-dots">
              {adverts.map((_, i) => (
                <button
                  key={i}
                  className={`psl-dot ${i === currentAd ? 'psl-dot-active' : ''}`}
                  onClick={() => setCurrentAd(i)}
                />
              ))}
            </div>
          )}
          <div className="psl-sponsored">Sponsored</div>
        </section>
      )}

      {/* Features grid */}
      <section className="psl-features">
        <div className="psl-features-grid">
          <div className="psl-feature-card" onClick={() => navigate('/select-game')}>
            <div className="psl-feature-icon">&#9917;</div>
            <h3>Fantasy Leagues</h3>
            <p>Draft players, manage your team, compete for the title</p>
          </div>
          <div className="psl-feature-card" onClick={() => navigate('/select-game')}>
            <div className="psl-feature-icon">&#128200;</div>
            <h3>Live Scores</h3>
            <p>Real-time scores and stats across all major sports</p>
          </div>
          <div className="psl-feature-card" onClick={() => navigate('/select-game')}>
            <div className="psl-feature-icon">&#127942;</div>
            <h3>Compete</h3>
            <p>Challenge friends and climb the GM rankings</p>
          </div>
        </div>
      </section>

      {/* Sidebar adverts in a horizontal row */}
      <PartnerAdverts position="in-feed" />

      <Footer />

      {loginModalOpen && (
        <LoginModal onClose={() => setLoginModalOpen(false)} />
      )}
    </div>
  )
}

export default PartnerSimpleLanding
