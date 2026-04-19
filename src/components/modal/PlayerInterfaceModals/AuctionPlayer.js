import React, { useEffect, useState } from 'react'

import { Button, Form, Input, Modal, notification } from 'antd'
import SamDatePicker from '../../../components/SamDatePicker'

import dayjs from 'dayjs'
import { createAuction } from '../../../redux/actions/rosterAction'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const AuctionPlayer = ({ playerIds, disabled, pInterfaceModalClose }) => {
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const leagueState = useSelector((state) => state.league) || {}
  const currentLeague = leagueState.currentLeague
  const ownerAuctionsDisabled = currentLeague?.ownerToOwnerAuctionsEnabled === false
  const draftNotCompleted = currentLeague && currentLeague.draftCompleted !== true

  const showModal = () => {
    if (draftNotCompleted) {
      notification.warning({
        message: 'Draft In Progress',
        description: 'Auctions will become available once the league draft has been completed.',
        duration: 5,
      })
      return
    }
    if (ownerAuctionsDisabled) {
      notification.error({
        message: 'Owner-to-Owner Auctions Disabled',
        description: 'This feature has been turned off by your commissioner.',
        duration: 5,
      })
      return
    }
    setOpen(true)
  }
  const closeModal = () => {
    form.resetFields()
    setOpen(false)
    pInterfaceModalClose()
  }


  useEffect(() => {
    if (playerIds && playerIds.playercaphit) {
      form.setFieldsValue({ openingBidPrice: playerIds?.playercaphit });
    }
  }, [playerIds, form])


  const onFinish = async (values) => {
    const start = dayjs(values.auctionStartDate).format('YYYY-MM-DD HH:mm:ss')
    const end = dayjs(values.auctionEndDate).format('YYYY-MM-DD HH:mm:ss')
    const auctionStartDate = dayjs(start).toISOString()
    const auctionEndDate = dayjs(end).toISOString()
     const openingBidPrice = Number(values.openingBidPrice)
    // const openingBidPrice =25
    const reserveBidPrice = Number(values.reserveBidPrice)

    setLoading(true)




if (reserveBidPrice < openingBidPrice) {
 

  notification.error({
    message: `reserve bid price {reserveBidPrice} must be greater than  ${openingBidPrice}.`,
    duration: 4,
  });
  return
}

    const res = await createAuction({
      start: auctionStartDate,
      end: auctionEndDate,
       startingBid: openingBidPrice,
       reserveBid: reserveBidPrice,
     // startingBid: 25,
  
      auctionFrom: 'owner',
      ...playerIds,
    })
    if (res) {
      closeModal()
      navigate('/player-auction')
    }
    setLoading(false)
  }

  return (
    <>
      {draftNotCompleted ? (
        <span style={{
          padding: '1px 8px', borderRadius: 3,
          background: 'rgba(110,105,128,0.1)',
          color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 600,
          letterSpacing: 0.5, textTransform: 'uppercase',
        }}>locked</span>
      ) : (
        <Button disabled={disabled || ownerAuctionsDisabled} type='primary' className='action-bar-btn' onClick={showModal} title={ownerAuctionsDisabled ? 'Disabled by commissioner' : ''}>
          {ownerAuctionsDisabled ? 'Auctions Disabled' : 'Auction Player'}
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
        <Form form={form} name='login' className='modal_body' layout='vertical' onFinish={onFinish}>
          <h1 className='modal_header_heading main_heading'>Player Auction Creation</h1>
          <div className='auction_button_groups'>
            <div className='wrapper'>
              <Form.Item
                name='auctionStartDate'
                rules={[
                  {
                    required: true,
                    message: 'Required',
                  },
                ]}
                requiredMark='optional'
              >
                <SamDatePicker
                  suffixIcon={<></>}
                  inputReadOnly={true}
                  placeholder='Auction Start Date'
                  onChange={(date) => {
                    const formattedDate = dayjs(date).format('YYYY-MM-DD HH:mm:ss')
                    form.setFieldsValue('auctionStartDate', dayjs(formattedDate).toISOString())
                  }}
                />
              </Form.Item>
            </div>
            <div className='wrapper'>
              <Form.Item
                name='auctionEndDate'
                rules={[
                  {
                    required: true,
                    message: 'Required',
                  },
                ]}
                requiredMark='optional'
              >
                <SamDatePicker
                  suffixIcon={<></>}
                  inputReadOnly={true}
                  placeholder='Auction End Date'
                  onChange={(date) => {
                    const formattedDate = dayjs(date).format('YYYY-MM-DD HH:mm:ss')
                    form.setFieldsValue('auctionEndDate', dayjs(formattedDate).toISOString())
                  }}
                />
              </Form.Item>
            </div>
            <div className='wrapper'>
              <Form.Item
                name='openingBidPrice'
                // label='openingBidPrice'
                rules={[
                  {
                    required: true,
                    message: 'Required',
                  },
                ]}
                requiredMark='optional'
              >
                <Input type='number' placeholder='Opening Bid Price' disabled />
              </Form.Item>
            </div>
            <div className='wrapper'>
              <Form.Item
                name='reserveBidPrice'
                rules={[
                  {
                    required: true,
                    message: 'Required',
                  },
                ]}
                requiredMark='optional'
              >
                <Input type='number' placeholder='Reserve Bid Price' />
              </Form.Item>
            </div>
          </div>
          <div className='modal_footer'>
            <Button type='primary' htmlType='submit' className='button_1' loading={loading}>
              Create Auction
            </Button>
            <Button onClick={closeModal} type='primary' className='button_2'>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  )
}

export default AuctionPlayer
