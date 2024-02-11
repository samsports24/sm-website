import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'

import { BiRightArrowAlt } from 'react-icons/bi'

// Mock Data
import { transactionTrackerData } from '../../pages/mockData'
import { getTopTransactions } from '../../redux'
import PlayerDetailsModal from '../modal/PlayerDetailsModal'
import { useSelector } from 'react-redux'

const TransactionTracker = ({ height = '343px' }) => {
  const navigate = useNavigate()
  const [topTransaction, setTopTransaction] = useState([])
  const userDetails = useSelector((state) => state.user.userDetails)

  const getData = async () => {
    const data = await getTopTransactions()
    setTopTransaction(data)
  }

  useEffect(() => {
    getData()
  }, [])

  return (
    <div className='transaction_tracker_box'>
      <header>
        <h3>League Transaction Tracker</h3>
        <p onClick={() => navigate('/all-transaction')}>
          View All <BiRightArrowAlt size={18} />
        </p>
      </header>
      <section className='transaction_tracker_body' style={{ maxHeight: height }}>
        {/* {transactionTrackerData?.map((v, i) => { */}
        {topTransaction?.map((item, i) => {
          return (
            <div key={i} className='card_box'>
              <div>
                <span className='text1'>Franchise:</span> &nbsp;
                <span className='text2'>{item?.team?.name}</span>
              </div>
              <div>
                <span className='text1'>Type:</span> &nbsp;
                <span className='text2'>{item?.module}</span>
              </div>
              <div>
                <span className='text1'>Date:</span> &nbsp;
                <span className='text2'>
                  {moment(item?.createdAt).format('ddd MMM D h:mm:ss a. [ET] YYYY')}
                </span>
              </div>
              <div>
                <span className='text1'>Transaction::</span> &nbsp;
                {item?.module?.toLowerCase() === 'squad' &&
                  item?.sub_module?.toLowerCase() === 'move to non-active' && (
                    <span className='text2'>
                      Players move to non-active squad :{' '}
                      <span style={{ color: 'var(--primary)' }}>
                        {item?.player?.map((v, index) => (
                          <>
                            <PlayerDetailsModal
                              key={index}
                              button={v?.player_id?.Name}
                              state={{
                                isOwnRoster: {
                                  status: userDetails?.team?._id === item?.team?._id ? true : false,
                                },
                                isTeamRoster: {
                                  status: userDetails?.team?._id === item?.team?._id ? false : true,
                                },
                                playerID: v?.player_id?.PlayerID,
                                teamId: item?.team?._id,
                                teamName: item?.team?.name,
                                teamLogo: item?.team?.logo,
                              }}
                              transaction={true}
                            />
                            ,{' '}
                          </>
                        ))}
                      </span>
                    </span>
                  )}
                {item?.module?.toLowerCase() === 'squad' &&
                  item?.sub_module?.toLowerCase() === 'move to practice squad' && (
                    <span className='text2'>
                      <span style={{ color: 'var(--primary)' }}>
                        {item?.player?.map((v, index) => {
                          if (v?.status === 'from') {
                            return (
                              <PlayerDetailsModal
                                key={index}
                                button={v?.player_id?.Name}
                                state={{
                                  isOwnRoster: {
                                    status:
                                      userDetails?.team?._id === item?.team?._id ? true : false,
                                  },
                                  isTeamRoster: {
                                    status:
                                      userDetails?.team?._id === item?.team?._id ? false : true,
                                  },
                                  playerID: v?.player_id?.PlayerID,
                                  teamId: item?.team?._id,
                                  teamName: item?.team?.name,
                                  teamLogo: item?.team?.logo,
                                }}
                                transaction={true}
                              />
                            )
                          }
                        })}{' '}
                      </span>
                      move to Active squad{' '}
                      {item?.player?.map((v, index) => {
                        if (v?.status === 'to') {
                          return (
                            <>
                              and{' '}
                              <span style={{ color: 'var(--primary)' }}>
                                <PlayerDetailsModal
                                  key={index}
                                  button={v?.player_id?.Name}
                                  state={{
                                    isOwnRoster: {
                                      status:
                                        userDetails?.team?._id === item?.team?._id ? true : false,
                                    },
                                    isTeamRoster: {
                                      status:
                                        userDetails?.team?._id === item?.team?._id ? false : true,
                                    },
                                    playerID: v?.player_id?.PlayerID,
                                    teamId: item?.team?._id,
                                    teamName: item?.team?.name,
                                    teamLogo: item?.team?.logo,
                                  }}
                                  transaction={true}
                                />{' '}
                              </span>
                              move to practice squad
                            </>
                          )
                        }
                      })}
                      {/* {item?.player?.filter((v) => v?.status === 'to')?.length > 0 && 'and move to practice squad'} */}
                    </span>
                  )}
                {item?.module?.toLowerCase() === 'squad' &&
                  item?.sub_module?.toLowerCase() === 'removed' && (
                    <span className='text2'>
                      <span style={{ color: 'var(--primary)' }}>
                        {item?.player?.map((v, index) => (
                          <PlayerDetailsModal
                            key={index}
                            button={v?.player_id?.Name}
                            state={{
                              isFreeAgent: {
                                status: true,
                              },
                              playerID: v?.player_id?.PlayerID,
                              teamId: item?.team?._id,
                              teamName: item?.team?.name,
                              teamLogo: item?.team?.logo,
                            }}
                            transaction={true}
                          />
                        ))}
                      </span>{' '}
                      removed from squad
                    </span>
                  )}
                {item?.module?.toLowerCase() === 'squad' &&
                  item?.sub_module?.toLowerCase() === 'moved to injury list' && (
                    <span className='text2'>
                      <span style={{ color: 'var(--primary)' }}>
                        {item?.player?.map((v, index) => (
                          <PlayerDetailsModal
                            key={index}
                            button={v?.player_id?.Name}
                            state={{
                              isOwnRoster: {
                                status: userDetails?.team?._id === item?.team?._id ? true : false,
                              },
                              isTeamRoster: {
                                status: userDetails?.team?._id === item?.team?._id ? false : true,
                              },
                              playerID: v?.player_id?.PlayerID,
                              teamId: item?.team?._id,
                              teamName: item?.team?.name,
                              teamLogo: item?.team?.logo,
                            }}
                            transaction={true}
                          />
                        ))}
                      </span>{' '}
                      moved to injured list
                    </span>
                  )}
                {item?.module?.toLowerCase() === 'squad' &&
                  item?.sub_module?.toLowerCase() === 'auction' && (
                    <span className='text2'>
                      <span style={{ color: 'var(--primary)' }}>
                        {item?.player?.map((v, index) => (
                          <PlayerDetailsModal
                            key={index}
                            button={v?.player_id?.Name}
                            state={{
                              isFreeAgent: {
                                status: true,
                              },
                              playerID: v?.player_id?.PlayerID,
                              teamId: item?.team?._id,
                              teamName: item?.team?.name,
                              teamLogo: item?.team?.logo,
                            }}
                            transaction={true}
                          />
                        ))}
                      </span>{' '}
                      moved to auction
                    </span>
                  )}
                {item?.module?.toLowerCase() === 'squad' &&
                  item?.sub_module?.toLowerCase() === 'player approved from draft' && (
                    <span className='text2'>
                      <span style={{ color: 'var(--primary)' }}>
                        {item?.player?.map((v, index) => (
                          <PlayerDetailsModal
                            key={index}
                            button={v?.player_id?.Name}
                            state={{
                              isFreeAgent: {
                                status: true,
                              },
                              playerID: v?.player_id?.PlayerID,
                              teamId: item?.team?._id,
                              teamName: item?.team?.name,
                              teamLogo: item?.team?.logo,
                            }}
                            transaction={true}
                          />
                        ))}
                      </span>{' '}
                      approved from draft
                    </span>
                  )}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default TransactionTracker
