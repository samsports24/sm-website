import React from 'react'

/* The single tab navigation for every Front Office page. Kept as tabs on the
   existing /war-room route (deep-linkable via ?tab=) rather than 8 hard routes,
   per the audit — changing the route would break existing links. */
export const FO_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'leagues', label: 'My Leagues' },
  { key: 'trophies', label: 'Trophies' },
  { key: 'exchange', label: 'Exchange' },
  { key: 'governance', label: 'Governance' },
  { key: 'treasury', label: 'Treasury' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'history', label: 'History' },
]

export default function FrontOfficeTabs({ active, onSelect }) {
  return (
    <div className="empire-tab-bar" role="tablist" aria-label="Front Office sections" style={{ overflowX: 'auto' }}>
      {FO_TABS.map((t) => {
        const on = active === t.key
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={on}
            className={`empire-tab ${on ? 'active' : ''}`}
            onClick={() => onSelect(t.key)}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
