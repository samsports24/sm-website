import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getGameDetails } from '../redux'
import { useSelector } from 'react-redux'
import Header from '../components/Header'
import Loader from '../components/Loader'
import HeadingAndWeek from '../components/Pagination/HeadingAndWeek'
import Player1 from '../assets/player-img-60x60.png'
import ViewBreakdown from '../components/modal/ViewBreakdown'
import { positions } from '../config/constants'

const mapPos = (p) => positions[p] || p

// ═══════════════════════════════════════════════════════
//  SHARED STYLES
// ═══════════════════════════════════════════════════════
const glass = {
  background: 'rgba(20,28,45,0.6)', backdropFilter: 'blur(12px)',
  border: '1px solid rgba(110,105,128,0.15)', borderRadius: 16,
  boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)',
}
const glassCard = {
  background: 'rgba(20,28,45,0.7)', backdropFilter: 'blur(8px)',
  border: '1px solid rgba(110,105,128,0.1)', borderRadius: 12,
}

const GameDetails = () => {
  const SETTING = useSelector((s) => s?.user?.setting)
  const { state } = useLocation()
  const [Data, setData] = useState(null)
  const [backupPlayer, setBackupPlayer] = useState(null)
  const [benchPlayer, setBenchPlayer] = useState([])
  const [lockedPlayer, setLockedPlayer] = useState(null)
  const [loading, setLoading] = useState(true)

  const { data } = state || {}
  const score1 = data?.scoreOne, score2 = data?.scoreTwo
  const t1S = data?.record?.teamOne?.starterSum?.toFixed(2)
  const t2S = data?.record?.teamTwo?.starterSum?.toFixed(2)
  const t1B25 = data?.record?.teamOne?.bench25Sum?.toFixed(2)
  const t2B25 = data?.record?.teamTwo?.bench25Sum?.toFixed(2)

  useEffect(() => { if (SETTING?.week) getData() }, [])

  const getData = async () => {
    setLoading(true)
    const d = await getGameDetails({ team1: data?.opponentOne?._id, team2: data?.opponentTwo?._id, week: SETTING?.week })
    // Find BQB starter for locked player count
    const bqb = d?.starters?.find(v => v?.position?.toLowerCase() === 'bqb')
    setBackupPlayer(bqb || null)

    // Build bench arrays
    const b1L = d?.bench1?.length || 0, b2L = d?.bench2?.length || 0
    const maxLen = Math.max(b1L, b2L)
    const bench = []
    for (let i = 0; i < maxLen; i++) {
      bench.push({
        player1: d?.bench1?.[i]?.players || null,
        player2: d?.bench2?.[i]?.players || null,
        position: 'BNH',
      })
    }
    setBenchPlayer(bench)
    setData(d)

    // Locked counts
    const all = [...(d?.starters || []), ...bench]
    if (bqb) all.push(bqb)
    setLockedPlayer({
      player1: { locked: all.filter(v => v?.player1?.isPlayerLocked).length, unlocked: all.filter(v => v?.player1 && !v.player1.isPlayerLocked).length },
      player2: { locked: all.filter(v => v?.player2?.isPlayerLocked).length, unlocked: all.filter(v => v?.player2 && !v.player2.isPlayerLocked).length },
    })
    setLoading(false)
  }

  // Separate starters by category
  const allStarters = Data?.starters || []
  const OFFENSE_POS = ['QB', 'RB', 'WR', 'TE', 'FLEX', 'OL', 'RB/WR', 'WR/TE', 'RB/WR/TE']
  const DEFENSE_POS = ['DL', 'LB', 'DB', 'CB', 'S', 'DE', 'DT', 'MLB', 'OLB', 'ILB', 'SS', 'FS', 'DFLX', 'ED', 'IDL', 'EDGE']
  const SPECIAL_POS = ['K', 'P', 'BQB']

  const getCategory = (pos) => {
    if (!pos) return 'offense'
    const p = pos.toUpperCase()
    if (SPECIAL_POS.includes(p)) return 'special'
    if (DEFENSE_POS.includes(p)) return 'defense'
    if (OFFENSE_POS.includes(p)) return 'offense'
    // Check if position contains any defense keyword
    if (['DL', 'LB', 'DB', 'CB', 'DE', 'DT', 'SS', 'FS'].some(d => p.includes(d))) return 'defense'
    return 'offense'
  }

  const offense = allStarters.filter(v => getCategory(v?.position) === 'offense')
  const defense = allStarters.filter(v => getCategory(v?.position) === 'defense')
  const special = allStarters.filter(v => getCategory(v?.position) === 'special')

  const leading1 = score1 > score2
  const diff = Math.abs((score1||0) - (score2||0)).toFixed(2)

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#0A0F1A' }}>
      <Header />
      <HeadingAndWeek week={false} />

      {loading ? <Loader /> : (
        <div style={{ padding: '20px 24px', maxWidth: 1200, margin: '0 auto' }}>

          {/* ══════ SCOREBOARD HEADER ══════ */}
          <div style={{ ...glass, padding: '28px 32px', marginBottom: 20, display: 'flex', alignItems: 'center' }}>
            {/* Team 1 */}
            <TeamHeader
              logo={data?.opponentOne?.logo} name={data?.opponentOne?.name}
              record={`${data?.record?.teamOne?.win || 0}-${data?.record?.teamOne?.lose || 0}`}
              score={score1} leading={leading1} diff={diff}
              starters={t1S} bench25={t1B25}
              locked={lockedPlayer?.player1?.locked} unlocked={lockedPlayer?.player1?.unlocked}
              isLeft
            />

            {/* VS */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%', flexShrink: 0, margin: '0 16px',
              background: 'rgba(10,15,26,0.9)', backdropFilter: 'blur(8px)',
              border: '2px solid rgba(34,197,94,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 0 16px rgba(34,197,94,0.15)',
            }}>
              <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 18, fontWeight: 900, color: '#22C55E' }}>VS</span>
            </div>

            {/* Team 2 */}
            <TeamHeader
              logo={data?.opponentTwo?.logo} name={data?.opponentTwo?.name}
              record={`${data?.record?.teamTwo?.win || 0}-${data?.record?.teamTwo?.lose || 0}`}
              score={score2} leading={!leading1 && score1 !== score2} diff={diff}
              starters={t2S} bench25={t2B25}
              locked={lockedPlayer?.player2?.locked} unlocked={lockedPlayer?.player2?.unlocked}
            />
          </div>

          {/* ══════ OFFENSE ══════ */}
          <Section title="OFFENSE" icon="🏈" count={offense.length}>
            {offense.map((p, i) => <MatchupRow key={i} data={p} />)}
          </Section>

          {/* ══════ DEFENSE ══════ */}
          <Section title="DEFENSE" icon="🛡️" count={defense.length}>
            {defense.map((p, i) => <MatchupRow key={i} data={p} />)}
          </Section>

          {/* ══════ SPECIAL TEAMS (K, P, Backup QB at 25%) ══════ */}
          {special.length > 0 && (
            <Section title="SPECIAL TEAMS" icon="🦶" count={special.length} subtitle={special.some(s => s?.position?.toUpperCase() === 'BQB') ? 'Backup QB scores at 25%' : ''}>
              {special.map((p, i) => (
                <MatchupRow key={i} data={p} isBench={p?.position?.toUpperCase() === 'BQB'} />
              ))}
            </Section>
          )}

          {/* If no categorization worked, show all starters */}
          {offense.length === 0 && defense.length === 0 && special.length === 0 && allStarters.length > 0 && (
            <Section title="ALL STARTERS" icon="🏈" count={allStarters.length}>
              {allStarters.map((p, i) => <MatchupRow key={i} data={p} />)}
            </Section>
          )}

          {/* ══════ STARTERS TOTAL ══════ */}
          <TotalBar label="STARTERS TOTAL" left={t1S} right={t2S} />

          {/* ══════ BENCH (25%) ══════ */}
          <Section title="BENCH" icon="🪑" count={benchPlayer.length} subtitle="Scores at 25% value">
            {benchPlayer.map((p, i) => <MatchupRow key={i} data={p} isBench />)}
          </Section>

          <TotalBar label="25% BENCH SCORE" left={t1B25} right={t2B25} green />

          {/* ══════ FINAL TOTAL ══════ */}
          <div style={{ ...glass, padding: '20px 32px', marginTop: 16, marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 28, fontWeight: 900, color: leading1 ? '#22C55E' : '#fff' }}>{score1?.toFixed(2)}</span>
            <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: 2 }}>FINAL SCORE</span>
            <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 28, fontWeight: 900, color: !leading1 && score1 !== score2 ? '#22C55E' : '#fff' }}>{score2?.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
//  TEAM HEADER
// ═══════════════════════════════════════════════════════
const TeamHeader = ({ logo, name, record, score, leading, diff, starters, bench25, locked, unlocked, isLeft }) => (
  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14, flexDirection: isLeft ? 'row' : 'row-reverse' }}>
    <img src={logo} alt="" style={{ width: 80, height: 80, objectFit: 'contain', flexShrink: 0 }} />
    <div style={{ flex: 1, textAlign: isLeft ? 'left' : 'right' }}>
      <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>{name}</div>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>({record})</div>
      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
        Starters: {starters || '-'} &bull; Bench 25%: {bench25 || '-'}
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
        Locked: {locked || '-'} &bull; Left: {unlocked || '-'}
      </div>
    </div>
    <div style={{ textAlign: 'center', minWidth: 70 }}>
      <div style={{
        fontFamily: "'Rajdhani',sans-serif", fontSize: 40, fontWeight: 900, lineHeight: 1,
        color: leading ? '#22C55E' : '#fff',
        textShadow: leading ? '0 0 20px rgba(34,197,94,0.3)' : 'none',
      }}>{score?.toFixed(2)}</div>
      {leading && <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 600, color: '#22C55E' }}>+{diff}</div>}
    </div>
  </div>
)

