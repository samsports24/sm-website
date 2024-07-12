import { useEffect, useState } from 'react'
import { getSession } from '../redux'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import { useNavigate } from 'react-router-dom'
import { sendpayment, sendpaymentforsampoints } from '../redux/actions/paymentAction'

const Success = () => {
  const navigate = useNavigate()
  useEffect(() => {
    console.log('in the payment effect');
    const email = localStorage.getItem('email');
    const leagueid = localStorage.getItem('AssignLeague');
    const queryParameters = new URLSearchParams(window.location.search)
    const sessionId = queryParameters.get('session_id')
    const amount = queryParameters.get('amount');

    console.log('amount',amount);
    if (amount) {
      sendpaymentforsampoints({ sessionId }, navigate);
    } else {
    
      sendpayment({ sessionId, email, leagueid }, navigate);
    }
    // console.log('queryParameters',queryParameters);
    // console.log('sessionId',sessionId);

   // getSession({ sessionId }, navigate)
    // sendpayment({ sessionId,email,leagueid}, navigate)
    // sendpaymentforsampoints({ sessionId}, navigate)
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