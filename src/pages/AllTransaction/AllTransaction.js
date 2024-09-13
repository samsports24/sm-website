import React, { useEffect, useState } from 'react'
import { Select, DatePicker } from 'antd'
import moment from 'moment'
import { useSelector } from 'react-redux'

import { GrFormClose } from 'react-icons/gr'

import Header from '../../components/Header'
import Loader from '../../components/Loader'
import { getAllTransactions } from '../../redux'
import { getAllTeamsList } from '../../redux/actions/teamActions'
import PlayerDetailsModal from '../../components/modal/PlayerDetailsModal'

const AllTransaction = () => {
  const { RangePicker } = DatePicker
  const [transaction, setTransaction] = useState([])
  const [teamsList, setTeamsList] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [dateRange, setDateRange] = useState(null)
  const { isLoading } = useSelector((state) => state?.transaction)
  const { userDetails } = useSelector((state) => state?.user)

  const getData = async () => {
    const payload = {
      team: selectedTeam,
      dateRange,
    }

    const data = await getAllTransactions(payload)
    setTransaction(data)
  }

  useEffect(() => {
    ;(async () => {
      let teams = await getAllTeamsList()
      setTeamsList(teams)
    })()
  }, [])

  useEffect(() => {
    getData()
  }, [selectedTeam, dateRange])

  const onChangeTeamFilter = async (e) => {
    setSelectedTeam(e)
  }

  const rangeChangeHandler = async (e, v) => {
    if (v[0]?.length > 0 && v[1]?.length > 0) {
      setDateRange(v)
    } else {
      setDateRange(null)
    }
  }

  return (
    <>
      <Header />

      <div
        style={{
          margin: '1rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '1rem',
        }}
      >
        <Select
          placeholder='Select Team'
          onChange={onChangeTeamFilter}
          allowClear={{ clearIcon: <GrFormClose size={25} onClick={() => {}} /> }}
          onClear={async () => {
            setSelectedTeam(null)
          }}
          options={teamsList?.map((item) => ({
            value: item?._id,
            label: item?.name,
          }))}
          className='filter_select_box'
          style={{ minWidth: '180px' }}
        />

        <RangePicker className='all_transaction_picker' onChange={rangeChangeHandler} />
      </div>

      <div className='transaction_tracker_box transaction_height_box'>
        <section className='transaction_tracker_body'>
          {isLoading ? (
            <Loader />
          ) : (
            transaction?.map((item, i) => {
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
                          {item?.player?.find(obj => obj.status === "from") &&  `move to Active squad and `}
                          {item?.player?.map((v, index) => {
                            if (v?.status === 'to') {
                              return (
                                <>
                                  <span style={{ color: 'var(--primary)' }}>
                                    <PlayerDetailsModal
                                      key={index}
                                      button={v?.player_id?.Name}
                                      state={{
                                        isOwnRoster: {
                                          status:
                                            userDetails?.team?._id === item?.team?._id
                                              ? true
                                              : false,
                                        },
                                        isTeamRoster: {
                                          status:
                                            userDetails?.team?._id === item?.team?._id
                                              ? false
                                              : true,
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
            })
          )}
        </section>
      </div>
    </>
  )
}

export default AllTransaction
