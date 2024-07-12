import { useEffect, useState } from 'react'
import { getSession } from '../redux'
import { Button, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import { useNavigate } from 'react-router-dom'
import failed from '../assets/failed.png'
import { sendpayment, sendpaymentforsampoints } from '../redux/actions/paymentAction'

const Error = () => {
  const navigate = useNavigate()
const [newamount,setNewamount]=useState(null)

  const token = localStorage.getItem('token')
  console.log('token',token);

  const handleNavigate = () => {

    if(newamount){
      navigate('/professional-league');
      setNewamount('')
      // Navigate to '/' route on click
    }
    else {
      navigate('/'); // Navigate to '/' route on click
    }
    
  };
  useEffect(() => {
    // Remove email and AssignLeague from local storage
  
    // const queryParameters = new URLSearchParams(window.location.search)
    // const sessionId = queryParameters.get('session_id')
    // console.log('queryParameters',queryParameters);
    // console.log('sessionId',sessionId);
    // getSession({ sessionId }, navigate)
    // sendpayment({ sessionId }, navigate)


    console.log('in the error payment effect');
    const email = localStorage.getItem('email');
    const leagueid = localStorage.getItem('AssignLeague');
    const queryParameters = new URLSearchParams(window.location.search)
    const sessionId = queryParameters.get('session_id')

    const amount = queryParameters.get('amount');
    setNewamount(amount)
    if (amount) {
     
      sendpaymentforsampoints({ sessionId }, navigate);
    } else {
    
      sendpayment({ sessionId, email, leagueid }, navigate);
    }


    // console.log('queryParameters',queryParameters);
    // console.log('sessionId',sessionId);
   // getSession({ sessionId }, navigate)
    // sendpayment({ sessionId,email,leagueid}, navigate)

    // localStorage.removeItem('email');
    // localStorage.removeItem('AssignLeague');



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

{/* const amount = queryParameters.get('amount'); */}
{newamount ? null : (
        <h2 style={{ marginBottom: '20px', color: '#FF0000' }}>
          Kindly Click On The Invitation Link From Your Email
        </h2>
      )}
       {/* <h2 style={{ marginBottom: '20px', color: '#FF0000' }}> Kindly Click On The Invitation Link From Your Email</h2> */}
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