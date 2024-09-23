import { Button, Modal, notification } from 'antd'
import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import { PlayerPoached } from '../../../redux/actions/rosterAction';
import Loader from '../../Loader';

const PoachPlayer = ({data,state}) => {
  // console.log('data',data);
  const user = useSelector((state) => state.user.userDetails)
  const SETTING = useSelector((state) => state?.user?.setting)
  // console.log('user',user);

  const sampoints = useSelector((state) => state.user?.SamPoints?.SamPoints)
  console.log('state',state);
  
  
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const myleagueSalaryCap = useSelector((state) => state.user?.leagueSalaryCap?.leagueSalaryCap)
  const teamSalaryCap=useSelector((state)=>state.user?.teamSalaryCap)
  const showModal = () => setOpen(true)
  const closeModal = () => setOpen(false)


let total = myleagueSalaryCap - teamSalaryCap
// console.log('total',total);


  const poachplayer=async()=>{
     if(data?.player?.currentYearSalaryCap > total &&  sampoints < data?.player?.currentYearSalaryCap ){
      console.log('insuffiecent salary cap')
      notification.error({
        message: `Team Cap left must be greater than than player's salary cap or You have insufficient sampoints `,
        duration: 4,
      });
      closeModal()
      return
     }
     else {

      setLoading(true)
      try {
        const payload = {
          league: user?.team?.currentLeague._id,
          PlayerID: data?.player?.PlayerID,
          player_id: data?.player?._id,
          team: state.teamId,
          season:SETTING?.season,
          week:SETTING?.week,
          playercurrentsalaryprice:data?.player?.currentYearSalaryCap,
          // poachBy:{teamName:user?.team?.name,teamid:user?.team?._id,user:user?._id}
          poachBy: {
            teamName: user?.team?.name,
            teamid: user?.team?._id,
            user: user?._id,
          },

        }

        console.log('payload',payload);
        
  
        const mydata = await PlayerPoached(payload)
  
        console.log('player poached successfully:', mydata)
      
  
        setLoading(false)
        closeModal()
      } catch (error) {
        console.error('Error poaching player:', error)
      }
    }
      
  }

  // console.log('myleagueSalaryCap',myleagueSalaryCap);
  // console.log('teamSalaryCap',teamSalaryCap);
  

  return (
    <>
  {loading ? (
          <Loader />
        ) : (

      <Button type='primary' className='action-bar-btn' onClick={showModal}>
        Poach Player
      </Button>
       )}
      <Modal
        centered
        open={open}
        onCancel={closeModal}
        footer={null}
        closeIcon={false}
        className='player_interface_modals'
        closable={false}
      >
        <div className='close_modal_button' onClick={closeModal}>
          x
        </div>
        <div className='modal_body'>
          <h1 className='modal_header_heading main_heading'>Poach Player</h1>

          <div className='center_content poach_player'>
            <h1 className='modal_header_heading'>ARE YOU SURE?</h1>
            <p>IF YOU ARE SURE THAT YOU WISH TO START POACHING PROCESS CLICK CONFIRM.</p>
            <p style={{ marginTop: '-15px' }}>
              INFO: This action will give the team owner of this player 24 hours to protect the
              player or to active the player to their 53-man rosters.
            </p>
          </div>

          <div className='modal_footer'>
            <Button onClick={poachplayer} type='primary' className='button_1'>
              confirm
            </Button>
            <Button onClick={closeModal} type='primary' className='button_2'>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
       
    </>
  )
}

export default PoachPlayer
