import React, { useCallback } from 'react'
import { Button, Dropdown, message } from 'antd'
import { ShareAltOutlined, TwitterOutlined, FacebookOutlined, InstagramOutlined, DownloadOutlined } from '@ant-design/icons'

/**
 * TradeShareCard, Generates a branded SamSports trade image
 * and shares it to Twitter, Facebook, or Instagram (download).
 *
 * Props (NFL format):
 *  - trade: { buyer: { team, players[], drafts[], samPoints }, seller: { team, players[], drafts[], samPoints }, leagueName }
 *  - sport: 'football' (default)
 */
// Instagram portrait format, 1080x1350 — optimal for social reach
// on Twitter/X, Facebook feed, Instagram, and LinkedIn previews.
const CARD_W = 1080
const CARD_H = 1350

const COLORS = {
  bg: '#0A0F1A',
  cardBg: '#111827',
  green: '#22C55E',
  greenDark: '#16A34A',
  white: '#FFFFFF',
  muted: 'rgba(255,255,255,0.55)',
  dimBg: 'rgba(255,255,255,0.06)',
  red: '#EF4444',
  blue: '#3B82F6',
  border: 'rgba(255,255,255,0.08)',
  greenGlow: 'rgba(34,197,94,0.12)',
  greenBorder: 'rgba(34,197,94,0.25)',
}

function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/**
 * Load an image via URL into an Image object for canvas rendering.
 * Sets crossOrigin to allow CORS-enabled sources (required for canvas.toBlob).
 * Resolves with the loaded image, or null if loading fails (so we can fall back).
 *
 * Includes a hard timeout because some browsers (and especially file://
 * previews) silently hang on cross-origin images instead of firing
 * onerror — without this, the await Promise.all() in generateTradeImage
 * would never resolve and the share button would hang forever.
 */
function loadImage(url, timeoutMs = 3500) {
  return new Promise((resolve) => {
    if (!url) return resolve(null)
    const img = new Image()
    let done = false
    const finish = (result) => {
      if (done) return
      done = true
      resolve(result)
    }
    img.crossOrigin = 'anonymous'
    img.onload = () => finish(img)
    img.onerror = () => finish(null)
    img.src = url
    setTimeout(() => finish(null), timeoutMs)
  })
}

/**
 * Collect the best available image URL for a player.
 * Prefers the no-background headshot, falls back to team image,
 * then generic headshot fields.
 */
function getPlayerImageUrl(player) {
  if (!player) return null
  return (
    player.HostedHeadshotNoBackgroundUrl ||
    player.hostedHeadshotNoBackgroundUrl ||
    player.headshotUrl ||
    player.PhotoUrl ||
    player.photoUrl ||
    player.image ||
    player.Team_Image ||
    player.teamImage ||
    null
  )
}

/**
 * Draw a player's headshot inside a circular clip mask.
 * If no image provided, draws a placeholder initials circle.
 */
