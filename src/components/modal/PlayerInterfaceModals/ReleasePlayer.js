import { Button, Modal } from 'antd'
import React, { useState } from 'react'
import { getRoster, releasePlayer } from '../../../redux/actions/rosterAction'
import Processed from './Processed'
import { useSelector } from 'react-redux'

const ReleasePlayer = ({ disabled, pInterfaceModalClose, playerId }) => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [open, setOpen] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const showModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const _releasePlayer = async () => {
    setLoading(true)
    const res = await releasePlayer({ id: Number(playerId), week: SETTING?.week })
    if (res) {
      setConfirmModal(false)
      closeModal()
      pInterfaceModalClose()
      getRoster(SETTING?.week)
    }
    setLoading(false)
  }

  return (
    <>
      <Button disabled={disabled} type="primary" className="action-bar-btn" onClick={showModal}>
        Release Player
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
            <div className="pim-icon-badge pim-icon-danger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
            <h2 className="pim-title">Release Player</h2>
            <p className="pim-subtitle">
              This will remove the player from your roster and make them a free agent.
            </p>
          </div>

          <div className="pim-notice pim-notice-danger">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p>This action cannot be undone. Are you sure you want to release this player?</p>
          </div>

          <div className="pim-actions">
            <Button
              type="primary"
              className="pim-btn-danger"
              onClick={() => setConfirmModal(true)}
              loading={loading}
            >
              Release Player
            </Button>
            <Button onClick={closeModal} className="pim-btn-secondary">
              Cancel
            </Button>
          </div>
          <Processed
            loading={loading}
            onClick={_releasePlayer}
            confirmModal={confirmModal}
            setConfirmModal={setConfirmModal}
          />
        </div>
      </Modal>
    </>
  )
}

export default ReleasePlayer
