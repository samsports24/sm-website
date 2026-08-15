import React from 'react'
import './injuryBadge.css'

/**
 * InjuryBadge — a compact red medical-cross symbol shown next to a player's
 * name anywhere they appear (cards, search rows, auction rows) when they're on
 * the injury report.
 *
 * Two ways to drive it:
 *   • `injury`  — a row from the injury feed ({ status, bodyPart, NflNewsOutlook })
 *                 via useInjuryReport(). This is the authoritative "on the injury
 *                 report" signal and catches players whose plain status is blank.
 *   • `status`  — a plain InjuryStatus string on the player object. Used as a
 *                 fallback when the feed lookup isn't wired.
 */

// Official designation → short code + colour.
const STATUS_ABBR = {
  out: ['OUT', '#EF4444'],
  'injured reserve': ['IR', '#EF4444'],
  ir: ['IR', '#EF4444'],
  pup: ['PUP', '#EF4444'],
  nfi: ['NFI', '#EF4444'],
  suspended: ['SUSP', '#EF4444'],
  doubtful: ['D', '#F97316'],
  questionable: ['Q', '#D4A843'],
  'day-to-day': ['DTD', '#3B82F6'],
}
// News outlook → short code + colour (used when there's no official designation).
const OUTLOOK_ABBR = {
  'unlikely to play': ['OUT', '#EF4444'],
  doubtful: ['D', '#F97316'],
  'game-time decision': ['GTD', '#F59E0B'],
  questionable: ['Q', '#D4A843'],
  'expected to play': ['PROB', '#22C55E'],
}
// Plain statuses that mean the player is fine — never badge these.
const NOT_INJURED = new Set(['', '-', 'active', 'healthy', 'none', 'available', 'probable', 'unknown'])

export const isInjured = (status) => {
  const k = String(status || '').toLowerCase().trim()
  return !!k && !NOT_INJURED.has(k)
}

// Work out the code/colour/tooltip from a feed row or a plain status string.
const describe = (injury, status) => {
  if (injury) {
    const sk = String(injury.status || '').toLowerCase().trim()
    const ok = String(injury.NflNewsOutlook || injury.outlook || '').toLowerCase().trim()
    let hit = null
    // Prefer a real official designation, else fall back to the news outlook.
    for (const key of Object.keys(STATUS_ABBR)) {
      if (sk.includes(key)) { hit = STATUS_ABBR[key]; break }
    }
    if (!hit && OUTLOOK_ABBR[ok]) hit = OUTLOOK_ABBR[ok]
    if (!hit) hit = ['INJ', '#EF4444'] // on the report but no clear label
    const parts = []
    if (injury.bodyPart) parts.push(injury.bodyPart)
    if (injury.NflNewsOutlook || injury.outlook) parts.push(injury.NflNewsOutlook || injury.outlook)
    else if (injury.status) parts.push(injury.status)
    return { code: hit[0], color: hit[1], title: `Injury report: ${parts.join(' · ') || 'listed'}` }
  }
  if (isInjured(status)) {
    const k = String(status).toLowerCase().trim()
    for (const key of Object.keys(STATUS_ABBR)) {
      if (k.includes(key)) return { code: STATUS_ABBR[key][0], color: STATUS_ABBR[key][1], title: `Injury: ${status}` }
    }
    return { code: String(status).slice(0, 3).toUpperCase(), color: '#EF4444', title: `Injury: ${status}` }
  }
  return null
}

const InjuryBadge = ({ injury = null, status = null, size = 'sm', className = '' }) => {
  const d = describe(injury, status)
  if (!d) return null
  return (
    <span
      className={`inj-sym inj-sym-${size} ${className}`}
      style={{ '--inj-c': d.color }}
      title={d.title}
      aria-label={d.title}
    >
      <span className="inj-sym-cross" aria-hidden>✚</span>
      <span className="inj-sym-txt">{d.code}</span>
    </span>
  )
}

export default InjuryBadge
