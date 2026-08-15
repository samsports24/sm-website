import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { espnGet } from './hooks/useESPNData'

/* Leagues surfaced here have working public Team pages (ESPN team data). */
const LEAGUES = [
  { key: 'eng.1', sport: 'soccer', name: 'Premier League', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { key: 'esp.1', sport: 'soccer', name: 'La Liga', emoji: '🇪🇸' },
  { key: 'ger.1', sport: 'soccer', name: 'Bundesliga', emoji: '🇩🇪' },
  { key: 'ita.1', sport: 'soccer', name: 'Serie A', emoji: '🇮🇹' },
  { key: 'fra.1', sport: 'soccer', name: 'Ligue 1', emoji: '🇫🇷' },
  { key: 'pol.1', sport: 'soccer', name: 'Ekstraklasa', emoji: '🇵🇱' },
  { key: 'nfl', sport: 'football', name: 'NFL', emoji: '🏈' },
]

const C = {
  surface: '#061019', border: 'rgba(145,171,187,0.14)', card: '#0B1722', hover: '#0E1D29',
  green: '#5BD313', text: '#F5F7F8', gray: '#A3ADB7', muted: '#687481',
  hd: "'Rajdhani',sans-serif", cd: "'Barlow Condensed',sans-serif",
}
const logoOf = (t) => t?.logos?.find(l => (l.rel || []).includes('default'))?.href || t?.logos?.[0]?.href || ''

const LeaguesTeamsBrowser = () => {
  const navigate = useNavigate()
  const [active, setActive] = useState(0)
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const lg = LEAGUES[active]

  useEffect(() => {
    let alive = true
    setLoading(true)
    ;(async () => {
      const d = await espnGet(lg.sport, lg.key, 'teams')
      const raw = d?.sports?.[0]?.leagues?.[0]?.teams || []
      if (alive) {
        setTeams(raw.map(x => x.team).filter(Boolean).sort((a, b) => (a.displayName || '').localeCompare(b.displayName || '')))
        setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [lg.sport, lg.key])

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginTop: 14 }}>
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 4, height: 16, borderRadius: 2, background: C.green }} />
        <span style={{ fontFamily: C.hd, fontSize: 14, fontWeight: 800, letterSpacing: 0.4, color: C.text, textTransform: 'uppercase' }}>Leagues &amp; Teams</span>
      </div>

      {/* league chips */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 12px', overflowX: 'auto', borderBottom: `1px solid ${C.border}` }}>
        {LEAGUES.map((l, i) => (
          <button key={l.key} onClick={() => setActive(i)} style={{
            flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', gap: 5,
            fontFamily: C.cd, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.3, whiteSpace: 'nowrap',
            padding: '5px 10px', borderRadius: 16, cursor: 'pointer',
            border: `1px solid ${active === i ? C.green : C.border}`,
            background: active === i ? C.green : 'transparent',
            color: active === i ? '#04120a' : C.gray,
          }}>
            <span>{l.emoji}</span>{l.name}
          </button>
        ))}
      </div>

      {/* teams */}
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 22, textAlign: 'center', fontFamily: C.cd, fontSize: 13, color: C.muted }}>Loading teams…</div>
        ) : teams.length === 0 ? (
          <div style={{ padding: 22, textAlign: 'center', fontFamily: C.cd, fontSize: 13, color: C.muted }}>No teams available for {lg.name}.</div>
        ) : teams.map((t) => (
          <div
            key={t.id}
            onClick={() => navigate(`/team/${lg.sport}/${lg.key}/${t.id}`)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: `1px solid ${C.border}`, cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.hover }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            {logoOf(t) && <img src={logoOf(t)} alt="" style={{ width: 22, height: 22, objectFit: 'contain', flex: '0 0 auto' }} />}
            <span style={{ fontFamily: C.hd, fontSize: 13.5, fontWeight: 700, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t.shortDisplayName || t.displayName}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LeaguesTeamsBrowser
