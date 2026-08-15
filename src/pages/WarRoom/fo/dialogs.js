import React from 'react'
import { EmptyState, formatSP, T } from './primitives'

/* Reusable Front Office overlays: FoModal shell, PriceSlider, SellEmpireDialog,
   BuyFranchiseDialog. Custom overlay (not Ant Modal) so styling matches the
   design exactly and modals become centered landscape sheets on mobile. */

export function FoModal({ open, onClose, title, subtitle, children, footer, width = 460 }) {
  if (!open) return null
  return (
    <div className="fo-modal-overlay" role="dialog" aria-modal="true" aria-label={title}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose && onClose() }}>
      <div className="fo-modal-card" style={{ maxWidth: width }}>
        <button aria-label="Close" onClick={onClose} className="fo-modal-x">✕</button>
        {title && <div className="fo-display" style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{title}</div>}
        {subtitle && <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>{subtitle}</div>}
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
        {footer && <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>{footer}</div>}
      </div>
    </div>
  )
}

export function PriceSlider({ min, max, value, onChange }) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 50
  return (
    <div>
      <input type="range" min={min} max={max} step={Math.max(1, Math.round((max - min) / 100))} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="fo-range" style={{ background: `linear-gradient(90deg, ${T.gold} ${pct}%, #151f31 ${pct}%)` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: T.muted, marginTop: 6 }}>
        <span>{formatSP(min)}</span><span>{formatSP(max)}</span>
      </div>
    </div>
  )
}

