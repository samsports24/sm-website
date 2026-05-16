import React, { useEffect, useState } from 'react'
import { Button, Image, Spin, Table, Tooltip } from 'antd'
import { UnorderedListOutlined, StopOutlined } from '@ant-design/icons'
import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { useDispatch, useSelector } from 'react-redux'

import useDebounce from '../../../hooks/useDebounce'
import rookieimg from '../../../assets/rookie_indo_sam.png'

import {
  createDraftQueue,
  deleteDraftQueue,
  getAllPlayers,
  getDraftQueue,
  setPage,
  setPosition,
  setSearch,
  setSelectedPlayer,
  getALLplayerStats,
  createBlackListQueue,
  deleteBlacklistQueue,
  getBlackListQueue,
} from '../../../redux/actions/draftAction'
import PlayerDetailsModal from '../../../components/modal/PlayerDetailsModal'

/* ── colour palette ─────────────────────────── */
const POS_COLORS = {
  QB: '#EF4444', RB: '#3B82F6', WR: '#F59E0B', TE: '#22C55E',
  OL: '#8B5CF6', EDGE: '#EC4899', IDL: '#EC4899', DE: '#EC4899', DT: '#EC4899', LB: '#06B6D4',
  CB: '#F97316', S: '#14B8A6', 'K/P': '#A78BFA',
}

