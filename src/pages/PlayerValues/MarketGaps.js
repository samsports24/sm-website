import React, { useEffect, useState } from 'react'
import { base_url } from '../../config/constants'
import { C, posColor } from './theme'

// ═══════════════════════════════════════════════════════════════════════════
//  WHERE THE MODEL AND THE CROWD DISAGREE.
//
//  We keep two numbers on every player and we deliberately don't blend them:
//
//    SPV       — computed from the tape. Production, usage, availability, role.
//    SAM Value — voted by managers. Reputation, name, vibes, hope.
//
//  Blending them into one score would destroy the only genuinely useful thing
//  here, which is the DISTANCE between them. A player the tape ranks 40th and
//  the crowd ranks 180th is mispriced, and you can act on that. Average the two
//  and he's just "110th", which tells you nothing.
//
//  Compared by RANK, not raw score: SPV is 0–100 and SAM Value is 0–9999.
// ═══════════════════════════════════════════════════════════════════════════

const Row = ({ p, buy }) => (
  <div style={S.row}>
    <span style={{ ...S.pos, background: posColor(p.position) }}>{p.position}</span>
    <span style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {p.name}
      </div>
      <div style={{ fontSize: 10, color: C.faint, marginTop: 1 }}>
        tape #{p.spvRank} · crowd #{p.samRank}
      </div>
    </span>
    <span style={{ textAlign: 'right', flexShrink: 0 }}>
      <div style={{ fontWeight: 900, fontSize: 15, color: buy ? C.green : C.red, fontFamily: "'Barlow Condensed', sans-serif" }}>
        {buy ? '+' : ''}{p.gap}
      </div>
      <div style={{ fontSize: 9, color: C.faint }}>places</div>
    </span>
  </div>
)

export default function MarketGaps() {
  const [data, setData] = useState(null)

  useEffect(() => {
    let dead = false
    fetch(`${base_url}/spv/gaps?limit=6`)
      .then((r) => r.json())
      .then((j) => !dead && j.success && setData(j))
      .catch(() => {})
    return () => { dead = true }
  }, [])

  // Nothing to compare until the crowd has voted enough. Say nothing rather
  // than show two empty boxes.
  if (!data || !data.compared || (!data.buy?.length && !data.sell?.length)) return null

  return (
    <div style={{ marginTop: 34 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={S.kicker}>THE TAPE VS THE CROWD</div>
        <h2 style={S.h2}>Where the market is wrong.</h2>
        <p style={S.sub}>
          We keep two numbers on every player and never blend them. <b style={{ color: C.text }}>SPV</b> is
          computed from what he actually did: production, snaps, availability, role.{' '}
          <b style={{ color: C.text }}>SAM Value</b> is what managers vote he&apos;s worth. When the two
          disagree by a mile, somebody is wrong — and that&apos;s a trade.
        </p>
      </div>

      <div style={S.grid}>
        <div style={{ ...S.card, borderColor: `${C.green}33` }}>
          <div style={{ ...S.head, color: C.green }}>Buy — the tape rates them, the crowd doesn&apos;t</div>
          {data.buy.map((p) => <Row key={p.id} p={p} buy />)}
        </div>
        <div style={{ ...S.card, borderColor: `${C.red}33` }}>
          <div style={{ ...S.head, color: C.red }}>Sell — the crowd rates them, the tape doesn&apos;t</div>
          {data.sell.map((p) => <Row key={p.id} p={p} />)}
        </div>
      </div>

      <div style={{ fontSize: 11, color: C.faint, marginTop: 10, lineHeight: 1.7 }}>
        Compared by rank, not by score — SPV runs 0–100 and SAM Value runs 0–9999, so subtracting one
        from the other would be meaningless. Players with fewer than 25 votes are left out; comparing
        against a value the crowd hasn&apos;t really set yet would just be measuring our own seed back
        to ourselves. {data.compared.toLocaleString()} players have both numbers.
      </div>
    </div>
  )
}

const S = {
  kicker: { fontSize: 10, fontWeight: 800, letterSpacing: 1.6, color: C.gold },
  h2: { fontSize: 26, fontWeight: 900, margin: '6px 0 0', fontFamily: "'Rajdhani', sans-serif" },
  sub: { color: C.dim, fontSize: 14, lineHeight: 1.6, marginTop: 8, maxWidth: 720 },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 },
  card: { background: C.card, border: '1px solid', borderRadius: 14, padding: 16 },
  head: { fontWeight: 800, fontSize: 12, marginBottom: 10 },

  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.line}` },
  pos: {
    fontSize: 9, fontWeight: 800, color: '#fff', borderRadius: 4, padding: '3px 6px',
    minWidth: 30, textAlign: 'center', flexShrink: 0,
  },
}
