import { useState, useRef, useEffect } from 'react'
import { GlobalOutlined } from '@ant-design/icons'
import { useLanguage } from './LanguageContext'
import { LANGUAGES } from './translations'

const LanguageSwitcher = ({ style, accentColor = '#22C55E' }) => {
  const { lang, changeLang } = useLanguage()
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', ...style }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          padding: '5px 10px',
          borderRadius: '8px',
          border: '1px solid rgba(110, 105, 128, 0.25)',
          background: open ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
          transition: 'all 0.2s ease',
          fontSize: '12px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.7)',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: '13px', lineHeight: 1 }}>{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
        <GlobalOutlined style={{ fontSize: '10px', opacity: 0.4 }} />
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '6px',
            background: '#111827',
            border: '1px solid rgba(110, 105, 128, 0.3)',
            borderRadius: '10px',
            padding: '6px',
            minWidth: '140px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 1000,
          }}
        >
          {LANGUAGES.map((l) => (
            <div
              key={l.code}
              onClick={() => {
                changeLang(l.code)
                setOpen(false)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: l.code === lang ? 700 : 500,
                color: l.code === lang ? accentColor : 'rgba(255,255,255,0.7)',
                background: l.code === lang ? `${accentColor}12` : 'transparent',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (l.code !== lang) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = l.code === lang ? `${accentColor}12` : 'transparent'
              }}
            >
              <span style={{ fontSize: '14px', lineHeight: 1 }}>{l.flag}</span>
              <span style={{ flex: 1 }}>{l.label}</span>
              {l.code === lang && (
                <span style={{ fontSize: '11px', color: accentColor }}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
