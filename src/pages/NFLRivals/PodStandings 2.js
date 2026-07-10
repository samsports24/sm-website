import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Spin, Empty } from 'antd'
import { FireOutlined } from '@ant-design/icons'
import { privateAPI, attachToken } from '../../config/constants'
import './nfl-rivals.css'

const PodStandings = () => {
  const token = useSelector(s => s.user.token)
  const user = useSelector(s => s.user.user)
  const [loading, setLoading] = useState(true)
  const [pod, setPod] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        attachToken()
        const { data } = await privateAPI.get('/nfl-rivals/pod')
        setPod(data.data?.pod || null)
      } catch (err) { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [token])

  if (loading) return <div className="nflr-loading"><Spin size="large" /></div>

  const members = (pod && pod.members) || []
  const userId = user ? (user._id || user.id) : null

  return (
    <div className="nflr-page">
      <h2 className="nflr-page-title"><FireOutlined /> Pod Standings</h2>
      {pod ? (
        <div style={{
          background: 'rgba(20,28,45,0.6)', border: '1px solid rgba(110,105,128,0.15)',
          borderRadius: 16, padding: 20,
        }}>
          <div style={{ marginBottom: 16, color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
            Pod {pod.podNumber} · {members.length} managers
          </div>

          {/* Header */}
          <div style={{
            display: 'flex', padding: '8px 12px', fontSize: 11, fontWeight: 700,
            color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 0.5,
            fontFamily: "'Rajdhani', sans-serif",
          }}>
            <span style={{ width: 32 }}>#</span>
            <span style={{ flex: 1 }}>Manager</span>
            <span style={{ width: 60, textAlign: 'center' }}>W</span>
            <span style={{ width: 60, textAlign: 'center' }}>D</span>
            <span style={{ width: 60, textAlign: 'center' }}>L</span>
            <span style={{ width: 80, textAlign: 'right' }}>Points</span>
          </div>

          {members.map((m, idx) => {
            const memberId = m.user ? (m.user._id || m.user) : null
            const isMe = userId && memberId && String(userId) === String(memberId)
            const isPromo = idx < 3
            const isRele = idx >= members.length - 3

            return (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', padding: '10px 12px',
                borderRadius: 10, marginBottom: 4,
                background: isMe ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.02)',
                border: isMe ? '1px solid rgba(167,139,250,0.25)' : '1px solid transparent',
                borderLeft: isPromo ? '3px solid #4ade80' : isRele ? '3px solid #ef4444' : '3px solid transparent',
              }}>
                <span style={{ width: 32, fontWeight: 700, color: '#A78BFA' }}>{idx + 1}</span>
                <span style={{ flex: 1, fontWeight: 500, color: '#e2e8f0' }}>
                  {(m.user && (m.user.userName || m.user.username)) || (m.entry && m.entry.teamName) || m.username || 'Manager'}
                  {isMe && <span style={{ color: '#A78BFA', fontSize: 11, marginLeft: 6 }}>(You)</span>}
                </span>
                <span style={{ width: 60, textAlign: 'center', color: '#4ade80', fontWeight: 600 }}>{m.wins || 0}</span>
                <span style={{ width: 60, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>{m.draws || 0}</span>
                <span style={{ width: 60, textAlign: 'center', color: '#ef4444', fontWeight: 600 }}>{m.losses || 0}</span>
                <span style={{ width: 80, textAlign: 'right', fontWeight: 700, color: '#A78BFA' }}>{(m.totalPoints || 0).toFixed(1)}</span>
              </div>
            )
          })}

          <div style={{ display: 'flex', gap: 20, marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            <span><span style={{ color: '#4ade80' }}>■</span> Promotion zone (top 3)</span>
            <span><span style={{ color: '#ef4444' }}>■</span> Relegation zone (bottom 3)</span>
          </div>
        </div>
      ) : (
        <Empty description="No pod assigned yet. Build your roster to get placed." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  )
}

export default PodStandings
