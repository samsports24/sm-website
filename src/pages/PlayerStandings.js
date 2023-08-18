import { Button, Breadcrumb } from 'antd'

import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'

import { PlayerStandingData } from './mockData'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'

const PlayerStandings = () => {
  return (
    <div className='practice_squad_container team_trade_main'>
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

      <section className='squad_card_container transparent'>
        <div className='header'>
          <h2>PLAYER STANDING</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Button type='primary'>QB</Button>
            <Button type='primary'>RB</Button>
            <Button type='primary'>WR</Button>
            <Button type='primary'>TE</Button>
            <Button type='primary'>OL</Button>
            <Button type='primary'>PK</Button>
            <Button type='primary'>DT</Button>
            <Button type='primary'>DE</Button>
            <Button type='primary'>LB</Button>
            <Button type='primary'>CB</Button>
            <Button type='primary'>S</Button>
            <Button type='primary'>PN</Button>
          </div>
        </div>
        <div className='standing-table-bg'>
          {PlayerStandingData?.map((v, i) => {
            return (
              <div key={i} className='squad_card_box'>
                <div className='squad_header'>
                  <h2>{v.title.left}</h2>
                  <h3>{v.title.right}</h3>
                </div>

                <div
                  className='squad_header'
                  style={{ margin: '20px 0', justifyContent: 'space-around' }}
                >
                  {v.breakers.map((item) => (
                    <h2 key={item}>{item}</h2>
                  ))}
                </div>

                <div className='squad_content_body'>
                  <div className='squad_image_box'>
                    <img src={require('../assets/player-img-6.png')} />
                  </div>
                  <div>
                    <p className='squad_text1'>PTS</p>
                    <p className='squad_text2'>{v?.points}</p>
                  </div>
                  <div>
                    <p className='squad_text1'>ATT</p>
                    <p className='squad_text2'>{v?.att}</p>
                  </div>
                  <div>
                    <p className='squad_text1'>YD</p>
                    <p className='squad_text2'>{v?.yd}</p>
                  </div>
                  <div>
                    <p className='squad_text1'>TD</p>
                    <p className='squad_text2'>{v?.td}</p>
                  </div>
                  <div>
                    <p className='squad_text1'>REC</p>
                    <p className='squad_text2'>{v?.rec}</p>
                  </div>
                  <div>
                    <p className='squad_text1'>TAR</p>
                    <p className='squad_text2'>{v?.tar}</p>
                  </div>

                  <div>
                    <p className='squad_text1'>YD</p>
                    <p className='squad_text2'>{v?.yd2}</p>
                  </div>
                  <div>
                    <p className='squad_text1'>TD</p>
                    <p className='squad_text2'>{v?.td2}</p>
                  </div>
                  <div>
                    <p className='squad_text1'>CMP</p>
                    <p className='squad_text2'>{v?.cmp}</p>
                  </div>
                  <div>
                    <p className='squad_text1'>ATT</p>
                    <p className='squad_text2'>{v?.att2}</p>
                  </div>
                  <div>
                    <p className='squad_text1'>YD</p>
                    <p className='squad_text2'>{v?.yd3}</p>
                  </div>
                  <div>
                    <p className='squad_text1'>TD</p>
                    <p className='squad_text2'>{v?.td3}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default PlayerStandings
