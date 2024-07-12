import React, { useEffect, useState } from 'react';
import sampoints from "../../assets/samtoken_image.png";
import featmoney from '../../assets/fiarmoneylogo.png';
import redline from "../../assets/redline.webp"
import discount from "../../assets/discount.png"
import stripe from "../../assets/stripe-product-image.webp"

import Header from '../../components/Header'
import { Button, Image } from 'antd'
import { useLocation } from 'react-router-dom';
import { createPaymentIntentforsampoints } from '../../redux/actions/paymentAction';

const Payoptions = () => {
  const location = useLocation();
  const { myamount,mysampoints } = location.state;
  const [loading,setLoading]=useState(false)
  console.log('myamount',myamount);

  console.log('mysampoints',mysampoints);

  let discountAmount = 1.69; // Default discount myamount

  if (myamount === 9.99) {
    discountAmount = 8.49;
  } else if (myamount === 19.99) {
    discountAmount = 16.99;
  }


  const sampointspayment = async () => {
    // console.log('in the onlcick');
    setLoading(true)
    const userId = localStorage.getItem('userId')

    if (!userId) {
      console.error('userId not found in localStorage')
      setLoading(false)
      return
    }

  

    const payload = {
      userId,
      // amount:myamount * 100,
      amount: Math.round(myamount * 100),
      mysampoints,

    }
    console.log('payload', payload)

    try {
      const response = await createPaymentIntentforsampoints(payload)
      //  console.log('response',response?.session);
      const { url } = response?.session
      // console.log('url',url);

     //   window.open(url);
       window.location.href = url
      setLoading(false)
    } catch (error) {
      console.error('Error creating payment intent:', error)
      // Handle error as needed
    }
  }


  // console.log('myamount',myamount);
  return (
    <>
      <Header />

      <div className='payoptions-main-div'>
        <div className='pickoption'>PICK YOUR OPTION</div>

        <div className='pickfirstdiv'>
          <div className='flexdiv'>
            <img className='buyimg' src={stripe} alt='sampointslogo' />
            <div className='paytext'>
              PAY WITH STRIPE
              <p>${myamount}</p>
            </div>
          </div>

          <div>
            <Button
             onClick={sampointspayment}
             loading={loading}
  
              type='primary'
            >
              PAY NOW
            </Button>
          </div>
        </div>


        
        <div className='pickfirstdiv'>
          <div className='flexdiv'>
                     <img className='buyimg' src={sampoints} alt='sampointslogo' />
            {/* <img className='discount' src={discount} alt='discount'/> */}
           
            <div className='paytext'>
              PAY WITH SAM
              <div className='discoutgap'>
              <img className='redline' src={redline} alt='discount'/>
              <div>
           
              <p>${myamount}</p>
              </div>
              <div className='discount'>
                {/* $1.69 */}
                ${discountAmount.toFixed(2)}
              </div>
              </div>
            </div>
          </div>



          <div className='paywithsam'>
          <Button
             
             //
             type='primary'
           >
             PAY SAMS
           </Button>


           <Button
             
             onClick={() => window.open('https://sam-wallet-10b1f.web.app/')}
             type='primary'
           >
             GET SAMS
           </Button>
          </div>
          
       
          

          
        </div>
      </div>
    </>
  )
}

export default Payoptions
