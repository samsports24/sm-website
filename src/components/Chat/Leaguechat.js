import React from 'react'
import moment from 'moment'
import { Image } from 'antd'

const Leaguechat = ({ chat, teamid, chatRef }) => {
  const urlRegex =
    /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%?=~_|])|(\bwww\.[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%?=~_|])/gi

  // Safely render message text with links and mentions
  const renderMessageText = (text) => {
    if (!text) return null
    const segments = text.split(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi)
    return segments.map((segment, idx) => {
      if (segment?.match(/^(https?:\/\/|www\.)/i)) {
        const href = segment.startsWith('www') ? `https://${segment}` : segment
        return (
          <a key={idx} href={href} target='_blank' rel='noopener noreferrer' className='lc-msg-link'>
            {segment}
          </a>
        )
      }
      // Highlight @mentions
      const mentionParts = segment?.split?.(/(@\w+)/g) || [segment]
      return mentionParts.map((part, midx) => {
        if (part?.startsWith?.('@')) {
          return (
            <span key={`${idx}-${midx}`} className='lc-msg-mention'>
              {part}
            </span>
          )
        }
        return <span key={`${idx}-${midx}`}>{part}</span>
      })
    })
  }

  const sortedChat = chat?.slice()?.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) || []

  if (sortedChat.length === 0) {
    return (
      <div ref={chatRef} className='lc-empty-state'>
        <div className='lc-empty-icon'>
          <svg width='52' height='52' viewBox='0 0 24 24' fill='none' stroke='rgba(40,159,201,0.3)' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' />
          </svg>
        </div>
        <p className='lc-empty-text'>No messages yet. Be the first to say something!</p>
      </div>
    )
  }

  // Group messages by date
  const getDateLabel = (date) => {
    const msgDate = moment(date)
    const today = moment().startOf('day')
    const yesterday = moment().subtract(1, 'day').startOf('day')
    if (msgDate.isSame(today, 'day')) return 'Today'
    if (msgDate.isSame(yesterday, 'day')) return 'Yesterday'
    return msgDate.format('MMM D, YYYY')
  }

  let lastDateLabel = ''

  return (
    <div ref={chatRef} className='lc-messages-scroll'>
      {sortedChat.map((message, i) => {
        const isMine = message?.sender?._id === teamid
        const dateLabel = getDateLabel(message.createdAt)
        const showDate = dateLabel !== lastDateLabel
        lastDateLabel = dateLabel

        // Check if previous message is from same sender (for grouping)
        const prevMsg = sortedChat[i - 1]
        const sameSender = prevMsg && prevMsg?.sender?._id === message?.sender?._id
        const showAvatar = !sameSender

        return (
          <React.Fragment key={i}>
            {showDate && (
              <div className='lc-date-divider'>
                <span>{dateLabel}</span>
              </div>
            )}

            <div className={`lc-msg-row ${isMine ? 'lc-msg-mine' : 'lc-msg-other'} ${!showAvatar ? 'lc-msg-grouped' : ''}`}>
              {/* Avatar */}
              <div className='lc-msg-avatar-col'>
                {showAvatar ? (
                  <Image
                    width={36}
                    height={36}
                    preview={false}
                    src={message?.sender?.logo}
                    alt={message?.sender?.name}
                    className='lc-msg-avatar'
                  />
                ) : (
                  <div className='lc-msg-avatar-spacer' />
                )}
              </div>

              {/* Message content */}
              <div className='lc-msg-content'>
                {showAvatar && (
                  <div className='lc-msg-header'>
                    <span className={`lc-msg-sender ${isMine ? 'lc-sender-mine' : 'lc-sender-other'}`}>
                      {message?.sender?.name}
                    </span>
                    <span className='lc-msg-time'>
                      {moment(message.createdAt).format('h:mm A')}
                    </span>
                  </div>
                )}
                <div className='lc-msg-bubble'>
                  {message?.media_url ? (
                    <div className='lc-msg-media'>
                      <Image
                        width={220}
                        src={message.media_url}
                        alt='Media'
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                  ) : (
                    <span className='lc-msg-text'>{renderMessageText(message.message)}</span>
                  )}
                </div>
              </div>
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default Leaguechat
