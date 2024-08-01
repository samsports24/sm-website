import { Button, Tabs } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import payscalebrekadown from '../../assets/updtaed.png'
import payscalelogo from '../../assets/payscalesamlogo.png'

const SampointsBreakdown = () => {
  const navigate = useNavigate()

  return (
    <div className='sampointsbreakdownmain'>
      <div className='headersection'>
        <div className='headersectionBg' />
        <div className='headersectiontext'>
          <p>
            SamPoints <span>Breakdown</span>
          </p>

          <Button onClick={() => navigate('/rule-book')}>Back</Button>
        </div>
      </div>

      <hr style={{ marginTop: '0px' }} className='horizontal-line'></hr>
      <div className='sambreakdowninfo'>
        <p>
          SamPoints
          <span>
            are the cornerstone of our in-game economy, facilitating player acquisitions, upgrades,
            and rewarding activities. Each week, users can earn SamPoints through our stadium tab,
            detailed in our reward section. Moreover, SamPoints play a crucial role in funding
            incoming rookies annually. The cost of each rookie is calculated as a percentage of the
            upcoming year&apos;s league salary cap, ensuring that higher draft picks require a
            greater investment of SamPoints, correlating with their draft position. This system
            ensures fairness and strategic planning in roster management.
          </span>
        </p>
        <div className='payscaleclass'>
          <div>
            <a
              className='rookiescale'
              href='https://samsports.s3.amazonaws.com/17225116568163855.2177434368896.pdf'
              // target='_blank'
              // rel='noopener noreferrer'
            >
              ROOKIE PAY SCALE BREAKDOWN
            </a>
            <div>
              <img style={{ width: '20%', marginTop: '20px' }} src={payscalebrekadown}></img>
            </div>
          </div>

          <img className='paysacalelogo' src={payscalelogo}></img>
        </div>
      </div>
    </div>
  )
}

export default SampointsBreakdown
