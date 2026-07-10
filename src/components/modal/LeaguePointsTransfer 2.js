import React, { useState, useEffect } from 'react'
import { Modal, Input, Alert, notification } from 'antd'
import '../../styles/modals/leaguepointsModal.css'
import { useSelector, useDispatch } from 'react-redux'
import { privateAPI, attachToken } from '../../config/constants'
import { getUser } from '../../redux/actions/authActions'

const fmtSP = (n) => {
  if (!n && n !== 0) return '0'
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
  return n.toLocaleString()
}

/**
 * SamPoints Transfer Modal — A.Football
 * Pick a destination team (any sport) to send earned SP to.
 */
const LeaguePointsTransfer = ({ visible, onClose }) => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.userDetails)
  const walletData = useSelector((state) => state.user?.SamPoints)

  const [step, setStep] = useState('form')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [allTeams, setAllTeams] = useState([])
  const [destTeam, setDestTeam] = useState(null)

  const teamName = user?.team?.teamName || 'My Team'
  const leagueName = user?.team?.currentLeague?.name || 'Current League'
  const currentTeamId = user?.team?._id

  // Earned balance = team earned SP + any purchased SP in mainWallet
  const availableBalance = (walletData?.earnedSamPoints || 0) + (user?.mainWallet || 0)
  const transferAmount = parseFloat(amount) || 0
  const isOverBalance = transferAmount > availableBalance
  const isValid = transferAmount > 0 && !isOverBalance && destTeam

  // Refresh wallet data + fetch all teams when modal opens
  useEffect(() => {
    if (visible) {
      dispatch(getUser()) // Refresh to get latest earnedSamPoints balance
      fetchAllTeams()
    }
  }, [visible])

  const fetchAllTeams = async () => {
    try {
      attachToken()
      const res = await privateAPI.get('/league/my-teams-all-sports')
      const data = res.data?.data || {}
      const nfl = (data.nflTeams || []).map(t => ({ ...t, sport: 'A.Football' }))
      const soccer = (data.soccerTeams || []).map(t => ({ ...t, sport: 'Soccer' }))
      // Exclude current team from destinations
      const all = [...nfl, ...soccer].filter(t => String(t._id) !== String(currentTeamId))
      setAllTeams(all)
    } catch (err) {
      console.error('Failed to fetch teams:', err)
    }
  }

  const handleClose = () => {
    setStep('form')
    setAmount('')
    setDestTeam(null)
    onClose()
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setAmount(val)
    }
  }

  const handleConfirmTransfer = async () => {
    setLoading(true)
    try {
      attachToken()
      const payload = {
        walletId: walletData?._id,
        userid: user?._id,
        leagueid: user?.team?.currentLeague._id,
        teamid: user?.team?._id,
        leaguepoints: transferAmount,
        direction: 'withdraw',
        // Destination team info for cross-sport transfer
        destTeamId: destTeam._id,
        destSport: destTeam.sport,
      }
      await privateAPI.post('/league/transfer-points-to-league-wallet', payload)
      notification.success({
        message: `Transferred ${fmtSP(transferAmount)} SP to ${destTeam.name}`,
        duration: 3,
      })
      dispatch(getUser())
      handleClose()
    } catch (err) {
      notification.error({
        message: err?.response?.data?.message || 'Transfer failed',
        duration: 3,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      className='CustomInpurModal'
      title=''
      open={visible}
      onCancel={handleClose}
      centered
      footer={null}
    >
      {step === 'form' ? (
        <>
          <p className='lpt-modal-title'>TRANSFER SAMPOINTS</p>

          {/* Available balance */}
          <div className='lpt-balance-row'>
            <div className='lpt-balance-card'>
              <div className='lpt-balance-label'>AVAILABLE TO TRANSFER</div>
              <div className='lpt-balance-value'>{fmtSP(availableBalance)} <span className='lpt-balance-unit'>SP</span></div>
              <div className='lpt-balance-sub'>Earned SamPoints from {teamName}</div>
            </div>
          </div>

          {/* FROM: current team */}
          <div className='lpt-destination'>
            <div className='lpt-destination-label'>FROM</div>
            <div className='lpt-destination-detail'>
              <div className='lpt-destination-team'>{teamName}</div>
              <div className='lpt-destination-league'>{leagueName} (A.Football)</div>
            </div>
          </div>

          {/* TO: destination team picker */}
          <div className='lpt-destination' style={{ borderColor: destTeam ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)' }}>
            <div className='lpt-destination-label'>TO</div>
            <div className='lpt-team-picker'>
              {allTeams.length === 0 ? (
                <div className='lpt-no-teams'>No other teams found</div>
              ) : (
                allTeams.map(t => (
                  <button
                    key={t._id}
                    className={`lpt-team-option ${destTeam?._id === t._id ? 'lpt-team-option--selected' : ''}`}
                    onClick={() => setDestTeam(t)}
                    type='button'
                  >
                    <span className='lpt-team-option-sport'>{t.sport}</span>
                    <span className='lpt-team-option-name'>{t.name}</span>
                    <span className='lpt-team-option-league'>{t.leagueName}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <Alert
            type='info'
            showIcon
            style={{ marginBottom: 4 }}
            message='Only earned SamPoints can be transferred between teams and sports.'
          />

          {/* Amount input */}
          <div className='lpt-input-wrapper'>
            <Input
              className={`customInput ${isOverBalance ? 'lpt-input-error' : ''}`}
              size='large'
              placeholder='Enter amount to transfer'
              value={amount}
              onChange={handleInputChange}
              inputMode='decimal'
              autoComplete='off'
              autoCorrect='off'
              spellCheck={false}
            />
            <button className='lpt-max-btn' onClick={() => setAmount(String(availableBalance))} type='button'>MAX</button>
          </div>

          {isOverBalance && (
            <div className='lpt-error-msg'>
              Insufficient balance. You only have {fmtSP(availableBalance)} SP available.
            </div>
          )}
          {transferAmount > 0 && !isOverBalance && (
            <div className='lpt-remaining-msg'>
              Remaining after transfer: {fmtSP(availableBalance - transferAmount)} SP
            </div>
          )}

          <button
            className={`lpt-review-btn ${!isValid ? 'lpt-review-btn--disabled' : ''}`}
            onClick={() => { if (isValid) setStep('confirm') }}
            disabled={!isValid}
            type='button'
          >
            {!destTeam ? 'Select a destination team' : 'Review Transfer'}
          </button>
        </>
      ) : (
        <div className='lpt-confirm'>
          <div className='lpt-confirm-title'>CONFIRM TRANSFER</div>
          <div className='lpt-confirm-amount'>{fmtSP(transferAmount)} <span className='lpt-confirm-unit'>SP</span></div>

          <div className='lpt-confirm-flow'>
            <div className='lpt-confirm-box'>
              <div className='lpt-confirm-box-label'>FROM</div>
              <div className='lpt-confirm-box-value'>{teamName}</div>
              <div className='lpt-confirm-box-sub'>{leagueName} (A.Football)</div>
            </div>
            <div className='lpt-confirm-arrow'>→</div>
            <div className='lpt-confirm-box'>
              <div className='lpt-confirm-box-label'>TO</div>
              <div className='lpt-confirm-box-value'>{destTeam?.name}</div>
              <div className='lpt-confirm-box-sub'>{destTeam?.leagueName} ({destTeam?.sport})</div>
            </div>
          </div>

          <div className='lpt-confirm-summary'>
            <div className='lpt-confirm-row'>
              <span>Transfer amount</span>
              <span className='lpt-confirm-val'>{fmtSP(transferAmount)} SP</span>
            </div>
            <div className='lpt-confirm-row'>
              <span>Balance after</span>
              <span className='lpt-confirm-val'>{fmtSP(availableBalance - transferAmount)} SP</span>
            </div>
          </div>

          <div className='lpt-confirm-buttons'>
            <button className='lpt-back-btn' onClick={() => setStep('form')} type='button'>Back</button>
            <button className='lpt-confirm-btn' onClick={handleConfirmTransfer} disabled={loading} type='button'>
              {loading ? 'Transferring...' : 'Confirm Transfer'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default LeaguePointsTransfer
