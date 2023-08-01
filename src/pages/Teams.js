// Third
import { Button, Col, Image, Row } from 'antd'

// Images
import header1 from '../assets/win_cup.png'
import header2 from '../assets/ufafl.png'
import header3 from '../assets/ball_bg.png'

// Components
import TeamCard from '../components/cards/TeamCard'

// Mock Data
import { teamCardData } from './mockData'

const Teams = () => {
  return (
    <div className='teams_container'>
      {/* HEADER */}
      <header>
        <Image className='header_corner_image1' preview={false} src={header1} alt='Header Image' />
        <div className='center'>
          <Image preview={false} src={header2} alt='Header Image' />
          <h1>Ultimate Fantasy American Football League</h1>
        </div>
        <Image className='header_corner_image2' preview={false} src={header3} alt='Header Image' />
      </header>

      {/* BUTTON SECTION */}
      <section className='button_section'>
        <div className='button_group'>
          <Button type='primary'>Standing</Button>
          <Button type='primary'>Stats</Button>
          <Button type='primary'>Rulebook</Button>
        </div>
        <h2>
          2022 Prize Pool <span>|</span> 1,028,948 SCO
        </h2>
      </section>

      {/* CARD SECTION */}
      <section className='team_card_container'>
        <Row gutter={[30, 30]}>
          {teamCardData?.map((values, index) => {
            return (
              <Col key={index} xs={24} md={12} lg={8} xl={8} xxl={6}>
                <TeamCard data={values} />
              </Col>
            )
          })}
        </Row>
      </section>
    </div>
  )
}

export default Teams
