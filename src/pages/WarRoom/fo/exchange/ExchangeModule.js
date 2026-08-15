import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EmptyState, formatSP, T } from '../primitives'
import { FoModal } from '../dialogs'
import AssetCard from './AssetCard'
import {
  ASSET_TYPES, TEAMS_FILTER, PRICE_FILTER, SORTS,
  EMPTY_STATS, EMPTY_BALANCES,
} from './assetData'
import {
  getExchangeListings, getExchangeStats, getMyListings, getMyOffers, getExchangeHistory,
  buyNowFranchise, makeOffer, createExchangeListing, getMyPicks,
} from '../../../../redux/actions/exchangeActions'

/* ExchangeModule — the full marketplace (5 tabs, 7 asset types, chart, sales,
   flows + all states). Reads real data from the exchange store only; empty
   feeds resolve to clean empty states (never fabricated listings or trends). */

const TABS = [
  { key: 'browse', label: 'Browse Market' },
  { key: 'listings', label: 'My Listings' },
  { key: 'offers', label: 'My Offers' },
  { key: 'watchlist', label: 'Watchlist' },
  { key: 'tradeblock', label: 'Trade Block' },
]
const panel = { background: 'linear-gradient(180deg,#0b0f18,#080b12)', border: `1px solid ${T.border}`, borderRadius: 16, padding: 18 }
const gold = { padding: '9px 16px', borderRadius: 10, border: 'none', background: T.gold, color: '#0a0a0a', fontWeight: 800, fontSize: 13, cursor: 'pointer' }
const ghost = { padding: '9px 16px', borderRadius: 10, border: `1px solid ${T.border}`, background: 'transparent', color: T.primary, fontWeight: 700, fontSize: 13, cursor: 'pointer' }
const sel = { background: '#0b0f18', color: T.secondary, border: `1px solid ${T.border}`, borderRadius: 9, padding: '8px 10px', fontSize: 12, cursor: 'pointer' }

