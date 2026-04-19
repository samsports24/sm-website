import { useNavigate } from 'react-router-dom'

const PlayerCard = ({ data }) => {
  const { image, playerName, owner, position, age, date } = data
  const navigate = useNavigate()

  return (
    <div className='player-card' onClick={() => navigate('/player-details')}>
      <div className='player-image'>
        <img src={image} />
      </div>
      <div className='player-name'>
        <h2>{playerName}</h2>
        <div className='player-details'>
          <p>
            Owner:<span className='bold'> {owner}</span>
          </p>
          <p>
            Position:<span className='bold'> {position}</span>
          </p>
          <p>
            Age: <span className='bold'> {age}</span>
          </p>
          <p>
            Date Registered: <span className='bold'> {date} </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default PlayerCard
