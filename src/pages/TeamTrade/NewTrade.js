import React, { useEffect, useState } from 'react'
import { Button, Select, notification, InputNumber, Spin, Tag, Progress, Tooltip } from 'antd'
import {
  SwapOutlined,
  PlusOutlined,
  CloseOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  DollarOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'

import AddPlayerToTrade from '../../components/modal/PlayerInterfaceModals/AddPlayerToTrade'
import TradeShareCard from '../../components/TradeShareCard'
import Loader from '../../components/Loader'
import Empty from '../../components/Empty'

import { createTeamTrade, getOtherTeamTrade, analyzeTrade, initializeDraftPicks } from '../../redux/actions/teamTradeAction'
import { getAllTeam } from '../../redux/actions/teamActions'
import { getRoster } from '../../redux/actions/rosterAction'
import { getLeagueDetails } from '../../redux'

const NewTrade = () => {
  const SETTING = useSelector((state) => state?.user)
  const { currentLeague } = useSelector((state) => state?.league)
  const myleagueSalaryCap = useSelector((state) => state.user?.leagueSalaryCap?.leagueSalaryCap)

  const [loading, setLoading] = useState(true)
  const [loading2, setLoading2] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const [teams, setTeams] = useState([])
  const [myTeam, setMyTeam] = useState(null)
  const [otherTeam, setOtherTeam] = useState(null)

  const [myTeamSelected, setMyTeamSelected] = useState([])
  const [otherTeamSelected, setOtherTeamSelected] = useState([])
  const [selectTeam, setSelectTeam] = useState(null)

  const [myTeamDraft, setMyTeamDraft] = useState([])
  const [otherTeamDraft, setOtherTeamDraft] = useState([])
  const [myTeamSelectedDraft, setMyTeamSelectedDraft] = useState([])
  const [otherTeamSelectedDraft, setOtherTeamSelectedDraft] = useState([])

  // SAM Points
  const [myTeamSamPoints, setMyTeamSamPoints] = useState(0)
  const [otherTeamSamPoints, setOtherTeamSamPoints] = useState(0)

  // AI Analysis
  const [aiResult, setAiResult] = useState(null)

  useEffect(() => {
    const init = async () => {
      await initializeDraftPicks()
      getTeams()
      getMyTeam()
      getLeagueDetails()
    }
    init()
  }, [])

  const getTeams = async () => {
    if (currentLeague?._id) {
      try {
        const res = await getAllTeam({ currentLeague: currentLeague?._id })
        setTeams(res)
      } catch (error) {
        console.error('Failed to fetch teams', error)
      }
    }
  }

  useEffect(() => {
    getTeams()
  }, [currentLeague])

  useEffect(() => {
    selectTeam && getOtherTeamData()
  }, [selectTeam])

  const getMyTeam = async () => {
    !loading && setLoading(true)
    const res = await getRoster(SETTING?.setting?.week)
    if (res) {
      setMyTeam(res)
      setMyTeamDraft(res?.drafts)
    }
    setLoading(false)
  }

  const getOtherTeamData = async () => {
    setLoading2(true)
    const res = await getOtherTeamTrade({ id: selectTeam })
    setOtherTeam({ ...res, active: res?.active || [] })
    setOtherTeamDraft(res?.drafts)
    setLoading2(false)
  }

  const clear = () => {
    setMyTeamSelected([])
    setMyTeamSelectedDraft([])
    setOtherTeamSelected([])
    setOtherTeamSelectedDraft([])
    setOtherTeam(null)
    setOtherTeamDraft([])
    setSelectTeam(null)
    setMyTeamSamPoints(0)
    setOtherTeamSamPoints(0)
    setAiResult(null)
  }

  // ── AI Analysis ───────────────────────────────────────────
  const handleAnalyzeTrade = async () => {
    const hasItems =
      (myTeamSelected.length > 0 || myTeamSelectedDraft.length > 0 || myTeamSamPoints > 0) &&
      (otherTeamSelected.length > 0 || otherTeamSelectedDraft.length > 0 || otherTeamSamPoints > 0)

    if (!hasItems) {
      notification.warning({ message: 'Add players, picks, or SAM Points to both sides first', duration: 3 })
      return
    }

    setAnalyzeLoading(true)
    const result = await analyzeTrade({
      buyerPlayers: myTeamSelected.map((v) => v?.players?._id),
      sellerPlayers: otherTeamSelected.map((v) => v?.players?._id),
      buyerDrafts: myTeamSelectedDraft.map((v) => v._id),
      sellerDrafts: otherTeamSelectedDraft.map((v) => v._id),
      buyerSamPoints: myTeamSamPoints,
      sellerSamPoints: otherTeamSamPoints,
    })
    if (result) {
      setAiResult(result)
    }
    setAnalyzeLoading(false)
  }

  // ── Submit Trade ──────────────────────────────────────────
  const createTrade = async () => {
    const isMyTeam = myTeamSelected.length > 0 || myTeamSelectedDraft.length > 0 || myTeamSamPoints > 0
    const isOtherTeam = otherTeamSelected.length > 0 || otherTeamSelectedDraft.length > 0 || otherTeamSamPoints > 0

    if (isMyTeam && isOtherTeam) {
      setBtnLoading(true)
      const res = await createTeamTrade({
        buyerPlayers: myTeamSelected.map((v) => v?.players?._id),
        buyerDrafts: myTeamSelectedDraft.map((v) => v._id),
        sellerPlayers: otherTeamSelected.map((v) => v?.players?._id),
        sellerDrafts: otherTeamSelectedDraft.map((v) => v._id),
        sellerTeam: otherTeam?.team?._id,
        buyerSamPoints: myTeamSamPoints,
        sellerSamPoints: otherTeamSamPoints,
        aiAnalysis: aiResult
          ? {
              fairnessScore: aiResult.fairnessScore,
              verdict: aiResult.verdict,
              summary: aiResult.summary,
              buyerValue: aiResult.buyerValue,
              sellerValue: aiResult.sellerValue,
              flaggedForReview: aiResult.flaggedForReview,
              analyzedAt: aiResult.analyzedAt,
            }
          : undefined,
      })
      clear()
      notification.success({ message: res, duration: 3 })
      setBtnLoading(false)
    } else {
      notification.error({ message: 'Please add assets to both sides of the trade', duration: 3 })
    }
  }

  // Draft pick handlers
  const handleMyDraftSelect = (obj) => {
    setMyTeamDraft((prev) => prev.filter((v) => v._id !== obj._id))
    setMyTeamSelectedDraft((prev) => [...prev, obj])
    setAiResult(null)
  }
  const handleMyDraftRemove = (obj) => {
    setMyTeamSelectedDraft((prev) => prev.filter((v) => v._id !== obj._id))
    setMyTeamDraft((prev) => [...prev, obj])
    setAiResult(null)
  }
  const handleOtherDraftSelect = (obj) => {
    setOtherTeamDraft((prev) => prev.filter((v) => v._id !== obj._id))
    setOtherTeamSelectedDraft((prev) => [...prev, obj])
    setAiResult(null)
  }
  const handleOtherDraftRemove = (obj) => {
    setOtherTeamSelectedDraft((prev) => prev.filter((v) => v._id !== obj._id))
    setOtherTeamDraft((prev) => [...prev, obj])
    setAiResult(null)
  }

  // Cap calculations
  const myCapAfter = (() => {
    const sending = myTeamSelected.reduce((t, p) => t + (p?.players?.currentYearSalaryCap || 0), 0)
    const receiving = otherTeamSelected.reduce((t, p) => t + (p?.players?.currentYearSalaryCap || 0), 0)
    return (SETTING?.teamSalaryCap || 0) - sending + receiving
  })()

  const otherCapAfter = (() => {
    const sending = otherTeamSelected.reduce((t, p) => t + (p?.players?.currentYearSalaryCap || 0), 0)
    const receiving = myTeamSelected.reduce((t, p) => t + (p?.players?.currentYearSalaryCap || 0), 0)
    return (otherTeam?.salaryCap || 0) - sending + receiving
  })()

  // Verdict helpers
  const getVerdictColor = (verdict) => {
    if (verdict === 'fair') return '#22c55e'
    if (verdict === 'slightly_unfair') return '#f59e0b'
    if (verdict === 'unfair') return '#ef4444'
    return '#dc2626'
  }
  const getVerdictIcon = (verdict) => {
    if (verdict === 'fair') return <CheckCircleOutlined />
    if (verdict === 'slightly_unfair') return <WarningOutlined />
    if (verdict === 'unfair') return <ExclamationCircleOutlined />
    return <StopOutlined />
  }
  const getVerdictLabel = (verdict) => {
    if (verdict === 'fair') return 'FAIR TRADE'
    if (verdict === 'slightly_unfair') return 'SLIGHT EDGE'
    if (verdict === 'unfair') return 'UNFAIR'
    return 'LOPSIDED'
  }

  if (loading) return <Loader />

  return (
    <section className='trade-redesign'>
      {/* ── Team Selector ── */}
      <div className='trade-team-selector'>
        <span className='trade-team-selector-label'>Select opponent team:</span>
        <Select
          placeholder='Choose a team to trade with...'
          className='trade-team-select'
          value={selectTeam}
          onChange={(e) => {
            setSelectTeam(e)
            setOtherTeamSelected([])
            setOtherTeamSelectedDraft([])
            setOtherTeamSamPoints(0)
            setAiResult(null)
          }}
          options={teams
            ?.filter((x) => x?._id !== SETTING?.userDetails?.team?._id)
            ?.map((v) => ({
              value: v?._id,
              label: (
                <div className='select_box_label'>
                  <img src={v?.logo} alt='logo' />
                  <p>{v?.name}</p>
                </div>
              ),
            }))}
        />
      </div>

      {/* ── Three-Panel Layout ── */}
      <div className='trade-panels'>
        {/* ─── LEFT: YOUR TEAM ─── */}
        <div className='trade-panel trade-panel-left'>
          <div className='trade-panel-header'>
            <div className='trade-panel-team-info'>
              <h2>{myTeam?.active?.[0]?.team?.name || 'Your Team'}</h2>
              <span className='trade-panel-tag'>YOU GIVE</span>
            </div>
          </div>

          {/* Players */}
          <div className='trade-panel-section'>
            <div className='trade-section-label'>
              <span>Players</span>
              <AddPlayerToTrade
                teamName={myTeam?.active?.[0]?.team?.name}
                data={myTeam ? [...myTeam?.active] : []}
                selected={myTeamSelected}
                setSelected={(val) => {
                  setMyTeamSelected(val)
                  setAiResult(null)
                }}
              />
            </div>
            <div className='trade-assets'>
              {myTeamSelected.length > 0 ? (
                myTeamSelected.map((v) => (
                  <div key={v?.players?._id} className='trade-asset-card'>
                    <div className='trade-asset-info'>
                      {v?.players?.HostedHeadshotNoBackgroundUrl ? (
                        <img src={v.players.HostedHeadshotNoBackgroundUrl} alt='' className='trade-asset-img' />
                      ) : (
                        <div className='trade-asset-img-placeholder'>{(v?.players?.Name || '?').charAt(0)}</div>
                      )}
                      <span className='trade-asset-pos'>{v?.players?.Position}</span>
                      <span className='trade-asset-name'>{v?.players?.Name}</span>
                    </div>
                    <div className='trade-asset-right'>
                      <span className='trade-asset-cap'>
                        ${(v?.players?.currentYearSalaryCap || 0).toLocaleString()}
                      </span>
                      <CloseOutlined
                        className='trade-asset-remove'
                        onClick={() => {
                          setMyTeamSelected((prev) => prev.filter((x) => x?.players?._id !== v?.players?._id))
                          setAiResult(null)
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className='trade-empty-slot'>No players added</div>
              )}
            </div>
          </div>

          {/* Draft Picks */}
          <div className='trade-panel-section'>
            <div className='trade-section-label'>
              <span>Draft Picks</span>
            </div>
            <div className='trade-assets'>
              {myTeamSelectedDraft.map((v, i) => {
                const isTraded = v?.mainTeam && v?.team && String(v.mainTeam._id || v.mainTeam) !== String(v.team._id || v.team)
                return (
                  <div key={i} className='trade-asset-card trade-asset-draft'>
                    <span>{`${v?.season}' Rookie Draft Rd ${v?.round}`}{isTraded ? ` (via trade)` : ''}</span>
                    <CloseOutlined className='trade-asset-remove' onClick={() => handleMyDraftRemove(v)} />
                  </div>
                )
              })}
              {myTeamDraft?.length > 0 && (
                <div className='trade-draft-available'>
                  {myTeamDraft.sort((a, b) => a.season - b.season).map((v, i) => {
                    const isTraded = v?.mainTeam && v?.team && String(v.mainTeam._id || v.mainTeam) !== String(v.team._id || v.team)
                    return (
                      <Tooltip key={i} title={`${v?.season}' Rookie Draft Round ${v?.round}${isTraded ? ' (via trade)' : ''}`}>
                        <div className='trade-draft-chip' onClick={() => handleMyDraftSelect(v)}>
                          <PlusOutlined /> {`${v?.season}' Rd ${v?.round}`}{isTraded ? ' (via trade)' : ''}
                        </div>
                      </Tooltip>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SAM Points */}
          <div className='trade-panel-section'>
            <div className='trade-section-label'>
              <span><DollarOutlined /> SAM Points</span>
            </div>
            <InputNumber
              min={0}
              value={myTeamSamPoints}
              onChange={(val) => {
                setMyTeamSamPoints(val || 0)
                setAiResult(null)
              }}
              className='trade-sam-input'
              placeholder='0'
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </div>

          {/* Cap Summary */}
          <div className='trade-cap-summary'>
            <div className='trade-cap-row'>
              <span>League Cap</span>
              <span>${myleagueSalaryCap?.toLocaleString() || '0'}</span>
            </div>
            <div className='trade-cap-row'>
              <span>Team Cap After Trade</span>
              <span className={myCapAfter < 0 ? 'trade-cap-negative' : ''}>
                ${myCapAfter?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        </div>

        {/* ─── CENTER: TRADE SUMMARY ─── */}
        <div className='trade-panel trade-panel-center'>
          <div className='trade-center-swap'>
            <SwapOutlined className='trade-swap-icon' />
          </div>

          {/* AI Analysis Button */}
          <Button
            type='primary'
            icon={<RobotOutlined />}
            className='trade-analyze-btn'
            onClick={handleAnalyzeTrade}
            loading={analyzeLoading}
            block
          >
            AI COMMISSIONER ANALYSIS
          </Button>

          {/* AI Result */}
          {aiResult && (
            <div className='trade-ai-result'>
              <div className='trade-ai-header'>
                <RobotOutlined className='trade-ai-icon' />
                <span>AI Commissioner</span>
              </div>

              <div className='trade-ai-score'>
                <Progress
                  type='circle'
                  percent={aiResult.fairnessScore}
                  size={80}
                  strokeColor={getVerdictColor(aiResult.verdict)}
                  format={() => (
                    <span style={{ color: getVerdictColor(aiResult.verdict), fontWeight: 800, fontSize: 18 }}>
                      {aiResult.fairnessScore}
                    </span>
                  )}
                />
                <div className='trade-ai-verdict'>
                  <Tag
                    icon={getVerdictIcon(aiResult.verdict)}
                    color={
                      aiResult.verdict === 'fair' ? 'success'
                        : aiResult.verdict === 'slightly_unfair' ? 'warning'
                        : 'error'
                    }
                    className='trade-verdict-tag'
                  >
                    {getVerdictLabel(aiResult.verdict)}
                  </Tag>
                  {aiResult.flaggedForReview && (
                    <Tag color='red' className='trade-flagged-tag'>
                      <ExclamationCircleOutlined /> FLAGGED FOR REVIEW
                    </Tag>
                  )}
                </div>
              </div>

              <div className='trade-ai-values'>
                <div className='trade-ai-val-box'>
                  <span className='trade-ai-val-label'>Your Value</span>
                  <span className='trade-ai-val-num'>{aiResult.buyerValue}</span>
                </div>
                <span className='trade-ai-vs'>VS</span>
                <div className='trade-ai-val-box'>
                  <span className='trade-ai-val-label'>Their Value</span>
                  <span className='trade-ai-val-num'>{aiResult.sellerValue}</span>
                </div>
              </div>

              {/* Draft Pick Value Breakdown */}
              {(aiResult.buyerDraftValue > 0 || aiResult.sellerDraftValue > 0) && (
                <div className='trade-ai-draft-breakdown'>
                  <div className='trade-ai-draft-row'>
                    <span className='trade-ai-draft-label'>Your Draft Picks</span>
                    <span className='trade-ai-draft-val'>{aiResult.buyerDraftValue || 0} pts</span>
                  </div>
                  {aiResult.buyerDraftBreakdown?.map((d, i) => (
                    <div key={i} className='trade-ai-draft-detail'>
                      {`${d.season}' Rd ${d.round} (${d.originalTeam}), ${d.value}`}
                    </div>
                  ))}
                  <div className='trade-ai-draft-row' style={{ marginTop: 6 }}>
                    <span className='trade-ai-draft-label'>Their Draft Picks</span>
                    <span className='trade-ai-draft-val'>{aiResult.sellerDraftValue || 0} pts</span>
                  </div>
                  {aiResult.sellerDraftBreakdown?.map((d, i) => (
                    <div key={i} className='trade-ai-draft-detail'>
                      {`${d.season}' Rd ${d.round} (${d.originalTeam}), ${d.value}`}
                    </div>
                  ))}
                </div>
              )}

              <p className='trade-ai-summary'>{aiResult.summary}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type='primary'
            icon={<ThunderboltOutlined />}
            className='trade-submit-btn'
            onClick={createTrade}
            loading={btnLoading}
            disabled={
              aiResult?.flaggedForReview ||
              !(
                (myTeamSelected.length > 0 || myTeamSelectedDraft.length > 0 || myTeamSamPoints > 0) &&
                (otherTeamSelected.length > 0 || otherTeamSelectedDraft.length > 0 || otherTeamSamPoints > 0)
              )
            }
            block
          >
            {aiResult?.flaggedForReview ? 'TRADE FLAGGED, NEEDS REVIEW' : 'SUBMIT TRADE OFFER'}
          </Button>

          {/* Share Trade Preview */}
          {(myTeamSelected.length > 0 || otherTeamSelected.length > 0) && (
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <TradeShareCard
                trade={{
                  buyer: {
                    team: { name: myTeam?.active?.[0]?.team?.name || 'Your Team' },
                    players: myTeamSelected.map(v => v?.players),
                    drafts: myTeamSelectedDraft,
                    samPoints: myTeamSamPoints,
                  },
                  seller: {
                    team: { name: otherTeam?.team?.name || 'Other Team' },
                    players: otherTeamSelected.map(v => v?.players),
                    drafts: otherTeamSelectedDraft,
                    samPoints: otherTeamSamPoints,
                  },
                  leagueName: currentLeague?.name || '',
                }}
                sport="football"
                style={{ width: '100%', justifyContent: 'center' }}
              />
            </div>
          )}
        </div>

        {/* ─── RIGHT: OTHER TEAM ─── */}
        <div className='trade-panel trade-panel-right'>
          {loading2 ? (
            <div className='trade-loading-panel'>
              <Spin />
            </div>
          ) : selectTeam ? (
            <>
              <div className='trade-panel-header'>
                <div className='trade-panel-team-info'>
                  <h2>{otherTeam?.team?.name || 'Other Team'}</h2>
                  <span className='trade-panel-tag trade-tag-receive'>YOU GET</span>
                </div>
              </div>

              {/* Players */}
              <div className='trade-panel-section'>
                <div className='trade-section-label'>
                  <span>Players</span>
                  <AddPlayerToTrade
                    teamName={otherTeam?.team?.name}
                    data={
                      otherTeam
                        ? otherTeam.active.map((v) => ({ players: v }))
                        : []
                    }
                    selected={otherTeamSelected}
                    setSelected={(val) => {
                      setOtherTeamSelected(val)
                      setAiResult(null)
                    }}
                  />
                </div>
                <div className='trade-assets'>
                  {otherTeamSelected.length > 0 ? (
                    otherTeamSelected.map((v) => (
                      <div key={v?.players?._id} className='trade-asset-card'>
                        <div className='trade-asset-info'>
                          {v?.players?.HostedHeadshotNoBackgroundUrl ? (
                            <img src={v.players.HostedHeadshotNoBackgroundUrl} alt='' className='trade-asset-img' />
                          ) : (
                            <div className='trade-asset-img-placeholder'>{(v?.players?.Name || '?').charAt(0)}</div>
                          )}
                          <span className='trade-asset-pos'>{v?.players?.Position}</span>
                          <span className='trade-asset-name'>{v?.players?.Name}</span>
                        </div>
                        <div className='trade-asset-right'>
                          <span className='trade-asset-cap'>
                            ${(v?.players?.currentYearSalaryCap || 0).toLocaleString()}
                          </span>
                          <CloseOutlined
                            className='trade-asset-remove'
                            onClick={() => {
                              setOtherTeamSelected((prev) => prev.filter((x) => x?.players?._id !== v?.players?._id))
                              setAiResult(null)
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='trade-empty-slot'>No players added</div>
                  )}
                </div>
              </div>

              {/* Draft Picks */}
              <div className='trade-panel-section'>
                <div className='trade-section-label'>
                  <span>Draft Picks</span>
                </div>
                <div className='trade-assets'>
                  {otherTeamSelectedDraft.map((v, i) => {
                    const isTraded = v?.mainTeam && v?.team && String(v.mainTeam._id || v.mainTeam) !== String(v.team._id || v.team)
                    return (
                      <div key={i} className='trade-asset-card trade-asset-draft'>
                        <span>{`${v?.season}' Rookie Draft Rd ${v?.round}`}{isTraded ? ` (via trade)` : ''}</span>
                        <CloseOutlined className='trade-asset-remove' onClick={() => handleOtherDraftRemove(v)} />
                      </div>
                    )
                  })}
                  {otherTeamDraft?.length > 0 && (
                    <div className='trade-draft-available'>
                      {otherTeamDraft.sort((a, b) => a.season - b.season).map((v, i) => {
                        const isTraded = v?.mainTeam && v?.team && String(v.mainTeam._id || v.mainTeam) !== String(v.team._id || v.team)
                        return (
                          <Tooltip key={i} title={`${v?.season}' Rookie Draft Round ${v?.round}${isTraded ? ' (via trade)' : ''}`}>
                            <div className='trade-draft-chip' onClick={() => handleOtherDraftSelect(v)}>
                              <PlusOutlined /> {`${v?.season}' Rd ${v?.round}`}{isTraded ? ' (via trade)' : ''}
                            </div>
                          </Tooltip>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* SAM Points */}
              <div className='trade-panel-section'>
                <div className='trade-section-label'>
                  <span><DollarOutlined /> SAM Points</span>
                </div>
                <InputNumber
                  min={0}
                  value={otherTeamSamPoints}
                  onChange={(val) => {
                    setOtherTeamSamPoints(val || 0)
                    setAiResult(null)
                  }}
                  className='trade-sam-input'
                  placeholder='0'
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </div>

              {/* Cap Summary */}
              <div className='trade-cap-summary'>
                <div className='trade-cap-row'>
                  <span>League Cap</span>
                  <span>${myleagueSalaryCap?.toLocaleString() || '0'}</span>
                </div>
                <div className='trade-cap-row'>
                  <span>Team Cap After Trade</span>
                  <span className={otherCapAfter < 0 ? 'trade-cap-negative' : ''}>
                    ${otherCapAfter?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className='trade-empty-panel'>
              <SwapOutlined style={{ fontSize: 40, opacity: 0.15, marginBottom: 12 }} />
              <p>Select a team above to start building a trade</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default NewTrade
