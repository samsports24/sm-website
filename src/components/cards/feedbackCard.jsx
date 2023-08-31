import React from 'react'

const FeedbackCard = ({ data }) => {
  return (
    <div className='feedback-card'>
      <img src={data?.image} />
      <p>
        <span>{` -   ${data?.clientName}`}</span> <br />
        {data?.comment && data?.comment?.length > 200 ? (
          <>
            {data?.comment?.slice(0, 200) + '... '}
            <a>Read More</a>
          </>
        ) : (
          data?.comment
        )}
      </p>
    </div>
  )
}

export default FeedbackCard
