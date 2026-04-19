import React from 'react';
import { useNavigate } from 'react-router-dom';

/* ── tiny shield logo (shared in nav + footer) ── */
const ShieldLogo = ({ size = 32, gradientId = 'gGrad' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <defs>
      <linearGradient id={gradientId} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#22C55E" />
        <stop offset="100%" stopColor="#16A34A" />
      </linearGradient>
    </defs>
    <path d="M18 2L4 8v10c0 8.5 5.8 16.4 14 18.5 8.2-2.1 14-10 14-18.5V8L18 2z" fill="#111827" stroke={`url(#${gradientId})`} strokeWidth="1.5" />
    <path d="M22.5 13.5c0-2.2-1.8-3.5-4.5-3.5s-4.5 1.3-4.5 3.5c0 2 1.5 3 4.5 3.8 3 .8 4.5 1.8 4.5 3.7 0 2.2-1.8 3.5-4.5 3.5s-4.5-1.3-4.5-3.5" stroke={`url(#${gradientId})`} strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </svg>
);

/* ═══════════════════════════════════════════════════════
   CSS-in-JS styles  (mirrors SamSports_Marketing_Page.html)
   ═══════════════════════════════════════════════════════ */
const S = {
  /* ── page ── */
  page: { fontFamily: "'Inter',system-ui,-apple-system,sans-serif", background: '#090c10', color: '#d1d5db', overflowX: 'hidden', WebkitFontSmoothing: 'antialiased', minHeight: '100vh' },

  /* ── nav ── */
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(24px)', background: 'rgba(9,12,16,.85)', borderBottom: '1px solid rgba(255,255,255,.04)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  navLogoText: { fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '-.3px' },
  navLinks: { display: 'flex', gap: 36, alignItems: 'center' },
  navLink: { color: '#6b7280', fontSize: 13, fontWeight: 500, textDecoration: 'none', letterSpacing: '.1px', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', transition: 'color .2s' },
  navCta: { padding: '8px 20px', background: '#22C55E', color: '#09110a', fontWeight: 600, fontSize: 13, border: 'none', borderRadius: 6, cursor: 'pointer', letterSpacing: '.2px', fontFamily: 'inherit' },

  /* ── hero ── */
  hero: { padding: '160px 48px 100px', maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 80 },
  heroText: { flex: 1, maxWidth: 540 },
  eyebrow: { fontSize: 12, fontWeight: 600, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 20 },
  h1: { fontSize: 52, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', color: '#f9fafb', marginBottom: 20 },
  heroP: { fontSize: 17, lineHeight: 1.75, color: '#6b7280', marginBottom: 36 },
  heroBtns: { display: 'flex', gap: 12 },
  btnPrimary: { padding: '12px 28px', background: '#22C55E', color: '#09110a', fontWeight: 600, fontSize: 14, border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' },
  btnSecondary: { padding: '12px 28px', background: 'rgba(255,255,255,.04)', color: '#d1d5db', fontWeight: 500, fontSize: 14, border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' },

  /* ── hero visual ── */
  heroVisual: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', position: 'relative' },
  iphone: { width: 200, background: '#1a1a1a', borderRadius: 32, border: '3px solid #2a2a2a', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.05)', position: 'relative', padding: 8, zIndex: 2, flexShrink: 0, marginBottom: 36 },
  iphoneInner: { background: '#000', borderRadius: 26, overflow: 'hidden', position: 'relative', height: 400 },
  iphoneDynIsland: { position: 'absolute', top: 7, left: '50%', transform: 'translateX(-50%)', width: 72, height: 20, background: '#000', borderRadius: 14, zIndex: 10 },
  iphoneHome: { position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 72, height: 3, background: 'rgba(255,255,255,.2)', borderRadius: 3, zIndex: 10 },
  iphoneLabel: { position: 'absolute', bottom: -24, left: 0, right: 0, textAlign: 'center', fontSize: 9, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#22C55E' },
  laptop: { width: 420, marginLeft: -30, flexShrink: 0, position: 'relative', zIndex: 1 },
  laptopLid: { background: '#1a1a1a', borderRadius: '10px 10px 0 0', border: '3px solid #2a2a2a', borderBottom: 'none', padding: '6px 6px 0', boxShadow: '0 -16px 60px rgba(0,0,0,.35),inset 0 0 0 1px rgba(255,255,255,.02)' },
  laptopScreen: { background: '#000', borderRadius: '4px 4px 0 0', overflow: 'hidden', height: 240, position: 'relative' },
  laptopCamera: { width: 4, height: 4, background: '#222', borderRadius: '50%', margin: '0 auto 3px', border: '1px solid #333' },
  laptopBase: { height: 12, background: 'linear-gradient(180deg,#333,#1a1a1a)', borderRadius: '0 0 5px 5px', position: 'relative' },
  laptopLabel: { textAlign: 'center', marginTop: 10, fontSize: 9, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#3b82f6' },

  /* ── metrics bar ── */
  metricsBar: { borderTop: '1px solid rgba(255,255,255,.04)', borderBottom: '1px solid rgba(255,255,255,.04)', padding: '40px 0' },
  metricsInner: { maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', textAlign: 'center' },
  metricH3: { fontSize: 40, fontWeight: 800, color: '#f9fafb', letterSpacing: '-1.5px', marginBottom: 4 },
  metricP: { fontSize: 12, fontWeight: 500, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 1 },

  /* ── sections ── */
  section: { padding: '120px 48px', maxWidth: 1200, margin: '0 auto' },
  sectionEyebrow: { fontSize: 11, fontWeight: 600, color: '#22C55E', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 },
  sectionH2: { fontSize: 40, fontWeight: 800, color: '#f9fafb', letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 16 },
  lead: { fontSize: 16, lineHeight: 1.75, color: '#6b7280', maxWidth: 520, marginBottom: 48 },

  /* ── sports grid ── */
  sportsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 40 },
  sportCard: { padding: '40px 32px', background: '#111318', border: '1px solid rgba(255,255,255,.04)', borderRadius: 16, transition: 'all .25s' },
  sportCardH3: { fontSize: 24, fontWeight: 700, color: '#f9fafb', marginBottom: 4 },
  sportCardSub: { fontSize: 13, fontWeight: 600, color: '#22C55E', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  liveBadge: { fontSize: 10, padding: '2px 8px', background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.25)', borderRadius: 4, color: '#22C55E', fontWeight: 700, letterSpacing: '.5px' },
  soonBadge: { fontSize: 10, padding: '2px 8px', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 4, color: '#6b7280', fontWeight: 700, letterSpacing: '.5px' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  tag: { padding: '5px 10px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 5, fontSize: 11, fontWeight: 500, color: '#6b7280' },

  /* ── SAM Metric section ── */
  scoreCardsRow: { display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' },
  scoreCard: { width: 280, background: '#111318', border: '1px solid rgba(255,255,255,.04)', borderRadius: 20, padding: 32, textAlign: 'center' },
  scoreBig: { fontSize: 80, fontWeight: 900, color: '#22C55E', lineHeight: 1, letterSpacing: '-3px' },
  scoreLabel: { fontSize: 13, fontWeight: 500, color: '#6b7280', margin: '6px 0 20px' },
  scoreRow: { display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.03)', fontSize: 12 },
  scoreRowLabel: { color: '#4b5563' },
  scoreRowVal: { color: '#d1d5db', fontWeight: 600 },
  scoreScale: { display: 'flex', gap: 3, marginTop: 20 },
  scoreDot: (color, active) => ({ flex: 1, height: 5, borderRadius: 3, background: color, ...(active ? { outline: '2px solid ' + color, outlineOffset: 2 } : {}) }),

  /* ── info items ── */
  infoItem: { display: 'flex', gap: 14, alignItems: 'flex-start' },
  infoIcon: { width: 36, height: 36, background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, color: '#22C55E', fontWeight: 700 },
  infoH4: { fontSize: 14, fontWeight: 600, color: '#e5e7eb', marginBottom: 2 },
  infoP: { fontSize: 12, color: '#4b5563', lineHeight: 1.5 },

  /* ── rivals matchup ── */
  matchup: { width: 340, background: '#111318', border: '1px solid rgba(255,255,255,.04)', borderRadius: 20, padding: 28, overflow: 'hidden' },
  matchupLabel: { fontSize: 10, fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 16, textAlign: 'center' },
  matchupVs: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 20 },
  matchupTeam: { textAlign: 'center' },
  badgeA: { width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 auto 6px', background: 'linear-gradient(135deg,#22C55E,#16A34A)' },
  badgeB: { width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 auto 6px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)' },
  matchupName: { fontSize: 11, fontWeight: 600, color: '#9ca3af' },
  matchupScore: { fontSize: 24, fontWeight: 800, color: '#f9fafb', letterSpacing: '-.5px' },
  matchupDiv: { fontSize: 12, fontWeight: 700, color: '#374151' },
  matchupRow: { display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,.02)' },

  /* ── tier list ── */
  tierActive: { display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.1)' },
  tier: { display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: '1px solid transparent' },
  tierNumActive: { width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff', background: '#22C55E' },
  tierNum: { width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff', background: '#1f2937' },

  /* ── tools grid ── */
  toolsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 40 },
  tool: { padding: '28px 24px', background: '#111318', border: '1px solid rgba(255,255,255,.04)', borderRadius: 12, transition: 'all .25s' },
  toolDot: { width: 8, height: 8, background: '#22C55E', borderRadius: '50%', marginBottom: 16 },
  toolH4: { fontSize: 14, fontWeight: 600, color: '#e5e7eb', marginBottom: 6 },
  toolP: { fontSize: 12, lineHeight: 1.6, color: '#4b5563' },

  /* ── cta ── */
  cta: { padding: '120px 48px', textAlign: 'center', position: 'relative' },
  ctaH2: { fontSize: 44, fontWeight: 800, color: '#f9fafb', letterSpacing: '-1.5px', marginBottom: 12, position: 'relative' },
  ctaP: { fontSize: 16, color: '#4b5563', marginBottom: 32, position: 'relative' },
  ctaBtn: { padding: '14px 36px', background: '#22C55E', color: '#09110a', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', position: 'relative' },

  /* ── footer ── */
  footer: { padding: '40px 48px', borderTop: '1px solid rgba(255,255,255,.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' },
  footerCopy: { fontSize: 12, color: '#374151', marginLeft: 8 },
  footerRight: { display: 'flex', gap: 24 },
  footerLink: { color: '#4b5563', fontSize: 12, textDecoration: 'none', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' },
};

/* ── score-scale helper ── */
const ScaleBar = ({ colors }) => (
  <div style={S.scoreScale}>
    {colors.map((c, i) => <div key={i} style={S.scoreDot(c.color, c.active)} />)}
  </div>
);

const soccerScale = [
  { color: '#ef4444' }, { color: '#ef4444' }, { color: '#eab308' }, { color: '#eab308' },
  { color: '#3b82f6' }, { color: '#3b82f6' }, { color: '#22c55e' }, { color: '#22c55e' },
  { color: '#22c55e', active: true }, { color: '#22c55e' },
];
const footballScale = [
  { color: '#ef4444' }, { color: '#ef4444' }, { color: '#ef4444' }, { color: '#eab308' },
  { color: '#eab308' }, { color: '#3b82f6' }, { color: '#3b82f6' }, { color: '#22c55e' },
  { color: '#22c55e', active: true }, { color: '#22c55e' },
];

/* ═══════════════════════════════════════════
   PHONE MOCKUP — Transfer Market (matches screenshot)
   ═══════════════════════════════════════════ */
const mPlayers = [
  { first: "A'Shawn", last: 'Robinson', age: 30, team: 'CAR', cap: '$10.0M', sp: '10,000,000 SP', con: '$10.0M', yr: '1yr left', clr: '#6b7280', hasImg: true },
  { first: 'A.J.', last: 'Brown', age: 28, team: 'PHI', cap: '$23.4M', sp: '23,393,496 SP', con: '$96.0M', yr: '9yr left', clr: '#3b82f6', hasImg: true },
  { first: 'A.J.', last: 'Green', age: 27, team: 'LAR', cap: '$1.1M', sp: '1,075,000 SP', con: '$1.2M', yr: '1yr left', clr: '#6b7280', hasImg: true },
  { first: 'A.J.', last: 'Henning', age: 24, team: 'MIA', cap: '$0.9M', sp: '885,000 SP', con: '$0.9M', yr: '2yr left', clr: '#3b82f6', hasImg: false },
  { first: 'A.J.', last: 'Terrell', age: 27, team: 'ATL', cap: '$13.5M', sp: '13,500,000 SP', con: '$15.0M', yr: '4yr left', clr: '#6b7280', hasImg: true },
  { first: 'A.J.', last: 'Woods', age: 24, team: 'PHI', cap: '$0.9M', sp: '885,000 SP', con: '$0.9M', yr: '1yr left', clr: '#6b7280', hasImg: false },
  { first: 'A.T.', last: 'Perry', age: 26, team: 'DEN', cap: '$1.1M', sp: '1,075,000 SP', con: '$1.1M', yr: '1yr left', clr: '#3b82f6', hasImg: false },
  { first: 'AJ', last: 'Arcuri', age: 28, team: 'LA Rams', cap: '- SP', sp: '', con: '-', yr: '', clr: '#6b7280', hasImg: true },
  { first: 'AJ', last: 'Barner', age: 23, team: 'SEA', cap: '$1.3M', sp: '1,263,777 SP', con: '$1.1M', yr: '2yr left', clr: '#6b7280', hasImg: true },
];

const PhoneMockup = () => {
  const f = { fontSize: 5, fontWeight: 600, color: '#4b5563', letterSpacing: '.3px', textTransform: 'uppercase' };
  const filterBtn = (top, bot, color) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 5px', borderRadius: 3, border: `1px solid ${color}33`, background: `${color}0d` }}>
      <span style={{ ...f, color: `${color}bb`, fontSize: 4 }}>{top}</span>
      <span style={{ fontSize: 6, fontWeight: 700, color: `${color}dd` }}>{bot}</span>
    </div>
  );

  return (
    <div style={{ background: '#080d17', width: '100%', height: '100%', overflow: 'hidden', padding: '26px 4px 4px', fontFamily: "'Barlow',sans-serif" }}>
      {/* Filter row */}
      <div style={{ display: 'flex', gap: 3, padding: '2px 3px 4px', flexWrap: 'nowrap' }}>
        {filterBtn('DEF', 'LB', '#8b5cf6')}
        {filterBtn('DEF', 'CB', '#8b5cf6')}
        {filterBtn('DEF', 'S', '#8b5cf6')}
        {filterBtn('ST', 'K/P', '#eab308')}
        <div style={{ padding: '3px 6px', borderRadius: 8, fontSize: 5, fontWeight: 600, color: '#22C55E', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)' }}>Rookie</div>
      </div>
      {/* Table card */}
      <div style={{ margin: '2px 2px', background: '#0c1422', border: '1px solid rgba(255,255,255,.06)', borderRadius: 5, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2px 16px 1fr 14px 22px 30px 30px', gap: 2, padding: '4px 3px', fontSize: 4, fontWeight: 600, color: '#5a6577', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,.06)', alignItems: 'center' }}>
          <span /><span /><span>Player Name</span><span>Age</span><span>Pro Team</span><span>Cap Hit</span><span>Contract</span>
        </div>
        {/* Rows */}
        {mPlayers.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2px 16px 1fr 14px 22px 30px 30px', gap: 2, padding: '4px 3px', borderBottom: '1px solid rgba(255,255,255,.03)', alignItems: 'center' }}>
            <div style={{ width: 2, height: 16, borderRadius: 1, background: p.clr }} />
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: p.hasImg ? 'linear-gradient(135deg,#1a2538,#2a1f4a)' : '#1a2538', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 5, color: '#4b5563' }}>
              {p.hasImg ? '👤' : '📷'}
            </div>
            <div style={{ lineHeight: 1.1 }}>
              <span style={{ fontSize: 5.5, fontWeight: 700, color: '#f9fafb', display: 'block' }}>{p.first}</span>
              <span style={{ fontSize: 6, fontWeight: 700, color: '#f9fafb', display: 'block' }}>{p.last}</span>
            </div>
            <div style={{ fontSize: 6, color: '#9ca3af', textAlign: 'center', fontWeight: 500 }}>{p.age}</div>
            <div style={{ fontSize: 4.5, color: '#9ca3af', textAlign: 'center', fontWeight: 600 }}>{p.team}</div>
            <div style={{ lineHeight: 1.2 }}>
              <span style={{ fontSize: 5, fontWeight: 600, color: '#22C55E', display: 'block' }}>{p.cap}</span>
              {p.sp && <span style={{ fontSize: 3.5, color: '#4b5563', display: 'block' }}>{p.sp}</span>}
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <span style={{ fontSize: 5, fontWeight: 600, color: '#22C55E', display: 'block' }}>{p.con}</span>
              {p.yr && <span style={{ fontSize: 3.5, fontWeight: 600, color: '#D4A843', display: 'block' }}>{p.yr}</span>}
            </div>
          </div>
        ))}
      </div>
      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 2, padding: '4px 0' }}>
        {['<', '1', '2', '3', '4', '···', '319', '>'].map((p, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 3, border: p === '1' ? '1px solid rgba(59,130,246,.4)' : '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 5, fontWeight: 600, color: p === '1' ? '#60a5fa' : '#6b7280', ...(p === '···' ? { border: 'none', letterSpacing: 1 } : {}) }}>{p}</div>
        ))}
      </div>
      {/* Footer pill */}
      <div style={{ textAlign: 'center', paddingTop: 2 }}>
        <span style={{ fontSize: 4.5, color: '#4b5563', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '2px 10px' }}>samsports.io</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   DESKTOP MOCKUP — Rivals H2H + Roster view
   ═══════════════════════════════════════════ */
const DesktopMockup = () => {
  const sb = ['Dashboard', 'My Roster', 'Rivals', 'Live Scores', 'Market', 'Draft', 'Stadium', 'AI Coach'];
  const icons = ['📊', '👥', '⚔️', '📺', '💰', '🎯', '🏟️', '🤖'];

  const rosterL = [
    { pos: 'FW', c: '#22C55E', n: 'K. Mbappé', s: '8.7' },
    { pos: 'FW', c: '#22C55E', n: 'E. Haaland', s: '8.1' },
    { pos: 'MF', c: '#3b82f6', n: 'J. Bellingham', s: '8.3' },
    { pos: 'MF', c: '#3b82f6', n: 'K. De Bruyne', s: '7.9' },
    { pos: 'DF', c: '#eab308', n: 'V. van Dijk', s: '7.6' },
    { pos: 'DF', c: '#eab308', n: 'R. Dias', s: '7.2' },
    { pos: 'GK', c: '#ef4444', n: 'T. Courtois', s: '7.4' },
  ];
  const rosterR = [
    { pos: 'FW', c: '#22C55E', n: 'V. Osimhen', s: '8.0' },
    { pos: 'FW', c: '#22C55E', n: 'L. Martínez', s: '7.8' },
    { pos: 'MF', c: '#3b82f6', n: 'F. Valverde', s: '7.5' },
    { pos: 'MF', c: '#3b82f6', n: 'B. Silva', s: '7.6' },
    { pos: 'DF', c: '#eab308', n: 'W. Saliba', s: '7.3' },
    { pos: 'DF', c: '#eab308', n: 'J. Gvardiol', s: '7.0' },
    { pos: 'GK', c: '#ef4444', n: 'E. Martínez', s: '6.8' },
  ];

  const RosterCol = ({ players, align }) => (
    <div style={{ flex: 1 }}>
      {players.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2.5px 4px', borderBottom: '1px solid rgba(255,255,255,.03)', flexDirection: align === 'right' ? 'row-reverse' : 'row' }}>
          <div style={{ fontSize: 3, fontWeight: 700, color: '#fff', background: p.c, borderRadius: 2, padding: '1px 3px', minWidth: 12, textAlign: 'center' }}>{p.pos}</div>
          <div style={{ flex: 1, fontSize: 4, fontWeight: 500, color: '#d1d5db', textAlign: align === 'right' ? 'right' : 'left' }}>{p.n}</div>
          <div style={{ fontSize: 4.5, fontWeight: 700, color: '#22C55E' }}>{p.s}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ background: '#0a0f1a', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', fontFamily: "'Inter',sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 42, background: '#0d1117', borderRight: '1px solid rgba(255,255,255,.04)', flexShrink: 0, paddingTop: 4 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', paddingBottom: 4, borderBottom: '1px solid rgba(255,255,255,.04)', marginBottom: 2 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: '#111827', border: '1px solid rgba(34,197,94,.2)', margin: '0 auto 2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 5, fontWeight: 800, color: '#22C55E' }}>S</div>
          <div style={{ fontSize: 3, fontWeight: 700, color: '#f9fafb' }}>SAM<span style={{ color: '#22C55E' }}>Sports</span></div>
        </div>
        {sb.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '3px 4px', fontSize: 3.5, color: item === 'Rivals' ? '#22C55E' : '#4b5563', fontWeight: 500, ...(item === 'Rivals' ? { background: 'rgba(34,197,94,.06)', borderLeft: '2px solid #22C55E' } : {}) }}>
            <span style={{ fontSize: 4 }}>{icons[i]}</span><span>{item}</span>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', borderBottom: '1px solid rgba(255,255,255,.04)', flexShrink: 0 }}>
          <div style={{ fontSize: 6, fontWeight: 700, color: '#f9fafb' }}>⚔️ Rivals H2H</div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <div style={{ fontSize: 3, color: '#22C55E', fontWeight: 600, background: 'rgba(34,197,94,.08)', padding: '2px 6px', borderRadius: 3, border: '1px solid rgba(34,197,94,.15)' }}>⚡ LIVE · Matchday 12</div>
            <div style={{ fontSize: 3, color: '#6b7280' }}>World Masters · Div 1</div>
          </div>
        </div>

        {/* Matchup header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '8px 10px', background: 'linear-gradient(180deg, rgba(17,24,39,.8), transparent)' }}>
          {/* Team A */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#22C55E,#16A34A)', margin: '0 auto 3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff', boxShadow: '0 2px 12px rgba(34,197,94,.3)' }}>D</div>
            <div style={{ fontSize: 4.5, fontWeight: 700, color: '#f9fafb' }}>Dynasty FC</div>
            <div style={{ fontSize: 3, color: '#6b7280' }}>9-2-1 · Div 1</div>
          </div>
          {/* Score */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#22C55E', letterSpacing: '-1px' }}>1384</span>
              <span style={{ fontSize: 6, color: '#374151', fontWeight: 700 }}>vs</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#3b82f6', letterSpacing: '-1px' }}>1261</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 3, fontSize: 3, color: '#4b5563' }}>
              {[['Goals', '5', '3'], ['Assists', '7', '4'], ['Avg SAM', '8.4', '7.2']].map(([l, a, b]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ color: '#6b7280', marginBottom: 1 }}>{l}</div>
                  <div><span style={{ color: '#22C55E', fontWeight: 600 }}>{a}</span> — <span style={{ color: '#3b82f6', fontWeight: 600 }}>{b}</span></div>
                </div>
              ))}
            </div>
          </div>
          {/* Team B */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', margin: '0 auto 3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff', boxShadow: '0 2px 12px rgba(59,130,246,.3)' }}>I</div>
            <div style={{ fontSize: 4.5, fontWeight: 700, color: '#f9fafb' }}>Iron Eagles</div>
            <div style={{ fontSize: 3, color: '#6b7280' }}>7-3-2 · Div 1</div>
          </div>
        </div>

        {/* Rosters side by side */}
        <div style={{ flex: 1, display: 'flex', gap: 2, padding: '0 6px 4px', overflow: 'hidden' }}>
          {/* Left roster */}
          <div style={{ flex: 1, background: '#111827', border: '1px solid rgba(34,197,94,.08)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ padding: '3px 4px', borderBottom: '1px solid rgba(255,255,255,.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 3.5, fontWeight: 600, color: '#22C55E' }}>Dynasty FC</span>
              <span style={{ fontSize: 3, color: '#6b7280' }}>Avg 8.0</span>
            </div>
            <RosterCol players={rosterL} align="left" />
          </div>
          {/* Right roster */}
          <div style={{ flex: 1, background: '#111827', border: '1px solid rgba(59,130,246,.08)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ padding: '3px 4px', borderBottom: '1px solid rgba(255,255,255,.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 3, color: '#6b7280' }}>Avg 7.4</span>
              <span style={{ fontSize: 3.5, fontWeight: 600, color: '#3b82f6' }}>Iron Eagles</span>
            </div>
            <RosterCol players={rosterR} align="right" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═════════════════════════════
   MAIN COMPONENT
   ═════════════════════════════ */
const MarketingPage = () => {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={S.page}>
      {/* Inject keyframe animation for live pulse */}
      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,.6); }
          50% { opacity: .4; box-shadow: 0 0 6px 3px rgba(34,197,94,.3); }
        }
        .live-pulse-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #22C55E;
          animation: livePulse 1.2s ease-in-out infinite;
          display: inline-block; flex-shrink: 0;
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={S.nav}>
        <div style={S.navLeft}>
          <ShieldLogo size={32} />
          <div style={S.navLogoText}>SAM<span style={{ color: '#22C55E' }}>Sports</span></div>
        </div>
        <div style={S.navLinks}>
          <button style={S.navLink} onClick={() => scrollTo('platform')}>Platform</button>
          <button style={S.navLink} onClick={() => scrollTo('sam-metric')}>SAM Metric</button>
          <button style={S.navLink} onClick={() => scrollTo('rivals')}>Rivals</button>
          <button style={S.navLink} onClick={() => scrollTo('features')}>Features</button>
          <button
            style={{ ...S.navLink, color: '#22C55E', position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => navigate('/')}
          >
            <span className="live-pulse-dot" />
            Live Scores
          </button>
          <button style={S.navCta} onClick={() => navigate('/select-game')}>Get Started</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={S.hero}>
        <div style={S.heroText}>
          <div style={S.eyebrow}>The Intelligent Fantasy Platform</div>
          <h1 style={S.h1}>Run your front office. Build your empire.</h1>
          <p style={S.heroP}>
            SAMSports puts you in charge &mdash; draft players, manage your squad, trade on the market,
            upgrade your stadium, and compete head-to-head across four sports. AI-powered analytics.
            Real leagues. One platform built for depth.
          </p>
          <div style={S.heroBtns}>
            <button style={S.btnPrimary} onClick={() => navigate('/select-game')}>Create Account</button>
            <button style={S.btnSecondary} onClick={() => scrollTo('sam-metric')}>Learn More</button>
          </div>
        </div>

        {/* Device mockups — inline rendered at native size */}
        <div style={S.heroVisual}>
          {/* iPhone — Transfer Market */}
          <div style={S.iphone}>
            <div style={S.iphoneInner}>
              <div style={S.iphoneDynIsland} />
              <PhoneMockup />
              <div style={S.iphoneHome} />
            </div>
            <div style={S.iphoneLabel}>Football &mdash; Mobile</div>
          </div>

          {/* Laptop — Soccer Dashboard */}
          <div style={S.laptop}>
            <div style={S.laptopCamera} />
            <div style={S.laptopLid}>
              <div style={S.laptopScreen}>
                <DesktopMockup />
              </div>
            </div>
            <div style={S.laptopBase} />
            <div style={S.laptopLabel}>Soccer &mdash; Desktop</div>
          </div>
        </div>
      </section>

      {/* ── METRICS BAR ── */}
      <div style={S.metricsBar}>
        <div style={S.metricsInner}>
          {[
            { val: '4', label: 'Sports' },
            { val: '50+', label: 'Real Leagues', accent: true },
            { val: '42', label: 'Stats Per Match' },
            { val: '10', label: 'Competitive Divisions' },
          ].map((m, i) => (
            <div key={i}>
              <h3 style={S.metricH3}>{m.accent ? <>50<span style={{ color: '#22C55E' }}>+</span></> : m.val}</h3>
              <p style={S.metricP}>{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── PLATFORM OVERVIEW ── */}
      <section style={S.section} id="platform">
        <div style={S.sectionEyebrow}>Your Front Office</div>
        <h2 style={S.sectionH2}>Four sports. One empire.</h2>
        <div style={S.lead}>
          SAMSports isn&apos;t just fantasy &mdash; it&apos;s a full front-office simulation. You draft via live snake drafts,
          trade on a real transfer market, build and upgrade your stadium, climb 10 promotion/relegation divisions,
          and manage your squad using our exclusive AI-powered SAM Metric. Two sports are live now, with two more on the way.
        </div>
        <div style={S.sportsGrid}>
          <div style={S.sportCard}>
            <h3 style={S.sportCardH3}>Soccer</h3>
            <div style={S.sportCardSub}>6 Leagues <span style={S.liveBadge}>LIVE</span></div>
            <div style={S.tags}>
              {['England', 'Spain', 'Germany', 'Italy', 'France', 'Poland'].map(t => <span key={t} style={S.tag}>{t}</span>)}
            </div>
          </div>
          <div style={S.sportCard}>
            <h3 style={S.sportCardH3}>Football</h3>
            <div style={S.sportCardSub}>All 32 Teams <span style={S.liveBadge}>LIVE</span></div>
            <div style={S.tags}>
              {['AFC North', 'AFC South', 'AFC East', 'AFC West', 'NFC North', 'NFC South', 'NFC East', 'NFC West'].map(t => <span key={t} style={S.tag}>{t}</span>)}
            </div>
          </div>
          <div style={{ ...S.sportCard, opacity: 0.7 }}>
            <h3 style={S.sportCardH3}>Basketball</h3>
            <div style={S.sportCardSub}>30 Teams <span style={S.soonBadge}>COMING SOON</span></div>
            <div style={S.tags}>
              {['Eastern Conference', 'Western Conference'].map(t => <span key={t} style={S.tag}>{t}</span>)}
            </div>
          </div>
          <div style={{ ...S.sportCard, opacity: 0.7 }}>
            <h3 style={S.sportCardH3}>Hockey</h3>
            <div style={S.sportCardSub}>32 Teams <span style={S.soonBadge}>COMING SOON</span></div>
            <div style={S.tags}>
              {['Eastern Conference', 'Western Conference'].map(t => <span key={t} style={S.tag}>{t}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* ── SAM METRIC ── */}
      <section id="sam-metric" style={{ background: 'rgba(255,255,255,.01)', padding: '120px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={S.sectionEyebrow}>The SAM Metric &mdash; Only on SAMSports</div>
            <h2 style={S.sectionH2}>42 stats. One number.<br />No other platform does this.</h2>
            <div style={{ ...S.lead, maxWidth: 640, margin: '16px auto 0' }}>
              Traditional fantasy only counts the obvious stats. SAM goes deeper &mdash; our AI processes
              42 performance indicators per match and outputs a single 1-10 rating that captures the full
              picture across every sport.
            </div>
          </div>

          {/* Dual Score Cards */}
          <div style={S.scoreCardsRow}>
            {/* Soccer */}
            <div style={S.scoreCard}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 16, color: '#22C55E' }}>Soccer</div>
              <div style={S.scoreBig}>8.7</div>
              <div style={S.scoreLabel}>K. Mbappe, Matchday 12</div>
              {[['Goals', '2'], ['Assists', '1'], ['Pass Accuracy', '87%'], ['Shots on Target', '5'], ['Dribbles Won', '6']].map(([l, v]) => (
                <div key={l} style={S.scoreRow}><span style={S.scoreRowLabel}>{l}</span><span style={S.scoreRowVal}>{v}</span></div>
              ))}
              <ScaleBar colors={soccerScale} />
            </div>
            {/* Football */}
            <div style={S.scoreCard}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 16, color: '#3b82f6' }}>Football</div>
              <div style={{ ...S.scoreBig, color: '#3b82f6' }}>9.2</div>
              <div style={S.scoreLabel}>P. Mahomes, Week 14</div>
              {[['Pass Yards', '382'], ['TDs', '3'], ['Completion %', '68%'], ['Rushing Yards', '45'], ['Interceptions', '0']].map(([l, v]) => (
                <div key={l} style={S.scoreRow}><span style={S.scoreRowLabel}>{l}</span><span style={S.scoreRowVal}>{v}</span></div>
              ))}
              <ScaleBar colors={footballScale} />
            </div>
          </div>

          {/* Sport-Specific USPs */}
          <div style={{ display: 'flex', gap: 48, marginTop: 56, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#22C55E', marginBottom: 8 }}>&#9917; Beyond Goals &amp; Assists</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>A midfielder who controlled the game but didn&apos;t score? SAM knows. We track xG, progressive carries, duels won, aerial success, and 36 more metrics. Every touch matters.</p>
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>&#127944; Beyond TDs &amp; Yards</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>An offensive lineman who dominated his matchup? SAM knows. We track QB pressure rate, route separation, run-blocking grades, and 36 more metrics. Every snap matters.</p>
            </div>
          </div>

          {/* Info Items */}
          <div style={{ display: 'flex', gap: 32, marginTop: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { icon: '42', title: 'Beyond the Box Score', desc: 'xG, progressive carries, QB pressure rate, route separation, duels won, run-blocking grades. 42 metrics across every sport.' },
              { icon: '10', title: 'Position-Aware Intelligence', desc: 'A goalkeeper saving 8 shots is rated differently than a striker scoring 2. Each of the 10 position groups has its own weighting model.' },
              { icon: 'AI', title: 'AI-Powered, Updated Weekly', desc: 'Not a formula — a trained model that adapts to match context and updates every matchday from live official data.' },
            ].map((item) => (
              <div key={item.title} style={{ ...S.infoItem, flex: 1, minWidth: 240, maxWidth: 320 }}>
                <div style={S.infoIcon}>{item.icon}</div>
                <div>
                  <h4 style={S.infoH4}>{item.title}</h4>
                  <p style={S.infoP}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RIVALS ── */}
      <section style={S.section} id="rivals">
        <div style={{ display: 'flex', gap: 64, alignItems: 'flex-start' }}>
          {/* Matchup card on left */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
            <div style={S.matchup}>
              <div style={S.matchupLabel}>Matchday 12, World Masters</div>
              <div style={S.matchupVs}>
                <div style={S.matchupTeam}>
                  <div style={S.badgeA}>D</div>
                  <div style={S.matchupName}>Dynasty FC</div>
                  <div style={S.matchupScore}>1384</div>
                </div>
                <div style={S.matchupDiv}>VS</div>
                <div style={S.matchupTeam}>
                  <div style={S.badgeB}>I</div>
                  <div style={S.matchupName}>Iron Eagles</div>
                  <div style={S.matchupScore}>1261</div>
                </div>
              </div>
              {[['5', 'Goals', '3'], ['7', 'Assists', '4'], ['8.4', 'Avg SAM', '7.2'], ['11', 'Starters', '11']].map(([a, label, b]) => (
                <div key={label} style={S.matchupRow}>
                  <span style={{ color: '#22C55E', fontWeight: 600 }}>{a}</span>
                  <span style={{ color: '#4b5563', fontWeight: 500 }}>{label}</span>
                  <span style={{ color: '#3b82f6', fontWeight: 600 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Text on right */}
          <div style={{ flex: 1 }}>
            <div style={S.sectionEyebrow}>Rivals Mode</div>
            <h2 style={S.sectionH2}>Head-to-head leagues with promotion and relegation.</h2>
            <div style={S.lead}>Compete in 12-manager pods across 10 divisions. Top performers promote. Bottom finishers relegate. Every matchweek counts.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 28 }}>
              <div style={S.infoItem}>
                <div style={{ ...S.infoIcon, fontSize: 12 }}>12</div>
                <div>
                  <h4 style={S.infoH4}>Structured Competition</h4>
                  <p style={S.infoP}>Round-robin pods with 12 managers. Full season schedule, real stakes.</p>
                </div>
              </div>
              <div style={S.infoItem}>
                <div style={{ ...S.infoIcon, fontSize: 11 }}>0.5x</div>
                <div>
                  <h4 style={S.infoH4}>Lineup Strategy</h4>
                  <p style={S.infoP}>Starting players earn full points. Bench contributes at 0.5x. Roster decisions matter.</p>
                </div>
              </div>
            </div>
            {/* Tier list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 20 }}>
              <div style={S.tierActive}><span style={S.tierNumActive}>1</span><span style={{ color: '#22C55E' }}>World Masters</span></div>
              <div style={S.tier}><span style={S.tierNum}>2</span><span style={{ color: '#6b7280' }}>Titans Cup</span></div>
              <div style={S.tier}><span style={S.tierNum}>3</span><span style={{ color: '#6b7280' }}>Continental Trophy</span></div>
              <div style={S.tier}><span style={S.tierNum}>4</span><span style={{ color: '#6b7280' }}>Challenger Shield</span></div>
              <div style={S.tier}><span style={S.tierNum}>...</span><span style={{ color: '#374151' }}>6 more divisions</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ background: 'rgba(255,255,255,.01)', padding: '120px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={S.sectionEyebrow}>Front Office Tools</div>
          <h2 style={S.sectionH2}>Everything a GM needs.</h2>
          <div style={S.lead}>From draft night to the final matchweek &mdash; every tool to run your franchise, integrated into one platform.</div>
          <div style={S.toolsGrid}>
            {[
              { title: 'Live Snake Draft', desc: 'Real-time drafts with pick queue, blacklist, smart autodraft, and a visual draft board.' },
              { title: 'Transfer Market', desc: 'Buy, sell, and loan players. Market valuations driven by real performance data.' },
              { title: 'AI Coach', desc: 'Squad analysis and roster recommendations powered by the SAM Metric engine.' },
              { title: 'Stadium Management', desc: 'Build and upgrade your stadium. Drive attendance revenue and grow your club.' },
              { title: 'Live Scoring', desc: 'Real-time fantasy points updated every matchday with detailed breakdowns.' },
              { title: 'League Communication', desc: 'Built-in chat for trade negotiations, strategy discussions, and league coordination.' },
            ].map((t) => (
              <div key={t.title} style={S.tool}>
                <div style={S.toolDot} />
                <h4 style={S.toolH4}>{t.title}</h4>
                <p style={S.toolP}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={S.cta} id="cta">
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, background: 'radial-gradient(circle,rgba(34,197,94,.04) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <h2 style={S.ctaH2}>Build your empire.</h2>
        <p style={S.ctaP}>Create an account and start running your franchise today.</p>
        <button style={S.ctaBtn} onClick={() => navigate('/select-game')}>Create Account</button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={S.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldLogo size={20} gradientId="fGrad" />
          <span style={S.footerCopy}>&copy; 2026 SAMSports. All rights reserved.</span>
        </div>
        <div style={S.footerRight}>
          <button style={S.footerLink} onClick={() => navigate('/terms')}>Terms</button>
          <button style={S.footerLink} onClick={() => navigate('/privacy')}>Privacy</button>
          <button style={S.footerLink} onClick={() => navigate('/contact')}>Contact</button>
        </div>
      </footer>
    </div>
  );
};

export default MarketingPage;
