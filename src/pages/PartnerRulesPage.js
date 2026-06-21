import { useState, useEffect } from 'react'
import { usePartner } from '../contexts/PartnerContext'
import { publicAPI } from '../config/constants'
import Footer from './LandingPage/Footer'
import '../styles/pages/landing.css'

/**
 * Displays a partner's custom rules page.
 * Props: type = 'terms' | 'privacy' | 'rules'
 */
const PartnerRulesPage = ({ type = 'terms' }) => {
  const { subdomain, businessName, primaryColor } = usePartner()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  const titles = {
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    rules: 'House Rules',
  }

  const fields = {
    terms: 'termsOfService',
    privacy: 'privacyPolicy',
    rules: 'houseRules',
  }

  useEffect(() => {
    if (!subdomain) { setLoading(false); return }
    publicAPI.get(`/partner/rules/public/${subdomain}`)
      .then(res => {
        const data = res?.data?.data
        if (data) {
          setContent(data[fields[type]] || '')
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [subdomain, type])

  return (
    <div className="psl-page">
      <div className="psl-bg" />

      <header className="psl-header">
        <div className="psl-header-inner">
          <span className="psl-header-name" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
            {businessName}
          </span>
        </div>
      </header>

      <section style={{ position: 'relative', zIndex: 1, padding: '48px 24px 80px', maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#fff',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 8,
        }}>
          {titles[type]}
        </h1>
        <div style={{
          width: 60,
          height: 3,
          background: primaryColor || '#D4A843',
          borderRadius: 2,
          marginBottom: 32,
        }} />

        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</p>
        ) : content ? (
          <div style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 15,
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            background: 'rgba(20, 28, 45, 0.85)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: '32px 28px',
          }}>
            {content}
          </div>
        ) : (
          <div style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 15,
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(20, 28, 45, 0.85)',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <p>No custom {titles[type].toLowerCase()} have been set by {businessName}.</p>
            <p style={{ marginTop: 8 }}>
              <a href="/terms" style={{ color: primaryColor || '#D4A843' }}>View SamSports {titles[type]}</a>
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}

export default PartnerRulesPage
