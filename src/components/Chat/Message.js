
import moment from "moment";
// import { imageUrl } from "../../Util";
import { Image } from "antd";


const Message = ({ chat }) => {
  const id = localStorage.getItem("userId");
  // useEffect(() => {}, [chat]);

  return (
    <div style={{ width: "100%" }}>
      {chat &&
        chat.map((message, i) => {
          // const imageFinal = `${imageUrl}/${message?.media_url}`;

          return (
            <div key={i} className={message.from !== id ? "chats-sender" : "chats-my"}>
              <div
                key={i}
                className={
                  message.from !== id ? "sender-messages" : "my-messages"
                }
              >
                <span>
                  {message.media_url ? (
                    <Image
                      width={"150px"}
                      // src={`${imageUrl}/${message?.media_url}`}
                      src={`${message?.media_url}`}
                      // src={`https://env-backend.herokuapp.com/uploads/chatImage-1637093118170.png`}
                    />
                  ) : (
                    // <img
                    //   src={`https://env-backend.herokuapp.com/uploads/chatImage-1637093118170.png`}
                    //   width="150px"
                    // />
                    // <img
                    //   src={`${imageUrl}/${message.media_url}`}
                    //   width="150px"
                    // />
                    message.message
                  )}
                  <br />
                  <span
                    style={{
                      color: "#d6d6d6",
                      fontSize: "0.8em",
                      display: "flex",
                      float: "right",
                    }}
                  >
                    {moment(message.createdAt).format("D MMM YY:h:mm a")}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
    </div>
  );
};
export default Message;
