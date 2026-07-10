import { Modal } from 'antd'
import '../../styles/modals/pointstransfermessage.css'
import sammdglogo from '../../assets/samcoinlogo.png'
import {
  TrophyOutlined,
  UserAddOutlined,
  GiftOutlined,
  TeamOutlined,
} from '@ant-design/icons'

const ClubhouseModal = ({ visible, onClose }) => {
  return (
    <Modal
      className='chm-modal'
      open={visible}
      onCancel={onClose}
      centered
      footer={null}
      closeIcon={false}
      closable={false}
      width={520}
    >
      <div className='chm-content'>
        {/* Header */}
        <div className='chm-header'>
          <img src={sammdglogo} className='chm-logo' alt='SamSports' />
          <h2 className='chm-title'>Welcome to the Clubhouse</h2>
          <p className='chm-subtitle'>
            Your hub for connecting with friends and challenging peers on SamSports.
            Invite friends and earn SamPoints as rewards.
          </p>
        </div>

        {/* Reward Cards */}
        <div className='chm-sections'>
          <div className='chm-reward-card chm-reward-pro'>
            <div className='chm-reward-header'>
              <TrophyOutlined className='chm-reward-icon' />
              <h3>League Invitation</h3>
            </div>
            <ul className='chm-reward-list'>
              <li>Invite a user who creates a team and joins a league</li>
              <li>
                Earn <strong>2,500,000 SamPoints</strong> as a reward
              </li>
            </ul>
          </div>

          <div className='chm-reward-card chm-reward-free'>
            <div className='chm-reward-header'>
              <UserAddOutlined className='chm-reward-icon' />
              <h3>Freemium Invitation</h3>
            </div>
            <ul className='chm-reward-list'>
              <li>Invite a friend to join a freemium league</li>
              <li>
                Earn <strong>2,500,000 SamPoints</strong> as a reward
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className='chm-footer'>
          <div className='chm-footer-note'>
            <TeamOutlined className='chm-footer-icon' />
            <span>
              Expand your network, challenge others, and boost your SamPoints earnings
            </span>
          </div>
          <button className='chm-btn' onClick={onClose}>
            <GiftOutlined /> GOT IT!
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ClubhouseModal
