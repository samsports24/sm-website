import React from 'react'
import { Button, Input } from 'antd'

const ManualBIdEntry = () => {
  return (
    <div className='manual_bid_entry_box'>
      <p>Manual Bid Entry</p>
      <div className='bid_input_box'>
        <Input placeholder='**********' />
      </div>
      <div className='bid_btn_box'>
        <Button type='primary'>Submit</Button>
        <Button type='primary'>Quick Bid</Button>
      </div>
    </div>
  )
}

export default ManualBIdEntry
