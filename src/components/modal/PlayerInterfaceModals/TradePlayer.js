import { Button, Modal, Select, notification, Spin } from 'antd'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { createTeamTrade, analyzeTrade } from '../../../redux/actions/teamTradeAction'
import { getAllTeam } from '../../../redux/actions/teamActions'
import { isTradeDeadlinePassed } from '../../../config/constants'

const TradePlayer = ({ disabled, playerData }) => {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1) // 1=select team, 2=confirm, 3=analyzing, 4=result
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [loading, setLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  const { currentLeague } = useSelector((state) => state?.league)
  const user = useSelector((state) => state?.user?.userDetails)

  const showModal = () => {
    if (isTradeDeadlinePassed()) {
      notification.error({
        message: 'Trade deadline has passed',
        description: 'No new trades can be submitted after the trade deadline.',
        duration: 4,
      })
      return
    }
    setOpen(true)
    setStep(1)
    setSelectedTeam(null)
    setAiResult(null)
    fetchTeams()
  }

  const closeModal = () => {
    setOpen(false)
    setStep(1)
    setSelectedTeam(null)
    setAiResult(null)
  }

  const fetchTeams = async () => {
    if (currentLeague?._id) {
      try {
        const res = await getAllTeam({ currentLeague: currentLeague?._id })
        // Filter out own team
        const filtered = res?.filter(t => t._id !== user?.team?._id) || []
        setTeams(filtered)
      } catch (error) {
        console.error('Failed to fetch teams', error)
      }
    }
  }

  const handleAnalyze = async () => {
    if (!selectedTeam) {
      notification.warning({ message: 'Please select a team', duration: 3 })
      return
    }
    setStep(3)
    setLoading(true)
    try {
      const payload = {
        buyer: {
          teamId: user?.team?._id,
          players: [playerData?._id],
          drafts: [],
          samPoints: 0,
        },
        seller: {
          teamId: selectedTeam,
          players: [],
          drafts: [],
          samPoints: 0,
        },
      }
      const result = await analyzeTrade(payload)
      setAiResult(result)
      setStep(4)
    } catch (err) {
      notification.error({ message: 'Analysis failed', duration: 3 })
      setStep(2)
    }
    setLoading(false)
  }

  const handleSubmitTrade = async () => {
    setSubmitLoading(true)
    try {
      const payload = {
        buyer: {
          teamId: user?.team?._id,
          players: [playerData?._id],
          drafts: [],
          samPoints: 0,
        },
        seller: {
          teamId: selectedTeam,
          players: [],
          drafts: [],
          samPoints: 0,
        },
      }
      const res = await createTeamTrade(payload)
      if (res) {
        notification.success({
          message: 'Trade Proposed!',
          description: 'Your trade proposal has been sent.',
          duration: 4,
        })
        closeModal()
      }
    } catch (err) {
      notification.error({ message: 'Failed to submit trade', duration: 3 })
    }
    setSubmitLoading(false)
  }

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'fair': return '#22C55E'
      case 'slightly_unfair': return '#EAB308'
      case 'unfair': return '#F97316'
      case 'lopsided': return '#EF4444'
      default: return '#94A3B8'
    }
  }

  const getVerdictLabel = (verdict) => {
    switch (verdict) {
      case 'fair': return 'FAIR TRADE'
      case 'slightly_unfair': return 'SLIGHT EDGE'
      case 'unfair': return 'UNFAIR'
      case 'lopsided': return 'LOPSIDED'
      default: return 'PENDING'
    }
  }

  const selectedTeamData = teams.find(t => t._id === selectedTeam)

  return (
    <>
      <Button disabled={disabled} type='primary' className='action-bar-btn' onClick={showModal}>
        Trade Player
      </Button>
      <Modal
        centered
        open={open}
        onCancel={closeModal}
        footer={null}
        closeIcon={false}
        className='player_interface_modals pim-modal trade-proposal-modal'
        closable={false}
        width={520}
      >
        {/* Close */}
        <button className='pim-close' onClick={closeModal} aria-label='Close'>
          <svg width='14' height='14' viewBox='0 0 14 14' fill='none'>
            <path d='M11 3L3 11M3 3l8 8' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
          </svg>
        </button>

        <div className='pim-body'>
          {/* Header */}
          <div className='pim-header'>
            <div className='pim-icon-badge'>
              <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <polyline points='17 1 21 5 17 9' />
                <path d='M3 11V9a4 4 0 0 1 4-4h14' />
                <polyline points='7 23 3 19 7 15' />
                <path d='M21 13v2a4 4 0 0 1-4 4H3' />
              </svg>
            </div>
            <h2 className='pim-title'>Trade Proposal</h2>
            <p className='pim-subtitle'>
              {step === 1 && 'Select a team to trade with'}
              {step === 2 && 'Review your trade proposal'}
              {step === 3 && 'AI Commissioner is analyzing...'}
              {step === 4 && 'Trade analysis complete'}
            </p>
          </div>

          {/* Player Card Being Traded */}
          <div className='trade-player-card'>
            <div className='trade-player-avatar'>
              {playerData?.HostedHeadshotNoBackgroundUrl ? (
                <img src={playerData.HostedHeadshotNoBackgroundUrl} alt={playerData?.Name} />
              ) : (
                <div className='trade-player-initials'>
                  {playerData?.Name?.split(' ').map(n => n[0]).join('') || '?'}
                </div>
              )}
            </div>
            <div className='trade-player-info'>
              <span className='trade-player-name'>{playerData?.Name || 'Unknown Player'}</span>
              <span className='trade-player-meta'>
                {playerData?.Position} &middot; {playerData?.Team}
              </span>
              {playerData?.currentYearSalaryCap && (
                <span className='trade-player-salary'>
                  {(playerData.currentYearSalaryCap / 1000000).toFixed(1)}M SP cap
                </span>
              )}
            </div>
            <div className='trade-direction-badge'>SENDING</div>
          </div>

          {/* Step 1: Select Team */}
          {step === 1 && (
            <div className='trade-step'>
              <label className='trade-field-label'>Select Destination Team</label>
              <Select
                placeholder='Choose a team...'
                className='trade-team-select'
                value={selectedTeam}
                onChange={(v) => { setSelectedTeam(v); setStep(2); }}
                options={teams.map(t => ({
                  value: t._id,
                  label: t.name,
                }))}
                showSearch
                filterOption={(input, option) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
                size='large'
                style={{ width: '100%' }}
              />
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className='trade-step'>
              <div className='trade-summary'>
                <div className='trade-summary-side'>
                  <span className='trade-summary-label'>From</span>
                  <span className='trade-summary-team'>{user?.team?.name}</span>
                </div>
                <div className='trade-arrow'>
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#22C55E' strokeWidth='2'>
                    <polyline points='17 1 21 5 17 9' />
                    <path d='M3 11V9a4 4 0 0 1 4-4h14' />
                    <polyline points='7 23 3 19 7 15' />
                    <path d='M21 13v2a4 4 0 0 1-4 4H3' />
                  </svg>
                </div>
                <div className='trade-summary-side'>
                  <span className='trade-summary-label'>To</span>
                  <span className='trade-summary-team'>{selectedTeamData?.name || 'Selected Team'}</span>
                </div>
              </div>

              <div className='pim-notice' style={{ marginTop: 16 }}>
                <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <circle cx='12' cy='12' r='10' />
                  <line x1='12' y1='16' x2='12' y2='12' />
                  <line x1='12' y1='8' x2='12.01' y2='8' />
                </svg>
                <p>
                  For a full multi-player trade with draft picks and SAM Points, visit the <a href='/team-trade' style={{ color: '#22C55E' }}>Trade Center</a>.
                </p>
              </div>

              <div className='pim-actions'>
                <Button className='pim-btn-secondary' onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className='pim-btn-primary'
                  onClick={handleAnalyze}
                  loading={loading}
                >
                  Analyze Trade
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Analyzing */}
          {step === 3 && (
            <div className='trade-step trade-analyzing'>
              <Spin size='large' />
              <p className='trade-analyzing-text'>AI Commissioner analyzing trade fairness...</p>
            </div>
          )}

          {/* Step 4: Result */}
          {step === 4 && (
            <div className='trade-step'>
              {aiResult && (
                <div className='trade-ai-result'>
                  <div
                    className='trade-verdict'
                    style={{ borderColor: getVerdictColor(aiResult?.verdict) }}
                  >
                    <span
                      className='trade-verdict-label'
                      style={{ color: getVerdictColor(aiResult?.verdict) }}
                    >
                      {getVerdictLabel(aiResult?.verdict)}
                    </span>
                    <span className='trade-verdict-score'>
                      Fairness: {aiResult?.fairnessScore}/100
                    </span>
                  </div>
                  {aiResult?.summary && (
                    <p className='trade-ai-summary'>{aiResult.summary}</p>
                  )}
                </div>
              )}

              <div className='pim-actions'>
                <Button className='pim-btn-secondary' onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className='pim-btn-primary'
                  onClick={handleSubmitTrade}
                  loading={submitLoading}
                >
                  Submit Trade
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

export default TradePlayer