function drawPlayerHeadshot(ctx, img, cx, cy, radius, fallbackText) {
  ctx.save()
  // Circular clipping mask
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.closePath()

  // Background fill (behind image for transparent headshots)
  ctx.fillStyle = 'rgba(34,197,94,0.12)'
  ctx.fill()

  // Clip to circle for image draw
  ctx.clip()

  if (img) {
    // Cover-fit the image inside the circle
    const imgAspect = img.width / img.height
    let drawW, drawH
    if (imgAspect >= 1) {
      drawH = radius * 2
      drawW = drawH * imgAspect
    } else {
      drawW = radius * 2
      drawH = drawW / imgAspect
    }
    ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH)
  } else if (fallbackText) {
    // Fallback initials circle
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
    ctx.fillStyle = COLORS.green
    ctx.font = `bold ${radius}px "Rajdhani", "Segoe UI", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(fallbackText.substring(0, 2).toUpperCase(), cx, cy + 1)
  }

  ctx.restore()

  // Green ring around the headshot
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(34,197,94,0.55)'
  ctx.lineWidth = 1.5
  ctx.stroke()
}

/** Draw the shield "S" logo directly on canvas */
function drawShieldLogo(ctx, x, y, size) {
  const s = size / 36 // scale factor (SVG viewBox is 36x36)
  ctx.save()
  ctx.translate(x, y)

  // Shield shape, filled dark
  ctx.beginPath()
  ctx.moveTo(18 * s, 2 * s)
  ctx.lineTo(4 * s, 8 * s)
  ctx.lineTo(4 * s, 18 * s)
  ctx.quadraticCurveTo(4 * s, 30 * s, 18 * s, 36 * s)
  ctx.quadraticCurveTo(32 * s, 30 * s, 32 * s, 18 * s)
  ctx.lineTo(32 * s, 8 * s)
  ctx.closePath()
  ctx.fillStyle = '#111827'
  ctx.fill()

  // Shield outline, green gradient
  ctx.strokeStyle = COLORS.green
  ctx.lineWidth = 1.5 * s
  ctx.stroke()

  // "S" letterform
  ctx.beginPath()
  ctx.moveTo(22.5 * s, 13.5 * s)
  ctx.quadraticCurveTo(22.5 * s, 10 * s, 18 * s, 10 * s)
  ctx.quadraticCurveTo(13.5 * s, 10 * s, 13.5 * s, 13.5 * s)
  ctx.quadraticCurveTo(13.5 * s, 15.5 * s, 18 * s, 17.3 * s)
  ctx.quadraticCurveTo(22.5 * s, 19.1 * s, 22.5 * s, 21 * s)
  ctx.quadraticCurveTo(22.5 * s, 24.5 * s, 18 * s, 24.5 * s)
  ctx.quadraticCurveTo(13.5 * s, 24.5 * s, 13.5 * s, 21 * s)
  ctx.strokeStyle = COLORS.green
  ctx.lineWidth = 2.5 * s
  ctx.lineCap = 'round'
  ctx.stroke()

  ctx.restore()
}

async function generateTradeImage(trade, sport = 'football') {
  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')

  // ── Preload all player headshots up front ──────────────────
  // Canvas drawImage is synchronous, so all sources must be ready
  // before we start painting. We build a map keyed by player id/name
  // so drawSide() can look up the loaded Image object later.
  const allPlayers = [
    ...(trade.buyer?.players || []),
    ...(trade.seller?.players || []),
  ]
  // Stable key — must be deterministic so the map.set in this preload
  // and the map.get inside drawSide() resolve to the same string. The
  // previous implementation used Math.random() as a fallback, which
  // generated a fresh key on every call and would have silently broken
  // the lookup for any player without an id or name.
  const playerKey = (p) => String(p?._id || p?.id || p?.Name || p?.name || '__noid__')
  const imageMap = new Map()
  try {
    const loaded = await Promise.all(
      allPlayers.map((p) => loadImage(getPlayerImageUrl(p)))
    )
    allPlayers.forEach((p, i) => imageMap.set(playerKey(p), loaded[i]))
  } catch (e) {
    // Silent fail, fallback initials will be drawn
  }

  // ═══════════════════════════════════════════════════════════
  //  BACKGROUND — radial spotlight + stadium-lights vibe
  // ═══════════════════════════════════════════════════════════
  ctx.fillStyle = COLORS.bg
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  // Radial green spotlight behind the matchup area
  const spot = ctx.createRadialGradient(
    CARD_W / 2, CARD_H * 0.42, 0,
    CARD_W / 2, CARD_H * 0.42, CARD_W * 0.7
  )
  spot.addColorStop(0, 'rgba(34,197,94,0.18)')
  spot.addColorStop(0.35, 'rgba(34,197,94,0.06)')
  spot.addColorStop(1, 'rgba(10,15,26,0)')
  ctx.fillStyle = spot
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  // Diagonal stripe pattern for subtle texture
  ctx.save()
  ctx.globalAlpha = 0.04
  ctx.strokeStyle = COLORS.green
  ctx.lineWidth = 1
  for (let i = -CARD_H; i < CARD_W + CARD_H; i += 28) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + CARD_H, CARD_H)
    ctx.stroke()
  }
  ctx.restore()

  // Outer border frame (premium feel)
  ctx.strokeStyle = 'rgba(34,197,94,0.18)'
  ctx.lineWidth = 2
  ctx.strokeRect(12, 12, CARD_W - 24, CARD_H - 24)

  // ═══════════════════════════════════════════════════════════
  //  TOP BAR — Shield logo + SAMSPORTS wordmark + league badge
  // ═══════════════════════════════════════════════════════════
  // Top green gradient accent strip
  const topGrad = ctx.createLinearGradient(0, 0, CARD_W, 0)
  topGrad.addColorStop(0, COLORS.green)
  topGrad.addColorStop(0.5, '#86efac')
  topGrad.addColorStop(1, COLORS.greenDark)
  ctx.fillStyle = topGrad
  ctx.fillRect(0, 0, CARD_W, 6)

  // Shield logo
  drawShieldLogo(ctx, 48, 40, 64)

  // Wordmark
  ctx.font = 'bold 40px "Rajdhani", "Segoe UI", sans-serif'
  ctx.fillStyle = COLORS.white
  ctx.textAlign = 'left'
  ctx.fillText('SAM', 128, 86)
  const samW = ctx.measureText('SAM').width
  ctx.fillStyle = COLORS.green
  ctx.fillText('SPORTS', 128 + samW + 4, 86)

  // Sport tag pill
  const sportLabel = sport === 'soccer' ? 'ELEVEN FC' : 'DYNASTY FOOTBALL'
  ctx.font = '700 14px "Rajdhani", "Segoe UI", sans-serif'
  const tagX = 134
  const tagY = 98
  const tagPad = 12
  const tagW = ctx.measureText(sportLabel).width + tagPad * 2
  drawRoundRect(ctx, tagX, tagY, tagW, 22, 11)
  ctx.fillStyle = 'rgba(34,197,94,0.15)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(34,197,94,0.4)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = COLORS.green
  ctx.textAlign = 'left'
  ctx.fillText(sportLabel, tagX + tagPad, tagY + 15)

  // League name (top right)
  if (trade.leagueName) {
    ctx.font = '600 20px "Rajdhani", "Segoe UI", sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.textAlign = 'right'
    ctx.fillText(String(trade.leagueName).toUpperCase(), CARD_W - 48, 74)

    // Small decorative line under league name
    ctx.strokeStyle = 'rgba(34,197,94,0.45)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(CARD_W - 48 - 80, 84)
    ctx.lineTo(CARD_W - 48, 84)
    ctx.stroke()

    ctx.font = '600 12px "Rajdhani", "Segoe UI", sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.textAlign = 'right'
    ctx.fillText('LEAGUE', CARD_W - 48, 102)
  }

  // ═══════════════════════════════════════════════════════════
  //  HERO — Dramatic "TRADE OFFER" title
  // ═══════════════════════════════════════════════════════════
  // Hot tag above title
  const hotTag = '\u26A1 BLOCKBUSTER \u26A1'
  ctx.font = '800 18px "Rajdhani", "Segoe UI", sans-serif'
  ctx.textAlign = 'center'
  const hotW = ctx.measureText(hotTag).width + 28
  drawRoundRect(ctx, CARD_W / 2 - hotW / 2, 158, hotW, 32, 16)
  const hotGrad = ctx.createLinearGradient(CARD_W / 2 - hotW / 2, 0, CARD_W / 2 + hotW / 2, 0)
  hotGrad.addColorStop(0, 'rgba(239,68,68,0.2)')
  hotGrad.addColorStop(0.5, 'rgba(245,158,11,0.25)')
  hotGrad.addColorStop(1, 'rgba(239,68,68,0.2)')
  ctx.fillStyle = hotGrad
  ctx.fill()
  ctx.strokeStyle = 'rgba(245,158,11,0.55)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.fillStyle = '#FBBF24'
  ctx.fillText(hotTag, CARD_W / 2, 181)

  // Main title "TRADE OFFER" — massive, glowing
  ctx.save()
  ctx.shadowColor = 'rgba(34,197,94,0.55)'
  ctx.shadowBlur = 30
  ctx.font = '900 96px "Rajdhani", "Segoe UI", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = COLORS.white
  ctx.fillText('TRADE OFFER', CARD_W / 2, 275)
  ctx.restore()

  // Subtitle
  ctx.font = '500 22px "Rajdhani", "Segoe UI", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.textAlign = 'center'
  ctx.fillText('WHO WINS THIS DEAL?', CARD_W / 2, 310)

  // ═══════════════════════════════════════════════════════════
  //  TEAM MATCHUP BAR — Team A vs Team B with records
  // ═══════════════════════════════════════════════════════════
  const buyerName = trade.buyer?.team?.name || 'Team One'
  const sellerName = trade.seller?.team?.name || 'Team Two'
  const buyerRecord = trade.buyer?.team?.record || trade.buyer?.record || ''
  const sellerRecord = trade.seller?.team?.record || trade.seller?.record || ''

  // Matchup band background
  drawRoundRect(ctx, 40, 340, CARD_W - 80, 120, 16)
  ctx.fillStyle = 'rgba(17,24,39,0.85)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(34,197,94,0.25)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Helper to draw team avatar
  function drawTeamAvatar(cx, cy, radius, label) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
    g.addColorStop(0, 'rgba(34,197,94,0.3)')
    g.addColorStop(1, 'rgba(17,24,39,1)')
    ctx.fillStyle = g
    ctx.fill()
    ctx.strokeStyle = COLORS.green
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.font = '900 22px "Rajdhani", "Segoe UI", sans-serif'
    ctx.fillStyle = COLORS.white
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const initials = String(label || '??')
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase()
    ctx.fillText(initials || '??', cx, cy + 1)
    ctx.textBaseline = 'alphabetic'
    ctx.restore()
  }

  // Truncate helper
  function truncate(text, maxW, font) {
    ctx.font = font
    if (ctx.measureText(text).width <= maxW) return text
    let t = text
    while (t.length > 3 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1)
    return t + '…'
  }

  // LEFT team
  drawTeamAvatar(110, 400, 36, buyerName)
  ctx.textAlign = 'left'
  ctx.font = '800 28px "Rajdhani", "Segoe UI", sans-serif'
  ctx.fillStyle = COLORS.white
  ctx.fillText(
    truncate(buyerName.toUpperCase(), 340, '800 28px "Rajdhani", sans-serif'),
    158, 395
  )
  ctx.font = '600 16px "Rajdhani", "Segoe UI", sans-serif'
  ctx.fillStyle = COLORS.red
  ctx.fillText('GIVES', 158, 422)
  if (buyerRecord) {
    ctx.font = '500 14px "Segoe UI", sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillText(`· ${buyerRecord}`, 158 + 60, 422)
  }

  // RIGHT team (mirrored to right side)
  drawTeamAvatar(CARD_W - 110, 400, 36, sellerName)
  ctx.textAlign = 'right'
  ctx.font = '800 28px "Rajdhani", "Segoe UI", sans-serif'
  ctx.fillStyle = COLORS.white
  ctx.fillText(
    truncate(sellerName.toUpperCase(), 340, '800 28px "Rajdhani", sans-serif'),
    CARD_W - 158, 395
  )
  ctx.font = '600 16px "Rajdhani", "Segoe UI", sans-serif'
  ctx.fillStyle = COLORS.green
  ctx.fillText('GIVES', CARD_W - 158, 422)
  if (sellerRecord) {
    ctx.font = '500 14px "Segoe UI", sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillText(`${sellerRecord} ·`, CARD_W - 158 - 60, 422)
  }

  // Center VS badge with glow
  const vsCx = CARD_W / 2, vsCy = 400
  ctx.save()
  ctx.shadowColor = 'rgba(34,197,94,0.7)'
  ctx.shadowBlur = 24
  ctx.beginPath()
  ctx.arc(vsCx, vsCy, 34, 0, Math.PI * 2)
  const vsGrad = ctx.createRadialGradient(vsCx, vsCy, 0, vsCx, vsCy, 34)
  vsGrad.addColorStop(0, COLORS.green)
  vsGrad.addColorStop(1, COLORS.greenDark)
  ctx.fillStyle = vsGrad
  ctx.fill()
  ctx.restore()
  ctx.strokeStyle = COLORS.white
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(vsCx, vsCy, 34, 0, Math.PI * 2)
  ctx.stroke()
  ctx.font = '900 26px "Rajdhani", "Segoe UI", sans-serif'
  ctx.fillStyle = COLORS.white
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('VS', vsCx, vsCy + 2)
  ctx.textBaseline = 'alphabetic'

  // ═══════════════════════════════════════════════════════════
  //  ASSET COLUMNS — Player cards with BIG headshots
  // ═══════════════════════════════════════════════════════════
  const colPad = 40
  const colGap = 40
  const colW = (CARD_W - colPad * 2 - colGap) / 2
  const colX1 = colPad
  const colX2 = colPad + colW + colGap
  const colTop = 500
  const colBot = 1140

  // Draw column background cards
  function drawColumnBg(cx, accentColor) {
    drawRoundRect(ctx, cx, colTop, colW, colBot - colTop, 18)
    ctx.fillStyle = 'rgba(17,24,39,0.6)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.stroke()
    // Top accent bar
    ctx.save()
    ctx.beginPath()
    drawRoundRect(ctx, cx, colTop, colW, 6, 3)
    ctx.fillStyle = accentColor
    ctx.fill()
    ctx.restore()
  }
  drawColumnBg(colX1, COLORS.red)
  drawColumnBg(colX2, COLORS.green)

  const posColors = {
    QB: '#EF4444', RB: '#22C55E', WR: '#3B82F6', TE: '#F59E0B',
    K: '#A78BFA', CB: '#8B5CF6', S: '#0EA5E9', DST: '#6B7280',
    DEF: '#6B7280', OL: '#14B8A6', DL: '#EC4899', LB: '#F97316',
    GK: '#F59E0B', MID: '#22C55E', FWD: '#EF4444',
  }

  function drawSide(colX, teamName, accentColor, players, drafts, samPoints) {
    const sideW = colW

    // "SENDS" header strip
    ctx.save()
    ctx.textAlign = 'center'
    ctx.font = '700 13px "Rajdhani", "Segoe UI", sans-serif'
    ctx.fillStyle = accentColor
    ctx.fillText('SENDS', colX + sideW / 2, 540)
    ctx.restore()

    // Player + pick list, laid out vertically
    let y = 560
    const maxItems = 5
    const playerCardH = 76
    const pickCardH = 54

    const items = [
      ...players.slice(0, maxItems).map((p) => ({ type: 'player', data: p })),
      ...drafts.slice(0, maxItems).map((d) => ({ type: 'draft', data: d })),
    ].slice(0, maxItems)

    items.forEach((item) => {
      if (item.type === 'player') {
        const p = item.data
        // Card background
        drawRoundRect(ctx, colX + 16, y, sideW - 32, playerCardH, 12)
        const cardGrad = ctx.createLinearGradient(colX, y, colX + sideW, y)
        cardGrad.addColorStop(0, 'rgba(255,255,255,0.06)')
        cardGrad.addColorStop(1, 'rgba(255,255,255,0.02)')
        ctx.fillStyle = cardGrad
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.lineWidth = 1
        ctx.stroke()

        // Left accent stripe
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(colX + 18, y + 12)
        ctx.lineTo(colX + 18, y + playerCardH - 12)
        ctx.strokeStyle = accentColor
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.stroke()
        ctx.restore()

        const playerName = p.Name || p.name || 'Unknown'

        // Big headshot, circular
        const headshotImg = imageMap.get(playerKey(p))
        drawPlayerHeadshot(ctx, headshotImg, colX + 60, y + playerCardH / 2, 28, playerName)

        // Player name
        ctx.textAlign = 'left'
        ctx.font = '800 22px "Rajdhani", "Segoe UI", sans-serif'
        ctx.fillStyle = COLORS.white
        const nameMaxW = sideW - 130
        const displayName = truncate(playerName.toUpperCase(), nameMaxW, '800 22px "Rajdhani", sans-serif')
        ctx.fillText(displayName, colX + 100, y + 32)

        // Position pill + team + salary row
        const pos = (p.Position || p.position || '').toUpperCase()
        const posShort = pos.substring(0, 3)
        const pillX = colX + 100
        const pillY = y + 42
        const pillW = 40
        const pillH = 20
        drawRoundRect(ctx, pillX, pillY, pillW, pillH, 4)
        ctx.fillStyle = posColors[posShort] || posColors[pos] || '#6B7280'
        ctx.fill()
        ctx.font = '800 11px "Rajdhani", "Segoe UI", sans-serif'
        ctx.fillStyle = COLORS.white
        ctx.textAlign = 'center'
        ctx.fillText(posShort || '—', pillX + pillW / 2, pillY + 14)

        // Team abbreviation
        const teamAbbr = p.Team || p.team_code || p.teamCode || ''
        let metaX = pillX + pillW + 10
        if (teamAbbr) {
          ctx.textAlign = 'left'
          ctx.font = '600 13px "Rajdhani", "Segoe UI", sans-serif'
          ctx.fillStyle = 'rgba(255,255,255,0.55)'
          ctx.fillText(String(teamAbbr).toUpperCase(), metaX, pillY + 14)
          metaX += ctx.measureText(String(teamAbbr).toUpperCase()).width + 10
        }

        // Salary (if available)
        const salary = p.currentYearSalaryCap || p.salary || 0
        if (salary > 0) {
          const salaryText = `$${(salary / 1_000_000).toFixed(1)}M`
          ctx.font = '700 13px "Rajdhani", "Segoe UI", sans-serif'
          ctx.fillStyle = COLORS.green
          ctx.textAlign = 'left'
          ctx.fillText(salaryText, metaX, pillY + 14)
        }

        y += playerCardH + 10
      } else {
        const d = item.data
        // Draft pick card, green accent
        drawRoundRect(ctx, colX + 16, y, sideW - 32, pickCardH, 10)
        const pickGrad = ctx.createLinearGradient(colX, y, colX + sideW, y)
        pickGrad.addColorStop(0, 'rgba(34,197,94,0.12)')
        pickGrad.addColorStop(1, 'rgba(34,197,94,0.04)')
        ctx.fillStyle = pickGrad
        ctx.fill()
        ctx.strokeStyle = 'rgba(34,197,94,0.28)'
        ctx.lineWidth = 1
        ctx.stroke()

        // Draft pick icon (trophy/star placeholder)
        ctx.save()
        ctx.beginPath()
        ctx.arc(colX + 48, y + pickCardH / 2, 18, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(34,197,94,0.15)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(34,197,94,0.55)'
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.font = '800 16px "Rajdhani", "Segoe UI", sans-serif'
        ctx.fillStyle = COLORS.green
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('\u2605', colX + 48, y + pickCardH / 2 + 1)
        ctx.textBaseline = 'alphabetic'
        ctx.restore()

        // Pick label
        ctx.textAlign = 'left'
        ctx.font = '800 18px "Rajdhani", "Segoe UI", sans-serif'
        ctx.fillStyle = COLORS.white
        ctx.fillText(`${d?.season || ''} ROOKIE PICK`, colX + 76, y + 24)

        ctx.font = '700 13px "Rajdhani", "Segoe UI", sans-serif'
        ctx.fillStyle = COLORS.green
        ctx.fillText(`ROUND ${d?.round || '—'}`, colX + 76, y + 42)

        y += pickCardH + 10
      }
    })

    // Overflow indicator
    const totalItems = players.length + drafts.length
    if (totalItems > maxItems) {
      ctx.font = '700 14px "Rajdhani", "Segoe UI", sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.textAlign = 'center'
      ctx.fillText(`+ ${totalItems - maxItems} more`, colX + sideW / 2, y + 18)
      y += 30
    }

    // SamPoints badge at the bottom of the column
    if (samPoints > 0) {
      const spY = colBot - 50
      const spText = `+ ${samPoints.toLocaleString()} SAMPOINTS`
      ctx.font = '800 14px "Rajdhani", "Segoe UI", sans-serif'
      const spW = ctx.measureText(spText).width + 24
      const spX = colX + (sideW - spW) / 2
      drawRoundRect(ctx, spX, spY, spW, 30, 15)
      ctx.fillStyle = 'rgba(34,197,94,0.18)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(34,197,94,0.45)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = COLORS.green
      ctx.textAlign = 'center'
      ctx.fillText(spText, spX + spW / 2, spY + 20)
    }
  }

  drawSide(colX1, buyerName, COLORS.red, trade.buyer?.players || [], trade.buyer?.drafts || [], trade.buyer?.samPoints || 0)
  drawSide(colX2, sellerName, COLORS.green, trade.seller?.players || [], trade.seller?.drafts || [], trade.seller?.samPoints || 0)

  // ═══════════════════════════════════════════════════════════
  //  CTA BANNER — "Analyze this trade with AI at samsports.io"
  // ═══════════════════════════════════════════════════════════
  const ctaY = 1170
  const ctaH = 110
  drawRoundRect(ctx, 40, ctaY, CARD_W - 80, ctaH, 20)
  const ctaGrad = ctx.createLinearGradient(40, ctaY, CARD_W - 40, ctaY)
  ctaGrad.addColorStop(0, 'rgba(34,197,94,0.2)')
  ctaGrad.addColorStop(0.5, 'rgba(34,197,94,0.35)')
  ctaGrad.addColorStop(1, 'rgba(22,163,74,0.2)')
  ctx.fillStyle = ctaGrad
  ctx.fill()
  ctx.strokeStyle = COLORS.green
  ctx.lineWidth = 2
  ctx.stroke()

  // CTA icon — AI sparkle
  ctx.save()
  ctx.shadowColor = 'rgba(34,197,94,0.6)'
  ctx.shadowBlur = 14
  ctx.beginPath()
  ctx.arc(100, ctaY + ctaH / 2, 28, 0, Math.PI * 2)
  ctx.fillStyle = COLORS.green
  ctx.fill()
  ctx.restore()
  ctx.font = '900 28px "Rajdhani", "Segoe UI", sans-serif'
  ctx.fillStyle = COLORS.white
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('AI', 100, ctaY + ctaH / 2 + 1)
  ctx.textBaseline = 'alphabetic'

  // CTA text
  ctx.textAlign = 'left'
  ctx.font = '900 28px "Rajdhani", "Segoe UI", sans-serif'
  ctx.fillStyle = COLORS.white
  ctx.fillText('ANALYZE THIS TRADE WITH AI', 148, ctaY + 48)

  ctx.font = '600 18px "Rajdhani", "Segoe UI", sans-serif'
  ctx.fillStyle = COLORS.green
  ctx.fillText('SAMSPORTS.IO \u2192', 148, ctaY + 78)

  // Right-side arrow button
  drawRoundRect(ctx, CARD_W - 160, ctaY + ctaH / 2 - 22, 100, 44, 22)
  ctx.fillStyle = COLORS.green
  ctx.fill()
  ctx.font = '900 20px "Rajdhani", "Segoe UI", sans-serif'
  ctx.fillStyle = COLORS.white
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('JOIN \u2192', CARD_W - 110, ctaY + ctaH / 2 + 1)
  ctx.textBaseline = 'alphabetic'

  // ═══════════════════════════════════════════════════════════
  //  FOOTER — brand strip
  // ═══════════════════════════════════════════════════════════
  // Separator
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(48, 1304)
  ctx.lineTo(CARD_W - 48, 1304)
  ctx.stroke()

  // Footer brand line: shield + "SAMSPORTS.IO  ·  FANTASY SPORTS REIMAGINED"
  // Centred as one composite line so the layout stays balanced.
  const footerBrand = 'SAMSPORTS.IO'
  const footerSep = '  ·  '
  const footerTag = 'FANTASY SPORTS REIMAGINED'
  ctx.font = '700 20px "Rajdhani", "Segoe UI", sans-serif'
  const brandW = ctx.measureText(footerBrand).width
  ctx.font = '500 14px "Rajdhani", "Segoe UI", sans-serif'
  const sepW = ctx.measureText(footerSep).width
  // Renamed from `tagW` to avoid colliding with the header `tagW`
  // declared earlier in the same function (caused a build-breaking
  // "Identifier 'tagW' has already been declared" error).
  const footerTagW = ctx.measureText(footerTag).width
  const footerShieldSize = 28
  const footerTotalW = footerShieldSize + 10 + brandW + sepW + footerTagW
  let footerX = (CARD_W - footerTotalW) / 2
  drawShieldLogo(ctx, footerX, 1310, footerShieldSize)
  footerX += footerShieldSize + 10
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.font = '700 20px "Rajdhani", "Segoe UI", sans-serif'
  ctx.fillStyle = COLORS.white
  ctx.fillText(footerBrand, footerX, 1325)
  footerX += brandW
  ctx.font = '500 14px "Rajdhani", "Segoe UI", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillText(footerSep, footerX, 1325)
  footerX += sepW
  ctx.fillStyle = COLORS.green
  ctx.font = '700 14px "Rajdhani", "Segoe UI", sans-serif'
  ctx.fillText(footerTag, footerX, 1325)
  ctx.textBaseline = 'alphabetic'

  // Green bottom accent
  const btmGrad = ctx.createLinearGradient(0, 0, CARD_W, 0)
  btmGrad.addColorStop(0, COLORS.green)
  btmGrad.addColorStop(0.5, '#86efac')
  btmGrad.addColorStop(1, COLORS.greenDark)
  ctx.fillStyle = btmGrad
  ctx.fillRect(0, CARD_H - 6, CARD_W, 6)

  return canvas
}

async function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

async function downloadImage(canvas, filename = 'samsports-trade.png') {
  const blob = await canvasToBlob(canvas)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const TradeShareCard = ({ trade, sport = 'football', style }) => {
  const handleShare = useCallback(async (platform) => {
    const loadingKey = 'trade-share-loading'
    message.loading({ content: 'Generating trade card…', key: loadingKey, duration: 0 })
    let canvas
    try {
      canvas = await generateTradeImage(trade, sport)
    } finally {
      message.destroy(loadingKey)
    }

    const buyerName = trade.buyer?.team?.name || 'Team One'
    const sellerName = trade.seller?.team?.name || 'Team Two'
    const text = `🔄 Trade Offer: ${buyerName} ↔ ${sellerName}${trade.leagueName ? ` in ${trade.leagueName}` : ''}\n\nCheck it out on SamSports! 🏆\n#SamSports #FantasyFootball`
    const url = 'https://samsports.io'

    if (platform === 'twitter') {
      const blob = await canvasToBlob(canvas)

      // Try Web Share API first (mobile)
      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([blob], 'samsports-trade.png', { type: 'image/png' })
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ text, files: [file] })
            return
          }
        } catch (e) {
          // Fallback
        }
      }

      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
      window.open(twitterUrl, '_blank', 'width=600,height=400')
      await downloadImage(canvas)
      message.info('Trade image downloaded, attach it to your tweet!')
    } else if (platform === 'facebook') {
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`
      window.open(fbUrl, '_blank', 'width=600,height=400')
      await downloadImage(canvas)
      message.info('Trade image downloaded, attach it to your Facebook post!')
    } else if (platform === 'instagram') {
      await downloadImage(canvas)
      message.success('Trade image downloaded! Open Instagram and share it from your gallery.')
    } else if (platform === 'download') {
      await downloadImage(canvas)
      message.success('Trade image downloaded!')
    }
  }, [trade, sport])

  const shareItems = [
    {
      key: 'twitter',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TwitterOutlined style={{ color: '#1DA1F2' }} /> Share on X (Twitter)
        </span>
      ),
    },
    {
      key: 'facebook',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FacebookOutlined style={{ color: '#1877F2' }} /> Share on Facebook
        </span>
      ),
    },
    {
      key: 'instagram',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <InstagramOutlined style={{ color: '#E4405F' }} /> Share on Instagram
        </span>
      ),
    },
    { type: 'divider' },
    {
      key: 'download',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DownloadOutlined /> Download Image
        </span>
      ),
    },
  ]

  return (
    <Dropdown
      menu={{ items: shareItems, onClick: ({ key }) => handleShare(key) }}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button
        type="text"
        icon={<ShareAltOutlined />}
        style={{
          color: COLORS.green,
          fontWeight: 600,
          fontSize: 12,
          ...style,
        }}
      >
        Share
      </Button>
    </Dropdown>
  )
}

export { generateTradeImage }
export default TradeShareCard
