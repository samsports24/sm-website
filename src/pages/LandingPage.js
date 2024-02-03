import NFL from '../assets/nfl.png'
import Logo from '../assets/Logo.svg'
import Title from '../assets/landing/title.png'
import Hero from '../assets/landing/hero2.mp4'
import Circle from '../assets/circle.svg'
import { Button, Divider, Typography, Row, Col } from 'antd'

const LandingPage = () => {
  const ImporveSection = () => {
    return (
      <div className='desc-card'>
        <Typography.Title level={1}>DRAFT</Typography.Title>
        <p>
          Share your product or service offerings here. Give your prospective clients an overview of
          why they should use it. Differentiate it from the others listed on this page.
        </p>
      </div>
    )
  }

  return (
    <div className='main-landing'>
      <div className='navbar'>
        <div className='left'>
          <img src={Logo} alt='logo' className='logo' />
          <img src={Title} alt='samsports' className='title' />
          <div>
            <span>Football</span>
            <span>Baseball</span>
            <span>Hockey</span>
            <span>US Football</span>
            <span>College Football</span>
            <span>Scouting</span>
          </div>
        </div>
        <div className='right'>
          <Button shape='round' type='primary'>
            Signup
          </Button>
          <Button shape='round' type='primary'>
            Login
          </Button>
        </div>
      </div>
      <div className='hero-section'>
        <video src={Hero} width='100%' height='100%' muted autoPlay loop controls={false} />

        <div className='text'>
          <Typography.Title level={2}>
            PREPARE TO
            <br />
            CHANGE THE WAY
          </Typography.Title>
          <Typography.Title level={1}>YOU PLAY THE GAME</Typography.Title>
        </div>
      </div>
      <div className='team-section'>
        <div className='content'>
          <img src={Circle} alt='circle' className='circle' />
          <Typography.Title level={1}>MANAGE YOUR YOUR TEAMS LIKE A PRO OWNER</Typography.Title>
          <p>{`SAM Sports, is a groundbreaking sports fantasy platform that redefines the fantasy sports experience by merging the realism of professional sports with the excitement of traditional fantasy leagues. This innovative platform mirrors real-life sports in terms of the number of players, salary caps, auctions, trades, and drafts, making it a true fantasy sports fan's dream.`}</p>
        </div>
      </div>
      <div className='leagues'>
        <p>
          Choose your fantasy sports and experience the <br />
          same decision making processes of real life GM
        </p>
        <Divider style={{ borderColor: 'white', borderWidth: '2px' }} />
        <div className='logos'>
          <img src={NFL} alt='nfl' />
          <img src={NFL} alt='nfl' />
          <img src={NFL} alt='nfl' />
          <img src={NFL} alt='nfl' />
          <img src={NFL} alt='nfl' />
          <img src={NFL} alt='nfl' />
          <img src={NFL} alt='nfl' />
        </div>
      </div>
      <div className='improve-team'>
        <Row gutter={[20,20]}>
          <Col xs={24} lg={12}>
            <div className='left'>
              <Typography.Title level={1}>
                IMPROVE
                <br />
                YOUR TEAM
              </Typography.Title>
              <Typography.Title
                level={1}
              >{`"Make your TEAM the dominant force of your Fantasy league"`}</Typography.Title>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className='right'>
              <ImporveSection />
              <ImporveSection />
              <ImporveSection />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default LandingPage
