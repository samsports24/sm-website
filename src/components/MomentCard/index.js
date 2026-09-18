import React, { useState, useMemo } from 'react'
import { privateAPI, attachToken } from "../../config/constants"

// ═══════════════════════════════════════════════════════════════════════════
//  A MOMENT
//
//  A bid won, an offer received, a goal by somebody in your squad - told as a
//  card instead of a grey line. Club colour down the side so it belongs to a
//  team at a glance, the player's face, the number, and the arithmetic behind
//  the number. That last part is the point: "+1.17" invites an argument,
//  "1.00 goal, 0.17 for the assist" settles it.
//
//  Reactions and comments are optimistic. A pill that waits on a round trip
//  before it lights up feels broken, and the cost of being wrong is that a
//  count is off by one until the next load - which is a far smaller sin than
//  a button that seems not to work.
// ═══════════════════════════════════════════════════════════════════════════

// The four that carry almost everything, plus a picker for the rest. A short
// list is a feature: twenty choices is a menu, four is a reflex.
const QUICK = ['🔥', '😱', '💚', '💀']
const MORE = ['😂', '👏', '🤝', '😭', '🤡', '🧊', '🎯', '🫡']

const initials = (name) =>
  String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

const ago = (d) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'now'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}

export default function MomentCard({ msg, meId }) {
  const m = msg.moment || {}
  const team = m.team || '#22C55E'
  const lift = m.teamLift || team

  const [reactions, setReactions] = useState(msg.reactions || [])
  const [comments, setComments] = useState(msg.comments || [])
  const [open, setOpen] = useState(false)
  const [picker, setPicker] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  // A headshot that 404s should cost a silhouette, not a broken layout.
  const [faceBroken, setFaceBroken] = useState(false)

  const shown = useMemo(
    () => [...reactions].sort((a, b) => b.count - a.count).slice(0, 6),
    [reactions]
  )

  const react = async (emoji) => {
    setPicker(false)
    // Optimistic: move the pill now, reconcile with the server after.
    setReactions((prev) => {
      const next = prev.map((r) => ({ ...r }))
      const row = next.find((r) => r.emoji === emoji)
      if (!row) return [...next, { emoji, count: 1, mine: true }]
      row.count += row.mine ? -1 : 1
      row.mine = !row.mine
      return next.filter((r) => r.count > 0)
    })
    try {
      attachToken()
      const { data } = await privateAPI.post(`/chat/${msg.id || msg._id}/react`, { emoji })
      if (data?.data?.reactions) setReactions(data.data.reactions)
    } catch (e) {
      // Leave the optimistic state. It corrects itself on the next load, and
      // an error toast for a tapped emoji is worse than a count off by one.
    }
  }

  const comment = async () => {
    const text = draft.trim()
    if (!text || sending) return
    setSending(true)
    try {
      attachToken()
      const { data } = await privateAPI.post(`/chat/${msg.id || msg._id}/comment`, { text })
      if (data?.data?.comment) setComments((c) => [...c, data.data.comment])
      setDraft('')
    } catch (e) {
      // Keep what they typed. Losing a comment to a failed request is the one
      // outcome there is no excuse for.
    } finally {
      setSending(false)
    }
  }

  const face = m.playerImage && !faceBroken
  const S = {
    card: {
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10,
      borderLeft: `4px solid ${team}`, background: 'rgba(255,255,255,0.02)',
      margin: '6px 0', maxWidth: 620,
    },
    top: { display: 'flex', gap: 0, alignItems: 'stretch' },
    faceWrap: {
      width: 86, flexShrink: 0, background: team,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      minHeight: 96, overflow: 'hidden',
    },
    initials: {
      fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, fontSize: 26,
      color: 'rgba(0,0,0,0.55)', alignSelf: 'center', letterSpacing: 0.5,
    },
    body: { flex: 1, minWidth: 0, padding: '12px 14px' },
    badges: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 },
    badgeTeam: {
      background: team, color: '#0A0F1A', fontWeight: 800, fontSize: 10.5,
      letterSpacing: 0.6, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4,
    },
    badgeKind: {
      border: `1px solid ${lift}`, color: lift, fontWeight: 800, fontSize: 10.5,
      letterSpacing: 0.6, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4,
    },
    when: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 },
    what: {
      fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700,
      color: '#fff', lineHeight: 1.25,
    },
    who: {
      fontSize: 11.5, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
      letterSpacing: 0.7, fontWeight: 600, marginTop: 2,
    },
    worthRow: {
      display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10,
      paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap',
    },
    worth: { color: '#22C55E', fontWeight: 800, fontSize: 21, fontFamily: "'Rajdhani', sans-serif" },
    worthBreak: { fontSize: 12.5, color: 'rgba(255,255,255,0.55)' },
    link: {
      display: 'inline-block', marginTop: 8, border: '1px solid #3B82F6', color: '#93C5FD',
      fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase',
      padding: '4px 10px', borderRadius: 4, textDecoration: 'none',
    },
    bar: {
      display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      padding: '8px 14px', background: 'rgba(0,0,0,0.25)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
    },
    pill: (mine) => ({
      display: 'inline-flex', alignItems: 'center', gap: 6,
      border: `1px solid ${mine ? lift : 'rgba(255,255,255,0.14)'}`,
      background: mine ? 'rgba(255,255,255,0.06)' : 'transparent',
      color: '#fff', borderRadius: 999, padding: '4px 11px', fontSize: 13,
      cursor: 'pointer', lineHeight: 1,
    }),
    count: { fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.75)' },
    cmtBtn: {
      marginLeft: 'auto', background: 'none', border: 'none', color: lift,
      fontSize: 11, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase',
      cursor: 'pointer', padding: 0,
    },
    thread: { padding: '4px 14px 12px' },
    cmt: { display: 'flex', gap: 9, padding: '7px 0' },
    av: {
      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
      background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 800,
    },
    cmtName: { fontSize: 11.5, fontWeight: 800, color: '#fff', letterSpacing: 0.3 },
    cmtWhen: { fontSize: 10.5, color: 'rgba(255,255,255,0.35)', marginLeft: 6, fontWeight: 600 },
    cmtText: { fontSize: 13.5, color: 'rgba(255,255,255,0.8)', lineHeight: 1.45, marginTop: 1 },
    write: { display: 'flex', gap: 8, marginTop: 8 },
    input: {
      flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 7, color: '#fff', padding: '8px 11px', fontSize: 13.5, outline: 'none',
    },
    post: {
      background: team, color: '#0A0F1A', border: 'none', borderRadius: 7,
      padding: '8px 16px', fontWeight: 800, fontSize: 11.5, letterSpacing: 0.6,
      textTransform: 'uppercase', cursor: 'pointer',
    },
  }

  return (
    <div style={S.card}>
      <div style={S.top}>
        <div style={S.faceWrap}>
          {face ? (
            <img
              src={m.playerImage}
              alt=""
              onError={() => setFaceBroken(true)}
              style={{ width: '100%', height: 96, objectFit: 'cover', objectPosition: 'top center' }}
            />
          ) : m.playerName ? (
            <span style={S.initials}>{initials(m.playerName)}</span>
          ) : (
            // The silhouette, so a card with no player at all still reads as a card.
            <svg viewBox="0 0 78 104" width="60" height="80" aria-hidden="true" focusable="false">
              <g fill="rgba(0,0,0,.34)">
                <circle cx="39" cy="40" r="20" />
                <path d="M39 63c19 0 30 12 32 41H7c2-29 13-41 32-41z" />
              </g>
            </svg>
          )}
        </div>

        <div style={S.body}>
          <div style={S.badges}>
            {m.teamName && <span style={S.badgeTeam}>{m.teamName}</span>}
            {m.kind && <span style={S.badgeKind}>{String(m.kind).replace(/_/g, ' ')}</span>}
            {m.when && <span style={S.when}>{m.when}</span>}
          </div>

          <div style={S.what}>{m.what || msg.message}</div>
          {m.who && <div style={S.who}>{m.who}</div>}

          {(m.worth || m.worthBreak) && (
            <div style={S.worthRow}>
              {m.worth && <span style={S.worth}>{m.worth}</span>}
              {m.worthBreak && <span style={S.worthBreak}>{m.worthBreak}</span>}
            </div>
          )}

          {m.link && (
            <a href={m.link} style={S.link}>
              {m.playerName ? `${m.playerName} — open` : 'Open'}
            </a>
          )}
        </div>
      </div>

      <div style={S.bar}>
        {shown.map((r) => (
          <button key={r.emoji} style={S.pill(r.mine)} onClick={() => react(r.emoji)} aria-pressed={!!r.mine}>
            <span aria-hidden="true">{r.emoji}</span>
            <span style={S.count}>{r.count}</span>
          </button>
        ))}

        <button style={S.pill(false)} onClick={() => setPicker((p) => !p)} aria-label="Add a reaction">+</button>

        {picker && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {[...QUICK, ...MORE]
              .filter((e) => !shown.some((r) => r.emoji === e))
              .map((e) => (
                <button key={e} style={{ ...S.pill(false), padding: '4px 8px' }} onClick={() => react(e)}>
                  {e}
                </button>
              ))}
          </div>
        )}

        <button style={S.cmtBtn} onClick={() => setOpen((o) => !o)}>
          {comments.length === 0
            ? 'Comment'
            : `${comments.length} comment${comments.length === 1 ? '' : 's'}`}
        </button>
      </div>

      {open && (
        <div style={S.thread}>
          {comments.map((c) => (
            <div key={c.id || `${c.user}-${c.at}`} style={S.cmt}>
              <div style={S.av}>{initials(c.name)}</div>
              <div style={{ minWidth: 0 }}>
                <div>
                  <span style={S.cmtName}>{c.name}</span>
                  <span style={S.cmtWhen}>{ago(c.at)}</span>
                </div>
                <div style={S.cmtText}>{c.text}</div>
              </div>
            </div>
          ))}

          <div style={S.write}>
            <input
              style={S.input}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); comment() } }}
              placeholder="Say something..."
              maxLength={500}
            />
            <button style={S.post} onClick={comment} disabled={sending || !draft.trim()}>
              {sending ? '…' : 'Post'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
