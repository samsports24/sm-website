import React from 'react'

const FeedbackCard = ({ data }) => {
  return (
    <div className='feedback-card'>
      <img src={data?.image} />
      <p>
        {data?.comment}
        <span>{` -   ${data?.clientName}`}</span>
      </p>
    </div>
  )
}

export default FeedbackCard
