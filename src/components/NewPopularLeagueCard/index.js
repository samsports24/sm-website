import moment from 'moment'
import { IoStar } from 'react-icons/io5'
import JoinLeague from '../modal/JoinLeague'
import { useNavigate } from 'react-router-dom'

const NewPopularLeagueCard = ({ data,yourLeague,active,fromHome }) => {
  const navigate = useNavigate()
  const {
    name,
    draftStart,
    leagueType,
    leagueLevel,
    entryFee,
    leagueLogo,
    totalPlayers
  } = data
  return (
    <div className='p_league_card_wrapper'>
      <div className={active ? 'p_league_card active' : 'p_league_card'}>
        <div className='top'>
          <div className='row_1'>
            <div>
              <p className='text_title'>League Name:</p>
              <p className='text_value'>{name}</p>
            </div>
            <div className='image_box' style={{ backgroundImage: `url(${leagueLogo})` }} />
          </div>
          <div className='row_2'>
            <div>
              <p className='text_title'>Draft Starts:</p>
              <p className='text_value'>{moment(draftStart).format('DD/MM/YY')}</p>
            </div>
            <div>
              <p className='text_title'>Players:</p>
              <p className='text_value'>{data?.teams?.length || totalPlayers}</p>
            </div>
          </div>
          <div className='row_3'>
            <p className='text_title'>League Type:</p>
            <p className='text_value'>{leagueType}</p>
          </div>
          <div className='row_4'>
            <p className='text_title'>League Level:</p>
            <div>
              {Array(Number(leagueLevel))
                .fill()
                // .slice(0, 5)
                .map((_, i) => {
                  return <IoStar key={i} color={'#fff'} size={18} />
                })}
            </div>
          </div>
          <div className='row_5'>
            <p className='text_title'>Entry Fee:</p>
            <p className='text_value'>{entryFee}</p>
          </div>
          <div className='row_5'>
            <p className='text_title'>Prize pool wallet:</p>
            <p className='text_value'>{data?.prizePool || "-"}</p>
          </div>
        </div>
        <div className='button_row'>
          {yourLeague ? <p>Joined</p> : fromHome ? <p className="join-now"
          
          onClick={() => {
            navigate("/select-game")
          }}>Join Now</p> : <p className="join-now"><JoinLeague data={data} /></p>}
        </div>
      </div>
    </div>
  )
}

export default NewPopularLeagueCard
