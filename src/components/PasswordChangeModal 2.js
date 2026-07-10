import React, { useState } from 'react'
import { Modal, Input, notification } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { base_url } from '../config/constants'
import { getUser } from '../redux'

// ═══════════════════════════════════════════════════════════════
//  POST-ACQUISITION PASSWORD CHANGE MODAL
//  Shown when a user acquires a team via The Exchange.
//  Cannot be dismissed — user must change password for security.
// ═══════════════════════════════════════════════════════════════

const PasswordChangeModal = () => {
  const user = useSelector((state) => state.user.userDetails)
  const dispatch = useDispatch()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const visible = user?.requirePasswordChange === true

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return notification.error({ message: 'All fields are required' })
    }
    if (newPassword !== confirmPassword) {
      return notification.error({ message: 'New passwords do not match' })
    }
    if (newPassword.length < 8) {
      return notification.error({ message: 'Password must be at least 8 characters' })
    }

    setLoading(true)
    try {
      const res = await fetch(`${base_url}/auth/updatePassword`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update password')

      notification.success({ message: 'Password updated successfully! Your new team is now part of your MTO.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      // Refresh user data to clear the requirePasswordChange flag
      dispatch(getUser())
    } catch (err) {
      notification.error({ message: err.message || 'Failed to update password' })
    } finally {
      setLoading(false)
    }
  }

  if (!visible) return null

  return (
    <Modal
      open={true}
      closable={false}
      maskClosable={false}
      keyboard={false}
      footer={null}
      centered
      width={440}
      styles={{
        body: { padding: '32px 24px' },
        mask: { backdropFilter: 'blur(8px)' },
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
          Secure Your New Franchise
        </h2>
        <p style={{ margin: '8px 0 0', opacity: 0.7, fontSize: 13 }}>
          {user?.requirePasswordChangeReason ||
            "You've acquired a new team. Please change your password for security."}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Input.Password
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          size="large"
        />
        <Input.Password
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          size="large"
        />
        <Input.Password
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          size="large"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            marginTop: 8,
            padding: '12px 24px',
            background: loading ? '#555' : 'linear-gradient(135deg, #00C853, #00E676)',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {loading ? 'Updating…' : '✓ Change Password & Activate Team'}
        </button>
      </div>
    </Modal>
  )
}

export default PasswordChangeModal
