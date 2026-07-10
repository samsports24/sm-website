import { useState, useEffect } from 'react'
import { publicAPI } from '../../config/constants'
import { usePartner } from '../../contexts/PartnerContext'

/**
 * Fetches and displays partner adverts on the landing page.
 * Positions: landing-banner (top banner area), sidebar, in-feed
 */
const PartnerAdverts = ({ position = 'landing-banner' }) => {
  const { subdomain, isPartnerSite } = usePartner()
  const [adverts, setAdverts] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (!isPartnerSite || !subdomain) return

    publicAPI
      .get(`/partner/adverts/public/${subdomain}`)
      .then((res) => {
        const ads = (res?.data?.data || []).filter(
          (ad) => ad.active && ad.position === position
        )
        setAdverts(ads)
      })
      .catch((err) => {
        console.warn('[PartnerAdverts] Failed to load:', err.message)
      })
  }, [subdomain, isPartnerSite, position])

  // Auto-rotate banner adverts
  useEffect(() => {
    if (adverts.length <= 1 || position !== 'landing-banner') return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % adverts.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [adverts.length, position])

  if (!isPartnerSite || adverts.length === 0) return null

  // ── Landing Banner ──
  if (position === 'landing-banner') {
    const ad = adverts[currentSlide]
    return (
      <div className="pa-banner-wrap">
        <a
          href={ad.linkUrl || '#'}
          target={ad.linkUrl ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="pa-banner"
          onClick={(e) => !ad.linkUrl && e.preventDefault()}
        >
          <img src={ad.imageUrl} alt={ad.title || 'Partner Ad'} className="pa-banner-img" />
          {ad.title && ad.title !== 'Ad' && (
            <div className="pa-banner-overlay">
              <span className="pa-banner-title">{ad.title}</span>
            </div>
          )}
        </a>
        {adverts.length > 1 && (
          <div className="pa-banner-dots">
            {adverts.map((_, i) => (
              <button
                key={i}
                className={`pa-dot ${i === currentSlide ? 'pa-dot-active' : ''}`}
                onClick={() => setCurrentSlide(i)}
              />
            ))}
          </div>
        )}
        <div className="pa-sponsored">Sponsored</div>
      </div>
    )
  }

  // ── Sidebar ──
  if (position === 'sidebar') {
    return (
      <div className="pa-sidebar-wrap">
        {adverts.map((ad, i) => (
          <a
            key={i}
            href={ad.linkUrl || '#'}
            target={ad.linkUrl ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="pa-sidebar-ad"
            onClick={(e) => !ad.linkUrl && e.preventDefault()}
          >
            <img src={ad.imageUrl} alt={ad.title || 'Ad'} className="pa-sidebar-img" />
            {ad.title && ad.title !== 'Ad' && (
              <span className="pa-sidebar-title">{ad.title}</span>
            )}
          </a>
        ))}
        <div className="pa-sponsored" style={{ textAlign: 'center', marginTop: 4 }}>Sponsored</div>
      </div>
    )
  }

  // ── In-Feed ──
  if (position === 'in-feed') {
    const ad = adverts[0]
    return (
      <div className="pa-infeed-wrap">
        <a
          href={ad.linkUrl || '#'}
          target={ad.linkUrl ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="pa-infeed-ad"
          onClick={(e) => !ad.linkUrl && e.preventDefault()}
        >
          <img src={ad.imageUrl} alt={ad.title || 'Ad'} className="pa-infeed-img" />
          <div className="pa-infeed-content">
            <span className="pa-infeed-title">{ad.title || 'Sponsored'}</span>
            <span className="pa-sponsored">Ad</span>
          </div>
        </a>
      </div>
    )
  }

  return null
}

export default PartnerAdverts
