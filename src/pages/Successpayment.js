import { useEffect, useState } from 'react'
import { getSession } from '../redux'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import { useNavigate } from 'react-router-dom'
import { sendpayment } from '../redux/actions/paymentAction'

const Success = () => {
  const navigate = useNavigate()
  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search)
    const sessionId = queryParameters.get('session_id')
    console.log('queryParameters',queryParameters);
    console.log('sessionId',sessionId);
   // getSession({ sessionId }, navigate)
    sendpayment({ sessionId }, navigate)
    
  }, [])

  
  return (
    <>
      <div style={{flexDirection:'column'}} className='signin signup'>
        <h2 style={{marginBottom:'20px'}}>Processing Payment</h2>
        <Spin
          indicator={
            <LoadingOutlined
              style={{
                fontSize: 80,
                margin: '15px 0',
              }}
              spin
            />
          }
          size='large'
        />
      </div>
    </>
  )
}

export default Success