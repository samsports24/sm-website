import { Typography } from 'antd'
import Circle from '../../assets/circle.svg'

const TeamSection = () => {
  return (
    <div className='team-section paddingInline'>
      <div className='content'>
        <img src={Circle} alt='circle' className='circle' />
        <Typography.Title level={1}>MANAGE YOUR TEAMS LIKE A PRO OWNER</Typography.Title>
        <p>{`SAM Sports, is a groundbreaking sports fantasy platform that redefines the fantasy sports experience by merging the realism of professional sports with the excitement of traditional fantasy leagues. This innovative platform mirrors real-life sports in terms of the number of players, salary caps, auctions, trades, and drafts, making it a true fantasy sports fan's dream.`}</p>
      </div>
    </div>
  )
}

export default TeamSection
