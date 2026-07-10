import React, { useEffect, useState, useMemo } from 'react'
import { Button, Input, Spin, Table, notification } from 'antd'
import {
  ActivateFromPracticeSquad,
  MoveToInjured,
  MoveToPracticeSquad,
  PoachPlayer,
  ReleasePlayer,
  TradePlayer,
} from '../modal/PlayerInterfaceModals'
import {
  addBid,
  auctionEnded,
  createAuction,
  getFreeAgentRosterPlayer,
  getRosterPlayer,
  getSingleAuctionPlayer,
} from '../../redux/actions/rosterAction'

import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { getPf, getRankAndPosition } from '../../config/helperFunctions'
import { isLocked, positions } from '../../config/constants'

import Image from '../../assets/logo2.png'
import sampointslogo from '../../assets/samcoinlogo.png'

import { BiRightArrowAlt } from 'react-icons/bi'

import Loader from '../Loader'
import moment from 'moment'

/* ═══════════════════════════════════════════════════════════════
   PLAYER INTERFACE POPUP, Modern Redesign
   Prefix: pip-
   ═══════════════════════════════════════════════════════════════ */

const PlayerInterfacePopup = ({ state, closeModal, isModalOpen }) => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const currentLeague = useSelector((state) => state.league?.currentLeague)
  const draftNotCompleted = currentLeague && currentLeague.draftCompleted !== true
  const [isLoading, setIsLoading] = useState(true)
  const [auctionLoading, setAuctionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('stats')
  const sampoints = useSelector((state) => state.user?.SamPoints?.SamPoints)

  const [data, setData] = useState({
    player: {},
    news: '',
    activePlayers: [],
    practicePlayers: [],
    playerContract: {},
  })
  const navigate = useNavigate()

  const playerIdBig = data?.player?._id
  const playerIdSmall = data?.player?.PlayerID
  const isPlayerLocked = data?.player?.isPlayerLocked
  const inPracticeSquad = data?.player?.inPracticeSquad
  const CapHit = data?.player?.currentYearSalaryCap

  const isOwnRoster = state?.isOwnRoster?.status
  const isTeamRoster = state?.isTeamRoster?.status
  const isFreeAgent = state?.isFreeAgent?.status
  const isAuction = state?.isAuction

  useEffect(() => {
    if (isModalOpen) {
      getData()
      setActiveTab('stats')
    }
  }, [isModalOpen])

  const getWeeklyScoring = (arr) => {
    if (arr?.length > 0) {
      let unique_values = [...new Set(arr.map((v) => v?.season))]
      const newArray = []

      unique_values
        ?.sort((a, b) => b - a)
        ?.forEach((v) => {
          const filteredSeasonScore = arr?.filter((x) => Number(x?.season) === v)

          const finalScoring = {}
          for (let i = 1; i <= 18; i++) {
            if (filteredSeasonScore.find((x) => x?.week === i)) {
              finalScoring[`week${i}`] = filteredSeasonScore.find((x) => x?.week === i)?.score
            } else {
              finalScoring[`week${i}`] = 0
            }
          }

          const totalPf = filteredSeasonScore?.reduce((acc, obj) => acc + obj.score, 0)

          newArray?.push({
            season: v,
            totalPoints: totalPf?.toFixed(2),
            averagePoints: totalPf > 0 ? (totalPf / filteredSeasonScore?.length)?.toFixed(2) : 0,
            weeklyScoring: finalScoring,
          })
        })
      return newArray
    }
  }

  const getData = async () => {
    setIsLoading(true)

    if (isFreeAgent) {
      const res = await getFreeAgentRosterPlayer({ id: state?.playerID, week: SETTING?.week })
      if (res) {
        setData({ ...res, playerHistory: getWeeklyScoring(res?.player?.weeklyScoring) })
      }
    } else if (isOwnRoster || isTeamRoster) {
      const res = await getRosterPlayer({
        id: state?.playerID,
        week: SETTING?.week,
        team: state?.teamId,
      })
      if (res) {
        setData({ ...res, playerHistory: getWeeklyScoring(res?.playerContract?.weeklyScoring) })
      }
    } else if (isAuction?.status) {
      const res = await getSingleAuctionPlayer(isAuction?.auctionId)
      if (res) getWeeklyScoring(res?.player_id?.weeklyScoring)
      setData({
        ...res,
        player: res?.player_id,
        playerContract: {
          weeklyScoring: res?.player_id?.weeklyScoring,
        },
        activePlayers: [],
        practicePlayers: [],
        reservedPlayers: [],
        playerHistory: getWeeklyScoring(res?.player_id?.weeklyScoring),
      })
    }
    setIsLoading(false)
  }

  function mapPosition(position) {
    return positions[position] || position
  }

  const columns = [
    {
      title: 'YEAR',
      dataIndex: 'season',
      key: 'season',
      render: (t) => (t ? t : '-'),
    },
    {
      title: 'TOTAL PTS',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      render: (t) => (t ? t : '-'),
      width: 100,
    },
    {
      title: 'AVG PTS',
      dataIndex: 'averagePoints',
      key: 'averagePoints',
      render: (t) => (t ? t : '-'),
      width: 90,
    },
    ...Array.from({ length: 18 }, (_, index) => ({
      title: (
        <p>
          WK<b>{index + 1}</b>
        </p>
      ),
      dataIndex: `week${index + 1}`,
      key: `week${index + 1}`,
      render: (_, obj) =>
        obj?.weeklyScoring?.[`week${index + 1}`] ? obj?.weeklyScoring?.[`week${index + 1}`] : '-',
    })),
  ]

  const getYear = (contract) => {
    try {
      const signed = contract?.split(' signed a ')[1][0]
      if (signed) {
        return new Date().getFullYear() - 1 + Number(signed)
      }
    } catch (e) {}
    return '-'
  }

  const handleCreateAuction = async ({ auctionFrom } = {}) => {
    if (auctionFrom === 'nonowner') {
      if (sampoints < CapHit) {
        notification.error({
          message: `Bid amount ${CapHit} exceeds your available points of ${sampoints}.`,
          duration: 4,
        })
        return
      }
    }

    setAuctionLoading(true)
    const res = await createAuction({
      PlayerID: playerIdSmall,
      player_id: playerIdBig,
      auctionFrom: auctionFrom ? String(auctionFrom) : 'owner',
      CapHit: CapHit === 0 ? 1 : CapHit === undefined ? 1 : CapHit,
    })
    if (res) {
      closeModal()
      navigate('/player-auction')
    }
    setAuctionLoading(false)
  }

  // Compute stats for quick-stats bar
  const rankData = useMemo(
    () => getRankAndPosition(data?.playerContract?.weeklyScoring),
    [data?.playerContract?.weeklyScoring],
  )
  const pfData = useMemo(
    () =>
      isFreeAgent
        ? { tpf: data?.player?.pf || '-', apf: data?.player?.avgPf || '-' }
        : getPf(
            data?.playerContract?.weeklyScoring?.filter((item) => item.season === 2024),
          ) || { tpf: '-', apf: '-' },
    [data?.playerContract?.weeklyScoring, isFreeAgent, data?.player],
  )

  const injuryStatus = data?.playerDetails?.InjuryStatus

  // Tab list
  const tabs = [
    { key: 'stats', label: 'Stats' },
    { key: 'news', label: 'News' },
    { key: 'history', label: 'History' },
    { key: 'contract', label: 'Contract' },
  ]

  // Show auction tab when in auction mode
  if (isAuction?.status) {
    tabs.push({ key: 'auction', label: 'Auction' })
  }

  return (
    <div className="pip-popup">
      {/* Close button */}
      <button className="pip-close" onClick={closeModal} aria-label="Close">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {isLoading ? (
        <div className="pip-loader"><Loader /></div>
      ) : (
        <>
          {/* ── Viewing other team banner ── */}
          {state?.teamId && (
            <div className="pip-viewing-banner">
              Viewing {state?.teamName || 'other team'} roster
            </div>
          )}

          {/* ── Hero Section ── */}
          <div className="pip-hero">
            <div className="pip-hero-photo">
              {data?.player?.HostedHeadshotNoBackgroundUrl ? (
                <img
                  src={data?.player?.HostedHeadshotNoBackgroundUrl}
                  alt={data?.player?.Name}
                  className="pip-headshot"
                />
              ) : (
                <div className="pip-headshot-ph">
                  {data?.player?.FirstName?.[0]}{data?.player?.LastName?.[0]}
                </div>
              )}
            </div>
            <div className="pip-hero-info">
              <div className="pip-hero-name-row">
                <h1 className="pip-name">
                  <span className="pip-first">{data?.player?.FirstName}</span>
                  <span className="pip-last">{data?.player?.LastName}</span>
                </h1>
                {state?.teamLogo && (
                  <img src={state?.teamLogo} alt="Team" className="pip-team-logo" />
                )}
              </div>
              <div className="pip-badges">
                <span className="pip-badge pip-badge-pos">
                  {mapPosition(data?.player?.otcPosition || data?.player?.Position) || '-'}
                </span>
                <span className="pip-badge pip-badge-team">
                  {data?.player?.Team || '-'}
                </span>
                {injuryStatus && injuryStatus !== '-' && (
                  <span className={`pip-badge pip-badge-injury ${
                    injuryStatus?.toLowerCase() === 'out' ? 'pip-injury-out' :
                    injuryStatus?.toLowerCase() === 'questionable' ? 'pip-injury-q' : ''
                  }`}>
                    {injuryStatus}
                  </span>
                )}
              </div>
              <div className="pip-bio-grid">
                <div className="pip-bio-item">
                  <span className="pip-bio-label">Age</span>
                  <span className="pip-bio-value">{data?.player?.Age || '-'}</span>
                </div>
                <div className="pip-bio-item">
                  <span className="pip-bio-label">Height</span>
                  <span className="pip-bio-value">{data?.player?.Height || '-'}</span>
                </div>
                <div className="pip-bio-item">
                  <span className="pip-bio-label">Weight</span>
                  <span className="pip-bio-value">
                    {data?.player?.Weight ? `${data?.player?.Weight} lbs` : '-'}
                  </span>
                </div>
                <div className="pip-bio-item">
                  <span className="pip-bio-label">Exp</span>
                  <span className="pip-bio-value">
                    {data?.player?.Experience
                      ? `${data?.player?.Experience} yr${data?.player?.Experience > 1 ? 's' : ''}`
                      : '-'}
                  </span>
                </div>
                <div className="pip-bio-item">
                  <span className="pip-bio-label">Bye</span>
                  <span className="pip-bio-value">{data?.player?.ByeWeek || '-'}</span>
                </div>
                <div className="pip-bio-item">
                  <span className="pip-bio-label">Opp</span>
                  <span className="pip-bio-value">{data?.player?.UpcomingGameOpponent || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Quick Stats Bar ── */}
          <div className="pip-stats-bar">
            <div className="pip-stat">
              <span className="pip-stat-label">Pos Rank</span>
              <span className="pip-stat-value">{rankData?.playerPositionRank || '-'}</span>
            </div>
            <div className="pip-stat-divider" />
            <div className="pip-stat">
              <span className="pip-stat-label">Overall</span>
              <span className="pip-stat-value">{rankData?.playerOverallRank || '-'}</span>
            </div>
            <div className="pip-stat-divider" />
            <div className="pip-stat">
              <span className="pip-stat-label">Value</span>
              <span className="pip-stat-value pip-stat-green">
                {data?.player?.otcCapHit && data.player.otcCapHit > 0
                  ? `$${(data.player.otcCapHit / 1_000_000).toFixed(1)}M`
                  : data?.player?.currentYearSalaryCap
                    ? `${data.player.currentYearSalaryCap.toLocaleString()} SP`
                    : '-'}
              </span>
            </div>
            <div className="pip-stat-divider" />
            <div className="pip-stat">
              <span className="pip-stat-label">Fantasy Pts</span>
              <span className="pip-stat-value pip-stat-cyan">{pfData?.tpf || '-'}</span>
            </div>
            <div className="pip-stat-divider" />
            <div className="pip-stat">
              <span className="pip-stat-label">Pts/Game</span>
              <span className="pip-stat-value pip-stat-cyan">{pfData?.apf || '-'}</span>
            </div>
            {(data?.player?.projectedFantasyPoints > 0 || data?.player?.FantasyPoints24) && (
              <>
                <div className="pip-stat-divider" />
                <div className="pip-stat">
                  <span className="pip-stat-label">Projected</span>
                  <span className="pip-stat-value pip-stat-purple">
                    {data?.player?.projectedFantasyPoints > 0
                      ? data.player.projectedFantasyPoints.toFixed(1)
                      : Math.round(data?.player?.FantasyPoints24)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* ── Tab Navigation ── */}
          <div className="pip-tabs">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`pip-tab ${activeTab === t.key ? 'pip-tab-active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab Content ── */}
          <div className="pip-content">
            {/* Stats tab, default landing */}
            {activeTab === 'stats' && (
              <div className="pip-tab-stats">
                <div className="pip-contract-summary">
                  {/* Row 1: Cap Hit + Base Salary + SP Value */}
                  <div className="pip-contract-row">
                    <div className="pip-contract-cell">
                      <span className="pip-contract-label">Cap Hit</span>
                      <span className="pip-contract-val">
                        {data?.player?.otcCapHit && data.player.otcCapHit > 0
                          ? `$${(data.player.otcCapHit / 1_000_000).toFixed(1)}M`
                          : data?.player?.currentYearSalaryCap
                            ? `${data.player.currentYearSalaryCap.toLocaleString()} SP`
                            : '-'}
                      </span>
                    </div>
                    <div className="pip-contract-cell">
                      <span className="pip-contract-label">Base Salary</span>
                      <span className="pip-contract-val">
                        {data?.player?.otcBaseSalary && data.player.otcBaseSalary > 0
                          ? `$${(data.player.otcBaseSalary / 1_000_000).toFixed(1)}M`
                          : '-'}
                      </span>
                    </div>
                    <div className="pip-contract-cell">
                      <span className="pip-contract-label">Dead Cap</span>
                      <span className="pip-contract-val" style={{ color: data?.player?.otcDeadCap > 0 ? '#ef4444' : undefined }}>
                        {data?.player?.otcDeadCap && data.player.otcDeadCap > 0
                          ? `$${(data.player.otcDeadCap / 1_000_000).toFixed(1)}M`
                          : '-'}
                      </span>
                    </div>
                  </div>
                  {/* Row 2: Total Contract + Guaranteed + APY */}
                  <div className="pip-contract-row" style={{ marginTop: 6 }}>
                    <div className="pip-contract-cell">
                      <span className="pip-contract-label">Total Contract</span>
                      <span className="pip-contract-val">
                        {data?.player?.otcTotalValue && data.player.otcTotalValue > 0
                          ? `$${(data.player.otcTotalValue / 1_000_000).toFixed(1)}M`
                          : '-'}
                      </span>
                    </div>
                    <div className="pip-contract-cell">
                      <span className="pip-contract-label">Guaranteed</span>
                      <span className="pip-contract-val" style={{ color: '#22c55e' }}>
                        {data?.player?.otcTotalGuaranteed && data.player.otcTotalGuaranteed > 0
                          ? `$${(data.player.otcTotalGuaranteed / 1_000_000).toFixed(1)}M`
                          : '-'}
                      </span>
                    </div>
                    <div className="pip-contract-cell">
                      <span className="pip-contract-label">APY</span>
                      <span className="pip-contract-val">
                        {data?.player?.otcAvgAnnualValue && data.player.otcAvgAnnualValue > 0
                          ? `$${(data.player.otcAvgAnnualValue / 1_000_000).toFixed(1)}M`
                          : '-'}
                      </span>
                    </div>
                  </div>
                  {/* Row 3: Years Left + Free Agent Year */}
                  <div className="pip-contract-row" style={{ marginTop: 6 }}>
                    <div className="pip-contract-cell">
                      <span className="pip-contract-label">Years Left</span>
                      <span className="pip-contract-val">
                        {data?.player?.yearsLeftSalaryCap && data.player.yearsLeftSalaryCap > 0
                          ? `${data.player.yearsLeftSalaryCap} yr`
                          : '-'}
                      </span>
                    </div>
                    <div className="pip-contract-cell">
                      <span className="pip-contract-label">Free Agent</span>
                      <span className="pip-contract-val">
                        {data?.player?.otcFreeAgentYear || '-'}
                      </span>
                    </div>
                    <div className="pip-contract-cell">
                      <span className="pip-contract-label">{new Date().getFullYear() + 1} Cap</span>
                      <span className="pip-contract-val">
                        {data?.player?.nextYearSalaryCap && data.player.nextYearSalaryCap > 0
                          ? `$${(data.player.nextYearSalaryCap / 1_000_000).toFixed(1)}M`
                          : '-'}
                      </span>
                    </div>
                  </div>
                  {/* Row 4: Year After Cap + Year After Next Cap */}
                  <div className="pip-contract-row" style={{ marginTop: 6 }}>
                    <div className="pip-contract-cell">
                      <span className="pip-contract-label">{new Date().getFullYear() + 2} Cap</span>
                      <span className="pip-contract-val">
                        {data?.player?.yearAfterSalaryCap && data.player.yearAfterSalaryCap > 0
                          ? `$${(data.player.yearAfterSalaryCap / 1_000_000).toFixed(1)}M`
                          : '-'}
                      </span>
                    </div>
                    <div className="pip-contract-cell">
                      <span className="pip-contract-label">{new Date().getFullYear() + 3} Cap</span>
                      <span className="pip-contract-val">
                        {data?.player?.yearAfterNextSalaryCap && data.player.yearAfterNextSalaryCap > 0
                          ? `$${(data.player.yearAfterNextSalaryCap / 1_000_000).toFixed(1)}M`
                          : '-'}
                      </span>
                    </div>
                    <div className="pip-contract-cell" />
                  </div>
                  {/* Yearly Breakdown Table (if available) */}
                  {data?.player?.otcYearlyBreakdown && data.player.otcYearlyBreakdown.length > 0 && (
                    <div style={{ marginTop: 10, overflowX: 'auto' }}>
                      <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '4px 6px', textAlign: 'left', opacity: 0.5, fontWeight: 500 }}>Year</th>
                            <th style={{ padding: '4px 6px', textAlign: 'right', opacity: 0.5, fontWeight: 500 }}>Base</th>
                            <th style={{ padding: '4px 6px', textAlign: 'right', opacity: 0.5, fontWeight: 500 }}>Cap Hit</th>
                            <th style={{ padding: '4px 6px', textAlign: 'right', opacity: 0.5, fontWeight: 500 }}>Dead Cap</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.player.otcYearlyBreakdown
                            .filter(y => y.year >= new Date().getFullYear() - 1)
                            .map((yr, idx) => (
                              <tr key={idx} style={{
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                background: yr.year === new Date().getFullYear() ? 'rgba(34,197,94,0.05)' : 'transparent',
                              }}>
                                <td style={{ padding: '4px 6px', fontWeight: yr.year === new Date().getFullYear() ? 600 : 400 }}>
                                  {yr.year}{yr.year === new Date().getFullYear() ? ' *' : ''}
                                </td>
                                <td style={{ padding: '4px 6px', textAlign: 'right' }}>
                                  {yr.baseSalary > 0 ? `$${(yr.baseSalary / 1_000_000).toFixed(1)}M` : '-'}
                                </td>
                                <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 600 }}>
                                  {yr.capHit > 0 ? `$${(yr.capHit / 1_000_000).toFixed(1)}M` : '-'}
                                </td>
                                <td style={{ padding: '4px 6px', textAlign: 'right', color: yr.deadCap > 0 ? '#ef4444' : undefined }}>
                                  {yr.deadCap > 0 ? `$${(yr.deadCap / 1_000_000).toFixed(1)}M` : '-'}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* Contract Notes (narrative description) */}
                  {data?.player?.otcContractNotes && (
                    <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', opacity: 0.4, letterSpacing: 0.5 }}>Contract Notes</span>
                      <p style={{ fontSize: 11, lineHeight: 1.5, margin: '4px 0 0', opacity: 0.7 }}>
                        {data.player.otcContractNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* ── NFL Season Stats Bars ── */}
                <NFLSeasonStats
                  seasonStats={data?.seasonStats}
                  position={data?.player?.Position || data?.playerDetails?.Position}
                />

                {/* Mini history preview, last season only */}
                {data?.playerHistory?.length > 0 && (
                  <div className="pip-mini-history">
                    <div className="pip-section-head">
                      <h3>Recent Season</h3>
                      <button className="pip-link-btn" onClick={() => setActiveTab('history')}>
                        Full History <BiRightArrowAlt size={14} />
                      </button>
                    </div>
                    <Table
                      loading={isLoading}
                      dataSource={[data?.playerHistory?.[0]]}
                      columns={columns}
                      bordered={false}
                      pagination={false}
                      scroll={{ x: 1800, y: 120 }}
                      className="pip-table"
                      size="small"
                    />
                  </div>
                )}
              </div>
            )}

            {/* News tab */}
            {activeTab === 'news' && (
              <div className="pip-tab-news">
                <h3 className="pip-section-title">Player News</h3>
                <p className="pip-news-text">{data?.news || 'No news available for this player.'}</p>
              </div>
            )}

            {/* History tab */}
            {activeTab === 'history' && (
              <div className="pip-tab-history">
                <h3 className="pip-section-title">Scoring History</h3>
                <Table
                  loading={isLoading}
                  dataSource={data?.playerHistory}
                  columns={columns}
                  bordered={false}
                  pagination={false}
                  scroll={{ x: 1800, y: 250 }}
                  className="pip-table"
                  size="small"
                />
              </div>
            )}

            {/* Contract tab */}
            {activeTab === 'contract' && (
              <div className="pip-tab-contract">
                {/* Row 1: Cap Hit + Base Salary + Dead Cap */}
                <div className="pip-contract-detail-grid">
                  <div className="pip-cd-card">
                    <span className="pip-cd-label">Cap Hit</span>
                    <span className="pip-cd-value">
                      {data?.player?.otcCapHit && data.player.otcCapHit > 0
                        ? `$${(data.player.otcCapHit / 1_000_000).toFixed(1)}M`
                        : '-'}
                    </span>
                  </div>
                  <div className="pip-cd-card">
                    <span className="pip-cd-label">Base Salary</span>
                    <span className="pip-cd-value">
                      {data?.player?.otcBaseSalary && data.player.otcBaseSalary > 0
                        ? `$${(data.player.otcBaseSalary / 1_000_000).toFixed(1)}M`
                        : '-'}
                    </span>
                  </div>
                  <div className="pip-cd-card">
                    <span className="pip-cd-label">Dead Cap</span>
                    <span className="pip-cd-value" style={{ color: data?.player?.otcDeadCap > 0 ? '#ef4444' : undefined }}>
                      {data?.player?.otcDeadCap && data.player.otcDeadCap > 0
                        ? `$${(data.player.otcDeadCap / 1_000_000).toFixed(1)}M`
                        : '-'}
                    </span>
                  </div>
                </div>
                {/* Row 2: Total Contract + Guaranteed + APY */}
                <div className="pip-contract-detail-grid" style={{ marginTop: 6 }}>
                  <div className="pip-cd-card">
                    <span className="pip-cd-label">Total Contract</span>
                    <span className="pip-cd-value">
                      {data?.player?.otcTotalValue && data.player.otcTotalValue > 0
                        ? `$${(data.player.otcTotalValue / 1_000_000).toFixed(1)}M`
                        : '-'}
                    </span>
                  </div>
                  <div className="pip-cd-card">
                    <span className="pip-cd-label">Guaranteed</span>
                    <span className="pip-cd-value" style={{ color: '#22c55e' }}>
                      {data?.player?.otcTotalGuaranteed && data.player.otcTotalGuaranteed > 0
                        ? `$${(data.player.otcTotalGuaranteed / 1_000_000).toFixed(1)}M`
                        : '-'}
                    </span>
                  </div>
                  <div className="pip-cd-card">
                    <span className="pip-cd-label">APY</span>
                    <span className="pip-cd-value">
                      {data?.player?.otcAvgAnnualValue && data.player.otcAvgAnnualValue > 0
                        ? `$${(data.player.otcAvgAnnualValue / 1_000_000).toFixed(1)}M`
                        : '-'}
                    </span>
                  </div>
                </div>
                {/* Row 3: Years Left + Free Agent + Contract Length */}
                <div className="pip-contract-detail-grid" style={{ marginTop: 6 }}>
                  <div className="pip-cd-card">
                    <span className="pip-cd-label">Years Left</span>
                    <span className="pip-cd-value">
                      {data?.player?.yearsLeftSalaryCap && data.player.yearsLeftSalaryCap > 0
                        ? `${data.player.yearsLeftSalaryCap} yr`
                        : '-'}
                    </span>
                  </div>
                  <div className="pip-cd-card">
                    <span className="pip-cd-label">Free Agent</span>
                    <span className="pip-cd-value">
                      {data?.player?.otcFreeAgentYear || '-'}
                    </span>
                  </div>
                  <div className="pip-cd-card">
                    <span className="pip-cd-label">Contract</span>
                    <span className="pip-cd-value">
                      {data?.player?.otcContractYears && data.player.otcContractYears > 0
                        ? `${data.player.otcContractYears} yr`
                        : '-'}
                    </span>
                  </div>
                </div>
                {/* Row 4: Future Cap Hits */}
                <div className="pip-contract-detail-grid" style={{ marginTop: 6 }}>
                  <div className="pip-cd-card">
                    <span className="pip-cd-label">{new Date().getFullYear() + 1} Cap</span>
                    <span className="pip-cd-value">
                      {data?.player?.nextYearSalaryCap && data.player.nextYearSalaryCap > 0
                        ? `$${(data.player.nextYearSalaryCap / 1_000_000).toFixed(1)}M`
                        : '-'}
                    </span>
                  </div>
                  <div className="pip-cd-card">
                    <span className="pip-cd-label">{new Date().getFullYear() + 2} Cap</span>
                    <span className="pip-cd-value">
                      {data?.player?.yearAfterSalaryCap && data.player.yearAfterSalaryCap > 0
                        ? `$${(data.player.yearAfterSalaryCap / 1_000_000).toFixed(1)}M`
                        : '-'}
                    </span>
                  </div>
                  <div className="pip-cd-card">
                    <span className="pip-cd-label">{new Date().getFullYear() + 3} Cap</span>
                    <span className="pip-cd-value">
                      {data?.player?.yearAfterNextSalaryCap && data.player.yearAfterNextSalaryCap > 0
                        ? `$${(data.player.yearAfterNextSalaryCap / 1_000_000).toFixed(1)}M`
                        : '-'}
                    </span>
                  </div>
                </div>

                {/* Yearly Breakdown Table */}
                {data?.player?.otcYearlyBreakdown && data.player.otcYearlyBreakdown.length > 0 && (
                  <div style={{ marginTop: 12, overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <th style={{ padding: '4px 6px', textAlign: 'left', opacity: 0.5, fontWeight: 500 }}>Year</th>
                          <th style={{ padding: '4px 6px', textAlign: 'right', opacity: 0.5, fontWeight: 500 }}>Base</th>
                          <th style={{ padding: '4px 6px', textAlign: 'right', opacity: 0.5, fontWeight: 500 }}>Bonus</th>
                          <th style={{ padding: '4px 6px', textAlign: 'right', opacity: 0.5, fontWeight: 500 }}>Cap Hit</th>
                          <th style={{ padding: '4px 6px', textAlign: 'right', opacity: 0.5, fontWeight: 500 }}>Dead Cap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.player.otcYearlyBreakdown
                          .filter(y => y.year >= new Date().getFullYear() - 1)
                          .map((yr, idx) => (
                            <tr key={idx} style={{
                              borderBottom: '1px solid rgba(255,255,255,0.05)',
                              background: yr.year === new Date().getFullYear() ? 'rgba(34,197,94,0.08)' : 'transparent',
                            }}>
                              <td style={{ padding: '4px 6px', fontWeight: yr.year === new Date().getFullYear() ? 600 : 400 }}>
                                {yr.year}{yr.year === new Date().getFullYear() ? ' *' : ''}
                              </td>
                              <td style={{ padding: '4px 6px', textAlign: 'right' }}>
                                {yr.baseSalary > 0 ? `$${(yr.baseSalary / 1_000_000).toFixed(1)}M` : '-'}
                              </td>
                              <td style={{ padding: '4px 6px', textAlign: 'right' }}>
                                {(yr.signingBonus + (yr.rosterBonus || 0) + (yr.workoutBonus || 0)) > 0
                                  ? `$${((yr.signingBonus + (yr.rosterBonus || 0) + (yr.workoutBonus || 0)) / 1_000_000).toFixed(1)}M`
                                  : '-'}
                              </td>
                              <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 600 }}>
                                {yr.capHit > 0 ? `$${(yr.capHit / 1_000_000).toFixed(1)}M` : '-'}
                              </td>
                              <td style={{ padding: '4px 6px', textAlign: 'right', color: yr.deadCap > 0 ? '#ef4444' : undefined }}>
                                {yr.deadCap > 0 ? `$${(yr.deadCap / 1_000_000).toFixed(1)}M` : '-'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Contract Notes */}
                {data?.player?.otcContractNotes && (
                  <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', opacity: 0.4, letterSpacing: 0.5 }}>Contract Notes</span>
                    <p style={{ fontSize: 11, lineHeight: 1.6, margin: '6px 0 0', opacity: 0.7 }}>
                      {data.player.otcContractNotes}
                    </p>
                  </div>
                )}

                {/* Contract Description — always show if available */}
                {(data?.player?.contractInfo || data?.playerContract?.contractInfo) && (
                  <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', opacity: 0.4, letterSpacing: 0.5 }}>Contract Details</span>
                    <p style={{ fontSize: 11, lineHeight: 1.6, margin: '6px 0 0', opacity: 0.7 }}>
                      {data?.player?.contractInfo || data?.playerContract?.contractInfo}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Auction tab */}
            {activeTab === 'auction' && isAuction?.status && (
              <div className="pip-tab-auction">
                {!isAuction?.hasAuctionEnded ? (
                  <LiveAuctionBid data={data} getData={getData} closeModal={closeModal} />
                ) : (
                  <WinningBid data={data} />
                )}
              </div>
            )}
          </div>

          {/* ── Action Bar ── */}
          <div className="pip-actions">
            {/* OWN ROSTER */}
            {isOwnRoster && !isLocked() && (
              <>
                <Button
                  className="pip-action-btn pip-action-primary"
                  loading={auctionLoading}
                  onClick={handleCreateAuction}
                  type="primary"
                >
                  Auction
                </Button>

                <TradePlayer disabled={isPlayerLocked} pInterfaceModalClose={closeModal} />

                <ReleasePlayer
                  disabled={isPlayerLocked}
                  playerId={playerIdSmall}
                  pInterfaceModalClose={closeModal}
                />

                <MoveToInjured
                  disabled={
                    data?.playerDetails?.InjuryStatus?.toLowerCase() !== 'out' ||
                    data?.playerDetails?.InjuryStatus !== 'Injured Reserve' ||
                    isPlayerLocked
                  }
                  playerId={playerIdSmall}
                  pInterfaceModalClose={closeModal}
                />

                <ActivateFromPracticeSquad
                  disabled={!inPracticeSquad || isPlayerLocked}
                  playerId={playerIdSmall}
                  activePlayers={data?.activePlayers}
                  pInterfaceModalClose={closeModal}
                />

                <MoveToPracticeSquad
                  disabled={inPracticeSquad || isPlayerLocked}
                  playerId={playerIdSmall}
                  activePlayersCount={data?.activePlayers?.length}
                  practicePlayers={data?.practicePlayers}
                  pInterfaceModalClose={closeModal}
                />
              </>
            )}
            {isOwnRoster && isLocked() && <PreviousDayView />}

            {/* FREE AGENT */}
            {isFreeAgent && (
              draftNotCompleted ? (
                <span style={{
                  padding: '4px 12px', borderRadius: 4,
                  background: 'rgba(110,105,128,0.1)',
                  color: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: 600,
                  letterSpacing: 0.5, textTransform: 'uppercase',
                }}>auction locked, draft in progress</span>
              ) : (
                <Button
                  className="pip-action-btn pip-action-primary"
                  loading={auctionLoading}
                  onClick={() => handleCreateAuction({ auctionFrom: 'nonowner' })}
                  type="primary"
                >
                  Auction Player
                </Button>
              )
            )}

            {/* TEAM ROSTER */}
            {isTeamRoster && state?.teamId && !isLocked() && (
              <>
                <Button
                  className="pip-action-btn"
                  type="primary"
                  disabled={true}
                  onClick={() => navigate('/team-trade')}
                >
                  Make Offer
                </Button>
                {data?.player?.inPracticeSquad && !data?.player?.isPlayerProtected && (
                  <PoachPlayer data={data} state={state} />
                )}
              </>
            )}
            {isTeamRoster && state?.teamId && isLocked() && <PreviousDayView />}
          </div>
        </>
      )}
    </div>
  )
}

export default PlayerInterfacePopup

/* ─── NFL Season Stats Component ─── */

// Computed stat helpers — derive %, averages from raw totals
const computeDerivedStats = (s) => {
  if (!s) return s
  return {
    ...s,
    CompPct: s.PassingAttempts > 0 ? Math.min(((s.PassingCompletions / s.PassingAttempts) * 100), 100) : 0,
    YPC: s.RushingAttempts > 0 ? (s.RushingYards / s.RushingAttempts) : 0,
    CatchPct: s.ReceivingTargets > 0 ? Math.min(((s.Receptions / s.ReceivingTargets) * 100), 100) : 0,
    YPR: s.Receptions > 0 ? (s.ReceivingYards / s.Receptions) : 0,
    FGPct: s.FieldGoalsAttempted > 0 ? Math.min(((s.FieldGoalsMade / s.FieldGoalsAttempted) * 100), 100) : 0,
  }
}

const POSITION_STAT_CONFIG = {
  QB: [
    { key: 'PassingYards', label: 'Pass Yds', max: 5500, color: '#0EA5E9' },
    { key: 'PassingTouchdowns', label: 'Pass TD', max: 55, color: '#22C55E' },
    { key: 'CompPct', label: 'Comp %', max: 100, color: '#A855F7', suffix: '%', decimals: 1 },
    { key: 'PassingInterceptions', label: 'INT', max: 25, color: '#EF4444' },
    { key: 'RushingYards', label: 'Rush Yds', max: 1000, color: '#F59E0B' },
    { key: 'QBRating', label: 'Rating', max: 158.3, color: '#06B6D4', decimals: 1 },
  ],
  RB: [
    { key: 'RushingYards', label: 'Rush Yds', max: 2100, color: '#0EA5E9' },
    { key: 'RushingTouchdowns', label: 'Rush TD', max: 20, color: '#22C55E' },
    { key: 'YPC', label: 'YPC Avg', max: 7, color: '#A855F7', decimals: 1 },
    { key: 'Receptions', label: 'Rec', max: 110, color: '#F59E0B' },
    { key: 'ReceivingYards', label: 'Rec Yds', max: 1200, color: '#06B6D4' },
    { key: 'CatchPct', label: 'Catch %', max: 100, color: '#EC4899', suffix: '%', decimals: 1 },
  ],
  WR: [
    { key: 'Receptions', label: 'Rec', max: 160, color: '#0EA5E9' },
    { key: 'ReceivingYards', label: 'Rec Yds', max: 2000, color: '#22C55E' },
    { key: 'ReceivingTouchdowns', label: 'Rec TD', max: 18, color: '#A855F7' },
    { key: 'CatchPct', label: 'Catch %', max: 100, color: '#F59E0B', suffix: '%', decimals: 1 },
    { key: 'YPR', label: 'Yds/Rec', max: 20, color: '#06B6D4', decimals: 1 },
    { key: 'RushingYards', label: 'Rush Yds', max: 400, color: '#EC4899' },
  ],
  TE: [
    { key: 'Receptions', label: 'Rec', max: 120, color: '#0EA5E9' },
    { key: 'ReceivingYards', label: 'Rec Yds', max: 1400, color: '#22C55E' },
    { key: 'ReceivingTouchdowns', label: 'Rec TD', max: 14, color: '#A855F7' },
    { key: 'CatchPct', label: 'Catch %', max: 100, color: '#F59E0B', suffix: '%', decimals: 1 },
    { key: 'YPR', label: 'Yds/Rec', max: 18, color: '#06B6D4', decimals: 1 },
    { key: 'RushingYards', label: 'Rush Yds', max: 100, color: '#EC4899' },
  ],
  K: [
    { key: 'FieldGoalsMade', label: 'FG Made', max: 40, color: '#0EA5E9' },
    { key: 'FGPct', label: 'FG %', max: 100, color: '#22C55E', suffix: '%', decimals: 1 },
    { key: 'ExtraPointsMade', label: 'XP Made', max: 65, color: '#A855F7' },
    { key: 'PuntYards', label: 'Punt Yds', max: 3500, color: '#F59E0B' },
    { key: 'Punts', label: 'Punts', max: 90, color: '#06B6D4' },
    { key: 'KickReturnYards', label: 'KR Yds', max: 1200, color: '#EC4899' },
  ],
  DEF: [
    { key: 'SoloTackles', label: 'Tackles', max: 180, color: '#0EA5E9' },
    { key: 'Sacks', label: 'Sacks', max: 24, color: '#22C55E' },
    { key: 'Interceptions', label: 'INT', max: 10, color: '#A855F7' },
    { key: 'PassesDefended', label: 'Pass Def', max: 25, color: '#F59E0B' },
    { key: 'FumblesForced', label: 'FF', max: 8, color: '#06B6D4' },
    { key: 'DefensiveTouchdowns', label: 'Def TD', max: 4, color: '#EC4899' },
  ],
}

// Map raw positions to our config groups
const POS_GROUP_MAP = {
  QB: 'QB',
  RB: 'RB', FB: 'RB',
  WR: 'WR',
  TE: 'TE',
  K: 'K', P: 'K', ST: 'K',
  DB: 'DEF', CB: 'DEF', S: 'DEF', SS: 'DEF', FS: 'DEF',
  LB: 'DEF', ILB: 'DEF', OLB: 'DEF', MLB: 'DEF',
  DL: 'DEF', DE: 'DEF', DT: 'DEF', NT: 'DEF',
  EDGE: 'DEF',
}

const NFLSeasonStats = ({ seasonStats, position }) => {
  const [selectedSeason, setSelectedSeason] = useState(null)

  if (!seasonStats || seasonStats.length === 0) return null

  const posGroup = POS_GROUP_MAP[position] || 'DEF'
  const statConfig = POSITION_STAT_CONFIG[posGroup] || POSITION_STAT_CONFIG.DEF

  // Sort seasons descending (2026, 2025, 2024)
  const sorted = [...seasonStats].sort((a, b) => b._id - a._id)
  const activeSeason = selectedSeason || sorted[0]?._id
  const rawSeason = sorted.find((s) => s._id === activeSeason) || sorted[0]
  const season = computeDerivedStats(rawSeason)

  return (
    <div className="pip-nfl-stats">
      <div className="pip-section-head">
        <h3>Season Stats</h3>
        <span className="pip-games-badge">{season.gamesPlayed} GP</span>
      </div>

      {/* Season selector pills */}
      <div className="pip-season-pills">
        {sorted.map((s) => (
          <button
            key={s._id}
            className={`pip-season-pill ${s._id === activeSeason ? 'pip-season-pill-active' : ''}`}
            onClick={() => setSelectedSeason(s._id)}
          >
            {s._id}
          </button>
        ))}
      </div>

      {/* Stat bars */}
      <div className="pip-stat-bars-grid">
        {statConfig.map((cfg) => {
          const val = season[cfg.key] || 0
          const decimals = cfg.decimals != null ? cfg.decimals : 0
          const displayVal = val.toFixed(decimals) + (cfg.suffix || '')
          const pct = Math.min((val / cfg.max) * 100, 100)
          return (
            <div key={cfg.key} className="pip-stat-bar-item">
              <div className="pip-stat-bar-header">
                <span className="pip-stat-bar-label">{cfg.label}</span>
                <span className="pip-stat-bar-value" style={{ color: cfg.color }}>
                  {displayVal}
                </span>
              </div>
              <div className="pip-stat-bar-track">
                <div
                  className="pip-stat-bar-fill"
                  style={{ width: `${pct}%`, background: cfg.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Sub-components ─── */

const PreviousDayView = () => (
  <div className="pip-locked-msg">
    <p>Viewing previous day data, view only mode</p>
  </div>
)

const WinningBid = ({ data }) => (
  <div className="pip-winning">
    <div className="pip-winning-card">
      <img src={Image} alt="SAM" className="pip-winning-logo" />
      <div>
        <span className="pip-winning-label">Winning Bid</span>
        <span className="pip-winning-amount">
          {`${data?.highestCurrentBid?.toLocaleString()} SP`}
        </span>
      </div>
    </div>
    <BidHistoryBox data={data?.bidHistory} height="160px" />
  </div>
)

const LiveAuctionBid = ({ data, getData, closeModal }) => {
  const [noti, contextHolder] = notification.useNotification()
  const sampoints = useSelector((state) => state.user?.SamPoints?.SamPoints)
  const [remainingTime, setRemainingTime] = useState('')
  const [isLoading, setIsLoading] = useState({ type: 'data', status: true })
  const [manualBid, setManualBid] = useState('')
  const [bidError, setBidError] = useState('')
  const USER = useSelector((state) => state.user.userDetails)
  useEffect(() => {
    bidError && setBidError(false)
  }, [manualBid])

  const ended = async () => {
    const res = await auctionEnded({ auctionId: data?._id })
    if (res) await getData()
  }

  useEffect(() => {
    let interval
    if (!data?.hasAuctionEnded) {
      interval = setInterval(() => {
        const now = moment()
        const end = moment(data?.endDate)
        const duration = moment.duration(end.diff(now))

        if (duration.asSeconds() <= 0) {
          clearInterval(interval)
          setRemainingTime('Time is up!')
          ended()
        } else {
          const days = Math.floor(duration.asDays())
          const hours = String(duration.hours()).padStart(2, '0')
          const minutes = String(duration.minutes()).padStart(2, '0')
          const seconds = String(duration.seconds()).padStart(2, '0')
          setRemainingTime(
            days === 0
              ? `${hours}:${minutes}:${seconds}`
              : `${days}d ${hours}:${minutes}:${seconds}`,
          )
        }
      }, 1000)
    } else {
      setRemainingTime('Time is up!')
    }
    return () => clearInterval(interval)
  }, [data?.endDate])

  const handleManualBid = async () => {
    if (manualBid?.trim() === '') {
      setBidError('Enter a bid amount')
      return
    }
    setIsLoading({ type: 'submit', status: true })
    const res = await addBid({ auctionId: data?._id, bidAmount: Number(manualBid) }, noti)
    if (res) {
      await getData()
    }
    setIsLoading({ type: 'submit', status: false })
  }

  const handleQuickBid = async () => {
    setIsLoading({ type: 'quick', status: true })
    const bidAmount = Number(data?.highestCurrentBid) + 50000
    try {
      const res = await addBid({ auctionId: data?._id, bidAmount }, noti)
      if (res) await getData()
    } catch (error) {
      noti.error('An error occurred while placing your bid.')
    } finally {
      setIsLoading({ type: 'quick', status: false })
    }
  }

  let isDisabled =
    data?.auctionStartedBy?.team._id === USER?.team?._id &&
    String(data?.auctionFrom) === 'owner'

  return (
    <>
      {contextHolder}
      <div className="pip-auction-grid">
        {/* Clock */}
        <div className="pip-auction-clock">
          <span className="pip-aclock-label">Auction Clock</span>
          <span className="pip-aclock-time">{remainingTime || '00:00:00'}</span>
        </div>

        {/* Top Bid */}
        <div className="pip-auction-topbid">
          <div className="pip-topbid-info">
            <img
              src={data?.bidHistory?.find((x) => x?.bid === data?.highestCurrentBid)?.team?.logo}
              alt=""
              className="pip-topbid-logo"
            />
            <div>
              <span className="pip-topbid-label">Top Bid</span>
              <span className="pip-topbid-amount">
                <img width={12} src={sampointslogo} alt="" />
                {data?.highestCurrentBid?.toLocaleString()}
              </span>
            </div>
          </div>
          <button
            className="pip-quick-bid"
            onClick={!isDisabled ? handleQuickBid : undefined}
            disabled={isDisabled}
          >
            {isLoading?.status && isLoading?.type === 'quick' ? (
              <Spin size="small" />
            ) : (
              <>
                <span>Quick Bid</span>
                <span className="pip-qb-amount">
                  <img width={10} src={sampointslogo} alt="" /> 50K
                </span>
              </>
            )}
          </button>
        </div>

        {/* Manual Bid */}
        <div className="pip-auction-manual">
          <div className="pip-manual-input-wrap">
            <Input
              value={manualBid}
              type="number"
              placeholder="Enter bid amount"
              onChange={(e) => setManualBid(e.target.value)}
              className="pip-manual-input"
            />
            {bidError && <span className="pip-bid-error">{bidError}</span>}
          </div>
          <button
            className="pip-submit-bid"
            onClick={!isDisabled ? handleManualBid : undefined}
            disabled={isDisabled}
          >
            {isLoading?.status && isLoading?.type === 'submit' ? <Spin size="small" /> : 'Submit'}
          </button>
        </div>

        {/* Bid History */}
        <BidHistoryBox data={data?.bidHistory} height="120px" />
      </div>
    </>
  )
}

const BidHistoryBox = ({ data, height }) => (
  <div className="pip-bid-history">
    <div className="pip-bh-header">
      <span>Bid History</span>
    </div>
    <div className="pip-bh-list" style={{ maxHeight: height }}>
      <div className="pip-bh-row pip-bh-row-head">
        <div className="pip-bh-cell" style={{ width: 28 }}></div>
        <div className="pip-bh-cell pip-bh-cell-name">User</div>
        <div className="pip-bh-cell pip-bh-cell-amount">Amount</div>
      </div>
      {data
        ?.slice()
        ?.sort((a, b) => b.bid - a.bid)
        ?.map((v, i) => (
          <div key={i} className="pip-bh-row">
            <img src={v?.team?.logo} alt="" className="pip-bh-logo" />
            <div className="pip-bh-cell pip-bh-cell-name">{v?.user?.userName}</div>
            <div className="pip-bh-cell pip-bh-cell-amount">
              {v?.bid && `${v?.bid?.toLocaleString()} SP`}
            </div>
          </div>
        ))}
    </div>
  </div>
)
