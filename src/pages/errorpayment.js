import { useEffect } from 'react'
import { getSession } from '../redux'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import { useNavigate } from 'react-router-dom'
import failed from '../assets/failed.png'
import { sendpayment } from '../redux/actions/paymentAction'

const Error = () => {
  const navigate = useNavigate()

  const handleNavigate = () => {
    navigate('/proleague'); // Navigate to '/proleague' route on click
  };
//   useEffect(() => {
//     const queryParameters = new URLSearchParams(window.location.search)
//     const sessionId = queryParameters.get('session_id')
//     console.log('queryParameters',queryParameters);
//     console.log('sessionId',sessionId);
//    // getSession({ sessionId }, navigate)
//     sendpayment({ sessionId }, navigate)
    
//   }, [])
  return (
    <>
    <div style={{ flexDirection:'column-reverse' }} className='signin signup'>
    <h2 style={{ cursor: 'pointer', marginBottom: '20px' }} onClick={handleNavigate}>Back to payment page</h2>
      <h2 style={{ marginBottom: '20px', color: '#FF0000' }}>Processing Payment Failed</h2>
 
      {/* Replace Spin component with the imported image */}
      <img
        src={failed}
        alt="Failed"
        style={{
          width: '80px',
          margin: '15px 0',
        }}
      />
    </div>
  </>
  )
}

export default Error