function Balance({ icon, label, value, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#0b0f18', border: `1px solid ${T.border}`, borderRadius: 12, padding: '8px 14px', whiteSpace: 'nowrap' }}>
      <span aria-hidden style={{ fontSize: 15 }}>{icon}</span>
      <div><div className="fo-num" style={{ fontSize: 14, fontWeight: 800, color: accent || '#fff' }}>{value}</div><div style={{ fontSize: 9.5, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div></div>
    </div>
  )
}

function TrendsChart({ series = [], labels = [] }) {
  const W = 280, H = 130, pad = 6
  if (!series.length) {
    return <div role="img" aria-label="No market trend data yet" style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: 12 }}>No market trend data yet.</div>
  }
  const n = series[0]?.points.length || 1
  const x = (i) => pad + (i / (n - 1)) * (W - pad * 2)
  const y = (v) => pad + (1 - v) * (H - pad * 2)
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: 'block' }}>
        {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={pad} x2={W - pad} y1={y(g)} y2={y(g)} stroke="rgba(233,231,223,0.05)" />)}
        {series.map((s) => (
          <polyline key={s.key} points={s.points.map((p, i) => `${x(i)},${y(p)}`).join(' ')} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: T.muted, marginTop: 4 }}>
        {labels.map((l) => <span key={l}>{l}</span>)}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 10 }}>
        {series.map((s) => (
          <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <span aria-hidden style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
            <span style={{ color: T.secondary, fontWeight: 700 }}>{s.key}</span>
            <span style={{ color: T.green }}>{s.delta}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

const initials = (name = '') => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

function RecentSales({ sales = [] }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span className="fo-display" style={{ fontSize: 14, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.6 }}>Recent Sales</span>
        <span style={{ fontSize: 11, color: T.green, fontWeight: 700 }}>View All</span>
      </div>
      {sales.length === 0 && <div style={{ fontSize: 12, color: T.muted, padding: '4px 0' }}>No recent sales yet.</div>}
      {sales.map((s, i) => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: i ? `1px solid ${T.border}` : 'none' }}>
          <span style={{ width: 30, height: 30, borderRadius: '50%', background: s.c, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, flexShrink: 0 }}>{initials(s.name)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
            <div style={{ fontSize: 10.5, color: T.muted }}>{s.sub}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="fo-num" style={{ fontSize: 12.5, fontWeight: 800, color: T.gold }}>{formatSP(s.price)}</div>
            <div style={{ fontSize: 10, color: T.muted }}>{s.when}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function StatsRow({ stats }) {
  const s = stats || EMPTY_STATS
  const cell = (label, value) => (
    <div style={{ flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: 11, color: T.muted }}>{label}</div>
      <div className="fo-num" style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 3 }}>{value}</div>
    </div>
  )
  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
      {cell('Live Listings', String(s.liveListings))}
      {cell('Total Volume (7d)', formatSP(s.totalVolume))}
      {cell('Successful Trades (7d)', String(s.successfulTrades))}
      {cell('Average Sale Price', formatSP(s.avgSalePrice))}
    </div>
  )
}

function Drawer({ asset, onClose, onBuy, onOffer, watched, onWatch }) {
  if (!asset) return null
  const posTeam = [asset.pos, asset.team].filter(Boolean).join(' · ') || asset.sub || ''
  return (
    <div className="fo-drawer-overlay" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="fo-drawer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="fo-display" style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Listing Details</span>
          <button aria-label="Close" onClick={onClose} className="fo-modal-x" style={{ position: 'static' }}>✕</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '18px 0' }}>
          <span style={{ width: 64, height: 64, borderRadius: asset.type === 'franchises' || asset.type === 'teams' ? 14 : '50%', background: asset.c || T.purple, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22 }}>{asset.mono || initials(asset.name)}</span>
          <div>
            <div className="fo-display" style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{asset.name}</div>
            <div style={{ fontSize: 12.5, color: T.muted }}>{posTeam}</div>
          </div>
        </div>
        <div style={{ ...panel, marginBottom: 16 }}>
          {asset.ovr != null && <Row k="Overall" v={asset.ovr} />}
          {asset.age != null && <Row k="Age" v={asset.age} />}
          {asset.record && <Row k="Record" v={asset.record} />}
          {asset.salary != null && <Row k="Salary" v={formatSP(asset.salary)} />}
          <Row k="Market Value" v={formatSP(asset.value)} />
          {asset.endsIn && <Row k="Time Left" v={asset.endsIn} />}
          <Row k="Asking Price" v={formatSP(asset.price)} vc={T.gold} big />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onBuy(asset)} style={{ ...gold, flex: 1, padding: '12px 0' }}>Buy Now · {formatSP(asset.price)}</button>
          <button onClick={() => onOffer(asset)} style={{ ...ghost, flex: 1, padding: '12px 0' }}>Make Offer</button>
        </div>
        <button onClick={() => onWatch(asset)} style={{ ...ghost, width: '100%', marginTop: 10 }}>{watched ? '♥ In Watchlist' : '♡ Add to Watchlist'}</button>
      </div>
    </div>
  )
}
function Row({ k, v, vc, big }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderTop: `1px solid ${T.border}` }}>
      <span style={{ fontSize: 12.5, color: T.muted }}>{k}</span>
      <span className="fo-num" style={{ fontSize: big ? 18 : 13.5, fontWeight: 800, color: vc || '#fff' }}>{v}</span>
    </div>
  )
}

