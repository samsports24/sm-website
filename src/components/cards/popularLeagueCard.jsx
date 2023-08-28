import React from 'react'

import CaledarIcon from '../../assets/calender.svg'
import Dice from '../../assets/dice.svg'
import LoaderIcon from '../../assets/loaderIcon.svg'
import AuctionIcon from '../../assets/auctionIcon.svg'
import DynastyIcon from '../../assets/dynasty.svg'
import TrophyIcon from '../../assets/trophy.svg'
import DollorIcon from '../../assets/dollor-icon.svg'
import DollorIcon1 from '../../assets/dollor-icon-white.svg'

const PopularLeagueCard = ({ data }) => {
  return (
    <div className='league-card '>
      <div
        className='container1'
        style={{
          backgroundImage: `url(${data?.image})`,
        }}
      >
        <div className='content'>
          <div className='sports-logo'>
            <img src={data?.Logo} />
          </div>
          <h1>{data?.title || ''}</h1>
          {/* <h3>{data?.description}</h3> */}
        </div>
      </div>
      <div className='container2'>
        <div className='row1'>
          <div className='col'>
            <span>Draft Starts</span>
            <p>
              <img src={CaledarIcon} /> 9/01/23
            </p>
          </div>
          <div className='col'>
            <span>players</span>
            <p>
              <img src={Dice} /> {data.players[0]}-{data.players[1]}
            </p>
          </div>
        </div>
        <div className='row-type'>
          <p>League Type</p>
          <div className='price m-b-16'>
            <div className='lead'>
              <img src={LoaderIcon} />
              <p>Redraft</p>
            </div>
            <div className='lead'>
              <img src={AuctionIcon} />
              <p>Auction</p>
            </div>
          </div>
          <div className='price m-b-20'>
            <div className='lead'>
              <img src={DynastyIcon} />
              <p>Dynasty</p>
            </div>
            <div className='lead'>
              <img src={TrophyIcon} />
              <p>SFL</p>
            </div>
          </div>
        </div>
        <div className='row-type'>
          <p>League Bid Increments Min.</p>
          <div className='price m-b-24'>
            <div className='lead'>
              <img src={DollorIcon} />
              <p> $0.25</p>
            </div>
            <div className='lead'>
              <img src={DollorIcon1} />
              <p> $5.00</p>
            </div>
            <div className='lead'>
              <img src={DollorIcon1} />
              <p> $25.00</p>
            </div>
          </div>
        </div>
      </div>
      <div className='container3'>
        <img src={require('../../assets/players.png')} />
        <span>3,000,000+ players</span>
      </div>
    </div>
  )
}

export default PopularLeagueCard
