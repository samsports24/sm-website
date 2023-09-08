import React from 'react'
import DollorIcon from '../../assets/dollor-icon.svg'
import { Button, Input } from 'antd'

const DraftOrder = () => {
  return (
    <div className='draft_order'>
      <header>
        <h3>Draft Order</h3>
      </header>
      <section className='content_body'>
        <div className='draft_order_box'>
          {[
            {
              name: '101= USER123',
              amount: 15.25,
            },
            {
              name: '102= USER222',
              amount: 15.0,
            },
            {
              name: '103= USER345',
              amount: 14.25,
            },
            {
              name: '104= 105= USER454',
              amount: 0,
            },
            {
              name: '105= Unowned Team',
              amount: 0,
            },
          ]?.map((v, i, arr) => {
            const isLastItem = i === arr.length - 1
            return (
              <div key={i} className='draft_row' style={{ border: isLastItem && 'none' }}>
                <p>{v?.name}</p>
                <h2>
                  <img src={DollorIcon} /> ${v?.amount?.toFixed(2)}
                </h2>
              </div>
            )
          })}
        </div>
        <div className='draft_order_footer'>
          <p>Increase Bid</p>
          <Input type='number' placeholder='Amount' />
          <Button type='primary'>Make Payment</Button>
        </div>
      </section>
    </div>
  )
}

export default DraftOrder
