import { Button, Tabs } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import sammetricbreakdown from '../../assets/thesammetric.webp'


const SammetricBreakdown = () => {
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
    // {
    //   name: 'INSIDE LINEBACKER',
    //   position: 'LB',
    //   breakdown: 'SCORING BREAKDOWN.',
    //   color: '#98CBE6',
    // },
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


  const handlePlayerClick = (playerName,playerPosition,playerColor) => {
    // navigate(`/rule-book/samposition/${(playerName)}`);
    navigate('/rule-book/samposition', { state: { playerName,playerPosition,playerColor } });
  }

  return (
    <div className='SammetricBreakdown'>
      <div className='headersection'>
        <div className='headersectionBg' />
        <div className='headersectiontext'>
          <div className='samimg'>
            <img src={sammetricbreakdown}></img>
            <p>SCORING BREAKDOWN</p>
          </div>
          <h2>
            POSITION <span>BREAKDOWN</span>
          </h2>
          <Button onClick={() => navigate('/rule-book')}>Back</Button>
        </div>
      </div>

      <hr style={{ marginTop: '0px' }} className='horizontal-line'></hr>
      <div className='sambgback'>
        <div className='sammetricinfo'>
          <div className='sampara'>
            <p>
              The SAM Metric,{' '}
              <span>
                is a groundbreaking scoring system designed to replicate real- world dynamics and
                accurately reflect player values across all sports on our platform. Based on the
                Franchise Tag scale and average yearly contracts for each position, this metric
                ensures the highest-paid positions and players achieve the highest points per game
                averages. By evolving annually with NFL franchise tag updates, the SAM Metric
                maintains its relevance and accuracy, setting a new standard in fantasy sports
                scoring.
              </span>
            </p>
          </div>
        
          <div onClick={() => navigate('/rule-book/franchisetag')} className='sambox'>
            <h2>
              2024 FRANCHISE TAG <br />
              <span>BREAKDOWN</span>
            </h2>

            <img className='sammetricimg' src={sammetricbreakdown}></img>
          </div>

          <div></div>
        </div>

   

        <>
          <div className='mainsambox'>
            {newplayers?.map((player, index) => {
    
              return (
                <div key={index} onClick={() => handlePlayerClick(player.name,player.position,player?.color)} className='sampositions'>
                  <p>
                    {player.name} <br />
                    <h1>{player.breakdown}</h1>
                  </p>
                  {/* <h2>{player.position}</h2> */}
                  <span
                    style={{
                      color: player?.color,
                    }}
                  >
                    {player.position}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      </div>
    </div>
  )
}

export default SammetricBreakdown
