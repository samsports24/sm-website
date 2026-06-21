import { useState, useEffect, useMemo } from 'react'
import { usePartner } from '../contexts/PartnerContext'
import { publicAPI } from '../config/constants'
import { QRCodeSVG } from 'qrcode.react'

/**
 * Full-screen TV display for partner venues.
 * Shows leaderboard, upcoming events, announcements, and live scores.
 * Designed for bar/pub screens — auto-rotates between panels.
 *
 * Access via partner subdomain (auto-detected) OR via query param:
 *   samsports.io/tv?partner=fgcu
 */
const PartnerTVDisplay = () => {
  const partnerCtx = usePartner()
  const [partnerOverride, setPartnerOverride] = useState(null)
  const [events, setEvents] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [leagueStandings, setLeagueStandings] = useState([])
  const [activeLeagueIdx, setActiveLeagueIdx] = useState(0)
  const [activePanel, setActivePanel] = useState(0)
  const [clock, setClock] = useState(new Date())

  // Check for ?partner= query param when no subdomain context
  const queryPartner = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('partner')
  }, [])

  // Fetch partner branding from query param if no subdomain context
  useEffect(() => {
    if (partnerCtx.subdomain || !queryPartner) return
    publicAPI.get(`/partner/branding/${queryPartner}`)
      .then(r => {
        const d = r?.data?.data
        if (d) {
          setPartnerOverride({
            subdomain: queryPartner,
            businessName: d.businessName || d.name || queryPartner,
            logo: d.branding?.logo || null,
            primaryColor: d.branding?.primaryColor || null,
            timezone: d.settings?.timezone || null,
          })
        }
      })
      .catch(() => {})
  }, [partnerCtx.subdomain, queryPartner])

  // Merge: context partner takes priority, then query param override, then defaults
  const subdomain = partnerCtx.subdomain || partnerOverride?.subdomain || ''
  const businessName = partnerCtx.businessName || partnerOverride?.businessName || 'SAMSPORTS'
  const logo = partnerCtx.logo || partnerOverride?.logo || null
  const primaryColor = partnerCtx.primaryColor || partnerOverride?.primaryColor || null
  const timezone = partnerCtx.timezone || partnerOverride?.timezone || null

  // Fetch data
  useEffect(() => {
    if (!subdomain) return
    const load = () => {
      publicAPI.get(`/partner/events/public/${subdomain}`).then(r => setEvents(r?.data?.data || [])).catch(() => {})
      publicAPI.get(`/partner/announcements/public/${subdomain}`).then(r => setAnnouncements(r?.data?.data || [])).catch(() => {})
      publicAPI.get(`/partner/tv-standings/${subdomain}`).then(r => {
        const data = r?.data?.data || []
        // Only keep leagues that have teams with scores
        setLeagueStandings(data.filter(l => l.teams && l.teams.length > 0))
      }).catch(() => {})
    }
    load()
    const interval = setInterval(load, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [subdomain])

  // Auto-rotate leagues within the leaderboard panel (every 8s)
  useEffect(() => {
    if (leagueStandings.length <= 1) return
    const t = setInterval(() => setActiveLeagueIdx(i => (i + 1) % leagueStandings.length), 8000)
    return () => clearInterval(t)
  }, [leagueStandings.length])

  // Clock
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Format time/date in partner timezone
  const tz = timezone || 'America/New_York'
  const formatTime = (date) => {
    try {
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: tz })
    } catch { return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
  }
  const formatDate = (date) => {
    try {
      return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz })
    } catch { return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }
  }
  const formatEventTime = (date) => {
    try {
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz })
    } catch { return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }
  }
  const getMonthInTz = (date) => {
    try {
      const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
      const m = parseInt(new Intl.DateTimeFormat('en', { month: 'numeric', timeZone: tz }).format(date), 10) - 1
      return months[m]
    } catch { return ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][date.getMonth()] }
  }
  const getDayInTz = (date) => {
    try {
      return new Intl.DateTimeFormat('en', { day: 'numeric', timeZone: tz }).format(date)
    } catch { return date.getDate() }
  }

  // Auto-rotate panels
  const panels = ['leaderboard', 'events', 'announcements'].filter((p) => {
    if (p === 'events' && events.length === 0) return false
    if (p === 'announcements' && announcements.length === 0) return false
    return true
  })

  useEffect(() => {
    if (panels.length <= 1) return
    const t = setInterval(() => setActivePanel((p) => (p + 1) % panels.length), 12000)
    return () => clearInterval(t)
  }, [panels.length])

  const pc = primaryColor || '#D4A843'
  const joinUrl = subdomain ? `https://${subdomain}.samsports.io` : 'https://samsports.io'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A0F1C 0%, #141C2D 50%, #0A0F1C 100%)',
      color: '#E2E8F0',
      fontFamily: "'Rajdhani', sans-serif",
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        borderBottom: `2px solid ${pc}33`,
        background: 'rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {logo && <img src={logo} alt="" style={{ height: 48, borderRadius: 8, objectFit: 'contain' }} />}
          <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: 2, color: pc, textTransform: 'uppercase' }}>
            {businessName}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: 2, fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(clock)}
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
            {formatDate(clock)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px', height: 'calc(100vh - 100px)', display: 'flex', gap: 32 }}>

        {/* Left: Rotating Panels */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* Panel: Leaderboard */}
          {panels[activePanel % panels.length] === 'leaderboard' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {leagueStandings.length > 0 ? (() => {
                const league = leagueStandings[activeLeagueIdx % leagueStandings.length]
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h2 style={{ fontSize: 24, fontWeight: 700, color: pc, textTransform: 'uppercase', letterSpacing: 2, margin: 0 }}>
                        {league.leagueName}
                      </h2>
                      {leagueStandings.length > 1 && (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {leagueStandings.map((_, i) => (
                            <div key={i} style={{
                              width: 8, height: 8, borderRadius: '50%',
                              background: i === (activeLeagueIdx % leagueStandings.length) ? pc : 'rgba(255,255,255,0.15)',
                              transition: 'all 0.3s',
                            }} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{
                      background: 'rgba(20, 28, 45, 0.8)',
                      borderRadius: 16,
                      border: '1px solid rgba(255,255,255,0.06)',
                      overflow: 'hidden',
                      flex: 1,
                    }}>
                      {/* Table Header */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '50px 1fr 100px',
                        padding: '14px 24px',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(0,0,0,0.2)',
                      }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>#</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Team</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'right' }}>Score</span>
                      </div>
                      {/* Team Rows */}
                      {league.teams.slice(0, 10).map((team, i) => {
                        const isTop3 = i < 3
                        const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32']
                        return (
                          <div key={team.teamId || i} style={{
                            display: 'grid',
                            gridTemplateColumns: '50px 1fr 100px',
                            padding: '12px 24px',
                            alignItems: 'center',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            background: isTop3 ? `${medalColors[i]}08` : 'transparent',
                            transition: 'all 0.3s',
                          }}>
                            <span style={{
                              fontSize: 18,
                              fontWeight: 800,
                              color: isTop3 ? medalColors[i] : 'rgba(255,255,255,0.3)',
                            }}>
                              {team.rank}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                              {team.logo ? (
                                <img src={team.logo} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                              ) : (
                                <div style={{
                                  width: 32, height: 32, borderRadius: 6,
                                  background: `${pc}20`, border: `1px solid ${pc}40`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 14, fontWeight: 700, color: pc, flexShrink: 0,
                                }}>
                                  {(team.abbreviation || team.name || '?').charAt(0)}
                                </div>
                              )}
                              <div style={{ minWidth: 0 }}>
                                <div style={{
                                  fontSize: 16, fontWeight: 700, color: '#fff',
                                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>
                                  {team.name || 'Unknown Team'}
                                </div>
                                {team.gmName && (
                                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                                    GM: {team.gmName}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span style={{
                              fontSize: 20,
                              fontWeight: 800,
                              color: isTop3 ? '#fff' : 'rgba(255,255,255,0.7)',
                              textAlign: 'right',
                              fontVariantNumeric: 'tabular-nums',
                            }}>
                              {(team.score || 0).toLocaleString()}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )
              })() : (
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: pc, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24 }}>
                    Fantasy Leaderboard
                  </h2>
                  <div style={{
                    background: 'rgba(20, 28, 45, 0.8)',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.06)',
                    padding: 32,
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 18,
                  }}>
                    <p style={{ fontSize: 48, marginBottom: 8 }}>&#127942;</p>
                    <p>Join a league to compete!</p>
                    <p style={{ fontSize: 14, marginTop: 8 }}>Scan the QR code or visit <span style={{ color: pc }}>{subdomain ? `${subdomain}.samsports.io` : 'samsports.io'}</span></p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Panel: Events */}
          {panels[activePanel % panels.length] === 'events' && (
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: pc, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24 }}>
                Upcoming Events
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {events.slice(0, 5).map((ev, i) => {
                  const d = new Date(ev.date)
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      gap: 20,
                      alignItems: 'center',
                      background: 'rgba(20, 28, 45, 0.8)',
                      borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.06)',
                      padding: '20px 28px',
                    }}>
                      <div style={{
                        width: 70, textAlign: 'center',
                        background: `${pc}15`, border: `1px solid ${pc}33`,
                        borderRadius: 10, padding: '8px 4px',
                      }}>
                        <div style={{ fontSize: 12, color: pc, fontWeight: 700, letterSpacing: 1 }}>{getMonthInTz(d)}</div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>{getDayInTz(d)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{ev.title}</div>
                        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                          {formatEventTime(d)} &#8212; {ev.type?.replace('_', ' ')}
                        </div>
                        {ev.description && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{ev.description}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Panel: Announcements */}
          {panels[activePanel % panels.length] === 'announcements' && (
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: pc, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24 }}>
                Announcements
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {announcements.slice(0, 4).map((a, i) => (
                  <div key={i} style={{
                    background: 'rgba(20, 28, 45, 0.8)',
                    borderRadius: 14,
                    border: `1px solid ${a.type === 'urgent' ? 'rgba(255,59,59,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    padding: '24px 28px',
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{a.title}</div>
                    <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{a.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: QR Code Panel */}
        <div style={{
          width: 220,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          background: 'rgba(20, 28, 45, 0.6)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '32px 20px',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <QRCodeSVG
              value={joinUrl}
              size={160}
              fgColor="#0A0F1C"
              bgColor="#ffffff"
              level="M"
              includeMargin={false}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: pc, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              Scan to Join
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>
              {subdomain ? `${subdomain}.samsports.io` : 'samsports.io'}
            </div>
          </div>
          <div style={{
            marginTop: 8,
            padding: '8px 16px',
            background: `${pc}20`,
            border: `1px solid ${pc}40`,
            borderRadius: 8,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>Play Fantasy</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: pc }}>NFL &amp; Soccer</div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '12px 32px',
        background: 'rgba(0,0,0,0.4)',
        borderTop: `1px solid ${pc}22`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          Powered by SamSports
        </span>
        {/* Panel indicators */}
        {panels.length > 1 && (
          <div style={{ display: 'flex', gap: 8 }}>
            {panels.map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i === (activePanel % panels.length) ? pc : 'rgba(255,255,255,0.15)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        )}
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          {subdomain ? `${subdomain}.samsports.io` : 'samsports.io'}
        </span>
      </div>
    </div>
  )
}

export default PartnerTVDisplay
