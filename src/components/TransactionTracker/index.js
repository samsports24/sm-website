import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'

import { BiRightArrowAlt } from 'react-icons/bi'

// Mock Data
import { transactionTrackerData } from '../../pages/mockData'
import { getTopTransactions } from '../../redux'

const TransactionTracker = ({ height = '343px' }) => {
  const navigate = useNavigate()
  // const [topTransaction, setTopTransaction] = useState([])

  const getData = async () => {
    const data = await getTopTransactions()
    setTopTransaction(data)
  }

  // useEffect(() => {
  //   getData()
  // }, [])

  return (
    <div className='transaction_tracker_box'>
      <header>
        <h3>League Transaction Tracker</h3>
        {/* <p onClick={() => navigate('/all-transaction')}> */}
        <p>
          View All <BiRightArrowAlt size={18} />
        </p>
      </header>
      <section className='transaction_tracker_body' style={{ maxHeight: height }}>
        {/* {topTransaction?.map((item, i) => { */}
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
          // return (
          //   <div key={i} className='card_box'>
          //     <div>
          //       <span className='text1'>Franchise:</span> &nbsp;
          //       <span className='text2'>{item?.team?.name}</span>
          //     </div>
          //     <div>
          //       <span className='text1'>Type:</span> &nbsp;
          //       <span className='text2'>{item?.module}</span>
          //     </div>
          //     <div>
          //       <span className='text1'>Date:</span> &nbsp;
          //       <span className='text2'>
          //         {moment(item?.createdAt).format('ddd MMM D h:mm:ss a. [ET] YYYY')}
          //       </span>
          //     </div>
          //     <div>
          //       <span className='text1'>Transaction::</span> &nbsp;
          //       {item?.module?.toLowerCase() === 'squad' &&
          //         item?.sub_module?.toLowerCase() === 'move to non-active' && (
          //           <span className='text2'>
          //             Players move to non-active squad :{' '}
          //             <span style={{ color: 'var(--primary)' }}>
          //               {item?.player?.map((v) => (
          //                 <>{v?.player_id?.Name}, </>
          //               ))}
          //             </span>
          //           </span>
          //         )}
          //       {item?.module?.toLowerCase() === 'squad' &&
          //         item?.sub_module?.toLowerCase() === 'move to practice squad' && (
          //           <span className='text2'>
          //             <span style={{ color: 'var(--primary)' }}>
          //               {item?.player?.filter((v) => v?.status === 'from')?.[0]?.player_id?.Name}{' '}
          //             </span>
          //             move to Active squad and{' '}
          //             <span style={{ color: 'var(--primary)' }}>
          //               {item?.player?.filter((v) => v?.status === 'to')?.[0]?.player_id?.Name}
          //             </span>{' '}
          //             move to practice squad
          //           </span>
          //         )}
          //       {item?.module?.toLowerCase() === 'squad' &&
          //         item?.sub_module?.toLowerCase() === 'removed' && (
          //           <span className='text2'>
          //             <span style={{ color: 'var(--primary)' }}>
          //               {item?.player?.map((v) => v?.player_id?.Name)}
          //             </span>{' '}
          //             removed from squad
          //           </span>
          //         )}
          //     </div>
          //   </div>
          // )
        })}
      </section>
    </div>
  )
}

export default TransactionTracker
