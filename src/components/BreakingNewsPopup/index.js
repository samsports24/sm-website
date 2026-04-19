import React, { useState, useEffect, useCallback } from 'react'
import { Modal, Button } from 'antd'
import { TrophyOutlined, CrownOutlined, ThunderboltOutlined } from '@ant-design/icons'

// ═══════════════════════════════════════════════════════════════
//  BREAKING NEWS POPUP
//  Displayed after each playoff/knockout round completes.
//  Shows the winners advancing and — for the final round —
//  the CHAMPION with a special celebration treatment.
//
//  Props:
//    visible        – boolean, controls modal display
//    onClose        – callback to dismiss
//    roundLabel     – e.g. "Wild Card", "Super Bowl", "Final"
//    isFinalRound   – true for Super Bowl / World Cup Final
//    winners        – [{ teamName, teamLogo, seed, conference, record }]
//    losers         – [{ teamName, teamLogo, seed, conference }]  (optional)
//    champion       – { teamName, teamLogo, record }  (only if isFinalRound)
//    sport          – "nfl" | "soccer"
// ═══════════════════════════════════════════════════════════════

const COLORS = {
  bg: '#0A0F1A',
  glass: 'rgba(20, 28, 45, 0.95)',
  gold: '#D4A843',
  goldDark: '#B8860B',
  goldGlow: 'rgba(212, 168, 67, 0.25)',
  red: '#EF4444',
  green: '#22C55E',
  text: '#fff',
  muted: 'rgba(255,255,255,0.6)',
  dim: 'rgba(255,255,255,0.35)',
  border: 'rgba(110, 105, 128, 0.2)',
}