// ═══════════════════════════════════════════════════════
//  SECTION
// ═══════════════════════════════════════════════════════
const Section = ({ title, icon, count, subtitle, children }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 10px', padding: '0 4px' }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 2 }}>{title}</span>
      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>({count})</span>
      {subtitle && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: '#F59E0B', marginLeft: 'auto', fontWeight: 600 }}>{subtitle}</span>}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {children}
    </div>
  </div>
)

// ═══════════════════════════════════════════════════════
//  MATCHUP ROW, Player vs Player
// ═══════════════════════════════════════════════════════
const MatchupRow = ({ data, isBench }) => {
  const PlayerSide = ({ player, isRight }) => {
    if (!player?.Name && !player?.ShortName) return (
      <div style={{ flex: 1, ...glassCard, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 52, opacity: 0.4 }}>
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Empty</span>
      </div>
    )
    const nm = player?.Name?.length >= 17 ? player?.ShortName : player?.Name
    const score = player?.playerScore
    const img = player?.HostedHeadshotNoBackgroundUrl || Player1
    const hasBreakdown = player?.playerScoreBreakDown?.length > 0

    return (
      <div style={{
        flex: 1, ...glassCard, padding: '6px 12px',
        display: 'flex', flexDirection: isRight ? 'row-reverse' : 'row', alignItems: 'center', gap: 8,
        opacity: isBench ? 0.75 : 1,
        transition: 'all 0.2s',
      }}>
        {/* Photo */}
        <img src={img} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(110,105,128,0.2)', flexShrink: 0 }} />

        {/* Info */}
        <div style={{ flex: 1, textAlign: isRight ? 'right' : 'left', overflow: 'hidden' }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nm || '-'}</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: '#22C55E', fontWeight: 600 }}>
            {mapPos(player?.Position)} <span style={{ color: 'rgba(255,255,255,0.3)' }}>- {player?.Team}</span>
          </div>
        </div>

        {/* Breakdown */}
        {hasBreakdown && <div style={{ flexShrink: 0 }}><ViewBreakdown data={player} /></div>}

        {/* Score */}
        <div style={{
          minWidth: 44, textAlign: 'center', padding: '4px 6px', borderRadius: 8,
          background: score > 10 ? 'rgba(34,197,94,0.1)' : score > 5 ? 'rgba(212,168,67,0.08)' : 'transparent',
        }}>
          <span style={{
            fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 800,
            color: score > 10 ? '#22C55E' : score > 5 ? '#D4A843' : score > 0 ? '#fff' : 'rgba(255,255,255,0.25)',
          }}>{score || '-'}</span>
          {isBench && score > 0 && (
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, color: '#F59E0B', fontWeight: 600 }}>
              25%: {(score * 0.25).toFixed(1)}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <PlayerSide player={data?.player1} />

      {/* Position Badge */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0, margin: '0 -4px', zIndex: 2,
        background: 'rgba(10,15,26,0.95)', border: '2px solid rgba(34,197,94,0.3)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      }}>
        {data?.position?.split('/').map(pos => (
          <span key={pos} style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, fontWeight: 800, color: isBench ? '#F59E0B' : '#22C55E', lineHeight: 1.1 }}>{pos}</span>
        ))}
      </div>

      <PlayerSide player={data?.player2} isRight />
    </div>
  )
}

