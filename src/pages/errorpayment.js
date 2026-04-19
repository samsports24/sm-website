import { useEffect, useState } from 'react'
import { Button } from 'antd'
import { ArrowLeftOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import '../styles/pages/errorpayment.css'

const Error = () => {
  const navigate = useNavigate()
  const [isSamPoints, setIsSamPoints] = useState(false)

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search)
    const amount = queryParameters.get('amount')
    if (amount) setIsSamPoints(true)
  }, [])

  return (
    <div className="error-payment-container">
      <div className="error-payment-card">
        <div className="error-icon-wrapper">
          <CloseCircleOutlined className="error-icon" />
        </div>

        <h1 className="error-title">Payment Failed</h1>

        <p className="error-subtitle">
          Your payment could not be processed at this time.
        </p>

        <div className="error-description">
          <p>Please try again or contact support if the problem persists.</p>
        </div>

        <div className="error-actions">
          <Button className="btn-retry" onClick={() => navigate('/dashboard')} type="primary">
            Try Again
          </Button>
          <Button className="btn-back" onClick={() => navigate('/')}>
            <ArrowLeftOutlined /> Back to Home
          </Button>
        </div>

        <div className="error-support">
          <p>
            Need help? <span className="support-link">Contact Support</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Error
