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
    appendmessages: [], 
    chatRooms: [],
    leaguemessages:[],
  }




  
  const chatReducer = (state = initialState, action) => {
    const { type, payload } = action
    switch (type) {
        case 'APPEND_MESSAGE': {
          return {
            ...state,
            appendmessages: payload,
          }
        }
        case 'SEARCH_CHAT': {
            return {
              ...state,
              chatRooms: payload,
            }
          }

          case 'LEAGUE_MESSAGE': {
            return {
              ...state,
              leaguemessages: payload,
            }
          }

        default:
          return state
      }
    }
    
    export default chatReducer
    