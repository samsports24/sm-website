import React, { useState } from 'react'
import { notification } from 'antd'

const TROPHY_ICONS = {
  title: '🏆',
  conference: '🏅',
  playoff: '⭐',
  award: '🎖️',
  record: '📊',
  default: '🏆',
}

const TROPHY_CATEGORIES = [
  { id: 'all', label: 'All Trophies' },
  { id: 'title', label: 'League Titles' },
  { id: 'conference', label: 'Conference Titles' },
  { id: 'playoff', label: 'Playoff Wins' },
  { id: 'award', label: 'Season Awards' },
  { id: 'record', label: 'Records' },
]

const TrophyRoom = ({ userTeams = [], accent = { primary: '#D4A843', dark: '#B8922E', rgba: '212,168,67' } }) => {
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

  return (
    <div style={{ minHeight: '200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white',
            margin: 0,
            fontFamily: 'Rajdhani, sans-serif',
          }}>
            🏆 Trophy Cabinet
          </h1>
          <div style={{
            backgroundColor: `rgba(${accent.rgba}, 0.2)`,
            border: `1px solid ${accent.primary}`,
            borderRadius: '20px',
            padding: '8px 16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: accent.primary,
            fontFamily: 'Rajdhani, sans-serif',
          }}>
            {filteredTrophies.length} {filteredTrophies.length !== 1 ? 'Trophies' : 'Trophy'}
          </div>
        </div>
        <p style={{
          fontSize: '16px',
          color: '#9CA3AF',
          margin: 0,
          fontFamily: 'Inter, sans-serif',
        }}>
          Your championship history across all sports
        </p>
      </div>

      {/* Category Filter Pills */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '40px',
        flexWrap: 'wrap',
      }}>
        {TROPHY_CATEGORIES.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: selectedCategory === category.id
                ? accent.primary
                : 'rgba(255,255,255,0.1)',
              color: selectedCategory === category.id
                ? '#1F2937'
                : '#E5E7EB',
              border: selectedCategory === category.id
                ? `1px solid ${accent.primary}`
                : '1px solid rgba(255,255,255,0.2)',
            }}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Trophy Cards Grid */}
      {filteredTrophies.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 32px',
          color: '#9CA3AF',
          fontFamily: 'Inter, sans-serif',
          fontSize: '18px',
        }}>
          <p style={{ margin: '16px 0' }}>
            🏆 No trophies yet, compete in your leagues to earn championships and awards!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '24px',
        }}>
          {filteredTrophies.map((trophy, index) => (
            <div
              key={`${trophy.teamId}-${index}`}
              style={{
                backgroundColor: 'rgba(20,28,45,0.6)',
                borderRadius: '16px',
                border: `1px solid rgba(${accent.rgba}, 0.3)`,
                padding: '24px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(20,28,45,0.8)'
                e.currentTarget.style.borderColor = `rgba(${accent.rgba}, 0.6)`
                e.currentTarget.style.boxShadow = `0 0 20px rgba(${accent.rgba}, 0.3)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(20,28,45,0.6)'
                e.currentTarget.style.borderColor = `rgba(${accent.rgba}, 0.3)`
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Trophy Icon */}
              <div style={{
                fontSize: '56px',
                marginBottom: '16px',
                textAlign: 'center',
              }}>
                {TROPHY_ICONS[trophy.type] || TROPHY_ICONS.default}
              </div>

              {/* Trophy Name */}
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'white',
                margin: '0 0 8px 0',
                fontFamily: 'Rajdhani, sans-serif',
              }}>
                {trophy.name}
              </h3>

              {/* League & Season */}
              <p style={{
                fontSize: '14px',
                color: '#9CA3AF',
                margin: '0 0 16px 0',
                fontFamily: 'Inter, sans-serif',
              }}>
                {trophy.leagueName} {trophy.season ? `• ${trophy.season}` : ''}
              </p>

              {/* Team Name */}
              <p style={{
                fontSize: '16px',
                color: accent.primary,
                fontWeight: 'bold',
                margin: '0 0 12px 0',
                fontFamily: 'Rajdhani, sans-serif',
              }}>
                {trophy.teamName}
              </p>

              {/* Season Record */}
              <p style={{
                fontSize: '13px',
                color: '#D1D5DB',
                margin: '0',
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '0.5px',
              }}>
                Record: {trophy.record}
              </p>

              {/* Rank Badge */}
              <div style={{
                display: 'inline-block',
                marginTop: '12px',
                padding: '6px 12px',
                backgroundColor: `rgba(${accent.rgba}, 0.15)`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: accent.primary,
                fontFamily: 'Rajdhani, sans-serif',
              }}>
                {getRankBadge(trophy.position)}
              </div>

              {/* Share Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '20px',
                justifyContent: 'center',
              }}>
                {/* Twitter Share */}
                <button
                  onClick={() => shareOnTwitter(trophy)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#1DA1F2',
                    color: 'white',
                    cursor: 'pointer',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a8cd8'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1DA1F2'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  𝕏 Share
                </button>

                {/* Facebook Share */}
                <button
                  onClick={() => shareOnFacebook(trophy)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#4267B2',
                    color: 'white',
                    cursor: 'pointer',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#365899'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#4267B2'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  📘 Share
                </button>

                {/* Copy Link */}
                <button
                  onClick={() => copyToClipboard(trophy)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: accent.primary,
                    color: '#1F2937',
                    cursor: 'pointer',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = accent.dark
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = accent.primary
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  🔗 Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TrophyRoom
