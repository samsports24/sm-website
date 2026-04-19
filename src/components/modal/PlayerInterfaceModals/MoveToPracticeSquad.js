import React, { useState } from 'react'
import { Button, Modal, notification } from 'antd'
import { getRoster, moveToPractice } from '../../../redux/actions/rosterAction'
import { activeRosterCount } from '../../../config/constants'
import { useSelector } from 'react-redux'

const MakeOffer = ({
  disabled,
  practicePlayers,
  activePlayersCount,
  pInterfaceModalClose,
  playerId,
}) => {
  const SETTING = useSelector((state) => state?.user?.setting)

  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(false)

  const showModal = () => setOpen(true)
  const closeModal = () => {
    setOpen(false)
    setSelectedId(null)
  }

  const moveToPracticeSquad = async () => {
    setLoading(true)
    await moveToPractice({
      id: playerId,
      week: SETTING?.week,
    })
    setLoading(false)
    closeModal()
    pInterfaceModalClose()
    getRoster(SETTING?.week)
  }

  const handleSubmit = async () => {
    if (selectedId) {
      setLoading(true)
      await moveToPractice({
        id: playerId,
        replacedPlayer: selectedId,
        week: SETTING?.week,
      })
      setLoading(false)
      closeModal()
      pInterfaceModalClose()
      getRoster(SETTING?.week)
    } else {
      notification.error({
        message: 'Please select a player to replace',
        duration: 3,
      })
    }
  }

  return (
    <>
      <Button disabled={disabled} type="primary" className="action-bar-btn" onClick={showModal}>
        Move To
        <span>Practice Squad</span>
      </Button>
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
          {/* Header */}
          <div className="pim-header">
            <div className="pim-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h2 className="pim-title">Send to Practice Squad</h2>
            <p className="pim-subtitle">
              Choose a player from your roster to assign to the practice squad.
            </p>
          </div>

          {/* Info notice */}
          <div className="pim-notice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p>
              Player&apos;s cap hit still counts toward your team total. Players on the practice squad can be poached if not protected.
            </p>
          </div>

          {activePlayersCount > activeRosterCount ? (
            /* Direct move, no replacement needed */
            <div className="pim-actions">
              <Button
                onClick={moveToPracticeSquad}
                type="primary"
                className="pim-btn-primary"
                loading={loading}
              >
                Move to Practice Squad
              </Button>
              <Button onClick={closeModal} className="pim-btn-secondary">
                Cancel
              </Button>
            </div>
          ) : (
            /* Need to select replacement */
            <>
              <div className="pim-section-label">
                <span>Select Replacement</span>
                <span className="pim-section-count">{practicePlayers?.length || 0} players</span>
              </div>

              <div className="pim-roster-list">
                {practicePlayers?.map((v, i) => (
                  <div
                    key={i}
                    className={`pim-player-row ${selectedId === v?.players?.PlayerID ? 'pim-row-selected' : ''}`}
                    onClick={() => setSelectedId(v?.players?.PlayerID)}
                  >
                    <span className="pim-pr-pos">{v?.players?.Position}</span>
                    <span className="pim-pr-name">{v?.players?.Name}</span>
                    <span className="pim-pr-cap">{v?.PlayerCap?.toLocaleString()} SP</span>
                    <div className="pim-pr-check">
                      {selectedId === v?.players?.PlayerID ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill="#22C55E" />
                          <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <div className="pim-pr-radio" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pim-actions">
                <Button
                  onClick={handleSubmit}
                  type="primary"
                  className="pim-btn-primary"
                  loading={loading}
                >
                  Confirm
                </Button>
                <Button onClick={closeModal} className="pim-btn-secondary">
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  )
}

export default MakeOffer
