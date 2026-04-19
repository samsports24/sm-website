import { Avatar } from 'antd'
import React from 'react'

const FeedbackCard = ({ data }) => {
  return (
    <div className='feedback-card'>
      <div className='image-box'>
        <Avatar className='avatar' src={<img src={data?.image} alt={data?.clientName} />} />
      </div>
      <p>
        <span>{` -   ${data?.clientName}`}</span> <br />
        {/* {data?.comment && data?.comment?.length > 200 ? (
          <>
            {data?.comment?.slice(0, 200) + '... '}
            <a>Read More</a>
          </>
        ) : (
          data?.comment
          )} */}
        {data?.comment}
      </p>
    </div>
  )
}

export default FeedbackCard
