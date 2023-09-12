import React from 'react'
import { Breadcrumb } from 'antd'
import { BiRightArrowAlt } from 'react-icons/bi'

import Header from '../components/Header'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'

const TeamLine = () => {
  // const [data]=useState([{
  //     Name: "Alex Tuch"
  // }])

  const TimelineCard = ({ forward, defender }) => {
    return (
      <div className='timeline_card'>
        <div className='text_box' style={{ borderRadius: '10px 10px 0px 0px' }}>
          {forward && <h4>Forward</h4>}
          {defender && <h4>Defender</h4>}
        </div>
        <div className='image_box'>
          <img src={require('../assets/hockey-1.png')} alt='Picture' />
        </div>
        <div className='text_box' style={{ borderRadius: '0px 0px 10px 10px' }}>
          <p>Alex Tuch</p>
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
                <TimelineCard forward />
                <TimelineCard forward />
                <TimelineCard forward />
                <Line number={'1st'} text={'Line'} />
              </div>
              <div className='timeline_row'>
                <TimelineCard forward />
                <TimelineCard forward />
                <TimelineCard forward />
                <Line number={'2nd'} text={'Line'} />
              </div>
              <div className='timeline_row'>
                <TimelineCard forward />
                <TimelineCard forward />
                <TimelineCard forward />
                <Line number={'3rd'} text={'Line'} />
              </div>
              <div className='timeline_row'>
                <TimelineCard forward />
                <TimelineCard forward />
                <TimelineCard forward />
                <Line number={'4th'} text={'Line'} />
              </div>
            </div>
            <div className='body_content_right'>
              <div className='timeline_row'>
                <Line number={'1st'} text={'Pairing'} />
                <TimelineCard defender />
                <TimelineCard defender />
              </div>
              <div className='timeline_row'>
                <Line number={'2st'} text={'Pairing'} />
                <TimelineCard defender />
                <TimelineCard defender />
              </div>
              <div className='timeline_row'>
                <Line number={'3rd'} text={'Pairing'} />
                <TimelineCard defender />
                <TimelineCard defender />
              </div>
              <div className='timeline_row'>
                <Line number={''} text={''} />
                <TimelineCard defender />
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
                {['', '', '', '']?.map((_, i) => {
                  return (
                    <div key={i} className='bench_player_card'>
                      <div className='left'>
                        <img src={require('../assets/hockey-1.png')} />
                      </div>
                      <div className='center'>
                        <div>
                          <p className='text1'>Team</p>
                          <p className='text2'>WSH</p>
                        </div>
                        <div>
                          <p className='text1'>Pos</p>
                          <p className='text2'>FWD</p>
                        </div>
                        <div>
                          <p className='text1'>Player</p>
                          <p className='text2'>Ryan Nugent-Hopkins</p>
                        </div>
                        <div>
                          <p className='text1'>Status</p>
                          <p className='text2'>INJ</p>
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
                        <h4>7.05</h4>
                      </div>
                    </div>
                  )
                })}
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TeamLine
