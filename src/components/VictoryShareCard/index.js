import React, { useRef, useState } from 'react'
import { Modal, notification } from 'antd'

/* ═══════════════════════════════════════════════════════════════
   VICTORY SHARE CARD, Hybrid Design A (Stadium) + B (Trophy Card)
   Shows after a user wins a matchweek fixture.
   Props:
     open        - boolean, controls modal visibility
     onClose     - callback to close
     data        - { yourTeam, opponent, yourScore, oppScore,
                     matchweek, leagueName, record, streak,
                     mvp: { name, points, position },
                     sport }  ("soccer" | "football")
   ═══════════════════════════════════════════════════════════════ */

const VictoryShareCard = ({ open, onClose, data }) => {
  const cardRef = useRef(null)
  const [exporting, setExporting] = useState(false)

  if (!data) return null

  const diff = (data.yourScore || 0) - (data.oppScore || 0)
  const isSoccer = data.sport === 'soccer'
  const sportEmoji = isSoccer ? '⚽' : '🏈'
  const brandName = 'SAMSPORTS'

  /* ── Build share text (used by multiple share methods) ── */
  const buildShareText = () => {
    let text = `🏆 VICTORY!\n${data.yourTeam} ${data.yourScore} - ${data.oppScore} ${data.opponent}\nMatchweek ${data.matchweek} | +${diff} pts`
    if (data.mvp) text += `\nMVP: ${data.mvp.name} (${data.mvp.points} pts)`
    text += `\n\n#SamSports #FantasySports`
    return text
  }

  /* ── Export card as PNG ── */
  const exportImage = async () => {
    if (!cardRef.current || exporting) return
    setExporting(true)
    try {
      // Try to load html2canvas at runtime (only works if installed)
      const h2c = window.html2canvas
      if (h2c) {
        const canvas = await h2c(cardRef.current, {
          backgroundColor: null, scale: 2, useCORS: true, logging: false,
        })
        const url = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = `victory-gw${data.matchweek || ''}-${data.yourTeam?.replace(/\s+/g, '-') || 'team'}.png`
        link.href = url
        link.click()
      } else {
        // Fallback: copy text to clipboard
        await navigator.clipboard.writeText(buildShareText())
        notification.success({ message: 'Victory stats copied to clipboard!', duration: 2 })
      }
    } catch (err) {
      console.error('Export failed:', err)
      // Fallback to text copy
      try {
        await navigator.clipboard.writeText(buildShareText())
        notification.success({ message: 'Victory stats copied to clipboard!', duration: 2 })
      } catch (_) {}
    } finally {
      setExporting(false)
    }
  }

  /* ── Share to Twitter/X ── */
  const shareTwitter = () => {
    const text = `${data.yourTeam} ${data.yourScore} - ${data.oppScore} ${data.opponent} 🏆\nMatchweek ${data.matchweek} Victory! +${diff} pts\n${data.mvp ? `MVP: ${data.mvp.name} (${data.mvp.points} pts)` : ''}\n\n#SamSports #FantasySports`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  /* ── Share to WhatsApp ── */
  const shareWhatsApp = () => {
    const text = `🏆 *VICTORY!*\n${data.yourTeam} ${data.yourScore} - ${data.oppScore} ${data.opponent}\nMatchweek ${data.matchweek} | +${diff} pts\n${data.mvp ? `MVP: ${data.mvp.name} (${data.mvp.points} pts)` : ''}\n\nPlay on SamSports!`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  /* ── Share to Facebook ── */
  const shareFacebook = () => {
    const shareUrl = 'https://samsports.com'
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(`🏆 VICTORY! ${data.yourTeam} ${data.yourScore} - ${data.oppScore} ${data.opponent} | Matchweek ${data.matchweek} | +${diff} pts #SamSports`)}`
    window.open(url, '_blank', 'width=580,height=460')
  }

  /* ── Copy to clipboard ── */
  const copyToClipboard = async () => {
    try {
      const h2c = window.html2canvas
      if (h2c && cardRef.current) {
        const canvas = await h2c(cardRef.current, {
          backgroundColor: null, scale: 2, useCORS: true, logging: false,
        })
        canvas.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ])
            notification.success({ message: 'Image copied to clipboard!', duration: 2 })
          }
        })
      } else {
        // Fallback: copy text
        await navigator.clipboard.writeText(buildShareText())
        notification.success({ message: 'Victory stats copied to clipboard!', duration: 2 })
      }
    } catch (err) {
      console.error('Copy failed:', err)
      try {
        await navigator.clipboard.writeText(buildShareText())
        notification.success({ message: 'Victory stats copied to clipboard!', duration: 2 })
      } catch (_) {}
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      closable
      styles={{
        content: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
        mask: { background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' },
      }}
    >
      {/* ═══ THE CARD (captured as image) ═══ */}
      <div
        ref={cardRef}
        style={{
          width: '100%',
          maxWidth: 440,
          margin: '0 auto',
          borderRadius: 24,
          background: 'linear-gradient(170deg, #0A0F1A 0%, #111827 40%, #1a1040 100%)',
          border: '1px solid rgba(212,168,67,0.25)',
          overflow: 'hidden',
          position: 'relative',
          fontFamily: "'Rajdhani', 'Inter', sans-serif",
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.05)',
        }}
      >
        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,168,67,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Gold top bar (Design B) */}
        <div style={{
          height: 4,
          background: 'linear-gradient(90deg, #D4A843, #F5D98A, #D4A843)',
        }} />

        {/* ── Top Section ── */}
        <div style={{ textAlign: 'center', padding: '24px 24px 0', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #D4A843, #B8860B)',
            borderRadius: 20,
            padding: '4px 18px',
            marginBottom: 12,
          }}>
            <span style={{
              fontSize: 10, fontWeight: 800, color: '#fff',
              letterSpacing: 2, textTransform: 'uppercase',
            }}>
              Matchweek {data.matchweek}
            </span>
          </div>

          <div style={{
            fontSize: 46, fontWeight: 900, lineHeight: 1,
            background: 'linear-gradient(135deg, #D4A843, #F5D98A, #D4A843)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: 3, marginBottom: 4,
          }}>
            VICTORY
          </div>
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 1,
          }}>
            {data.leagueName}
          </div>
        </div>

        {/* ── Score Section (Design A side-by-side) ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 16, padding: '24px 20px', position: 'relative', zIndex: 1,
        }}>
          {/* Your team */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, margin: '0 auto 8px',
              background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))',
              border: '2px solid rgba(34,197,94,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>⚡</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#22C55E', lineHeight: 1.2 }}>
              {data.yourTeam}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>YOU</div>
          </div>

          {/* Score */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{
                fontSize: 52, fontWeight: 900, color: '#22C55E',
                fontFamily: "'Barlow Condensed', 'Rajdhani', sans-serif",
              }}>
                {data.yourScore}
              </span>
              <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>—</span>
              <span style={{
                fontSize: 52, fontWeight: 900, color: 'rgba(255,255,255,0.3)',
                fontFamily: "'Barlow Condensed', 'Rajdhani', sans-serif",
              }}>
                {data.oppScore}
              </span>
            </div>
            <div style={{
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 8, padding: '3px 12px', marginTop: 4, display: 'inline-block',
              fontSize: 11, fontWeight: 700, color: '#22C55E', letterSpacing: 1,
            }}>
              +{diff} PTS
            </div>
          </div>

          {/* Opponent */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, margin: '0 auto 8px',
              background: 'rgba(239,68,68,0.08)', border: '2px solid rgba(239,68,68,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>🛡️</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.55)', lineHeight: 1.2 }}>
              {data.opponent}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>OPP</div>
          </div>
        </div>

        {/* ── MVP Bar (Design B) ── */}
        {data.mvp && (
          <div style={{
            margin: '0 20px 16px', padding: '12px 14px', borderRadius: 12,
            background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.15)',
            display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: 'linear-gradient(135deg, #D4A843, #B8860B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 900, color: '#fff',
            }}>MVP</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {data.mvp.name}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
                {data.mvp.position}
              </div>
            </div>
            <div style={{
              fontSize: 18, fontWeight: 800, color: '#D4A843',
              fontFamily: "'Barlow Condensed', sans-serif",
            }}>
              {data.mvp.points}
            </div>
          </div>
        )}

        {/* ── Stats Strip (Design A) ── */}
        <div style={{
          display: 'flex', gap: 1, margin: '0 20px', position: 'relative', zIndex: 1,
          background: 'rgba(0,0,0,0.3)', borderRadius: 12, overflow: 'hidden',
        }}>
          {[
            { label: 'Record', value: data.record || '-', sub: 'Season' },
            { label: 'Streak', value: data.streak ? `${data.streak}W` : '-', sub: 'Win streak' },
            { label: 'Diff', value: `+${diff}`, sub: 'Point margin' },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: '12px 8px', textAlign: 'center',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: '#D4A843', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{s.value}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, padding: '16px 20px 18px', position: 'relative', zIndex: 1,
        }}>
          <span style={{ fontSize: 14 }}>{sportEmoji}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)',
            letterSpacing: 2, textTransform: 'uppercase',
          }}>
            {brandName}
          </span>
        </div>
      </div>

      {/* ═══ SHARE BUTTONS (outside the card, not captured in image) ═══ */}
      <div style={{
        display: 'flex', gap: 10, justifyContent: 'center',
        marginTop: 20, flexWrap: 'wrap',
      }}>
        {/* Download / Save */}
        <button
          onClick={exportImage}
          disabled={exporting}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #22C55E, #16A34A)',
            color: '#fff', fontFamily: "'Rajdhani', sans-serif",
            fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
            transition: 'opacity 0.2s',
            opacity: exporting ? 0.6 : 1,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {exporting ? 'Saving...' : 'Save Image'}
        </button>

        {/* Twitter/X */}
        <button
          onClick={shareTwitter}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.08)', color: '#fff',
            fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700,
            letterSpacing: 0.5, transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(29,155,240,0.2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </button>

        {/* WhatsApp */}
        <button
          onClick={shareWhatsApp}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.08)', color: '#fff',
            fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700,
            letterSpacing: 0.5, transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(37,211,102,0.2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </button>

        {/* Facebook */}
        <button
          onClick={shareFacebook}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.08)', color: '#fff',
            fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700,
            letterSpacing: 0.5, transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(24,119,242,0.2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>

        {/* Copy */}
        <button
          onClick={copyToClipboard}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.08)', color: '#fff',
            fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700,
            letterSpacing: 0.5, transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </button>
      </div>
    </Modal>
  )
}

export default VictoryShareCard
