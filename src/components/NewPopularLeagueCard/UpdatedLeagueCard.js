import moment from 'moment'
import { IoStar } from 'react-icons/io5'
import JoinLeague from '../modal/JoinLeague'
import { useNavigate } from 'react-router-dom'
import Logo from '../../assets/sam-football.png'
import { deleteLeagueCommissioner, joinLeague, resetLeagueCommissioner, selectLeague } from '../../redux'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import Loader from '../Loader'
import EditLeague from '../modal/EditLeague'
import DeleteLeague from '../modal/DeleteLeague'
import ResetLeague from '../modal/ResetLeague'
const UpdatedLeagueCard = ({ data, yourLeague, active, fromHome, totalTeams, isFutureLeague = false }) => {
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const navigate = useNavigate()
  // console.log('yourLeague',yourLeague);
  const user = useSelector((state) => state.user.userDetails)
  const userId = localStorage.getItem('userId');

  console.log("data inside update league card :", data)

  const { name, draftStart, leagueType, leagueLevel, entryFee, leagueLogo, totalPlayers,leagueId } = data
//   console.log('draftStart',draftStart);
// console.log('leagueType',leagueType);
// console.log('name',name);
// console.log('data',data);

// console.log('user',user);
console.log('yourLeague',yourLeague);
console.log('home',fromHome);

const leaguejoin =async()=>{
  setLoading(true)

  try {
    const payload = {
      email:user?.email,
      leagueId: leagueId,
      leagueType: leagueType,
      teamName: `team ${user?.userName}`,
      userId,
  
    }  

    console.log('payload',payload);
    localStorage.setItem('selectedGame', 'football');

   const data = await joinLeague(payload)
   console.log('League Join successfully:', data)
   setLoading(false)
    navigate('/professional-league')
    // cancel()
  } catch (error) {
    console.error('Error in Joining League:', error)
  }
}

const deleteHandler = async () => {
  setDeleteLoading(true)
  await deleteLeagueCommissioner({_id: data?._id})
  setDeleteLoading(false)
}

const resetHandler = async () => {
  setDeleteLoading(true)
  await resetLeagueCommissioner({_id: data?._id})
  setDeleteLoading(false)
}


  return (
    <div className='u_league_card_wrapper'>
          {loading ? (
      <Loader />
    ) : (
      <div
        className={`u_league_card ${
          // active ? 'active' : leagueType === 'professional' ? 'pro_league_border' : ''
          active
      ? 'active'
      : leagueType === 'professional'
      ? 'pro_league_border'
      : leagueType === 'Ultimate'
      ? 'ultimate_league_border'
      : ''
        }`}
        style={{position: "relative"}}
      >
        {user?.isCommissioner && <EditLeague data={data} isCommissioner={user?.isCommissioner} />}
        <div className='top' style={{opacity : isFutureLeague ? 0.6 : 1}} >
          <div className='row_1'>
          {/* <div className='image_box' style={{ backgroundImage: `url(${leagueLogo} || Logo)` }} /> */}
          <div className='image_box' style={{ backgroundImage: `url(${leagueLogo ? leagueLogo : Logo})` }} />

            <div>
              <p className='text_title'>League Name:</p>
              <p className='text_value'>{name}</p>

              <p style={{marginTop:'30px'}} className='text_title'>Users:</p>
              <p  className='color_text_value'>{data?.teams?.length || totalPlayers || 0}  /{totalTeams ? totalTeams : 32}</p>
            </div>
            
          </div>
          <div className='row_2'>
            <div>
              <p className='text_title'>Draft Starts:</p>
              <p className='text_value'>{moment(draftStart).format('MM/DD/YY')}</p>
              <p style={{marginTop:'5px'}} className='text_value'>{moment(draftStart).format('h A')}   CST</p>

            </div>
            <div>
     
              <p style={{marginTop:'5px'}}  className='text_title'>League Type:</p>
            <p className='color_text_value'>{leagueType}</p>
            </div>
          </div>
           {/* <div className='row_3'>
            <p className='text_title'>League Type:</p>
            <p className='text_value'>{leagueType}</p>
          </div> */}
         {/* <div className='row_4'>
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

        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' ,margin: '0 20px 35px 0'}}>
          {
            (user?.isCommissioner && data?.mainCommissioner === user?._id) && 
              <ResetLeague deleteHandler={resetHandler}  deleteLoading={deleteLoading} />
          }
          {
            (user?.isCommissioner && data?.teams?.length === 0 && data?.users?.length === 0) && 
              <DeleteLeague deleteHandler={deleteHandler}  deleteLoading={deleteLoading} />
          }
          {yourLeague ? (
            <>
            {/* <div 
              className='button_row button_row_updated' 
              onClick={async () => {
                if (!active) {
                  await selectLeague({ leagueId: data?._id }, navigate)
                } 
              }}
              style={{opacity: active ? 0.6 : 1, cursor: active ? 'initial' : 'pointer'}}
            >
              <p>Select</p>
            </div> */}
            <div className='button_row button_row_updated' 
              onClick={async () => {
                  if (!active) {
                    await selectLeague({ leagueId: data?._id }, navigate)
                  } 
                }}
              >
              <p>Joined</p>
            </div>
            </>
          ) : fromHome ? (
            <div
              className='button_row button_row_updated'
              // onClick={() => {
              //   navigate('/select-game')
              // }}
              style={{ cursor: 'pointer' }}
            >
              <p 
                className='join-now'
                onClick={() => {
                  leaguejoin()
                }}
               >
                JOIN
              </p>
            </div>
          ) : (
            <JoinLeague data={data} />
          )}
        </div>
      </div>
    )}
    </div>
  )
}

export default UpdatedLeagueCard
