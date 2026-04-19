import { useEffect, useState } from 'react'
import { Modal, Button, Input, Form, Row, Col, Avatar, Radio, Rate, Select } from 'antd'
import LeagueEmptyCard from '../NewPopularLeagueCard/EmptyCard'
import { updateLeagueCommissioner } from '../../redux'
import { landingSignup } from '../../config/constants'
import { CiMenuKebab } from "react-icons/ci";
import dayjs from 'dayjs'

const ResetLeague = ({ deleteHandler, deleteLoading }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const showModal = () => {
    if (localStorage.getItem('token')) {
      setIsModalVisible(true)
    } else {
      landingSignup()
    }
  }
  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const onFinish = async (values) => {
    setLoading(true)
    const obj = {
      ...data,
      ...values,
      draftStart: dayjs(values?.draftStart).toISOString(),
    }

    if (values?.leagueType === 'public') {
      delete obj.leaguePassword
    }

    await updateLeagueCommissioner(obj)
    setLoading(false)
    handleCancel()
  }

  const confirmDelete = () => {
    deleteHandler()
  }

  return (
    <>
      <div className='button_row button_row_updated' onClick={showModal}>
        <p>Reset</p>
      </div>

      <Modal
        centered
        open={isModalVisible}
        footer={false}
        onCancel={handleCancel}
        closeIcon={false}
        closable={false}
        className='normal-modal'
        width={1200}
      >
        <div className='close_modal_button' onClick={handleCancel}>
          x
        </div>
        <div className='modal_body'>
          <h2 className='modal_header_heading main_heading'>Reset League</h2>
            <p>Are you sure, you want to reset the league ?</p>
          <div className='buttons_container'>
            <div className='modal_btn_container cancel' style={{opacity: deleteLoading ? 0.7 : 1, cursor: deleteLoading ? 'not-allowed' : 'pointer'}} onClick={() => !deleteLoading && handleCancel()}>
              <p>Cancel</p>
            </div>
            <div className='modal_btn_container confirm' style={{opacity: deleteLoading ? 0.7 : 1, cursor: deleteLoading ? 'not-allowed' : 'pointer'}} 
              onClick={() => { 
                if(!deleteLoading){
                  deleteHandler()
                  handleCancel()
                }
              }}
            >
              <p>Confirm</p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default ResetLeague
