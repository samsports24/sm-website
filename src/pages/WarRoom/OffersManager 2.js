import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Spin, Modal, Input, notification } from 'antd'
import {
  getMyListings,
  getMyOffers,
  getReceivedOffers,
  delistFranchise,
  acceptOffer,
  rejectOffer,
  withdrawOffer,
  sendCounterOffer,
  acceptCounterOffer,
  rejectCounterOffer,
  sendBuyerCounter,
} from '../../redux/actions/exchangeActions'
import { useLanguage } from '../../i18n/LanguageContext'

const OffersManager = ({ accent }) => {
  const { t } = useLanguage()
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('listings')
  const [counterModalVisible, setCounterModalVisible] = useState(false)
  const [counterOffer, setCounterOffer] = useState({ offerId: null, price: '', message: '' })
  const [loading, setLoading] = useState(false)

  // Redux selectors (mock structure - adjust to your store)
  const myListings = useSelector(state => state.exchange?.myListings || [])
  const myOffers = useSelector(state => state.exchange?.myOffers || [])
  const receivedOffers = useSelector(state => state.exchange?.receivedOffers || [])
  const exchangeLoading = useSelector(state => state.exchange?.loading || false)

  useEffect(() => {
    dispatch(getMyListings())
    dispatch(getMyOffers())
    dispatch(getReceivedOffers())
  }, [dispatch])

  // ============================================
  // COUNTER OFFER HANDLERS
  // ============================================
  const handleOpenCounterModal = (offerId, sport = 'nfl') => {
    setCounterOffer({ offerId, price: '', message: '', sport })
    setCounterModalVisible(true)
  }

  const handleSendCounter = async () => {
    if (!counterOffer.price || isNaN(parseFloat(counterOffer.price))) {
      notification.error({ message: t('pleaseEnterValidPrice') })
      return
    }

    setLoading(true)
    try {
      await sendCounterOffer({
        offerId: counterOffer.offerId,
        counterAmount: parseFloat(counterOffer.price),
        counterMessage: counterOffer.message,
        sport: counterOffer.sport || 'nfl',
      })
      notification.success({ message: 'Counter offer sent successfully' })
      setCounterModalVisible(false)
      setCounterOffer({ offerId: null, price: '', message: '', sport: 'nfl' })
      dispatch(getReceivedOffers())
    } catch (error) {
      notification.error({ message: 'Failed to send counter offer' })
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // MY LISTINGS TAB
  // ============================================
  const renderMyListings = () => {
    const activeListings = myListings.filter(l => l.status === 'active')
    if (activeListings.length === 0) {
      return (
        <div style={styles.emptyState}>
          <p>No active listings</p>
        </div>
      )
    }

    return (
      <div style={styles.cardGrid}>
        {activeListings.map(listing => {
          const lid = listing._id || listing.id
          const teamName = listing.teamSnapshot?.name || listing.team?.name || listing.teamName || 'Unknown Team'
          const leagueName = listing.teamSnapshot?.leagueName || listing.teamSnapshot?.sport || listing.league || ''
          const listedDate = listing.createdAt || listing.listedDate
          const offerCount = listing.offers?.length || listing.offerCount || 0
          const isActive = listing.status === 'active'
          return (
            <div key={lid} style={{ ...styles.card(accent), opacity: isActive ? 1 : 0.5 }}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>{teamName}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={styles.cardSubtitle}>{leagueName}</p>
                    {!isActive && (
                      <span style={{
                        fontSize: '9px', fontWeight: 700, padding: '2px 6px',
                        borderRadius: '4px', textTransform: 'uppercase',
                        background: listing.status === 'delisted' ? 'rgba(107,114,128,0.15)' : 'rgba(34,197,94,0.12)',
                        color: listing.status === 'delisted' ? 'rgba(255,255,255,0.4)' : '#22c55e',
                        border: `1px solid ${listing.status === 'delisted' ? 'rgba(107,114,128,0.2)' : 'rgba(34,197,94,0.2)'}`,
                      }}>
                        {listing.status === 'sold' ? 'SOLD' : listing.status?.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                {isActive && (
                  <button
                    onClick={() => handleDelistFranchise(lid, listing._sport || listing.teamSnapshot?.sport?.toLowerCase() || 'nfl')}
                    style={styles.btnDelist(accent)}
                  >
                    Delist
                  </button>
                )}
              </div>

              <div style={styles.cardContent}>
                <div style={styles.listingRow}>
                  <span style={styles.label}>Asking Price:</span>
                  <span style={styles.priceValue}>SP {listing.askingPrice?.toLocaleString()}</span>
                </div>
                <div style={styles.listingRow}>
                  <span style={styles.label}>Views:</span>
                  <span>{listing.views || 0}</span>
                </div>
                <div style={styles.listingRow}>
                  <span style={styles.label}>Offers:</span>
                  <span>{offerCount}</span>
                </div>
                <div style={styles.listingRow}>
                  <span style={styles.label}>Listed:</span>
                  <span>{listedDate ? new Date(listedDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const handleDelistFranchise = async (listingId, sport = 'nfl') => {
    Modal.confirm({
      icon: null,
      title: null,
      className: 'wr-dark-confirm',
      content: (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏷️</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', fontFamily: "'Rajdhani', sans-serif", marginBottom: '8px' }}>
            Delist Franchise?
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
            This will remove the listing and withdraw all pending offers.
          </div>
        </div>
      ),
      okText: 'Delist',
      cancelText: 'Keep Listed',
      okButtonProps: {
        style: {
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)',
          color: '#EF4444', fontWeight: 700, fontFamily: "'Rajdhani', sans-serif",
          borderRadius: '8px', height: '36px', fontSize: '13px',
        },
      },
      cancelButtonProps: {
        style: {
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(110,105,128,0.2)',
          color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontFamily: "'Inter', sans-serif",
          borderRadius: '8px', height: '36px', fontSize: '12px',
        },
      },
      onOk: async () => {
        try {
          const result = await delistFranchise(listingId, sport)
          if (result) {
            dispatch(getMyListings())
          }
        } catch (error) {
          notification.error({ message: 'Failed to delist franchise' })
        }
      },
    })
  }

  // ============================================
  // RECEIVED OFFERS TAB
  // ============================================
  const renderReceivedOffers = () => {
    if (receivedOffers.length === 0) {
      return (
        <div style={styles.emptyState}>
          <p>No received offers</p>
        </div>
      )
    }

    return (
      <div style={styles.cardGrid}>
        {receivedOffers.map(offer => (
          <div key={offer.id} style={styles.card(accent)}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>{offer.buyerName}</h3>
                <p style={styles.cardSubtitle}>{offer.teamName}</p>
              </div>
              <div style={styles.statusBadge(offer.status, accent)}>
                {offer.status?.toUpperCase()}
              </div>
            </div>

            <div style={styles.cardContent}>
              <div style={styles.listingRow}>
                <span style={styles.label}>Offer Amount:</span>
                <span style={styles.priceValue}>SP {offer.offerAmount?.toLocaleString()}</span>
              </div>

              {offer.message && (
                <div style={styles.messageBox(accent)}>
                  <p style={styles.messageText}>{offer.message}</p>
                </div>
              )}

              {offer.status === 'pending' && (
                <div style={styles.buttonGroup}>
                  <button
                    onClick={() => handleAcceptReceivedOffer(offer.id || offer._id, offer._sport || 'nfl')}
                    style={styles.btnAccept(accent)}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectOffer(offer.id || offer._id, offer._sport || 'nfl')}
                    style={styles.btnReject(accent)}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleOpenCounterModal(offer.id || offer._id, offer._sport || 'nfl')}
                    style={styles.btnCounter(accent)}
                  >
                    Counter
                  </button>
                </div>
              )}

              {offer.status === 'countered' && (
                <div style={styles.waitingBadge(accent)}>
                  Waiting for buyer response
                </div>
              )}

              {offer.negotiations && offer.negotiations.length > 0 && (
                <div style={styles.negotiationHistory}>
                  <p style={styles.negotiationTitle}>Negotiation History</p>
                  {offer.negotiations.map((neg, idx) => (
                    <div key={idx} style={styles.negotiationItem(accent)}>
                      <span style={styles.negotiationFrom}>{neg.from}</span>
                      <span style={styles.negotiationAmount}>SP {neg.amount?.toLocaleString()}</span>
                      <span style={styles.negotiationDate}>{new Date(neg.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const handleAcceptReceivedOffer = async (offerId, sport = 'nfl') => {
    Modal.confirm({
      title: 'Accept Offer',
      content: 'Are you sure you want to accept this offer?',
      okText: 'Accept',
      cancelText: 'Cancel',
      okButtonProps: { style: { backgroundColor: accent?.primary, borderColor: accent?.primary } },
      onOk: async () => {
        try {
          await acceptOffer(offerId, sport)
          notification.success({ message: 'Offer accepted successfully' })
          dispatch(getReceivedOffers())
        } catch (error) {
          notification.error({ message: 'Failed to accept offer' })
        }
      },
    })
  }

  const handleRejectOffer = async (offerId, sport = 'nfl') => {
    Modal.confirm({
      title: 'Reject Offer',
      content: 'Are you sure you want to reject this offer?',
      okText: 'Reject',
      cancelText: 'Cancel',
      okButtonProps: { style: { backgroundColor: '#dc3545', borderColor: '#dc3545' } },
      onOk: async () => {
        try {
          await rejectOffer(offerId, '', sport)
          notification.success({ message: 'Offer rejected' })
          dispatch(getReceivedOffers())
        } catch (error) {
          notification.error({ message: 'Failed to reject offer' })
        }
      },
    })
  }

  // ============================================
  // SENT OFFERS TAB
  // ============================================
  const renderSentOffers = () => {
    if (myOffers.length === 0) {
      return (
        <div style={styles.emptyState}>
          <p>No sent offers</p>
        </div>
      )
    }

    return (
      <div style={styles.cardGrid}>
        {myOffers.map(offer => (
          <div key={offer.id} style={styles.card(accent)}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>{offer.teamName}</h3>
                <p style={styles.cardSubtitle}>Seller: {offer.sellerName}</p>
              </div>
              <div style={styles.statusBadge(offer.status, accent)}>
                {offer.status?.toUpperCase()}
              </div>
            </div>

            <div style={styles.cardContent}>
              <div style={styles.listingRow}>
                <span style={styles.label}>My Offer Amount:</span>
                <span style={styles.priceValue}>SP {offer.offerAmount?.toLocaleString()}</span>
              </div>

              {offer.status === 'pending' && (
                <button
                  onClick={() => handleWithdrawOffer(offer.id || offer._id, offer._sport || 'nfl')}
                  style={{ ...styles.btnWithdraw(accent), width: '100%', marginTop: '12px' }}
                >
                  Withdraw
                </button>
              )}

              {offer.status === 'countered' && (
                <>
                  <div style={styles.counterInfoBox(accent)}>
                    <p style={styles.label}>Counter Amount:</p>
                    <p style={styles.priceValue}>SP {offer.counterAmount?.toLocaleString()}</p>
                  </div>
                  <div style={styles.buttonGroup}>
                    <button
                      onClick={() => handleAcceptCounterOffer(offer.id || offer._id, offer._sport || 'nfl')}
                      style={styles.btnAccept(accent)}
                    >
                      Accept Counter
                    </button>
                    <button
                      onClick={() => handleRejectCounterOffer(offer.id || offer._id, offer._sport || 'nfl')}
                      style={styles.btnReject(accent)}
                    >
                      Reject Counter
                    </button>
                    <button
                      onClick={() => handleOpenCounterModal(offer.id || offer._id, offer._sport || 'nfl')}
                      style={styles.btnCounter(accent)}
                    >
                      Counter Again
                    </button>
                  </div>
                </>
              )}

              {offer.negotiations && offer.negotiations.length > 0 && (
                <div style={styles.negotiationHistory}>
                  <p style={styles.negotiationTitle}>Negotiation History</p>
                  {offer.negotiations.map((neg, idx) => (
                    <div key={idx} style={styles.negotiationItem(accent)}>
                      <span style={styles.negotiationFrom}>{neg.from}</span>
                      <span style={styles.negotiationAmount}>SP {neg.amount?.toLocaleString()}</span>
                      <span style={styles.negotiationDate}>{new Date(neg.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const handleWithdrawOffer = async (offerId, sport = 'nfl') => {
    Modal.confirm({
      title: 'Withdraw Offer',
      content: 'Are you sure you want to withdraw this offer?',
      okText: 'Withdraw',
      cancelText: 'Cancel',
      okButtonProps: { style: { backgroundColor: '#6c757d', borderColor: '#6c757d' } },
      onOk: async () => {
        try {
          await withdrawOffer(offerId, sport)
          notification.success({ message: 'Offer withdrawn' })
          dispatch(getMyOffers())
        } catch (error) {
          notification.error({ message: 'Failed to withdraw offer' })
        }
      },
    })
  }

  const handleAcceptCounterOffer = async (offerId, sport = 'nfl') => {
    Modal.confirm({
      title: 'Accept Counter Offer',
      content: 'Are you sure you want to accept this counter offer?',
      okText: 'Accept',
      cancelText: 'Cancel',
      okButtonProps: { style: { backgroundColor: accent?.primary, borderColor: accent?.primary } },
      onOk: async () => {
        try {
          await acceptCounterOffer(offerId, sport)
          notification.success({ message: 'Counter offer accepted' })
          dispatch(getMyOffers())
        } catch (error) {
          notification.error({ message: 'Failed to accept counter offer' })
        }
      },
    })
  }

  const handleRejectCounterOffer = async (offerId, sport = 'nfl') => {
    Modal.confirm({
      title: 'Reject Counter Offer',
      content: 'Are you sure you want to reject this counter offer?',
      okText: 'Reject',
      cancelText: 'Cancel',
      okButtonProps: { style: { backgroundColor: '#dc3545', borderColor: '#dc3545' } },
      onOk: async () => {
        try {
          await rejectCounterOffer(offerId, '', sport)
          notification.success({ message: 'Counter offer rejected' })
          dispatch(getMyOffers())
        } catch (error) {
          notification.error({ message: 'Failed to reject counter offer' })
        }
      },
    })
  }

  // ============================================
  // COUNTER OFFER MODAL
  // ============================================
  const renderCounterModal = () => {
    return (
      <Modal
        title="Send Counter Offer"
        visible={counterModalVisible}
        onOk={handleSendCounter}
        onCancel={() => setCounterModalVisible(false)}
        okText="Send"
        cancelText="Cancel"
        confirmLoading={loading}
        centered
        bodyStyle={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
        }}
        modalRenderToBody={true}
        style={{ backdropFilter: 'blur(8px)' }}
        okButtonProps={{ style: { backgroundColor: accent?.primary, borderColor: accent?.primary } }}
      >
        <div style={styles.modalContent(accent)}>
          <label style={styles.inputLabel}>Counter Price (SP)</label>
          <Input
            type="number"
            placeholder="Enter counter price"
            value={counterOffer.price}
            onChange={e => setCounterOffer({ ...counterOffer, price: e.target.value })}
            style={styles.input(accent)}
          />

          <label style={{ ...styles.inputLabel, marginTop: '16px' }}>Message (Optional)</label>
          <Input.TextArea
            placeholder="Add a message to the seller"
            value={counterOffer.message}
            onChange={e => setCounterOffer({ ...counterOffer, message: e.target.value })}
            rows={4}
            style={styles.textarea(accent)}
          />
        </div>
      </Modal>
    )
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={styles.container}>
      <div style={styles.tabBar(accent)}>
        <button
          onClick={() => setActiveTab('listings')}
          style={styles.tabPill(activeTab === 'listings', accent)}
        >
          My Listings
        </button>
        <button
          onClick={() => setActiveTab('received')}
          style={styles.tabPill(activeTab === 'received', accent)}
        >
          Received Offers
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          style={styles.tabPill(activeTab === 'sent', accent)}
        >
          Sent Offers
        </button>
      </div>

      <Spin spinning={exchangeLoading} tip="Loading..." style={styles.spinner}>
        <div style={styles.tabContent}>
          {activeTab === 'listings' && renderMyListings()}
          {activeTab === 'received' && renderReceivedOffers()}
          {activeTab === 'sent' && renderSentOffers()}
        </div>
      </Spin>

      {renderCounterModal()}
    </div>
  )
}

// ============================================
// STYLES
// ============================================
const styles = {
  container: {
    padding: '24px',
    minHeight: '100vh',
  },

  tabBar: accent => ({
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: `2px solid ${accent?.rgba || 'rgba(255, 255, 255, 0.1)'}`,
    paddingBottom: '16px',
  }),

  tabPill: (active, accent) => ({
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: active ? accent?.primary : 'transparent',
    color: active ? '#fff' : 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Rajdhani, Inter, sans-serif',
    fontSize: '14px',
    fontWeight: active ? 600 : 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: active ? `0 0 20px ${accent?.rgba || 'rgba(255, 255, 255, 0.1)'}` : 'none',
  }),

  tabContent: {
    minHeight: '400px',
  },

  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '16px',
  },

  card: accent => ({
    backgroundColor: 'rgba(30, 30, 46, 0.6)',
    borderRadius: '12px',
    border: `1px solid ${accent?.rgba || 'rgba(255, 255, 255, 0.1)'}`,
    padding: '16px',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: 'rgba(30, 30, 46, 0.8)',
      borderColor: accent?.primary,
    },
  }),

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: 'rgba(255, 255, 255, 0.1) solid 1px',
  },

  cardTitle: {
    margin: 0,
    color: '#fff',
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: 'Rajdhani, sans-serif',
    marginBottom: '4px',
  },

  cardSubtitle: {
    margin: 0,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '12px',
    fontFamily: "'Barlow Condensed', sans-serif",
  },

  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  listingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter, sans-serif',
  },

  label: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: 500,
  },

  priceValue: {
    color: '#fbbf24',
    fontWeight: 600,
    fontFamily: 'Rajdhani, sans-serif',
  },

  statusBadge: (status, accent) => {
    let bgColor = 'rgba(107, 114, 128, 0.3)'
    let borderColor = 'rgb(107, 114, 128)'
    let textColor = 'rgb(209, 213, 219)'

    if (status === 'pending') {
      bgColor = 'rgba(251, 191, 36, 0.2)'
      borderColor = '#fbbf24'
      textColor = '#fbbf24'
    } else if (status === 'accepted') {
      bgColor = 'rgba(16, 185, 129, 0.2)'
      borderColor = '#10b981'
      textColor = '#10b981'
    } else if (status === 'rejected') {
      bgColor = 'rgba(239, 68, 68, 0.2)'
      borderColor = '#ef4444'
      textColor = '#ef4444'
    } else if (status === 'countered') {
      bgColor = 'rgba(59, 130, 246, 0.2)'
      borderColor = '#3b82f6'
      textColor = '#3b82f6'
    } else if (status === 'withdrawn') {
      bgColor = 'rgba(107, 114, 128, 0.2)'
      borderColor = '#6b7280'
      textColor = '#d1d5db'
    }

    return {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 8px',
      borderRadius: '6px',
      backgroundColor: bgColor,
      border: `1px solid ${borderColor}`,
      color: textColor,
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      fontFamily: 'Rajdhani, sans-serif',
    }
  },

  messageBox: accent => ({
    marginTop: '12px',
    padding: '10px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: `1px solid rgba(59, 130, 246, 0.3)`,
    borderRadius: '6px',
  }),

  messageText: {
    margin: 0,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '13px',
    fontFamily: 'Inter, sans-serif',
    lineHeight: '1.4',
  },

  buttonGroup: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    flexWrap: 'wrap',
  },

  btnAccept: accent => ({
    flex: 1,
    minWidth: '80px',
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#10b981',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'Rajdhani, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#059669',
      boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)',
    },
  }),

  btnReject: accent => ({
    flex: 1,
    minWidth: '80px',
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#dc3545',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'Rajdhani, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#c82333',
      boxShadow: '0 0 12px rgba(220, 53, 69, 0.4)',
    },
  }),

  btnCounter: accent => ({
    flex: 1,
    minWidth: '80px',
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'Rajdhani, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#2563eb',
      boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)',
    },
  }),

  btnWithdraw: accent => ({
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#6c757d',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'Rajdhani, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#5a6268',
      boxShadow: '0 0 12px rgba(108, 117, 125, 0.4)',
    },
  }),

  btnDelist: accent => ({
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#dc3545',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'Rajdhani, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#c82333',
      boxShadow: '0 0 12px rgba(220, 53, 69, 0.4)',
    },
  }),

  waitingBadge: accent => ({
    marginTop: '12px',
    padding: '8px 12px',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    border: '1px solid rgba(59, 130, 246, 0.4)',
    borderRadius: '6px',
    color: '#93c5fd',
    fontSize: '12px',
    fontFamily: 'Rajdhani, sans-serif',
    textAlign: 'center',
    fontWeight: 500,
  }),

  counterInfoBox: accent => ({
    marginTop: '12px',
    padding: '10px',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
    borderRadius: '6px',
  }),

  negotiationHistory: {
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },

  negotiationTitle: {
    margin: '0 0 8px 0',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'Rajdhani, sans-serif',
    textTransform: 'uppercase',
  },

  negotiationItem: accent => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter, sans-serif',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  }),

  negotiationFrom: {
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  negotiationAmount: {
    color: '#fbbf24',
    fontWeight: 600,
    fontFamily: 'Rajdhani, sans-serif',
  },

  negotiationDate: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
  },

  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '16px',
    fontFamily: 'Inter, sans-serif',
  },

  modalContent: accent => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  }),

  inputLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: 'Rajdhani, sans-serif',
    marginBottom: '4px',
    display: 'block',
  },

  input: accent => ({
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${accent?.rgba || 'rgba(255, 255, 255, 0.1)'}`,
    borderRadius: '6px',
    color: '#fff',
    padding: '8px 12px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '13px',
  }),

  textarea: accent => ({
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${accent?.rgba || 'rgba(255, 255, 255, 0.1)'}`,
    borderRadius: '6px',
    color: '#fff',
    padding: '8px 12px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '13px',
    resize: 'vertical',
  }),

  spinner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}

export default OffersManager
