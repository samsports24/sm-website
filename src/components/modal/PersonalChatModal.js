import React from 'react';
import { Modal } from 'antd';
import Message from '../Chat/Message';
import "../../styles/modals/dmchatmodal.css"


const PersonalChatModal = ({ visible, onClose, chat, teamid,teamname,loader,myMessage,setMyMessage,onSendMessage,onimagesend,image,setImage}) => {

    // console.log('check chat',chat[0]?.to?.name);
     console.log('teamname',teamname);
    
    const displayName = chat[0]?.to?.name === teamname ? chat[1]?.to?.name : chat[0]?.to?.name;
    console.log('displayName',displayName);
    
    
  return (
    <Modal
      title={displayName}
      visible={visible}
      className='dmchatmodal'
      onCancel={onClose}
      footer={null}
    //    style={{height:'200px',overflow:'scroll',bottom:90}}
    bodyStyle={{ padding: 0 }}
      width={600} // Adjust the width as needed
    //   style={{ top: 20 }}
    >
    
      <Message chat={chat} teamid={teamid} loader={loader} myMessage={myMessage}
         setMyMessage={setMyMessage} onSendMessage={onSendMessage} onimagesend={onimagesend}
         image={image}
         setimage={setImage}
         
        />
    </Modal>
  );
};

export default PersonalChatModal;
