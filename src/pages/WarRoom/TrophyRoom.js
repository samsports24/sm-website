import React, { useState } from 'react'
import { notification } from 'antd'

const TROPHY_ICONS = {
  title: '🏆',
  golden_boot: '👟',
  award: '🎖️',
  record: '📊',
  default: '🏆',
}

const TROPHY_CATEGORIES = [
  { id: 'all', label: 'All Trophies' },
  { id: 'title', label: 'League Titles' },
  { id: 'golden_boot', label: 'Golden Boot' },
  { id: 'award', label: 'Season Awards' },
  { id: 'record', label: 'Records' },
]

// Golden Boot Badge Component
const GoldenBootBadge = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer glow circle */}
    <circle cx="60" cy="60" r="58" fill="url(#goldGlow)" opacity="0.3" />
    {/* Main circle */}
    <circle cx="60" cy="60" r="50" fill="url(#goldGradient)" stroke="url(#goldBorder)" strokeWidth="3" />
    {/* Inner ring */}
    <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
    {/* Boot shape */}
    <path d="M45 40 L45 70 L42 73 L40 78 L40 85 L80 85 L82 80 L78 75 L75 70 L75 40 L65 35 L55 35 Z" fill="url(#bootGold)" stroke="#8A6E1E" strokeWidth="1.5" />
    {/* Boot sole */}
    <path d="M40 85 L80 85 L82 80 L78 78 L42 78 L40 80 Z" fill="#8A6E1E" />
    {/* Boot detail lines */}
    <line x1="50" y1="42" x2="50" y2="68" stroke="rgba(247,201,72,0.4)" strokeWidth="1" />
    <line x1="60" y1="38" x2="60" y2="68" stroke="rgba(247,201,72,0.4)" strokeWidth="1" />
    <line x1="70" y1="42" x2="70" y2="68" stroke="rgba(247,201,72,0.4)" strokeWidth="1" />
    {/* Laces */}
    <path d="M52 45 L68 45" stroke="#8A6E1E" strokeWidth="1.5" />
    <path d="M52 52 L68 52" stroke="#8A6E1E" strokeWidth="1.5" />
    <path d="M52 59 L68 59" stroke="#8A6E1E" strokeWidth="1.5" />
    {/* Stars */}
    <path d="M30 25 L32 30 L37 30 L33 33 L35 38 L30 35 L25 38 L27 33 L23 30 L28 30 Z" fill="#F7C948" opacity="0.6" />
    <path d="M90 25 L92 30 L97 30 L93 33 L95 38 L90 35 L85 38 L87 33 L83 30 L88 30 Z" fill="#F7C948" opacity="0.6" />
    {/* "GOLDEN BOOT" text arc would go here - using simple text instead */}
    <text x="60" y="105" textAnchor="middle" fill="#F7C948" fontSize="8" fontWeight="bold" fontFamily="Rajdhani, sans-serif" letterSpacing="2">GOLDEN BOOT</text>
    {/* Gradients */}
    <defs>
      <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#F7C948" />
        <stop offset="100%" stopColor="#F7C948" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1A1A2E" />
        <stop offset="100%" stopColor="#16213E" />
      </linearGradient>
      <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F7C948" />
        <stop offset="50%" stopColor="#F7C948" />
        <stop offset="100%" stopColor="#F7C948" />
      </linearGradient>
      <linearGradient id="bootGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F7C948" />
        <stop offset="50%" stopColor="#F7C948" />
        <stop offset="100%" stopColor="#F7C948" />
      </linearGradient>
    </defs>
  </svg>
)

