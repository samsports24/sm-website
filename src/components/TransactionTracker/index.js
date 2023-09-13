import moment from 'moment'
import React from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'

// Mock Data
import { transactionTrackerData } from '../../pages/mockData'

const TransactionTracker = ({ height = '343px' }) => {
  return (
    <div className='transaction_tracker_box'>
      <header>
        <h3>League Transaction Tracker</h3>
        <p>
          View All <BiRightArrowAlt size={18} />
        </p>
      </header>
      <section className='transaction_tracker_body' style={{ maxHeight: height }}>
        {transactionTrackerData?.map((v, i) => {
          return (
            <div key={i} className='card_box'>
              <div>
                <span className='text1'>Franchise:</span> &nbsp;
                <span className='text2'>{v?.franchise}</span>
              </div>
              <div>
                <span className='text1'>Type:</span> &nbsp;
                <span className='text2'>{v?.type}</span>
              </div>
              <div>
                <span className='text1'>Date:</span> &nbsp;
                <span className='text2'>
                  {moment(v?.date).format('ddd MMM D h:mm:ss a. [ET] YYYY')}
                </span>
              </div>
              <div>
                <span className='text1'>Transaction::</span> &nbsp;
                <span className='text2'>
                  Demoted{' '}
                  <span style={{ color: 'var(--primary)' }}>{v?.transaction?.join(', ')}</span>
                </span>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default TransactionTracker
