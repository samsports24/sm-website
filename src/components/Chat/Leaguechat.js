import React from 'react'
import moment from 'moment'
import { Image } from 'antd'

const Leaguechat = ({ chat, teamid, chatRef }) => {
  // Ensure chat is an array and is not null or undefined

  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%?=~_|])|(\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%?=~_|])/gi;
  const mentionRegex = /@(\w+)/g;

  // Function to transform message text
  const transformMessageText = (text) => {
    // Replace URLs with <a> tags
    const urlText = text.replace(urlRegex, (url) => {
      const href = url.startsWith('www') ? `https://${url}` : url;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    // Replace mentions with <span> tags
    const mentionText = urlText.replace(mentionRegex, (mention) => {
      return `<span style="font-weight: bold">${mention}</span>`;
    });

    // Convert the final HTML string to JSX
    return <span dangerouslySetInnerHTML={{ __html: mentionText }} />;
  };
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
                // message.message
                <span>{transformMessageText(message.message)}</span>
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