const optionTile = (active) => ({
  textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: 12, padding: '14px 16px',
  background: active ? 'rgba(247,201,72,0.08)' : '#0a0e17',
  border: `1px solid ${active ? T.gold : T.border}`,
})
const label = { fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: T.muted }
const rowLine = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }
const btnGold = { flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', background: T.gold, color: '#0a0a0a', fontWeight: 800, fontSize: 13.5, cursor: 'pointer' }
const btnGhost = { flex: 1, padding: '12px 0', borderRadius: 12, border: `1px solid ${T.border}`, background: 'transparent', color: T.primary, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }

/* ── Sell Empire ─────────────────────────────────────────── */
export function SellEmpireDialog({ open, onClose, teamName = 'Your Empire', portfolioValue = 0, franchiseCount = 0, onConfirm }) {
  const OPTIONS = [
    { key: 'single', title: 'Sell This Franchise', desc: `List "${teamName}" at your asking price` },
    { key: 'bundle', title: 'Sell Empire (Bundle)', desc: `All ${franchiseCount} franchises as one package` },
    { key: 'individual', title: 'Sell Empire (Individual)', desc: 'Each franchise listed separately at market value' },
  ]
  const [opt, setOpt] = React.useState('bundle')
  const min = Math.round(portfolioValue * 0.75)
  const max = Math.round(portfolioValue * 1.5)
  const [price, setPrice] = React.useState(portfolioValue)
  const presets = [
    { label: '75%', v: Math.round(portfolioValue * 0.75) },
    { label: 'MV', v: portfolioValue },
    { label: '125%', v: Math.round(portfolioValue * 1.25) },
    { label: '150%', v: Math.round(portfolioValue * 1.5) },
  ]
  const fee = Math.round(price * 0.05)
  const net = price - fee
  return (
    <FoModal open={open} onClose={onClose} title="Sell Your Empire" subtitle="Choose how you want to sell.">
      {OPTIONS.map((o) => (
        <button key={o.key} onClick={() => setOpt(o.key)} style={optionTile(opt === o.key)}>
          <div style={{ fontSize: 14, fontWeight: 800, color: opt === o.key ? T.gold : '#fff' }}>{o.title}</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{o.desc}</div>
        </button>
      ))}
      <div style={{ background: '#0a0e17', border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
        <div style={label}>Portfolio Value</div>
        <div className="fo-num" style={{ fontSize: 26, fontWeight: 700, color: T.gold, marginTop: 4 }}>{formatSP(portfolioValue)}</div>
      </div>
      <div>
        <div style={{ ...rowLine, marginBottom: 10 }}>
          <span style={label}>Suggested Price</span>
          <span className="fo-num" style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{formatSP(price)}</span>
        </div>
        <PriceSlider min={min} max={max} value={price} onChange={setPrice} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 12 }}>
          {presets.map((p) => (
            <button key={p.label} onClick={() => setPrice(p.v)} style={{ padding: '8px 0', borderRadius: 10, cursor: 'pointer', border: `1px solid ${price === p.v ? T.gold : T.border}`, background: price === p.v ? 'rgba(247,201,72,0.1)' : 'transparent', color: price === p.v ? T.gold : T.secondary }}>
              <div style={{ fontSize: 12, fontWeight: 800 }}>{p.label}</div>
              <div className="fo-num" style={{ fontSize: 10.5, color: T.muted }}>{formatSP(p.v)}</div>
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
        <div style={rowLine}><span style={{ color: T.muted }}>Platform Fee (5%)</span><span className="fo-num" style={{ color: T.red, fontWeight: 700 }}>-{formatSP(fee)}</span></div>
        <div style={rowLine}><span style={{ color: T.muted }}>Estimated Net</span><span className="fo-num" style={{ color: T.green, fontWeight: 800, fontSize: 15 }}>{formatSP(net)}</span></div>
        <div style={rowLine}><span style={{ color: T.muted }}>Est. Time to Sell</span><span style={{ color: T.secondary, fontWeight: 700 }}>2–5 Days</span></div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button onClick={onClose} style={btnGhost}>Cancel</button>
        <button onClick={() => onConfirm && onConfirm({ option: opt, price, net })} style={btnGold}>List for Sale</button>
      </div>
    </FoModal>
  )
}

/* ── Buy Franchise ───────────────────────────────────────── */
export function BuyFranchiseDialog({ open, onClose, listings = [], balance = 0, onConfirm }) {
  const [sel, setSel] = React.useState(0)
  const picked = listings[sel]
  const fee = picked ? Math.round(picked.bid * 0.05) : 0
  const total = picked ? picked.bid + fee : 0
  return (
    <FoModal open={open} onClose={onClose} title="Buy a Franchise" subtitle="Acquire a listed franchise and grow your empire." width={480}>
      {listings.length === 0 ? (
        <EmptyState icon="🏟️" title="Nothing listed yet" message="No franchises are on the market right now. Check back soon or list one of your own." accent={T.purple} />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
            {listings.map((l, i) => (
              <button key={l.name} onClick={() => setSel(i)} style={{ ...optionTile(sel === i), display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 38, height: 38, borderRadius: '50%', background: l.c, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{l.mono}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13.5, fontWeight: 800, color: '#fff' }}>{l.name}</span>
                  <span style={{ display: 'block', fontSize: 11, color: T.muted }}>{l.sport} · Rank {l.rank} · ROI {l.roi}</span>
                </span>
                <span className="fo-num" style={{ fontSize: 13.5, fontWeight: 800, color: T.gold }}>{formatSP(l.bid)}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
            <div style={rowLine}><span style={{ color: T.muted }}>Current Bid</span><span className="fo-num" style={{ color: '#fff', fontWeight: 700 }}>{formatSP(picked.bid)}</span></div>
            <div style={rowLine}><span style={{ color: T.muted }}>Platform Fee (5%)</span><span className="fo-num" style={{ color: T.red, fontWeight: 700 }}>+{formatSP(fee)}</span></div>
            <div style={rowLine}><span style={{ color: T.muted }}>Total Cost</span><span className="fo-num" style={{ color: T.gold, fontWeight: 800, fontSize: 15 }}>{formatSP(total)}</span></div>
            <div style={rowLine}><span style={{ color: T.muted }}>Your Balance</span><span className="fo-num" style={{ color: balance >= total ? T.green : T.red, fontWeight: 700 }}>{formatSP(balance)}</span></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={btnGhost}>Cancel</button>
            <button onClick={() => onConfirm && onConfirm(picked)} style={btnGold}>Place Bid</button>
          </div>
        </>
      )}
    </FoModal>
  )
}
