import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { attachToken, privateAPI } from '../../../config/constants'
import { selectLeague } from '../../../redux/actions/leagueActions'

import FrontOfficeShell from './FrontOfficeShell'
import OverviewTab from './OverviewTab'
import { TreasuryTab, AnalyticsTab, HistoryTab } from './tabsExtra'
import { EmptyState, SPAmount, SportBadge, StatusBadge, formatSP, T } from './primitives'

import RightRail from './RightRail'
import { TrophiesPage } from './fullPages'
import GovernanceSection from '../GovernanceSection'
import ExchangeModule from './exchange/ExchangeModule'
import { SellEmpireDialog, BuyFranchiseDialog } from './dialogs'
import CommissionerBadge from '../../../components/CommissionerBadge'
import { isCommissionerOfLeague } from '../../../utils/useIsLeagueCommissioner'

/* FrontOfficeApp — wired orchestrator for the redesigned Front Office.
   Lives at /front-office (additive; the legacy /war-room stays untouched).
   Reuses existing Trophy/Exchange/Governance logic components and real
   data endpoints; no mock production data. */

const ACCENT = { primary: '#F7C948', dark: '#C99A2E', rgba: '247,201,72' }
const timeAgo = (d) => {
  if (!d) return ''
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
const readTab = () => {
  try { return new URLSearchParams(window.location.search).get('tab') || 'overview' } catch { return 'overview' }
}

export default function FrontOfficeApp() {
  const navigate = useNavigate()
  const user = useSelector((s) => s.user?.userDetails)
  const userId = user?._id
  const activeLeague = useSelector((s) => {
    const l = s.league?.currentLeague
    return l && !Array.isArray(l) ? l : s.user?.userDetails?.team?.currentLeague
  })

  const [tab, setTab] = useState(readTab())
  const [topbar, setTopbar] = useState({ sp: 0, budget: null, teamName: '' })
  const [teams, setTeams] = useState([])
  const [activity, setActivity] = useState([])
  const [range, setRange] = useState('week')
  const [histFilter, setHistFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [sellOpen, setSellOpen] = useState(false)
  const [buyOpen, setBuyOpen] = useState(false)

  const selectTab = (k) => {
    setTab(k)
    try { const u = new URL(window.location.href); u.searchParams.set('tab', k); window.history.replaceState({}, '', u) } catch { /* noop */ }
  }

  // Manage a specific franchise from the My Leagues table: make that team's
  // league the active one (selectLeague swaps the JWT + hard-reloads /dashboard),
  // so "Manage" opens the RIGHT franchise instead of always the current one.
  const handleManageFranchise = (team) => {
    const lid = team?.leagueId || team?.league?._id || team?.currentLeague
    const sport = team?.sport || 'nfl'
    // selectLeague is NFL-scoped; only switch for NFL/football rows. (Soccer
    // franchises live in the other app and can't be activated from here yet.)
    if (lid && (sport === 'nfl' || sport === 'football')) {
      selectLeague({ leagueId: lid })
      return
    }
    navigate('/dashboard')
  }

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    attachToken()
    ;(async () => {
      try {
        const r = await privateAPI.get('/user/get-user')
        const d = r?.data?.data || r?.data || {}
        const sp = d?.sampoints?.earnedSamPoints ?? d?.sampoints?.SamPoints ?? (user?.earnedSamPoints || 0)
        const cap = d?.leagueSalaryCap, used = d?.teamSalaryCap ?? 0
        setTopbar({ sp: sp ?? 0, budget: cap ? Math.max(0, cap - used) : null, teamName: user?.team?.name || d?.team?.name || 'Your Empire' })
      } catch (e) { setTopbar((p) => ({ ...p, teamName: user?.team?.name || 'Your Empire' })) }
      try {
        const t = await privateAPI.get('/league/my-teams-all-sports')
        const dd = t?.data?.data || {}
        const soccer = (dd.soccerTeams || []).map((x) => ({ ...x, sport: x.sport || 'soccer' }))
        const nfl = (dd.nflTeams || []).map((x) => ({ ...x, sport: x.sport || 'nfl' }))
        setTeams([...nfl, ...soccer])
      } catch (e) { /* empty state */ }
      try {
        const tx = await privateAPI.get('/transaction/get-top-transactions')
        const list = tx?.data?.data?.topTransaction || tx?.data?.topTransaction || tx?.data?.data || []
        setActivity(Array.isArray(list) ? list : [])
      } catch (e) { /* empty state */ }
      setLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // ── Derived. Everything is built from REAL data only; empty feeds resolve to
  //    zeros / '—' / empty arrays so the UI shows honest empty states, never
  //    fabricated numbers, names or charts. ──
  const derived = useMemo(() => {
    // Hero summary from real teams only (empty → zeros → hero shows empty states).
    const rValue = teams.reduce((s, t) => s + (t.marketValue || 0), 0)
    const rRevenue = teams.reduce((s, t) => s + (t.annualEarnings || 0), 0)
    const rSpending = teams.reduce((s, t) => s + (t.annualSpending || 0), 0)
    const rWins = teams.reduce((s, t) => s + (t.wins || 0), 0)
    const rGames = teams.reduce((s, t) => s + (t.wins || 0) + (t.losses || 0) + (t.draws || t.ties || 0), 0)
    const rChamps = teams.reduce((s, t) => s + ((t.trophies || []).length || t.titles || 0), 0)
    const summary = {
      name: topbar.teamName, valueSp: rValue, weeklyRevenueSp: rRevenue, spendingSp: rSpending,
      netPL: rRevenue - rSpending, franchiseCount: teams.length,
      championshipCount: rChamps, winRate: rGames ? (rWins / rGames) * 100 : null,
      liquidSp: topbar.sp, budgetSp: topbar.budget,
    }

    // Views for the content tabs — real data only.
    const tv = teams
    const av = activity

    const valueSp = tv.reduce((s, t) => s + (t.marketValue || 0), 0)
    const weeklyRevenueSp = tv.reduce((s, t) => s + (t.annualEarnings || 0), 0)
    const spendingSp = tv.reduce((s, t) => s + (t.annualSpending || 0), 0)
    const champs = tv.reduce((s, t) => s + ((t.trophies || []).length || t.titles || 0), 0)
    const summaryTab = {
      name: topbar.teamName, valueSp, weeklyRevenueSp, spendingSp, netPL: weeklyRevenueSp - spendingSp,
      franchiseCount: tv.length, championshipCount: champs,
      liquidSp: topbar.sp || 0, budgetSp: topbar.budget,
    }
    const top = [...tv].sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0))[0]
    const topFranchise = top ? {
      name: top.name, sport: top.sport, rank: top.position,
      winRate: (top.wins || top.losses) ? ((top.wins || 0) / ((top.wins || 0) + (top.losses || 0))) * 100 : null,
      roiPercent: top.trendPct, valueSp: top.marketValue,
    } : null
    const totalVal = valueSp || 1
    const allocation = [...tv].sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0)).slice(0, 6)
      .map((t, i) => ({ name: t.name, pct: Math.round(((t.marketValue || 0) / totalVal) * 100), color: ['#F7C948', '#8FB4F0', '#8B5CF6', '#4ADE80', '#3B82F6', '#69748B'][i % 6] }))
    const byFranchise = [...tv].filter((t) => (t.annualEarnings || 0) > 0).sort((a, b) => (b.annualEarnings || 0) - (a.annualEarnings || 0)).slice(0, 6).map((t) => ({ name: t.name, value: t.annualEarnings || 0 }))
    // Cumulative SP series from real activity only; empty → chart empty state.
    let running = 0
    const perf = [...activity].reverse().map((a, i) => {
      const delta = Number(a.amount ?? a.spDelta ?? a.samPoints ?? 0) || 0
      running += delta
      return { label: `#${i + 1}`, value: running }
    })
    const activityMapped = av.map((a, i) => ({
      id: a._id || i, title: a.title || a.module || 'Activity', icon: a.icon,
      color: a.color, timeAgo: timeAgo(a.createdAt), spDelta: Number(a.amount ?? a.spDelta ?? 0) || null,
    }))
    const history = av.map((a, i) => ({
      id: a._id || i, type: (a.type || a.module || 'reward'), title: a.title || a.module || 'Activity',
      description: a.description, timeAgo: timeAgo(a.createdAt), spDelta: Number(a.amount ?? a.spDelta ?? 0) || null, sport: a.sport,
    }))
    return { summary, summaryTab, teamsView: tv, topFranchise, allocation, byFranchise, perf, activityMapped, history }
  }, [teams, activity, topbar])

  const financials = {
    revenue: derived.summaryTab.weeklyRevenueSp,
    expenses: -Math.abs(derived.summaryTab.spendingSp || 0),
    netPL: derived.summaryTab.netPL,
    cashFlow: topbar.budget,
  }

  const onQuickAction = (id) => {
    if (id === 'buy') setBuyOpen(true)
    else if (id === 'exchange') selectTab('exchange')
    else if (id === 'leagues') selectTab('leagues')
    else if (id === 'treasury') selectTab('treasury')
    else if (id === 'vote') selectTab('governance')
    else if (id === 'analytics') selectTab('analytics')
    else if (id === 'history') selectTab('history')
  }

  return (
    <FrontOfficeShell
      teamName={topbar.teamName} sp={topbar.sp} budget={topbar.budget}
      summary={derived.summary} loading={loading}
      active={tab} onSelectTab={selectTab}
      onBuy={() => setBuyOpen(true)} onExchange={() => selectTab('exchange')} onProfile={() => navigate('/edit-profile')}
    >
      {tab === 'overview' && (
        <div className="fo-grid-rail">
          <OverviewTab performance={derived.perf} range={range} onRange={setRange} financials={financials}
            topFranchise={derived.topFranchise} activity={derived.activityMapped}
            onQuickAction={onQuickAction} onManageFranchise={() => selectTab('leagues')} />
          <RightRail onTab={selectTab} />
        </div>
      )}

      {tab === 'leagues' && <LeaguesTab teams={derived.teamsView} loading={loading} onManage={handleManageFranchise} onQuick={onQuickAction} userId={userId} activeLeague={activeLeague} />}

      {tab === 'trophies' && <TrophiesPage onTab={() => selectTab('trophies')} />}

      {tab === 'exchange' && (
        <ExchangeModule balances={{
          ep: topbar.sp || 0,
          empireValue: derived.summaryTab.valueSp || 0,
          availableCap: topbar.budget != null ? topbar.budget : 0,
        }} />
      )}

      {tab === 'governance' && <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18 }}><GovernanceSection /></div>}

      {tab === 'treasury' && (
        <TreasuryTab summary={derived.summaryTab} cashFlow={derived.perf} byFranchise={derived.byFranchise}
          onBuySP={() => navigate('/buy-sampoints')} onTransfer={() => navigate('/war-room')} onTransactions={() => navigate('/transactions')} />
      )}

      {tab === 'analytics' && <AnalyticsTab valueSeries={derived.perf} revenueSeries={derived.perf} allocation={derived.allocation} />}

      {tab === 'history' && <HistoryTab events={derived.history} filter={histFilter} onFilter={setHistFilter} />}

      <SellEmpireDialog open={sellOpen} onClose={() => setSellOpen(false)}
        teamName={topbar.teamName} portfolioValue={derived.summaryTab.valueSp || 0}
        franchiseCount={derived.summaryTab.franchiseCount || 0}
        onConfirm={() => { setSellOpen(false); selectTab('exchange') }} />
      <BuyFranchiseDialog open={buyOpen} onClose={() => setBuyOpen(false)}
        balance={topbar.sp || 0}
        onConfirm={() => { setBuyOpen(false); selectTab('exchange') }} />
    </FrontOfficeShell>
  )
}

