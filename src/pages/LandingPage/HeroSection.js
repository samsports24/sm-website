import { Typography } from 'antd'
import Hero from '../../assets/landing/hero2.mp4'

const HeroSection = () => {
  return (
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
  )
}

export default HeroSection
