import React, { useEffect, useState } from 'react'
import samlogo from '../../assets/logoforbuycoins.png'
import buypoints from '../../assets/buyimage.webp'
import sampointslogo from '../../assets/samcoinlogo.png'

import Header from '../../components/Header'
import { Button, Image } from 'antd'
import { useNavigate } from 'react-router-dom'

const BuySampoints = () => {

    const navigate = useNavigate()
  return (
    <>
      <Header />

      <div className='buyingsampointsmaincontainer'>
        {/* <Image preview={false} src={samlogo} alt='sampointslogo' /> */}
        <img className='buyimg' src={samlogo} alt='sampointslogo' />

        <div  style={{position:'absolute',left:'32%'}} className='buypoints noposition'>
          <p> BUY SAM POINTS</p>

          <div className='mainbox' >
            <div className='firstbox'>
              {/* <Image preview={false} src={buypoints} alt='sampointslogo' /> */}

              <img className='buypoints' src={buypoints} alt='sampointslogo' />

              <div className='flexdiv'>
              <img className='myimgdiv' src={sampointslogo} alt='SAMPOINTS' />
                <div className='myleaguemoney'>1,000,000</div>
              </div>
              <div className='cost'>
                COST: $1.99
                <Button
                   className='buycoins'
                   onClick={() => navigate('/select-buy-options')}
                    type='primary'
                   
                  >
                    BUY
                  </Button>
              </div>
            </div>
            <div className='firstbox'>
              {/* <Image preview={false} src={buypoints} alt='sampointslogo' /> */}

              <img className='buypoints' src={buypoints} alt='sampointslogo' />

              <div className='flexdiv'>
              <img className='myimgdiv' src={sampointslogo} alt='SAMPOINTS' />
                {/* <div className='myleaguemoney'>5,000,000</div> */}
                <div className='myleaguemoney'>7,500,000</div>
              </div>
              <div className='cost'>
                COST: $9.99
                <Button
                   className='buycoins'
                   onClick={() => navigate('/select-buy-options')}
                  
                    type='primary'
                   
                  >
                    BUY
                  </Button>
              </div>
            </div>

            <div className='firstbox'>
              {/* <Image preview={false} src={buypoints} alt='sampointslogo' /> */}

              <img className='buypoints' src={buypoints} alt='sampointslogo' />

              <div className='flexdiv'>
              <img className='myimgdiv' src={sampointslogo} alt='SAMPOINTS' />
                {/* <div className='myleaguemoney'>10,000,000</div> */}
                <div className='myleaguemoney'>12,500,000</div>
              </div>
              <div className='cost'>
                COST: $19.99
                <Button
                   className='buycoins'
                   onClick={() => navigate('/select-buy-options')}
                    type='primary'
                   
                  >
                    BUY
                  </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default BuySampoints
