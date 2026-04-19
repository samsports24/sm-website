import { Button, Modal } from 'antd'
import React from 'react'

const Processed = ({ onClick, loading, confirmModal, setConfirmModal }) => {
  const closeModal = () => setConfirmModal(false)

  return (
    <Modal
      centered
      open={confirmModal}
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h2 className="pim-title">Are you sure?</h2>
          <p className="pim-subtitle">This action cannot be undone.</p>
        </div>
        <div className="pim-actions">
          <Button type="primary" className="pim-btn-danger" onClick={onClick} loading={loading}>
            Process
          </Button>
          <Button onClick={closeModal} className="pim-btn-secondary">Cancel</Button>
        </div>
      </div>
    </Modal>
  )
}

export default Processed