export default function ExchangeModule({ balances }) {
  const dispatch = useDispatch()
  const ex = useSelector((s) => s.exchange || {})
  const user = useSelector((s) => s.user?.userDetails)

  const [tab, setTab] = useState('browse')
  const [assetType, setAssetType] = useState('all')
  const [view, setView] = useState('grid')
  const [search, setSearch] = useState('')
  const [team, setTeam] = useState('All Teams')
  const [price, setPrice] = useState('Price: Any')
  const [sort, setSort] = useState('Recently Listed')
  const [watch, setWatch] = useState({})
  const [detail, setDetail] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [offerAsset, setOfferAsset] = useState(null)
  const [toast, setToast] = useState('')
  const [error, setError] = useState(false)

  const ping = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2600) }

  useEffect(() => {
    if (!user?._id) return
    ;(async () => {
      try {
        await Promise.all([
          dispatch(getExchangeListings()), dispatch(getExchangeStats()),
          dispatch(getMyListings()), dispatch(getMyOffers()), dispatch(getExchangeHistory()),
        ])
      } catch (e) { setError(true) }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id])

  // Real listings → asset shape only; empty market → empty state (no fabrication).
  const assets = useMemo(() => {
    const live = Array.isArray(ex.listings) ? ex.listings : []
    if (!live.length) return []
    return live.map((l, i) => {
      if (l.assetType === 'pick') {
        const ps = l.pickSnapshot || {}
        return {
          id: l._id || i, type: 'picks', assetType: 'pick',
          name: ps.label ? `${ps.label} Pick` : `${ps.season || ''} Round ${ps.round || ''} Pick`,
          sub: ps.sellerTeamName ? `via ${ps.sellerTeamName}` : (ps.leagueName || ''),
          value: l.marketValue || l.askingPrice, price: l.askingPrice || l.marketValue,
          c: '#6D28D9', sport: l.pickSnapshot?.sport || l.sport,
        }
      }
      const t = l.teamSnapshot || {}
      return {
        id: l._id || i, type: 'franchises', name: t.name || l.teamName || l.name || 'Franchise',
        record: t.record, value: l.marketValue || l.askingPrice, price: l.askingPrice || l.marketValue,
        mono: (t.name || l.teamName || 'F').slice(0, 2).toUpperCase(), c: '#8B5CF6', sport: t.sport || l.sport,
      }
    })
  }, [ex.listings])

  const filtered = useMemo(() => {
    let a = assets
    if (assetType !== 'all') a = a.filter((x) => x.type === assetType)
    if (team !== 'All Teams') a = a.filter((x) => x.team === team)
    if (search.trim()) { const q = search.toLowerCase(); a = a.filter((x) => x.name.toLowerCase().includes(q)) }
    if (sort === 'Price: Low to High') a = [...a].sort((p, q) => p.price - q.price)
    else if (sort === 'Price: High to Low') a = [...a].sort((p, q) => q.price - p.price)
    else if (sort === 'OVR') a = [...a].sort((p, q) => (q.ovr || 0) - (p.ovr || 0))
    return a
  }, [assets, assetType, team, search, sort])

  const toggleWatch = (a) => setWatch((w) => ({ ...w, [a.id]: !w[a.id] }))
  const doBuy = async (a) => {
    setDetail(null)
    if (a.sport && a.id) {
      const res = await buyNowFranchise(a.id, a.sport).catch(() => null)
      if (res) { dispatch(getExchangeListings()); dispatch(getExchangeStats()) }
    }
    ping(`Purchase placed for ${a.name}`)
  }
  const doOffer = (a) => { setDetail(null); setOfferAsset(a) }

  const bal = balances || EMPTY_BALANCES
  const stats = ex.stats && ex.stats.liveListings ? ex.stats : EMPTY_STATS
  const loading = !!ex.listingsLoading

  const watchlist = filtered.filter((a) => watch[a.id])
  const myListings = Array.isArray(ex.myListings) ? ex.myListings : []
  const myOffers = Array.isArray(ex.myOffers) ? ex.myOffers : []

  return (
    <div className="fo-anim" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div style={{ ...panel, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <div className="fo-display" style={{ fontSize: 22, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 }}>Exchange</div>
          <div style={{ fontSize: 12.5, color: T.muted }}>Buy, sell or trade assets to build your empire.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Balance icon="🟢" label="EP Balance" value={Number(bal.ep || 0).toLocaleString()} />
          <Balance icon="🏛️" label="Empire Value" value={formatSP(bal.empireValue)} />
          <Balance icon="❄️" label="Available Cap" value={formatSP(bal.availableCap)} accent={T.blue} />
          <button onClick={() => setCreateOpen(true)} style={{ ...gold, background: '#7c3aed', color: '#fff' }}>+ Create Listing</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="xchg-tabbar">
        {TABS.map((t) => <button key={t.key} className={`xchg-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>)}
      </div>

      {tab === 'browse' && (
        <>
          {/* Filter bar */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search players, franchises, picks…"
              style={{ flex: 1, minWidth: 220, background: '#0b0f18', border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13 }} />
            <select value={team} onChange={(e) => setTeam(e.target.value)} style={sel}>{TEAMS_FILTER.map((p) => <option key={p}>{p}</option>)}</select>
            <select value={price} onChange={(e) => setPrice(e.target.value)} style={sel}>{PRICE_FILTER.map((p) => <option key={p}>{p}</option>)}</select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={sel}>{SORTS.map((p) => <option key={p}>{p}</option>)}</select>
            <div style={{ display: 'flex', border: `1px solid ${T.border}`, borderRadius: 9, overflow: 'hidden' }}>
              <button aria-label="Grid view" onClick={() => setView('grid')} style={{ padding: '8px 11px', background: view === 'grid' ? '#151f31' : 'transparent', color: view === 'grid' ? '#fff' : T.muted, border: 'none', cursor: 'pointer' }}>▦</button>
              <button aria-label="List view" onClick={() => setView('list')} style={{ padding: '8px 11px', background: view === 'list' ? '#151f31' : 'transparent', color: view === 'list' ? '#fff' : T.muted, border: 'none', cursor: 'pointer' }}>≣</button>
            </div>
          </div>
          {/* Asset type chips */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {ASSET_TYPES.map((t) => <button key={t.key} className={`xchg-chip${assetType === t.key ? ' active' : ''}`} onClick={() => setAssetType(t.key)}><span aria-hidden>{t.icon}</span>{t.label}</button>)}
          </div>

          <div className="xchg-main">
            <div>
              {error ? (
                <div style={panel}><EmptyState icon="⚠️" title="Couldn't load the market" message="Something went wrong fetching listings. Check your connection and try again." actionLabel="Retry" onAction={() => { setError(false); dispatch(getExchangeListings()) }} accent={T.red} /></div>
              ) : loading ? (
                <div className="xchg-grid">{Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ ...panel, height: 190 }}><div className="fo-skel" style={{ height: '100%', borderRadius: 10 }} /></div>)}</div>
              ) : filtered.length === 0 ? (
                <div style={panel}><EmptyState icon="🛒" title="No assets match" message="Try a different asset type, position, or price filter, or create the first listing." actionLabel="Create Listing" onAction={() => setCreateOpen(true)} accent={T.purple} /></div>
              ) : (
                <div className={view === 'grid' ? 'xchg-grid' : ''} style={view === 'list' ? { display: 'flex', flexDirection: 'column', gap: 10 } : undefined}>
                  {filtered.map((a) => <AssetCard key={a.id} asset={a} view={view} watched={!!watch[a.id]} onWatch={toggleWatch} onOpen={setDetail} />)}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={panel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className="fo-display" style={{ fontSize: 14, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.6 }}>Market Trends</span>
                  <span style={{ fontSize: 11, color: T.muted }}>7 Days ▾</span>
                </div>
                <TrendsChart />
              </div>
              <div style={panel}><RecentSales /></div>
            </div>
          </div>

          {/* Sell banner + stats */}
          <div style={{ ...panel, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 260 }}>
              <span aria-hidden style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(139,92,246,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📈</span>
              <div>
                <div className="fo-display" style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Looking to sell?</div>
                <div style={{ fontSize: 12, color: T.muted, maxWidth: 320 }}>List your players, franchises, or picks and reach thousands of empire owners.</div>
                <button onClick={() => setCreateOpen(true)} style={{ ...gold, background: '#7c3aed', color: '#fff', marginTop: 10 }}>Create Listing</button>
              </div>
            </div>
            <StatsRow stats={stats} />
          </div>
        </>
      )}

      {tab === 'listings' && (
        <div style={panel}>
          {myListings.length === 0
            ? <EmptyState icon="🏷️" title="No active listings" message="You haven't listed any assets yet. Create a listing to sell a player, franchise, or pick." actionLabel="Create Listing" onAction={() => setCreateOpen(true)} accent={T.gold} />
            : <div className="xchg-grid">{myListings.map((l, i) => <AssetCard key={l._id || i} view="list" asset={{ id: l._id || i, type: 'franchises', name: l.teamName || 'Franchise', price: l.askingPrice, value: l.marketValue, mono: (l.teamName || 'F').slice(0, 2).toUpperCase(), c: '#8B5CF6' }} onOpen={setDetail} />)}</div>}
        </div>
      )}

      {tab === 'offers' && (
        <div style={panel}>
          {myOffers.length === 0
            ? <EmptyState icon="🤝" title="No offers yet" message="Offers you make on other empires' assets will show up here with their status." actionLabel="Browse Market" onAction={() => setTab('browse')} accent={T.blue} />
            : myOffers.map((o, i) => (
              <div key={o._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: i ? `1px solid ${T.border}` : 'none' }}>
                <div><div style={{ fontSize: 13.5, fontWeight: 800, color: '#fff' }}>{o.listingName || o.teamName || 'Offer'}</div><div style={{ fontSize: 11, color: T.muted }}>{o.status || 'Pending'}</div></div>
                <div className="fo-num" style={{ fontSize: 14, fontWeight: 800, color: T.gold }}>{formatSP(o.amount)}</div>
              </div>
            ))}
        </div>
      )}

      {tab === 'watchlist' && (
        <div style={panel}>
          {watchlist.length === 0
            ? <EmptyState icon="👁️" title="Your watchlist is empty" message="Tap the heart on any asset to track its price here and get notified on big moves." actionLabel="Browse Market" onAction={() => setTab('browse')} accent={T.purple} />
            : <div className="xchg-grid">{watchlist.map((a) => <AssetCard key={a.id} asset={a} view="grid" watched onWatch={toggleWatch} onOpen={setDetail} />)}</div>}
        </div>
      )}

      {tab === 'tradeblock' && (
        <div style={panel}>
          <EmptyState icon="🔁" title="Trade Block is quiet" message="Put assets on the block to signal you're open to trades, or browse what other owners have made available." actionLabel="Add to Trade Block" onAction={() => setCreateOpen(true)} accent={T.green} />
        </div>
      )}

      {/* Detail drawer */}
      <Drawer asset={detail} watched={detail && !!watch[detail.id]} onWatch={toggleWatch} onClose={() => setDetail(null)} onBuy={doBuy} onOffer={doOffer} />

      {/* Create listing */}
      <CreateListing open={createOpen} onClose={() => setCreateOpen(false)} onCreate={async (p, sport = 'nfl') => {
        setCreateOpen(false)
        const res = await createExchangeListing(p, sport).catch(() => null)
        if (res) { dispatch(getExchangeListings()); dispatch(getMyListings()) }
        ping(p.assetType === 'pick' ? 'Draft pick listed' : 'Listing created')
      }} />

      {/* Make offer */}
      <MakeOfferModal asset={offerAsset} onClose={() => setOfferAsset(null)} onSubmit={(amount) => { const a = offerAsset; setOfferAsset(null); if (a?.sport && a?.id) makeOffer({ listingId: a.id, amount, sport: a.sport }).catch(() => {}); ping(`Offer of ${formatSP(amount)} sent`) }} />

      {toast && <div className="xchg-toast">✓ {toast}</div>}
    </div>
  )
}

function CreateListing({ open, onClose, onCreate }) {
  const [type, setType] = useState('franchises')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [picks, setPicks] = useState([])
  const [picksLoading, setPicksLoading] = useState(false)
  const [selPick, setSelPick] = useState('')

  // Load the seller's owned draft picks when the pick type is chosen.
  useEffect(() => {
    if (!open || type !== 'picks') return
    let cancelled = false
    setPicksLoading(true)
    Promise.all([getMyPicks('nfl'), getMyPicks('soccer')]).then(([a, b]) => {
      if (cancelled) return
      const all = [...(a || []), ...(b || [])]
      setPicks(all)
      setPicksLoading(false)
    })
    return () => { cancelled = true }
  }, [open, type])

  const pick = picks.find((p) => p._id === selPick)
  const isPick = type === 'picks'
  const canSubmit = isPick ? (!!selPick && !!price) : (!!name && !!price)

  const submit = () => {
    if (isPick) {
      onCreate({ assetType: 'pick', draftPickId: selPick, askingPrice: Number(price) }, pick?.sport || 'nfl')
    } else {
      onCreate({ type, name, askingPrice: Number(price) })
    }
  }

  return (
    <FoModal open={open} onClose={onClose} title="Create Listing" subtitle="List an asset on the marketplace.">
      <div>
        <div style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Asset Type</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {ASSET_TYPES.filter((t) => t.key !== 'all').map((t) => (
            <button key={t.key} className={`xchg-chip${type === t.key ? ' active' : ''}`} onClick={() => setType(t.key)}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      {isPick ? (
        <div>
          <div style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Your Draft Picks</div>
          {picksLoading ? (
            <div className="fo-skel" style={{ height: 44, borderRadius: 10 }} />
          ) : picks.length === 0 ? (
            <EmptyState icon="🎯" title="No tradeable picks" message="You don't currently own any unused draft picks to sell." accent={T.purple} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
              {picks.map((p) => {
                const disabled = p.alreadyListed
                const active = selPick === p._id
                return (
                  <button key={p._id} disabled={disabled} onClick={() => { setSelPick(p._id); if (!price) setPrice(String(p.value || '')) }}
                    style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1, background: active ? 'rgba(247,201,72,0.08)' : '#0b0f18', border: `1px solid ${active ? T.gold : T.border}` }}>
                    <span>
                      <span style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#fff' }}>{p.label || `${p.season} R${p.round}`} Pick{disabled ? ' · listed' : ''}</span>
                      <span style={{ display: 'block', fontSize: 10.5, color: T.muted }}>{p.leagueName} · {p.sport?.toUpperCase() || ''}</span>
                    </span>
                    <span className="fo-num" style={{ fontSize: 12.5, fontWeight: 800, color: T.gold }}>{formatSP(p.value)}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Asset name" style={{ background: '#0b0f18', border: `1px solid ${T.border}`, borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 13 }} />
      )}

      <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Asking price (SP)" inputMode="numeric" style={{ background: '#0b0f18', border: `1px solid ${T.border}`, borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 13 }} />
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} style={{ ...ghost, flex: 1, padding: '12px 0' }}>Cancel</button>
        <button disabled={!canSubmit} onClick={submit} style={{ ...gold, flex: 1, padding: '12px 0', opacity: !canSubmit ? 0.5 : 1, cursor: !canSubmit ? 'not-allowed' : 'pointer' }}>List for Sale</button>
      </div>
    </FoModal>
  )
}

function MakeOfferModal({ asset, onClose, onSubmit }) {
  const [amount, setAmount] = useState('')
  useEffect(() => { setAmount(asset ? String(asset.price || '') : '') }, [asset])
  if (!asset) return null
  return (
    <FoModal open={!!asset} onClose={onClose} title="Make an Offer" subtitle={`Offer on ${asset.name}`}>
      <div style={{ ...panel }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}><span style={{ color: T.muted }}>Asking Price</span><span className="fo-num" style={{ color: T.gold, fontWeight: 800 }}>{formatSP(asset.price)}</span></div>
      </div>
      <div>
        <div style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Your Offer (SP)</div>
        <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" style={{ width: '100%', background: '#0b0f18', border: `1px solid ${T.border}`, borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 15 }} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} style={{ ...ghost, flex: 1, padding: '12px 0' }}>Cancel</button>
        <button disabled={!amount} onClick={() => onSubmit(Number(amount))} style={{ ...gold, flex: 1, padding: '12px 0', opacity: !amount ? 0.5 : 1, cursor: !amount ? 'not-allowed' : 'pointer' }}>Send Offer</button>
      </div>
    </FoModal>
  )
}
