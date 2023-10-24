import React, { useState } from 'react'
import { Button, Modal } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const AddPlayerToTrade = ({ data, teamName, selected, setSelected }) => {
  const [open, setOpen] = useState(false)
  const showModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  return (
    <>
      <p onClick={showModal} style={{ cursor: 'pointer' }}>
        <PlusOutlined /> Add Player
      </p>
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
          <h1 className='modal_header_heading main_heading'>
            ADD PLAYER TO TRADE {teamName && `(${teamName})`}
          </h1>

          <div className='center_content trade_player'>
            <h1 className='modal_header_heading'>BUILD YOUR DEAL</h1>
            <p
              style={{ textTransform: 'uppercase' }}
            >{`SELECT THE PLAYER YOU WISH TO BE APART OF THIS TRADE!`}</p>
          </div>

          <h1 className='modal_header_heading'>TEAM ROSTER</h1>
          <div className='team_roster_box'>
            {data?.map((v, i) => {
              const isDisable = selected?.find((x) =>
                x?.players?._id === v?.players?._id ? true : false,
              )
              return (
                <div key={i} className='_row'>
                  <p style={{ width: '100px' }}>{v?.players?.Position}</p>
                  <p style={{ flex: 1 }}>{v?.players?.Name}</p>
                  <p style={{ width: '150px' }}>${v?.players?.PlayerCap}</p>
                  <Button
                    disabled={isDisable}
                    type='primary'
                    onClick={() => {
                      setSelected((pre) => [...pre, v])
                      closeModal()
                    }}
                  >
                    {isDisable ? 'Selected' : 'Select'}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </Modal>
    </>
  )
}

export default AddPlayerToTrade