const BreakingNewsPopup = ({
  visible = false,
  onClose,
  roundLabel = '',
  isFinalRound = false,
  winners = [],
  losers = [],
  champion = null,
  sport = 'nfl',
}) => {
  const [animPhase, setAnimPhase] = useState(0)

  // Stagger animations on open
  useEffect(() => {
    if (!visible) { setAnimPhase(0); return }
    const t1 = setTimeout(() => setAnimPhase(1), 100)   // banner slides in
    const t2 = setTimeout(() => setAnimPhase(2), 600)   // teams appear
    const t3 = setTimeout(() => setAnimPhase(3), 1200)  // champion glow (if final)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [visible])

  const isChampion = isFinalRound && champion

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={isChampion ? 640 : 580}
      styles={{
        content: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
        mask: {
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
        },
      }}
    >
      <div style={{
        background: `linear-gradient(180deg, ${COLORS.glass} 0%, rgba(10, 15, 26, 0.98) 100%)`,
        borderRadius: '20px',
        border: `1px solid ${isChampion ? COLORS.gold : COLORS.border}`,
        boxShadow: isChampion
          ? `0 0 60px ${COLORS.goldGlow}, 0 0 120px rgba(212, 168, 67, 0.1), 0 8px 32px rgba(0,0,0,0.5)`
          : '0 8px 32px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        position: 'relative',
      }}>

        {/* ── BREAKING NEWS BANNER ── */}
        <div style={{
          background: isChampion
            ? `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldDark} 50%, ${COLORS.gold} 100%)`
            : `linear-gradient(135deg, ${COLORS.red} 0%, #DC2626 100%)`,
          padding: '14px 24px',
          textAlign: 'center',
          transform: animPhase >= 1 ? 'translateY(0)' : 'translateY(-100%)',
          opacity: animPhase >= 1 ? 1 : 0,
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: isChampion ? '13px' : '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '3px',
            color: isChampion ? COLORS.bg : '#fff',
            marginBottom: '2px',
          }}>
            {isChampion ? (sport === 'nfl' ? '🏆 SUPER BOWL CHAMPION 🏆' : '🏆 WORLD CUP CHAMPION 🏆') : '⚡ BREAKING NEWS ⚡'}
          </div>
          {!isChampion && (
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: 'rgba(255,255,255,0.85)',
            }}>
              {sport === 'nfl' ? 'A.Football Playoffs' : 'FIFA World Cup'} — {roundLabel} Results
            </div>
          )}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{
          padding: isChampion ? '32px 28px 28px' : '24px 28px 20px',
          opacity: animPhase >= 2 ? 1 : 0,
          transform: animPhase >= 2 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s ease 0.1s',
        }}>

          {/* ── CHAMPION DISPLAY ── */}
          {isChampion && (
            <div style={{
              textAlign: 'center',
              marginBottom: '24px',
              opacity: animPhase >= 3 ? 1 : 0,
              transform: animPhase >= 3 ? 'scale(1)' : 'scale(0.85)',
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
              {/* Trophy */}
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px',
                background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldDark})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 40px ${COLORS.goldGlow}`,
                animation: animPhase >= 3 ? 'championPulse 2s ease-in-out infinite' : 'none',
              }}>
                <TrophyOutlined style={{ fontSize: '40px', color: COLORS.bg }} />
              </div>

              {/* Champion logo */}
              {champion.teamLogo && (
                <img
                  src={champion.teamLogo}
                  alt={champion.teamName}
                  style={{
                    width: '72px', height: '72px', borderRadius: '12px',
                    objectFit: 'contain', margin: '0 auto 12px', display: 'block',
                    border: `2px solid ${COLORS.gold}`,
                    background: 'rgba(0,0,0,0.3)',
                  }}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              )}

              <h2 style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '28px',
                fontWeight: 800,
                color: COLORS.gold,
                margin: '0 0 4px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textShadow: `0 0 20px ${COLORS.goldGlow}`,
              }}>
                {champion.teamName}
              </h2>
              <p style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '16px',
                fontWeight: 600,
                color: COLORS.muted,
                margin: 0,
              }}>
                {sport === 'nfl' ? 'Super Bowl Champions' : 'World Cup Champions'}
                {champion.record ? ` — ${champion.record}` : ''}
              </p>
            </div>
          )}

          {/* ── ROUND HEADER (non-champion) ── */}
          {!isChampion && (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '22px',
                fontWeight: 800,
                color: COLORS.text,
                margin: '0 0 4px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                {roundLabel} Complete
              </h2>
              <p style={{ fontSize: '13px', color: COLORS.muted, margin: 0 }}>
                {winners.length} team{winners.length !== 1 ? 's' : ''} advancing to the next round
              </p>
            </div>
          )}

          {/* ── WINNERS LIST ── */}
          {winners.length > 0 && (
            <div style={{ marginBottom: losers.length > 0 ? '16px' : '0' }}>
              <div style={{
                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '1.5px', color: COLORS.green, marginBottom: '10px',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <ThunderboltOutlined style={{ fontSize: '12px' }} />
                {isChampion ? 'Final Matchup' : 'Advancing'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {winners.map((team, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'rgba(34, 197, 94, 0.06)',
                    border: '1px solid rgba(34, 197, 94, 0.15)',
                    borderRadius: '10px', padding: '10px 14px',
                  }}>
                    {team.teamLogo && (
                      <img
                        src={team.teamLogo}
                        alt={team.teamName}
                        style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain', background: 'rgba(0,0,0,0.2)' }}
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: '15px', fontWeight: 700, color: COLORS.text,
                      }}>
                        {team.teamName}
                      </div>
                      {(team.seed || team.conference || team.record) && (
                        <div style={{ fontSize: '11px', color: COLORS.muted }}>
                          {team.seed ? `#${team.seed} Seed` : ''}{team.conference ? ` • ${team.conference}` : ''}{team.record ? ` • ${team.record}` : ''}
                        </div>
                      )}
                    </div>
                    <div style={{
                      fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                      color: COLORS.green, letterSpacing: '0.5px',
                    }}>
                      WIN
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ELIMINATED LIST ── */}
          {losers.length > 0 && !isChampion && (
            <div>
              <div style={{
                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '1.5px', color: COLORS.red, marginBottom: '10px',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                Eliminated
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {losers.map((team, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'rgba(239, 68, 68, 0.04)',
                    border: '1px solid rgba(239, 68, 68, 0.1)',
                    borderRadius: '10px', padding: '8px 14px',
                    opacity: 0.7,
                  }}>
                    {team.teamLogo && (
                      <img
                        src={team.teamLogo}
                        alt={team.teamName}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain', background: 'rgba(0,0,0,0.2)', filter: 'grayscale(60%)' }}
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', fontWeight: 600, color: COLORS.dim }}>
                        {team.teamName}
                      </div>
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: COLORS.red, letterSpacing: '0.5px' }}>
                      OUT
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── DISMISS BUTTON ── */}
        <div style={{
          padding: '0 28px 24px', textAlign: 'center',
          opacity: animPhase >= 2 ? 1 : 0,
          transition: 'opacity 0.4s ease 0.3s',
        }}>
          <Button
            onClick={onClose}
            style={{
              background: isChampion
                ? `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldDark})`
                : 'rgba(255,255,255,0.08)',
              border: isChampion ? 'none' : `1px solid ${COLORS.border}`,
              color: isChampion ? COLORS.bg : COLORS.text,
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              fontSize: '14px',
              height: '44px',
              borderRadius: '10px',
              width: '100%',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {isChampion ? 'Celebrate!' : 'Got It'}
          </Button>
        </div>

        {/* ── Champion pulse animation ── */}
        {isChampion && (
          <style>{`
            @keyframes championPulse {
              0%, 100% { box-shadow: 0 0 40px rgba(212, 168, 67, 0.25); }
              50% { box-shadow: 0 0 60px rgba(212, 168, 67, 0.45), 0 0 80px rgba(212, 168, 67, 0.15); }
            }
          `}</style>
        )}
      </div>
    </Modal>
  )
}

export default BreakingNewsPopup
