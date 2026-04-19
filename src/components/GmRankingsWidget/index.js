import React, { useState, useEffect } from 'react'
import { Spin, Empty, Tabs, Tooltip } from 'antd'
import { TrophyOutlined, CrownOutlined } from '@ant-design/icons'
import { privateAPI, attachToken } from '../../config/constants'

const SOCCER_API = process.env.REACT_APP_SOCCER_API || 'https://soccerbackend.samsports.io/api'

const medalColors = {
  1: { bg: 'linear-gradient(135deg, #FFD700, #FFA000)', text: '#fff', border: '#FFD700' },
  2: { bg: 'linear-gradient(135deg, #E8E8E8, #B0B0B0)', text: '#333', border: '#C0C0C0' },
  3: { bg: 'linear-gradient(135deg, #CD7F32, #8B5A2B)', text: '#fff', border: '#CD7F32' },
}

const gradeColors = {
  S: '#FFD700',
  A: '#22C55E',
  B: '#3B82F6',
  C: '#F59E0B',
  D: '#EF4444',
  F: '#6B7280',
}

const RankRow = ({ entry, isMe }) => {
  const medal = medalColors[entry.rank]
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: 8,
        marginBottom: 4,
        background: isMe ? 'rgba(59,130,246,0.12)' : entry.rank <= 3 ? 'rgba(255,215,0,0.05)' : 'transparent',
        border: isMe ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
        transition: 'background 0.15s',
      }}
    >
      {/* Rank */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: medal ? 14 : 12,
          color: medal ? medal.text : '#94A3B8',
          background: medal ? medal.bg : 'rgba(148,163,184,0.1)',
          border: medal ? `2px solid ${medal.border}` : '1px solid rgba(148,163,184,0.2)',
          flexShrink: 0,
        }}
      >
        {entry.rank <= 3 ? <CrownOutlined /> : entry.rank}
      </div>

      {/* Avatar + Name */}
      <div style={{ flex: 1, marginLeft: 10, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {entry.userName}
          {isMe && <span style={{ marginLeft: 6, fontSize: 10, color: '#3B82F6', fontWeight: 600 }}>YOU</span>}
        </div>
        <div style={{ fontSize: 10, color: '#64748B' }}>
          {entry.leagueCount} league{entry.leagueCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Grade */}
      <Tooltip title={`Rating: ${entry.overallRating}`}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: 13,
            color: gradeColors[entry.grade] || '#94A3B8',
            background: `${gradeColors[entry.grade] || '#94A3B8'}15`,
            border: `1px solid ${gradeColors[entry.grade] || '#94A3B8'}40`,
            marginRight: 8,
            flexShrink: 0,
          }}
        >
          {entry.grade}
        </div>
      </Tooltip>

      {/* Score */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: '#E2E8F0' }}>
          {entry.overallRating?.toFixed(1)}
        </div>
      </div>
    </div>
  )
}

const GmRankingsWidget = ({ style }) => {
  const [nflRankings, setNflRankings] = useState(null)
  const [soccerRankings, setSoccerRankings] = useState(null)
  const [nflLoading, setNflLoading] = useState(true)
  const [soccerLoading, setSoccerLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('nfl')

  useEffect(() => {
    const fetchNfl = async () => {
      try {
        const headers = attachToken()
        const { data } = await privateAPI.get('/ranking/gm-rankings/global', { headers })
        setNflRankings(data?.data || data)
      } catch (e) { /* ignore */ }
      setNflLoading(false)
    }
    fetchNfl()
  }, [])

  useEffect(() => {
    const fetchSoccer = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token')
        const { data } = await privateAPI.get(`${SOCCER_API}/leagues/gm-rankings/global`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        setSoccerRankings(data?.data || data)
      } catch (e) { /* ignore */ }
      setSoccerLoading(false)
    }
    fetchSoccer()
  }, [])

  const renderRankings = (rankings, loading) => {
    if (loading) return <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
    if (!rankings?.rankings?.length) return <Empty description="No rankings yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />

    return (
      <div style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
        {rankings.rankings.map((entry) => (
          <RankRow
            key={entry.userId}
            entry={entry}
            isMe={rankings.myRank && String(entry.userId) === String(rankings.myRank.userId)}
          />
        ))}

        {/* Show user's rank if not in top 100 */}
        {rankings.myRank && rankings.myRank.rank > 100 && (
          <>
            <div style={{ textAlign: 'center', color: '#475569', fontSize: 12, padding: '8px 0' }}>• • •</div>
            <RankRow entry={rankings.myRank} isMe={true} />
          </>
        )}
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
        borderRadius: 16,
        border: '1px solid rgba(148,163,184,0.1)',
        padding: '16px',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <TrophyOutlined style={{ fontSize: 20, color: '#FFD700', marginRight: 8 }} />
        <span style={{ fontWeight: 800, fontSize: 16, color: '#E2E8F0' }}>Top 100 GMs</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#475569' }}>
          {nflRankings?.total || soccerRankings?.total || 0} total
        </span>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="small"
        items={[
          {
            key: 'nfl',
            label: '🏈 A.Football',
            children: renderRankings(nflRankings, nflLoading),
          },
          {
            key: 'soccer',
            label: '⚽ Soccer',
            children: renderRankings(soccerRankings, soccerLoading),
          },
        ]}
        style={{ color: '#E2E8F0' }}
      />
    </div>
  )
}

export default GmRankingsWidget
