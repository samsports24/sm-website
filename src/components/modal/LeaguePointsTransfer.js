import React, { useState } from 'react'
import { Modal, Input, Button, Popconfirm } from 'antd'
import '../../styles/modals/leaguepointsModal.css'
import { useSelector } from 'react-redux'


const LeaguePointsTransfer = ({ visible, onClose,onConfirm,onSave,leaguepoints,setLeaguepoints}) => {

    const user = useSelector((state) => state.user.userDetails)
//  console.log('user',user?.team?.currentLeague?.name);

  const cancel = () => {
    // setPlayerInfo({})
    onClose()
  }

  const handleInputChange = (e) => {
    setLeaguepoints(e.target.value)
  }

  


  return (
    <Modal
      className='CustomInpurModal'
      title=''
      open={visible}
      onCancel={onClose}
      centered
    //   footer={[
        
    //       <Button onClick={handletransferleaguepoints}  className='customBTN' key='save' type='primary'>
    //         Transfer
    //       </Button>
        
    //   ]}

      footer={[
        <Popconfirm
          key='save'
          title='SAMSPORT'
          description={
            <div>
              <p className='players_popconfirm_text'>
                You are about to add  more  Sam Points to{user?.team?.currentLeague?.name},  Once this action is completed, the SamPoints deposited cannot be removed from your league&apos;s wallet
              </p>
            </div>
           
          }
        //   onConfirm={confirm}
        onConfirm={onConfirm}
          onCancel={cancel}
          icon={null}
          okText='YES'
          cancelText='NO'
          footer={null}
          okButtonProps={{ className: 'Popconfirm_btn' }}
          cancelButtonProps={{ className: 'Popconfirm_btn' }}
          placement={null}
          className='players_popconfirm'
        >
          <Button className='customBTN' key='save' type='primary'  onClick={onSave}>
            Save
          </Button>
        </Popconfirm>,
      ]}
      
    >
      <p>SAMSPORTS</p>
      <Input
        className='customInput'
        size='large'
        placeholder='Enter Points'
        value={leaguepoints}
        onChange={handleInputChange}
        // value={playerInfo?.value}
        // onChange={(e) =>
        //   setPlayerInfo((pre) => {
        //     return { ...pre, value: e.target.value }
        //   })
        // }
      />
    </Modal>
  )
}

export default LeaguePointsTransfer
