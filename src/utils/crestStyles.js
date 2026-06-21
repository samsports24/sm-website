// ═══════════════════════════════════════════════════════════════
//  CREST STYLES — original, parametric club-badge generators.
//
//  Inspired by classic football crests but NONE are copies. Each style takes
//  the team name + a Primary colour (a) and Secondary colour (b). Shapes are
//  filled DIRECTLY (no clip-path rectangles) so they render cleanly everywhere.
// ═══════════════════════════════════════════════════════════════

const GOLD = `<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7E08A"/><stop offset="0.5" stop-color="#D4A843"/><stop offset="1" stop-color="#A87B1E"/></linearGradient>`;
const STAR = `<path d="M256 36 l13 30 33 3 -25 22 8 32 -29 -17 -29 17 8 -32 -25 -22 33 -3 z" fill="url(#gold)" stroke="#8A6516" stroke-width="1.2"/>`;

// Flat palette — users pick a Primary and a Secondary colour.
export const COLORS = [
  { key: 'navy', val: '#0B2A6B' }, { key: 'blue', val: '#2563EB' },
  { key: 'sky', val: '#0EA5E9' }, { key: 'teal', val: '#0E9488' },
  { key: 'green', val: '#059669' }, { key: 'forest', val: '#0B3D2E' },
  { key: 'lime', val: '#65A30D' }, { key: 'gold', val: '#D4A843' },
  { key: 'orange', val: '#EA580C' }, { key: 'red', val: '#DC2626' },
  { key: 'maroon', val: '#7A1020' }, { key: 'pink', val: '#DB2777' },
  { key: 'purple', val: '#7C3AED' }, { key: 'slate', val: '#334155' },
  { key: 'black', val: '#111827' }, { key: 'white', val: '#E5E7EB' },
];

const STOP = new Set(['fc', 'sc', 'cf', 'team', 'the', 'of', 'ok', 'club']);
export function monogram(name) {
  const words = (name || '').replace(/[^a-zA-Z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  const sig = words.filter((w) => !STOP.has(w.toLowerCase()) && w.length > 1);
  const use = sig.length ? sig : words;
  if (use.length === 1) return use[0].slice(0, 3).toUpperCase();
  return use.slice(0, 3).map((w) => w[0]).join('').toUpperCase();
}
const xmlEsc = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mSize = (m) => (m.length >= 4 ? 92 : m.length === 3 ? 116 : 146);
const bFont = (n) => (n <= 9 ? 23 : n <= 13 ? 19 : n <= 18 ? 15 : 13);
// readable text on a fill: dark text on light colours, white otherwise
const ink = (hex) => {
  const c = hex.replace('#', ''); const r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), bl = parseInt(c.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * bl) > 150 ? '#0C1730' : '#ffffff';
};
const wrap = (inner) => `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><defs>${GOLD}</defs>${inner}</svg>`;
const monoTxt = (m, fill) => `<text x="256" y="296" text-anchor="middle" font-family="Arial,sans-serif" font-size="${mSize(m)}" font-weight="bold" fill="${fill}" stroke="rgba(0,0,0,0.3)" stroke-width="2" paint-order="stroke">${m}</text>`;
const namePill = (label) => `<rect x="118" y="366" width="276" height="48" rx="11" fill="url(#gold)" stroke="#7A5713" stroke-width="2"/><text x="256" y="398" text-anchor="middle" font-family="Arial,sans-serif" font-size="${bFont(label.length)}" font-weight="bold" fill="#0C1730">${label}</text>`;

const SHIELD = 'M256 74 L424 124 L424 282 Q424 398 256 458 Q88 398 88 282 L88 124 Z';
const SHIELD_RIGHT = 'M256 74 L424 124 L424 282 Q424 398 256 458 Z';

// 1 ── Shield, TWO-colour vertical split (pick both colours)
function shield(name, a, b) {
  const m = monogram(name), label = xmlEsc((name || '').toUpperCase());
  return wrap(`
    <circle cx="256" cy="256" r="244" fill="#0A1124" stroke="url(#gold)" stroke-width="6"/>${STAR}
    <path d="${SHIELD}" fill="${a}"/>
    <path d="${SHIELD_RIGHT}" fill="${b}"/>
    <line x1="256" y1="74" x2="256" y2="458" stroke="url(#gold)" stroke-width="4"/>
    <path d="${SHIELD}" fill="none" stroke="url(#gold)" stroke-width="9" stroke-linejoin="round"/>
    ${monoTxt(m, '#fff')}${namePill(label)}`);
}

// 3 ── Shield, ONE solid colour
function solidShield(name, a) {
  const m = monogram(name), label = xmlEsc((name || '').toUpperCase());
  return wrap(`
    <circle cx="256" cy="256" r="244" fill="#0A1124" stroke="url(#gold)" stroke-width="6"/>${STAR}
    <path d="${SHIELD}" fill="${a}"/>
    <path d="${SHIELD}" fill="none" stroke="url(#gold)" stroke-width="9" stroke-linejoin="round"/>
    ${monoTxt(m, ink(a))}${namePill(label)}`);
}

// 2 ── Round badge with the name on a curved ring
function roundel(name, a, b) {
  const m = monogram(name), label = xmlEsc((name || '').toUpperCase());
  return wrap(`
    <path id="arc" d="M256 256 m-176 0 a176 176 0 1 1 352 0" fill="none"/>
    <circle cx="256" cy="256" r="244" fill="url(#gold)"/>
    <circle cx="256" cy="256" r="232" fill="${b}"/>
    <circle cx="256" cy="256" r="150" fill="${a}" stroke="url(#gold)" stroke-width="5"/>
    ${monoTxt(m, ink(a)).replace('y="296"', 'y="288"')}
    <text font-family="Arial,sans-serif" font-size="32" font-weight="bold" fill="url(#gold)" letter-spacing="3"><textPath href="#arc" startOffset="50%" text-anchor="middle">${label}</textPath></text>`);
}

// 4 ── Diamond, two-colour top/bottom
function diamond(name, a, b) {
  const m = monogram(name), label = xmlEsc((name || '').toUpperCase());
  return wrap(`
    <circle cx="256" cy="256" r="244" fill="#0A1124" stroke="url(#gold)" stroke-width="5"/>
    <path d="M256 92 L420 256 L92 256 Z" fill="${a}"/>
    <path d="M92 256 L420 256 L256 420 Z" fill="${b}"/>
    <path d="M256 92 L420 256 L256 420 L92 256 Z" fill="none" stroke="url(#gold)" stroke-width="9" stroke-linejoin="round"/>
    ${monoTxt(m, '#fff').replace('y="296"', 'y="290"').replace(`font-size="${mSize(m)}"`, `font-size="${mSize(m) - 6}"`)}
    <rect x="120" y="436" width="272" height="40" rx="9" fill="url(#gold)"/><text x="256" y="464" text-anchor="middle" font-family="Arial,sans-serif" font-size="${bFont(label.length)}" font-weight="bold" fill="#0C1730">${label}</text>`);
}

// 5 ── Flag: rounded panel with a diagonal sash (clip is fine here)
function flag(name, a, b) {
  const m = monogram(name), label = xmlEsc((name || '').toUpperCase());
  return wrap(`
    <clipPath id="c"><rect x="96" y="120" width="320" height="272" rx="18"/></clipPath>
    <rect x="96" y="120" width="320" height="272" rx="18" fill="${a}" stroke="url(#gold)" stroke-width="6"/>
    <g clip-path="url(#c)"><path d="M96 300 L300 120 L416 120 L416 212 L212 392 L96 392 Z" fill="${b}"/></g>
    <rect x="96" y="120" width="320" height="272" rx="18" fill="none" stroke="url(#gold)" stroke-width="6"/>
    ${monoTxt(m, '#fff').replace('y="296"', 'y="300"')}
    <text x="256" y="430" text-anchor="middle" font-family="Arial,sans-serif" font-size="${bFont(label.length)}" font-weight="bold" fill="url(#gold)" letter-spacing="1">${label}</text>`);
}

// 6 ── Minimal roundel, ONE colour, two stars (no rectangles)
function minimal(name, a) {
  const m = monogram(name), label = xmlEsc((name || '').toUpperCase());
  return wrap(`
    <circle cx="256" cy="256" r="244" fill="${a}" stroke="url(#gold)" stroke-width="6"/>
    <circle cx="256" cy="256" r="210" fill="none" stroke="url(#gold)" stroke-width="1.5" opacity="0.5"/>
    <g fill="url(#gold)"><path d="M210 152 l7 16 18 1 -14 12 5 17 -16 -10 -16 10 5 -17 -14 -12 18 -1 z"/><path d="M302 152 l7 16 18 1 -14 12 5 17 -16 -10 -16 10 5 -17 -14 -12 18 -1 z"/></g>
    ${monoTxt(m, ink(a)).replace('y="296"', 'y="300"')}
    <text x="256" y="392" text-anchor="middle" font-family="Arial,sans-serif" font-size="${bFont(label.length)}" font-weight="bold" fill="url(#gold)" letter-spacing="1">${label}</text>`);
}

// styles flag whether they use the secondary colour (for the picker UI).
export const CREST_STYLES = [
  { key: 'shield', label: 'Shield', fn: (n, a, b) => shield(n, a, b), twoColor: true },
  { key: 'solid', label: 'Solid Shield', fn: (n, a) => solidShield(n, a), twoColor: false },
  { key: 'roundel', label: 'Roundel', fn: (n, a, b) => roundel(n, a, b), twoColor: true },
  { key: 'diamond', label: 'Diamond', fn: (n, a, b) => diamond(n, a, b), twoColor: true },
  { key: 'flag', label: 'Flag', fn: (n, a, b) => flag(n, a, b), twoColor: true },
  { key: 'minimal', label: 'Minimal', fn: (n, a) => minimal(n, a), twoColor: false },
];

export function buildCrest(styleKey, name, a, b) {
  const style = CREST_STYLES.find((s) => s.key === styleKey) || CREST_STYLES[0];
  return style.fn(name, a, b);
}
export function crestDataUri(styleKey, name, a, b) {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(buildCrest(styleKey, name, a, b))))}`;
}
