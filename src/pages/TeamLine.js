import React, { useEffect, useState } from 'react'
import { Breadcrumb } from 'antd'
import { BiRightArrowAlt } from 'react-icons/bi'
import { GiHockey } from 'react-icons/gi'

import Header from '../components/Header'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import Loader from '../components/Loader'

const _forwardData = [
  {
    type: '',
    name: '',
    classKey: 'line1-1',
    picture: '',
  },
  {
    type: '',
    name: '',
    classKey: 'line1-2',
    picture: '',
  },
  {
    type: '',
    name: '',
    classKey: 'line1-3',
    picture: '',
  },
  {
    type: '',
    name: '',
    classKey: 'line2-1',
    picture: '',
  },
  {
    type: '',
    name: '',
    classKey: 'line2-2',
    picture: '',
  },
  {
    type: '',
    name: '',
    classKey: 'line2-3',
    picture: '',
  },
  {
    type: '',
    name: '',
    classKey: 'line3-1',
    picture: '',
  },
  {
    type: '',
    name: '',
    classKey: 'line3-2',
    picture: '',
  },
  {
    type: '',
    name: '',
    classKey: 'line3-3',
    picture: '',
  },
  {
    type: '',
    name: '',
    classKey: 'line4-1',
    picture: '',
  },
  {
    type: '',
    name: '',
    classKey: 'line4-2',
    picture: '',
  },
  {
    type: '',
    name: '',
    classKey: 'line4-3',
    picture: '',
  },
]
const _defenderData = [
  {
    type: '',
    name: '',
    classKey: 'pairing1-1',
    picture: '',
  },
  {
    type: '',
    name: '',
    classKey: 'pairing1-2',
    picture: '',
  },
  {
    type: '',
    name: '',
    classKey: 'pairing2-1',
    picture: '',
  },
  {
    type: '',
    name: '',
    classKey: 'pairing2-2',
    picture: '',
  },
  {
    type: '',
    name: '',
    classKey: 'pairing3-1',
    picture: '',
  },
  {
    type: '',
    name: '',
    classKey: 'pairing3-2',
    picture: '',
  },
  {
    type: '',
    name: '',
    classKey: 'pairing4-1',
    picture: '',
  },
]

