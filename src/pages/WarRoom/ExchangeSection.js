import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Spin, Modal, Input, notification, Avatar, Badge } from 'antd'
import { SendOutlined, ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons'
import {
  getExchangeListings,
  getMyListings,
  getMyOffers,
  getReceivedOffers,
  getExchangeStats,
  getExchangeConversations,
  sendExchangeDm,
  markDmRead,
  makeOffer,
  buyNowFranchise,
  createExchangeListing,
} from '../../redux/actions/exchangeActions'
import { attachToken, privateAPI } from '../../config/constants'

// Helper: Format money (e.g., "5.00M SP", "250K SP")
const formatMoney = (value) => {
  if (!value || isNaN(value)) return '0 SP'
  const num = parseFloat(value)
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M SP`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K SP`
  }
  return `${num.toFixed(0)} SP`
}

// Helper: Calculate time ago from timestamp
const getTimeAgo = (timestamp) => {
  if (!timestamp) return 'just now'
  const now = new Date()
  const created = new Date(timestamp)
  const seconds = Math.floor((now - created) / 1000)

  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

// Rank badge color mapping
const getRankColor = (position) => {
  if (position === 1) return '#22C55E' // green
  if (position === 2) return '#3B82F6' // blue
  if (position === 3) return '#F59E0B' // amber
  return '#6B7280' // gray
}

// Sport emoji mapping
const sportEmojis = {
  soccer: '⚽',
  nba: '🏀',
  nfl: '🏈',
  mlb: '⚾',
  ice_hockey: '🏒',
}

// Country flag emoji mapping (simple mapping)
const countryFlags = {
  US: '🇺🇸',
  UK: '🇬🇧',
  CA: '🇨🇦',
  DE: '🇩🇪',
  FR: '🇫🇷',
  ES: '🇪🇸',
  IT: '🇮🇹',
  BR: '🇧🇷',
  MX: '🇲🇽',
  AU: '🇦🇺',
}

const ExchangeSection = ({ onSellEmpire }) => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user?.userDetails)

  // Redux selectors
  const listings = useSelector((state) => state.exchange?.listings || [])
  const myListings = useSelector((state) => state.exchange?.myListings || [])
  const myOffers = useSelector((state) => state.exchange?.myOffers || [])
  const receivedOffers = useSelector((state) => state.exchange?.receivedOffers || [])
  const exchangeStats = useSelector((state) => state.exchange?.stats || {})
  const listingsLoading = useSelector((state) => state.exchange?.listingsLoading)

  // Local state
  const [sportFilter, setSportFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [offerModal, setOfferModal] = useState({
    visible: false,
    listing: null,
    amount: '',
    message: '',
  })
  const [sellModal, setSellModal] = useState({
    visible: false,
    askingPrice: '',
  })
  // Messages state
  const [messagesOpen, setMessagesOpen] = useState(false)
  const [activeConvo, setActiveConvo] = useState(null) // conversation object
  const [convoMessages, setConvoMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [dmInput, setDmInput] = useState('')
  const [sendingDm, setSendingDm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchingUsers, setSearchingUsers] = useState(false)
  const messagesEndRef = useRef(null)
  const dmPollRef = useRef(null)

  const conversations = useSelector((state) => state.exchange?.conversations || [])
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread || 0), 0)

  // Load data on mount
  useEffect(() => {
    dispatch(getExchangeListings())
    dispatch(getMyListings())
    dispatch(getMyOffers())
    dispatch(getReceivedOffers())
    dispatch(getExchangeStats())
    dispatch(getExchangeConversations())
  }, [dispatch])

  // ── DM Helpers ──────────────────────────────────────────────
  const openConversation = useCallback(async (convo) => {
    setActiveConvo(convo)
    setLoadingMessages(true)
    setConvoMessages([])
    const sport = convo._sport || 'nfl'
    try {
      // Mark as read
      if (convo._id && convo.unread > 0) {
        await markDmRead(convo._id, sport)
        dispatch(getExchangeConversations())
      }
      // Fetch conversation messages from the embedded messages array
      setConvoMessages(convo.messages || [])
    } catch (err) {
      console.warn('Failed to load conversation:', err)
    } finally {
      setLoadingMessages(false)
    }
  }, [dispatch])

  const handleSendDm = async () => {
    if (!dmInput.trim() || sendingDm || !activeConvo) return
    const text = dmInput.trim()
    setSendingDm(true)
    setDmInput('')
    try {
      const otherUser = (activeConvo.participants || []).find(
        (p) => String(p._id || p) !== String(user?._id || user?.id)
      )
      const recipientId = otherUser?._id || otherUser
      const sport = activeConvo._sport || 'nfl'
      await sendExchangeDm({ recipientId, text, sport })
      // Refresh conversations to get the new message
      dispatch(getExchangeConversations())
      // Optimistic: add to local messages
      setConvoMessages((prev) => [...prev, { from: user?._id || user?.id, text, createdAt: new Date().toISOString() }])
    } catch (err) {
      setDmInput(text)
    } finally {
      setSendingDm(false)
    }
  }

  const startNewDm = async (recipient, listing = null) => {
    setSearchQuery('')
    setSearchResults([])
    // Check if conversation already exists with this user for this listing
    const existing = conversations.find((c) =>
      (c.participants || []).some((p) => String(p._id || p) === String(recipient._id))
    )
    if (existing) {
      openConversation(existing)
      // If coming from a listing, pre-fill an inquiry
      if (listing) {
        const teamName = listing.teamSnapshot?.name || 'this franchise'
        const isMTO = listing._isMTO
        setDmInput(isMTO
          ? `Hi, I'm interested in your full MTO portfolio. Is the bundle still available? I'd also like to know if individual teams can be negotiated separately.`
          : `Hi, I'm interested in acquiring ${teamName}. Is it still available?`)
      }
      return
    }
    // Create a placeholder conversation
    setActiveConvo({
      _id: null,
      participants: [user, recipient],
      messages: [],
      _sport: 'nfl',
      _newRecipient: recipient,
      _listingId: listing?._id || null,
    })
    setConvoMessages([])
    // Pre-fill inquiry message if from a listing
    if (listing) {
      const teamName = listing.teamSnapshot?.name || 'this franchise'
      const isMTO = listing._isMTO
      setDmInput(isMTO
        ? `Hi, I'm interested in your full MTO portfolio. Is the bundle still available? I'd also like to know if individual teams can be negotiated separately.`
        : `Hi, I'm interested in acquiring ${teamName}. Is it still available?`)
    }
  }

  const handleSendNewDm = async () => {
    if (!dmInput.trim() || sendingDm || !activeConvo?._newRecipient) return
    const text = dmInput.trim()
    setSendingDm(true)
    setDmInput('')
    try {
      await sendExchangeDm({
        recipientId: activeConvo._newRecipient._id,
        text,
        listingId: activeConvo._listingId || undefined,
        sport: 'nfl',
      })
      dispatch(getExchangeConversations())
      setConvoMessages([{ from: user?._id || user?.id, text, createdAt: new Date().toISOString() }])
      // Remove the _newRecipient flag so further messages use normal send
      setActiveConvo((prev) => ({ ...prev, _newRecipient: null, _listingId: null }))
    } catch (err) {
      setDmInput(text)
    } finally {
      setSendingDm(false)
    }
  }

  const searchUsers = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setSearchResults([]); return }
    setSearchingUsers(true)
    try {
      attachToken()
      const res = await privateAPI.get(`/exchange/dm/search-users?q=${encodeURIComponent(q.trim())}`)
      setSearchResults(res.data?.data || [])
    } catch (err) {
      setSearchResults([])
    } finally {
      setSearchingUsers(false)
    }
  }, [])

  // Auto-scroll messages
  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [convoMessages])

  // Poll conversations when modal is open
  useEffect(() => {
    if (messagesOpen) {
      dmPollRef.current = setInterval(() => dispatch(getExchangeConversations()), 10000)
      return () => clearInterval(dmPollRef.current)
    }
  }, [messagesOpen, dispatch])

  // Refresh active convo messages when conversations update
  useEffect(() => {
    if (activeConvo?._id) {
      const updated = conversations.find((c) => String(c._id) === String(activeConvo._id))
      if (updated) setConvoMessages(updated.messages || [])
    }
  }, [conversations, activeConvo?._id])

  // Filter listings based on sport
  const filteredListings = sportFilter === 'all'
    ? listings
    : listings.filter(
        (l) => l.teamSnapshot?.sport?.toLowerCase() === sportFilter.toLowerCase()
      )

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.askingPrice - b.askingPrice
      case 'price-high':
        return b.askingPrice - a.askingPrice
      case 'trending':
        return (b.teamSnapshot?.trendPct || 0) - (a.teamSnapshot?.trendPct || 0)
      case 'newest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt)
    }
  })

  // Handle "Sell My Empire" button
  const handleSellEmpire = () => {
    if (onSellEmpire) {
      onSellEmpire()
    } else {
      notification.info({
        message: 'MTO Sale Coming Soon',
        description: 'List your franchise for sale on the Exchange. Feature launching soon!',
        duration: 3,
      })
    }
  }

  // Handle make offer
  const handleMakeOffer = (listing) => {
    setOfferModal({
      visible: true,
      listing,
      amount: '',
      message: '',
    })
  }

  // Submit offer
  const handleSubmitOffer = async () => {
    if (!offerModal.amount || parseFloat(offerModal.amount) <= 0) {
      notification.error({
        message: 'Invalid Amount',
        description: 'Please enter a valid offer amount.',
      })
      return
    }
    const listingSport = offerModal.listing?._sport || offerModal.listing?.teamSnapshot?.sport?.toLowerCase() || 'nfl'
    const result = await makeOffer({
      listingId: offerModal.listing._id,
      amount: parseFloat(offerModal.amount),
      message: offerModal.message,
      sport: listingSport,
    })
    setOfferModal({ visible: false, listing: null, amount: '', message: '' })
    if (result) {
      dispatch(getMyOffers())
    }
  }

  // Handle buy now
  const handleBuyNow = async (listing) => {
    const listingSport = listing?._sport || listing?.teamSnapshot?.sport?.toLowerCase() || 'nfl'
    const result = await buyNowFranchise(listing._id, listingSport)
    if (result) {
      dispatch(getExchangeListings())
      dispatch(getExchangeStats())
    }
  }

  return (
    <div style={{ padding: '24px', background: 'rgba(10,15,26,0.95)', minHeight: '100vh' }}>
      {/* ===== HEADER ROW ===== */}
      <div
        style={{
          position: 'relative',
          marginBottom: '32px',
          paddingTop: '16px',
        }}
      >
        {/* Green gradient top border */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #22C55E 0%, #14B8A6 100%)',
            borderRadius: '2px',
          }}
        />

        <div
          style={{
            background: 'linear-gradient(135deg, rgba(20,28,45,0.9) 0%, rgba(30,40,60,0.8) 100%)',
            border: '1px solid rgba(110,105,128,0.15)',
            borderRadius: '12px',
            padding: '24px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Left: Title & Subtitle */}
          <div>
            <h1
              style={{
                margin: '0 0 8px 0',
                fontSize: '36px',
                fontWeight: 'bold',
                fontFamily: "'Rajdhani', sans-serif",
                color: '#FFFFFF',
                letterSpacing: '-0.5px',
              }}
            >
              🎯 The Exchange
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif",
                color: 'rgba(255,255,255,0.65)',
              }}
            >
              Franchise Trading Floor, Acquire or divest premium assets
            </p>
          </div>

          {/* Right: Buttons */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {/* Sell My Empire Button */}
            <button
              onClick={handleSellEmpire}
              style={{
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: '700',
                fontFamily: "'Rajdhani', sans-serif",
                color: '#22C55E',
                background: 'transparent',
                border: '2px solid #22C55E',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(34,197,94,0.1)'
                e.target.style.boxShadow = '0 0 16px rgba(34,197,94,0.2)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.boxShadow = 'none'
              }}
            >
              👑 SELL MY MTO
            </button>

            {/* Messages Button */}
            <button
              onClick={() => setMessagesOpen(true)}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: "'Rajdhani', sans-serif",
                color: '#FFFFFF',
                background: 'rgba(110,105,128,0.2)',
                border: '1px solid rgba(110,105,128,0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(110,105,128,0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(110,105,128,0.2)'
              }}
            >
              💬 Messages
              {totalUnread > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#22C55E',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  {totalUnread}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ===== KPI STRIP ===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '20px 32px',
          background: 'rgba(10,15,26,0.8)',
          border: '1px solid rgba(110,105,128,0.15)',
          borderRadius: '12px',
          marginBottom: '32px',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Active Listings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: "'Rajdhani', sans-serif",
              color: 'rgba(255,255,255,0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Active Listings
          </span>
          <span
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              fontFamily: "'Barlow Condensed', sans-serif",
              color: '#FFFFFF',
            }}
          >
            {listings.length}
          </span>
        </div>

        {/* Vertical Divider */}
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }} />

        {/* Total Floor Value */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: "'Rajdhani', sans-serif",
              color: 'rgba(255,255,255,0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Total Floor Value
          </span>
          <span
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              fontFamily: "'Barlow Condensed', sans-serif",
              color: '#FFFFFF',
            }}
          >
            {formatMoney(
              listings.reduce((sum, l) => sum + (l.askingPrice || 0), 0)
            )}
          </span>
        </div>

        {/* Vertical Divider */}
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }} />

        {/* Avg Asking Price */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: "'Rajdhani', sans-serif",
              color: 'rgba(255,255,255,0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Avg Asking Price
          </span>
          <span
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              fontFamily: "'Barlow Condensed', sans-serif",
              color: '#FFFFFF',
            }}
          >
            {formatMoney(
              listings.length > 0
                ? listings.reduce((sum, l) => sum + (l.askingPrice || 0), 0) /
                    listings.length
                : 0
            )}
          </span>
        </div>

        {/* Vertical Divider */}
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }} />

        {/* My Active Offers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: "'Rajdhani', sans-serif",
              color: 'rgba(255,255,255,0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            My Active Offers
          </span>
          <span
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              fontFamily: "'Barlow Condensed', sans-serif",
              color: '#FFFFFF',
            }}
          >
            {myOffers.length}
          </span>
        </div>

        {/* Vertical Divider */}
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }} />

        {/* My SP Balance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: "'Rajdhani', sans-serif",
              color: 'rgba(255,255,255,0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            My SP Balance
          </span>
          <span
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              fontFamily: "'Barlow Condensed', sans-serif",
              color: '#22C55E',
            }}
          >
            {formatMoney(user?.samPointsBalance || user?.wallet?.balance || 0)}
          </span>
        </div>
      </div>

      {/* ===== SPORT FILTER + SORT ROW (SAME LINE) ===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          gap: '24px',
        }}
      >
        {/* Left: Sport Filter Tabs */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {['All Sports', 'Soccer', 'A.Football'].map(
            (sport) => {
              const sportKey = sport === 'All Sports' ? 'all' : sport.toLowerCase()
              const isActive = sportFilter === sportKey
              const emoji =
                sport === 'All Sports'
                  ? '🌍'
                  : sportEmojis[sportKey] || '🏆'

              return (
                <button
                  key={sport}
                  onClick={() => setSportFilter(sportKey)}
                  style={{
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: '600',
                    fontFamily: "'Rajdhani', sans-serif",
                    color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                    background: isActive
                      ? 'rgba(34,197,94,0.15)'
                      : 'rgba(110,105,128,0.1)',
                    border: `1px solid ${
                      isActive
                        ? 'rgba(34,197,94,0.3)'
                        : 'rgba(110,105,128,0.15)'
                    }`,
                    borderRadius: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.background = 'rgba(110,105,128,0.15)'
                      e.target.style.borderColor = 'rgba(110,105,128,0.2)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.background = 'rgba(110,105,128,0.1)'
                      e.target.style.borderColor = 'rgba(110,105,128,0.15)'
                    }
                  }}
                >
                  {emoji} {sport}
                </button>
              )
            }
          )}
        </div>

        {/* Right: Sort Options */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: "'Rajdhani', sans-serif",
              color: 'rgba(255,255,255,0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Sort:
          </span>
          {['Newest', 'Price ↑', 'Price ↓', 'Trending'].map((option) => {
            const sortKey =
              option === 'Newest'
                ? 'newest'
                : option === 'Price ↑'
                ? 'price-low'
                : option === 'Price ↓'
                ? 'price-high'
                : 'trending'
            const isActive = sortBy === sortKey

            return (
              <button
                key={option}
                onClick={() => setSortBy(sortKey)}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: "'Rajdhani', sans-serif",
                  color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                  background: isActive
                    ? 'rgba(34,197,94,0.15)'
                    : 'rgba(110,105,128,0.1)',
                  border: `1px solid ${
                    isActive
                      ? 'rgba(34,197,94,0.3)'
                      : 'rgba(110,105,128,0.15)'
                  }`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.background = 'rgba(110,105,128,0.15)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.background = 'rgba(110,105,128,0.1)'
                  }
                }}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>

      {/* ===== LOADING STATE ===== */}
      {listingsLoading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <Spin size="large" tip="Loading franchises..." />
        </div>
      ) : (
        <>
          {/* ===== LISTINGS GRID ===== */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {sortedListings && sortedListings.length > 0 ? (
              sortedListings.map((listing) => {
                const rankColor = getRankColor(listing.teamSnapshot?.rank || 4)
                const trendPct = listing.teamSnapshot?.trendPct || 0
                const trendColor = trendPct > 0 ? '#22C55E' : trendPct < 0 ? '#EF4444' : '#6B7280'

                return (
                  <div
                    key={listing._id}
                    style={{
                      background: 'linear-gradient(135deg, rgba(30,40,60,0.8) 0%, rgba(20,28,45,0.9) 100%)',
                      border: '1px solid rgba(110,105,128,0.2)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(34,197,94,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(110,105,128,0.2)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {/* Header Section */}
                    <div
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid rgba(110,105,128,0.15)',
                        background: 'rgba(20,28,45,0.6)',
                      }}
                    >
                      {/* Listing type badge */}
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{
                          fontSize: '9px', fontWeight: 700, fontFamily: "'Rajdhani', sans-serif",
                          letterSpacing: '1px', textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.45)',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(110,105,128,0.15)',
                          borderRadius: '4px', padding: '2px 8px',
                        }}>
                          Single Franchise
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px',
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              margin: '0 0 4px 0',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              fontFamily: "'Rajdhani', sans-serif",
                              color: '#FFFFFF',
                            }}
                          >
                            {listing.teamSnapshot?.name || 'Unknown Team'}
                          </h3>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '12px',
                              fontFamily: "'Inter', sans-serif",
                              color: 'rgba(255,255,255,0.5)',
                            }}
                          >
                            Listed {getTimeAgo(listing.createdAt)}
                          </p>
                        </div>
                        <div
                          style={{
                            background: rankColor,
                            color: '#FFFFFF',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            fontFamily: "'Rajdhani', sans-serif",
                          }}
                        >
                          #{listing.teamSnapshot?.rank || '-'}
                        </div>
                      </div>

                      {/* Record */}
                      <div
                        style={{
                          display: 'flex',
                          gap: '16px',
                          fontSize: '12px',
                          fontFamily: "'Inter', sans-serif",
                          color: 'rgba(255,255,255,0.7)',
                        }}
                      >
                        <span>
                          W: <span style={{ fontWeight: 'bold', color: '#22C55E' }}>
                            {listing.teamSnapshot?.wins || 0}
                          </span>
                        </span>
                        <span>
                          L: <span style={{ fontWeight: 'bold', color: '#EF4444' }}>
                            {listing.teamSnapshot?.losses || 0}
                          </span>
                        </span>
                        <span>
                          T: <span style={{ fontWeight: 'bold', color: '#F59E0B' }}>
                            {listing.teamSnapshot?.ties || 0}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Body Section */}
                    <div
                      style={{
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        flex: 1,
                      }}
                    >
                      {/* Trend */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: 'rgba(110,105,128,0.1)',
                          borderRadius: '8px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            fontFamily: "'Rajdhani', sans-serif",
                            color: 'rgba(255,255,255,0.6)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          7-Day Trend
                        </span>
                        <span
                          style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            fontFamily: "'Rajdhani', sans-serif",
                            color: trendColor,
                          }}
                        >
                          {trendPct > 0 ? '+' : ''}{trendPct.toFixed(1)}%
                        </span>
                      </div>

                      {/* Seller Info */}
                      <div
                        style={{
                          fontSize: '12px',
                          fontFamily: "'Inter', sans-serif",
                          color: 'rgba(255,255,255,0.6)',
                        }}
                      >
                        Seller: <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                          {listing.sellerName || 'Anonymous'}
                        </span>
                      </div>
                    </div>

                    {/* Footer: Price */}
                    <div
                      style={{
                        padding: '16px',
                        borderTop: '1px solid rgba(110,105,128,0.15)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(20,28,45,0.6)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          fontFamily: "'Rajdhani', sans-serif",
                          color: 'rgba(255,255,255,0.6)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Asking Price
                      </span>
                      <span
                        style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          fontFamily: "'Barlow Condensed', sans-serif",
                          color: '#22C55E',
                        }}
                      >
                        {formatMoney(listing.askingPrice || 0)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        gap: '12px',
                        marginTop: 'auto',
                      }}
                    >
                      <button
                        onClick={() => handleMakeOffer(listing)}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          fontSize: '13px',
                          fontWeight: '600',
                          fontFamily: "'Rajdhani', sans-serif",
                          color: '#22C55E',
                          background: 'rgba(34,197,94,0.1)',
                          border: '1px solid rgba(34,197,94,0.2)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(34,197,94,0.15)'
                          e.target.style.boxShadow =
                            '0 0 12px rgba(34,197,94,0.15)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(34,197,94,0.1)'
                          e.target.style.boxShadow = 'none'
                        }}
                      >
                        Make Offer
                      </button>
                      <button
                        onClick={() => handleBuyNow(listing)}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          fontSize: '13px',
                          fontWeight: '600',
                          fontFamily: "'Rajdhani', sans-serif",
                          color: '#FFFFFF',
                          background: '#22C55E',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#34D399'
                          e.target.style.boxShadow = '0 0 16px rgba(34,197,94,0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#22C55E'
                          e.target.style.boxShadow = 'none'
                        }}
                      >
                        Buy Now
                      </button>
                    </div>
                    {/* Inquire — Contact Owner */}
                    {listing.seller && String(listing.seller._id || listing.seller) !== String(user?._id || user?.id) && (
                      <div style={{ padding: '0 20px 16px' }}>
                        <button
                          onClick={() => {
                            const sellerObj = listing.seller._id
                              ? listing.seller
                              : { _id: listing.seller, userName: listing.sellerName || 'Owner' }
                            startNewDm(sellerObj, listing)
                            setMessagesOpen(true)
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 16px',
                            fontSize: '12px',
                            fontWeight: '700',
                            fontFamily: "'Rajdhani', sans-serif",
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.7)',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(110,105,128,0.2)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(34,197,94,0.08)'
                            e.target.style.borderColor = 'rgba(34,197,94,0.25)'
                            e.target.style.color = '#22C55E'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.04)'
                            e.target.style.borderColor = 'rgba(110,105,128,0.2)'
                            e.target.style.color = 'rgba(255,255,255,0.7)'
                          }}
                        >
                          ✉ Contact Owner
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                <p
                  style={{
                    fontSize: '16px',
                    fontFamily: "'Inter', sans-serif",
                    margin: 0,
                  }}
                >
                  No franchises available at this time.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ===== OFFER MODAL ===== */}
      <Modal
        title="Make an Offer"
        visible={offerModal.visible}
        onCancel={() =>
          setOfferModal({ visible: false, listing: null, amount: '', message: '' })
        }
        onOk={handleSubmitOffer}
        okText="Submit Offer"
        cancelText="Cancel"
        centered
        style={{
          '--primary-color': '#22C55E',
        }}
      >
        {offerModal.listing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#333',
                }}
              >
                Franchise: {offerModal.listing.teamSnapshot?.name}
              </label>
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: '#666',
                }}
              >
                Asking Price: {formatMoney(offerModal.listing.askingPrice)}
              </p>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#333',
                }}
              >
                Your Offer (SP)
              </label>
              <Input
                type="number"
                placeholder="Enter offer amount"
                value={offerModal.amount}
                onChange={(e) =>
                  setOfferModal({ ...offerModal, amount: e.target.value })
                }
                style={{
                  padding: '10px',
                  fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#333',
                }}
              >
                Message (Optional)
              </label>
              <Input.TextArea
                placeholder="Add a note to your offer..."
                value={offerModal.message}
                onChange={(e) =>
                  setOfferModal({ ...offerModal, message: e.target.value })
                }
                rows={3}
                style={{
                  fontSize: '14px',
                }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ===== MESSAGES MODAL ===== */}
      <Modal
        open={messagesOpen}
        onCancel={() => { setMessagesOpen(false); setActiveConvo(null); setSearchQuery(''); setSearchResults([]) }}
        footer={null}
        width={520}
        title={null}
        closable={false}
        bodyStyle={{ padding: 0, background: '#0A0F1A', borderRadius: '12px', overflow: 'hidden' }}
        style={{ top: 40 }}
      >
        <div style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
          {/* Modal Header */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid rgba(110,105,128,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(20,28,45,0.8)',
          }}>
            {activeConvo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ArrowLeftOutlined
                  onClick={() => { setActiveConvo(null); setConvoMessages([]) }}
                  style={{ color: '#fff', fontSize: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '16px', color: '#fff' }}>
                  {(() => {
                    const other = (activeConvo.participants || []).find(
                      (p) => String(p._id || p) !== String(user?._id || user?.id)
                    )
                    return other?.userName || activeConvo._newRecipient?.userName || 'User'
                  })()}
                </span>
              </div>
            ) : (
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '16px', color: '#fff' }}>
                💬 Messages
              </span>
            )}
            <button
              onClick={() => { setMessagesOpen(false); setActiveConvo(null); setSearchQuery(''); setSearchResults([]) }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '18px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          {!activeConvo ? (
            /* ── Conversation List ── */
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {/* Search for new DM */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(110,105,128,0.1)' }}>
                <Input
                  prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.3)' }} />}
                  placeholder="Search users to message..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); searchUsers(e.target.value) }}
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(110,105,128,0.2)', color: '#fff', borderRadius: '8px' }}
                />
              </div>

              {/* Search results */}
              {searchQuery.length >= 2 && (
                <div style={{ borderBottom: '1px solid rgba(110,105,128,0.15)' }}>
                  {searchingUsers ? (
                    <div style={{ padding: '16px', textAlign: 'center' }}><Spin size="small" /></div>
                  ) : searchResults.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>No users found</div>
                  ) : (
                    searchResults.map((u) => (
                      <div
                        key={u._id}
                        onClick={() => startNewDm(u)}
                        style={{
                          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                          cursor: 'pointer', transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(34,197,94,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Avatar size={32} style={{ backgroundColor: '#22C55E', fontSize: '13px', fontWeight: 700 }}>
                          {(u.userName || '?').charAt(0).toUpperCase()}
                        </Avatar>
                        <span style={{ color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500 }}>
                          {u.userName}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Existing conversations */}
              {conversations.length === 0 && searchQuery.length < 2 ? (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
                  No conversations yet. Search for a user to start messaging.
                </div>
              ) : (
                conversations.map((convo) => {
                  const other = (convo.participants || []).find(
                    (p) => String(p._id || p) !== String(user?._id || user?.id)
                  )
                  const name = other?.userName || 'User'
                  const lastMsg = convo.messages?.[convo.messages.length - 1]
                  return (
                    <div
                      key={convo._id}
                      onClick={() => openConversation(convo)}
                      style={{
                        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                        cursor: 'pointer', borderBottom: '1px solid rgba(110,105,128,0.08)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Badge count={convo.unread || 0} size="small" offset={[-2, 2]}>
                        <Avatar size={40} src={other?.profileImage} style={{ backgroundColor: '#3B82F6', fontSize: '15px', fontWeight: 700 }}>
                          {name.charAt(0).toUpperCase()}
                        </Avatar>
                      </Badge>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#fff', fontWeight: 600, fontFamily: "'Inter', sans-serif", fontSize: '13px' }}>{name}</span>
                          {lastMsg && (
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>{getTimeAgo(lastMsg.createdAt)}</span>
                          )}
                        </div>
                        {lastMsg && (
                          <div style={{
                            color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: "'Inter', sans-serif",
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px',
                          }}>
                            {lastMsg.text}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          ) : (
            /* ── Active Conversation ── */
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {loadingMessages ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}><Spin size="small" /></div>
                ) : convoMessages.length === 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                    No messages yet. Send the first one!
                  </div>
                ) : (
                  convoMessages.map((msg, idx) => {
                    const isMine = String(msg.from?._id || msg.from) === String(user?._id || user?.id)
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '75%', padding: '8px 12px', borderRadius: '12px',
                          background: isMine ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                          border: isMine ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(110,105,128,0.12)',
                        }}>
                          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', fontFamily: "'Inter', sans-serif", lineHeight: 1.4, wordBreak: 'break-word' }}>
                            {msg.text}
                          </div>
                          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginTop: '4px', textAlign: isMine ? 'right' : 'left' }}>
                            {getTimeAgo(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              {/* DM Input */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(110,105,128,0.15)', display: 'flex', gap: '8px' }}>
                <Input
                  placeholder="Type a message..."
                  value={dmInput}
                  onChange={(e) => setDmInput(e.target.value)}
                  onPressEnter={activeConvo?._newRecipient ? handleSendNewDm : handleSendDm}
                  disabled={sendingDm}
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(110,105,128,0.2)', color: '#fff', borderRadius: '8px', height: '36px' }}
                />
                <button
                  onClick={activeConvo?._newRecipient ? handleSendNewDm : handleSendDm}
                  disabled={sendingDm || !dmInput.trim()}
                  style={{
                    background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                    color: '#22C55E', borderRadius: '8px', width: '36px', height: '36px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: sendingDm || !dmInput.trim() ? 'not-allowed' : 'pointer', opacity: sendingDm || !dmInput.trim() ? 0.5 : 1,
                  }}
                >
                  <SendOutlined />
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default ExchangeSection
