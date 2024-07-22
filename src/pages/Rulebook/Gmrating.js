import { Button, Tabs } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gmrating from '../../assets/gmratingmain.webp'

const GmRating = () => {
  const navigate = useNavigate()

  return (
    <div className='gmratingmain'>
      <div className='headersection'>
        <div className='headersectionBg' />
        <div className='headersectiontext'>
          <p>
            GM <span>RATING</span>
          </p>
          <h2>COMING SOON !</h2>
          <Button onClick={() => navigate('/rule-book')}>Back</Button>
        </div>
      </div>

      <hr style={{ marginTop: '0px' }} className='horizontal-line'></hr>
      <div className='gmratinginfo'>
        <div>
          <h1>
            The GM Rating system for our fantasy football platform evaluates users based on two
            primary factors: the differential between bench and starting lineup points (55% and the
            average weekly score (45%))
          </h1>
          <h2>
            Bench vs. Starting Lineup Points Differential (55%):
            <p>
              Users score higher when their starting players outscore bench players in the same
              positions. Selecting the optimal formation for both offense and defense, ensuring that
              the highest-scoring players are on the field, is crucial. Points are deducted if bench
              players outperform starters.
            </p>
          </h2>

          <h2>
            Average Weekly Score (45%):
            <p>
              This component assesses the user&apos;s performance by calculating the average points
              scored per week, comparing the user&apos;s score within their league and across the
              entire platform. Users with the highest weekly averages in their league and
              platform-wide receive higher scores.
            </p>
          </h2>

          <h2>
            Optimal Performance:
            <p>
              To achieve a perfect 100.00 GM Rating, a user must consistently select the correct
              formations, ensuring that all highest scoring players are starters and no bench
              players outperform starters. Additionally, the user must have the highest average
              weekly score across all leagues on the platform.
            </p>
          </h2>

          <h2>
            Poor Performance:
            <p>
              A 0.00 GM Rating results from consistently selecting incorrect formations, having
              bench players outscore starters, and maintaining the lowest weekly average score
              within their league and across the entire platform.
            </p>
            <p style={{ marginTop: '10px' }}>
              This system provides users with a comprehensive measure of their managerial skills,
              offering insights into their decision-making and performance relative to peers.
              Regular updates and recommendations help users optimize their lineups, encouraging
              strategic gameplay and continuous improvement.
            </p>
          </h2>
        </div>

        <div>
          <img className='gmimg' src={gmrating}></img>
        </div>
      </div>
    </div>
  )
}

export default GmRating
