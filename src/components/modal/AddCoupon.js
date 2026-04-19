import { useEffect, useState } from 'react'
import { Modal, Button, Input } from 'antd'

const AddCoupon = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [coupon, setCoupon] = useState('')
  const [isError, setIsError] = useState(null)

  const showModal = () => setIsModalVisible(true)
  const handleCancel = () => {
    setIsModalVisible(false)
    setCoupon('')
    setIsError(null)
  }
  const handleSubmit = () => {
    if (coupon?.trim() === '') {
      setIsError('Please enter coupon')
    } else {
      // Coupon
    }
  }

  useEffect(() => {
    if (isError !== null) setIsError(null)
  }, [coupon])

  return (
    <>
      <Button type='primary' onClick={showModal}>
        ADD COUPON
      </Button>

      <Modal
        centered
        open={isModalVisible}
        footer={false}
        onCancel={handleCancel}
        closeIcon={false}
        closable={false}
        width={'600px'}
        className='coupon_modal'
      >
        <div className='close_modal_button' onClick={handleCancel}>
          x
        </div>
        <div className='modal_body'>
          <h1 className='modal_header_heading main_heading'>Enter Coupon</h1>
          <div>
            <Input type='text' value={coupon} onChange={(e) => setCoupon(e.target.value)} />
            {isError && <p className='error_text'>{isError}</p>}
          </div>
          <div className='modal_footer'>
            <Button type='primary' className='button_1' onClick={handleSubmit}>
              Submit
            </Button>
            <Button onClick={handleCancel} type='primary' className='button_2'>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default AddCoupon
