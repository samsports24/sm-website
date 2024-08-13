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
  


  const initialState = {
    // appendmessage: [],
    messages: [], 
    chatRooms: [],
  }
  
  const chatReducer = (state = initialState, action) => {
    const { type, payload } = action
    switch (type) {
        case 'APPEND_MESSAGE': {
          return {
            ...state,
            messages: [...state.messages, ...payload],
          }
        }
        case 'SEARCH_CHAT': {
            return {
              ...state,
              chatRooms: payload,
            }
          }

        default:
          return state
      }
    }
    
    export default chatReducer
    