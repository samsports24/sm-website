import { useEffect } from 'react'

/**
 * SEO Component — sets document title + meta tags via DOM manipulation.
 * Drop-in replacement for react-helmet without the dependency.
 *
 * Usage:
 *   <SEO
 *     title="Dashboard"
 *     description="Manage your fantasy A.Football roster, track scores, and compete."
 *     path="/dashboard"
 *   />
 */

const SITE_NAME = 'SAM Sports'
const BASE_URL = 'https://samsports.com'
const DEFAULT_IMAGE = `${BASE_URL}/og-cover-nfl.png`

const SEO = ({
  title,
  description,
  path = '',
  image,
  type = 'website',
  noIndex = false,
  jsonLd,
}) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Fantasy A.Football League`
    const fullUrl = `${BASE_URL}${path}`
    const desc = description || 'SAM Sports is the ultimate fantasy A.Football platform. Draft, trade, and compete for championships.'
    const img = image || DEFAULT_IMAGE

    // Title
    document.title = fullTitle

    // Helper: set or create a meta tag
    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    // Standard meta
    setMeta('name', 'description', desc)
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow')

    // Open Graph
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:url', fullUrl)
    setMeta('property', 'og:image', img)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:site_name', SITE_NAME)

    // Twitter Card
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', desc)
    setMeta('name', 'twitter:image', img)
    setMeta('name', 'twitter:card', 'summary_large_image')

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', fullUrl)

    // JSON-LD (page-specific)
    const existingLd = document.getElementById('seo-jsonld')
    if (existingLd) existingLd.remove()
    if (jsonLd) {
      const script = document.createElement('script')
      script.id = 'seo-jsonld'
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }

    // Cleanup: restore defaults on unmount
    return () => {
      document.title = `${SITE_NAME} — Fantasy A.Football League`
      const ld = document.getElementById('seo-jsonld')
      if (ld) ld.remove()
    }
  }, [title, description, path, image, type, noIndex, jsonLd])

  return null // Render nothing — side-effect only
}

export default SEO
