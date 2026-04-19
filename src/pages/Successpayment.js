import { useEffect } from 'react'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { sendpaymentforsampoints } from '../redux/actions/paymentAction'

const Success = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search)
    const sessionId = queryParameters.get('session_id')

    if (sessionId) {
      sendpaymentforsampoints({ sessionId }, navigate)
    } else {
      navigate('/dashboard')
    }
  }, [navigate])

  return (
    <div style={{ flexDirection: 'column' }} className='signin signup'>
      <h2 style={{ marginBottom: '20px' }}>Processing Payment</h2>
      <Spin
        indicator={
          <LoadingOutlined style={{ fontSize: 80, margin: '15px 0' }} spin />
        }
        size='large'
      />
    </div>
  )
}

export default Success
