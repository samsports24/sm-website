import React, { useState } from 'react'
import { Modal, Button, Input } from 'antd'
import '../../styles/modals/verficationcodeModal.css'
import samverifylogo from '../../assets/samverficationlogo.png'
import { useDispatch, useSelector } from 'react-redux'
import { createPaymentIntent } from '../../redux/actions/paymentAction'

const PaymentModal = ({ visible, onClose }) => {
  console.log('🚀 ~ MessageModal ~ visible:', visible)
  const { showPaymentModal } = useSelector((state) => state?.user)
  const dispatch = useDispatch();
//   console.log('inside showPaymentModal',showPaymentModal);
  //   const userSelector = useSelector((state) => state?.user)

  //   console.log('userSelector', userSelector)

  //  console.log('user',user?.team?.currentLeague?.name);

  const cancel = () => {
    dispatch({
        type: 'SET_SHOW_PAYMENT_MODAL',
        showPaymentModal: false
      });
  }

  const onFinish = async()=>{
    const userName=localStorage.getItem('userName')
    const payload={
        userName
    }
    // console.log('userName',userName);
    const res = await createPaymentIntent(payload);
    const { url } = res?.session
    // console.log('url',url);

    //  window.open(url);
    window.location.href = url   
     if (res) {
        localStorage.removeItem('userName')
        dispatch({
            type: 'SET_SHOW_PAYMENT_MODAL',
            showPaymentModal: false
          });
   
     }

  }

  return (
    <Modal
      className='verificationcode'
      title=''
      open={showPaymentModal}
      onCancel={cancel}
      centered
      footer={[
        <Button onClick={onFinish} className='customBTN' key='save' type='primary'>
          Get Payment Link
        </Button>,
      ]}
    >
      <img src={samverifylogo} className='msgimg' alt='samlogo' />

      <div className='msgtext'>
        <span>
          {/* Please complete the payment by clicking on the payment link button below to be sent on your email address */}
          To complete payment click button below and receive a link to Your Email address 
        </span>
      </div>
    </Modal>
  )
}

export default PaymentModal
