import React from 'react'
import { EmptyState, formatSP, T } from './primitives'

/* fullPages — polished full-width tab pages matching target_front_office_design.png.
   Trophies / Exchange / Governance. Each renders ONLY real data passed via props;
   when a feed is empty it shows a clean empty state (never fabricated data). */

const panel = { background: 'linear-gradient(180deg,#0b0f18,#080b12)', border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }
const pageHead = (icon, bg) => ({ width: 40, height: 40, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 })
const h1 = { fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.1 }
const sub = { fontSize: 12.5, color: T.muted }
const gold = { padding: '9px 18px', borderRadius: 10, border: 'none', background: T.gold, color: '#0a0a0a', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }
const ghost = { padding: '9px 18px', borderRadius: 10, border: `1px solid ${T.border}`, background: 'transparent', color: T.primary, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }

function PageHeader({ icon, bg, title, subtitle, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span aria-hidden style={pageHead(icon, bg)}>{icon}</span>
        <div><div className="fo-display" style={h1}>{title}</div><div style={sub}>{subtitle}</div></div>
      </div>
      {right}
    </div>
  )
}

/* ══ TROPHIES ══════════════════════════════════════════════ */
export function TrophiesPage({ trophies = [], recent = [], onTab }) {
  return (
    <div className="fo-anim" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={panel}>
        <PageHeader icon="🏆" bg="rgba(247,201,72,0.16)" title="Trophy Room" subtitle="Celebrate your empire's legacy."
          right={<button style={ghost}>All Sports ▾</button>} />
        <div style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.6, margin: '20px 0 12px' }}>Trophy Cabinet</div>
        {trophies.length === 0 ? (
          <EmptyState icon="🏆" title="No trophies yet" message="Win your league, reach the playoffs, or earn an MVP to start filling the cabinet." accent={T.gold} />
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 14 }}>
          {trophies.map((t) => (
            <div key={t.label} style={{ textAlign: 'center', padding: '22px 12px', borderRadius: 14, background: t.locked ? 'rgba(255,255,255,0.02)' : 'linear-gradient(180deg,rgba(247,201,72,0.10),rgba(247,201,72,0.02))', border: `1px solid ${t.locked ? T.border : 'rgba(247,201,72,0.22)'}` }}>
              <div aria-hidden style={{ fontSize: 40, filter: t.locked ? 'grayscale(1) opacity(0.55)' : 'none' }}>{t.icon}</div>
              <div className="fo-num" style={{ fontSize: 26, fontWeight: 700, color: t.locked ? T.muted : '#fff', marginTop: 6 }}>{t.n != null ? t.n : ''}</div>
              <div style={{ fontSize: 11.5, color: t.locked ? T.muted : T.secondary, marginTop: 2 }}>{t.label}</div>
              {t.locked && <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>Locked</div>}
            </div>
          ))}
        </div>
        )}
      </div>
      <div style={panel}>
        <div className="fo-display" style={{ ...h1, fontSize: 16, marginBottom: 14 }}>Recent Achievements</div>
        {recent.length === 0
          ? <EmptyState icon="🏆" title="No trophies yet" message="Win your league, reach the playoffs, or earn an MVP to start filling the cabinet." accent={T.gold} progressLabel="Season progress" progressPct={0} />
          : recent.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderTop: i ? `1px solid ${T.border}` : 'none' }}>
              <span aria-hidden style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(247,201,72,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{r.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{r.title}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{r.franchise} · {r.sport}</div>
              </div>
              <div style={{ fontSize: 11.5, color: T.secondary }}>{r.when}</div>
            </div>
          ))}
      </div>
    </div>
  )
}

