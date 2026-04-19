import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

// Components
import Header from '../components/Header'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import NewRosterCard from '../components/NewRosterCard'
import Empty from '../components/Empty'
import Loader from '../components/Loader'
import { sortedArray } from '../config/helperFunctions'
import { getRoster } from '../redux/actions/rosterAction'
import { proctectedSquadCount } from '../config/constants'

const PROTECTED_SLOTS = proctectedSquadCount || 4

const PracticeSquad = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [protectedPlayers, setProtectedPlayers] = useState([])
  const [unprotectedPlayers, setUnprotectedPlayers] = useState([])
  const [playerCaps, setPlayerCaps] = useState(null)
  const [averagePf, setAveragePf] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (SETTING?.week) fetchData()
  }, [SETTING?.week])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getRoster(SETTING?.week)
      if (res) {
        const practice = res?.practice || []
        setProtectedPlayers(practice.filter((x) => x?.players?.isPlayerProtected === true))
        setUnprotectedPlayers(practice.filter((x) => x?.players?.isPlayerProtected !== true))
        setPlayerCaps(res?.currentyearsalarycap || {})
        setAveragePf(res?.averagePf || {})
      }
    } catch (error) {
      console.error('Error fetching practice squad:', error)
    } finally {
      setLoading(false)
    }
  }

  /* ── Render a single protected slot ── */
  const ProtectedSlot = ({ player, index }) => {
    if (!player) {
      // Empty slot
      return (
        <div style={{
          flex: '1 1 0', minWidth: 200, maxWidth: 280,
          background: 'rgba(34, 197, 94, 0.04)',
          border: '1px dashed rgba(34, 197, 94, 0.2)',
          borderRadius: 10, padding: '18px 14px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 6, minHeight: 100,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.08)', border: '1px dashed rgba(34, 197, 94, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: 'rgba(34, 197, 94, 0.3)',
          }}>
            {index + 1}
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
            Empty Slot
          </span>
        </div>
      )
    }

    const p = player.players
    const capHit = playerCaps?.[p?.PlayerID]
      ? `${playerCaps[p.PlayerID]?.toLocaleString()} SP`
      : '-'

    return (
      <div style={{
        flex: '1 1 0', minWidth: 200, maxWidth: 280,
        background: 'rgba(34, 197, 94, 0.06)',
        border: '1px solid rgba(34, 197, 94, 0.25)',
        borderRadius: 10, padding: '14px 14px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {/* Shield badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="#22C55E" opacity="0.25"/>
                <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="#22C55E" strokeWidth="1.5" fill="none"/>
                <polyline points="9,12 11,14 15,10" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: "'Rajdhani', sans-serif" }}>
                {p?.Name || 'Unknown'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                {p?.Position} &bull; {p?.Team}
              </div>
            </div>
          </div>
          <span style={{
            fontSize: 9, fontWeight: 700, color: '#22C55E', textTransform: 'uppercase',
            letterSpacing: 0.5, background: 'rgba(34, 197, 94, 0.1)',
            padding: '2px 6px', borderRadius: 4,
          }}>
            Protected
          </span>
        </div>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
          <span>Age: <b style={{ color: '#fff' }}>{p?.Age || '-'}</b></span>
          <span>Bye: <b style={{ color: '#fff' }}>{p?.ByeWeek || '-'}</b></span>
          <span>Cap: <b style={{ color: '#22C55E' }}>{capHit}</b></span>
        </div>
      </div>
    )
  }

  // Build the 4 protected slots (fill empty ones)
  const protectedSlots = Array.from({ length: PROTECTED_SLOTS }, (_, i) => protectedPlayers[i] || null)

  return (
    <div className='practice_squad_container'>
      <Header />
      <ButtonsAndPagination />
      <hr className='divider' />

      {loading ? (
        <Loader />
      ) : (
        <div style={{ padding: '0 20px' }}>
          {/* ── Protected Practice Squad (4 slots) ── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="#22C55E" opacity="0.2"/>
                <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="#22C55E" strokeWidth="1.5" fill="none"/>
              </svg>
              <span style={{
                fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 700,
                color: '#22C55E', textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
                Protected Practice Squad
              </span>
              <span style={{
                fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500,
              }}>
                ({protectedPlayers.length}/{PROTECTED_SLOTS} slots filled)
              </span>
            </div>
            <div style={{
              display: 'flex', gap: 12, flexWrap: 'wrap',
            }}>
              {protectedSlots.map((player, i) => (
                <ProtectedSlot key={i} player={player} index={i} />
              ))}
            </div>
          </div>

          {/* ── Practice Squad (unprotected) ── */}
          <div className='practice_squad_header'>
            <p className='heading'>
              Practice<b>Squad</b>
            </p>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 10 }}>
              {unprotectedPlayers.length} players
            </span>
          </div>
          <section className='stats_container'>
            {unprotectedPlayers.length > 0 ? (
              sortedArray(unprotectedPlayers)?.map((v, i) => (
                <NewRosterCard
                  key={i}
                  data={v}
                  index={i}
                  state={{ isTeamRoster: { status: true } }}
                  checkBoxIds={[]}
                  handleClick={() => {}}
                  playerCaps={playerCaps}
                  currentYearSalaryCap={playerCaps}
                  averagePf={averagePf}
                  isPractice={true}
                  checkBox={false}
                />
              ))
            ) : (
              <Empty text='Practice Squad is empty' />
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default PracticeSquad
