import { Button, Modal, Input } from 'antd'
import React, { useState } from 'react'

const MakeOffer = () => {
  const [open, setOpen] = useState(false)
  const [offerAmount, setOfferAmount] = useState('')
  const [yearsContract, setYearsContract] = useState('')

  const showModal = () => setOpen(true)
  const closeModal = () => {
    setOpen(false)
    setOfferAmount('')
    setYearsContract('')
  }

  const handleSubmit = () => {
    // Functionality preserved - handle offer submission
    closeModal()
  }

  return (
    <>
      <button className='mo-trigger-btn' onClick={showModal}>
        make offer
      </button>
      <Modal
        centered
        open={open}
        onCancel={closeModal}
        footer={null}
        closeIcon={false}
        className='player_interface_modals pim-modal mo-modal'
        closable={false}
      >
        {/* Close */}
        <div className='pim-close' onClick={closeModal}>
          <svg width='14' height='14' viewBox='0 0 14 14' fill='none'>
            <path d='M1 1l12 12M13 1L1 13' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
          </svg>
        </div>

        <div className='pim-body mo-body'>
          {/* Header */}
          <div className='pim-header mo-header'>
            <div className='pim-icon-badge mo-icon'>
              <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M12 2L2 7l10 5 10-5-10-5z' />
                <path d='M2 17l10 5 10-5' />
                <path d='M2 12l10 5 10-5' />
              </svg>
            </div>
            <h2 className='pim-title mo-title'>Make Offer</h2>
            <p className='pim-subtitle mo-subtitle'>
              Submit a contract offer to recruit this player
            </p>
          </div>

          {/* Offer Form */}
          <div className='mo-form-section'>
            <div className='mo-form-group'>
              <label className='mo-label'>Annual Value</label>
              <Input
                className='mo-input'
                placeholder='Enter offer amount'
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                prefix='$'
              />
            </div>

            <div className='mo-form-group'>
              <label className='mo-label'>Contract Years</label>
              <Input
                className='mo-input'
                placeholder='Years'
                type='number'
                value={yearsContract}
                onChange={(e) => setYearsContract(e.target.value)}
              />
            </div>
          </div>

          {/* Notice */}
          <div className='pim-notice mo-notice'>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <circle cx='12' cy='12' r='10' />
              <line x1='12' y1='8' x2='12' y2='12' />
              <line x1='12' y1='16' x2='12.01' y2='16' />
            </svg>
            <p>
              Your offer will be reviewed by the player. Be competitive with contract terms
              to increase the likelihood of acceptance. Offers expire after 7 days.
            </p>
          </div>

          {/* Actions */}
          <div className='pim-actions mo-actions'>
            <Button className='pim-btn-secondary mo-cancel' onClick={closeModal}>
              Cancel
            </Button>
            <Button className='pim-btn-primary mo-submit' onClick={handleSubmit}>
              Submit Offer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default MakeOffer
