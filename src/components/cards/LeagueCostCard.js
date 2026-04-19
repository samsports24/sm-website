import { Input } from 'antd'

const LeagueCostCard = () => {
  return (
    <div className='cost-container'>
      <div className='top-div'>
        <p>League Cost</p>
        <div className='details'>
          <h4>Fee</h4>
          <h3>$12.99</h3>
        </div>
      </div>
      <div className='card-body'>
        <div className='widgets-text'>
          <p>{`Please note that the $12.99 fee is non-refundable and is paid directly to SamSports SFL. It’s important to clarify that non of the proceeds from the fee will contribute to your league’s prize pool.`}</p>
        </div>
        <div className='draft-order'>
          <h3>Opening Draft Order Bid</h3>
          <Input />
        </div>
        <div className='widgets-text'>
          <p>
            To participate in this league, you must place a bid that meets the league’s minimum
            bidding requirement. It’s important to note that 75% of the draft order bids will
            directly contribute to your league’s prize pool, which will be distributed over the nex
            three years. This setup ensures a substantial prize pool for participants, adding to the
            excitement and competitiveness of the league.
          </p>
        </div>
        <div className='draft-table'>
          <div className='table-head'>
            <h3>Your Total Payment Today</h3>
          </div>
          <div className='table-row'>
            <p>Fee</p>
            <span>$12.99</span>
          </div>
          <div className='table-row'>
            <p>Draft Order Bid</p>
            <span>$15.75</span>
          </div>
          <div className='table-row'>
            <p className='total'>TOTAL</p>
            <span className='total'>$28.74</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeagueCostCard
