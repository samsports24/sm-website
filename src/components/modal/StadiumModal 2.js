import React from 'react'
import { Modal, Button } from 'antd'
import '../../styles/modals/pointstransfermessage.css'
import sammdglogo from '../../assets/samcoinlogo.png'
import {
  TrophyOutlined,
  RiseOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'

const StadiumModal = ({ visible, onClose }) => {
  return (
    <Modal
      className="stadiummodal"
      title=""
      open={visible}
      onCancel={onClose}
      centered
      width={580}
      footer={null}
    >
      <div className="stm-modal-content">
        {/* Header */}
        <div className="stm-modal-header">
          <img src={sammdglogo} className="stm-modal-logo" alt="SamPoints" />
          <h2 className="stm-modal-title">Stadium Management</h2>
          <p className="stm-modal-subtitle">
            Manage your stadium to create a thriving environment, earn SamPoints,
            and engage virtual fans.
          </p>
        </div>

        {/* Sections */}
        <div className="stm-modal-sections">
          {/* Getting Started */}
          <div className="stm-modal-section">
            <div className="stm-modal-section-header">
              <TrophyOutlined className="stm-modal-section-icon" />
              <h3>Getting Started</h3>
            </div>
            <p>
              Each user starts with a stadium at <strong>100% attendance</strong> and
              a ticket price of <strong>85 SamPoints</strong>. Each week, <strong>90%</strong> of
              generated SamPoints goes to the home team owner, while <strong>10%</strong> goes to the away team.
            </p>
          </div>

          {/* Weekly Earnings */}
          <div className="stm-modal-section">
            <div className="stm-modal-section-header">
              <DollarOutlined className="stm-modal-section-icon stm-icon-green" />
              <h3>Weekly Earnings</h3>
            </div>
            <div className="stm-modal-chips">
              <div className="stm-modal-chip stm-chip-green">
                <CheckCircleOutlined /> 90% to home owner
              </div>
              <div className="stm-modal-chip stm-chip-blue">
                <CheckCircleOutlined /> 10% to away team
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div className="stm-modal-section">
            <div className="stm-modal-section-header">
              <RiseOutlined className="stm-modal-section-icon stm-icon-amber" />
              <h3>Attendance Variations</h3>
            </div>
            <p>
              Attendance changes based on weekly performance:
            </p>
            <div className="stm-modal-chips">
              <div className="stm-modal-chip stm-chip-green">
                Win: +3% attendance
              </div>
              <div className="stm-modal-chip stm-chip-red">
                Loss: -3% attendance
              </div>
            </div>
          </div>

          {/* Daily Login */}
          <div className="stm-modal-section">
            <div className="stm-modal-section-header">
              <CalendarOutlined className="stm-modal-section-icon stm-icon-green" />
              <h3>Daily Login Impact</h3>
            </div>
            <p>
              Logging in daily from <strong>Sunday to Wednesday</strong> improves
              your attendance by <strong>1.5%</strong>.
            </p>
          </div>

          {/* Upgrading */}
          <div className="stm-modal-section">
            <div className="stm-modal-section-header">
              <ArrowUpOutlined className="stm-modal-section-icon stm-icon-emerald" />
              <h3>Upgrading Your Stadium</h3>
            </div>
            <p>
              Larger stadiums attract more fans, increase ticket revenue, and let
              you earn more SamPoints. Upgrade to maximize long-term success.
            </p>
          </div>
        </div>

        {/* Footer Button */}
        <Button
          onClick={onClose}
          className="stm-modal-btn"
          type="primary"
          block
        >
          GOT IT!
        </Button>
      </div>
    </Modal>
  )
}

export default StadiumModal
