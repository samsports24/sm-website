// Layout
import Layout from '../layout/Layout'

// Third
import { Button, Col, Image, Row } from 'antd'

// Images
import header1 from '../assets/win_cup.png'
import header2 from '../assets/ufafl.png'
import header3 from '../assets/ball_bg.png'

// Components
import TeamCard from '../components/cards/TeamCard'

const Teams = () => {
  const cardData = [
    {
      text: 'Madden',
      direction: 'East',
      imageUrl: require('../assets/teams/defiance.png'),
      title: 'Defiance',
      link: 'Twitter: @DeFiance_UFAFL',
    },
    {
      text: 'Madden',
      direction: 'East',
      imageUrl: require('../assets/teams/rage.png'),
      title: 'Rage',
      link: 'Alex@sevenseasblockchainsports.com',
    },
    {
      text: 'Madden',
      direction: 'East',
      imageUrl: require('../assets/teams/storm_breakers.png'),
      title: 'Storm Breakers',
      link: 'Twitter: @StormBreakersFF',
    },
    {
      text: 'Madden',
      direction: 'East',
      imageUrl: require('../assets/teams/the_beast.png'),
      title: 'The Beast',
      link: 'Twitter: @TheBeastUFAFL',
    },
    {
      text: 'Madden',
      direction: 'North',
      imageUrl: require('../assets/teams/circa_sports_trout.png'),
      title: 'Circa Sports Trout',
      link: 'Based in Las Vegas NV Twitter: @CircaTrout',
    },
    {
      text: 'Madden',
      direction: 'North',
      imageUrl: require('../assets/teams/outcasts.png'),
      title: 'Outcasts',
      link: 'Bufafloutcasts@gmail.com',
    },
    {
      text: 'Madden',
      direction: 'North',
      imageUrl: require('../assets/teams/rowdys.png'),
      title: 'Rowdys',
      link: 'Twitter: @rowdysfootball',
    },
    {
      text: 'Madden',
      direction: 'North',
      imageUrl: require('../assets/teams/the_flying_foxes.png'),
      title: 'The Flying Foxes',
      link: '',
    },
    {
      text: 'Madden',
      direction: 'East',
      imageUrl: require('../assets/teams/canwest_gladiators.png'),
      title: 'CanWest Gladiators',
      link: 'chad@canwestfantasysports.comTwitter: @GladiatorsUFAFL',
    },
    {
      text: 'Madden',
      direction: 'East',
      imageUrl: require('../assets/teams/kingsmen.png'),
      title: 'Kingsmen',
      link: '',
    },
    {
      text: 'Madden',
      direction: 'East',
      imageUrl: require('../assets/teams/legion.png'),
      title: 'Legion',
      link: 'legion.ufafl@gmail.comTwitter: @LEGIONUFAFL',
    },
    {
      text: 'Madden',
      direction: 'East',
      imageUrl: require('../assets/teams/the_resistance.png'),
      title: 'The Resistance',
      link: 'TheResistanceGM@yahoo.com',
    },
    {
      text: 'Madden',
      direction: 'East',
      imageUrl: require('../assets/teams/empire.png'),
      title: 'Empire',
      link: 'Twitter: @THEEMPIREFANTA1',
    },
    {
      text: 'Madden',
      direction: 'East',
      imageUrl: require('../assets/teams/kraken.png'),
      title: 'Kraken',
      link: 'Twitter: @KrakenUFAFL',
    },
    {
      text: 'Madden',
      direction: 'East',
      imageUrl: require('../assets/teams/seven_angles.png'),
      title: 'Seven7 Angels',
      link: 'djones@hedgeye.COM',
    },
    {
      text: 'Madden',
      direction: 'East',
      imageUrl: require('../assets/teams/silverbacks.png'),
      title: 'Silverbacks',
      link: 'silverbacks.ufafl@gmail.com',
    },
    {
      text: 'Madden',
      direction: 'East',
      imageUrl: require('../assets/teams/doom.png'),
      title: 'Doom',
      link: 'Twitter: @DoomUFAFL',
    },
    {
      text: 'Madden',
      direction: 'East',
      imageUrl: require('../assets/teams/gridiron_seals.png'),
      title: 'Gridiron Seals',
      link: 'Based in Regina, SK, CanadaTwitter: @GridIronSeals',
    },
    {
      text: 'Madden',
      direction: 'East',
      imageUrl: require('../assets/teams/tiger_sharks.png'),
      title: 'Tiger Sharks',
      link: '',
    },
    {
      text: 'Madden',
      direction: 'East',
      imageUrl: require('../assets/teams/monsters.png'),
      title: 'Monsters',
      link: 'Twitter: @turfmonsters21',
    },
  ]

  return (
    <Layout>
      <div className='teams_container'>
        {/* HEADER */}
        <header>
          <Image
            className='header_corner_image1'
            preview={false}
            src={header1}
            alt='Header Image'
          />
          <div className='center'>
            <Image preview={false} src={header2} alt='Header Image' />
            <h1>Ultimate Fantasy American Football League</h1>
          </div>
          <Image
            className='header_corner_image2'
            preview={false}
            src={header3}
            alt='Header Image'
          />
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
            {cardData?.map((values, index) => {
              return (
                <Col key={index} xs={24} md={12} lg={8} xl={8} xxl={6}>
                  <TeamCard data={values} />
                </Col>
              )
            })}
          </Row>
        </section>
      </div>
    </Layout>
  )
}

export default Teams
