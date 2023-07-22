// Layout
import Layout from '../layout/Layout'

// Third
import { Button, Image } from 'antd'

// Image, Icon
import bellIcon from '../assets/bell-icon.svg'
import circaImage from '../assets/teams/circa_sports_trout.png'

const LeagueScore = () => {
  return (
    <Layout>
      <div className='league_container'>
        {/* HEADER */}
        <header>
          <div className='left'>
            <div className='image_div'>
              <Image preview={false} src={circaImage} />
            </div>
            <p>
              League Notification <img src={bellIcon} alt='Icon' />
            </p>
          </div>
          <div className='center'>
            <div className='title_box'>
              <h1>Circa Sports Trout</h1>
              <p>
                Live Player Auction <img src={bellIcon} alt='Icon' />
              </p>
            </div>
            <div className='button_box'>
              <Button>Overall Record</Button>
              <Button>Division Record</Button>
            </div>
            <div className='team_financials_box'>
              <p>Team Financials</p>
              <div>
                <p>Live Player Auction</p>
                <p>---</p>
              </div>
            </div>
          </div>
          <div className='right'>right</div>
        </header>
        <section className='score_card_container'></section>
      </div>
    </Layout>
  )
}

export default LeagueScore
