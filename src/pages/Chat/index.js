import { useState, useEffect, useRef } from 'react'
import { Input, Badge, Typography, Button, Spin, Image, message, Mentions } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { AiOutlineCloudUpload } from 'react-icons/ai'
import { IoMdSend } from 'react-icons/io'
import { FaSearch, FaCaretDown, FaPaperclip } from 'react-icons/fa'
import Header from '../../components/Header'
import { LoadingOutlined } from '@ant-design/icons'
import { getChatRooms, getPreviousMessages, sendMessage } from '../../redux/actions/chatAction'
import Message from '../../components/Chat/Message'
import openSocket from 'socket.io-client'
import { base_url } from '../../config/constants'
import PersonalChatModal from '../../components/modal/PersonalChatModal'
import { getLeagueDetails } from '../../redux'
import Leaguechat from '../../components/Chat/Leaguechat'
import Loader from '../../components/Loader'
import { Option } from 'antd/es/mentions'
import { Picker } from 'emoji-mart'
import { clearNotification } from '../../redux/actions/notificationAction'

const antIcon = <LoadingOutlined style={{ fontSize: 40, color: 'white' }} spin />

const Chat = () => {
  const user = useSelector((state) => state.user.userDetails)
  const teamid = user?.team?._id
  const { Title } = Typography
  const [chat, setChat] = useState(null)
  const [myMessage, setMyMessage] = useState('')
  const [leagueMessage, setLeagueMessage] = useState([])
  const [sentleagueMessage, setSentLeagueMessage] = useState([])
  const [loader, setLoader] = useState(false)
  const roomId = localStorage.getItem('roomId')
  const leagueroomId = localStorage.getItem('leagueroom')

  // console.log('roomId',roomId);
  // let isVisible;

  const { socket } = useSelector((state) => state.socket)
  const searchChat = useSelector((state) => state?.chat?.chatRooms)
  const appendMessage = useSelector((state) => state?.chat?.appendmessages)
  const myleagueMessage = useSelector((state) => state?.chat?.leaguemessages)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const { currentLeague } = useSelector((state) => state.league)
  const [imagePreview, setImagePreview] = useState(null)
  const [isChatExpanded, setIsChatExpanded] = useState(true)

  const [messages, setMessages] = useState([])
  const [scrollToggle, setscrollToggle] = useState(true)
  const [rooms, setRooms] = useState([])
  const [vendorId, setVendorId] = useState('')
  const [matchedroom, setMatchedRoom] = useState(null)
  const [messageToggle, setMessageToggle] = useState('')
  const chatRef = useRef()
  const [image, setImage] = useState(null)
  const [dmloading, setDmLoading] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [selectedcount, setSelectedCount] = useState(false)

  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false)

  // useEffect(()=>{
  // clearNotification()
  // },[])

  //   useEffect(() => {
  //     console.log('searchChat', searchChat)
  //     console.log('selectedTeamId', selectedTeamId)

  // console.log('user?.team?._id',user?.team?._id);

  //     let matchedRoom = null

  //       searchChat?.map((room) => {
  //         console.log('room', room)

  //         // Ensure the room has exactly two applicants
  //         if (room.applicants.length == 2) {

  //           const [applicant1, applicant2] = room.applicants
  //           console.log('applicant1', applicant1)
  //           console.log('applicant2', applicant2)

  //           console.log('in teh map selectedTeamId', selectedTeamId)

  //           console.log('in the map user?.team?._id',user?.team?._id);

  //           // Compare IDs, assuming they are strings. Use `String` to ensure proper comparison.
  //           if (
  //             (applicant1._id == user?.team?._id && applicant2._id == selectedTeamId)

  //           ) {
  //             matchedRoom = room
  //           } else {
  //             matchedRoom = false
  //           }
  //         }

  //         // Return false if there are not exactly two applicants
  //         // return false;
  //       })

  //       console.log('matchedRoom', matchedRoom)
  //   }, [searchChat])

  // console.log('searchChat', searchChat)
  // console.log('appendMessage', appendMessage)
  // console.log('myleagueMessage', myleagueMessage)

  // console.log('currentLeague', currentLeague)

  // useEffect(async() => {
  //   console.log('searchChat', searchChat);
  //   console.log('selectedTeamId', selectedTeamId);
  //   console.log('user?.team?._id', user?.team?._id);

  //   // Use find to stop at the first match
  //   const foundRoom = searchChat?.find((room) => {
  //     console.log('room', room);

  //     // Ensure the room has exactly two applicants
  //     if (room.applicants.length == 2) {
  //       const [applicant1, applicant2] = room.applicants;
  //       console.log('applicant1', applicant1);
  //       console.log('applicant2', applicant2);
  //       console.log('in the find selectedTeamId', selectedTeamId);
  //       console.log('in the find user?.team?._id', user?.team?._id);

  //       // Compare IDs, ensuring strict equality
  //       return (
  //         (applicant1._id == user?.team?._id && applicant2._id == selectedTeamId) ||
  //         (applicant1._id == selectedTeamId && applicant2._id == user?.team?._id)
  //       );
  //     }

  //     // Return false if the room does not meet criteria
  //     return false;
  //   });

  //   // Update state with the matched room
  //   setMatchedRoom(foundRoom);
  //   console.log('foundRoom', foundRoom);

  //   if (foundRoom) {
  //     console.log('in the match');

  //     // Perform the series of actions after finding the room

  //     setChat(foundRoom._id)
  //     setVendorId(
  //       foundRoom.applicants.find((applicant) => applicant._id !== user?.team)?._id || '',
  //     )

  //     localStorage.setItem('roomId', foundRoom._id)
  //     const res = await getPreviousMessages(foundRoom._id)
  //     console.log('check', res)
  //     setMessages(res?.messages)
  //     setLoader(false)
  //     openModal()
  //   } else {
  //     console.error('No matching room found')
  //   }

  //   // Log the matched room
  //   // console.log('foundRoom', foundRoom);

  // }, [searchChat, selectedTeamId, user?.team?._id]);

  useEffect(() => {
    // Check if all required dependencies are available
    if (selectedcount) {
      // Define an async function inside useEffect
      const fetchData = async () => {
        try {
          console.log('searchChat', searchChat)
          console.log('selectedTeamId', selectedTeamId)
          console.log('user?.team?._id', user?.team?._id)

          // Use find to stop at the first match
          const foundRoom = searchChat.find((room) => {
            console.log('room', room)

            // Ensure the room has exactly two applicants
            if (room.applicants.length === 2) {
              const [applicant1, applicant2] = room.applicants
              console.log('applicant1', applicant1)
              console.log('applicant2', applicant2)
              console.log('in the find selectedTeamId', selectedTeamId)
              console.log('in the find user?.team?._id', user?.team?._id)

              // Compare IDs, ensuring strict equality
              return (
                (applicant1._id === user?.team?._id && applicant2._id === selectedTeamId) ||
                (applicant1._id === selectedTeamId && applicant2._id === user?.team?._id)
              )
            }

            // Return false if the room does not meet criteria
            return false
          })

          // Update state with the matched room
          setMatchedRoom(foundRoom)
          console.log('foundRoom', foundRoom)

          if (foundRoom) {
            console.log('in the match')

            // Perform the series of actions after finding the room
            setChat(foundRoom._id)
            setVendorId(
              foundRoom.applicants.find((applicant) => applicant._id !== user?.team?._id)?._id ||
                '',
            )

            localStorage.setItem('roomId', foundRoom._id)

            // Fetch previous messages
            const res = await getPreviousMessages(foundRoom._id)
            console.log('check', res)
            setMessages(res?.messages)

            // Set loader state and open modal
            setLoader(false)
            openModal()
          } else {
            console.error('No matching room found')
          }
        } catch (error) {
          console.error('Error fetching data:', error)
          setLoader(false) // Ensure loader is hidden in case of error
        }
      }

      // Call the async function
      fetchData()
    }

    // Optionally clear selectedTeamId after fetching data
    // setSelectedTeamId(null);
    // setSelectedCount(false)
  }, [searchChat, selectedTeamId, user?.team?._id, selectedcount])

  const toggleChatWidth = () => {
    setIsChatExpanded(!isChatExpanded)
  }

  const openModal = () => {
    setIsModalVisible(true)
    setSelectedCount(false)
    toggleChatWidth()
  }

  const closeModal = () => {
    setIsModalVisible(false)
    toggleChatWidth()
    localStorage.removeItem('roomId')
  }

  const myleague = async () => {
    await getLeagueDetails()
  }

  useEffect(() => {
    myleague()
  }, [])

  useEffect(() => {
    setLoader(true)
    // Ensure currentLeague and currentLeague.roomId are valid
    if (currentLeague && currentLeague.roomId) {
      // Set the roomId in localStorage
      localStorage.setItem('leagueroom', currentLeague.roomId)

      // Get the roomId from localStorage
      const leagueroom = localStorage.getItem('leagueroom')

      // Call getPreviousMessages with the retrieved roomId
      // Assuming getPreviousMessages is an async function
      const fetchPreviousMessages = async () => {
        try {
          const res = await getPreviousMessages(leagueroom)

          // console.log('hamza res',res);

          //    setLeagueMessage(res?.messages)
        } catch (error) {
          console.error('Error fetching previous messages:', error)
        }
      }

      fetchPreviousMessages()
      setLoader(false)
    }
  }, [currentLeague])

  // console.log('myy', leagueMessage)

  useEffect(() => {
    // if (chatRef.current) {
    //   chatRef.current.scrollTop = chatRef.current.scrollHeight
    // }
    chatRef?.current?.scrollIntoView({ behaviour: 'smooth' })
    console.log('🚀 ~ useEffect ~ chatRef:', chatRef)
  }, [messages])

  // const scrollBottom = () => {
  //    console.log("run....");
  //    console.log('chatRef',chatRef);

  //   if (chatRef?.current?.scrollTop)
  //     console.log('in this cosnoel');

  //     chatRef.current.scrollTop = chatRef?.current?.scrollHeight
  // }

  const scrollBottom = () => {
    console.log('run....')
    // if (chatRef.current) {
    //   console.log('chatRef', chatRef)

    //   chatRef.current.scrollTop = chatRef.current.scrollHeight
    // if (chatRef?.current?.scrollTop)
    //   chatRef.current.scrollTop = chatRef?.current?.scrollHeight;

    chatRef?.current?.scrollIntoView({ behaviour: 'smooth' })
    //   let lastItem = chatRef.current.lastChild;

    //  // then run this:

    //   lastItem?.scrollIntoView({
    //   behavior: "smooth",
    //   block: "end",
    //   inline: "nearest",
    //   });
  }

  // useEffect(() => {
  //   scrollBottom();
  // }, [scrollToggle]);
  useEffect(() => {
    scrollBottom()
  }, [leagueMessage])

  useEffect(() => {
    console.log('Setting up socket connection')

    // Initialize the socket connection
    const socket = openSocket(base_url, { transports: ['polling'] })

    // Function to handle joining rooms
    // const joinRoom = async (roomId) => {
    //   console.log('Joining room:', roomId)
    //   socket.emit('joinRoom', roomId)
    //   socket.on('Message', (data) => {
    //     console.log('Received message:', data)
    //     await getPreviousMessages(roomId)
    //     setscrollToggle(!scrollToggle)
    //     if (data.to === teamid) {
    //       setMessageToggle(data)
    //       setscrollToggle((prev) => !prev)
    //     }
    //   })
    // }
    const joinRoom = (roomId) => {
      console.log('Joining room:', roomId)
      socket.emit('joinRoom', roomId)
      socket.on('Message', async (data) => {
        console.log('Received message:', data)
        const res = await getPreviousMessages(roomId)
        console.log('hamza check', res)
        setMessages(res?.messages)
        setscrollToggle(!scrollToggle)
        if (data.to === teamid) {
          setMessageToggle(data)
          setscrollToggle((prev) => !prev)
        }
      })
    }

    const joinLeagueRoom = async (leagueroomId) => {
      console.log('Joining league room:', leagueroomId)

      // Ensure the socket is properly initialized and connected
      if (socket) {
        socket.emit('joinleagueRoom', leagueroomId)

        socket.on('Message', async (data) => {
          console.log('Received league message:', data)
          await getPreviousMessages(leagueroomId)
          // if (!isUserScrolling) {
          //   scrollBottom(); // Only scroll to bottom if the user is not manually scrolling
          // }
          //  scrollBottom()
          setscrollToggle(!scrollToggle)
          if (data.sender === teamid) {
            console.log('in the ifff')

            // Ensure getPreviousMessages is awaited
            //  await getPreviousMessages(leagueroomId);

            // Update state accordingly
            setSentLeagueMessage((prevMessages) => [...prevMessages, data])
            setMessageToggle(data)
            setscrollToggle((prev) => !prev)
          }
        })
      } else {
        console.error('Socket is not initialized.')
      }
    }

    // Join rooms if roomId or leagueroomId is available
    if (roomId) {
      joinRoom(roomId)
    }

    if (leagueroomId) {
      joinLeagueRoom(leagueroomId)
    }

    // Cleanup on component unmount
    return () => {
      console.log('Cleaning up socket')
      socket.emit('end')
      socket.disconnect()
    }
  }, [roomId, leagueroomId])

  const handleChatClick = async (teamId) => {
    console.log('teamId', teamId)

    setLoader(true)
    try {
      const payload = {
        to: teamId,
        message: 'Hello',
        from: user?.team?._id,
        league: user?.team?.currentLeague?._id,
      }

      setSelectedTeamId(teamId)
      setSelectedCount(true)
      const data = await sendMessage(payload)
      socket.emit('Message', payload)

      // await getChatRooms()
      // console.log('data',data);

      // const matchedRoom = searchChat?.find(room =>
      //   room.applicants.some(applicant =>
      //     applicant._id === user?.team?._id && applicant._id === teamId
      //   )
      // );

      // console.log('ggfg teamId', teamId)
      // console.log('user?.team?._id', user?.team?._id)

      // console.log('searchChat',searchChat.length)

      // const matchedRoom =  {

      //   return searchChat.find((room) => {
      //     if (room.applicants.length !== 2) return false

      //     const ids = room.applicants.map((applicant) => applicant._id)
      //     return ids.includes(user?.team?._id) && ids.includes(item?._id)
      //   })
      // }

      // setMatchedRoom(matchedRoom?.applicants[1]?.name)
      // console.log('matchedroom',matchedroom);
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoader(false) // Ensure loader is turned off after completion
    }
  }

  const handleopenmodal = async (room) => {
    console.log('room', room)
    setLoader(true)

    await getChatRooms()
    if (room) {
      // Perform the series of actions after finding the room

      setChat(room._id)
      setVendorId(room.applicants.find((applicant) => applicant._id !== user?.team?._id)?._id || '')

      localStorage.setItem('roomId', room._id)

      const res = await getPreviousMessages(room._id)
      console.log('check', res)
      setMessages(res?.messages)

      await getChatRooms()
      openModal()
      setLoader(false)
    }
  }

  const handleSendMessage = async () => {
    setDmLoading(true)
    if (myMessage.trim() === '') return

    const payload = {
      to: vendorId,
      message: myMessage,
      room_id: roomId,
      from: teamid,
    }

    console.log('payload', payload)

    try {
      await sendMessage(payload)
      socket.emit('Message', payload)

      // setMessages((prevMessages) => [
      //   ...prevMessages,
      //   {
      //     createdAt: Date.now(),
      //     from: teamid,
      //     is_read: false,
      //     message: myMessage,
      //     room_id: roomId,
      //     to: vendorId,
      //     updatedAt: Date.now(),
      //     __v: 0,
      //     _id: Date.now().toString(), // Replace with your unique ID logic
      //   },
      // ])

      scrollBottom()
      console.log('messages chekc here ', message)

      setMyMessage('')
      setDmLoading(false)
      chatRef.current.scrollTop = chatRef.current.scrollHeight // Ensure scrolling to bottom
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleleagueSendMessage = async () => {
    setLoader(true)
    if (leagueMessage.trim() === '') return

    const payload = {
      sender: teamid,
      message: leagueMessage,
      room_id: currentLeague?.roomId,
    }

    console.log('payload',payload)

    try {
      await sendMessage(payload) // Call the API to send the message
      socket.emit('joinleagueRoom', payload) // Emit the message via socket
      chatRef?.current?.scrollIntoView({ behaviour: 'smooth' })

      //  leagueMessage((prevMessages) => [
      //      ...prevMessages,
      //     {
      //       createdAt: Date.now(),
      //       from: teamid,
      //       is_read: false,
      //       message: leagueMessage,
      //       room_id: currentLeague?.roomId,
      //       // to: vendorId,
      //       updatedAt: Date.now(),
      //       __v: 0,
      //       _id: Date.now().toString(), // Replace with your unique ID logic
      //     },
      //   ]);

      console.log('messages chekc here ', message)

      //  chatRef.current.scrollTop = chatRef.current.scrollHeight // Ensure scrolling to bottom
      scrollBottom()
      setLeagueMessage('')
      setLoader(false)

      // setMyMessage('');
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const sendImage = async (e) => {
    setLoader(true)
    const file = e.target.files[0]
    console.log('file', file)

    if (!file) return

    const obj = URL.createObjectURL(file)
    const formData = new FormData()
    formData.append('pictures', file)
    // formData.append('sender', teamid)
    // formData.append('room_id', roomId)
    formData.append('sender', String(teamid)) // Ensure teamid is a string
    formData.append('room_id', String(leagueroomId)) // Ensure roomId is a strin

    await sendMessage(formData) // Make sure this function is defined and handles the FormData correctly
    socket.emit('joinleagueRoom', formData)
    setLoader(false)

    // Emit the message to the server via socket (ensure payload is correctly defined)
    // socket.emit('sendImage', {
    //   roomId,
    //   sender,
    //   media_url: obj, // Provide the URL created for the image
    // });

    // await sendMessage(formData) // Call the API to send the message
    // socket.emit('joinleagueRoom', payload) // Emit the message via socket

    // socket.emit('sendImage', formData) // Emit image data to the server

    // setMessages((prevMessages) => [
    //   ...prevMessages,
    //   {
    //     createdAt: Date.now(),
    //     from: teamid,
    //     is_read: false,
    //     message: '', // Empty message since it's an image
    //     room_id: roomId,
    //     to: vendorId,
    //     updatedAt: Date.now(),
    //     media_url: obj,
    //     __v: 0,
    //     _id: Date.now().toString(), // Replace with your unique ID logic
    //   },
    // ])
  }

  const sendDMImage = async (e) => {
    setLoader(true)
    // console.log('in the oncoe');
    // console.log('image',image);

    const file = e.target.files[0]
    console.log('file', file)

    if (!file) return

    const obj = URL.createObjectURL(file)
    const formData = new FormData()
    formData.append('pictures', file)
    // formData.append('sender', teamid)
    // formData.append('room_id', roomId)
    // from: teamid,
    // to: vendorId,
    formData.append('from', String(teamid)) // Ensure teamid is a string
    formData.append('room_id', String(roomId)) // Ensure roomId is a strin
    formData.append('to', String(vendorId)) // Ensure roomId is a strin

    await sendMessage(formData) // Make sure this function is defined and handles the FormData correctly
    socket.emit('Message', payload)
    setLoader(false)

    // formData.delete('pictures');
    // formData.delete('from');
    // formData.delete('room_id');
    // formData.delete('to');

    // Emit the message to the server via socket (ensure payload is correctly defined)
    // socket.emit('sendImage', {
    //   roomId,
    //   sender,
    //   media_url: obj, // Provide the URL created for the image
    // });

    // await sendMessage(formData) // Call the API to send the message
    // socket.emit('joinleagueRoom', payload) // Emit the message via socket

    // socket.emit('sendImage', formData) // Emit image data to the server

    // setMessages((prevMessages) => [
    //   ...prevMessages,
    //   {
    //     createdAt: Date.now(),
    //     from: teamid,
    //     is_read: false,
    //     message: '', // Empty message since it's an image
    //     room_id: roomId,
    //     to: vendorId,
    //     updatedAt: Date.now(),
    //     media_url: obj,
    //     __v: 0,
    //     _id: Date.now().toString(), // Replace with your unique ID logic
    //   },
    // ])
  }

  const searchUserChat = async (name) => {
    if (name !== '') {
      const filteredRooms = rooms.filter((room) =>
        room?.vendor[0]?.name.toLowerCase().includes(name.toLowerCase()),
      )
      setRooms(filteredRooms)
    } else {
      const rooms = await getChatRooms()
      setRooms(rooms.chat_rooms)
    }
  }

  const findRoom = (searchChat, user, item) => {
    // console.log('check searchChat', searchChat);
    // console.log('check user', user?.team?._id);
    // console.log('check item', item?._id);

    return searchChat?.find((room) => {
      if (room.applicants.length !== 2) return false

      const ids = room.applicants?.map((applicant) => applicant._id)
      return ids.includes(user?.team?._id) && ids.includes(item?._id)
    })
  }

  const handleChange = (value) => {
    setLeagueMessage(value)
  }

  const handlePressEnter = (e) => {
    if (e.key === 'Enter') {
      handleLeagueSendMessage()
    }
  }

  const handleEmojiSelect = (emoji) => {
    setLeagueMessage((prevMessage) => prevMessage + emoji.native)
    setEmojiPickerVisible(false) // Hide the emoji picker after selection
  }

  return (
    <>
      <Header />

      <div className={`main-chat ${isChatExpanded ? 'expanded' : 'collapsed'}`}>
        <div className={loader ? 'messages shade' : 'messages'}>
          {/* <Spin spinning={loader} size='large' indicator={antIcon} className='spinner' /> */}
          <div className='chat-container'>
            <p>{currentLeague.name} League Chat</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <div style={{ width: '90%' }} className='league chat'>
              {loader ? (
                <Loader />
              ) : (
                <Leaguechat chatRef={chatRef} chat={myleagueMessage} teamid={teamid} />
              )}
            </div>

            {/* <div className='allteams'>
        {searchChat && searchChat.length > 0 && currentLeague?.teams
          ?.filter((item) => item._id !== user?.team?._id)
          .map((item) => {
            const room = searchChat.find((room) =>
              room.applicants.length === 2 &&
              room.applicants.some((applicant) => 
                applicant._id === user?.team?._id && applicant._id === item._id || item._id && applicant._id === user?.team?._id
              )
            );

            return (
              <div key={item._id} className='team-item'>
                <div
                  onClick={async() => {
                    // await getChatRooms(item._id)
                    if (room) {
                      console.log('in the if');
                      
                      handleopenmodal(room);
                    } else {
                      console.log('in the else');
                      handleChatClick(item._id);
                     
                    }
                  }}
                  className='team-name-container'
                >
                  {room && String(roomId) !== String(room._id) && (
                    <Badge className='team-badge' count={room?.unread_count} />
                  )}
                  <div className='team-name'>
                    <div className='image-wrapper'>
                      <Image
                        width={50}
                        preview={false}
                        src={item?.logo}
                        alt='logo'
                        className='team-logo'
                      />
                      <div className='tooltip'>{item?.name}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div> */}

            <div className='allteams'>
              {currentLeague?.teams
                ?.filter((item) => item._id !== user?.team?._id) // Filter out the user's team
                .map((item) => {
                  // Use a variable to store the result of `findRoom`
                  // const room = findRoom(searchChat, user, item);
                  return (
                    <div key={item._id} className='team-item'>
                      <div
                        onClick={async () => {
                          // Find the room for the clicked item
                          const currentRoom = findRoom(searchChat, user, item)
                          console.log('currentRoom', currentRoom)
                          if (currentRoom) {
                            console.log('in the if')
                            handleopenmodal(currentRoom)
                          } else {
                            console.log('in the else')
                            handleChatClick(item._id)
                          }
                        }}
                        className='team-name-container'
                      >
                        {/* Only show Badge if `currentRoom` is found and `roomId` is not equal to the found room's ID */}
                        {findRoom(searchChat, user, item) &&
                          String(roomId) !== String(findRoom(searchChat, user, item)?._id) && (
                            <Badge
                              className='team-badge'
                              count={findRoom(searchChat, user, item)?.unread_count}
                            />
                          )}
                        <div className='team-name'>
                          <div className='image-wrapper'>
                            <Image
                              width={50}
                              preview={false}
                              src={item?.logo}
                              alt='logo'
                              className='team-logo'
                            />
                            {/* <div className='tooltip'>{item?.name}</div> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          <div className='bottom-button'>
            <Button
              icon={<FaCaretDown />}
              shape='circle'
              onClick={scrollBottom}
              style={{ color: '#fff', background: '#323739', marginLeft: '5px' }}
            />
          </div>

          <div className='send-message'>
            <div className='send-message-container'>
              <Mentions
                style={{ background: 'transparent' }}
                value={leagueMessage}
                onChange={handleChange}
                onSelect={(option) => console.log('Mentions selected:', option)}
                placeholder='Send message...'
                onKeyDown={handlePressEnter}
              >
                {currentLeague?.teams
                  ?.filter((item) => item._id !== user?.team?._id) // Filter out the user's team
                  .map((item) => (
                    <Option key={item._id} value={item.name}>
                      {item.name}
                    </Option>
                  ))}
              </Mentions>

              {/* <Input
                placeholder='send message...'
                value={leagueMessage}
               onChange={(e) => setLeagueMessage(e.target.value)}
                   onPressEnter={handleleagueSendMessage} 
               
    /> */}

              <div className='action-icons'>
                <input
                  type='file'
                  id='fileInp'
                  className='upload-img'
                  onChange={sendImage}
                  style={{ display: 'none' }} // Hide the default file input
                />
                <label htmlFor='fileInp'>
                  <AiOutlineCloudUpload style={{ marginRight: '10px' }} />
                </label>
                <IoMdSend onClick={handleleagueSendMessage} />

                {imagePreview && (
                  <div style={{ marginLeft: '10px' }}>
                    <img
                      src={imagePreview}
                      alt='Preview'
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PersonalChatModal
        visible={isModalVisible}
        onClose={closeModal}
        chat={messages}
        teamid={teamid}
        // teamname={matchedroom}
        teamname={user?.team?.name}
        loader={loader}
        // teamname={teamname}
        setLoader={setLoader}
        messages={messages}
        setMessages={setMessages}
        myMessage={myMessage}
        setMyMessage={setMyMessage}
        onSendMessage={handleSendMessage}
        onimagesend={sendDMImage}
        image={image}
        setimage={setImage}
        dmloading={dmloading}
        setDmLoading={setDmLoading}
      />
    </>
  )
}

export default Chat
