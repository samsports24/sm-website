import { Button, Dropdown, Spin, Empty, notification, Tag, Modal, Input } from 'antd'
import React, { useState, useEffect } from 'react'
import {
  getCommissionerPendingTrades,
  approveTradeAdmin,
  vetoTradeAdmin,
} from '../../redux/actions/teamTradeAction'
import moment from 'moment'

const COLORS = {
  bg: '#0A0F1A',
  card: 'rgba(255,255,255,0.04)',
  cardHover: 'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.08)',
  green: '#22c55e',
  red: '#ef4444',
  yellow: '#eab308',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  blue: '#3b82f6',
}

const Trades = () => {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTrades = async () => {
    setLoading(true)
    try {
      const data = await getCommissionerPendingTrades()
      setTrades(data || [])
    } catch (e) {
      console.error('Failed to fetch commissioner trades:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrades()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Spin size='large' />
      </div>
    )
  }

  if (!trades.length) {
    return (
      <div className='league_trade_container'>
        <div className='ltc_wrapper'>
          <Empty
            description={
              <span style={{ color: COLORS.textMuted, fontSize: 15 }}>
                No trades pending commissioner review
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='league_trade_container'>
      <div className='ltc_wrapper'>
        <h2 style={{ color: COLORS.text, marginBottom: 20 }}>
          COMMISSIONER, YOU HAVE {trades.length} TRADE{trades.length > 1 ? 'S' : ''} TO REVIEW:
        </h2>
        <div className='ltc_card_container'>
          {trades.map((v) => (
            <TradeCard key={v._id} data={v} onAction={fetchTrades} />
          ))}
        </div>
      </div>
    </div>
  )
}

const TradeCard = ({ data, onAction }) => {
  const [actionLoading, setActionLoading] = useState({ type: '', id: '' })

  const buyerTeam = data?.buyer?.team?.name || data?.buyer?.team?.teamName || 'Team A'
  const sellerTeam = data?.seller?.team?.name || data?.seller?.team?.teamName || 'Team B'
  const buyerPlayers = data?.buyer?.players || []
  const sellerPlayers = data?.seller?.players || []
  const buyerDrafts = data?.buyer?.drafts || []
  const sellerDrafts = data?.seller?.drafts || []
  const buyerSP = data?.buyer?.samPoints || 0
  const sellerSP = data?.seller?.samPoints || 0
  const aiAnalysis = data?.aiAnalysis

  const handleApprove = async () => {
    setActionLoading({ type: 'approve', id: data._id })
    try {
      const res = await approveTradeAdmin({ tradeId: data._id })
      if (res) {
        notification.success({ message: 'Trade approved successfully', duration: 3 })
        onAction()
      }
    } catch (e) {
      notification.error({ message: 'Failed to approve trade', duration: 3 })
    } finally {
      setActionLoading({ type: '', id: '' })
    }
  }

  const handleReject = async (reason) => {
    setActionLoading({ type: 'reject', id: data._id })
    try {
      const res = await vetoTradeAdmin({ tradeId: data._id, reason })
      if (res) {
        notification.success({ message: 'Trade vetoed successfully', duration: 3 })
        onAction()
      }
    } catch (e) {
      notification.error({ message: 'Failed to veto trade', duration: 3 })
    } finally {
      setActionLoading({ type: '', id: '' })
    }
  }

  const handleCustomReject = () => {
    let customReason = ''
    Modal.confirm({
      title: 'Veto Trade',
      content: (
        <div>
          <p style={{ color: COLORS.textMuted, marginBottom: 8 }}>
            Provide a reason for vetoing this trade:
          </p>
          <Input.TextArea
            rows={3}
            placeholder='Enter veto reason...'
            onChange={(e) => (customReason = e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
            }}
          />
        </div>
      ),
      okText: 'Veto Trade',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      className: 'wr-dark-confirm',
      onOk: () => {
        if (customReason.trim()) {
          handleReject(customReason.trim())
        } else {
          notification.warning({ message: 'Please provide a reason', duration: 2 })
        }
      },
    })
  }

  const rejectItems = [
    {
      key: '1',
      label: <p onClick={() => handleReject('Unfair trade - lopsided value')}>Unfair Trade</p>,
    },
    {
      key: '2',
      label: <p onClick={() => handleReject('Salary cap violation')}>Salary Cap Violation</p>,
    },
    {
      key: '3',
      label: <p onClick={() => handleReject('Roster composition violation')}>Illegal Roster</p>,
    },
    {
      key: '4',
      label: <p onClick={() => handleReject('Collusion suspected')}>Collusion</p>,
    },
    {
      key: '5',
      label: <p onClick={handleCustomReject}>Custom Reason...</p>,
    },
  ]

  const formatAssets = (players, drafts, sp) => {
    const items = []
    players.forEach((p) => items.push(p?.Name || 'Player'))
    drafts.forEach((d) => {
      const team = d?.team?.name || ''
      items.push(`${team ? team + ' ' : ''}Draft Pick`)
    })
    if (sp > 0) items.push(`${sp.toLocaleString()} SP`)
    return items
  }

  const buyerAssets = formatAssets(buyerPlayers, buyerDrafts, buyerSP)
  const sellerAssets = formatAssets(sellerPlayers, sellerDrafts, sellerSP)

  return (
    <div
      className='trade_card'
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 16,
      }}
    >
      {/* Status + Timestamp */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Tag color={data.status === 'pending_commissioner' ? 'orange' : 'blue'}>
          {data.status === 'pending_commissioner' ? 'PENDING APPROVAL' : 'UNDER REVIEW'}
        </Tag>
        <span style={{ color: COLORS.textMuted, fontSize: 12 }}>
          {data.createdAt ? moment(data.createdAt).format('MMM D, YYYY h:mm A') : ''}
        </span>
      </div>

      {/* Trade Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 16,
          alignItems: 'start',
          marginBottom: 16,
        }}
      >
        {/* Buyer Side */}
        <div>
          <div style={{ color: COLORS.green, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
            {buyerTeam} receives:
          </div>
          {sellerAssets.map((item, i) => (
            <div key={i} style={{ color: COLORS.text, fontSize: 13, padding: '2px 0' }}>
              {item}
            </div>
          ))}
        </div>

        {/* Arrow */}
        <div
          style={{
            color: COLORS.textMuted,
            fontSize: 24,
            paddingTop: 20,
            fontWeight: 300,
          }}
        >
          ⇄
        </div>

        {/* Seller Side */}
        <div>
          <div style={{ color: COLORS.blue, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
            {sellerTeam} receives:
          </div>
          {buyerAssets.map((item, i) => (
            <div key={i} style={{ color: COLORS.text, fontSize: 13, padding: '2px 0' }}>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis */}
      {aiAnalysis && aiAnalysis.fairnessScore != null && (
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 16,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: COLORS.textMuted, fontSize: 12 }}>AI ANALYSIS:</span>
            <Tag
              color={
                aiAnalysis.fairnessScore >= 70
                  ? 'green'
                  : aiAnalysis.fairnessScore >= 45
                  ? 'orange'
                  : 'red'
              }
            >
              Fairness: {aiAnalysis.fairnessScore}/100
            </Tag>
            <Tag
              color={
                aiAnalysis.verdict === 'fair' || aiAnalysis.verdict === 'approved'
                  ? 'green'
                  : aiAnalysis.verdict === 'flagged' || aiAnalysis.verdict === 'slightly_unfair'
                  ? 'orange'
                  : 'red'
              }
            >
              {(aiAnalysis.verdict || '').toUpperCase()}
            </Tag>
          </div>
          {aiAnalysis.summary && (
            <div style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 6 }}>
              {aiAnalysis.summary}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className='buttons_box' style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button
          loading={actionLoading.type === 'approve' && actionLoading.id === data._id}
          type='primary'
          onClick={handleApprove}
          className='approve_button'
          style={{
            background: `linear-gradient(135deg, ${COLORS.green}, #16a34a)`,
            border: 'none',
            fontWeight: 700,
            borderRadius: 8,
            height: 36,
            paddingInline: 24,
          }}
        >
          Approve Trade
        </Button>

        <Dropdown menu={{ items: rejectItems }} trigger={['click']}>
          <Button
            loading={actionLoading.type === 'reject' && actionLoading.id === data._id}
            onClick={(e) => e.preventDefault()}
            className='reject_button'
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: `1px solid ${COLORS.red}`,
              color: COLORS.red,
              fontWeight: 700,
              borderRadius: 8,
              height: 36,
              paddingInline: 24,
            }}
          >
            Veto Trade ▾
          </Button>
        </Dropdown>
      </div>
    </div>
  )
}

export default Trades
