import React from 'react'
import PerformanceChart from './PerformanceChart'
import { MetricCard, QuickActionCard, EmptyState, SPAmount, SportBadge, formatSP, T } from './primitives'
import EXCHANGE_BADGE from '../../../assets/exchange-badge.png'
import BUY_FRANCHISE_BADGE from '../../../assets/buy-franchise.png'
import MANAGE_LEAGUES_BADGE from '../../../assets/my-leagues.png'
import TREASURY_BADGE from '../../../assets/treasury.png'
import CREATE_VOTE_BADGE from '../../../assets/create-vote.png'
import VIEW_ANALYTICS_BADGE from '../../../assets/view-analytics.png'

// Badge icons for the quick actions, replacing the old emojis.
// Uniform green tint so every quick-action icon reads as one colour instead of
// the mix of gold/blue/purple badge art. grayscale+sepia+hue-rotate forces green.
const badgeIconStyle = { width: '100%', height: '100%', objectFit: 'cover', borderRadius: 11, filter: 'grayscale(1) sepia(1) hue-rotate(62deg) saturate(3.4) brightness(0.95)' }
const exchangeIcon = <img src={EXCHANGE_BADGE} alt="" style={badgeIconStyle} />
const buyFranchiseIcon = <img src={BUY_FRANCHISE_BADGE} alt="" style={badgeIconStyle} />
const manageLeaguesIcon = <img src={MANAGE_LEAGUES_BADGE} alt="" style={badgeIconStyle} />
const treasuryIcon = <img src={TREASURY_BADGE} alt="" style={badgeIconStyle} />
const createVoteIcon = <img src={CREATE_VOTE_BADGE} alt="" style={badgeIconStyle} />
const viewAnalyticsIcon = <img src={VIEW_ANALYTICS_BADGE} alt="" style={badgeIconStyle} />

/* Overview tab — presentational. Parent (WarRoom) passes real data + handlers;
   every async section shows an engaging empty state, never a blank panel. */

const panel = { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 'var(--fo-r-card,16px)', padding: 18 }
const sectionTitle = { fontSize: 15, fontWeight: 800, color: T.primary }

const RANGES = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'season', label: 'Season' },
]

/**
 * @param {{
 *   performance:{label:string,value:number}[], range:string, onRange:Function,
 *   financials:{revenue:number,expenses:number,netPL:number,cashFlow:number},
 *   topFranchise:object|null, activity:object[], onQuickAction:Function, onManageFranchise:Function
 * }} p
 */
