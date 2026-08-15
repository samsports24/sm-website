import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { notification, Modal } from 'antd'
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
  InboxOutlined,
  SendOutlined,
  EyeOutlined,
  RollbackOutlined,
  LockOutlined,
} from '@ant-design/icons'

import {
  approveTrade,
  cancelTrade,
  getPendingTrade,
  computeTradeWindow,
} from '../../redux/actions/teamTradeAction'
import { positions } from '../../config/constants'
import TradeShareCard from '../../components/TradeShareCard'

const mapPosition = (position) => positions[position] || position

// Human-readable time remaining until an expiry timestamp (real data only)
const formatRemaining = (expiresAt) => {
  if (!expiresAt) return null
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (Number.isNaN(ms)) return null
  if (ms <= 0) return 'Expired'
  const hrs = Math.floor(ms / 3600000)
  const days = Math.floor(hrs / 24)
  if (days >= 1) return `${days}d ${hrs % 24}h left`
  if (hrs >= 1) return `${hrs}h ${Math.floor((ms % 3600000) / 60000)}m left`
  return `${Math.max(1, Math.floor(ms / 60000))}m left`
}

const getStatusConfig = (status) => {
  switch (status) {
    case 'pending':
      return { color: '#f6c453', icon: <ClockCircleOutlined />, label: 'PENDING' }
    case 'approved':
      return { color: '#24d26c', icon: <CheckCircleOutlined />, label: 'ACCEPTED' }
    case 'denied':
    case 'rejected':
      return { color: '#ff5a5f', icon: <CloseCircleOutlined />, label: 'REJECTED' }
    case 'countered':
      return { color: '#3b82f6', icon: <SwapOutlined />, label: 'COUNTERED' }
    default:
      return { color: '#8a93a6', icon: <ClockCircleOutlined />, label: status?.toUpperCase() || 'UNKNOWN' }
  }
}

