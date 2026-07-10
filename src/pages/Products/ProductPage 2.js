import React from 'react'
import { useNavigate, Link } from 'react-router-dom'

/**
 * Shared marketing page shell for individual products.
 * Each product page supplies its own content via props.
 *
 * Props:
 *   accentColor   - hex color for accent (#22C55E, #8b5cf6, etc.)
 *   eyebrow       - small label above headline
 *   headline      - main headline
 *   subheadline   - supporting paragraph
 *   features      - [{ icon, title, description }]
 *   highlights    - [{ stat, label }]  (e.g. "17", "Matchweeks")
 *   howItWorks    - [{ step, title, description }]
 *   ctaText       - final CTA section text
 */
const ProductPage = ({
  accentColor = '#22C55E',
  eyebrow = '',
  headline = '',
  subheadline = '',
  features = [],
  highlights = [],
  howItWorks = [],
  ctaText = 'Ready to play?',
}) => {
  const navigate = useNavigate()
  const accentBg = accentColor + '12'
  const accentBorder = accentColor + '25'

  return (
    <div style={S.page}>
      {/* ── Nav ── */}
      <nav style={S.nav}>
        <Link to="/" style={S.navLeft}>
          <span style={S.navSam}>SAM</span><span style={{ ...S.navSports, color: accentColor }}>SPORTS</span>
        </Link>
        <div style={S.navRight}>
          <button style={S.navLink} onClick={() => navigate('/about')}>About</button>
          <button style={S.navLink} onClick={() => navigate('/faq')}>FAQ</button>
          <button style={{ ...S.navCta, background: accentColor }} onClick={() => navigate('/select-game')}>
            Sign Up Free
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={S.hero}>
        <div style={{ ...S.heroBadge, color: accentColor, background: accentBg, borderColor: accentBorder }}>
          {eyebrow}
        </div>
        <h1 style={S.h1}>{headline}</h1>
        <p style={S.heroP}>{subheadline}</p>
        <div style={S.heroBtns}>
          <button style={{ ...S.btnPrimary, background: accentColor }} onClick={() => navigate('/select-game')}>
            Get Started Free
          </button>
          <button style={S.btnSecondary} onClick={() => navigate('/about')}>
            Learn More
          </button>
        </div>
      </section>

      {/* ── Highlights Bar ── */}
      {highlights.length > 0 && (
        <div style={S.highlightsBar}>
          <div style={S.highlightsInner}>
            {highlights.map((h, i) => (
              <div key={i} style={S.highlightItem}>
                <div style={{ ...S.highlightStat, color: accentColor }}>{h.stat}</div>
                <div style={S.highlightLabel}>{h.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Features Grid ── */}
      {features.length > 0 && (
        <section style={S.section}>
          <div style={{ ...S.sectionEye, color: accentColor }}>Features</div>
          <h2 style={S.h2}>What makes it different</h2>
          <div style={S.featuresGrid}>
            {features.map((f, i) => (
              <div key={i} style={S.featureCard}>
                <div style={{ ...S.featureIcon, background: accentBg, borderColor: accentBorder, color: accentColor }}>
                  {f.icon}
                </div>
                <h3 style={S.featureH3}>{f.title}</h3>
                <p style={S.featureP}>{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── How It Works ── */}
      {howItWorks.length > 0 && (
        <section style={{ ...S.section, borderTop: '1px solid rgba(255,255,255,.04)' }}>
          <div style={{ ...S.sectionEye, color: accentColor }}>How It Works</div>
          <h2 style={S.h2}>Get started in minutes</h2>
          <div style={S.stepsGrid}>
            {howItWorks.map((s, i) => (
              <div key={i} style={S.stepCard}>
                <div style={{ ...S.stepNum, background: accentColor }}>{s.step || i + 1}</div>
                <h3 style={S.stepH3}>{s.title}</h3>
                <p style={S.stepP}>{s.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section style={S.cta}>
        <div style={S.ctaGlow(accentColor)} />
        <h2 style={S.ctaH2}>{ctaText}</h2>
        <p style={S.ctaP}>Create your free account and start competing today.</p>
        <button style={{ ...S.btnPrimary, background: accentColor, padding: '14px 40px', fontSize: 15 }} onClick={() => navigate('/select-game')}>
          Sign Up Free
        </button>
      </section>

      {/* ── Footer ── */}
      <footer style={S.footer}>
        <div style={S.footerInner}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>SAM</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: accentColor }}>SPORTS</span>
          </Link>
          <div style={S.footerLinks}>
            <Link to="/terms" style={S.footerLink}>Terms</Link>
            <Link to="/privacy" style={S.footerLink}>Privacy</Link>
            <Link to="/eu-privacy" style={S.footerLink}>EU Privacy</Link>
            <Link to="/cookies" style={S.footerLink}>Cookies</Link>
            <Link to="/gdpr" style={S.footerLink}>GDPR</Link>
            <Link to="/contact" style={S.footerLink}>Contact</Link>
          </div>
          <span style={S.footerCopy}>&copy; {new Date().getFullYear()} SamSports.io</span>
        </div>
      </footer>
    </div>
  )
}

/* ═══ Styles ═══ */
const S = {
  page: { fontFamily: "'Inter',system-ui,-apple-system,sans-serif", background: '#090c10', color: '#d1d5db', minHeight: '100vh', overflowX: 'hidden', WebkitFontSmoothing: 'antialiased' },

  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 60, padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(9,12,16,.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.04)' },
  navLeft: { display: 'flex', alignItems: 'baseline', gap: 2, textDecoration: 'none' },
  navSam: { fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '.5px' },
  navSports: { fontSize: 17, fontWeight: 800, letterSpacing: '.5px' },
  navRight: { display: 'flex', alignItems: 'center', gap: 24 },
  navLink: { background: 'none', border: 'none', color: '#6b7280', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  navCta: { padding: '8px 20px', color: '#09110a', fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' },

  hero: { paddingTop: 160, paddingBottom: 80, textAlign: 'center', maxWidth: 720, margin: '0 auto', padding: '160px 24px 80px' },
  heroBadge: { display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', padding: '6px 16px', borderRadius: 20, border: '1px solid', marginBottom: 24 },
  h1: { fontSize: 52, fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2px', color: '#f9fafb', marginBottom: 20 },
  heroP: { fontSize: 17, lineHeight: 1.75, color: '#6b7280', maxWidth: 560, margin: '0 auto 36px' },
  heroBtns: { display: 'flex', justifyContent: 'center', gap: 12 },
  btnPrimary: { padding: '12px 28px', color: '#09110a', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' },
  btnSecondary: { padding: '12px 28px', background: 'rgba(255,255,255,.04)', color: '#d1d5db', fontWeight: 500, fontSize: 14, border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' },

  highlightsBar: { borderTop: '1px solid rgba(255,255,255,.04)', borderBottom: '1px solid rgba(255,255,255,.04)', padding: '40px 24px' },
  highlightsInner: { maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', textAlign: 'center', gap: 24 },
  highlightItem: {},
  highlightStat: { fontSize: 38, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1 },
  highlightLabel: { fontSize: 12, fontWeight: 500, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },

  section: { padding: '100px 24px', maxWidth: 1100, margin: '0 auto' },
  sectionEye: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 },
  h2: { fontSize: 36, fontWeight: 800, color: '#f9fafb', letterSpacing: '-1px', marginBottom: 40 },

  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 },
  featureCard: { padding: '32px 28px', background: '#111318', border: '1px solid rgba(255,255,255,.04)', borderRadius: 16 },
  featureIcon: { width: 40, height: 40, borderRadius: 10, border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, marginBottom: 16 },
  featureH3: { fontSize: 16, fontWeight: 700, color: '#f9fafb', marginBottom: 8 },
  featureP: { fontSize: 13, lineHeight: 1.65, color: '#6b7280' },

  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 },
  stepCard: { padding: '28px 24px', background: '#111318', border: '1px solid rgba(255,255,255,.04)', borderRadius: 16, textAlign: 'center' },
  stepNum: { width: 36, height: 36, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#09110a', marginBottom: 16 },
  stepH3: { fontSize: 15, fontWeight: 700, color: '#f9fafb', marginBottom: 6 },
  stepP: { fontSize: 13, lineHeight: 1.65, color: '#6b7280' },

  cta: { padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' },
  ctaGlow: (c) => ({ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, background: `radial-gradient(circle, ${c}15 0%, transparent 70%)`, pointerEvents: 'none' }),
  ctaH2: { fontSize: 40, fontWeight: 800, color: '#f9fafb', letterSpacing: '-1.5px', marginBottom: 12, position: 'relative' },
  ctaP: { fontSize: 16, color: '#4b5563', marginBottom: 32, position: 'relative' },

  footer: { borderTop: '1px solid rgba(255,255,255,.04)', padding: '28px 24px' },
  footerInner: { maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 },
  footerLinks: { display: 'flex', gap: 20, flexWrap: 'wrap' },
  footerLink: { color: '#4b5563', fontSize: 12, textDecoration: 'none' },
  footerCopy: { fontSize: 11, color: '#374151' },
}

export default ProductPage
