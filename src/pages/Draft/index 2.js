import React, { useEffect, useRef, useState } from 'react'
import { GiAmericanFootballPlayer } from 'react-icons/gi'
import Header from '../../components/Header'
import Loader from '../../components/Loader'
import ClockComponent from './ClockComponent'
import RoundComponent from './RoundComponent'
import RosterDetail from './RosterDetail'
import TableComponent from './TableComponent'
import DraftChatWidget from '../../components/DraftChatWidget'
import OnboardingGuide from '../../components/OnboardingGuide'

import { getDraftRound, toggleAutoDraft, getSmartAutoDraftPick, addPlayerToDraft } from '../../redux/actions/draftAction'
import { getLeagueDetails } from '../../redux'
import { useSelector } from 'react-redux'
import { Switch, notification } from 'antd'

const Draft = () => {
  const isMounted = useRef(false)
  const { socket } = useSelector((state) => state.socket)
  const { currentLeague } = useSelector((state) => state.league)
  const { roundLoading, completed, onTheClock } = useSelector((state) => state.draft)
  const user = useSelector((state) => state.user)
  const [loading, setLoading] = useState(true)

  // Autodraft state
  const [autoDraftOn, setAutoDraftOn] = useState(false)

  // Draft pick announcement popup state
  const [pickAnnouncement, setPickAnnouncement] = useState(null)

  const isMyPick = onTheClock?.team?._id === user?.userDetails?.team?._id

  // Smart autodraft, when it's my turn and autodraft is ON
  // Picks within 10 seconds (no clock rundown), then moves to next user
  useEffect(() => {
    if (autoDraftOn && isMyPick && !loading) {
      // Show countdown notification
      notification.info({
        key: 'autodraft-countdown',
        message: '🤖 Autodraft Active',
        description: 'Analyzing squad needs... picking in 3 seconds',
        duration: 3,
      })

      const autoPickTimer = setTimeout(async () => {
        try {
          const result = await getSmartAutoDraftPick()
          if (result?.player?._id) {
            const draftState = require('../../redux/store').default.getState().draft
            await addPlayerToDraft({
              playerId: result.player._id,
              position: draftState?.draftCounter?.position,
              round: draftState?.draftCounter?.round,
              remainingTime: 0,
              teamId: user?.userDetails?.team?._id,
              teamName: user?.userDetails?.team?.name,
            })
            notification.destroy('autodraft-countdown')
            notification.success({
              message: `🤖 Auto-drafted: ${result.player.Name}`,
              description: `${result.player.Position}, filled ${result.position} need | ${(result.player.projectedFantasyPoints || result.player.FantasyPoints24)?.toFixed(1) || '?'} projected pts`,
              duration: 5,
            })
            getData()
          }
        } catch (err) {
          console.error('Autodraft pick failed:', err)
          notification.destroy('autodraft-countdown')
        }
      }, 3000) // 3 second delay, pick quickly, no clock rundown

      return () => {
        clearTimeout(autoPickTimer)
        notification.destroy('autodraft-countdown')
      }
    }
  }, [autoDraftOn, isMyPick, loading])

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    !loading && setLoading(true)
    await getLeagueDetails()
    await getDraftRound(true)
    setLoading(false)
  }

  useEffect(() => {
    if (socket) {
      socket.on('draftLive', getData)
      socket.on('draftPick', (data) => {
        if (data) {
          setPickAnnouncement({
            playerName: data.playerName || data.player?.Name || 'Player',
            playerImage: data.playerImage || data.player?.HostedHeadshotNoBackgroundUrl || null,
            teamName: data.teamName || 'Team',
            position: data.position || data.player?.Position || '',
            round: data.round || 1,
            pick: data.pick || 1,
          })
          setTimeout(() => setPickAnnouncement(null), 5000)
        }
        getData()
      })
      socket.on('draft_pause_status', (data) => {
        // Refresh league details so ClockComponent picks up the new pause state
        getLeagueDetails()
        if (data?.autoResumed) {
          notification.warning({
            message: 'Draft Auto-Resumed',
            description: '5-minute pause timeout has expired. The draft has resumed.',
            duration: 5,
          })
        } else if (data?.paused) {
          notification.info({
            message: 'Draft Paused',
            description: 'A team has called a timeout. Waiting for commissioner to resume.',
            duration: 5,
          })
        } else {
          notification.success({
            message: 'Draft Resumed',
            description: 'The commissioner has resumed the draft.',
            duration: 3,
          })
        }
      })
      return () => {
        socket.off('draftLive', getData)
        socket.off('draftPick')
        socket.off('draft_pause_status')
      }
    }
  }, [socket])

  return (
    <div className="pro_league_container">
      <Header />

      <OnboardingGuide tabKey="draft" />

      {/* Autodraft Toggle Bar */}
      {!currentLeague?.draftCompleted && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px', margin: '0 16px 8px',
          background: autoDraftOn ? 'rgba(34,197,94,0.08)' : 'rgba(20,28,45,0.6)',
          border: autoDraftOn ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(110,105,128,0.15)',
          borderRadius: '10px', transition: 'all 200ms',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px' }}>🤖</span>
            <div>
              <div style={{
                fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', fontWeight: 700,
                color: autoDraftOn ? '#22C55E' : 'rgba(255,255,255,0.7)', textTransform: 'uppercase',
              }}>
                Autodraft {autoDraftOn ? 'Active' : 'Off'}
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: '10px',
                color: 'rgba(255,255,255,0.4)',
              }}>
                {autoDraftOn ? 'System picks best available when on the clock' : 'Enable to auto-pick from queue or best available'}
              </div>
            </div>
          </div>
          <Switch
            checked={autoDraftOn}
            onChange={async (checked) => {
              setAutoDraftOn(checked)
              await toggleAutoDraft(checked)
            }}
            checkedChildren="ON"
            unCheckedChildren="OFF"
            style={{
              background: autoDraftOn ? '#22C55E' : 'rgba(110,105,128,0.3)',
            }}
          />
        </div>
      )}

      <div className='main_draft_container'>
        {loading || roundLoading ? (
          <Loader />
        ) : (
          <>
            {!currentLeague?.draftCompleted ? (
              <>
                <div className='main_d_left'>
                  <ClockComponent />
                  <RoundComponent height={'485px'} />
                </div>
                <div className='main_d_center'>
                  <RosterDetail />
                  <TableComponent professionalDraft tableScroll={{ x: 1000, y: 329 }} autoDraftOn={autoDraftOn} />
                </div>
              </>
            ) : (
              <LeagueEnd />
            )}
          </>
        )}
      </div>

      {/* Draft Chat - Fixed bottom left */}
      <div style={{
        position: 'fixed', bottom: '16px', left: '200px', width: '320px', zIndex: 5,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)', borderRadius: '16px', overflow: 'hidden',
      }}>
        <DraftChatWidget leagueName={currentLeague?.name || 'Draft Chat'} height='360px' />
      </div>

      {/* Draft Pick Announcement Popup */}
      {pickAnnouncement && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, pointerEvents: 'none',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(10,15,26,0.97), rgba(20,28,45,0.97))',
            backdropFilter: 'blur(24px)', border: '2px solid rgba(34,197,94,0.5)',
            borderRadius: '24px', padding: '40px 48px', textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(34,197,94,0.15)',
            animation: 'fadeInScale 0.4s ease-out', maxWidth: '420px', width: '90%', pointerEvents: 'auto',
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px',
              background: pickAnnouncement.playerImage
                ? `url(${pickAnnouncement.playerImage}) center/cover`
                : 'linear-gradient(135deg, #22C55E, #22C55E88)',
              border: '3px solid #22C55E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: 800, color: '#fff', fontFamily: "'Rajdhani', sans-serif",
              boxShadow: '0 4px 20px rgba(34,197,94,0.3)',
            }}>
              {!pickAnnouncement.playerImage && <GiAmericanFootballPlayer size={40} color='rgba(255,255,255,0.7)' />}
            </div>
            <div style={{
              fontSize: '12px', fontWeight: 800, color: '#22C55E', fontFamily: "'Rajdhani', sans-serif",
              textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '8px',
            }}>
              Player Drafted
            </div>
            <div style={{
              fontSize: '28px', fontWeight: 800, color: '#fff', fontFamily: "'Rajdhani', sans-serif",
              lineHeight: 1.2, marginBottom: '4px',
            }}>
              {pickAnnouncement.playerName}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{
                padding: '3px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                background: 'rgba(34,197,94,0.15)', color: '#22C55E', fontFamily: "'Rajdhani', sans-serif",
              }}>
                {pickAnnouncement.position}
              </span>
            </div>
            <div style={{
              fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: "'Inter', sans-serif",
              marginBottom: '4px',
            }}>
              goes to
            </div>
            <div style={{
              fontSize: '22px', fontWeight: 800, color: '#22C55E', fontFamily: "'Rajdhani', sans-serif",
              marginBottom: '16px',
            }}>
              {pickAnnouncement.teamName}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif" }}>
              Round {pickAnnouncement.round} &bull; Pick #{pickAnnouncement.pick}
            </div>
            <div style={{
              marginTop: '20px', height: '3px', borderRadius: '2px',
              background: 'rgba(255,255,255,0.1)', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', background: 'linear-gradient(90deg, #22C55E, #10B981)',
                borderRadius: '2px', animation: 'shrinkBar 5s linear forwards',
              }} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes shrinkBar {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  )
}

const LeagueEnd = () => {
  return (
    <section className='coming_soon'>
      <h1>Live Draft is Completed!</h1>
      <div className='time_container'></div>
    </section>
  )
}

const LeaguePaused = () => {
  return (
    <section className='coming_soon'>
      <h1>Playoff Draft is Paused!</h1>
      <div className='time_container'></div>
    </section>
  )
}

export default Draft