/* ══ EXCHANGE ══════════════════════════════════════════════ */
const FILTERS = ['All Sports', 'NFL', 'Soccer', 'A.Football']
const SORTS = ['Newest', 'Price ↑', 'Price ↓', 'Trending']
export function ExchangePage({ listings = [], stats, onSell, onMessages, onTab }) {
  const S = stats || { active: listings.length, floor: 0, avg: 0, offers: 0, balance: 0 }
  const stat = (label, value, accent) => (
    <div style={{ flex: 1, minWidth: 130, padding: '4px 8px' }}>
      <div style={{ fontSize: 10.5, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</div>
      <div className="fo-num" style={{ fontSize: 22, fontWeight: 700, color: accent || '#fff', marginTop: 4 }}>{value}</div>
    </div>
  )
  const row = (k, v, vc) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginTop: 5 }}>
      <span style={{ color: T.muted }}>{k}</span><span style={{ color: vc || T.secondary, fontWeight: 700 }}>{v}</span>
    </div>
  )
  return (
    <div className="fo-anim" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={panel}>
        <PageHeader icon="💠" bg="rgba(139,92,246,0.16)" title="The Exchange" subtitle="Franchise Trading Floor · Acquire or divest premium assets"
          right={<div style={{ display: 'flex', gap: 10 }}><button onClick={onSell} style={{ ...ghost, border: `1px solid ${T.gold}`, color: T.gold }}>Sell My Empire</button><button onClick={onMessages} style={ghost}>💬 Messages</button></div>} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18, borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
          {stat('Active Listings', S.active)}
          {stat('Total Floor Value', formatSP(S.floor))}
          {stat('Avg Asking Price', formatSP(S.avg))}
          {stat('My Active Offers', S.offers)}
          {stat('My SP Balance', formatSP(S.balance), T.gold)}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTERS.map((f, i) => (
            <button key={f} style={{ fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${i === 0 ? T.gold : T.border}`, background: i === 0 ? 'rgba(247,201,72,0.12)' : 'transparent', color: i === 0 ? T.gold : T.muted }}>{f}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>Sort</span>
          {SORTS.map((s, i) => (
            <button key={s} style={{ fontSize: 11.5, fontWeight: 700, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${i === 0 ? T.border : 'transparent'}`, background: i === 0 ? '#151f31' : 'transparent', color: i === 0 ? '#fff' : T.muted }}>{s}</button>
          ))}
        </div>
      </div>
      {listings.length === 0 ? (
        <div style={panel}><EmptyState icon="💠" title="No franchises listed" message="When owners list franchises for sale, they'll show up here. Be the first to list yours." actionLabel="Sell My Empire" onAction={onSell} accent={T.purple} /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          {listings.map((l) => (
            <div key={l.name} style={{ ...panel, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 9.5, fontWeight: 800, color: l.sport === 'Soccer' ? T.green : T.blue, background: l.sport === 'Soccer' ? 'rgba(74,222,128,0.14)' : 'rgba(59,130,246,0.14)', borderRadius: 6, padding: '3px 8px' }}>{l.sport}</span>
                <span style={{ fontSize: 10, color: T.muted }}>Ends in {l.ends}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ width: 54, height: 54, borderRadius: '50%', background: l.c, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 19, border: '2px solid rgba(255,255,255,0.15)' }}>{l.mono}</span>
                <div className="fo-display" style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{l.name}</div>
              </div>
              {row('Owner', l.owner)}
              {row('Empire Rank', l.rank, '#fff')}
              {row('ROI', l.roi, T.green)}
              {row('Current Bid', l.bid, T.gold)}
              <button onClick={onTab} style={{ ...gold, width: '100%', marginTop: 12 }}>Place Bid</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ══ GOVERNANCE ════════════════════════════════════════════ */
export function GovernancePage({ votes = [], commissioner, onTab }) {
  const C = commissioner || { name: '—', since: '', created: 0, passed: 0, rate: '—' }
  return (
    <div className="fo-anim" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={panel}>
        <PageHeader icon="🏛️" bg="rgba(59,130,246,0.16)" title="Governance" subtitle="Lead your league. Shape the future."
          right={<button style={gold}>+ Create Vote</button>} />
        <div style={{ display: 'flex', gap: 18, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', borderBottom: `1px solid ${T.border}`, paddingBottom: 10, marginTop: 18 }}>
          <span style={{ color: T.gold, borderBottom: `2px solid ${T.gold}`, paddingBottom: 10, marginBottom: -11 }}>Active Votes</span>
          <span style={{ color: T.muted }}>Upcoming</span>
          <span style={{ color: T.muted }}>Past Votes</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 20, alignItems: 'start' }}>
        {votes.length === 0 ? (
          <div style={panel}><EmptyState icon="🗳️" title="No active votes" message="When your league opens a vote, it will show up here for you to weigh in." accent={T.gold} /></div>
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
          {votes.map((v) => (
            <div key={v.title} style={{ ...panel, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                <div className="fo-display" style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{v.title}</div>
                <div className="fo-num" style={{ fontSize: 15, fontWeight: 700, color: v.c }}>{v.pct}%</div>
              </div>
              <div style={{ fontSize: 12, color: T.muted, margin: '4px 0 12px' }}>{v.sub}</div>
              <div style={{ height: 7, borderRadius: 4, background: '#151f31', overflow: 'hidden' }}><div style={{ width: `${v.pct}%`, height: '100%', background: v.c }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, margin: '8px 0 12px' }}>
                <span style={{ color: T.green }}>{v.forN} Votes For</span><span style={{ color: T.red }}>{v.against} Votes Against</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10.5, color: T.muted }}>Ends in {v.ends}</span>
                <button onClick={onTab} style={{ ...gold, padding: '7px 16px' }}>Vote Now</button>
              </div>
            </div>
          ))}
        </div>
        )}
        <div style={panel}>
          <div className="fo-display" style={{ ...h1, fontSize: 15, marginBottom: 14 }}>Commissioner</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#16A34A,#0f7a37)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 17 }}>{C.name.charAt(0)}</span>
            <div><div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{C.name}</div><div style={{ fontSize: 11, color: T.muted }}>Commissioner · {C.since}</div></div>
          </div>
          {[['Total Votes Created', C.created], ['Votes Passed', C.passed], ['Approval Rate', C.rate]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '7px 0', borderTop: `1px solid ${T.border}` }}>
              <span style={{ color: T.muted }}>{k}</span><span className="fo-num" style={{ color: '#fff', fontWeight: 700 }}>{v}</span>
            </div>
          ))}
          <button style={{ ...gold, width: '100%', marginTop: 14 }}>View Profile</button>
        </div>
      </div>
    </div>
  )
}
