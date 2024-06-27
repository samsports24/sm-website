// import React, { useState } from 'react'
// import { Modal, Button,Input } from 'antd'
// import '../../styles/modals/verficationcodeModal.css'
// import samverifylogo from '../../assets/samverficationlogo.png'

// const VerificationcodeModal = ({ visible, onClose,verficationcode,setVerficationcode }) => {
//   console.log("🚀 ~ MessageModal ~ visible:", visible)

//   //  console.log('user',user?.team?.currentLeague?.name);

//   // const cancel = () => {
//   //   // setPlayerInfo({})
//   //   onClose()
//   // }

//   const handleInputChange = (e) => {
//     setVerficationcode(e.target.value)
//   }


//   return (
//     <Modal
//       className='verificationcode'
//       title=''
//       open={visible}
//       onCancel={onClose}
//       centered
//       footer={[
//         <Button onClick={onClose} className='customBTN' key='save' type='primary'>
//           Submit
//         </Button>,
//       ]}
//     >
//       <img src={samverifylogo} className='msgimg' alt='samlogo' />

//       <div className='msgtext'>
//         <span>
//         Please verify your email address or mobile number. We have sent you a verification code; once you receive it, please enter it below
//         </span>
//         <h2>Verification Code</h2>
//         <Input type='number' placeholder='TYPE CODE'    value={verficationcode}
//                 onChange={handleInputChange} />
        
// <p>Re-Send Code</p>
//       </div>
//     </Modal>
//   )
// }

// export default VerificationcodeModal

import React from 'react';
import { Modal, Button, Input, notification } from 'antd';
import '../../styles/modals/verficationcodeModal.css';
import samverifylogo from '../../assets/samverficationlogo.png';

const VerificationcodeModal = ({ visible, onClose, verficationcode, setVerficationcode }) => {
  const handleInputChange = (e) => {
    setVerficationcode(e.target.value);
  };

  const handleSubmit = () => {
    if (verficationcode) {
      onClose(true);
    } else {
      notification.warning({
        message: 'Please enter the verification code',
        duration: 4,
      });
    }
  };

  return (
    <Modal
      className='verificationcode'
      title=''
      open={visible}
      onCancel={() => onClose(false)}
      centered
      footer={[
        <Button onClick={handleSubmit} className='customBTN' key='save' type='primary'>
          Submit
        </Button>,
      ]}
    >
      <img src={samverifylogo} className='msgimg' alt='samlogo' />
      <div className='msgtext'>
        <span>
          Please verify your email address or mobile number. We have sent you a verification code;
          once you receive it, please enter it below.
        </span>
        <h2>Verification Code</h2>
        <Input
          type='number'
          placeholder='TYPE CODE'
          value={verficationcode}
          onChange={handleInputChange}
        />
        <p>Re-Send Code</p>
      </div>
    </Modal>
  );
};

export default VerificationcodeModal;
