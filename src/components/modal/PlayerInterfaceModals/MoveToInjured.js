import { Button, Modal } from 'antd'
import React, { useState } from 'react'
import { getRoster, moveToIr } from '../../../redux/actions/rosterAction'
import { useSelector } from 'react-redux'

const MoveToInjured = ({ playerId, disabled, pInterfaceModalClose }) => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const showModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const _moveToIr = async () => {
    setLoading(true)
    const res = await moveToIr({
      id: playerId,
      week: SETTING?.week,
    })
    if (res) {
      closeModal()
      pInterfaceModalClose()
      getRoster(SETTING?.week)
    }
    setLoading(false)
  }

  return (
    <>
      <Button disabled={disabled} type="primary" className="action-bar-btn" onClick={showModal}>
        MOVE TO (I.R.)
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
          <div className="pim-header">
            <div className="pim-icon-badge pim-icon-warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h2 className="pim-title">Move to Injured Reserve</h2>
            <p className="pim-subtitle">
              Place this player on the Injured Reserve list.
            </p>
          </div>

          <div className="pim-notice pim-notice-warning">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p>
              The player&apos;s salary stays on your cap, but you free up a roster spot. The player must stay on IR for a minimum of 30 days.
            </p>
          </div>

          <div className="pim-actions">
            <Button
              loading={loading}
              type="primary"
              className="pim-btn-primary"
              onClick={_moveToIr}
            >
              Move to I.R.
            </Button>
            <Button onClick={closeModal} className="pim-btn-secondary">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default MoveToInjured
