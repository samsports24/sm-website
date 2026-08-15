import React from 'react'
import PerformanceChart from './PerformanceChart'
import { MetricCard, EmptyState, SPAmount, SportBadge, formatSP, T } from './primitives'

const panel = { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 'var(--fo-r-card,16px)', padding: 18 }
const title = { fontSize: 15, fontWeight: 800, color: T.primary, marginBottom: 12 }

/* ── Treasury ──────────────────────────────────────────────── */
export function TreasuryTab({ summary = {}, cashFlow = [], byFranchise = [], onBuySP, onTransfer, onTransactions }) {
  const cards = [
    { label: 'Liquid SP', v: summary.liquidSp, accent: T.purple },
    { label: 'Portfolio Value', v: summary.valueSp, accent: T.gold },
    { label: 'Weekly Revenue', v: summary.weeklyRevenueSp, accent: T.green },
    { label: 'Spending', v: summary.spendingSp, accent: T.red },
    { label: 'Net P&L', v: summary.netPL, accent: (summary.netPL || 0) >= 0 ? T.green : T.red },
    { label: 'Available Budget', v: summary.budgetSp, accent: T.blue },
  ]
  return (
    <div className="fo-anim" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 }}>
        {cards.map((c) => <MetricCard key={c.label} label={c.label} value={c.v != null ? <SPAmount value={c.v} /> : '—'} accent={c.accent} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 20 }}>
        <div style={panel}>
          <div style={title}>Cash Flow History</div>
          <PerformanceChart data={cashFlow} color="#8B5CF6" ariaLabel="Cash flow history" />
        </div>
        <div style={panel}>
          <div style={title}>Revenue by Franchise</div>
          {byFranchise.length === 0
            ? <EmptyState icon="💰" title="No revenue yet" message="Once your franchises earn, you'll see the breakdown here." accent={T.green} />
            : byFranchise.map((f, i) => {
              const max = byFranchise[0]?.value || 1
              return (
                <div key={i} style={{ padding: '8px 0', borderTop: i ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                    <span style={{ color: T.primary, fontWeight: 700 }}>{f.name}</span>
                    <span style={{ color: T.green, fontWeight: 800 }}>{formatSP(f.value)}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 4, background: '#1a2030' }}><div style={{ width: `${Math.max(4, (f.value / max) * 100)}%`, height: '100%', borderRadius: 4, background: T.green }} /></div>
                </div>
              )
            })}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBuySP} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: T.gold, color: '#0a0a0a', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Buy SP</button>
        <button onClick={onTransfer} style={{ padding: '9px 18px', borderRadius: 10, border: `1px solid ${T.border}`, background: 'transparent', color: T.primary, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Transfer</button>
        <button onClick={onTransactions} style={{ padding: '9px 18px', borderRadius: 10, border: `1px solid ${T.border}`, background: 'transparent', color: T.primary, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>View Transactions</button>
      </div>
    </div>
  )
}

/* ── Analytics ─────────────────────────────────────────────── */
export function AnalyticsTab({ valueSeries = [], revenueSeries = [], allocation = [] }) {
  return (
    <div className="fo-anim" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={panel}><div style={title}>Franchise Value Over Time</div><PerformanceChart data={valueSeries} color="#F7C948" ariaLabel="Franchise value over time" /></div>
        <div style={panel}><div style={title}>Revenue</div><PerformanceChart data={revenueSeries} color="#4ADE80" ariaLabel="Revenue over time" /></div>
      </div>
      <div style={panel}>
        <div style={title}>Portfolio Allocation</div>
        {allocation.length === 0
          ? <EmptyState icon="📊" title="No allocation yet" message="Own franchises to see how your portfolio value is distributed." accent={T.blue} />
          : allocation.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: i ? `1px solid ${T.border}` : 'none' }}>
              <span style={{ width: 130, fontSize: 12.5, color: T.primary, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</span>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#1a2030' }}><div style={{ width: `${a.pct}%`, height: '100%', borderRadius: 4, background: a.color || T.gold }} /></div>
              <span style={{ width: 44, textAlign: 'right', fontSize: 12, fontWeight: 800, color: T.secondary }}>{a.pct}%</span>
            </div>
          ))}
      </div>
    </div>
  )
}

/* ── History ───────────────────────────────────────────────── */
const HIST_ICON = { purchase: '🏟️', sale: '💸', trophy: '🏆', payout: '💰', vote: '🗳️', trade: '🔁', valuation: '📈', transfer: '↔️', reward: '🎁' }
export function HistoryTab({ events = [], filter = 'all', onFilter }) {
  const TYPES = ['all', 'purchase', 'sale', 'trophy', 'payout', 'vote', 'trade', 'reward']
  const shown = filter === 'all' ? events : events.filter((e) => e.type === filter)
  return (
    <div className="fo-anim" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {TYPES.map((t) => (
          <button key={t} onClick={() => onFilter && onFilter(t)} style={{ fontSize: 11.5, fontWeight: 700, padding: '6px 12px', borderRadius: 999, cursor: 'pointer', textTransform: 'capitalize', border: `1px solid ${filter === t ? T.gold : T.border}`, background: filter === t ? 'rgba(247,201,72,0.12)' : 'transparent', color: filter === t ? T.gold : T.muted }}>{t}</button>
        ))}
      </div>
      <div style={panel}>
        {shown.length === 0 ? (
          <EmptyState icon="📜" title="No history yet" message="Every empire move — purchases, sales, trophies, payouts, votes — will be logged here as a timeline." accent={T.gold} />
        ) : shown.map((e, i) => (
          <div key={e.id || i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderTop: i ? `1px solid ${T.border}` : 'none' }}>
            <span aria-hidden style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, background: 'rgba(255,255,255,0.05)' }}>{HIST_ICON[e.type] || '•'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: T.primary }}>{e.title}</span>
                {e.spDelta != null && <span style={{ fontSize: 13, fontWeight: 800, color: e.spDelta >= 0 ? T.green : T.red }}>{e.spDelta >= 0 ? '+' : ''}{formatSP(e.spDelta)}</span>}
              </div>
              {e.description && <div style={{ fontSize: 12, color: T.secondary, marginTop: 2 }}>{e.description}</div>}
              <div style={{ fontSize: 10.5, color: T.muted, marginTop: 3, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>{e.timeAgo}</span>{e.sport && <SportBadge sport={e.sport} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