export default function OverviewTab({ performance = [], range = 'week', onRange, financials = {}, topFranchise, activity = [], onQuickAction, onManageFranchise }) {
  const QUICK = [
    { id: 'buy', icon: buyFranchiseIcon, title: 'Buy Franchise', sub: 'Expand your empire', color: T.gold },
    { id: 'exchange', icon: exchangeIcon, title: 'Go to Exchange', sub: 'Trade franchises', color: T.purple },
    { id: 'leagues', icon: manageLeaguesIcon, title: 'Manage Leagues', sub: 'Your franchises', color: T.blue },
    { id: 'treasury', icon: treasuryIcon, title: 'Treasury', sub: 'Finances', color: T.green },
    { id: 'vote', icon: createVoteIcon, title: 'Create Vote', sub: 'Governance', color: '#aa44ff' },
    { id: 'analytics', icon: viewAnalyticsIcon, title: 'View Analytics', sub: 'Insights', color: '#00ccff' },
  ]
  const fin = [
    { label: 'Revenue', v: financials.revenue, dir: 'up' },
    { label: 'Expenses', v: financials.expenses, dir: 'down' },
    { label: 'Net P&L', v: financials.netPL, dir: (financials.netPL || 0) >= 0 ? 'up' : 'down' },
    { label: 'Cash Flow', v: financials.cashFlow, dir: (financials.cashFlow || 0) >= 0 ? 'up' : 'down' },
  ]

  return (
    <div className="fo-anim" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.55fr) minmax(0,1fr) minmax(0,1fr)', gap: 20 }}>
        {/* Empire performance */}
        <div style={panel}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="fo-display" style={sectionTitle}>Empire Performance</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {RANGES.map((r) => (
                <button key={r.key} onClick={() => onRange && onRange(r.key)} style={{ fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${range === r.key ? T.green : T.border}`, background: range === r.key ? 'rgba(74,222,128,0.1)' : 'transparent', color: range === r.key ? T.green : T.muted }}>{r.label}</button>
              ))}
            </div>
          </div>
          <PerformanceChart data={performance} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 12 }}>
            {fin.map((f) => (
              <div key={f.label}>
                <div style={{ fontSize: 10.5, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f.label}</div>
                <div className="fo-num" style={{ fontSize: 14, fontWeight: 700, color: f.dir === 'down' ? T.red : T.green }}>{f.v != null ? `${(f.v >= 0 ? '+' : '')}${formatSP(f.v)}` : '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top performing franchise */}
        <div style={panel}>
          <div className="fo-display" style={{ ...sectionTitle, marginBottom: 12 }}>Top Performing Franchise</div>
          {topFranchise ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${T.purple}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: T.purple }}>{(topFranchise.name || '?').charAt(0)}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: T.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topFranchise.name}</div>
                  <SportBadge sport={topFranchise.sport} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 12 }}>
                <MetricCard label="Rank" value={topFranchise.rank ? `#${topFranchise.rank}` : '—'} />
                <MetricCard label="Win Rate" value={topFranchise.winRate != null ? `${Math.round(topFranchise.winRate)}%` : '—'} accent={T.green} />
                <MetricCard label="ROI" value={topFranchise.roiPercent != null ? `+${Math.round(topFranchise.roiPercent)}%` : '—'} accent={T.gold} />
              </div>
              <div style={{ fontSize: 11, color: T.muted }}>Franchise Value</div>
              <div className="fo-num" style={{ fontSize: 18, fontWeight: 700, color: T.primary, marginBottom: 12 }}><SPAmount value={topFranchise.valueSp} /></div>
              <button onClick={onManageFranchise} style={{ width: '100%', padding: '9px 0', borderRadius: 10, border: 'none', background: T.gold, color: '#0a0a0a', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Manage Franchise</button>
            </>
          ) : (
            <EmptyState icon="🏟️" title="No franchises yet" message="Buy or join a franchise to start building your empire and see your top performer here." actionLabel="Buy Franchise" onAction={() => onQuickAction && onQuickAction('buy')} accent={T.purple} />
          )}
        </div>

        {/* Recent activity */}
        <div style={panel}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="fo-display" style={sectionTitle}>Recent Activity</span>
            <button onClick={() => onQuickAction && onQuickAction('history')} style={{ fontSize: 11, color: T.green, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
          </div>
          {activity.length === 0 ? (
            <EmptyState icon="📜" title="Nothing yet" message="Your empire's moves — sales, payouts, trophies and votes — will appear here." accent={T.blue} />
          ) : activity.slice(0, 5).map((a, i) => (
            <div key={a.id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderTop: i ? `1px solid ${T.border}` : 'none' }}>
              <span aria-hidden style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, background: `${a.color || T.muted}22` }}>{a.icon || '📣'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: T.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                <div style={{ fontSize: 10.5, color: T.muted }}>{a.timeAgo}</div>
              </div>
              {a.spDelta != null && <span style={{ fontSize: 12, fontWeight: 800, color: a.spDelta >= 0 ? T.green : T.red }}>{a.spDelta >= 0 ? '+' : ''}{formatSP(a.spDelta)}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={panel}>
        <div className="fo-display" style={{ ...sectionTitle, marginBottom: 12 }}>Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 }}>
          {QUICK.map((q) => <QuickActionCard key={q.id} icon={q.icon} title={q.title} sub={q.sub} color={q.color} onClick={() => onQuickAction && onQuickAction(q.id)} />)}
        </div>
      </div>
    </div>
  )
}
