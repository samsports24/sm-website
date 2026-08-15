import React from 'react'
import { useNavigate } from 'react-router-dom'
import SiteHeader from '../../components/SiteHeader'
import { Shield, FormatDiagram, HeroBoard, LaptopMock } from './graphics'

// ═══════════════════════════════════════════════════════════════════════════
//  FANTASY — every game we actually run, and the door into the mock draft.
// ═══════════════════════════════════════════════════════════════════════════

const SOCCER = 'https://football.samsports.io'

const C = {
  bg: '#0B0E14',
  card: '#121722',
  line: 'rgba(255,255,255,0.08)',
  text: '#E8EBF0',
  dim: 'rgba(255,255,255,0.5)',
  faint: 'rgba(255,255,255,0.32)',
  green: '#22C55E',
  gold: '#D4A843',
  blue: '#3B82F6',
  purple: '#A855F7',
  red: '#EF4444',
}

// ── Headline games ─────────────────────────────────────────────────────────
const GAMES = [
  {
    key: 'afootball',
    glyph: 'football', from: '#22C55E', to: '#0E8F45', tint: C.green,
    name: 'A.Football Fantasy',
    tag: 'Season long',
    blurb: 'Draft a roster, set a lineup every week, trade and stream your way to a title. Snake, linear or auction.',
    to: '/select-game',
  },
  {
    key: 'soccer',
    glyph: 'soccer', from: '#D4A843', to: '#A97C1B', tint: C.gold,
    name: 'Soccer Fantasy',
    tag: '8 competitions',
    blurb: 'Run a club across the Premier League, LaLiga, Serie A and more. Contracts, salary cap, real transfers.',
    href: SOCCER,
  },
  {
    key: 'knockout',
    glyph: 'bracket', from: '#3B82F6', to: '#1D4FD8', tint: C.blue,
    name: 'Knockout Draft',
    tag: 'Bracket',
    blurb: 'Head-to-head elimination. Re-draft between rounds as nations go out, and survive to the final.',
    href: `${SOCCER}/fixtures`,
  },
  {
    key: 'gm',
    glyph: 'chart', from: '#A855F7', to: '#7127C0', tint: C.purple,
    name: 'GM Challenge',
    tag: 'Skill rating',
    blurb: 'Run a franchise under the SP salary cap. Every signing, trade and buyout is scored, and your GM rank follows you.',
    to: '/gm-challenge',
  },
]

// ── Soccer competitions ────────────────────────────────────────────────────
const COMPS = [
  // World Cup 2026 retired
  // { code: 'WC', name: 'World Cup 2026', color: '#D4A843', live: true },
  { code: 'EPL', name: 'Premier League', color: '#38003C' },
  { code: 'LAL', name: 'LaLiga', color: '#EE8707' },
  { code: 'SEA', name: 'Serie A', color: '#0068A8' },
  { code: 'BUN', name: 'Bundesliga', color: '#D20515' },
  { code: 'L1', name: 'Ligue 1', color: '#091C3E' },
  { code: 'UCL', name: 'Champions League', color: '#0E1E5B' },
  { code: 'EKS', name: 'Ekstraklasa', color: '#C8102E' },
]

// ── Rivals ─────────────────────────────────────────────────────────────────
const RIVALS = [
  {
    name: 'Rivals · A.Football',
    blurb: 'Build a squad, join a pod, and go head-to-head every matchday. Quick to learn, fast to play.',
    tint: C.green,
    to: '/nfl-rivals',
  },
  {
    name: 'Rivals · Soccer',
    blurb: 'The same pod format on the pitch. Pick your XI, climb the pod, take the trophies.',
    tint: C.gold,
    href: `${SOCCER}/rivals`,
  },
]

const FORMATS = [
  { name: 'Snake', kind: 'snake', blurb: 'Order reverses each round. First in round one, last in round two.' },
  { name: 'Linear', kind: 'linear', blurb: 'Same order every round. Simple, and brutal if you pick late.' },
  { name: 'Auction', kind: 'auction', blurb: 'Every team gets the same SP cap. Any player can be yours if you bid enough.' },
]

export default function Fantasy() {
  const navigate = useNavigate()
  const go = (item) => {
    if (item.href) window.location.href = item.href
    else navigate(item.to)
  }

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh' }}>
      <SiteHeader activeSport="fantasy" />

      {/* ── Hero ── */}
      <div style={S.hero}>
        <div style={S.heroInner}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={S.kicker}>FANTASY ON SAMSPORTS</div>
            <h1 style={S.h1}>Draft. Trade. Compete.</h1>
            <p style={S.sub}>
              Real drafts, real contracts, real consequences. Pick a game below, or try a mock
              draft first, no account needed.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
              <button onClick={() => navigate('/mock-draft')} style={S.primary}>Try a mock draft</button>
              <button onClick={() => navigate('/select-game')} style={S.secondary}>Create a league</button>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 320, display: 'flex', justifyContent: 'center' }}>
            <HeroBoard />
          </div>
        </div>
      </div>

      {/* ── Games ── */}
      <Section title="Available on SamSports" sub="Everything here is live today.">
        <div style={S.gameGrid}>
          {GAMES.map((g) => (
            <div key={g.key} onClick={() => go(g)} style={S.gameCard}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${g.tint}55`; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.transform = 'none' }}
            >
              <Shield glyph={g.glyph} from={g.from} to={g.to} size={72} />
              <div style={{ ...S.tag, color: g.tint, borderColor: `${g.tint}44` }}>{g.tag}</div>
              <div style={S.gameName}>{g.name}</div>
              <div style={S.blurb}>{g.blurb}</div>
              <div style={{ color: g.tint, fontWeight: 800, fontSize: 13, marginTop: 14 }}>Play now →</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── NFL tools — the free resources, findable from the hub instead of
             buried in the in-app sidebar. All public, no account. ── */}
      <Section title="NFL fantasy tools" sub="Free, no account needed.">
        <div style={S.toolGrid}>
          {[
            { label: 'Keep / Trade / Cut', desc: 'Crowdsourced player values — every position, even the trenches.', to: '/values', tint: C.gold },
            { label: 'Injury Report', desc: 'Every notable injury across the league, official designations.', to: '/injury-report', tint: C.red },
            { label: 'NFL Predictor', desc: "Pick every game. Earn SamPoints when you're right.", to: '/nfl-predictor', tint: C.green },
            { label: 'Mock Draft', desc: 'Run a full draft against the clock. No sign-up.', to: '/mock-draft', tint: C.blue },
            { label: 'Rivals', desc: 'Head-to-head pods. Short-format, no season-long commitment.', to: '/nfl-rivals', tint: C.purple },
          ].map((tl) => (
            <div
              key={tl.to}
              onClick={() => navigate(tl.to)}
              style={S.toolCard}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${tl.tint}66`; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.transform = 'none' }}
            >
              <div style={{ width: 34, height: 4, borderRadius: 4, background: tl.tint, marginBottom: 12 }} />
              <div style={{ fontSize: 17, fontWeight: 900, fontFamily: "'Rajdhani', sans-serif" }}>{tl.label}</div>
              <div style={{ ...S.blurb, marginTop: 6 }}>{tl.desc}</div>
              <div style={{ color: tl.tint, fontWeight: 800, fontSize: 13, marginTop: 14 }}>Open →</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Competitions ── */}
      <Section title="Soccer competitions" sub="Run a club in any of these. Same squad, same cap, different league.">
        <div style={S.compGrid}>
          {COMPS.map((c) => (
            <a key={c.code} href={SOCCER} style={S.compCard}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${c.color}99` }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line }}
            >
              <div style={{ ...S.compBadge, background: c.color }}>{c.code}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                {c.live && <div style={{ color: C.green, fontSize: 11, fontWeight: 700 }}>● Live now</div>}
              </div>
            </a>
          ))}
        </div>
      </Section>

      {/* ── Rivals ── */}
      <Section title="Rivals" sub="Head-to-head pods. No season-long commitment.">
        <div style={S.rivalGrid}>
          {RIVALS.map((r) => (
            <div key={r.name} onClick={() => go(r)} style={{ ...S.rivalCard, borderColor: `${r.tint}33` }}>
              <div style={{ ...S.rivalGlow, background: `radial-gradient(300px 120px at 0% 0%, ${r.tint}22, transparent)` }} />
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Rajdhani', sans-serif", marginBottom: 8 }}>
                  {r.name}
                </div>
                <div style={{ ...S.blurb, maxWidth: 420 }}>{r.blurb}</div>
                <div style={{ color: r.tint, fontWeight: 800, fontSize: 13, marginTop: 16 }}>Enter Rivals →</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── SAM Value ── */}
      {/* Two boards, one idea. The NFL one lives on this site; the soccer one is
          on football.samsports.io, so it's an <a href>, not a navigate(). Both are
          open to logged-out visitors on purpose — anonymous votes are what get a
          value board to a useful sample size, and this page is where people who
          don't have a league yet actually land. */}
      <Section
        title="SAM Value"
        sub="What a player is actually worth — voted on by managers, not calculated by us."
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <div onClick={() => navigate('/values')} style={S.valueCard}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.gold, letterSpacing: 1, marginBottom: 6 }}>
                NFL
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Rajdhani', sans-serif", marginBottom: 8 }}>
                Keep. Trade. Cut.
              </div>
              <div style={{ ...S.blurb, maxWidth: 520 }}>
                Three players, one decision: keep the best, trade the middle, cut the worst. Every
                vote moves the board. And unlike everywhere else, we value the whole roster —
                linemen, edge rushers, punters. You draft 53 men under a cap, so you need to know
                what a left tackle is worth.
              </div>
              <div style={{ color: C.gold, fontWeight: 800, fontSize: 13, marginTop: 16 }}>
                Rank players →
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {['KEEP', 'TRADE', 'CUT'].map((l, i) => (
                <div key={l} style={{
                  ...S.ktcChip,
                  borderColor: [C.green, C.gold, '#EF4444'][i],
                  color: [C.green, C.gold, '#EF4444'][i],
                }}>
                  {l}
                </div>
              ))}
            </div>
          </div>

          <a
            href={`${SOCCER}/transfer-keep-loan`}
            style={{ ...S.valueCard, textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.gold, letterSpacing: 1, marginBottom: 6 }}>
                SOCCER
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Rajdhani', sans-serif", marginBottom: 8 }}>
                Transfer. Keep. Loan.
              </div>
              <div style={{ ...S.blurb, maxWidth: 520 }}>
                The same idea, in football&apos;s own words. Keep the one you&apos;re building
                around, cash in the one you&apos;re not, loan out the one you don&apos;t rate.
                Every vote moves his value. Premier League, La Liga, Serie A, Bundesliga,
                Ligue 1 and Ekstraklasa — 4,400 players, priced by the people who watch them.
              </div>
              <div style={{ color: C.gold, fontWeight: 800, fontSize: 13, marginTop: 16 }}>
                Rank players →
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {['KEEP', 'TRANSFER', 'LOAN'].map((l, i) => (
                <div key={l} style={{
                  ...S.ktcChip,
                  borderColor: [C.green, C.gold, '#EF4444'][i],
                  color: [C.green, C.gold, '#EF4444'][i],
                }}>
                  {l}
                </div>
              ))}
            </div>
          </a>
        </div>
      </Section>

      {/* ── Mock draft ── */}
      <div style={S.mockBand}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          {/* copy + the product itself, on a laptop */}
          <div style={S.mockInner}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <h2 style={{ ...S.h2, color: '#0B0E14', fontSize: 38 }}>Try out a mock draft</h2>
              <p style={{ color: 'rgba(11,14,20,0.8)', maxWidth: 470, lineHeight: 1.6, fontSize: 16, fontWeight: 600 }}>
                A full 53-man draft against bots on a live clock, under the 320M SP cap. Learn the
                room, test a board, see where your strategy falls apart. Nothing to sign up for.
              </p>
              <button onClick={() => navigate('/mock-draft')} style={S.mockCta}>Try now</button>
              <div style={{ marginTop: 14, fontSize: 12, color: 'rgba(11,14,20,0.6)', fontWeight: 700 }}>
                Learn the different types of draft below.
              </div>
            </div>
            <div style={{ flex: 1.15, minWidth: 320, display: 'flex', justifyContent: 'center' }}>
              <LaptopMock />
            </div>
          </div>

          {/* the three draft modes */}
          <div style={S.formatGrid}>
            {FORMATS.map((f) => (
              <div key={f.name} onClick={() => navigate(`/mock-draft?format=${f.kind}`)} style={S.formatCard}>
                <FormatDiagram kind={f.kind} />
                <div style={{ fontWeight: 800, margin: '10px 0 6px', fontSize: 16 }}>{f.name}</div>
                <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.5 }}>{f.blurb}</div>
                <div style={{ color: C.green, fontWeight: 800, fontSize: 12, marginTop: 10 }}>Mock this →</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <Section title="How a season runs" sub="Same shape whichever game you pick.">
        <div style={S.stepGrid}>
          {[
            { n: '01', t: 'Draft your squad', d: 'Snake, linear or auction. Queue your targets, or let autopick cover you if you step away.' },
            { n: '02', t: 'Set your lineup', d: 'Lock starters before kickoff. Captains score 1.5×, the bench scores half.' },
            { n: '03', t: 'Score on real games', d: 'SAM scoring rates every touch, not just the box score. Points move live as matches play.' },
            { n: '04', t: 'Work the market', d: 'Trade, bid at auction, sign free agents, buy players out. The cap makes every move cost you.' },
          ].map((s) => (
            <div key={s.n} style={S.step}>
              <div style={{ color: C.green, fontWeight: 900, fontSize: 13, marginBottom: 8 }}>{s.n}</div>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{s.t}</div>
              <div style={{ color: C.dim, fontSize: 13, lineHeight: 1.6 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA ── */}
      <div style={{ textAlign: 'center', padding: '72px 20px 96px', marginTop: 64, borderTop: `1px solid ${C.line}` }}>
        <h2 style={S.h2}>Ready for a real league?</h2>
        <p style={{ color: C.dim, marginBottom: 26 }}>Create one, or join with an invite code.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/select-game')} style={S.primary}>Create a league</button>
          <button onClick={() => navigate('/mock-draft')} style={S.secondary}>Mock draft first</button>
        </div>
      </div>
    </div>
  )
}

const Section = ({ title, sub, children }) => (
  <div style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 20px 0' }}>
    <h2 style={S.h2}>{title}</h2>
    {sub && <p style={{ color: C.dim, marginBottom: 30 }}>{sub}</p>}
    {children}
  </div>
)

const S = {
  hero: {
    padding: '72px 0 64px',
    background: 'radial-gradient(1100px 420px at 20% -10%, rgba(34,197,94,0.20), transparent 70%), #0B0E14',
    borderBottom: `1px solid ${C.line}`,
  },
  heroInner: { maxWidth: 1180, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 48, alignItems: 'center', flexWrap: 'wrap' },
  kicker: { color: C.green, fontWeight: 800, fontSize: 12, letterSpacing: 2, marginBottom: 14 },
  h1: { fontSize: 54, fontWeight: 900, margin: 0, lineHeight: 1.05, fontFamily: "'Rajdhani', sans-serif" },
  h2: { fontSize: 30, fontWeight: 900, margin: '0 0 8px', fontFamily: "'Rajdhani', sans-serif" },
  sub: { color: C.dim, fontSize: 17, maxWidth: 520, marginTop: 16, lineHeight: 1.6 },

  primary: { background: C.green, color: '#06210f', border: 'none', borderRadius: 10, padding: '14px 28px', fontWeight: 900, fontSize: 15, cursor: 'pointer' },
  secondary: { background: 'transparent', border: `1px solid ${C.line}`, color: C.text, borderRadius: 10, padding: '14px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer' },

  gameGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(248px, 1fr))', gap: 16 },
  gameCard: { background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 22, cursor: 'pointer', transition: 'transform .18s ease, border-color .18s ease' },
  tag: { display: 'inline-block', fontSize: 10, fontWeight: 800, letterSpacing: 1, border: '1px solid', borderRadius: 20, padding: '3px 10px', margin: '14px 0 10px' },
  gameName: { fontSize: 19, fontWeight: 800, marginBottom: 8, fontFamily: "'Rajdhani', sans-serif" },
  blurb: { color: C.dim, fontSize: 13, lineHeight: 1.6 },

  compGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 },
  toolGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 },
  toolCard: { background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20, cursor: 'pointer', transition: 'transform .18s ease, border-color .18s ease' },
  compCard: { display: 'flex', alignItems: 'center', gap: 12, background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, textDecoration: 'none', color: C.text, transition: 'border-color .18s ease' },
  compBadge: { width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#fff', flexShrink: 0, letterSpacing: 0.5 },

  rivalGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 },
  rivalCard: { position: 'relative', overflow: 'hidden', background: C.card, border: '1px solid', borderRadius: 18, padding: 24, cursor: 'pointer' },
  rivalGlow: { position: 'absolute', inset: 0 },

  mockBand: { background: 'linear-gradient(120deg, #22C55E, #0EA5E9)', marginTop: 76, padding: '56px 20px' },
  mockInner: { display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap', marginBottom: 34 },
  mockCta: { marginTop: 22, background: '#0B0E14', color: '#fff', border: 'none', borderRadius: 999, padding: '14px 36px', fontWeight: 900, fontSize: 15, cursor: 'pointer' },
  formatGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 },
  formatCard: { background: '#0B0E14', border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, color: C.text, cursor: 'pointer' },

  valueCard: { display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 24, cursor: 'pointer' },
  ktcChip: { border: '1.5px solid', borderRadius: 10, padding: '14px 18px', fontWeight: 900, fontSize: 12, letterSpacing: 1 },
  stepGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(232px, 1fr))', gap: 16 },
  step: { background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 20 },
}
