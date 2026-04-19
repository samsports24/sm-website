import React, { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Spin, notification } from 'antd'
import { getGmRatings } from '../redux/actions/leagueActions'
import Header from '../components/Header'

const GMChallenge = () => {
  const SETTING = useSelector((state) => state.user?.setting)
  const currentUser = useSelector((state) => state.user?.userDetails)
  const currentLeagueId = currentUser?.team?.currentLeague?._id
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('league') // 'league' or 'global'

  useEffect(() => {
    fetchRatings()
  }, [SETTING?.week, currentLeagueId])

  const fetchRatings = async () => {
    setLoading(true)
    try {
      const data = await getGmRatings(SETTING?.week)
      setRatings(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load GM ratings:', err)
    }
    setLoading(false)
  }

  const currentUserRank = useMemo(() => {
    if (!currentUser?._id || !Array.isArray(ratings)) return null
    const idx = ratings.findIndex((r) =>
      String(r.userId || r.user?._id || r._id) === String(currentUser._id)
    )
    return idx >= 0 ? idx + 1 : null
  }, [ratings, currentUser])

  const handleShare = (platform) => {
    const rank = currentUserRank || '?'
    const team = currentUser?.team?.name || 'My Team'
    const text = `I'm ranked #${rank} in the GM Challenge on SamSports! My team "${team}" is climbing the ranks. Can you beat me? #SamSports #GMChallenge #FantasyFootball`
    const url = 'https://samsports.io'

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank')
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(`${text}\n${url}`)
      notification.success({ message: 'Copied to clipboard!', duration: 2 })
    }
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', label: '1st', emoji: '🥇' }
    if (rank === 2) return { bg: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)', label: '2nd', emoji: '🥈' }
    if (rank === 3) return { bg: 'linear-gradient(135deg, #CD7F32, #A0522D)', label: '3rd', emoji: '🥉' }
    return { bg: 'rgba(255,255,255,0.06)', label: `#${rank}`, emoji: '' }
  }

  return (
    <div className="pro_league_container">
      <Header />

      <div style={{ padding: '24px 20px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(16,185,129,0.04))',
          border: '1px solid rgba(34,197,94,0.15)',
          borderRadius: 16,
          padding: '32px 28px',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
                GM Challenge
              </div>
              <h1 style={{
                color: '#fff', fontFamily: "'Rajdhani', sans-serif",
                fontSize: 28, fontWeight: 800, margin: '0 0 8px',
              }}>
                {currentUserRank ? `You're Ranked #${currentUserRank}` : 'Rise to the Top'}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0, maxWidth: 500 }}>
                Compete against GMs across the platform. Your decisions on drafts, trades, and lineup management determine your ranking.
              </p>
            </div>

            {/* Share Buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => handleShare('twitter')} style={{
                background: 'rgba(29,155,240,0.15)', border: '1px solid rgba(29,155,240,0.3)',
                color: '#1DA1F2', borderRadius: 10, padding: '10px 16px', fontSize: 12,
                fontWeight: 700, cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: 0.5, textTransform: 'uppercase', transition: 'all 0.2s',
              }}>
                Share on X
              </button>
              <button onClick={() => handleShare('facebook')} style={{
                background: 'rgba(24,119,242,0.15)', border: '1px solid rgba(24,119,242,0.3)',
                color: '#1877F2', borderRadius: 10, padding: '10px 16px', fontSize: 12,
                fontWeight: 700, cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: 0.5, textTransform: 'uppercase', transition: 'all 0.2s',
              }}>
                Share on Facebook
              </button>
              <button onClick={() => handleShare('copy')} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', borderRadius: 10, padding: '10px 16px', fontSize: 12,
                fontWeight: 700, cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: 0.5, textTransform: 'uppercase', transition: 'all 0.2s',
              }}>
                Copy Link
              </button>
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['league', 'global'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'linear-gradient(135deg, #22C55E, #16A34A)' : 'rgba(255,255,255,0.04)',
                color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.5)',
                border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: '10px 24px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
            >
              {tab === 'league' ? 'League Rankings' : 'Global Rankings'}
            </button>
          ))}
        </div>

        {/* Rankings Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
        ) : ratings.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
            <h3 style={{ color: '#fff', fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>
              Rankings Coming Soon
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
              GM ratings will be available once the season progresses. Keep making smart moves!
            </p>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 120px 120px 100px',
              padding: '14px 20px',
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              {['Rank', 'GM / Team', 'Rating', 'Record', 'Trend'].map((h) => (
                <span key={h} style={{
                  fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {ratings.map((entry, idx) => {
              const rank = idx + 1
              const badge = getRankBadge(rank)
              const isMe = String(entry.userId || entry.user?._id || entry._id) === String(currentUser?._id)
              return (
                <div
                  key={entry._id || idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 120px 120px 100px',
                    padding: '14px 20px',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: isMe ? 'rgba(34,197,94,0.06)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => { if (!isMe) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                  onMouseLeave={(e) => { if (!isMe) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: badge.bg, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: rank <= 3 ? 14 : 12,
                    fontWeight: 800, color: rank <= 3 ? '#000' : 'rgba(255,255,255,0.5)',
                    fontFamily: "'Rajdhani', sans-serif",
                  }}>
                    {badge.emoji || rank}
                  </div>

                  <div>
                    <div style={{
                      color: isMe ? '#22C55E' : '#fff',
                      fontWeight: 700, fontSize: 14,
                      fontFamily: "'Rajdhani', sans-serif",
                    }}>
                      {entry.teamName || entry.team?.name || 'Unknown'}
                      {isMe && <span style={{ fontSize: 10, marginLeft: 8, color: '#22C55E', opacity: 0.7 }}>YOU</span>}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
                      {entry.userName || entry.user?.name || ''}
                    </div>
                  </div>

                  <div style={{
                    fontSize: 16, fontWeight: 800, color: '#22C55E',
                    fontFamily: "'Rajdhani', sans-serif",
                  }}>
                    {entry.gmRating?.toFixed(1) || entry.rating?.toFixed(1) || '0.0'}
                  </div>

                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}>
                    {entry.record?.win || entry.wins || 0}-{entry.record?.lose || entry.losses || 0}-{entry.record?.tie || entry.ties || 0}
                  </div>

                  <div style={{
                    color: (entry.trend || 0) > 0 ? '#22C55E' : (entry.trend || 0) < 0 ? '#EF4444' : 'rgba(255,255,255,0.3)',
                    fontSize: 13, fontWeight: 700,
                  }}>
                    {(entry.trend || 0) > 0 ? `↑ +${entry.trend}` : (entry.trend || 0) < 0 ? `↓ ${entry.trend}` : '-'}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default GMChallenge
