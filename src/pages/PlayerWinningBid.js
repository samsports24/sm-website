import { Button, Breadcrumb, Row, Col, Typography } from 'antd'

import Arrow from '../assets/arrow-right.svg'
import Image from '../assets/logo2.png'

import { useLocation } from 'react-router-dom'
import moment from 'moment'

// Component
import Header from '../components/Header'
import GmCard from '../components/playerInterface/GmCard'
import PlayerStats from '../components/playerInterface/PlayerStats'
import ContractInfo from '../components/playerInterface/ContractInfo'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import PlayerInfoBottom from '../components/PlayerInfoBottom'

const PlayerWinningBid = () => {
  const { state } = useLocation()

  return (
    <div className='player_interface_container'>
      {/* BACK BUTTON */}
      <Button className='back_button' type='primary'>
        Back
      </Button>

      {/* BREADCRUMB */}
      <section className='breadcrumb'>
        <Breadcrumb
          className='customize_breadcrumb'
          separator={<img src={Arrow} />}
          items={[
            {
              title: <p>Home</p>,
            },
            {
              title: <p>Team</p>,
            },
            {
              title: <p>Roster</p>,
            },
            {
              title: <p>Player Interface</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      <ButtonsAndPagination />

      <hr className='divider' />

      <GmCard playerData={state?.player_id} bidWinningPage={true} />

      <PlayerInfoBottom
        player={state?.player_id}
        contract={state?.player_id?.PlayerCap?.toLocaleString() || '-'}
      />

      <section className='bid_section' style={{ marginTop: '30px' }}>
        <Row gutter={[30, 30]} align={'middle'}>
          <Col xs={24}>
            <div className='bid_card'>
              <img src={Image} />
              <Typography.Title level={2}>
                Winning Bid {`$${state?.highestCurrentBid?.toLocaleString()}`}
              </Typography.Title>
            </div>
          </Col>
        </Row>
      </section>

      <section className='player_info_container'>
        <PlayerStats />
        <ContractInfo />
      </section>

      <section className='bid_history_container'>
        <div className='header'>
          <h2>BID HISTORY</h2>
        </div>
        <div className='bid_history_body'>
          {state?.bidHistory
            ?.slice()
            ?.sort((a, b) => b.bid - a.bid)
            ?.map((v, i) => {
              return (
                <div key={i} className='squad_card_box'>
                  <div>
                    <p className='squad_text2'>date</p>
                    <p className='squad_text1'>
                      {moment(v?.date_time).format('YYYY-MM-DD') || '-'}
                    </p>
                  </div>
                  <div>
                    <p className='squad_text2'>user name</p>
                    <p className='squad_text1'>{v?.user?.userName || '-'}</p>
                  </div>
                  <div>
                    <p className='squad_text2'>team</p>
                    <p className='squad_text1'>{v?.user?.team?.name || '-'}</p>
                  </div>
                  <div style={{ minWidth: '100px' }}>
                    <p className='squad_text2'>bid</p>
                    <p className='squad_text1'>{`$${v?.bid?.toLocaleString()}` || '-'}</p>
                  </div>
                </div>
              )
            })}
        </div>
      </section>
    </div>
  )
}

export default PlayerWinningBid
