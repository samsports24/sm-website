import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyEmailCode, resendVerificationCode } from '../../redux/actions/authActions'
import './emailVerification.css'

// ═══════════════════════════════════════════════════════════════
//  EMAIL VERIFICATION — 6-digit code input after registration
//  Can be used inline (as part of signup flow) or standalone page
// ═══════════════════════════════════════════════════════════════

const EmailVerification = ({ userId, email, sport, onVerified, onBack }) => {
  const navigate = useNavigate()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const inputRefs = useRef([])

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Resolve userId from props or localStorage
  const resolvedUserId = userId || localStorage.getItem('pendingUserId')
  const resolvedEmail = email || localStorage.getItem('email')
  const resolvedSport = sport || localStorage.getItem('pendingSport') || 'football'

  const handleChange = (index, value) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1)
    const newCode = [...code]
    newCode[index] = digit
    setCode(newCode)

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits entered
    if (digit && index === 5 && newCode.every(d => d)) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const digits = pasted.split('')
      setCode(digits)
      inputRefs.current[5]?.focus()
      handleVerify(pasted)
    }
  }

  const handleVerify = async (codeStr) => {
    const fullCode = codeStr || code.join('')
    if (fullCode.length !== 6 || loading) return

    setLoading(true)
    const success = await verifyEmailCode(resolvedUserId, fullCode, navigate, resolvedSport)
    setLoading(false)

    if (success && onVerified) {
      onVerified()
    }
    if (!success) {
      // Clear code on failure
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  const handleResend = async () => {
    if (resending || cooldown > 0) return
    setResending(true)
    await resendVerificationCode(resolvedUserId, resolvedEmail, resolvedSport)
    setResending(false)
    setCooldown(60)
  }

  return (
    <div className="ev-container">
      <div className="ev-card">
        {/* Icon */}
        <div className="ev-icon">📧</div>

        <h2 className="ev-title">Verify your email</h2>
        <p className="ev-subtitle">
          We sent a 6-digit code to <strong className="ev-email">{resolvedEmail || 'your email'}</strong>
        </p>

        {/* Code inputs */}
        <div className="ev-code-row" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              className="ev-code-input"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {/* Verify button */}
        <button
          className="ev-verify-btn"
          onClick={() => handleVerify()}
          disabled={code.some(d => !d) || loading}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>

        {/* Resend */}
        <p className="ev-resend-text">
          Didn&apos;t receive the code?{' '}
          {cooldown > 0 ? (
            <span className="ev-cooldown">Resend in {cooldown}s</span>
          ) : (
            <button
              className="ev-resend-btn"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? 'Sending...' : 'Resend code'}
            </button>
          )}
        </p>

        {/* Back */}
        {onBack && (
          <button className="ev-back-btn" onClick={onBack}>
            ← Back to registration
          </button>
        )}
      </div>
    </div>
  )
}

export default EmailVerification
