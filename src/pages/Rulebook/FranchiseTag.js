import { Button } from 'antd'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import sammetricbreakdown from '../../assets/thesammetric.webp'
import { useDispatch, useSelector } from 'react-redux'
import { getSamMetric } from '../../redux'

const FranchiseTag = () => {
  const navigate = useNavigate()

  
  const baseballPlayers = [
    {
      name: 'QUARTER BACK',
      position: 'QB',
      breakdown: 'SCORING BREAKDOWN.',
      color: '#FFE871',
    },
    {
      name: 'RUNNING BACK',
      position: 'RB',
      breakdown: 'SCORING BREAKDOWN.',
      color: '#FFE871',
    },
    {
      name: 'WIDE RECEIVER',
      position: 'WR',
      breakdown: 'SCORING BREAKDOWN.',
      color: '#EE919E',
    },

    {
      name: 'TIGHT END',
      position: 'TE',
      breakdown: 'SCORING BREAKDOWN.',
      color: '#EE919E',
    },
    {
      name: 'OFFENSIVE LINEMAN',
      position: 'OL',
      breakdown: 'SCORING BREAKDOWN.',
      color: '#FE73FF',
    },
    {
      name: 'PUNTER',
      position: 'ST',
      breakdown: 'SCORING BREAKDOWN.',
      color: '#98CBE6',
    },

    {
      name: 'KICKER',
      position: 'ST',
      breakdown: 'SCORING BREAKDOWN.',
      color: '#98CBE6',
    },
    {
      name: 'INTERIOR D-LINEMAN',
      position: 'DT',
      breakdown: 'SCORING BREAKDOWN.',
      color: '#93FF94',
    },
    {
      name: 'EDGE RUSHER',
      position: 'DE',
      breakdown: 'SCORING BREAKDOWN.',
      color: '#93FF94',
    },

    {
      name: 'LINEBACKER',
      position: 'LB',
      breakdown: 'SCORING BREAKDOWN.',

      color: '#98CBE6',
    },
    {
      name: 'INSIDE LINEBACKER',
      position: 'LB',
      breakdown: 'SCORING BREAKDOWN.',
      color: '#98CBE6',
    },
    {
      name: 'CORNER BACK',
      position: 'CB',
      breakdown: 'SCORING BREAKDOWN.',
      color: '#93FF94',
    },

    {
      name: 'SAFETIES',
      position: 'S',
      breakdown: 'SCORING BREAKDOWN.',
      color: '#98CBE6',
    },
  ]

  const newplayers = baseballPlayers.sort((a, b) => a.index - b.index)

  const dispatch = useDispatch()
  const { allSamMetric } = useSelector((state) => state?.league)
 
  
console.log('allSamMetric',allSamMetric);
  // console.log('Filtered Metrics:', filteredMetrics)

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(getSamMetric())
    }
    fetchData()
  }, [dispatch])



  return (
    <div className='franchisetagcost'>
      <div className='headersection'>
        <div className='headersectionBg' />
        <div className='headersectiontext'>
          <p>
            2024 <br />
            FRANCHISE TAG
            <br />
            <span>BREAKDOWN</span>
          </p>

          <img src={sammetricbreakdown}></img>
          <Button onClick={() => navigate('/rule-book/sammetric')}>Back</Button>
        </div>
      </div>

      <hr style={{ marginTop: '0px' }} className='horizontal-line'></hr>

      <div className='tagcostmain'>
        <p>
          The main goal of this platform and the SamMetric Scoring System is to replicate real-world
          dynamics. To achieve this, we have devised a method that assigns player values based on
          the Franchise Tag scale, resulting in each player&apos;s weekly score reflecting their
          real-world positional value.
        </p>

        <h2>
          2024
          <span>FRANCHISE TAGS</span>
        </h2>

        <>
      {allSamMetric?.sammetric?.map((metric, index) => {
        // Find the matching baseball player object for the current metric.Position
        const matchedPlayer = baseballPlayers.find(player => player.position === metric?.Position);

        return (
          <div key={index} className='sambgback'>
            <div className='samposmain'>
              <div className='samposdesp'>
                <p>
                  {matchedPlayer?.name} <br />
                  <span style={{
                    fontWeight: '700',
                     color: matchedPlayer.color,
                  }}> {metric?.Position}</span>
                </p>
                <p>
                  Franchise Tag #
                  <br />
                  <span style={{
                     color: matchedPlayer.color,
                  }} className='franchise'> ${metric?.FranchiseTagCost?.toLocaleString()}</span>
                </p>
                <p>
                  METRIC %
                  <br />
                  <span style={{
                     color: matchedPlayer.color,
                  }} className='franchise'>{metric?.Percentage}%</span>
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </>

      </div>
    </div>
  )
}

export default FranchiseTag
