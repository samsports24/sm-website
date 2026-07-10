import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { cancelTrade, getPendingTrade } from '../../redux/actions/teamTradeAction'
import { Button, Tag, Spin, notification, Empty, Progress, Tooltip } from 'antd'
import {
  SwapOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  ClockCircleOutlined,
  RobotOutlined,
  DollarOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { positions } from '../../config/constants'
import TradeShareCard from '../../components/TradeShareCard'

function mapPosition(position) {
  return positions[position] || position
}

const getStatusConfig = (status) => {
  switch (status) {
    case 'pending':
      return { color: '#f59e0b', icon: <ClockCircleOutlined />, label: 'PENDING' }
    case 'approved':
      return { color: '#22c55e', icon: <CheckCircleOutlined />, label: 'APPROVED' }
    case 'denied':
    case 'rejected':
      return { color: '#ef4444', icon: <CloseCircleOutlined />, label: 'REJECTED' }
    case 'countered':
      return { color: '#3b82f6', icon: <SwapOutlined />, label: 'COUNTERED' }
    default:
      return { color: 'rgba(255,255,255,0.4)', icon: <ClockCircleOutlined />, label: status?.toUpperCase() || 'UNKNOWN' }
  }
}

const getVerdictColor = (verdict) => {
  if (verdict === 'fair') return '#22c55e'
  if (verdict === 'slightly_unfair') return '#f59e0b'
  if (verdict === 'unfair') return '#ef4444'
  return '#dc2626'
}
const getVerdictLabel = (verdict) => {
  if (verdict === 'fair') return 'FAIR'
  if (verdict === 'slightly_unfair') return 'SLIGHT EDGE'
  if (verdict === 'unfair') return 'UNFAIR'
  return 'LOPSIDED'
}
const getVerdictIcon = (verdict) => {
  if (verdict === 'fair') return <CheckCircleOutlined />
  if (verdict === 'slightly_unfair') return <WarningOutlined />
  if (verdict === 'unfair') return <ExclamationCircleOutlined />
  return <StopOutlined />
}

const PendingTrade = ({ tab }) => {
  const [loading, setLoading] = useState('main')
  const [pendingTrade, setPendingTrade] = useState([])
  const [cancellingId, setCancellingId] = useState(null)
  const leagueName = useSelector((state) => state.league?.currentLeague?.name || '')

  const navigate = useNavigate()

  useEffect(() => {
    getData()
  }, [tab])

  const getData = async () => {
    setLoading('main')
    const res = await getPendingTrade({})
    if (res) {
      setPendingTrade(res)
    }
    setLoading('')
  }

  const handleCancelTrade = async (id) => {
    setCancellingId(id)
    const res = await cancelTrade({ tradeId: id })
    if (res) {
      notification.success({ message: res, duration: 3 })
      getData()
    }
    setCancellingId(null)
  }

  if (loading === 'main') {
    return (
      <div className='pending-loading'>
        <Spin size='large' />
      </div>
    )
  }

  if (!pendingTrade || pendingTrade.length === 0) {
    return (
      <div className='pending-empty'>
        <Empty
          description={<span style={{ color: 'rgba(255,255,255,0.3)' }}>No pending trades</span>}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    )
  }

  return (
    <div className='pending-trades-list'>
      {pendingTrade.map((trade) => {
        const statusCfg = getStatusConfig(trade?.status)
        const ai = trade?.aiAnalysis
        const hasAi = ai && ai.fairnessScore != null
        const createdAt = trade?.createdAt ? new Date(trade.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

        return (
          <div key={trade._id} className='pending-trade-card'>
            {/* Card Header */}
            <div className='pending-card-header'>
              <div className='pending-card-header-left'>
                <Tag
                  icon={statusCfg.icon}
                  style={{
                    background: `${statusCfg.color}15`,
                    borderColor: `${statusCfg.color}40`,
                    color: statusCfg.color,
                    fontWeight: 700,
                    fontSize: 10,
                    letterSpacing: '0.5px',
                  }}
                >
                  {statusCfg.label}
                </Tag>
                {hasAi && (
                  <Tag
                    icon={getVerdictIcon(ai.verdict)}
                    style={{
                      background: `${getVerdictColor(ai.verdict)}15`,
                      borderColor: `${getVerdictColor(ai.verdict)}40`,
                      color: getVerdictColor(ai.verdict),
                      fontWeight: 700,
                      fontSize: 10,
                    }}
                  >
                    {getVerdictLabel(ai.verdict)}
                  </Tag>
                )}
                {ai?.flaggedForReview && (
                  <Tag color='red' style={{ fontWeight: 700, fontSize: 10 }}>
                    <ExclamationCircleOutlined /> FLAGGED
                  </Tag>
                )}
              </div>
              <span className='pending-card-date'>{createdAt}</span>
            </div>

            {/* Trade Sides */}
            <div className='pending-card-body'>
              {/* Buyer / Team One */}
              <div className='pending-card-side'>
                <div className='pending-side-header'>
                  <h3>{trade?.buyer?.team?.name || 'Team One'}</h3>
                  <span className='pending-side-tag pending-side-tag-give'>GIVES</span>
                </div>

                {/* Players */}
                {trade?.buyer?.players?.length > 0 && (
                  <div className='pending-side-assets'>
                    {trade.buyer.players.map((p, i) => (
                      <div key={i} className='pending-asset-chip'>
                        <span className='pending-asset-pos'>{mapPosition(p?.Position)}</span>
                        <span className='pending-asset-name'>{p?.Name}</span>
                        <span className='pending-asset-cap'>{(p?.currentYearSalaryCap || 0).toLocaleString()} SP</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Draft Picks */}
                {trade?.buyer?.drafts?.length > 0 && (
                  <div className='pending-side-assets'>
                    {trade.buyer.drafts.map((d, i) => (
                      <div key={i} className='pending-asset-chip pending-asset-draft'>
                        <span>{`${d?.season}' ${d?.team?.name || ''} Rd ${d?.round}`}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* SAM Points */}
                {trade?.buyer?.samPoints > 0 && (
                  <div className='pending-side-sam'>
                    <DollarOutlined /> {trade.buyer.samPoints.toLocaleString()} SAM Points
                  </div>
                )}

                {(!trade?.buyer?.players?.length && !trade?.buyer?.drafts?.length && !trade?.buyer?.samPoints) && (
                  <div className='pending-side-empty'>No assets</div>
                )}
              </div>

              {/* Swap icon */}
              <div className='pending-card-swap'>
                <SwapOutlined />
              </div>

              {/* Seller / Team Two */}
              <div className='pending-card-side'>
                <div className='pending-side-header'>
                  <h3>{trade?.seller?.team?.name || 'Team Two'}</h3>
                  <span className='pending-side-tag pending-side-tag-get'>GIVES</span>
                </div>

                {/* Players */}
                {trade?.seller?.players?.length > 0 && (
                  <div className='pending-side-assets'>
                    {trade.seller.players.map((p, i) => (
                      <div key={i} className='pending-asset-chip'>
                        <span className='pending-asset-pos'>{mapPosition(p?.Position)}</span>
                        <span className='pending-asset-name'>{p?.Name}</span>
                        <span className='pending-asset-cap'>{(p?.currentYearSalaryCap || 0).toLocaleString()} SP</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Draft Picks */}
                {trade?.seller?.drafts?.length > 0 && (
                  <div className='pending-side-assets'>
                    {trade.seller.drafts.map((d, i) => (
                      <div key={i} className='pending-asset-chip pending-asset-draft'>
                        <span>{`${d?.season}' ${d?.team?.name || ''} Rd ${d?.round}`}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* SAM Points */}
                {trade?.seller?.samPoints > 0 && (
                  <div className='pending-side-sam'>
                    <DollarOutlined /> {trade.seller.samPoints.toLocaleString()} SAM Points
                  </div>
                )}

                {(!trade?.seller?.players?.length && !trade?.seller?.drafts?.length && !trade?.seller?.samPoints) && (
                  <div className='pending-side-empty'>No assets</div>
                )}
              </div>
            </div>

            {/* AI Score Bar (if available) */}
            {hasAi && (
              <div className='pending-card-ai'>
                <RobotOutlined style={{ color: '#a5b4fc', fontSize: 12 }} />
                <span className='pending-ai-label'>AI Score</span>
                <div className='pending-ai-bar-track'>
                  <div
                    className='pending-ai-bar-fill'
                    style={{
                      width: `${ai.fairnessScore}%`,
                      background: getVerdictColor(ai.verdict),
                    }}
                  />
                </div>
                <span className='pending-ai-score' style={{ color: getVerdictColor(ai.verdict) }}>
                  {ai.fairnessScore}
                </span>
              </div>
            )}

            {/* Card Footer / Actions */}
            <div className='pending-card-footer'>
              <TradeShareCard
                trade={{ ...trade, leagueName }}
                sport="football"
              />
              {trade?.status === 'pending' && (
                <Button
                  danger
                  size='small'
                  icon={<CloseCircleOutlined />}
                  className='pending-cancel-btn'
                  onClick={() => handleCancelTrade(trade._id)}
                  loading={cancellingId === trade._id}
                >
                  Cancel Trade
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PendingTrade
