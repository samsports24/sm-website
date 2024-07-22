import { Button } from 'antd'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import sammetricbreakdown from '../../assets/thesammetric.webp'

const SamPositiontab = () => {
  const navigate = useNavigate()

  const location = useLocation()
  console.log('location', location.state.playerName)
  return (
    <div className='Sammetricposition'>
      <div className='headersection'>
        <div className='headersectionBg' />
        <div className='headersectiontext'>
          <div className='samimg'>
            <img src={sammetricbreakdown}></img>
          </div>
          <h2>
            {location?.state?.playerName}
            <span>BREAKDOWN</span>
          </h2>

          <Button onClick={() => navigate('/rule-book')}>Back</Button>
        </div>
      </div>

      <hr style={{ marginTop: '0px' }} className='horizontal-line'></hr>
      <div className='sambgback'>
        <div className='samposmain'>
          <div className='samposdesp'>
            <p>
              {location.state.playerName} <br />
              <span>{location.state.playerPosition}</span>
            </p>
            <p>
              Franchise Tag #
              <br />
              <span className='franchise'>$38,301,000</span>
            </p>

            <p>
              METRIC %
              <br />
              <span className='franchise'>100%</span>
            </p>
          </div>
        </div>

        <div className='scoringcolumn'>

            <p>SCORING TOPIC</p>
            <p>FULL SCALE</p>
            <p>METRIC %</p>
            <p>PAST YEAR</p>
            <p>areow</p>
            <p>CURRENT YEAR</p>

        </div>

        <div className='new-horizontal-line'>
        </div>

        <div className='positiondetails'>
            <p>
            {location.state.playerName} Passing
            </p>

            <div className='positiondetailsinfo'>

            <p>PASSING YARDS</p>
            <p>***</p>
            <p>100%</p>
            <p>****</p>
            <p>areow</p>
            <p>0.004</p>

            </div>

        </div>
      </div>
    </div>
  )
}

export default SamPositiontab
