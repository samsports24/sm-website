import { Divider } from 'antd'
import NFL from '../../assets/nfl.png'
import CustomCarousel from '../../components/Carousel/CustomCarousel'

const LeagueSection = () => {
  const images = [
    {
      image: require('../../assets/landing/logos/scouts.png'),
      alt: 'Scouts',
    },
    {
      image: require('../../assets/landing/logos/college-football.png'),
      alt: 'College Football',
    },
    {
      image: require('../../assets/landing/logos/football.png'),
      alt: 'Football',
    },
    {
      image: require('../../assets/landing/logos/eleven-fc.png'),
      alt: 'Eleven F.C',
    },
    {
      image: require('../../assets/landing/logos/baseball.png'),
      alt: 'Baseball',
    },
    {
      image: require('../../assets/landing/logos/basketball.png'),
      alt: 'Basketball',
    },
    {
      image: require('../../assets/landing/logos/hockey.png'),
      alt: 'Hockey',
    },
  ]
  return (
    <div className='leagues paddingInline'>
      <p>
        Choose your fantasy sports and experience the <br />
        same decision making processes of real life GM
      </p>
      <Divider style={{ borderColor: 'white', borderWidth: '2px' }} />
      <CustomCarousel>
        {images.map((v, i) => {
          return <img className='logo_image' key={i} src={v?.image} alt={v?.alt} />
        })}
      </CustomCarousel>
    </div>
  )
}

export default LeagueSection
