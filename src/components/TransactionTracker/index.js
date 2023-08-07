import React from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'

// Mock Data

const TransactionTracker = () => {
  return (
    <div className='transaction_tracker_box'>
      <header>
        <h3>League Transaction Tracker</h3>
        <p>
          View All <BiRightArrowAlt size={18} />
        </p>
      </header>
      <section className='league_standings_body'>
        {['', '', ''].map((v, i) => {
          return (
            <div key={i} className='card_box'>
              <div>
                <span className='text1'>Franchise:</span> &nbsp;
                <span className='text2'>The Beast</span>
              </div>
              <div>
                <span className='text1'>Type:</span> &nbsp;
                <span className='text2'>Taxi Squad</span>
              </div>
              <div>
                <span className='text1'>Date:</span> &nbsp;
                <span className='text2'>Tue Jan 10 2:58:09 span.m. ET 2023</span>
              </div>
              <div>
                <span className='text1'>Transaction::</span> &nbsp;
                <span className='text2'>Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB</span>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default TransactionTracker
