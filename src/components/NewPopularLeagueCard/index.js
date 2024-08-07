import moment from 'moment'
import { IoStar } from 'react-icons/io5'
import JoinLeague from '../modal/JoinLeague'
import { useNavigate } from 'react-router-dom'
import Logo from '../../assets/sam-football.png'

const NewPopularLeagueCard = ({ data, yourLeague, active, fromHome }) => {
  const navigate = useNavigate()
  const { name, draftStart, leagueType, leagueLevel, entryFee, leagueLogo, totalPlayers } = data
  return (
    <div className='p_league_card_wrapper'>
      <div
        className={`p_league_card ${
          // active ? 'active' : leagueType === 'professional' ? 'pro_league_border' : ''
          active
          ? 'active'
          : leagueType === 'professional'
          ? 'pro_league_border'
          : leagueType === 'Ultimate'
          ? 'ultimate_league_border'
          : ''
        }`}
      >
        <div className='top'>
          {/* <div className='row_1'>
            <div>
              <p className='text_title'>League Name:</p>
              <p className='text_value'>{name}</p>
            </div>
            <div className='image_box' style={{ backgroundImage: `url(${leagueLogo})` }} />
          </div> */}
          <div className='row_1'>
          {/* <div className='image_box' style={{ backgroundImage: `url(${leagueLogo} || Logo)` }} /> */}
          <div  className='image_box' style={{ backgroundImage: `url(${leagueLogo ? leagueLogo : Logo})` }} />

            <div>
              <p className='text_title'>League Name:</p>
              <p className='text_value'>{name}</p>

              <p style={{marginTop:'30px'}} className='text_title'>Users:</p>
              <p  className='color_text_value'>{data?.teams?.length || totalPlayers || 0}  /32</p>
            </div>
            
          </div>
          {/* <div className='row_2'>
            <div>
              <p className='text_title'>Draft Starts:</p>
              <p className='text_value'>{moment(draftStart).format('DD/MM/YY')}</p>
            </div>
            <div>
              <p className='text_title'>Players:</p>
              <p className='text_value'>{data?.teams?.length || totalPlayers}</p>
            </div>
          </div> */}
          <div className='row_2'>
            <div>
              <p className='text_title'>Draft Starts:</p>
              <p className='text_value'>{moment.tz(draftStart , moment.tz.guess()).tz("CST6CDT").format('MM/DD/YY')}</p>
              <p style={{marginTop:'5px'}} className='text_value'>{moment.tz(draftStart , moment.tz.guess()).tz("CST6CDT").format('h A')}   CST</p>

            </div>
            <div>
     
              <p style={{marginTop:'5px'}}  className='text_title'>League Type:</p>
            <p className='color_text_value'>{leagueType}</p>
            </div>
          </div>
          {/* <div className='row_3'>
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
            <p className='text_value'>{data?.prizePool || '-'}</p>
          </div> */}
        </div>
        <>
          {yourLeague ? (
            <div className='button_row'>
              <p>Joined</p>
            </div>
          ) : fromHome ? (
            <div
              className='button_row'
              onClick={() => {
                navigate('/select-game')
              }}
              style={{ cursor: 'pointer' }}
            >
              <p className='join-now'>Join Now</p>
            </div>
          ) : (
            <JoinLeague data={data} />
          )}
        </>
      </div>
    </div>
  )
}

export default NewPopularLeagueCard
