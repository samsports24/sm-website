import React, { useEffect, useState } from 'react';
import sampoints from "../../assets/samtoken_image.png";
import featmoney from '../../assets/fiarmoneylogo.png';
import redline from "../../assets/redline.webp"
import discount from "../../assets/discount.png"
import stripe from "../../assets/stripe-product-image.webp"

import Header from '../../components/Header'
import { Button, Image } from 'antd'
import { useLocation } from 'react-router-dom';

const Payoptions = () => {
  const location = useLocation();
  const { amount } = location.state;


  let discountAmount = 1.69; // Default discount amount

  if (amount === 9.99) {
    discountAmount = 8.49;
  } else if (amount === 19.99) {
    discountAmount = 16.99;
  }

  // console.log('amount',amount);
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
              <p>${amount}</p>
            </div>
          </div>

          <div>
            <Button
             
              //
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
           
              <p>${amount}</p>
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
