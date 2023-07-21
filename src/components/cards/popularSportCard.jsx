import { Button } from 'antd'
import React from 'react'

const PopularSportCard = ({ data }) => {
  
  // component
  const SportCardTwo = () => {
    return (
      <div
        className='sport-card'
        style={{
          backgroundImage: `url(${data?.image})`,
        }}
      >
        <div style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className='container1 card-1'>
            <img src={data?.icon} />
          </div>

          <div className='container2 card-2'>
            <span>{data?.title}</span>
            <div className='buttons-container'>
              <Button type='default'>
                <span>AFLL</span>
              </Button>
              <Button type='default'>
                <span>RULEBOOK</span>
              </Button>
              <Button type='primary'>
                <span>LEAGUE DETAILS</span>
              </Button>
              <Button type='default'>
                <span>FRANCHISES FOR SALE</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (data?.index === 1) return <SportCardTwo />
  return (
    <div
      className='sport-card'
      style={{
        backgroundImage: `url(${data?.image})`,
      }}
    >
      <div className='container1'>
        <img src={data?.icon} />
      </div>

      <div className='container2'>
        <span>{data?.title}</span>
      </div>
    </div>
  )
}

export default PopularSportCard
