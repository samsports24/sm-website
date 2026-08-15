// Shared look for the mock draft room.

export const C = {
  bg: '#0B0E14',
  panel: '#0F131C',
  card: '#121722',
  line: 'rgba(255,255,255,0.08)',
  text: '#E8EBF0',
  dim: 'rgba(255,255,255,0.45)',
  faint: 'rgba(255,255,255,0.28)',
  green: '#22C55E',
  gold: '#D4A843',
  blue: '#3B82F6',
  red: '#EF4444',
}

const POS_COLOR = {
  // Offense
  QB: '#EF4444',
  RB: '#22C55E',
  WR: '#3B82F6',
  TE: '#F59E0B',
  OL: '#8B5CF6',
  FLEX: '#0EA5E9',
  SUPERFLEX: '#06B6D4',
  // Defense
  DE: '#EC4899',
  DT: '#F43F5E',
  LB: '#14B8A6',
  CB: '#6366F1',
  S: '#0EA5E9',
  DEF: '#64748B',
  DST: '#64748B',
  // Special teams
  K: '#A855F7',
  P: '#84CC16',
  BENCH: '#475569',
}

export const posColor = (p) => POS_COLOR[p] || '#64748B'

// Filter tabs depend on the league mode — an offense-only league never drafts
// a nose tackle.
export const POS_TABS_FULL = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OL', 'DE', 'DT', 'LB', 'CB', 'S', 'K', 'P']
export const POS_TABS_OFFENSE = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K']

// Short beep when it's your turn. No audio file — the room shouldn't need one.
export const beep = () => {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)
    osc.start()
    osc.stop(ctx.currentTime + 0.36)
    setTimeout(() => ctx.close?.(), 600)
  } catch (e) { /* audio blocked — not important */ }
}
