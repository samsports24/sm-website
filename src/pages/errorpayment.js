import { useEffect } from 'react'
import { getSession } from '../redux'
import { Button, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import { useNavigate } from 'react-router-dom'
import failed from '../assets/failed.png'
import { sendpayment } from '../redux/actions/paymentAction'

const Error = () => {
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  console.log('token',token);

  const handleNavigate = () => {
     navigate('/'); // Navigate to '/' route on click
  };
  useEffect(() => {
    // Remove email and AssignLeague from local storage
    localStorage.removeItem('email');
    localStorage.removeItem('AssignLeague');

    // const queryParameters = new URLSearchParams(window.location.search)
    // const sessionId = queryParameters.get('session_id')
    // console.log('queryParameters',queryParameters);
    // console.log('sessionId',sessionId);
    // getSession({ sessionId }, navigate)
    // sendpayment({ sessionId }, navigate)

  }, []);




  return (
    <>
    <div style={{ flexDirection:'column-reverse' }} className='signin signup'>
    <Button style={{ cursor: 'pointer', marginBottom: '20px',width:'15%',borderRadius:'20px',height:'71px',

border: '2px solid #00a7e5',
    background: '#00a7e5',
   fontSize: '27px',
    fontWeight: 600,
    color: 'var(--text)'

     }} onClick={handleNavigate}>Back to Home</Button>
       <h2 style={{ marginBottom: '20px', color: '#FF0000' }}> Kindly Click On The Invitation Link From Your Email</h2>
      <h2 style={{ marginBottom: '20px', color: '#FF0000' }}> Payment Failed/cancelled</h2>
    
 
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