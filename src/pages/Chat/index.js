import { useState, useEffect, useRef } from "react";
import { Input, Badge, Typography, Button, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { IoMdSend } from "react-icons/io";
import { FaSearch, FaCaretDown, FaPaperclip } from "react-icons/fa";
import openSocket from "socket.io-client";

// import bubble from "../assets/bubble.png";
// import Message from "../components//Chat/Message";

import { LoadingOutlined } from "@ant-design/icons";
// import Layout from "./../layout/Layout";
// import { base_url } from "../API/fetch";
import { getChatRooms, getPreviousMessages, sendMessage } from "../../redux/actions/chatAction";
import { base_url } from "../../config/constants";
import Message from "../../components/Chat/Message";

const antIcon = (
  <LoadingOutlined style={{ fontSize: 40, color: "white" }} spin />
);

const Chat = ({}) => {
  const { Title } = Typography;
  const [chat, setChat] = useState(null);
  const [myMessage, setMyMessage] = useState("");
  const [loader, setLoader] = useState(false);
  const roomId = localStorage.getItem("roomId");
  const userId = localStorage.getItem("userId");
 

  const [messages, setMessages] = useState(null);

  const [messageToggle, setMessageToggle] = useState("");
  const [scrollToggle, setscrollToggle] = useState(true);

  const [rooms, setRooms] = useState(null);
  const [vendorId, setVendorId] = useState("");

  const chatRef = useRef();

  const dispatch = useDispatch();

  useEffect(() => {
    if (messageToggle !== "") {
      let tempMessages = JSON.parse(JSON.stringify(messages));
      tempMessages.docs.push(messageToggle);
      setMessages(tempMessages);
      setscrollToggle(!scrollToggle);
    }
  }, [messageToggle]);

  useEffect(() => {
    scrollBottom();
  }, [scrollToggle]);

  useEffect(async () => {
    const rooms = await getChatRooms();
    setRooms(rooms.chat_rooms);

    const socket = openSocket(base_url, {
      transports: ["polling"],
    });
    if (roomId) {
      socket.emit("joinRoom", roomId);
      socket.on("Message", async (data) => {
        const rooms = await getChatRooms();
        setRooms(rooms.chat_rooms);
        if (data.to === userId) setMessageToggle(data);
        // console.log("from socket", data);
        setscrollToggle(!scrollToggle);
      });
    }
    return () => {
      socket.emit("end");
    };
  }, [roomId]);

  const scrollBottom = () => {
    // console.log("run....");
    if (chatRef?.current?.scrollTop)
      chatRef.current.scrollTop = chatRef?.current?.scrollHeight;
  };

  const sendImage = async (e) => {
    let obj = URL.createObjectURL(e.target.files[0]);
    const roomId = localStorage.getItem("roomId");

    await setMessageToggle({
      createdAt: Date.now(),
      from: userId,
      is_read: false,
      message: myMessage,
      room_id: roomId,
      to: vendorId,
      updatedAt: Date.now(),
      media_url: obj || null,
      __v: 0,
      // _id: "6243a3c0560bb5bbf4df61bc",
    });
    scrollBottom();
    let formData = new FormData();
    formData.append("pictures", e.target.files[0]);
    formData.append("to", vendorId);
    formData.append("room_id", chat);
    await sendMessage(formData);
  };

  const searchUserChat = async (name) => {
    if (name !== "") {
      const newRooms = rooms.filter((room) => {
        return room?.vendor[0]?.name.toLowerCase().includes(name.toLowerCase());
        //  ||
        // room?.admin[0]?.name.toLowerCase().includes(name.toLowerCase())
      });
      setRooms(newRooms);
      //   dispatch(searchChat(newRooms));
    } else {
      const rooms = await getChatRooms();
      setRooms(rooms.chat_rooms);
    }
  };

  return (
    // <Layout text={["chat"]}>
      <div className="main-chat">
        <div className="users">
          <Input
            className="search-users-inp"
            placeholder="search users chats"
            allowClear
            onChange={(e) => searchUserChat(e.target.value)}
            prefix={<FaSearch style={{ marginRight: " 5px" }} />}
          />

          {rooms &&
            rooms.length > 0 &&
            rooms.map((room) => (
              <div
                className={chat === room._id ? "user user-active" : "user"}
                key={room._id}
                onClick={async () => {
                  setLoader(true);
                  setChat(room._id);
                  setVendorId(
                    room.vendor.length > 0
                      ? room.vendor[0]?._id
                      : room.user[0]?._id
                  );
                  localStorage.setItem("roomId", room._id);
                  const message = await getPreviousMessages(room._id);
                  setMessages(message.messages);
                  const rooms = await getChatRooms();
                  setRooms(rooms.chat_rooms);
                  setLoader(false);
                  chatRef.current.scrollTop = chatRef?.current?.scrollHeight;
                }}
              >
                <div className="user-container">
                  <div className="user-name-msg">
                    <div>
                      {/* console.log("166", room) */}
                      <Title level={5}>{room.vendor[0]?.name}</Title>
                      {/* <p level={5}>
                        {room.last_message ? (
                          room.last_message
                        ) : (
                          <>
                            <FaPaperclip /> Attachment
                          </>
                        )}
                      </p> */}
                      <p>
  {room.last_message ? (
    room.last_message
  ) : (
    <>
      <FaPaperclip /> Attachment
    </>
  )}
</p>

                    </div>
                    {roomId !== room._id && <Badge count={room.unread_count} />}
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className={loader ? "messages shade" : "messages"}>
          <Spin
            spinning={loader}
            size="large"
            indicator={antIcon}
            className="spinner"
          />
          <div ref={chatRef} id="chatBottom" className="chat-container">
            <Message chat={messages && messages?.docs} />
          </div>
          {messages !== null && (
            <div className="bottom-button">
              <Button
                icon={<FaCaretDown />}
                shape="circle"
                onClick={scrollBottom}
                style={{
                  // color: colors["primary-color"],
                  color: "#fff",
                  background: "#323739",
                  marginLeft: "5px",
                }}
              />
            </div>
          )}
          {messages === null ? (
            <div className="no-room">
              {/* <img src={bubble} /> */}
              <Title level={4}>Select room to start chat</Title>
            </div>
          ) : (
            <div className="send-message">
              <div className="send-message-container">
                <Input
                  placeholder="send message..."
                  value={myMessage}
                  onChange={(e) => setMyMessage(e.target.value)}
                  onPressEnter={async (e) => {
                    if (myMessage !== "") {
                      setChat(roomId);
                      let payload = {
                        to: vendorId,
                        message: e.target.value,
                        room_id: chat,
                      };
                      myMessage !== "" && (await sendMessage(payload));
                      setMessageToggle({
                        createdAt: Date.now(),
                        from: userId,
                        is_read: false,
                        message: e.target.value,
                        room_id: roomId,
                        to: vendorId,
                        updatedAt: Date.now(),
                        __v: 0,
                        _id: "6243a3c0560bb5bbf4df61bc",
                      });
                      setMyMessage("");
                    }
                    scrollBottom();
                  }}
                />
                <div className="action-icons">
                  <input
                    type="file"
                    id="fileInp"
                    className="upload-img"
                    onChange={(e) => sendImage(e)}
                  />

                  <label htmlFor="fileInp">
                    <AiOutlineCloudUpload
                      style={{ marginRight: "10px", display: "flex" }}
                    />
                  </label>
                  <IoMdSend
                    onClick={async () => {
                      if (myMessage !== "") {
                        setChat(roomId);
                        let payload = {
                          to: vendorId,
                          message: myMessage,
                          room_id: chat,
                        };
                        myMessage !== "" && (await sendMessage(payload));
                        setMessageToggle({
                          createdAt: Date.now(),
                          from: userId,
                          is_read: false,
                          message: myMessage,
                          room_id: roomId,
                          to: vendorId,
                          updatedAt: Date.now(),
                          __v: 0,
                          _id: "6243a3c0560bb5bbf4df61bc",
                        });
                        setMyMessage("");
                      }
                      scrollBottom();
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    // </Layout>
  );
};

export default Chat;
