import React from 'react'

const RosterDetail = ({ playerFinancials }) => {
  return (
    <div className='roster_detail_box'>
      <div className='rdb_left' />
      <div className='rdb_right'>
        <div className='rdb_right_row1'>
          <p>Allen, Josh BUF QB</p>
          <p>#12 | QB, Team Name</p>
        </div>
        <div className='rdb_right_row2'>
          <p className='active'>2013 Stats</p>
          <p>|</p>
          <p>2014 Projected Stats</p>
          <p>|</p>
          <p>Career Stats</p>
        </div>
        <div className='rdb_right_row3'>
          <div>
            <p>Bye</p>
            <p>10</p>
          </div>
          <div>
            <p>13</p>
            <p>251.52</p>
          </div>
          <div>
            <p>14 Proj</p>
            <p>292.25</p>
          </div>
          <div>
            <p>Pass Yds</p>
            <p>3214</p>
          </div>
          <div>
            <p>Pass Td</p>
            <p>24</p>
          </div>
          <div>
            <p>PassInt</p>
            <p>11</p>
          </div>
        </div>
        <div className='rdb_right_row4'>
          <div className='draft_by'>
            <p>Draft By</p>
            <p>Team 4</p>
          </div>
          {playerFinancials && (
            <div className='pf_box'>
              <p>Player Financials:</p>
              <p>23’ CAP HIT $28,90,000</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RosterDetail
