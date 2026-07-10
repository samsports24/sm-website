import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CreditCardOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
  LockOutlined,
} from '@ant-design/icons'

import Header from '../../components/Header'
import { createPaymentIntentforsampoints } from '../../redux/actions/paymentAction'
import '../../styles/pages/payOptions.css'

const Payoptions = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    myamount, mysampoints, fromRivals: stateFromRivals,
    netPrice, vatAmount, vatRate,
  } = location.state || {}
  const fromRivals = stateFromRivals || new URLSearchParams(location.search).get('from') === 'rivals'
  // VAT display values (fallback for direct navigation without state)
  const displayNet = netPrice || myamount
  const displayVat = vatAmount || 0
  const displayTotal = myamount || 0
  const displayVatPct = vatRate ? Math.round(vatRate * 100) : 23
  const [loading, setLoading] = useState(false)

  const sampointspayment = async () => {
    setLoading(true)
    const userId = localStorage.getItem('userId')

    if (!userId) {
      console.error('userId not found in localStorage')
      setLoading(false)
      return
    }

    const payload = {
      userId,
      amount: Math.round(myamount * 100),
      mysampoints,
      fromRivals: fromRivals || false,
    }

    try {
      const response = await createPaymentIntentforsampoints(payload)
      const { url } = response?.session
      window.location.href = url
      setLoading(false)
    } catch (error) {
      console.error('Error creating payment intent:', error)
      setLoading(false)
    }
  }

  return (
    <>
      {!fromRivals && <Header />}
      <div className="po-page">
        {/* Back */}
        <button className="po-back" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined /> Back to Store
        </button>

        {/* Header */}
        <div className="po-header">
          <h1 className="po-title">Complete Your Purchase</h1>
          <p className="po-subtitle">
            You&apos;re purchasing <strong>{mysampoints} SAM Points</strong> for <strong>${Number(displayTotal).toFixed(2)}</strong> (incl. {displayVatPct}% VAT)
          </p>
        </div>

        {/* Order summary */}
        <div className="po-summary">
          <div className="po-summary-row">
            <span className="po-summary-label">SAM Points</span>
            <span className="po-summary-val">{mysampoints} SP</span>
          </div>
          <div className="po-summary-divider" />
          <div className="po-summary-row">
            <span className="po-summary-label">Subtotal</span>
            <span className="po-summary-val">${Number(displayNet).toFixed(2)}</span>
          </div>
          <div className="po-summary-row">
            <span className="po-summary-label">VAT ({displayVatPct}%)</span>
            <span className="po-summary-val">${Number(displayVat).toFixed(2)}</span>
          </div>
          <div className="po-summary-divider" />
          <div className="po-summary-row po-summary-row--total">
            <span className="po-summary-label">Total</span>
            <span className="po-summary-total">${Number(displayTotal).toFixed(2)}</span>
          </div>
        </div>

        {/* Stripe Payment Option */}
        <div
          className={`po-method ${loading ? 'po-method--loading' : ''}`}
          onClick={!loading ? sampointspayment : undefined}
        >
          <div className="po-method-left">
            <div className="po-method-icon">
              <CreditCardOutlined />
            </div>
            <div className="po-method-info">
              <h3 className="po-method-name">Pay with Card</h3>
              <p className="po-method-desc">Secure checkout via Stripe, Visa, Mastercard, Amex</p>
            </div>
          </div>
          <div className="po-method-right">
            <span className="po-method-price">${Number(displayTotal).toFixed(2)}</span>
            <span className="po-method-badge">
              <LockOutlined /> Secure
            </span>
          </div>
        </div>

        {/* Stripe branding */}
        <div className="po-trust">
          <SafetyCertificateOutlined />
          <span>Payments are encrypted and processed securely by Stripe. We never store your card details.</span>
        </div>
      </div>
    </>
  )
}

export default Payoptions
