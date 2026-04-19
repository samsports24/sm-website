import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { privateAPI, attachToken } from '../../config/constants'

const UserLog = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      attachToken()
      const res = await privateAPI.get('/league/transactions')
      if (res?.data?.data) {
        setTransactions(Array.isArray(res.data.data) ? res.data.data : [])
      }
    } catch {
      // API might not exist yet, show empty state
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='player_ranking_box'>
      <header>
        <h3>User Log</h3>
      </header>
      <section className='player_ranking_body'>
        {loading ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
            Loading...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
            No activity yet
          </div>
        ) : (
          transactions.map((t, i) => (
            <div key={t._id || i} className='card_box'>
              <h6>{i + 1}.</h6>
              <h6>{t.description || t.message || `${t.userName || 'User'}, ${t.type || 'activity'}`}</h6>
            </div>
          ))
        )}
      </section>
    </div>
  )
}

export default UserLog