const forwarApi = [
  {
    _id: '123456781',
    Name: 'Alex Tuch',
    PlayerID: 123481,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-1.png'),
    classKey: 'line1-1',
  },
  {
    _id: '123456782',
    Name: 'Andrei Kuzmenko',
    PlayerID: 123482,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-2.png'),
    classKey: 'line1-2',
  },
  {
    _id: '123456783',
    Name: 'Darnell Nurse',
    PlayerID: 123483,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-3.png'),
    classKey: 'line1-3',
  },
  {
    _id: '123456784',
    Name: 'Alex Tuch',
    PlayerID: 123484,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-1.png'),
    classKey: 'line2-1',
  },
  {
    _id: '123456785',
    Name: 'Andrei Kuzmenko',
    PlayerID: 123485,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-2.png'),
    classKey: 'line2-2',
  },
  {
    _id: '123456786',
    Name: 'Darnell Nurse',
    PlayerID: 123486,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-3.png'),
    classKey: 'line2-3',
  },
  {
    _id: '123456787',
    Name: 'Alex Tuch',
    PlayerID: 123487,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-1.png'),
    classKey: 'line3-1',
  },
  {
    _id: '123456788',
    Name: 'Andrei Kuzmenko',
    PlayerID: 123488,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-2.png'),
    classKey: 'line3-2',
  },
  {
    _id: '123456789',
    Name: 'Darnell Nurse',
    PlayerID: 123489,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-3.png'),
    classKey: 'line3-3',
  },
  {
    _id: '123456790',
    Name: 'Alex Tuch',
    PlayerID: 123490,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-1.png'),
    classKey: 'line4-1',
  },
  {
    _id: '123456791',
    Name: 'Andrei Kuzmenko',
    PlayerID: 123491,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-2.png'),
    classKey: 'line4-2',
  },
  {
    _id: '123456792',
    Name: 'Darnell Nurse',
    PlayerID: 123492,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-3.png'),
    classKey: 'line4-3',
  },
]
const defenderApi = [
  {
    _id: '123456721',
    Name: 'Alex Tuch',
    PlayerID: 123421,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-1.png'),
    classKey: 'pairing1-1',
  },
  {
    _id: '123456722',
    Name: 'Andrei Kuzmenko',
    PlayerID: 123422,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-2.png'),
    classKey: 'pairing1-2',
  },
  {
    _id: '123456723',
    Name: 'Alex Tuch',
    PlayerID: 123423,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-1.png'),
    classKey: 'pairing2-1',
  },
  {
    _id: '123456724',
    Name: 'Andrei Kuzmenko',
    PlayerID: 123424,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-2.png'),
    classKey: 'pairing2-2',
  },
  {
    _id: '123456735',
    Name: 'Alex Tuch',
    PlayerID: 123425,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-1.png'),
    classKey: 'pairing3-1',
  },
  {
    _id: '123456736',
    Name: 'Andrei Kuzmenko',
    PlayerID: 123436,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-2.png'),
    classKey: 'pairing3-2',
  },
  {
    _id: '123456737',
    Name: 'Alex Tuch',
    PlayerID: 123437,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-1.png'),
    classKey: 'pairing4-1',
  },
]
const benchApi = [
  {
    _id: '1234567100',
    Name: 'Ryan Nugent-Hopkins',
    PlayerID: 12342100,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-2.png'),
    classKey: 'pairing1-1',
    Team: 'WSH',
    Position: 'FWD',
    InjuryStatus: 'INJ',
    Projection: '7.05',
  },
  {
    _id: '1234567101',
    Name: 'Ryan Nugent-Hopkins',
    PlayerID: 12342101,
    HostedHeadshotNoBackgroundUrl: '',
    classKey: 'pairing2-1',
    Team: 'WSH',
    Position: 'FWD',
    InjuryStatus: 'INJ',
    Projection: '7.05',
  },
  {
    _id: '1234567103',
    Name: 'Ryan Nugent-Hopkins',
    PlayerID: 12342100,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-2.png'),
    classKey: 'pairing3-1',
    Team: 'WSH',
    Position: 'FWD',
    InjuryStatus: 'INJ',
    Projection: '7.05',
  },
  {
    _id: '1234567104',
    Name: 'Ryan Nugent-Hopkins',
    PlayerID: 12342100,
    HostedHeadshotNoBackgroundUrl: require('../assets/hockey-2.png'),
    classKey: 'pairing4-1',
    Team: 'WSH',
    Position: 'FWD',
    InjuryStatus: 'INJ',
    Projection: '7.05',
  },
]

const TeamLine = () => {
  const [forwardData, setForwardData] = useState(_forwardData)
  const [defenderData, setDefenderData] = useState(_defenderData)
  const [benchData, setBenchData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      if (forwarApi?.length > 0) {
        forwarApi.map((item) => {
          let index = forwarApi.findIndex((item2) => {
            return item2.classKey === item.classKey
          })
          if (index !== -1) {
            forwarApi.splice(index, 1, {
              picture: item?.HostedHeadshotNoBackgroundUrl || forwarApi[index].picture,
              name: item?.Name || '',
              classKey: forwarApi[index].classKey,
            })
          }
        })
        setForwardData([...forwarApi])
      } else {
        setForwardData([...forwarApi])
      }
      if (defenderApi?.length > 0) {
        defenderApi.map((item) => {
          let index = defenderApi.findIndex((item2) => {
            return item2.classKey === item.classKey
          })
          if (index !== -1) {
            defenderApi.splice(index, 1, {
              picture: item?.HostedHeadshotNoBackgroundUrl || defenderApi[index].picture,
              name: item?.Name || '',
              classKey: defenderApi[index].classKey,
            })
          }
        })
        setDefenderData([...defenderApi])
      } else {
        setDefenderData([...defenderApi])
      }
      setBenchData(benchApi)
      setLoading(false)
    }, 5000)
  }, [])

  const TimelineCard = ({ forward, defender, data }) => {
    const { name, picture } = data
    return (
      <div className='timeline_card'>
        <div className='text_box' style={{ borderRadius: '10px 10px 0px 0px' }}>
          {forward && <h4>Forward</h4>}
          {defender && <h4>Defender</h4>}
        </div>
        <div className='image_box'>
          {picture ? (
            <img src={picture} alt='Picture' />
          ) : (
            <div className='hockey_icon_box'>
              <GiHockey size={50} />
            </div>
          )}
        </div>
        <div className='text_box' style={{ borderRadius: '0px 0px 10px 10px' }}>
          <p>{name}</p>
        </div>
      </div>
    )
  }

  const Line = ({ number, text }) => {
    return (
      <div className='timeline_card_line'>
        <p>{number}</p>
        <p>{text}</p>
      </div>
    )
  }

  return (
    <div className='time_line_container'>
      {/* BREADCRUMB */}
      <section className='breadcrumb'>
        <Breadcrumb
          className='customize_breadcrumb'
          separator={'|'}
          items={[
            {
              title: <p>Team</p>,
            },
            {
              title: <p>Team Line</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      {/* BUTTON AND PAGINATION */}
      <ButtonsAndPagination noWeek={true} />

      <section className='body_wrapper'>
        <div className='body_content'>
          {loading ? (
            <Loader />
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '24px' }}>
                <div className='body_content_left'>
                  <div className='card_01'>
                    <p>Total</p>
                    <p>Week Proj</p>
                    <h2>88.24</h2>
                  </div>
                </div>
                <div className='body_content_center'>
                  <div className='timeline_row'>
                    {forwardData?.slice(0, 3)?.map((v) => {
                      return <TimelineCard key={v?.classKey} forward data={v} />
                    })}
                    <Line number={'1st'} text={'Line'} />
                  </div>
                  <div className='timeline_row'>
                    {forwardData?.slice(3, 6)?.map((v) => {
                      return <TimelineCard key={v?.classKey} forward data={v} />
                    })}
                    <Line number={'2nd'} text={'Line'} />
                  </div>
                  <div className='timeline_row'>
                    {forwardData?.slice(6, 9)?.map((v) => {
                      return <TimelineCard key={v?.classKey} forward data={v} />
                    })}
                    <Line number={'3rd'} text={'Line'} />
                  </div>
                  <div className='timeline_row'>
                    {forwardData?.slice(9, 12)?.map((v) => {
                      console.log(v)
                      return <TimelineCard key={v?.classKey} forward data={v} />
                    })}
                    <Line number={'4th'} text={'Line'} />
                  </div>
                </div>
                <div className='body_content_right'>
                  <div className='timeline_row'>
                    <Line number={'1st'} text={'Pairing'} />
                    {defenderData?.slice(0, 2)?.map((v) => {
                      return <TimelineCard key={v?.classKey} defender data={v} />
                    })}
                  </div>
                  <div className='timeline_row'>
                    <Line number={'2st'} text={'Pairing'} />
                    {defenderData?.slice(2, 4)?.map((v) => {
                      return <TimelineCard key={v?.classKey} defender data={v} />
                    })}
                  </div>
                  <div className='timeline_row'>
                    <Line number={'3rd'} text={'Pairing'} />
                    {defenderData?.slice(4, 6)?.map((v) => {
                      return <TimelineCard key={v?.classKey} defender data={v} />
                    })}
                  </div>
                  <div className='timeline_row'>
                    <Line number={''} text={''} />
                    {defenderData?.slice(6, 7)?.map((v) => {
                      return <TimelineCard key={v?.classKey} defender data={v} />
                    })}
                  </div>
                </div>
              </div>
              <div className='bench_player_container'>
                <div className='bench_player_box'>
                  <header>
                    <h3>Team Bench</h3>
                    <p>
                      View All <BiRightArrowAlt size={18} />
                    </p>
                  </header>
                  <section className='bench_player_body'>
                    {benchData?.map((v, i) => {
                      return (
                        <div key={i} className='bench_player_card'>
                          <div className='left'>
                            {v?.HostedHeadshotNoBackgroundUrl ? (
                              <img src={v?.HostedHeadshotNoBackgroundUrl} />
                            ) : (
                              <GiHockey size={50} color={'#fff'} />
                            )}
                          </div>
                          <div className='center'>
                            <div>
                              <p className='text1'>Team</p>
                              <p className='text2'>{v?.Team || '-'}</p>
                            </div>
                            <div>
                              <p className='text1'>Pos</p>
                              <p className='text2'>{v?.Position || '-'}</p>
                            </div>
                            <div>
                              <p className='text1'>Player</p>
                              <p className='text2'>{v?.Name || '-'}</p>
                            </div>
                            <div>
                              <p className='text1'>Status</p>
                              <p className='text2'>{v?.InjuryStatus || '-'}</p>
                            </div>
                            <div>
                              <p className='text1'></p>
                              <p className='last_text'>
                                Opponent & <br /> Gametime
                              </p>
                            </div>
                          </div>
                          <div className='right'>
                            <p>Week</p>
                            <p>Projections</p>
                            <h4>{v?.Projection || '-'}</h4>
                          </div>
                        </div>
                      )
                    })}
                  </section>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default TeamLine