const DraftPool = ({ tableScroll }) => {
  const {
    allPlayers,
    position,
    search,
    page,
    limit,
    tableLoading,
    draftQueues,
    activeTab,
    blacklistQueues,
    Rookieplayers,
  } = useSelector((state) => state.draft)
  const { userDetails } = useSelector((state) => state.user)
  const [loading, setLoading] = useState('')
  const SETTING = useSelector((state) => state?.user?.setting)

  const [age, setAge] = useState('')
  const dispatch = useDispatch()

  // Track whether we've done the initial load — only show the built-in
  // Ant Design loading spinner on the very first fetch.  Subsequent
  // refetches use a lightweight CSS overlay so the Table's scroll
  // container is never unmounted / reset to the top.
  const [initialLoaded, setInitialLoaded] = useState(false)
  useEffect(() => {
    if (!initialLoaded && !tableLoading && allPlayers?.players?.length) {
      setInitialLoaded(true)
    }
  }, [tableLoading, allPlayers, initialLoaded])

  useEffect(() => {
    if (activeTab == 1)
      getData({
        position,
        search,
        limit,
        page,
        age,
        Rookieplayers,
      })
    getBlackListQueue()
    getDraftQueue()
  }, [position, limit, page, age, activeTab, Rookieplayers])

  const getData = async (payload) => {
    await getAllPlayers(payload, position)
  }

  const handleAgeClick = () => {
    const newSortingOrder = age === 'asc' ? 'desc' : 'asc'
    setAge(newSortingOrder)
  }

  const handleAddQueue = async (id) => {
    setLoading(id)
    await createDraftQueue({ team: userDetails?.team?._id, player: id })
    setLoading('')
  }

  const handleDeleteQueue = async (playerId, queueId) => {
    await deleteDraftQueue(queueId)
  }

  const handleDeleteBlackListQueue = async (playerId, blacklistid) => {
    setLoading(playerId)
    await deleteBlacklistQueue(blacklistid)
    setLoading('')
  }

  const handleAddBlackList = async (id) => {
    setLoading(id)
    await createBlackListQueue({ team: userDetails?.team?._id, player: id, season: SETTING?.season })
    setLoading('')
  }

  /* ── helper: compact cell ── */
  const cell = (val, opts = {}) => (
    <span style={{
      fontSize: opts.size || 12,
      fontWeight: opts.bold ? 700 : 500,
      color: opts.color || 'rgba(255,255,255,0.85)',
      fontFamily: opts.mono ? "'Barlow Condensed', sans-serif" : "'Inter', sans-serif",
      letterSpacing: opts.mono ? '0.3px' : undefined,
    }}>
      {val ?? '-'}
    </span>
  )

  /* ── COLUMNS ─────────────────────────── */
  const getColumns = (position) => {
    const baseColumns = [
      /* Actions — queue + blacklist */
      {
        width: 70,
        title: '',
        dataIndex: 'actions',
        key: 'actions',
        fixed: 'left',
        render: (_, obj) => {
          const isQueue = draftQueues?.find((v) => v?.player?._id === obj?.player?._id)
          const isblacklist = blacklistQueues?.find((v) => v?.player?._id === obj?.player?._id)
          if (loading === obj?.player?._id) return <Spin size="small" />
          return (
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
              <Tooltip title={isQueue ? 'Remove from queue' : 'Add to queue'}>
                <Button
                  size="small"
                  icon={<UnorderedListOutlined style={{ fontSize: 12 }} />}
                  onClick={() => isQueue ? handleDeleteQueue(obj?._id, isQueue?._id) : handleAddQueue(obj?.player?._id)}
                  style={{
                    background: isQueue ? 'rgba(212,168,67,0.25)' : 'rgba(212,168,67,0.06)',
                    border: `1px solid ${isQueue ? 'rgba(212,168,67,0.6)' : 'rgba(212,168,67,0.2)'}`,
                    color: '#D4A843',
                    borderRadius: '6px', width: 26, height: 26, padding: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                />
              </Tooltip>
              <Tooltip title={isblacklist ? 'Remove from blacklist' : 'Blacklist'}>
                <Button
                  size="small"
                  icon={<StopOutlined style={{ fontSize: 12 }} />}
                  onClick={() => isblacklist ? handleDeleteBlackListQueue(obj?.player?._id, isblacklist?._id) : handleAddBlackList(obj?.player?._id)}
                  style={{
                    background: isblacklist ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.06)',
                    border: `1px solid ${isblacklist ? 'rgba(239,68,68,0.6)' : 'rgba(239,68,68,0.2)'}`,
                    color: '#EF4444',
                    borderRadius: '6px', width: 26, height: 26, padding: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                />
              </Tooltip>
            </div>
          )
        },
      },

      /* Player — name + headshot + injury/rookie badges in one compact cell */
      {
        width: 190,
        title: 'PLAYER',
        dataIndex: 'player',
        key: 'player',
        fixed: 'left',
        render: (_, obj) => {
          const p = obj?.player
          const inj = p?.InjuryStatus
          const rookie = p?.ExperienceString === 'Rookie'
          const hasImg = !!p?.HostedHeadshotNoBackgroundUrl
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Mini headshot */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {hasImg
                  ? <img src={p.HostedHeadshotNoBackgroundUrl} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <GiAmericanFootballPlayer size={18} color="rgba(255,255,255,0.2)" />
                }
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'nowrap' }}>
                  <PlayerDetailsModal
                    button={
                      <span style={{
                        fontSize: 13, fontWeight: 600, color: 'var(--primary)',
                        fontFamily: "'Inter', sans-serif",
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120,
                        cursor: 'pointer',
                      }}>
                        {p?.Name}
                      </span>
                    }
                    state={{
                      isFreeAgent: { status: true },
                      playerID: p?.PlayerID,
                      teamId: null,
                      teamName: p?.Team || '',
                      teamLogo: null,
                    }}
                    tableRow={true}
                  />
                  {rookie && (
                    <Image width={14} className='rookie_image2' src={rookieimg} alt='R' preview={false} />
                  )}
                  {inj === 'Out' && <span style={{ fontSize: 9, fontWeight: 800, color: '#EF4444', background: 'rgba(239,68,68,0.15)', padding: '1px 4px', borderRadius: 3 }}>O</span>}
                  {inj === 'Questionable' && <span style={{ fontSize: 9, fontWeight: 800, color: '#F59E0B', background: 'rgba(245,158,11,0.15)', padding: '1px 4px', borderRadius: 3 }}>Q</span>}
                  {inj === 'Doubtful' && <span style={{ fontSize: 9, fontWeight: 800, color: '#F97316', background: 'rgba(249,115,22,0.15)', padding: '1px 4px', borderRadius: 3 }}>D</span>}
                  {inj === 'Suspended' && <span style={{ fontSize: 9, fontWeight: 700, color: '#A855F7', background: 'rgba(168,85,247,0.15)', padding: '1px 4px', borderRadius: 3 }}>SSPD</span>}
                  {inj === 'Injured Reserve' && <span style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', background: 'rgba(239,68,68,0.15)', padding: '1px 4px', borderRadius: 3 }}>IR</span>}
                </div>
              </div>
            </div>
          )
        },
      },

      /* Position — colour-coded pill */
      {
        width: 55,
        title: 'POS',
        dataIndex: 'pos',
        key: 'pos',
        render: (_, obj) => {
          const pos = obj?.player?.otcPosition || obj?.player?.Position || '-'
          const c = POS_COLORS[pos] || '#6B7280'
          return (
            <span style={{
              fontSize: 10, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif",
              color: c, background: `${c}18`, padding: '2px 7px', borderRadius: 4,
              letterSpacing: '0.5px',
            }}>{pos}</span>
          )
        },
      },

      /* Team */
      {
        width: 50,
        title: 'TEAM',
        dataIndex: 'team',
        key: 'team',
        render: (_, obj) => cell(obj?.player?.Team, { size: 12, bold: true, color: '#22C55E' }),
      },

      /* Age */
      {
        width: 45,
        title: 'AGE',
        dataIndex: 'age',
        key: 'age',
        sorter: handleAgeClick,
        render: (_, obj) => cell(obj?.player?.Age, { mono: true }),
      },

      /* Cap Hit */
      {
        width: 80,
        title: 'CAP HIT',
        dataIndex: 'caphit',
        key: 'caphit',
        render: (_, obj) => {
          const otcHit = obj?.player?.otcCapHit
          const txt = otcHit && otcHit > 0
            ? `$${(otcHit / 1_000_000).toFixed(1)}M`
            : obj?.player?.currentYearSalaryCap
              ? `${Number(obj.player.currentYearSalaryCap).toLocaleString()} SP`
              : '-'
          return cell(txt, { mono: true, color: '#D4A843' })
        },
      },

      /* Contract */
      {
        width: 90,
        title: 'CONTRACT',
        dataIndex: 'contract',
        key: 'contract',
        render: (_, obj) => {
          const totalVal = obj?.player?.otcTotalValue
          const yrsLeft = obj?.player?.yearsLeftSalaryCap
          const txt = totalVal && totalVal > 0
            ? `$${(totalVal / 1_000_000).toFixed(0)}M / ${yrsLeft || '-'}yr`
            : obj?.player?.contractInfo || '-'
          return cell(txt, { size: 11, mono: true })
        },
      },

      /* SAM ADP */
      {
        width: 70,
        title: 'ADP',
        dataIndex: 'adp',
        key: 'adp',
        render: (_, obj) => {
          const adp = obj?.player?.samAdp24
          return cell(adp && adp > 0 ? adp.toFixed(1) : '-', { mono: true, color: '#3B82F6' })
        },
      },
    ]

    /* ── position-specific stat columns ─── */
    const statCell = (val) => cell(val, { mono: true, size: 11 })

    const projCols = [
      { width: 70, title: 'PROJ PTS', dataIndex: 'projTotal', key: 'projTotal',
        render: (_, obj) => statCell(
          obj?.player?.projectedFantasyPoints > 0
            ? obj.player.projectedFantasyPoints.toFixed(1)
            : obj?.stats?.stats?.FantasyPoints24?.toFixed(1)
        ),
      },
      { width: 65, title: 'PROJ AVG', dataIndex: 'projAvg', key: 'projAvg',
        render: (_, obj) => statCell(
          obj?.player?.projectedAvgFantasyPoints > 0
            ? obj.player.projectedAvgFantasyPoints.toFixed(1)
            : obj?.stats?.stats?.AvgFantasyPoints24?.toFixed(1)
        ),
      },
    ]

    const totalPtsCols = [
      { width: 65, title: 'TOT PTS', dataIndex: 'totPts', key: 'totPts',
        render: (_, obj) => statCell(obj?.player?.pf?.toFixed(1)),
      },
      { width: 65, title: 'AVG PTS', dataIndex: 'avgPts', key: 'avgPts',
        render: (_, obj) => statCell(obj?.player?.avgPf?.toFixed(1)),
      },
    ]

    /* QB / RB / WR / TE — passing, rushing, receiving */
    const offenseStats = [
      ...projCols,
      { width: 55, title: 'P.YRD', dataIndex: 'pyd', key: 'pyd',
        render: (_, obj) => statCell(obj?.stats?.stats?.PassingYards?.toFixed?.(0) ?? obj?.stats?.stats?.PassingYards),
      },
      { width: 45, title: 'P.TD', dataIndex: 'ptd', key: 'ptd',
        render: (_, obj) => statCell(obj?.stats?.stats?.PassingTouchdowns),
      },
      { width: 50, title: 'TAR', dataIndex: 'tar', key: 'tar',
        render: (_, obj) => statCell(obj?.stats?.stats?.ReceivingTargets),
      },
      { width: 55, title: 'R.YRD', dataIndex: 'ryd', key: 'ryd',
        render: (_, obj) => statCell(obj?.stats?.stats?.ReceivingYards),
      },
      { width: 45, title: 'R.TD', dataIndex: 'rtd', key: 'rtd',
        render: (_, obj) => statCell(obj?.stats?.stats?.ReceivingTouchdowns),
      },
      { width: 50, title: 'RSH', dataIndex: 'rsh', key: 'rsh',
        render: (_, obj) => statCell(obj?.stats?.stats?.RushingAttempts),
      },
      { width: 55, title: 'RS.YD', dataIndex: 'rsyd', key: 'rsyd',
        render: (_, obj) => statCell(obj?.stats?.stats?.RushingYards),
      },
      { width: 45, title: 'RS.TD', dataIndex: 'rstd', key: 'rstd',
        render: (_, obj) => statCell(obj?.stats?.stats?.RushingTouchdowns),
      },
    ]

    /* DEF positions */
    const defenseStats = [
      ...projCols,
      { width: 55, title: 'TKLS', dataIndex: 'tkls', key: 'tkls',
        render: (_, obj) => statCell(obj?.stats?.stats?.TKLS),
      },
      { width: 50, title: 'SCKS', dataIndex: 'scks', key: 'scks',
        render: (_, obj) => statCell(obj?.stats?.stats?.SCKS),
      },
      { width: 50, title: 'QBH', dataIndex: 'qbh', key: 'qbh',
        render: (_, obj) => statCell(obj?.stats?.stats?.QBH),
      },
      { width: 45, title: 'TFL', dataIndex: 'tfl', key: 'tfl',
        render: (_, obj) => statCell(obj?.stats?.stats?.TFL),
      },
      { width: 40, title: 'FF', dataIndex: 'ff', key: 'ff',
        render: (_, obj) => statCell(obj?.stats?.stats?.FF),
      },
      { width: 45, title: 'INT', dataIndex: 'ints', key: 'ints',
        render: (_, obj) => statCell(obj?.stats?.stats?.INTS),
      },
      { width: 40, title: 'PD', dataIndex: 'pd', key: 'pd',
        render: (_, obj) => statCell(obj?.stats?.stats?.PD),
      },
      { width: 50, title: 'IDP', dataIndex: 'idp', key: 'idp',
        render: (_, obj) => statCell(obj?.stats?.stats?.IDP),
      },
    ]

    /* K/P */
    const kickerStats = [
      ...projCols,
      { width: 60, title: 'FG MD', dataIndex: 'fgmade', key: 'fgmade',
        render: (_, obj) => statCell(obj?.stats?.stats?.FieldGoalsMade),
      },
      { width: 65, title: 'FG MIS', dataIndex: 'fgmiss', key: 'fgmiss',
        render: (_, obj) => statCell(obj?.stats?.stats?.FGMissed?.toFixed?.(1) ?? obj?.stats?.stats?.FGMissed),
      },
      { width: 55, title: 'PUNTS', dataIndex: 'punts', key: 'punts',
        render: (_, obj) => statCell(obj?.stats?.stats?.Punts),
      },
      { width: 55, title: 'P i20', dataIndex: 'pi20', key: 'pi20',
        render: (_, obj) => statCell(obj?.stats?.stats?.PuntInside20),
      },
    ]

    if (position === 'ALL' || position === 'OL') return [...baseColumns, ...totalPtsCols, ...projCols]
    if (['QB', 'RB', 'WR', 'TE'].includes(position)) return [...baseColumns, ...offenseStats]
    if (['DE', 'DT', 'EDGE', 'IDL', 'LB', 'CB', 'S'].includes(position)) return [...baseColumns, ...defenseStats]
    if (position === 'K/P') return [...baseColumns, ...kickerStats]
    return baseColumns
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* After initial load, show a lightweight overlay instead of Ant Design's
          built-in loading prop so the scroll container is never remounted */}
      {initialLoaded && tableLoading && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          background: 'rgba(0,0,0,0.25)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', borderRadius: 8,
        }}>
          <Spin />
        </div>
      )}
      <Table
        loading={!initialLoaded && tableLoading}
        dataSource={allPlayers?.players}
        columns={getColumns(position)}
        scroll={tableScroll}
        bordered={false}
        rowKey='_id'
        rowClassName={(_, index) => (index % 2 === 1 ? 'table-row-light' : 'table-row-dark')}
        pagination={{
          pageSize: limit,
          current: page,
          total: allPlayers?.total,
          showSizeChanger: false,
          size: 'default',
          onChange: (page) => {
            dispatch(setPage(page))
          },
        }}
      />
    </div>
  )
}

export default DraftPool
