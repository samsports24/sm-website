// import React from 'react'

// const PositionComponent = ({ position, setPosition }) => {
//   const handlePosition = (value) => {
//     setPosition(value)
//   }

//   return (


//     <div className='_positionBox'>
//       <div>
//         <div
//           className={_borderLeft ${position === 'ALL' ? '_activePosition' : ''}}
//           onClick={() => handlePosition('ALL')}
//         >
//           <p>ALL</p>
//         </div>
//       </div>
//       <div>
//         <div className='_borderLeft _hideBorderBottom' style={{ backgroundColor: '#010001' }}>
//           <p style={{ fontSize: '10px' }} className='_fwd'>
//             FWD
//           </p>
//         </div>
//         <div
//           onClick={() => handlePosition('QB')}
//           className={${position === 'QB' ? '_activePosition' : ''}}
//         >
//           <p className='_qb'>QB</p>
//         </div>
//       </div>
//       <div>
//         <div
//           onClick={() => handlePosition('RB')}
//           className={${position === 'RB' ? '_activePosition' : ''}}
//         >
//           <p className='_rb'>RB</p>
//         </div>
//       </div>
//       <div>
//         <div
//           onClick={() => handlePosition('WR')}
//           className={${position === 'WR' ? '_activePosition' : ''}}
//         >
//           <p className='_wr'>WR</p>
//         </div>
//       </div>
//       <div>
//         <div
//           onClick={() => handlePosition('TE')}
//           className={${position === 'TE' ? '_activePosition' : ''}}
//         >
//           <p className='_te'>TE</p>
//         </div>
//       </div>
//       <div>
//         <div
//           onClick={() => handlePosition('OL')}
//           className={${position === 'OL' ? '_activePosition' : ''}}
//         >
//           <p className='_ol'>OL</p>
//         </div>
//       </div>
//       <div>
//         <div className='_borderLeft _hideBorderBottom' style={{ backgroundColor: '#FF001B' }}>
//           <p style={{ fontSize: '10px' }}>MID</p>
//         </div>
//         <div
//           onClick={() => handlePosition('DL')}
//           className={${position === 'DL' ? '_activePosition' : ''}}
//         >
//           <p className='_dl'>DL</p>
//         </div>
//       </div>
//       <div>
//         <div
//           onClick={() => handlePosition('LB')}
//           className={${position === 'LB' ? '_activePosition' : ''}}
//         >
//           <p className='_lb'>LB</p>
//         </div>
//       </div>
//       <div>
//         <div
//           onClick={() => handlePosition('DB')}
//           className={${position === 'DB' ? '_activePosition' : ''}}
//         >
//           <p className='_db'>DB</p>
//         </div>
//       </div>
//     </div>
    
//   )
// }

// export default PositionComponent


import React from 'react';

const PositionComponent = ({ position, setPosition }) => {
  const handlePosition = (value) => {
    setPosition(value);
  };

  return (
    <div className='_positionBox'>
      <div>
        <div
          className={`_borderLeft ${position === 'ALL' ? '_activePosition' : ''}`}
          onClick={() => handlePosition('ALL')}
        >
          <p>ALL</p>
        </div>
      </div>
      <div>
        <div className='_borderLeft _hideBorderBottom' style={{ backgroundColor: '#010001' }}>
          <p style={{ fontSize: '10px' }} className='_fwd'>
            FWD
          </p>
        </div>
        <div
          onClick={() => handlePosition('QB')}
          className={`${position === 'QB' ? '_activePosition' : ''}`}
        >
          <p className='_qb'>QB</p>
        </div>
      </div>
      <div>
        <div
          onClick={() => handlePosition('RB')}
          className={`${position === 'RB' ? '_activePosition' : ''}`}
        >
          <p className='_rb'>RB</p>
        </div>
      </div>
      <div>
        <div
          onClick={() => handlePosition('WR')}
          className={`${position === 'WR' ? '_activePosition' : ''}`}
        >
          <p className='_wr'>WR</p>
        </div>
      </div>
      <div>
        <div
          onClick={() => handlePosition('TE')}
          className={`${position === 'TE' ? '_activePosition' : ''}`}
        >
          <p className='_te'>TE</p>
        </div>
      </div>
      <div>
        <div
          onClick={() => handlePosition('OL')}
          className={`${position === 'OL' ? '_activePosition' : ''}`}
        >
          <p className='_ol'>OL</p>
        </div>
      </div>
      <div>
        <div className='_borderLeft _hideBorderBottom' style={{ backgroundColor: '#FF001B' }}>
          <p style={{ fontSize: '10px' }}>MID</p>
        </div>
        <div
          onClick={() => handlePosition('DL')}
          className={`${position === 'DL' ? '_activePosition' : ''}`}
        >
          <p className='_dl'>DL</p>
        </div>
      </div>
      <div>
        <div
          onClick={() => handlePosition('LB')}
          className={`${position === 'LB' ? '_activePosition' : ''}`}
        >
          <p className='_lb'>LB</p>
        </div>
      </div>
      <div>
        <div
          onClick={() => handlePosition('DB')}
          className={`${position === 'DB' ? '_activePosition' : ''}`}
        >
          <p className='_db'>DB</p>
        </div>

     
      </div>

      <div>
        <div
          onClick={() => handlePosition('ST')}
          className={`${position === 'ST' ? '_activePosition' : ''}`}
        >
          <p className='_st'>ST</p>
        </div>

     
      </div>
    </div>
  );
};

export default PositionComponent;
