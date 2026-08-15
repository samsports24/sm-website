import React from 'react'
import EmpireHero from './EmpireHero'
import FrontOfficeTabs from './FrontOfficeTabs'
import { formatSP, T } from './primitives'

/* FrontOfficeShell — ONE shell for every Front Office page.
   Renders: compact TopBar → EmpireHero → FrontOfficeTabs → page content.
   The global app sidebar is provided by the app layout (<L>), so it is not
   duplicated here. Pages pass their content as children. */

function TopBar({ teamName, sp, budget, onProfile, onNotifications }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', padding: '12px 20px', borderBottom: `1px solid ${T.border}`, background: 'linear-gradient(90deg,#0A0E17,#080C14)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div>
          <div className="fo-display" style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{teamName || 'Your Empire'}</div>
          <div style={{ fontSize: 11, color: T.muted }}>Front Office</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0C1320', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, padding: '8px 16px', whiteSpace: 'nowrap' }}>
          <span aria-hidden style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 10 }}>SP</span>
          <div><div className="fo-num" style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{Number(sp || 0).toLocaleString()}</div><div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.4 }}>SamPoints</div></div>
        </div>
        {budget != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0C1320', border: `1px solid ${T.border}`, borderRadius: 12, padding: '8px 16px', whiteSpace: 'nowrap' }}>
            <span aria-hidden style={{ fontSize: 16 }}>💼</span>
            <div><div className="fo-num" style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{formatSP(budget)}</div><div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.4 }}>Budget Left</div></div>
          </div>
        )}
        <span style={{ width: 1, height: 30, background: T.border }} />
        <button aria-label="Notifications" onClick={onNotifications} style={{ background: 'transparent', border: 'none', fontSize: 19, cursor: 'pointer', color: '#AEB6C4' }}>🔔</button>
        <button aria-label="Messages" style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer', color: '#AEB6C4' }}>💬</button>
        <button aria-label="Profile" onClick={onProfile} style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg,#16A34A,#0f7a37)', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>{(teamName || 'U').charAt(0).toUpperCase()}</button>
      </div>
    </div>
  )
}

/**
 * @param {{teamName?:string, sp?:number, budget?:number, summary?:object, loading?:boolean,
 *   active:string, onSelectTab:Function, onBuy?:Function, onExchange?:Function,
 *   onProfile?:Function, onNotifications?:Function, children:React.ReactNode}} p
 */
export default function FrontOfficeShell({ teamName, sp, budget, summary, loading, active, onSelectTab, onBuy, onExchange, onProfile, onNotifications, children }) {
  return (
    <div className="empire-page">
      <TopBar teamName={teamName} sp={sp} budget={budget} onProfile={onProfile} onNotifications={onNotifications} />
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 20px 40px' }}>
        <EmpireHero summary={summary} loading={loading} onBuy={onBuy} onExchange={onExchange} />
        <div className="fo-tabs-wrap" style={{ margin: '16px 0 8px' }}>
          <FrontOfficeTabs active={active} onSelect={onSelectTab} />
        </div>
        <main>{children}</main>
      </div>
    </div>
  )
}
