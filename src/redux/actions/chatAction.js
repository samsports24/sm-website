import { notification } from 'antd'
import { attachToken, privateAPI, publicAPI, serverUrls } from '../../config/constants'
import store from '../store'

// export const getPreviousMessages = async (roomId) => {
//   try {
//     // const [, roomId, page] = queryKey || "";
//     const { data } = await privateAPI.get(
//       `/chat/user/get/${roomId}?page=1&perPage=10000`
//     );
//     return data;
//   } catch (e) {
//     // console.log(`e`, e);
//   }
// };


// export const appendMessage = (obj, roomId) => async (dispatch) => {
//     const room = localStorage.getItem("roomId");
//     if (room === roomId) {
//       dispatch({
//         type: "APPEND_MESSAGE",
//         payload: obj,
//       });
//     }
//   };
//   export const searchChat = (payload) => async (dispatch) => {
//     dispatch({
//       type: "SEARCH_CHAT",
//       payload,
//     });
//   };


  export const appendMessage = (payload) => {
    return {
      type: 'APPEND_MESSAGE',
      payload:payload
    }
  }

  
  export const leagueMessage = (payload) => {
    return {
      type: 'LEAGUE_MESSAGE',
      payload:payload
    }
  }



  export const searchChat = (payload) => {
    return {
      type: 'SEARCH_CHAT',
      payload:payload
    }
  }



export const getPreviousMessages = async (roomId) => {
  console.log('going there');
  
    //  console.log('roomId', roomId)
    try {
      attachToken()
      const res = await privateAPI.get(`/chat/user/get/${roomId}?page=1&perPage=10000`)
      // store.dispatch(appendMessage(res.data.data))
      const messages = res.data.data.messages;
      console.log('res',res.data.data.messages)
       store.dispatch(appendMessage(messages))
       console.log('messages',messages);
       
       const filteredMessages = messages.filter(message => message.sender && typeof message.sender === 'object');

       console.log('filteredMessages',filteredMessages);
       
       // If there are any filtered messages, dispatch leagueMessage
       if (filteredMessages.length > 0) {
         store.dispatch(leagueMessage(filteredMessages));
       }
       await getChatRooms()
      return res.data.data
    } catch (err) {
      notification.error({
        message: err?.response?.data?.message || 'Server Error',
        duration: 3,
      })
    }
  }





export const sendMessage = async (payload) => {
    console.log('in the action', payload)
    try {
      attachToken()
      const res = await privateAPI.post('/chat/user/send', payload)
      if (res) {
        console.log('res',res);
        await getChatRooms()
        await getPreviousMessages(payload.room_id)
        
        // store.dispatch(getClubhouse(payload))
        // await getClubhouse(payload)
        notification.success({
          description: res.data.data.message,
          duration: 2,
        })
    
        // store.dispatch(getUser())
        // getLeagueDetails()
      }
    } catch (err) {
      console.log('err', err)
      notification.error({
        message: err?.response?.data?.message || 'Server Error',
        duration: 3,
      })
    }
  }


  export const getChatRooms = async () => {
    try {
      attachToken()
      const res = await privateAPI.get('/chat/user/chat-rooms')
      console.log('res.data.data',res.data.data.chat_rooms);
      
      store.dispatch(searchChat(res.data.data.chat_rooms))
      return res.data.data
    } catch (err) {
      notification.error({
        message: err?.response?.data?.message || 'Server Error',
        duration: 3,
      })
    }
  }

  

  // export const sendMessage = (payload) => {
//   try {
//     attachToken();
//     const { data } = privateAPI.post("/chat/user/send", payload);
//     return data;
//   } catch (e) {
//     // console.log(`e`, e);
//   }
// };

// export const getChatRooms = async () => {
//   try {
//     attachToken();
//     const { data } = await privateAPI.get("/chat/user/chat-rooms");
//     return data;
//   } catch (e) {
//     // console.log(`e`, e);
//   }
// };










// export const appendMessage = (obj, roomId) => async (dispatch) => {
//   const room = localStorage.getItem("roomId");
//   if (room === roomId) {
//     dispatch({
//       type: "APPEND_MESSAGE",
//       payload: obj,
//     });
//   }
// };
// export const searchChat = (payload) => async (dispatch) => {
//   dispatch({
//     type: "SEARCH_CHAT",
//     payload,
//   });
// };
