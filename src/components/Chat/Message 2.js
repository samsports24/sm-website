import React, { useRef, useEffect } from 'react'
import moment from 'moment'
import { Image, Spin } from 'antd'
import { AiOutlineCloudUpload } from 'react-icons/ai'
import { IoMdSend } from 'react-icons/io'
import { LoadingOutlined } from '@ant-design/icons'

const antIcon = <LoadingOutlined style={{ fontSize: 40, color: 'white' }} spin />

const Message = ({ chat, teamid, loader, myMessage, setMyMessage, onSendMessage, onimagesend }) => {
  const messagesEndRef = useRef(null)
  const sortedChat = chat?.slice()?.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sortedChat?.length])

  const isMine = (message) => message?.from?._id === teamid

  // Group consecutive messages from same sender
  const getPosition = (messages, index) => {
    if (!messages) return 'single'
    const curr = messages[index]
    const prev = messages[index - 1]
    const next = messages[index + 1]
    const samePrev = prev && isMine(prev) === isMine(curr)
    const sameNext = next && isMine(next) === isMine(curr)
    if (samePrev && sameNext) return 'middle'
    if (samePrev) return 'last'
    if (sameNext) return 'first'
    return 'single'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  return (
    <div className='dmc-container'>
      {/* Messages area */}
      <div className='dmc-messages-area'>
        <Spin spinning={loader} size='large' indicator={antIcon} className='dmc-spinner' />

        {(!sortedChat || sortedChat.length === 0) && !loader && (
          <div className='dmc-empty-state'>
            <div className='dmc-empty-icon'>
              <svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='rgba(40,159,201,0.4)' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
              </svg>
            </div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}

        {sortedChat?.map((message, i) => {
          const mine = isMine(message)
          const position = getPosition(sortedChat, i)
          const showTime = position === 'last' || position === 'single'

          return (
            <div
              key={i}
              className={`dmc-bubble-row ${mine ? 'dmc-mine' : 'dmc-theirs'}`}
            >
              <div className={`dmc-bubble dmc-${position} ${mine ? 'dmc-bubble-mine' : 'dmc-bubble-theirs'}`}>
                {message.media_url ? (
                  <div className='dmc-media'>
                    <Image width={200} src={message.media_url} alt='Media' style={{ borderRadius: '8px' }} />
                  </div>
                ) : (
                  <span className='dmc-text'>{message.message}</span>
                )}
                {showTime && (
                  <span className='dmc-time'>
                    {moment(message.createdAt).format('h:mm A')}
                  </span>
                )}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className='dmc-input-area'>
        <div className='dmc-input-wrapper'>
          <input
            type='file'
            id='dmc-file-input'
            className='dmc-file-hidden'
            onChange={onimagesend}
          />
          <label htmlFor='dmc-file-input' className='dmc-attach-btn'>
            <AiOutlineCloudUpload />
          </label>
          <input
            type='text'
            className='dmc-text-input'
            placeholder='Type a message...'
            value={myMessage}
            onChange={(e) => setMyMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`dmc-send-btn ${myMessage?.trim() ? 'dmc-send-active' : ''}`}
            onClick={onSendMessage}
            disabled={!myMessage?.trim()}
          >
            <IoMdSend />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Message
