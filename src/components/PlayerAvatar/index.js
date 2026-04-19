/**
 * PlayerAvatar — Unified player image component
 *
 * Respects the global "playerImagesEnabled" admin setting.
 * When images are OFF → shows colored initials circle.
 * When images are ON  → shows the player headshot with onError fallback.
 *
 * Usage:
 *   <PlayerAvatar name="Patrick Mahomes" src={p.HostedHeadshotNoBackgroundUrl} size={40} />
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { publicAPI } from '../../config/constants'

/* ─── Context ─── */
const PlayerImagesContext = createContext(true)

export const PlayerImagesProvider = ({ children }) => {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await publicAPI.get('/admin-panel/platform-settings')
        const data = res?.data?.data || res?.data || {}
        if (!cancelled) setEnabled(data.playerImagesEnabled !== false)
      } catch {
        // default to true on error
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <PlayerImagesContext.Provider value={enabled}>
      {children}
    </PlayerImagesContext.Provider>
  )
}

export const usePlayerImages = () => useContext(PlayerImagesContext)

/* ─── Color palette for initials ─── */
const COLORS = [
  '#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
]

const getColor = (name) => {
  if (!name) return COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0][0].toUpperCase()
}

/* ─── Component ─── */
const PlayerAvatar = ({
  name = '',
  src,
  size = 40,
  borderRadius = '50%',
  style = {},
  className = '',
}) => {
  const imagesEnabled = usePlayerImages()
  const [imgError, setImgError] = useState(false)

  // Reset error state when src changes
  useEffect(() => { setImgError(false) }, [src])

  const showImage = imagesEnabled && src && !imgError

  const containerStyle = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    borderRadius,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...style,
  }

  if (showImage) {
    return (
      <div style={containerStyle} className={className}>
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    )
  }

  // Initials fallback
  const bg = getColor(name)
  const fontSize = Math.max(10, Math.round(size * 0.38))

  return (
    <div
      style={{
        ...containerStyle,
        background: `${bg}25`,
        border: `1.5px solid ${bg}50`,
      }}
      className={className}
    >
      <span
        style={{
          fontSize,
          fontWeight: 800,
          color: bg,
          letterSpacing: 0.5,
          fontFamily: "'Barlow Condensed', 'Inter', sans-serif",
          lineHeight: 1,
        }}
      >
        {getInitials(name)}
      </span>
    </div>
  )
}

export default PlayerAvatar
