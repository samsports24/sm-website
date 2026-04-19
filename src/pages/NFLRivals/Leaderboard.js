import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Spin, Empty } from 'antd'
import { StarOutlined } from '@ant-design/icons'
import { privateAPI, attachToken } from '../../config/constants'
import './nfl-rivals.css'
import { DIVISIONS as DIVISION_NAMES, DIVISION_COLORS } from './rivalsConfig'

const Leaderboard = () => {
  const token = useSelector(s => s.user.token)
  const user = useSelector(s => s.user.user)
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        attachToken()
        const { data } = await privateAPI.get('/nfl-rivals/leaderboard')
        setEntries(data.data?.leaderboard || data.data?.entries || [])
      } catch (err) { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [token])

  if (loading) return <div className="nflr-loading"><Spin size="large" /></div>

  const userId = user ? (user._id || user.id) : null

  return (
    <div className="nflr-page">
      <h2 className="nflr-page-title"><StarOutlined /> Global Leaderboard</h2>
      {entries.length > 0 ? (
        <div style={{
          background: 'rgba(20,28,45,0.6)', border: '1px solid rgba(110,105,128,0.15)',
          borderRadius: 16, padding: 20,
        }}>
          <div style={{
            display: 'flex', padding: '8px 12px', fontSize: 11, fontWeight: 700,
            color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
            fontFamily: "'Rajdhani', sans-serif",
          }}>
            <span style={{ width: 40 }}>#</span>
            <span style={{ flex: 1 }}>Manager</span>
            <span style={{ width: 120 }}>Division</span>
            <span style={{ width: 60, textAlign: 'center' }}>W</span>
            <span style={{ width: 60, textAlign: 'center' }}>L</span>
            <span style={{ width: 80, textAlign: 'right' }}>Career Pts</span>
          </div>
          {entries.map((e, idx) => {
            const entryUserId = e.user ? (e.user._id || e.user) : null
            const isMe = userId && entryUserId && String(userId) === String(entryUserId)
            const div = e.division || 4
            const divColor = DIVISION_COLORS[div] || '#8b5cf6'
            return (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', padding: '10px 12px',
                borderRadius: 10, marginBottom: 4,
                background: isMe ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.02)',
                border: isMe ? '1px solid rgba(167,139,250,0.25)' : '1px solid transparent',
              }}>
                <span style={{ width: 40, fontWeight: 700, color: idx < 3 ? '#ffd700' : '#A78BFA' }}>{idx + 1}</span>
                <span style={{ flex: 1, fontWeight: 500, color: '#e2e8f0' }}>
                  {e.teamName || (e.user && e.user.username) || 'Manager'}
                  {isMe && <span style={{ color: '#A78BFA', fontSize: 11, marginLeft: 6 }}>(You)</span>}
                </span>
                <span style={{ width: 120, fontSize: 12, color: divColor, fontWeight: 600 }}>
                  {DIVISION_NAMES[div] || `Div ${div}`}
                </span>
                <span style={{ width: 60, textAlign: 'center', color: '#4ade80' }}>{e.careerStats?.wins || e.wins || 0}</span>
                <span style={{ width: 60, textAlign: 'center', color: '#ef4444' }}>{e.careerStats?.losses || e.losses || 0}</span>
                <span style={{ width: 80, textAlign: 'right', fontWeight: 700, color: '#A78BFA' }}>
                  {(e.careerStats?.totalPoints || e.totalPoints || 0).toFixed(1)}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <Empty description="Leaderboard will populate once the season starts" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  )
}

export default Leaderboard
