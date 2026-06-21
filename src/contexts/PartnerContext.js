import React, { createContext, useContext, useState, useEffect } from 'react'
import { publicAPI } from '../config/constants'

const PartnerContext = createContext(null)

/**
 * Detects partner subdomain from the current URL.
 * e.g. "joes-bar.samsports.io" → "joes-bar"
 * Returns null for main platform (samsports.io, www.samsports.io, localhost)
 */
const detectSubdomain = () => {
  const host = window.location.hostname
  const parts = host.split('.')

  // Skip for localhost / IP / dev environments
  if (host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    // Allow override via query param for local testing: ?partner=joes-bar
    const params = new URLSearchParams(window.location.search)
    return params.get('partner') || null
  }

  // Known non-partner subdomains
  const skip = ['www', 'api', 'office', 'football', 'admin', 'staging', 'dev']

  // "joes-bar.samsports.io" → parts = ["joes-bar", "samsports", "io"]
  if (parts.length >= 3) {
    const candidate = parts[0].toLowerCase()
    if (!skip.includes(candidate)) {
      return candidate
    }
  }

  return null
}

/**
 * Applies partner branding as CSS custom properties on :root
 */
const applyBranding = (branding) => {
  if (!branding) return

  const root = document.documentElement
  const vars = {
    '--partner-primary': branding.primaryColor || '#D4A843',
    '--partner-secondary': branding.secondaryColor || '#141C2D',
    '--partner-accent': branding.accentColor || '#22C55E',
    '--partner-header-bg': branding.headerBg || '#0A0F1C',
    '--partner-card-bg': branding.cardBg || 'rgba(20, 28, 45, 0.85)',
    '--partner-text': branding.textColor || '#E2E8F0',
    '--partner-font': branding.fontFamily || 'Rajdhani',
  }

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  // Set favicon if provided
  if (branding.favicon) {
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
    link.type = 'image/x-icon'
    link.rel = 'shortcut icon'
    link.href = branding.favicon
    document.head.appendChild(link)
  }

  // Inject custom CSS if provided (Pro/Enterprise)
  if (branding.customCSS) {
    const existingStyle = document.getElementById('partner-custom-css')
    if (existingStyle) existingStyle.remove()
    const style = document.createElement('style')
    style.id = 'partner-custom-css'
    style.textContent = branding.customCSS
    document.head.appendChild(style)
  }
}

export const PartnerProvider = ({ children }) => {
  const [partner, setPartner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPartnerSite, setIsPartnerSite] = useState(false)

  useEffect(() => {
    const subdomain = detectSubdomain()
    if (!subdomain) {
      setLoading(false)
      return
    }

    setIsPartnerSite(true)

    publicAPI
      .get(`/partner/branding/${subdomain}`)
      .then((res) => {
        const data = res?.data?.data
        if (data) {
          setPartner({
            name: data.name,
            businessName: data.businessName,
            branding: data.branding,
            welcomeMessage: data.welcomeMessage,
            landingPageMode: data.landingPageMode || 'simple',
            timezone: data.timezone || 'America/New_York',
            subdomain,
          })
          applyBranding(data.branding)

          // Update page title
          document.title = `${data.businessName || data.name} | Powered by SamSports`
        }
      })
      .catch((err) => {
        console.warn('[Partner] Failed to load branding:', err.message)
        // Subdomain exists but partner not found — redirect to main site
        // or just continue with default branding
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <PartnerContext.Provider
      value={{
        partner,
        isPartnerSite,
        loading,
        subdomain: partner?.subdomain || null,
        logo: partner?.branding?.logo || null,
        primaryColor: partner?.branding?.primaryColor || '#D4A843',
        businessName: partner?.businessName || partner?.name || 'SamSports',
        landingPageMode: partner?.landingPageMode || 'simple',
        welcomeMessage: partner?.welcomeMessage || '',
        timezone: partner?.timezone || 'America/New_York',
      }}
    >
      {children}
    </PartnerContext.Provider>
  )
}

export const usePartner = () => {
  const ctx = useContext(PartnerContext)
  if (!ctx) {
    // Return defaults if used outside provider
    return {
      partner: null,
      isPartnerSite: false,
      loading: false,
      subdomain: null,
      logo: null,
      primaryColor: '#D4A843',
      businessName: 'SamSports',
      landingPageMode: 'full',
      welcomeMessage: '',
      timezone: 'America/New_York',
    }
  }
  return ctx
}

export default PartnerContext
