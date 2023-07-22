import { Button } from 'antd'
// import React, { useState } from 'react'

const PopularSportCard = ({ data }) => {
  // const [active, setActive] = useState(null)

  // functions
  // const mouseHover = () => {
  //   setActive(data?.index)
  // }

  // component
  // const SportCardTwo = () => {
  //   // functions
  //   const mouseLeave = () => {
  //     setActive(null)
  //   }

  //   return (
  //     <div
  //       className='sport-card'
  //       style={{
  //         backgroundImage: `url(${data?.image})`,
  //       }}
  //       onMouseLeave={mouseLeave}
  //     >
  //       <div style={{ background: 'rgba(0,0,0,0.3)' }}>
  //         <div className='container1 card-1'>
  //           <img src={data?.icon} />
  //         </div>

  //         <div className='container2 card-2'>
  //           <span>{data?.title}</span>
  //           <div className='buttons-container'>
  //             <Button type='default'>
  //               <span>AFLL</span>
  //             </Button>
  //             <Button type='default'>
  //               <span>RULEBOOK</span>
  //             </Button>
  //             <Button type='primary'>
  //               <span>LEAGUE DETAILS</span>
  //             </Button>
  //             <Button type='default'>
  //               <span>FRANCHISES FOR SALE</span>
  //             </Button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  // if (data?.index === active) return <SportCardTwo />
  // return (
  //   <div
  //     onMouseOver={mouseHover}
  //     className='sport-card'
  //     style={{
  //       backgroundImage: `url(${data?.image})`,
  //     }}
  //   >
  //     <div className='container1'>
  //       <img src={data?.icon} />
  //     </div>

  //     <div className='container2'>
  //       <span>{data?.title}</span>
  //     </div>
  //   </div>
  // )
  return (
    <div className='wrapper'>
      <div className='card'>
        <img src={data?.image} />
        <div className='front-side'>
          <img src={data?.icon} />
          <h1>{data?.title}</h1>
        </div>

        <div className='info'>
          <div className='info-container'>
            <h1>{data?.title}</h1>
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
    </div>
  )
}

export default PopularSportCard
