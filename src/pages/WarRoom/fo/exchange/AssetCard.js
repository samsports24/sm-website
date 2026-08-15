import React from 'react'
import { formatSP, T } from '../primitives'

/* AssetCard — one reusable card for every tradeable asset type (franchise, team,
   draft pick, other), in grid or list layout. Whole card opens the detail drawer;
   the heart toggles the watchlist. Players, SamPoints and stadiums are not tradeable. */

const initials = (name = '') => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
const isRoster = (t) => t === 'franchises' || t === 'teams'

function Avatar({ asset, size = 56 }) {
  const { type, c = T.purple, mono, name } = asset
  const icon = type === 'picks' ? '🎯' : null
  const label = mono || initials(name)
  return (
    <span style={{ width: size, height: size, borderRadius: isRoster(type) ? 12 : '50%', background: icon ? `${c}22` : c, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.32, border: `2px solid ${icon ? c : 'rgba(255,255,255,0.15)'}`, flexShrink: 0 }}>
      {icon || label}
    </span>
  )
}

function Heart({ on, onClick }) {
  return (
    <button aria-label={on ? 'Remove from watchlist' : 'Add to watchlist'} aria-pressed={on}
      onClick={(e) => { e.stopPropagation(); onClick && onClick() }}
      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color: on ? T.red : T.muted, lineHeight: 1 }}>
      {on ? '♥' : '♡'}
    </button>
  )
}

const OvrBadge = ({ ovr }) => (
  <span className="fo-num" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, background: 'rgba(247,201,72,0.16)', border: `1px solid ${T.gold}55`, borderRadius: 8, padding: '3px 7px' }}>
    <span style={{ fontSize: 14, fontWeight: 800, color: T.gold }}>{ovr}</span>
    <span style={{ fontSize: 7.5, fontWeight: 700, color: T.gold, letterSpacing: 0.5 }}>OVR</span>
  </span>
)

const card = { background: 'linear-gradient(180deg,#0b0f18,#080b12)', border: `1px solid ${T.border}`, borderRadius: 14, cursor: 'pointer' }
const meta = (k, v, vc) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginTop: 4 }}>
    <span style={{ color: T.muted }}>{k}</span><span style={{ color: vc || T.secondary, fontWeight: 700 }}>{v}</span>
  </div>
)

export default function AssetCard({ asset, view = 'grid', watched, onWatch, onOpen }) {
  const posTeam = [asset.pos, asset.team].filter(Boolean).join(' · ') || asset.sub || ''

  if (view === 'list') {
    return (
      <div onClick={() => onOpen && onOpen(asset)} className="fo-anim" style={{ ...card, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px' }}>
        {asset.ovr != null && <OvrBadge ovr={asset.ovr} />}
        <Avatar asset={asset} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="fo-display" style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.name}</div>
          <div style={{ fontSize: 11.5, color: T.muted }}>{posTeam}</div>
        </div>
        {asset.record && <div style={{ fontSize: 12, color: T.secondary }}>{asset.record}</div>}
        <div style={{ textAlign: 'right' }}>
          <div className="fo-num" style={{ fontSize: 14, fontWeight: 800, color: T.gold }}>{formatSP(asset.price)}</div>
          {asset.endsIn && <div style={{ fontSize: 10, color: T.muted }}>Ends {asset.endsIn}</div>}
        </div>
        <Heart on={watched} onClick={() => onWatch && onWatch(asset)} />
      </div>
    )
  }

  return (
    <div onClick={() => onOpen && onOpen(asset)} className="fo-anim" style={{ ...card, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {asset.ovr != null ? <OvrBadge ovr={asset.ovr} /> : <span />}
        <Heart on={watched} onClick={() => onWatch && onWatch(asset)} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, margin: '6px 0 10px' }}>
        <Avatar asset={asset} size={58} />
        <div style={{ textAlign: 'center' }}>
          <div className="fo-display" style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{asset.name}</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{posTeam || (isRoster(asset.type) ? 'Franchise' : '')}</div>
        </div>
      </div>
      {isRoster(asset.type) && <>{asset.ovr != null && meta('OVR', asset.ovr, '#fff')}{asset.record && meta('Record', asset.record, '#fff')}{meta('Value', formatSP(asset.value))}</>}
      {(asset.type === 'picks' || asset.type === 'other') && meta('Value', formatSP(asset.value))}
      {asset.endsIn && meta('Time Left', asset.endsIn, T.secondary)}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
        <span aria-hidden style={{ width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', color: '#fff', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>SP</span>
        <span className="fo-num" style={{ fontSize: 15, fontWeight: 800, color: T.gold }}>{formatSP(asset.price)}</span>
      </div>
    </div>
  )
}