/* Portfolio / My Leagues — franchise table built from real teams. */
function LeaguesTab({ teams = [], loading, onManage, onQuick, userId, activeLeague }) {
  const totalVal = teams.reduce((s, t) => s + (t.marketValue || 0), 0) || 1
  const th = (t, r) => <th key={t} style={{ textAlign: r ? 'right' : 'left', fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.5, padding: '10px 12px', borderBottom: `1px solid ${T.border}` }}>{t}</th>
  if (!loading && teams.length === 0) {
    return <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16 }}>
      <EmptyState icon="🏟️" title="No franchises yet" message="Buy or join a franchise to start building your multi-sport empire." actionLabel="Buy Franchise" onAction={() => onQuick && onQuick('buy')} accent={T.purple} />
    </div>
  }
  return (
    <div className="fo-anim" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{th('Asset')}{th('Sport')}{th('Record')}{th('Value', 1)}{th('Revenue', 1)}{th('Alloc.', 1)}{th('Actions', 1)}</tr></thead>
        <tbody>
          {teams.map((t, i) => {
            const rec = `${t.wins || 0}-${t.draws ?? t.ties ?? 0}-${t.losses || 0}`
            const rev = t.annualEarnings || 0
            const alloc = Math.round(((t.marketValue || 0) / totalVal) * 100)
            // These rows are all the current user's OWN teams. Show the badge on
            // any franchise whose league the user commissions — either the row
            // carries its own league commissioner fields, or it matches the
            // active league we know the user commissions.
            const rowLeague = t.league
            const rowIsCommissioner =
              isCommissionerOfLeague(rowLeague, userId) ||
              (!!activeLeague?._id &&
                String(rowLeague?._id || '') === String(activeLeague._id) &&
                isCommissionerOfLeague(activeLeague, userId))
            const showBadge = rowIsCommissioner && !t.hideCommissionerBadge
            return (
              <tr key={t._id || i} style={{ borderTop: i ? `1px solid ${T.border}` : 'none' }}>
                <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, background: `${ACCENT.primary}22`, color: ACCENT.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{(t.name || '?').charAt(0).toUpperCase()}</span>
                  <div><div style={{ fontSize: 13.5, fontWeight: 800, color: T.primary, display: 'flex', alignItems: 'center', gap: 6 }}>{t.name}<CommissionerBadge show={showBadge} size={16} /></div><div style={{ fontSize: 11, color: T.muted }}>{t.league?.name || t.leagueName || 'League'}</div></div>
                </td>
                <td style={{ padding: '12px' }}><SportBadge sport={t.sport} /></td>
                <td style={{ padding: '12px', fontSize: 13, color: T.primary }}>{rec}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: T.primary }}><SPAmount value={t.marketValue} /></td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: 13, color: rev >= 0 ? T.green : T.red }}>{rev >= 0 ? '+' : ''}{formatSP(rev)}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: 13, color: T.secondary }}>{alloc}%</td>
                <td style={{ padding: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button onClick={() => onManage && onManage(t)} style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: 'transparent', color: T.primary, cursor: 'pointer', marginRight: 6 }}>Manage</button>
                  <StatusBadge status="active" />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
