import React, { useState } from 'react'
import { Modal, Button,Input } from 'antd'
import '../../styles/modals/verficationcodeModal.css'
import samverifylogo from '../../assets/samverficationlogo.png'
import cross from '../../assets/cross.png'

const GmRatingModal = ({ visible, onClose,onCancel}) => {
  return (
    <Modal
      className='gmrating'
      title=''
      open={visible}
      onCancel={onCancel}
      centered
      footer={[
        // <Button onClick={onClose} className='customBTN' key='save' type='primary'>
        //   Submit
        // </Button>,
      ]}
    >
          <img onClick={onCancel} src={cross} className='cross' alt='samlogo' />

      <img  src={samverifylogo} className='msgimg' alt='samlogo' />

      <div className='msgtext'>
<p> GM Rating:
<span>
        A metric of your strategic acumen in managing fantasy A.Football teams within SamSports. Highlight your skills and achievements, potentially positioning you for future opportunities as a General Manager in the SFL.
        </span>

</p>
     
     
      </div>
    </Modal>
  )
}

export default GmRatingModal