const TrophyRoom = ({ userTeams = [], accent = { primary: '#F7C948', dark: '#D4A82E', rgba: '247,201,72' } }) => {
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Build trophies from userTeams
  const allTrophies = userTeams.flatMap(team => {
    const teamTrophies = (team.trophies || []).map(trophy => ({
      name: typeof trophy === 'string' ? trophy : trophy.name,
      season: typeof trophy === 'string' ? '' : trophy.season,
      type: typeof trophy === 'string' ? 'title' : (trophy.type || 'title'),
      teamName: team.name,
      teamId: team._id,
      leagueName: team.league?.name || 'League',
      sport: team.league?.sport || 'soccer',
      record: `${team.wins || 0}W-${team.draws || 0}D-${team.losses || 0}L`,
      position: team.position || 0,
    }))
    return teamTrophies
  })

  // Filter trophies based on selected category
  const filteredTrophies = selectedCategory === 'all'
    ? allTrophies
    : allTrophies.filter(t => t.type === selectedCategory)

  // Get rank badge based on position
  const getRankBadge = (position) => {
    if (position === 1) return '🥇 1st Place'
    if (position === 2) return '🥈 2nd Place'
    if (position === 3) return '🥉 3rd Place'
    return `${position}th Place`
  }

  // Share on Twitter/X
  const shareOnTwitter = (trophy) => {
    const tweetText = `🏆 Just won the ${trophy.name} with ${trophy.teamName} in @SamSportsGG! ${trophy.season} season. #SamSports #FantasySports`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank')
  }

  // Share on Facebook
  const shareOnFacebook = (trophy) => {
    const shareText = `🏆 Just won the ${trophy.name} with ${trophy.teamName} in @SamSportsGG! ${trophy.season} season. #SamSports`
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`, '_blank')
  }

  // Copy link to clipboard
  const copyToClipboard = (trophy) => {
    const shareText = `🏆 ${trophy.name} - ${trophy.teamName} (${trophy.season}) via @SamSportsGG #SamSports`
    navigator.clipboard.writeText(shareText)
    notification.success({
      message: 'Copied!',
      description: 'Achievement copied to clipboard.',
      duration: 2,
    })
  }

  const C = { panel: '#0A0E17', line: 'rgba(233,231,223,0.09)', ivory: '#ECEAE3', platinum: '#AEB6C4', muted: '#69748B', gold: '#F7C948' }
  const th = (txt, i) => (
    <th key={i} style={{ fontSize: 10, letterSpacing: '0.13em', textTransform: 'uppercase', color: C.muted, fontWeight: 600, textAlign: i === 0 ? 'left' : 'right', padding: '12px 16px', borderBottom: `1px solid ${C.line}` }}>{txt}</th>
  )
  return (
    <div style={{ minHeight: 200 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: C.ivory, margin: 0 }}>Trophy Cabinet</h2>
          <p style={{ fontSize: 12.5, color: C.muted, margin: '4px 0 0', letterSpacing: '0.04em' }}>Championship history across all franchises</p>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.gold, background: 'rgba(247,201,72,0.12)', border: '1px solid rgba(247,201,72,0.3)', borderRadius: 8, padding: '6px 12px' }}>
          {filteredTrophies.length} {filteredTrophies.length !== 1 ? 'Trophies' : 'Trophy'}
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TROPHY_CATEGORIES.map(category => {
          const on = selectedCategory === category.id
          return (
            <button key={category.id} onClick={() => setSelectedCategory(category.id)}
              style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, letterSpacing: '0.03em', cursor: 'pointer',
                background: on ? 'rgba(247,201,72,0.14)' : 'transparent', color: on ? C.gold : C.platinum,
                border: `1px solid ${on ? 'rgba(247,201,72,0.45)' : C.line}` }}>
              {category.label}
            </button>
          )
        })}
      </div>

      {/* Holdings-style panel + table */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, overflow: 'hidden' }}>
        {filteredTrophies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px', color: C.muted, fontSize: 13.5 }}>
            No trophies yet — compete in your leagues to earn championships and awards.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Trophy', 'Type', 'Franchise', 'League', 'Season', 'Record', 'Finish', ''].map(th)}</tr>
            </thead>
            <tbody>
              {filteredTrophies.map((trophy, index) => (
                <tr key={`${trophy.teamId}-${index}`} style={{ borderBottom: '1px solid rgba(233,231,223,0.06)' }}>
                  <td style={{ padding: '13px 16px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{TROPHY_ICONS[trophy.type] || TROPHY_ICONS.default}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: C.ivory }}>{trophy.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px', textAlign: 'right', fontSize: 12, color: C.platinum, textTransform: 'capitalize' }}>{(trophy.type || '').replace('_', ' ')}</td>
                  <td style={{ padding: '13px 16px', textAlign: 'right', fontSize: 13, color: C.gold, fontWeight: 600 }}>{trophy.teamName}</td>
                  <td style={{ padding: '13px 16px', textAlign: 'right', fontSize: 12.5, color: C.platinum }}>{trophy.leagueName}</td>
                  <td style={{ padding: '13px 16px', textAlign: 'right', fontSize: 12.5, color: C.platinum }}>{trophy.season || '—'}</td>
                  <td style={{ padding: '13px 16px', textAlign: 'right', fontSize: 12.5, color: C.ivory, fontVariantNumeric: 'tabular-nums' }}>{trophy.record}</td>
                  <td style={{ padding: '13px 16px', textAlign: 'right', fontSize: 12.5, color: C.gold }}>{trophy.position ? getRankBadge(trophy.position) : '—'}</td>
                  <td style={{ padding: '13px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button onClick={() => copyToClipboard(trophy)} style={{ fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(247,201,72,0.4)', background: 'transparent', color: C.gold, cursor: 'pointer' }}>Share</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default TrophyRoom
