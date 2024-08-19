import React from 'react'
import moment from 'moment'
import { Image } from 'antd'

const Leaguechat = ({ chat, teamid, chatRef }) => {
  // Ensure chat is an array and is not null or undefined

  console.log('teamid', teamid)

  console.log('chat', chat)

  // Sort messages by creation date in ascending order
  const sortedChat = chat?.slice()?.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  return (
    <div ref={chatRef}  style={{ width: '100%', height: '800px', overflowY: 'auto' }}>
      {sortedChat.map((message, i) => (


        <div className='leaguemainchat' key={i}>
          <div>
            <Image
              width={50}
              preview={false}
              src={message?.sender?.logo}
              alt='logo'
              className='team-logo'
            />
          </div>

          <div className={message?.sender?._id !== teamid ? 'otherteaminfo' : 'teaminfo'}>
            <h2>{message?.sender?.name}</h2>

            <span
              className='mymessages'
              // className={message.sender._id !== teamid ? 'mymessages' : 'othermessage'}
            >
              {message?.media_url ? (
                <Image width={180} height={180} src={message.media_url} alt='Message Media' />
              ) : (
                message.message
              )}
              <br />
              <span
                style={{
                  color: '#d6d6d6',
                  fontSize: '0.8em',
                  display: 'flex',
                  float: 'right',
                }}
              >
                {moment(message.createdAt).format('D MMM YY:h:mm a')}
              </span>
            </span>
          </div>

          {/* <image width={80} src={message?.sender.logo}></image> */}

          {/* <div style={{display:'flex',flexDirection:'row'}}>
            <div>
            <Image
                  width={50}
                  preview={false}
                  src={message?.sender.logo}
                  alt='logo'
                  className='team-logo'
                />
       
            </div>
           
            </div> */}
        </div>
      ))}
    </div>
  )
}

export default Leaguechat
