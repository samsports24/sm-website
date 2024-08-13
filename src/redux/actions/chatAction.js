import { notification } from 'antd'
import { attachToken, privateAPI, publicAPI, serverUrls } from '../../config/constants'
import store from '../store'
import { getUser } from './authActions'
import axios from 'axios'

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
      payload,
    }
  }

  export const searchChat = (payload) => {
    return {
      type: 'SEARCH_CHAT',
      payload,
    }
  }



export const getPreviousMessages = async (roomId) => {
    console.log('roomId', roomId)
    try {
      attachToken()
      const res = await privateAPI.get(`/chat/user/get/${roomId}?page=1&perPage=10000`)
      store.dispatch(appendMessage(res.data.data))
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
      const res = await privateAPI.post(`/chat/user/send`, payload)
      if (res) {
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
      store.dispatch(searchChat(res.data.data))
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
