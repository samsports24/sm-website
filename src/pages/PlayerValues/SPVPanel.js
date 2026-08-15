import React, { useEffect, useState } from 'react'
import { base_url } from '../../config/constants'
import { C } from './theme'

// ═══════════════════════════════════════════════════════════════════════════
//  SPV — the objective number, and its working.
//
//  SAM Value is what the crowd says a player is worth. SPV is what the tape
//  says. Seven factors, percentile-ranked inside his own position group, no
//  opinions in it.
//
//  We show every sub-score and the raw input behind it, because a score nobody
//  can interrogate is a score nobody should trust. If we tell you a man is a 96,
//  you're entitled to see which of the seven got him there.
//
//  The bit worth reading is the DISAGREEMENT. Where the model rates a player far
//  above the crowd, the market hasn't caught up. Where the crowd is far above
//  the model, he's living on reputation.
// ═══════════════════════════════════════════════════════════════════════════

const band = (v) => (v == null ? C.faint : v >= 80 ? C.green : v >= 55 ? C.gold : v >= 30 ? '#F97316' : C.red)

const Factor = ({ f }) => {
  if (f.missing) {
    return (
      <div style={S.row}>
        <span style={S.label}>{f.label}</span>
        <div style={S.track}>
          <div style={{ ...S.fill, width: '100%', background: 'rgba(255,255,255,0.04)' }} />
        </div>
        <span style={{ ...S.score, color: C.faint, fontWeight: 600 }}>—</span>
        <span style={S.weight}>no data</span>
      </div>
    )
  }
  const v = Math.round(f.score)
  return (
    <div style={S.row}>
      <span style={S.label}>{f.label}</span>
      <div style={S.track}>
        <div style={{ ...S.fill, width: `${v}%`, background: band(v) }} />
      </div>
      <span style={{ ...S.score, color: band(v) }}>{v}</span>
      <span style={S.weight}>{f.effectiveWeight}%</span>
    </div>
  )
}

export default function SPVPanel({ playerId }) {
  const [p, setP] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let dead = false
    fetch(`${base_url}/spv/player/${playerId}`)
      .then((r) => r.json())
      .then((j) => {
        if (dead) return
        if (!j.success) throw new Error(j.message)
        setP(j.player)
      })
      .catch((e) => !dead && setErr(e.message))
    return () => { dead = true }
  }, [playerId])

  if (err) return null // no SPV for this man — say nothing rather than show an error
  if (!p) return <div style={{ ...S.wrap, color: C.dim, fontSize: 12 }}>Loading SPV…</div>

  // Ranks, not raw scores. SPV runs 0–100 and SAM Value runs 0–9999, so
  // subtracting one from the other would be meaningless. Where does each list
  // put him?
  const sam = p.samValue
  const gap = sam && !sam.provisional && p.rank ? sam.rank - p.rank : null

  return (
    <div style={S.wrap}>
      <div style={S.head}>
        <div>
          <div style={S.kicker}>SPV — SAMSPORTS PLAYER VALUE</div>
          <div style={{ fontSize: 11, color: C.faint, marginTop: 3 }}>
            Computed, not voted. Percentile-ranked against other {p.positionGroup}s.
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {p.rated ? (
            <>
              <div style={{ ...S.big, color: band(p.spv) }}>{p.spv}</div>
              <div style={{ fontSize: 10, color: C.faint }}>
                #{p.rank} overall · {p.posRank}
              </div>
            </>
          ) : (
            <>
              <div style={{ ...S.big, color: C.faint, fontSize: 24 }}>—</div>
              <div style={{ fontSize: 10, color: C.gold, maxWidth: 150 }}>
                {p.projection ? 'Projection' : 'Unrated'}
              </div>
            </>
          )}
        </div>
      </div>

      {!p.rated && p.note && (
        <div style={S.warn}>{p.note}</div>
      )}
      {p.rated && p.projection && (
        <div style={S.warn}>
          Projection — he hasn&apos;t taken an NFL snap. Scored on depth, age and contract
          only, and capped at 79 until he plays.
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        {p.factors.map((f) => <Factor key={f.key} f={f} />)}
      </div>

      {p.missing?.length > 0 && p.rated && (
        <div style={{ fontSize: 11, color: C.faint, marginTop: 10, lineHeight: 1.6 }}>
          We don&apos;t have {p.missing.length === 1 ? 'one factor' : `${p.missing.length} factors`} for
          him, so that weight is spread across the ones we do have — the percentages above are the
          weights actually used. We never score a missing factor as zero; that would punish him for
          our gap, not his play.
        </div>
      )}

      {/* The disagreement. This is the part that's actually useful. */}
      {gap != null && Math.abs(gap) >= 15 && (
        <div style={{ ...S.gap, borderColor: gap > 0 ? `${C.green}44` : `${C.red}44` }}>
          <div style={{ fontWeight: 800, fontSize: 12, color: gap > 0 ? C.green : C.red, marginBottom: 4 }}>
            {gap > 0 ? 'The market is behind on him' : 'The crowd likes him more than the tape does'}
          </div>
          <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6 }}>
            SPV ranks him <b style={{ color: C.text }}>#{p.rank}</b>. The crowd&apos;s Keep/Trade/Cut
            votes rank him <b style={{ color: C.text }}>#{sam.rank}</b>. That&apos;s{' '}
            <b style={{ color: gap > 0 ? C.green : C.red }}>{Math.abs(gap)} places</b> apart
            {gap > 0
              ? ' — he produces more than his reputation suggests. Buy low.'
              : ' — his reputation is running ahead of his production. Sell high.'}
          </div>
        </div>
      )}
      {gap != null && Math.abs(gap) < 15 && (
        <div style={{ fontSize: 11, color: C.faint, marginTop: 12 }}>
          The model and the crowd agree on him (#{p.rank} vs #{sam.rank}). No edge here.
        </div>
      )}
      {sam?.provisional && (
        <div style={{ fontSize: 11, color: C.faint, marginTop: 12 }}>
          Too few Keep/Trade/Cut votes on him yet to compare the crowd against the model.
        </div>
      )}
    </div>
  )
}

const S = {
  wrap: {
    background: '#0B0F17',
    border: `1px solid ${C.line}`,
    borderRadius: 10,
    padding: '14px 16px',
    marginTop: 14,
  },
  head: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  kicker: { fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: C.gold },
  big: { fontSize: 34, fontWeight: 900, lineHeight: 1, fontFamily: "'Barlow Condensed', sans-serif" },

  row: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' },
  label: { width: 132, fontSize: 11, color: C.dim, flexShrink: 0 },
  track: { flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', minWidth: 40 },
  fill: { height: '100%', borderRadius: 3, transition: 'width .3s ease' },
  score: { width: 26, textAlign: 'right', fontSize: 12, fontWeight: 800, flexShrink: 0 },
  weight: { width: 42, textAlign: 'right', fontSize: 10, color: C.faint, flexShrink: 0 },

  warn: {
    marginTop: 10, padding: '8px 10px', borderRadius: 6,
    background: 'rgba(212,168,67,0.08)', border: `1px solid ${C.gold}33`,
    fontSize: 11, color: C.gold, lineHeight: 1.5,
  },
  gap: {
    marginTop: 14, padding: '10px 12px', borderRadius: 8,
    border: '1px solid', background: 'rgba(255,255,255,0.02)',
  },
}
