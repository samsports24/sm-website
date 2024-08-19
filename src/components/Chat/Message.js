
// import moment from "moment";
// // import { imageUrl } from "../../Util";
// import { Image } from "antd";


// const Message = ({ chat,teamid }) => {
//   const id = localStorage.getItem("userId");
//   console.log('in the chat',teamid);
  
//   // useEffect(() => {}, [chat]);

//   return (
//     <div style={{ width: "100%" }}>
//       {chat &&
//         chat.map((message, i) => {
//           // const imageFinal = `${imageUrl}/${message?.media_url}`;

//           return (
//             <div key={i} className={message.from !== teamid ? "chats-sender" : "chats-my"}>
//               <div
//                 key={i}
//                 className={
//                   message.from !== teamid ? "sender-messages" : "my-messages"
//                 }
//               >
//                 <span>
//                   {message.media_url ? (
//                     <Image
//                       width={"150px"}
//                       // src={`${imageUrl}/${message?.media_url}`}
//                       src={`${message?.media_url}`}
//                       // src={`https://env-backend.herokuapp.com/uploads/chatImage-1637093118170.png`}
//                     />
//                   ) : (
//                     // <img
//                     //   src={`https://env-backend.herokuapp.com/uploads/chatImage-1637093118170.png`}
//                     //   width="150px"
//                     // />
//                     // <img
//                     //   src={`${imageUrl}/${message.media_url}`}
//                     //   width="150px"
//                     // />
//                     message.message
//                   )}
//                   <br />
//                   <span
//                     style={{
//                       color: "#d6d6d6",
//                       fontSize: "0.8em",
//                       display: "flex",
//                       float: "right",
//                     }}
//                   >
//                     {moment(message.createdAt).format("D MMM YY:h:mm a")}
//                   </span>
//                 </span>
//               </div>
//             </div>
//           );
//         })}
//     </div>
//   );
// };



// export default Message;

import React, { useState } from 'react';
import moment from 'moment';
import { Button, Image, Input, Spin } from 'antd';
import { FaCaretDown } from 'react-icons/fa';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { IoMdSend } from 'react-icons/io';
import { LoadingOutlined } from '@ant-design/icons'


const antIcon = <LoadingOutlined style={{ fontSize: 40, color: 'white' }} spin />
const Message = ({ chat, teamid,loader,myMessage,setMyMessage,onSendMessage,onimagesend,image,setImage }) => {
  // Ensure chat is an array and is not null or undefined
 

  // Sort messages by creation date in ascending order
  const sortedChat = chat?.slice()?.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const handleInputChange = (e) => {
    setMyMessage(e.target.value);
  };

  // console.log('sortedChat',sortedChat);
  


  const handleimageInputChange = (e) => {
    console.log('here chekc');
    
    setImage (e.target.files[0])
    onimagesend(setImage)
  };


  return (
    <>
   
      {sortedChat?.map((message, i) => (
        <>
        <div
          key={i}
          className={message.from._id !== teamid ? 'chats-sender' : 'chats-my'}
        >
          <div
            className={
              message.from._id !== teamid ? 'sender-messages' : 'my-messages'
            }
          >


            <span>
              {message.media_url ? (
                <Image
                  width={150}
                  src={message.media_url}
                  alt="Message Media"
                />
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
        </div>
        </>
      ))}

   
<div className='dm-main-chat'>  

<div className={loader ? 'messages shade' : 'messages'}>
          <Spin spinning={loader} size='large' indicator={antIcon} className='spinner' />
          {/* <div ref={chatRef} className='chat-container'>
            <Leaguechat chat={messages} teamid={teamid} />
          </div> */}
          {/* <div className='bottom-button'>
            <Button
              icon={<FaCaretDown />}
              shape='circle'
              // onClick={() => chatRef.current.scrollTop = chatRef?.current?.scrollHeight}
              style={{ color: '#fff', background: '#323739', marginLeft: '5px' }}
            />
          </div> */}
          <div className='send-message'>
            <div className='send-message-container'>
              <Input
                placeholder='send message...'
                value={myMessage}
                 onChange={(e) => setMyMessage(e.target.value)}
               // onChange={handleInputChange}
                onPressEnter={handleInputChange}
              />
              <div className='action-icons'>
                <input
                  type='file'
                  id='newfileInp'
                  className='upload-img'
                //  onChange={handleimageInputChange}
                    onChange={onimagesend}
                  // onChange={(e) => setimage(e.target.value)}
                />


                <label htmlFor='newfileInp'>
                  <AiOutlineCloudUpload style={{ marginRight: '10px' }} />
                </label>
                <IoMdSend onClick={onSendMessage} />
              </div>
            </div>
          </div>
        </div>
        </div>
        </>
    
  );
};

export default Message;

