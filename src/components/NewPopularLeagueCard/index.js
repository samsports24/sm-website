import moment from 'moment'
import { IoStar } from 'react-icons/io5'

const NewPopularLeagueCard = ({ data }) => {
  const {
    leagueName,
    draftStarts,
    totalPlayers,
    leagueType,
    leagueLevel,
    entryFee,
    prizePollWallet,
    imageUrl,
  } = data
  return (
    <div className='p_league_card_wrapper'>
      <div className='p_league_card'>
        <div className='top'>
          <div className='row_1'>
            <div>
              <p className='text_title'>League Name:</p>
              <p className='text_value'>{leagueName}</p>
            </div>
            <div className='image_box' style={{ backgroundImage: `url(${imageUrl})` }} />
          </div>
          <div className='row_2'>
            <div>
              <p className='text_title'>Draft Starts:</p>
              <p className='text_value'>{moment(draftStarts).format('DD/MM/YY')}</p>
            </div>
            <div>
              <p className='text_title'>Players:</p>
              <p className='text_value'>{totalPlayers}</p>
            </div>
          </div>
          <div className='row_3'>
            <p className='text_title'>League Type:</p>
            <p className='text_value'>{leagueType}</p>
          </div>
          <div className='row_4'>
            <p className='text_title'>League Level:</p>
            <div>
              {Array(leagueLevel)
                .fill()
                .slice(0, 5)
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
            <p className='text_value'>{prizePollWallet}</p>
          </div>
        </div>
        <div className='button_row'>
          <p>Join Now</p>
        </div>
      </div>
    </div>
  )
}

export default NewPopularLeagueCard
