import { Divider } from 'antd'
import NFL from '../../assets/nfl.png'

const LeagueSection = () => {
  return (
    <div className='leagues'>
      <p>
        Choose your fantasy sports and experience the <br />
        same decision making processes of real life GM
      </p>
      <Divider style={{ borderColor: 'white', borderWidth: '2px' }} />
      <div className='logos'>
        {Array(7)
          .fill({ image: NFL, alt: 'nfl' })
          .map((v, i) => {
            return <img key={i} src={v?.image} alt={v?.alt} />
          })}
      </div>
    </div>
  )
}

export default LeagueSection