// ═══════════════════════════════════════════════════════
//  TOTAL BAR
// ═══════════════════════════════════════════════════════
const TotalBar = ({ label, left, right, green }) => (
  <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0', gap: 0 }}>
    <div style={{ flex: 1, textAlign: 'right', padding: '12px 20px', background: 'rgba(20,28,45,0.4)', borderRadius: '10px 0 0 10px', border: '1px solid rgba(110,105,128,0.08)', borderRight: 'none' }}>
      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: green ? '#22C55E' : '#fff' }}>{left || '-'}</span>
    </div>
    <div style={{
      padding: '10px 16px', minWidth: 160, textAlign: 'center', zIndex: 2, borderRadius: 10,
      background: green ? 'rgba(34,197,94,0.08)' : 'rgba(20,28,45,0.6)',
      backdropFilter: 'blur(8px)',
      border: `1px solid ${green ? 'rgba(34,197,94,0.25)' : 'rgba(110,105,128,0.15)'}`,
      boxShadow: green ? '0 0 12px rgba(34,197,94,0.1)' : '0 2px 8px rgba(0,0,0,0.2)',
    }}>
      <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, color: green ? '#22C55E' : 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
    </div>
    <div style={{ flex: 1, textAlign: 'left', padding: '12px 20px', background: 'rgba(20,28,45,0.4)', borderRadius: '0 10px 10px 0', border: '1px solid rgba(110,105,128,0.08)', borderLeft: 'none' }}>
      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: green ? '#22C55E' : '#fff' }}>{right || '-'}</span>
    </div>
  </div>
)

export default GameDetails
