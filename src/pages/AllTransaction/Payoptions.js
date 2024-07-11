import React, { useEffect, useState } from 'react';
import sampoints from "../../assets/samtoken_image.png";
import featmoney from '../../assets/fiarmoneylogo.png';
import redline from "../../assets/redline.webp"
import discount from "../../assets/discount.png"

import Header from '../../components/Header'
import { Button, Image } from 'antd'

const Payoptions = () => {
  return (
    <>
      <Header />

      <div className='payoptions-main-div'>
        <div className='pickoption'>PICK YOUR OPTION</div>

        <div className='pickfirstdiv'>
          <div className='flexdiv'>
            <img className='buyimg' src={featmoney} alt='sampointslogo' />
            <div className='paytext'>
              PAY WITH STRIPE
              <p>$1,99</p>
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
           
              <p>$1.99</p>
              </div>
              <div className='discount'>
              
                $1.69
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
