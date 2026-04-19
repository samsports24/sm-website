import { Button, Modal, notification } from 'antd'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { PlayerPoached } from '../../../redux/actions/rosterAction'
import Loader from '../../Loader'

const PoachPlayer = ({ data, state }) => {
  const user = useSelector((state) => state.user.userDetails)
  const SETTING = useSelector((state) => state?.user?.setting)
  const sampoints = useSelector((state) => state.user?.SamPoints?.SamPoints)
  const myleagueSalaryCap = useSelector((state) => state.user?.leagueSalaryCap?.leagueSalaryCap)
  const teamSalaryCap = useSelector((state) => state.user?.teamSalaryCap)
  const leagueState = useSelector((state) => state.league) || {}
  const currentLeague = leagueState.currentLeague
  const poachingDisabled = currentLeague?.practiceSquadPoachingEnabled === false

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const showModal = () => {
    if (poachingDisabled) {
      notification.error({
        message: 'Practice Squad Poaching Disabled',
        description: 'This feature has been turned off by your commissioner.',
        duration: 5,
      })
      return
    }
    setOpen(true)
  }
  const closeModal = () => setOpen(false)

  let total = myleagueSalaryCap - teamSalaryCap

  const poachplayer = async () => {
    if (data?.player?.currentYearSalaryCap > total && sampoints < data?.player?.currentYearSalaryCap) {
      notification.error({
        message: "Team Cap left must be greater than player's salary cap or you have insufficient SamPoints",
        duration: 4,
      })
      closeModal()
      return
    }

    setLoading(true)
    try {
      await PlayerPoached({
        league: user?.team?.currentLeague._id,
        PlayerID: data?.player?.PlayerID,
        player_id: data?.player?._id,
        team: state.teamId,
        season: SETTING?.season,
        week: SETTING?.week,
        playercurrentsalaryprice: data?.player?.currentYearSalaryCap,
        poachBy: {
          teamName: user?.team?.name,
          teamid: user?.team?._id,
          user: user?._id,
        },
      })
      setLoading(false)
      closeModal()
    } catch (error) {
      console.error('Error poaching player:', error)
      setLoading(false)
    }
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <Button type="primary" className="action-bar-btn" onClick={showModal} disabled={poachingDisabled} title={poachingDisabled ? 'Disabled by commissioner' : ''}>
          {poachingDisabled ? 'Poaching Disabled' : 'Poach Player'}
        </Button>
      )}
      <Modal
        centered
        open={open}
        onCancel={closeModal}
        footer={null}
        closeIcon={false}
        className="player_interface_modals pim-modal"
        closable={false}
      >
        <button className="pim-close" onClick={closeModal} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="pim-body">
          <div className="pim-header">
            <div className="pim-icon-badge pim-icon-warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h2 className="pim-title">Poach Player</h2>
            <p className="pim-subtitle">Initiate the poaching process for this practice squad player.</p>
          </div>
          <div className="pim-notice pim-notice-warning">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p>The team owner will have 24 hours to protect or activate this player to their 53-man roster.</p>
          </div>
          <div className="pim-actions">
            <Button onClick={poachplayer} type="primary" className="pim-btn-primary" loading={loading}>
              Confirm Poach
            </Button>
            <Button onClick={closeModal} className="pim-btn-secondary">Cancel</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default PoachPlayer
