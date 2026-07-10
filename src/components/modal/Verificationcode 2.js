import React, { useState } from 'react'
import { Modal, Input, notification } from 'antd'
import { SafetyOutlined, LoadingOutlined } from '@ant-design/icons'
import '../../styles/modals/verficationcodeModal.css'
import { GenerateVerificationCode } from '../../redux/actions/clubhouse'

const VerificationcodeModal = ({ visible, onClose, verficationcode, setVerficationcode, user, deocdeemail }) => {
  const [resending, setResending] = useState(false)

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setVerficationcode(val)
  }

  const resendcode = async () => {
    setResending(true)
    try {
      await GenerateVerificationCode({
        emailsent: deocdeemail,
        user,
      })
      notification.success({ message: 'Verification code resent', duration: 3 })
    } catch (err) {
      notification.error({ message: 'Failed to resend code', duration: 3 })
    }
    setResending(false)
  }

  return (
    <Modal
      className='vc-modal'
      title={null}
      open={visible}
      onCancel={onClose}
      centered
      footer={null}
      closable={false}
      width={420}
    >
      <div className='vc-card'>
        <div className='vc-glow' />

        {/* Close button */}
        <button className='vc-close' onClick={onClose} type='button'>
          &times;
        </button>

        {/* Icon */}
        <div className='vc-icon-wrap'>
          <SafetyOutlined className='vc-icon' />
        </div>

        {/* Header */}
        <h2 className='vc-title'>Verify Your Email</h2>
        <p className='vc-desc'>
          We&apos;ve sent a verification code to{' '}
          {deocdeemail ? <strong>{deocdeemail}</strong> : 'your email'}.
          Enter it below to continue.
        </p>

        {/* Code Input */}
        <div className='vc-input-wrap'>
          <Input
            type='text'
            inputMode='numeric'
            placeholder='000000'
            value={verficationcode}
            onChange={handleInputChange}
            className='vc-code-input'
            maxLength={6}
            autoFocus
          />
        </div>

        {/* Submit */}
        <button
          className='vc-submit'
          onClick={onClose}
          type='button'
          disabled={!verficationcode || verficationcode.length < 4}
        >
          VERIFY CODE
        </button>

        {/* Resend */}
        <button
          className='vc-resend'
          onClick={resendcode}
          disabled={resending}
          type='button'
        >
          {resending ? (
            <><LoadingOutlined spin /> Sending...</>
          ) : (
            'Didn\u0027t receive a code? Resend'
          )}
        </button>
      </div>
    </Modal>
  )
}

export default VerificationcodeModal
