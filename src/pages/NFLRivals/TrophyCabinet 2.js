import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Spin, Empty } from 'antd'
import { TrophyOutlined } from '@ant-design/icons'
import { privateAPI, attachToken } from '../../config/constants'
import './nfl-rivals.css'

const TROPHY_DEFS = {
  division_trophy: { icon: '🏆', name: 'Division Champion', desc: 'Won your division' },
  giant_killer: { icon: '⚔️', name: 'Giant Killer', desc: 'Beat a team from a higher division' },
  wonderkid_whisperer: { icon: '🌟', name: 'Scout Master', desc: 'Had 5+ rookies score big' },
  the_invincible: { icon: '🛡️', name: 'The Invincible', desc: 'Unbeaten in a season' },
  gridiron_elite: { icon: '👑', name: 'Gridiron Elite', desc: 'Reached Division 1' },
}

const TrophyCabinet = () => {
  const token = useSelector(s => s.user.token)
  const [loading, setLoading] = useState(true)
  const [trophies, setTrophies] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        attachToken()
        const { data } = await privateAPI.get('/nfl-rivals/trophies')
        setTrophies(data.data?.trophies || [])
      } catch (err) { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [token])

  if (loading) return <div className="nflr-loading"><Spin size="large" /></div>

  const allTrophyKeys = Object.keys(TROPHY_DEFS)
  const earnedKeys = trophies.map(t => t.type || t)

  return (
    <div className="nflr-page">
      <h2 className="nflr-page-title"><TrophyOutlined /> Trophy Cabinet</h2>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16,
      }}>
        {allTrophyKeys.map(key => {
          const def = TROPHY_DEFS[key]
          const unlocked = earnedKeys.includes(key)
          const trophy = trophies.find(t => (t.type || t) === key)
          return (
            <div key={key} style={{
              background: 'rgba(20,28,45,0.6)',
              border: unlocked ? '1px solid rgba(167,139,250,0.4)' : '1px solid rgba(110,105,128,0.15)',
              borderRadius: 16, padding: '28px 18px 20px', textAlign: 'center',
              opacity: unlocked ? 1 : 0.4,
              filter: unlocked ? 'none' : 'grayscale(0.6)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{def.icon}</div>
              <div style={{
                fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700,
                color: unlocked ? '#A78BFA' : 'rgba(255,255,255,0.5)',
              }}>{def.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{def.desc}</div>
              {unlocked && trophy && trophy.season && (
                <div style={{
                  marginTop: 8, fontSize: 11, color: '#A78BFA',
                  background: 'rgba(167,139,250,0.1)', padding: '2px 10px',
                  borderRadius: 6, display: 'inline-block',
                }}>
                  {trophy.season}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {trophies.length === 0 && (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px 0', marginTop: 20 }}>
          No trophies earned yet. Compete in seasons to earn badges!
        </div>
      )}
    </div>
  )
}

export default TrophyCabinet
