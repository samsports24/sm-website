import './MobileBottomNav.css'

/**
 * MobileBottomNav — fixed, horizontally-scrollable bottom tab bar (mobile only).
 * Props: items: [{ label, icon, active, onClick }], accent (css color)
 */
export default function MobileBottomNav({ items = [], accent = '#7C3AED' }) {
  return (
    <nav className="mbn" style={{ '--mbn-accent': accent }}>
      {items.map((it, i) => (
        <button
          key={i}
          type="button"
          className={'mbn-item' + (it.active ? ' active' : '')}
          onClick={it.onClick}
        >
          <span className="mbn-icon">{it.icon}</span>
          <span className="mbn-label">{it.label}</span>
        </button>
      ))}
    </nav>
  )
}