const getVerdictColor = (verdict) => {
  if (verdict === 'fair') return '#24d26c'
  if (verdict === 'slightly_unfair') return '#f6c453'
  if (verdict === 'unfair') return '#ff5a5f'
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

const PendingTrade = ({ tab, onGoNew }) => {
  const [loading, setLoading] = useState('main')
  const [pendingTrade, setPendingTrade] = useState([])
  const [busyId, setBusyId] = useState(null)
  const [filter, setFilter] = useState('all')

  const leagueName = useSelector((state) => state.league?.currentLeague?.name || '')
  const myTeamId = useSelector((state) => state.user?.userDetails?.team?._id)
  const currentLeague = useSelector((state) => state.league?.currentLeague)
  const currentWeek = useSelector((state) => state.user?.setting?.week)
  const navigate = useNavigate()

  // ── Trade window (deadline) — mirrors server guard: explicit date, else Week 8 ──
  const tradeWindow = computeTradeWindow(currentLeague, currentWeek)
  const tradeWindowOpen = tradeWindow.open

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const getData = async () => {
    setLoading('main')
    const res = await getPendingTrade({})
    if (res) setPendingTrade(res)
    setLoading('')
  }

  // Received = I'm the seller · Sent = I'm the buyer (the buyer created the offer)
  const directionOf = (trade) => {
    const buyerId = String(trade?.buyer?.team?._id || trade?.buyer?.team || '')
    return buyerId && String(myTeamId || '') === buyerId ? 'sent' : 'received'
  }

  const handleApprove = async (id) => {
    setBusyId(id + ':accept')
    const res = await approveTrade({ tradeId: id })
    if (res) {
      notification.success({ message: res, duration: 3 })
      getData()
    }
    setBusyId(null)
  }
  const handleReject = async (id, label) => {
    Modal.confirm({
      title: label || 'Reject this trade?',
      content: 'This will decline the offer. The other team will be notified.',
      okText: 'Yes, decline',
      okButtonProps: { danger: true },
      cancelText: 'Keep',
      onOk: async () => {
        setBusyId(id + ':reject')
        const res = await cancelTrade({ tradeId: id })
        if (res) {
          notification.success({ message: res, duration: 3 })
          getData()
        }
        setBusyId(null)
      },
    })
  }
  const goCounter = (id) => navigate('/counter-trade', { state: { tradeId: id } })

  // subfilter definitions — only statuses the backend actually provides
  const filters = useMemo(() => {
    const list = pendingTrade || []
    const isCommReview = (t) => t?.aiAnalysis?.flaggedForReview
    return [
      { key: 'all', label: 'All', icon: null, match: () => true },
      { key: 'received', label: 'Received', icon: <InboxOutlined />, match: (t) => directionOf(t) === 'received' },
      { key: 'sent', label: 'Sent', icon: <SendOutlined />, match: (t) => directionOf(t) === 'sent' },
      { key: 'review', label: 'Commissioner Review', icon: <ExclamationCircleOutlined />, match: isCommReview },
      { key: 'accepted', label: 'Accepted', icon: <CheckCircleOutlined />, match: (t) => t?.status === 'approved' },
      {
        key: 'rejected',
        label: 'Rejected',
        icon: <CloseCircleOutlined />,
        match: (t) => t?.status === 'denied' || t?.status === 'rejected',
      },
      { key: 'countered', label: 'Countered', icon: <SwapOutlined />, match: (t) => t?.status === 'countered' },
    ]
      .map((f) => ({ ...f, count: list.filter(f.match).length }))
      .filter((f) => f.key === 'all' || f.count > 0) // hide filters with no backing data
  }, [pendingTrade]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeMatch = filters.find((f) => f.key === filter)?.match || (() => true)
  const visible = (pendingTrade || []).filter(activeMatch)

  if (loading === 'main') {
    return (
      <div className='tt-page tt-pending'>
        {[0, 1, 2].map((i) => (
          <div key={i} className='tt-skel tt-skel-pcard' />
        ))}
      </div>
    )
  }

  if (!pendingTrade || pendingTrade.length === 0) {
    return (
      <div className='tt-page tt-pending'>
        <div className='tt-empty-state'>
          <InboxOutlined className='ic' />
          <h4>No pending trades</h4>
          <p>You have no active, accepted or rejected trades yet. Start building one to get going.</p>
          <button className='tt-act accept act' onClick={() => onGoNew && onGoNew()}>
            <SwapOutlined /> Build a Trade
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='tt-page tt-pending'>
      <div className='tt-subfilters' role='tablist' aria-label='Trade status filters'>
        {filters.map((f) => (
          <button
            key={f.key}
            role='tab'
            aria-selected={filter === f.key}
            className={`tt-subfilter ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.icon}
            {f.label}
            <span className='cnt'>{f.count}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className='tt-empty-state'>
          <InboxOutlined className='ic' />
          <h4>Nothing here</h4>
          <p>No trades match this filter.</p>
          <button className='tt-act' onClick={() => setFilter('all')}>
            Show all trades
          </button>
        </div>
      ) : (
        visible.map((trade) => {
          const statusCfg = getStatusConfig(trade?.status)
          const ai = trade?.aiAnalysis
          const hasAi = ai && ai.fairnessScore != null
          const dir = directionOf(trade)
          const createdAt = trade?.createdAt
            ? new Date(trade.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : ''
          const isPending = trade?.status === 'pending'
          const isExpired =
            trade?.isExpired ||
            (trade?.expiresAt && new Date(trade.expiresAt).getTime() < Date.now())
          const remaining = formatRemaining(trade?.expiresAt)

          return (
            <div key={trade._id} className='tt-pcard'>
              <div className='tt-pcard-top'>
                <div className='tt-pcard-top-l'>
                  <span className={`tt-dir-badge ${dir}`}>{dir === 'received' ? 'Received' : 'Sent'}</span>
                  <span
                    className='tt-badge'
                    style={{ background: `${statusCfg.color}18`, borderColor: `${statusCfg.color}44`, border: `1px solid ${statusCfg.color}44`, color: statusCfg.color }}
                  >
                    {statusCfg.icon}
                    {statusCfg.label}
                  </span>
                  {hasAi && (
                    <span
                      className='tt-badge'
                      style={{ background: `${getVerdictColor(ai.verdict)}18`, border: `1px solid ${getVerdictColor(ai.verdict)}44`, color: getVerdictColor(ai.verdict) }}
                    >
                      {getVerdictIcon(ai.verdict)}
                      {getVerdictLabel(ai.verdict)}
                    </span>
                  )}
                  {ai?.flaggedForReview && (
                    <span className='tt-badge' style={{ background: 'rgba(255,90,95,.15)', border: '1px solid rgba(255,90,95,.4)', color: '#ff8a8e' }}>
                      <ExclamationCircleOutlined /> COMMISSIONER REVIEW
                    </span>
                  )}
                  {trade?.expiresAt && (
                    <span
                      className='tt-badge'
                      style={
                        isExpired
                          ? { background: 'rgba(138,147,166,.15)', border: '1px solid rgba(138,147,166,.4)', color: '#8a93a6' }
                          : { background: 'rgba(246,196,83,.15)', border: '1px solid rgba(246,196,83,.4)', color: '#f6c453' }
                      }
                    >
                      <ClockCircleOutlined /> {isExpired ? 'EXPIRED' : remaining}
                    </span>
                  )}
                </div>
                <span className='tt-pcard-date'>{createdAt}</span>
              </div>

              {trade?.message ? (
                <div className='tt-pcard-msg'>
                  <span className='q'>“</span>
                  {trade.message}
                </div>
              ) : null}

              <div className='tt-pcard-body'>
                {/* buyer side */}
                <div className='tt-pcard-side'>
                  <div className='tt-pcard-side-h'>
                    <h5>{trade?.buyer?.team?.name || 'Team One'}</h5>
                  </div>
                  {trade?.buyer?.players?.map((p, i) => (
                    <div key={i} className='tt-pchip'>
                      <span className='tt-pos'>{mapPosition(p?.Position)}</span>
                      <span className='nm'>{p?.Name}</span>
                      <span className='cap'>{(p?.currentYearSalaryCap || 0).toLocaleString()} SP</span>
                    </div>
                  ))}
                  {trade?.buyer?.drafts?.map((d, i) => (
                    <div key={i} className='tt-pchip pick'>
                      <span className='nm'>{`${d?.season}' ${d?.team?.name || ''} Rd ${d?.round}`}</span>
                    </div>
                  ))}
                  {trade?.buyer?.samPoints > 0 && (
                    <div className='tt-psam'>
                      <DollarOutlined /> {trade.buyer.samPoints.toLocaleString()} SAM Points
                    </div>
                  )}
                  {!trade?.buyer?.players?.length && !trade?.buyer?.drafts?.length && !trade?.buyer?.samPoints && (
                    <div className='tt-pside-empty'>No assets</div>
                  )}
                </div>

                <div className='tt-pcard-swap'>
                  <SwapOutlined />
                </div>

                {/* seller side */}
                <div className='tt-pcard-side'>
                  <div className='tt-pcard-side-h'>
                    <h5>{trade?.seller?.team?.name || 'Team Two'}</h5>
                  </div>
                  {trade?.seller?.players?.map((p, i) => (
                    <div key={i} className='tt-pchip'>
                      <span className='tt-pos'>{mapPosition(p?.Position)}</span>
                      <span className='nm'>{p?.Name}</span>
                      <span className='cap'>{(p?.currentYearSalaryCap || 0).toLocaleString()} SP</span>
                    </div>
                  ))}
                  {trade?.seller?.drafts?.map((d, i) => (
                    <div key={i} className='tt-pchip pick'>
                      <span className='nm'>{`${d?.season}' ${d?.team?.name || ''} Rd ${d?.round}`}</span>
                    </div>
                  ))}
                  {trade?.seller?.samPoints > 0 && (
                    <div className='tt-psam'>
                      <DollarOutlined /> {trade.seller.samPoints.toLocaleString()} SAM Points
                    </div>
                  )}
                  {!trade?.seller?.players?.length && !trade?.seller?.drafts?.length && !trade?.seller?.samPoints && (
                    <div className='tt-pside-empty'>No assets</div>
                  )}
                </div>
              </div>

              {hasAi && (
                <div className='tt-pcard-ai'>
                  <RobotOutlined style={{ color: '#b6a4f7', fontSize: 12 }} />
                  <span className='lbl'>AI Score</span>
                  <div className='track'>
                    <div className='fill' style={{ width: `${ai.fairnessScore}%`, background: getVerdictColor(ai.verdict) }} />
                  </div>
                  <span className='sc' style={{ color: getVerdictColor(ai.verdict) }}>
                    {ai.fairnessScore}
                  </span>
                </div>
              )}

              <div className='tt-pcard-foot'>
                <TradeShareCard trade={{ ...trade, leagueName }} sport='football' />

                {/* View is always available */}
                <button className='tt-act' onClick={() => goCounter(trade._id)}>
                  <EyeOutlined /> View
                </button>

                {isPending && dir === 'received' && (
                  <>
                    <button
                      className='tt-act accept'
                      disabled={busyId === trade._id + ':accept' || !tradeWindowOpen}
                      title={!tradeWindowOpen ? `Trade deadline passed — ${tradeWindow.label}` : undefined}
                      onClick={() => handleApprove(trade._id)}
                    >
                      <CheckCircleOutlined /> Accept
                    </button>
                    <button
                      className='tt-act counter'
                      disabled={!tradeWindowOpen}
                      title={!tradeWindowOpen ? `Trade deadline passed — ${tradeWindow.label}` : undefined}
                      onClick={() => tradeWindowOpen && goCounter(trade._id)}
                    >
                      <RollbackOutlined /> Counter
                    </button>
                    <button
                      className='tt-act reject'
                      disabled={busyId === trade._id + ':reject'}
                      onClick={() => handleReject(trade._id, 'Reject this trade?')}
                    >
                      <CloseCircleOutlined /> Reject
                    </button>
                  </>
                )}

                {isPending && dir === 'received' && !tradeWindowOpen && (
                  <span
                    className='tt-deadline-note'
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      color: '#ff8a8e',
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    <LockOutlined /> Trade deadline passed — {tradeWindow.label}. You can still Reject.
                  </span>
                )}

                {isPending && dir === 'sent' && (
                  <button
                    className='tt-act reject'
                    disabled={busyId === trade._id + ':reject'}
                    onClick={() => handleReject(trade._id, 'Cancel this trade offer?')}
                  >
                    <CloseCircleOutlined /> Cancel
                  </button>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

export default PendingTrade
