import { useState, useEffect, useRef } from 'react'
import { Badge, Button, Spin, Image, Mentions } from 'antd'
import { useSelector } from 'react-redux'
import { AiOutlineCloudUpload } from 'react-icons/ai'
import { IoMdSend } from 'react-icons/io'
import { FaCaretDown } from 'react-icons/fa'
import Header from '../../components/Header'
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'
import { getChatRooms, getPreviousMessages, sendMessage } from '../../redux/actions/chatAction'
import Message from '../../components/Chat/Message'
// Removed: openSocket / base_url, Chat now uses the shared Redux socket from App.js
import PersonalChatModal from '../../components/modal/PersonalChatModal'
import { getLeagueDetails } from '../../redux'
import Leaguechat from '../../components/Chat/Leaguechat'
import Loader from '../../components/Loader'
import { Option } from 'antd/es/mentions'
import { clearNotification } from '../../redux/actions/notificationAction'
import OnboardingGuide from '../../components/OnboardingGuide'

import '../../styles/pages/chat.css'

const antIcon = <LoadingOutlined style={{ fontSize: 40, color: 'white' }} spin />

const Chat = () => {
  const user = useSelector((state) => state.user.userDetails)
  const teamid = user?.team?._id
  const [chat, setChat] = useState(null)
  const [myMessage, setMyMessage] = useState('')
  const [leagueMessage, setLeagueMessage] = useState([])
  const [sentleagueMessage, setSentLeagueMessage] = useState([])
  const [loader, setLoader] = useState(false)
  const roomId = localStorage.getItem('roomId')
  const leagueroomId = localStorage.getItem('leagueroom')

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
  const [teamSearch, setTeamSearch] = useState('')
  const [activeView, setActiveView] = useState('league') // 'league' | teamId

  useEffect(() => {
    if (selectedcount) {
      const fetchData = async () => {
        try {
          const foundRoom = searchChat.find((room) => {
            if (room.applicants.length === 2) {
              const [applicant1, applicant2] = room.applicants
              return (
                (applicant1._id === user?.team?._id && applicant2._id === selectedTeamId) ||
                (applicant1._id === selectedTeamId && applicant2._id === user?.team?._id)
              )
            }
            return false
          })
          setMatchedRoom(foundRoom)
          if (foundRoom) {
            setChat(foundRoom._id)
            setVendorId(
              foundRoom.applicants.find((applicant) => applicant._id !== user?.team?._id)?._id || '',
            )
            localStorage.setItem('roomId', foundRoom._id)
            const res = await getPreviousMessages(foundRoom._id)
            setMessages(res?.messages)
            setLoader(false)
            openModal()
          } else {
            console.error('No matching room found')
          }
        } catch (error) {
          console.error('Error fetching data:', error)
          setLoader(false)
        }
      }
      fetchData()
    }
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
    if (currentLeague && currentLeague.roomId) {
      localStorage.setItem('leagueroom', currentLeague.roomId)
      const leagueroom = localStorage.getItem('leagueroom')
      const fetchPreviousMessages = async () => {
        try {
          const res = await getPreviousMessages(leagueroom)
        } catch (error) {
          console.error('Error fetching previous messages:', error)
        }
      }
      fetchPreviousMessages()
      setLoader(false)
    }
  }, [currentLeague])

  useEffect(() => {
    chatRef?.current?.scrollIntoView({ behaviour: 'smooth' })
  }, [messages])

  const scrollBottom = () => {
    chatRef?.current?.scrollIntoView({ behaviour: 'smooth' })
  }

  useEffect(() => {
    scrollBottom()
  }, [leagueMessage])

  // Use the shared Redux socket (managed by App.js), no duplicate connection
  useEffect(() => {
    if (!socket) return

    // Join DM room if one is active
    if (roomId) {
      socket.emit('joinRoom', roomId)
    }
    // Join league room
    if (leagueroomId) {
      socket.emit('joinleagueRoom', leagueroomId)
    }

    // Handler for DM messages
    const handleDM = async (data) => {
      if (roomId) {
        const res = await getPreviousMessages(roomId)
        setMessages(res?.messages)
      }
      setscrollToggle((prev) => !prev)
      if (data.to === teamid) {
        setMessageToggle(data)
      }
    }

    // Handler for league chat messages
    const handleLeague = async (data) => {
      if (leagueroomId) {
        await getPreviousMessages(leagueroomId)
      }
      setscrollToggle((prev) => !prev)
      if (data.sender === teamid) {
        setSentLeagueMessage((prevMessages) => [...prevMessages, data])
        setMessageToggle(data)
      }
    }

    socket.on('Message', handleDM)
    socket.on('sendleagueMessage', handleLeague)

    return () => {
      socket.off('Message', handleDM)
      socket.off('sendleagueMessage', handleLeague)
      // Do NOT disconnect, the Redux socket is managed globally by App.js
    }
  }, [socket, roomId, leagueroomId, teamid])

  const handleChatClick = async (teamId) => {
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
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoader(false)
    }
  }

  const handleopenmodal = async (room) => {
    setLoader(true)
    await getChatRooms()
    if (room) {
      setChat(room._id)
      setVendorId(room.applicants.find((applicant) => applicant._id !== user?.team?._id)?._id || '')
      localStorage.setItem('roomId', room._id)
      const res = await getPreviousMessages(room._id)
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
    try {
      await sendMessage(payload)
      socket.emit('Message', payload)
      scrollBottom()
      setMyMessage('')
      setDmLoading(false)
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
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
    try {
      await sendMessage(payload)
      socket.emit('joinleagueRoom', payload)
      chatRef?.current?.scrollIntoView({ behaviour: 'smooth' })
      scrollBottom()
      setLeagueMessage('')
      setLoader(false)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const sendImage = async (e) => {
    setLoader(true)
    const file = e.target.files[0]
    if (!file) return
    const obj = URL.createObjectURL(file)
    const formData = new FormData()
    formData.append('pictures', file)
    formData.append('sender', String(teamid))
    formData.append('room_id', String(leagueroomId))
    await sendMessage(formData)
    socket.emit('joinleagueRoom', formData)
    setLoader(false)
  }

  const sendDMImage = async (e) => {
    setLoader(true)
    const file = e.target.files[0]
    if (!file) return
    const obj = URL.createObjectURL(file)
    const formData = new FormData()
    formData.append('pictures', file)
    formData.append('from', String(teamid))
    formData.append('room_id', String(roomId))
    formData.append('to', String(vendorId))
    await sendMessage(formData)
    const dmPayload = { to: vendorId, from: teamid, room_id: roomId }
    socket.emit('Message', dmPayload)
    setLoader(false)
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
      handleleagueSendMessage()
    }
  }

  const handleEmojiSelect = (emoji) => {
    setLeagueMessage((prevMessage) => prevMessage + emoji.native)
    setEmojiPickerVisible(false)
  }

  const otherTeams = currentLeague?.teams?.filter((item) => item._id !== user?.team?._id) || []
  const filteredTeams = teamSearch
    ? otherTeams.filter((t) => t?.name?.toLowerCase().includes(teamSearch.toLowerCase()))
    : otherTeams

  return (
    <>
      <Header />

      <OnboardingGuide tabKey="chat" />

      <div className='lc-page'>
        <div className='lc-widget'>
          {/* ═══ LEFT PANEL, Conversations list ═══ */}
          <div className='lc-panel-left'>
            {/* Panel header */}
            <div className='lc-panel-header'>
              <h2 className='lc-panel-title'>Chats</h2>
              <span className='lc-panel-count'>{otherTeams.length + 1}</span>
            </div>

            {/* Search bar */}
            <div className='lc-search-wrap'>
              <SearchOutlined className='lc-search-icon' />
              <input
                className='lc-search-input'
                placeholder='Search teams...'
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
              />
            </div>

            {/* Conversation list */}
            <div className='lc-conv-list'>
              {/* League chat, always first */}
              <div
                className={`lc-conv-item ${activeView === 'league' ? 'lc-conv-active' : ''}`}
                onClick={() => setActiveView('league')}
              >
                <div className='lc-conv-avatar lc-conv-avatar-league'>
                  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
                    <circle cx='9' cy='7' r='4' />
                    <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
                    <path d='M16 3.13a4 4 0 0 1 0 7.75' />
                  </svg>
                </div>
                <div className='lc-conv-info'>
                  <span className='lc-conv-name'>{currentLeague?.name || 'League Chat'}</span>
                  <span className='lc-conv-preview'>Group chat &middot; {otherTeams.length + 1} teams</span>
                </div>
                <div className='lc-conv-meta'>
                  <span className='lc-conv-online-dot' />
                </div>
              </div>

              {/* Individual DM conversations */}
              {filteredTeams.map((item) => {
                const currentRoom = findRoom(searchChat, user, item)
                const hasUnread = currentRoom && String(roomId) !== String(currentRoom?._id) && currentRoom?.unread_count > 0

                return (
                  <div
                    key={item._id}
                    className={`lc-conv-item ${activeView === item._id ? 'lc-conv-active' : ''}`}
                    onClick={async () => {
                      if (currentRoom) {
                        handleopenmodal(currentRoom)
                      } else {
                        handleChatClick(item._id)
                      }
                    }}
                  >
                    <div className='lc-conv-avatar'>
                      <Image
                        width={42}
                        height={42}
                        preview={false}
                        src={item?.logo}
                        alt={item?.name}
                        className='lc-conv-avatar-img'
                      />
                      {hasUnread && (
                        <span className='lc-conv-badge'>{currentRoom.unread_count}</span>
                      )}
                    </div>
                    <div className='lc-conv-info'>
                      <span className='lc-conv-name'>{item?.name}</span>
                      <span className='lc-conv-preview'>Tap to message</span>
                    </div>
                    {hasUnread && <div className='lc-conv-unread-dot' />}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ═══ RIGHT PANEL, Active chat ═══ */}
          <div className='lc-panel-right'>
            {/* Chat header */}
            <div className='lc-chat-header'>
              <div className='lc-chat-header-left'>
                <div className='lc-chat-header-avatar'>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
                  </svg>
                </div>
                <div className='lc-chat-header-info'>
                  <h3 className='lc-chat-header-name'>{currentLeague?.name || 'League Chat'}</h3>
                  <span className='lc-chat-header-status'>
                    <span className='lc-online-indicator' />
                    {otherTeams.length + 1} members online
                  </span>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div className='lc-chat-messages'>
              {loader ? (
                <div className='lc-loader-wrap'>
                  <Loader />
                </div>
              ) : (
                <Leaguechat chatRef={chatRef} chat={myleagueMessage} teamid={teamid} />
              )}
            </div>

            {/* Scroll to bottom */}
            <div className='lc-scroll-btn-wrap'>
              <button className='lc-scroll-btn' onClick={scrollBottom}>
                <FaCaretDown />
              </button>
            </div>

            {/* Input area */}
            <div className='lc-chat-input-area'>
              <div className='lc-chat-input-row'>
                <input
                  type='file'
                  id='lc-file-input'
                  className='lc-file-hidden'
                  onChange={sendImage}
                />
                <label htmlFor='lc-file-input' className='lc-input-icon-btn'>
                  <AiOutlineCloudUpload />
                </label>

                <div className='lc-input-bubble'>
                  <Mentions
                    className='lc-mentions-input'
                    value={leagueMessage}
                    onChange={handleChange}
                    onSelect={(option) => {}}
                    placeholder='Type a message...'
                    onKeyDown={handlePressEnter}
                  >
                    {otherTeams.map((item) => (
                      <Option key={item._id} value={item.name}>
                        {item.name}
                      </Option>
                    ))}
                  </Mentions>
                </div>

                <button
                  className={`lc-send-btn ${leagueMessage?.toString().trim() ? 'lc-send-active' : ''}`}
                  onClick={handleleagueSendMessage}
                >
                  <IoMdSend />
                </button>
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
        teamname={user?.team?.name}
        loader={loader}
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
