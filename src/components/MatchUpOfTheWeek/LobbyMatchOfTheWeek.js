


import React from 'react'
import dayjs from 'dayjs'


const LobbyMatchOfTheWeek = ({ data: v }) => {
    console.log('inside the data',v);
    


  return (


<div className='lobbymatchupbox'>
{/* <img width={20} src={v?.opponentOne?.logo} /> */}

<div className='opponentonebox'>

<img  src={v?.opponentOne?.logo} />
</div>


<div className='scores'>
    <p className='firstteamscore'>

{v?.scoreOne || 0}
    </p>

    <p className='secondteamscore'>
    {v?.scoreTwo || 0}

</p>

</div>

<div className='opponentonebox'>

<img  src={v?.opponentTwo?.logo} />
</div>

</div>


    // <div className='match_up_box'>
    //   <div className='header'>
    //     <h1>Match-Up Of The Week</h1>
    //   </div>
    //   <div className='date_and_time'>
    //     <h3>{dayjs(v?.matchStartDate).format('ddd, Do MMM YYYY')}</h3>
    //   </div>
    //   <div className='teams'>
    //     <div className='team1'>
    //       <div className='image_div'>
    //         <img src={v?.opponentOne?.logo} />
    //       </div>
    //       <div className='content'>
    //         <h3>{v?.opponentOne?.name}</h3>
    //         <p>
    //           <span>Points:</span> {v?.scoreOne || 0}
    //         </p>
    //       </div>
    //     </div>
    //     <div className='versus'>
    //       <img src={require('../../assets/versus-12.png')} />
    //     </div>
    //     <div className='team1 team2'>
    //       <div className='content'>
    //         <h3>{v?.opponentTwo?.name}</h3>
    //         <p>
    //           <span>Points:</span> {v?.scoreTwo || 0}
    //         </p>
    //       </div>
    //       <div className='image_div'>
    //         <img src={v?.opponentTwo?.logo} />
    //       </div>
    //     </div>
    //   </div>
    
    // </div>

    // <div style={{background:'red',color:'red'}}>
    //     hamza
    // </div>
  )
}

export default LobbyMatchOfTheWeek
