import React from 'react'
import { Modal } from 'antd'
import Message from '../Chat/Message'
import '../../styles/modals/dmchatmodal.css'
import Loader from '../Loader'

const PersonalChatModal = ({
  visible,
  onClose,
  chat,
  teamid,
  teamname,
  loader,
  myMessage,
  setMyMessage,
  onSendMessage,
  onimagesend,
  image,
  setImage,
  dmloading,
}) => {
  // Safely determine the display name of the other team
  const getDisplayName = () => {
    if (!chat || chat.length === 0) return 'Chat'
    const firstMsg = chat[0]
    if (firstMsg?.to?.name && firstMsg.to.name !== teamname) return firstMsg.to.name
    if (firstMsg?.from?.name && firstMsg.from.name !== teamname) return firstMsg.from.name
    if (chat.length > 1) {
      const secondMsg = chat[1]
      if (secondMsg?.to?.name && secondMsg.to.name !== teamname) return secondMsg.to.name
      if (secondMsg?.from?.name && secondMsg.from.name !== teamname) return secondMsg.from.name
    }
    return 'Direct Message'
  }

  const displayName = getDisplayName()
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Modal
      open={visible}
      className='dmchatmodal'
      onCancel={onClose}
      footer={null}
      closable={false}
      width={520}
      styles={{ body: { padding: 0 } }}
    >
      {/* Custom header */}
      <div className='dmc-header'>
        <div className='dmc-header-left'>
          <div className='dmc-avatar'>
            <span>{initials}</span>
          </div>
          <div className='dmc-header-info'>
            <h3 className='dmc-header-name'>{displayName}</h3>
            <span className='dmc-header-status'>
              <span className='dmc-status-dot' />
              Direct Message
            </span>
          </div>
        </div>
        <button className='dmc-close-btn' onClick={onClose}>
          <svg width='14' height='14' viewBox='0 0 14 14' fill='none'>
            <path d='M1 1L13 13M13 1L1 13' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
          </svg>
        </button>
      </div>

      {/* Chat body */}
      {dmloading ? (
        <div style={{ padding: '60px 0' }}>
          <Loader />
        </div>
      ) : (
        <Message
          chat={chat || []}
          teamid={teamid}
          loader={loader}
          myMessage={myMessage}
          setMyMessage={setMyMessage}
          onSendMessage={onSendMessage}
          onimagesend={onimagesend}
          image={image}
          setImage={setImage}
        />
      )}
    </Modal>
  )
}

export default PersonalChatModal
