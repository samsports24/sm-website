import React from 'react'
import { useNavigate, Link } from 'react-router-dom'

const HowItWorksPage = () => {
  const navigate = useNavigate()

  return (
    <div style={S.page}>
      {/* ── Nav ── */}
      <nav style={S.nav}>
        <Link to="/" style={S.navLeft}>
          <span style={S.navSam}>SAM</span><span style={S.navSports}>SPORTS</span>
        </Link>
        <div style={S.navRight}>
          <button style={S.navLink} onClick={() => navigate('/about')}>About</button>
          <button style={S.navLink} onClick={() => navigate('/faq')}>FAQ</button>
          <button style={S.navCta} onClick={() => navigate('/select-game')}>Sign Up Free</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={S.hero}>
        <div style={S.heroBadge}>Getting Started</div>
        <h1 style={S.h1}>How SamSports Works</h1>
        <p style={S.heroP}>
          From your first sign-up to winning a championship &mdash; here&apos;s everything
          you need to know to start competing across A.Football, Soccer, and more.
        </p>
      </section>

      {/* ── Steps ── */}
      <section style={S.section}>
        {STEPS.map((step, i) => (
          <div key={i} style={{ ...S.stepRow, flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }}>
            <div style={S.stepContent}>
              <div style={S.stepNum}>{step.num}</div>
              <h2 style={S.stepH2}>{step.title}</h2>
              <p style={S.stepP}>{step.description}</p>
              {step.details.map((d, j) => (
                <div key={j} style={S.detail}>
                  <span style={S.detailIcon}>{d.icon}</span>
                  <div>
                    <div style={S.detailH}>{d.title}</div>
                    <div style={S.detailP}>{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={S.stepVisual}>
              <div style={S.stepCard}>
                <span style={{ fontSize: 48 }}>{step.emoji}</span>
                <div style={S.stepCardLabel}>{step.cardLabel}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Game Modes ── */}
      <section style={{ ...S.section, borderTop: '1px solid rgba(255,255,255,.04)' }}>
        <div style={S.eye}>Game Modes</div>
        <h2 style={S.h2}>Choose how you want to play</h2>
        <div style={S.modesGrid}>
          {MODES.map((m, i) => (
            <div key={i} style={S.modeCard} onClick={() => navigate(m.link)}>
              <div style={{ ...S.modeDot, background: m.color }} />
              <h3 style={S.modeH3}>{m.name}</h3>
              <p style={S.modeP}>{m.desc}</p>
              <span style={{ ...S.modeLink, color: m.color }}>Learn more</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sports Covered ── */}
      <section style={{ ...S.section, borderTop: '1px solid rgba(255,255,255,.04)' }}>
        <div style={S.eye}>Sports &amp; Leagues</div>
        <h2 style={S.h2}>What we cover</h2>
        <div style={S.leaguesGrid}>
          {LEAGUES.map((l, i) => (
            <div key={i} style={S.leagueCard}>
              <span style={{ fontSize: 22 }}>{l.flag}</span>
              <div>
                <div style={S.leagueName}>{l.name}</div>
                <div style={S.leagueCountry}>{l.country}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={S.cta}>
        <div style={S.ctaGlow} />
        <h2 style={S.ctaH2}>Ready to get started?</h2>
        <p style={S.ctaP}>Create your free account in 30 seconds and join thousands of GMs.</p>
        <button style={S.btnPrimary} onClick={() => navigate('/select-game')}>Sign Up Free</button>
      </section>

      {/* ── Footer ── */}
      <footer style={S.footer}>
        <div style={S.footerInner}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>SAM</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#22C55E' }}>SPORTS</span>
          </Link>
          <div style={S.footerLinks}>
            <Link to="/terms" style={S.footerLink}>Terms</Link>
            <Link to="/privacy" style={S.footerLink}>Privacy</Link>
            <Link to="/eu-privacy" style={S.footerLink}>EU Privacy</Link>
            <Link to="/contact" style={S.footerLink}>Contact</Link>
          </div>
          <span style={S.footerCopy}>&copy; {new Date().getFullYear()} SamSports.io</span>
        </div>
      </footer>
    </div>
  )
}

/* ═══ Data ═══ */
const STEPS = [
  {
    num: '01', title: 'Create Your Account', emoji: '🚀', cardLabel: 'Free sign-up',
    description: 'Sign up in seconds with your email. No credit card required — all core features are free.',
    details: [
      { icon: '📧', title: 'Email or Social Login', desc: 'Sign up with email or connect your Google account.' },
      { icon: '🎮', title: 'Pick Your Sport', desc: 'Choose American Football, Soccer, or both. You can always add more later.' },
    ],
  },
  {
    num: '02', title: 'Join or Create a League', emoji: '🏟️', cardLabel: 'Your league, your rules',
    description: 'Join a public league or create a private one for your friends. Set the rules, size, and draft format.',
    details: [
      { icon: '🌍', title: 'Public Leagues', desc: 'Jump straight in — matchmaking places you with GMs at your level.' },
      { icon: '🔒', title: 'Private Leagues', desc: 'Create a league with a custom code. Invite friends, set salary cap and scoring rules.' },
      { icon: '⚙️', title: 'Commissioner Tools', desc: 'Full control over league settings, trade approvals, schedules, and disputes.' },
    ],
  },
  {
    num: '03', title: 'Draft Your Squad', emoji: '📋', cardLabel: 'Build your roster',
    description: 'Pick real players from American Football and Soccer leagues across England, Spain, Italy, Germany, France, Poland, Europe, and the World Cup.',
    details: [
      { icon: '🐍', title: 'Snake Draft', desc: 'Quick and fair — each manager picks one player per round in alternating order.' },
      { icon: '💰', title: 'Auction Draft', desc: 'Full strategy — bid on the players you want using your salary cap budget.' },
      { icon: '📊', title: 'SAM Metric Ratings', desc: 'Every player has a SAM Rating (0–10) so you can scout before you pick.' },
    ],
  },
  {
    num: '04', title: 'Set Your Lineup & Compete', emoji: '⚔️', cardLabel: 'Matchday',
    description: 'Set your 11 starters and 5 subs each matchweek. Real performances are scored using the SAM Metric and you compete head-to-head.',
    details: [
      { icon: '📅', title: 'Weekly Matchups', desc: 'Face a new opponent every week. Highest SAM score wins the matchup.' },
      { icon: '🔄', title: 'Transfers & Trades', desc: 'Work the waiver wire, negotiate trades, and sign free agents all season long.' },
      { icon: '🏆', title: 'Win the Championship', desc: 'Top teams qualify for playoffs. Win the bracket to be crowned league champion.' },
    ],
  },
]

const MODES = [
  { name: 'SAM Rivals', desc: 'H2H matchups with promotion and relegation across 10 divisions.', color: '#22C55E', link: '/products/rivals' },
  { name: 'CL Fantasy', desc: 'Draft from all 36 CL clubs. Real eliminations hit your squad.', color: '#8b5cf6', link: '/products/cl-fantasy' },
  { name: 'Dynasty Fantasy', desc: 'Full-season salary cap leagues with live drafts, trades, and playoffs.', color: '#3b82f6', link: '/products/draft-leagues' },
  { name: 'Predictor', desc: 'Pick match winners and exact scores to earn SamPoints every week.', color: '#f59e0b', link: '/products/predictor' },
]

const LEAGUES = [
  { flag: '🏈', name: 'American Football', country: 'USA' },
  { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England', country: 'Soccer' },
  { flag: '🇪🇸', name: 'Spain', country: 'Soccer' },
  { flag: '🇮🇹', name: 'Italy', country: 'Soccer' },
  { flag: '🇩🇪', name: 'Germany', country: 'Soccer' },
  { flag: '🇫🇷', name: 'France', country: 'Soccer' },
  { flag: '🇵🇱', name: 'Poland', country: 'Soccer' },
  { flag: '🇪🇺', name: 'Europe (CL)', country: 'Soccer' },
  { flag: '🏆', name: 'World Cup 2026', country: 'International' },
]

/* ═══ Styles ═══ */
const S = {
  page: { fontFamily: "'Inter',system-ui,-apple-system,sans-serif", background: '#090c10', color: '#d1d5db', minHeight: '100vh', overflowX: 'hidden', WebkitFontSmoothing: 'antialiased' },

  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 60, padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(9,12,16,.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.04)' },
  navLeft: { display: 'flex', alignItems: 'baseline', gap: 2, textDecoration: 'none' },
  navSam: { fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '.5px' },
  navSports: { fontSize: 17, fontWeight: 800, color: '#22C55E', letterSpacing: '.5px' },
  navRight: { display: 'flex', alignItems: 'center', gap: 24 },
  navLink: { background: 'none', border: 'none', color: '#6b7280', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  navCta: { padding: '8px 20px', background: '#22C55E', color: '#09110a', fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' },

  hero: { paddingTop: 160, textAlign: 'center', maxWidth: 720, margin: '0 auto', padding: '160px 24px 60px' },
  heroBadge: { display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', padding: '6px 16px', borderRadius: 20, border: '1px solid rgba(34,197,94,.25)', color: '#22C55E', background: 'rgba(34,197,94,.08)', marginBottom: 24 },
  h1: { fontSize: 52, fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2px', color: '#f9fafb', marginBottom: 20 },
  heroP: { fontSize: 17, lineHeight: 1.75, color: '#6b7280', maxWidth: 560, margin: '0 auto' },

  section: { padding: '80px 24px', maxWidth: 1100, margin: '0 auto' },
  eye: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, color: '#22C55E' },
  h2: { fontSize: 34, fontWeight: 800, color: '#f9fafb', letterSpacing: '-1px', marginBottom: 32 },

  stepRow: { display: 'flex', gap: 60, alignItems: 'center', marginBottom: 80 },
  stepContent: { flex: 1.4 },
  stepVisual: { flex: 1, display: 'flex', justifyContent: 'center' },
  stepNum: { fontSize: 12, fontWeight: 800, color: '#22C55E', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' },
  stepH2: { fontSize: 28, fontWeight: 800, color: '#f9fafb', letterSpacing: '-.5px', marginBottom: 12 },
  stepP: { fontSize: 15, lineHeight: 1.7, color: '#6b7280', marginBottom: 20 },
  stepCard: { width: 200, height: 200, background: '#111318', border: '1px solid rgba(255,255,255,.04)', borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 },
  stepCardLabel: { fontSize: 12, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 1 },

  detail: { display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 },
  detailIcon: { width: 32, height: 32, background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 },
  detailH: { fontSize: 13, fontWeight: 700, color: '#e5e7eb', marginBottom: 2 },
  detailP: { fontSize: 12, color: '#6b7280', lineHeight: 1.5 },

  modesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 },
  modeCard: { padding: '28px 24px', background: '#111318', border: '1px solid rgba(255,255,255,.04)', borderRadius: 16, cursor: 'pointer', transition: 'border-color .2s' },
  modeDot: { width: 10, height: 10, borderRadius: '50%', marginBottom: 14 },
  modeH3: { fontSize: 16, fontWeight: 700, color: '#f9fafb', marginBottom: 6 },
  modeP: { fontSize: 13, lineHeight: 1.6, color: '#6b7280', marginBottom: 14 },
  modeLink: { fontSize: 12, fontWeight: 700 },

  leaguesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 },
  leagueCard: { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: '#111318', border: '1px solid rgba(255,255,255,.04)', borderRadius: 12 },
  leagueName: { fontSize: 14, fontWeight: 700, color: '#f9fafb' },
  leagueCountry: { fontSize: 11, color: '#6b7280' },

  cta: { padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' },
  ctaGlow: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(34,197,94,.1) 0%, transparent 70%)', pointerEvents: 'none' },
  ctaH2: { fontSize: 40, fontWeight: 800, color: '#f9fafb', letterSpacing: '-1.5px', marginBottom: 12, position: 'relative' },
  ctaP: { fontSize: 16, color: '#4b5563', marginBottom: 32, position: 'relative' },
  btnPrimary: { padding: '14px 40px', background: '#22C55E', color: '#09110a', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', position: 'relative' },

  footer: { borderTop: '1px solid rgba(255,255,255,.04)', padding: '28px 24px' },
  footerInner: { maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 },
  footerLinks: { display: 'flex', gap: 20, flexWrap: 'wrap' },
  footerLink: { color: '#4b5563', fontSize: 12, textDecoration: 'none' },
  footerCopy: { fontSize: 11, color: '#374151' },
}

export default HowItWorksPage
