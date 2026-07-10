import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Spin, Empty } from 'antd'
import { HistoryOutlined } from '@ant-design/icons'
import { privateAPI, attachToken } from '../../config/constants'
import './nfl-rivals.css'

const SeasonHistory = () => {
  const token = useSelector(s => s.user.token)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        attachToken()
        const { data } = await privateAPI.get('/nfl-rivals/history')
        setHistory(data.data?.seasons || data.data?.history || [])
      } catch (err) { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [token])

  if (loading) return <div className="nflr-loading"><Spin size="large" /></div>

  return (
    <div className="nflr-page">
      <h2 className="nflr-page-title"><HistoryOutlined /> Season History</h2>
      {history.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.map((s, idx) => (
            <div key={idx} style={{
              background: 'rgba(20,28,45,0.6)', border: '1px solid rgba(110,105,128,0.15)',
              borderRadius: 14, padding: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: '#A78BFA' }}>
                  {s.seasonName || s.name || `Season ${idx + 1}`}
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                  {s.divisionName || `Division ${s.division || '?'}`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 20, fontSize: 14 }}>
                <span><span style={{ color: '#4ade80', fontWeight: 700 }}>{s.wins || 0}</span> W</span>
                <span><span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>{s.draws || 0}</span> D</span>
                <span><span style={{ color: '#ef4444', fontWeight: 700 }}>{s.losses || 0}</span> L</span>
                <span style={{ marginLeft: 'auto', color: '#A78BFA', fontWeight: 700 }}>{(s.totalPoints || 0).toFixed(1)} pts</span>
              </div>
              {s.result && (
                <div style={{
                  marginTop: 8, fontSize: 12, fontWeight: 600,
                  color: s.result === 'promoted' ? '#4ade80' : s.result === 'relegated' ? '#ef4444' : '#A78BFA',
                }}>
                  {s.result === 'promoted' ? '↑ Promoted' : s.result === 'relegated' ? '↓ Relegated' : '→ Stayed'}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Empty description="No season history yet. Complete your first season!" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  )
}

export default SeasonHistory
