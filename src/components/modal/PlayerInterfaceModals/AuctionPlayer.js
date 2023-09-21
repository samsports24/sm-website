import React, { useState } from 'react'

import { Button, DatePicker, Form, Input, Modal } from 'antd'

import dayjs from 'dayjs'
import { createAuction } from '../../../redux/actions/rosterAction'
import { useNavigate } from 'react-router-dom'

const AuctionPlayer = ({ playerIds, disabled }) => {
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const showModal = () => setOpen(true)
  const closeModal = () => {
    form.resetFields()
    setOpen(false)
  }

  const onFinish = async (values) => {
    const start = dayjs(values.auctionStartDate).format('YYYY-MM-DD HH:mm:ss')
    const end = dayjs(values.auctionEndDate).format('YYYY-MM-DD HH:mm:ss')
    const auctionStartDate = dayjs(start).toISOString()
    const auctionEndDate = dayjs(end).toISOString()
    const openingBidPrice = Number(values.openingBidPrice)
    const reserveBidPrice = Number(values.reserveBidPrice)

    setLoading(true)
    const res = await createAuction({
      start: auctionStartDate,
      end: auctionEndDate,
      startingBid: openingBidPrice,
      reserveBid: reserveBidPrice,
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
      <Button disabled={disabled} type='primary' className='action-bar-btn' onClick={showModal}>
        auction player
      </Button>
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
            {/* <Button type='default'>Auction Start Date</Button> */}
            {/* <Button type='default'>Auction End Date</Button> */}
            {/* <Button type='default'>Opening Bid Price</Button> */}
            {/* <Button type='default'>Reserve Bid Price</Button> */}
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
                <DatePicker
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
                <DatePicker
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
                rules={[
                  {
                    required: true,
                    message: 'Required',
                  },
                ]}
                requiredMark='optional'
              >
                <Input type='number' placeholder='Opening Bid Price' />
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
