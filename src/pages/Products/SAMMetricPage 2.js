import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

/* ═══ SAM Metric marketing page — covers both NFL & Soccer ═══ */

const SAMMetricPage = () => {
  const navigate = useNavigate()
  const [sport, setSport] = useState('soccer')

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
        <div style={S.heroBadge}>Scoring System</div>
        <h1 style={S.h1}>The SAM Metric</h1>
        <p style={S.heroP}>
          Our proprietary scoring engine that turns every real-world performance into fantasy points.
          One system, every sport &mdash; from American Football touchdowns to European soccer clean sheets.
        </p>
        <div style={S.heroBtns}>
          <button style={S.btnPrimary} onClick={() => navigate('/select-game')}>Start Playing</button>
          <button style={S.btnSecondary} onClick={() => navigate('/rule-book')}>Full Rule Book</button>
        </div>
      </section>

      {/* ── What is it ── */}
      <section style={S.section}>
        <div style={S.sectionEye}>Overview</div>
        <h2 style={S.h2}>What is the SAM Metric?</h2>
        <div style={S.twoCol}>
          <div style={S.textBlock}>
            <p style={S.p}>
              The SAM Metric is the scoring engine behind every SamSports fantasy league. Unlike traditional
              fantasy scoring that only rewards obvious stats like touchdowns or goals, the SAM Metric captures
              the full picture of a player&apos;s contribution to their team.
            </p>
            <p style={S.p}>
              Every stat is weighted with a <strong style={{ color: '#f9fafb' }}>base point value</strong> and
              a <strong style={{ color: '#f9fafb' }}>position multiplier</strong>. A goalkeeper saving a penalty
              is worth more than a striker doing the same. A cornerback getting an interception is weighted
              differently than a linebacker. This ensures every position is fairly scored relative to their role.
            </p>
            <p style={S.p}>
              The formula is simple:{' '}
              <span style={S.formula}>Fantasy Points = stat value × base points × position multiplier</span>
            </p>
          </div>
          <div style={S.principleCards}>
            {[
              { icon: '⚖️', title: 'Position-Balanced', desc: 'Every position has its own multipliers so defenders, midfielders, and attackers are all fairly valued.' },
              { icon: '📊', title: 'Full-Spectrum', desc: 'Tackles, interceptions, key passes, aerial duels — not just goals and assists. Every contribution counts.' },
              { icon: '🔄', title: 'Cross-Sport', desc: 'Same core philosophy across NFL and Soccer. Learn the system once, play across every league.' },
            ].map((p, i) => (
              <div key={i} style={S.principleCard}>
                <span style={{ fontSize: 20 }}>{p.icon}</span>
                <div>
                  <div style={S.principleH}>{p.title}</div>
                  <div style={S.principleP}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sport Toggle + Breakdown ── */}
      <section style={{ ...S.section, borderTop: '1px solid rgba(255,255,255,.04)' }}>
        <div style={S.sectionEye}>Scoring Breakdown</div>
        <h2 style={S.h2}>How points are calculated</h2>

        {/* Sport toggle */}
        <div style={S.toggleRow}>
          <button style={sport === 'soccer' ? S.toggleActive : S.toggle} onClick={() => setSport('soccer')}>
            ⚽ Soccer
          </button>
          <button style={sport === 'nfl' ? S.toggleActive : S.toggle} onClick={() => setSport('nfl')}>
            🏈 American Football
          </button>
        </div>

        {sport === 'soccer' ? (
          <>
            <p style={{ ...S.p, marginBottom: 28 }}>
              Soccer scoring uses 11 position groups (GK, CB, FB, WB, CDM, CM, WM, CAM, WNG, CF, ST) with
              unique multipliers for each. Covers England, Spain, Italy, Germany, France,
              Poland, Europe (CL), and World Cup.
            </p>
            <div style={S.statGrid}>
              {SOCCER_STATS.map((s, i) => (
                <div key={i} style={S.statCard}>
                  <div style={S.statHeader}>
                    <span style={S.statName}>{s.name}</span>
                    <span style={S.statBase}>{s.base > 0 ? '+' : ''}{s.base} pts</span>
                  </div>
                  <p style={S.statDesc}>{s.desc}</p>
                  <div style={S.statPositions}>
                    {s.positions.map((p, j) => (
                      <span key={j} style={{ ...S.statPill, background: p.bg, color: p.color }}>{p.label}: ×{p.mult}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p style={{ ...S.p, marginBottom: 28 }}>
              NFL scoring covers 12 position types (QB, RB, WR, TE, OL, K, P, DT, DE, LB, CB, S) with
              multipliers that reflect each position&apos;s on-field impact.
            </p>
            <div style={S.statGrid}>
              {NFL_STATS.map((s, i) => (
                <div key={i} style={S.statCard}>
                  <div style={S.statHeader}>
                    <span style={S.statName}>{s.name}</span>
                    <span style={S.statBase}>{s.base > 0 ? '+' : ''}{s.base} pts</span>
                  </div>
                  <p style={S.statDesc}>{s.desc}</p>
                  <div style={S.statPositions}>
                    {s.positions.map((p, j) => (
                      <span key={j} style={{ ...S.statPill, background: p.bg, color: p.color }}>{p.label}: ×{p.mult}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── SAM Rating Scale ── */}
      <section style={{ ...S.section, borderTop: '1px solid rgba(255,255,255,.04)' }}>
        <div style={S.sectionEye}>Rating</div>
        <h2 style={S.h2}>The 0–10 SAM Rating</h2>
        <p style={{ ...S.p, maxWidth: 600, marginBottom: 32 }}>
          Every matchday performance is also converted into a 0.0–10.0 SAM Rating for easy comparison.
          This is the number you see on player cards and scouting reports.
        </p>
        <div style={S.scaleRow}>
          {SCALE.map((s, i) => (
            <div key={i} style={{ ...S.scaleSeg, background: s.color }}>
              <span style={S.scaleLabel}>{s.label}</span>
              <span style={S.scaleRange}>{s.range}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={S.cta}>
        <div style={S.ctaGlow} />
        <h2 style={S.ctaH2}>See the SAM Metric in action</h2>
        <p style={S.ctaP}>Create your free account and watch every real performance turn into fantasy points.</p>
        <button style={{ ...S.btnPrimary, padding: '14px 40px', fontSize: 15 }} onClick={() => navigate('/select-game')}>
          Sign Up Free
        </button>
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

/* ═══ Soccer scoring data ═══ */
const g = '#22C55E'
const gb = '#22C55E18'
const b = '#3b82f6'
const bb = '#3b82f618'
const r = '#ef4444'
const rb = '#ef444418'
const a = '#f59e0b'
const ab = '#f59e0b18'

const SOCCER_STATS = [
  { name: 'Goals', base: 4.0, desc: 'Defenders and goalkeepers earn huge multipliers for rare goals.',
    positions: [{ label: 'GK', mult: '2.5', color: a, bg: ab }, { label: 'CB', mult: '1.5', color: g, bg: gb }, { label: 'ST', mult: '1.0', color: b, bg: bb }] },
  { name: 'Assists', base: 3.0, desc: 'Wingers and creative players get the highest assist multipliers.',
    positions: [{ label: 'WNG', mult: '1.5', color: g, bg: gb }, { label: 'CAM', mult: '1.3', color: b, bg: bb }, { label: 'ST', mult: '1.0', color: b, bg: bb }] },
  { name: 'Clean Sheets', base: 4.0, desc: 'Goalkeepers and centre-backs are most rewarded. Attackers get nothing.',
    positions: [{ label: 'GK', mult: '1.5', color: a, bg: ab }, { label: 'CB', mult: '1.2', color: g, bg: gb }, { label: 'CDM', mult: '0.8', color: b, bg: bb }] },
  { name: 'Saves', base: 0.5, desc: 'Exclusive to goalkeepers. High multiplier makes every save count.',
    positions: [{ label: 'GK', mult: '2.0', color: a, bg: ab }] },
  { name: 'Tackles Won', base: 0.7, desc: 'CDMs and full-backs get the best return for winning the ball.',
    positions: [{ label: 'CDM', mult: '1.8', color: g, bg: gb }, { label: 'CB', mult: '1.4', color: g, bg: gb }, { label: 'WNG', mult: '0.6', color: b, bg: bb }] },
  { name: 'Interceptions', base: 0.7, desc: 'Reading the game is rewarded — especially for CDMs and centre-backs.',
    positions: [{ label: 'CDM', mult: '1.6', color: g, bg: gb }, { label: 'CB', mult: '1.5', color: g, bg: gb }, { label: 'ST', mult: '0.4', color: b, bg: bb }] },
  { name: 'Key Passes', base: 1.0, desc: 'Creative vision rewarded most for CAMs and wingers.',
    positions: [{ label: 'CAM', mult: '1.6', color: g, bg: gb }, { label: 'WNG', mult: '1.5', color: g, bg: gb }, { label: 'GK', mult: '0.2', color: b, bg: bb }] },
  { name: 'Successful Dribbles', base: 0.5, desc: 'Wingers who take on defenders get the highest multiplier.',
    positions: [{ label: 'WNG', mult: '1.8', color: g, bg: gb }, { label: 'CAM', mult: '1.4', color: g, bg: gb }, { label: 'CB', mult: '0.3', color: b, bg: bb }] },
  { name: 'Yellow / Red Cards', base: -1.0, desc: 'Discipline matters. Red cards are -3 base points.',
    positions: [{ label: 'All', mult: '1.0', color: r, bg: rb }] },
  { name: 'Penalty Saved', base: 5.0, desc: 'Massive reward for goalkeepers who stop a penalty.',
    positions: [{ label: 'GK', mult: '1.0', color: a, bg: ab }] },
]

const NFL_STATS = [
  { name: 'Passing TD', base: 4.0, desc: 'Quarterbacks are the primary earners but the multiplier keeps it balanced.',
    positions: [{ label: 'QB', mult: '1.0', color: a, bg: ab }, { label: 'RB', mult: '1.5', color: g, bg: gb }] },
  { name: 'Rushing TD', base: 6.0, desc: 'Rushing TDs are more valuable. RBs and QBs benefit the most.',
    positions: [{ label: 'RB', mult: '1.0', color: a, bg: ab }, { label: 'QB', mult: '1.2', color: g, bg: gb }, { label: 'WR', mult: '1.3', color: g, bg: gb }] },
  { name: 'Receiving TD', base: 6.0, desc: 'Tight ends get a boost since TDs are harder to come by at the position.',
    positions: [{ label: 'TE', mult: '1.2', color: g, bg: gb }, { label: 'WR', mult: '1.0', color: b, bg: bb }, { label: 'RB', mult: '1.1', color: b, bg: bb }] },
  { name: 'Passing Yards', base: 0.04, desc: 'Every 25 passing yards = 1 point. Steady accumulation for QBs.',
    positions: [{ label: 'QB', mult: '1.0', color: a, bg: ab }] },
  { name: 'Rushing Yards', base: 0.1, desc: 'Every 10 rushing yards = 1 point. Ground game is rewarded.',
    positions: [{ label: 'RB', mult: '1.0', color: a, bg: ab }, { label: 'QB', mult: '1.2', color: g, bg: gb }, { label: 'WR', mult: '1.3', color: g, bg: gb }] },
  { name: 'Receiving Yards', base: 0.1, desc: 'Every 10 receiving yards = 1 point. Volume receivers thrive.',
    positions: [{ label: 'WR', mult: '1.0', color: b, bg: bb }, { label: 'TE', mult: '1.1', color: g, bg: gb }, { label: 'RB', mult: '1.2', color: g, bg: gb }] },
  { name: 'Interception (DEF)', base: 6.0, desc: 'Defensive takeaways are huge. CBs and safeties earn big.',
    positions: [{ label: 'CB', mult: '1.0', color: g, bg: gb }, { label: 'S', mult: '1.0', color: g, bg: gb }, { label: 'LB', mult: '1.1', color: g, bg: gb }] },
  { name: 'Sack', base: 3.0, desc: 'Pass rushers are rewarded for getting to the quarterback.',
    positions: [{ label: 'DE', mult: '1.0', color: r, bg: rb }, { label: 'DT', mult: '1.1', color: r, bg: rb }, { label: 'LB', mult: '1.0', color: g, bg: gb }] },
  { name: 'Fumble Lost', base: -2.0, desc: 'Turnovers hurt. Ball security is a premium skill.',
    positions: [{ label: 'All', mult: '1.0', color: r, bg: rb }] },
  { name: 'Field Goal', base: 3.0, desc: 'Kickers earn points per FG. Longer kicks earn bonus points.',
    positions: [{ label: 'K', mult: '1.0', color: a, bg: ab }] },
]

const SCALE = [
  { label: 'Poor', range: '0–3', color: '#ef4444' },
  { label: 'Below Avg', range: '3–5', color: '#f97316' },
  { label: 'Average', range: '5–6', color: '#eab308' },
  { label: 'Good', range: '6–7', color: '#3b82f6' },
  { label: 'Excellent', range: '7–8', color: '#22c55e' },
  { label: 'World Class', range: '8–10', color: '#a855f7' },
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

  hero: { paddingTop: 160, textAlign: 'center', maxWidth: 720, margin: '0 auto', padding: '160px 24px 80px' },
  heroBadge: { display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', padding: '6px 16px', borderRadius: 20, border: '1px solid rgba(34,197,94,.25)', color: '#22C55E', background: 'rgba(34,197,94,.08)', marginBottom: 24 },
  h1: { fontSize: 52, fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2px', color: '#f9fafb', marginBottom: 20 },
  heroP: { fontSize: 17, lineHeight: 1.75, color: '#6b7280', maxWidth: 580, margin: '0 auto 36px' },
  heroBtns: { display: 'flex', justifyContent: 'center', gap: 12 },
  btnPrimary: { padding: '12px 28px', background: '#22C55E', color: '#09110a', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' },
  btnSecondary: { padding: '12px 28px', background: 'rgba(255,255,255,.04)', color: '#d1d5db', fontWeight: 500, fontSize: 14, border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' },

  section: { padding: '100px 24px', maxWidth: 1100, margin: '0 auto' },
  sectionEye: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, color: '#22C55E' },
  h2: { fontSize: 36, fontWeight: 800, color: '#f9fafb', letterSpacing: '-1px', marginBottom: 20 },
  p: { fontSize: 15, lineHeight: 1.75, color: '#6b7280', marginBottom: 16 },
  formula: { display: 'inline-block', padding: '4px 12px', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.15)', borderRadius: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 600, color: '#22C55E' },

  twoCol: { display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 40, alignItems: 'start', marginTop: 20 },
  textBlock: {},
  principleCards: { display: 'grid', gap: 14 },
  principleCard: { display: 'flex', gap: 14, padding: '20px 18px', background: '#111318', border: '1px solid rgba(255,255,255,.04)', borderRadius: 14 },
  principleH: { fontSize: 14, fontWeight: 700, color: '#f9fafb', marginBottom: 4 },
  principleP: { fontSize: 12, lineHeight: 1.6, color: '#6b7280' },

  toggleRow: { display: 'flex', gap: 8, marginBottom: 28 },
  toggle: { padding: '10px 24px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 8, color: '#6b7280', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' },
  toggleActive: { padding: '10px 24px', background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.3)', borderRadius: 8, color: '#22C55E', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' },

  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 },
  statCard: { padding: '22px 20px', background: '#111318', border: '1px solid rgba(255,255,255,.04)', borderRadius: 14 },
  statHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  statName: { fontSize: 15, fontWeight: 700, color: '#f9fafb' },
  statBase: { fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" },
  statDesc: { fontSize: 12, lineHeight: 1.55, color: '#6b7280', marginBottom: 12 },
  statPositions: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  statPill: { fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6 },

  scaleRow: { display: 'flex', gap: 4, maxWidth: 700 },
  scaleSeg: { flex: 1, padding: '14px 8px', borderRadius: 10, textAlign: 'center' },
  scaleLabel: { display: 'block', fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 2 },
  scaleRange: { display: 'block', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.7)' },

  cta: { padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' },
  ctaGlow: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(34,197,94,.1) 0%, transparent 70%)', pointerEvents: 'none' },
  ctaH2: { fontSize: 40, fontWeight: 800, color: '#f9fafb', letterSpacing: '-1.5px', marginBottom: 12, position: 'relative' },
  ctaP: { fontSize: 16, color: '#4b5563', marginBottom: 32, position: 'relative' },

  footer: { borderTop: '1px solid rgba(255,255,255,.04)', padding: '28px 24px' },
  footerInner: { maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 },
  footerLinks: { display: 'flex', gap: 20, flexWrap: 'wrap' },
  footerLink: { color: '#4b5563', fontSize: 12, textDecoration: 'none' },
  footerCopy: { fontSize: 11, color: '#374151' },
}

/* ── Responsive overrides via media query would go in CSS file,
     but inline styles cover the default desktop layout ── */

export default SAMMetricPage
