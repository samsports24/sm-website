export const C = {
  bg: '#0B0E14',
  panel: '#0F131C',
  card: '#121722',
  line: 'rgba(255,255,255,0.08)',
  text: '#E8EBF0',
  dim: 'rgba(255,255,255,0.5)',
  faint: 'rgba(255,255,255,0.32)',
  green: '#22C55E',
  gold: '#D4A843',
  red: '#EF4444',
  blue: '#3B82F6',
}

const POS_COLOR = {
  QB: '#EF4444', RB: '#22C55E', WR: '#3B82F6', TE: '#F59E0B', OL: '#8B5CF6',
  DE: '#EC4899', DT: '#F43F5E', LB: '#14B8A6', CB: '#6366F1', S: '#0EA5E9',
  K: '#A855F7', P: '#84CC16',
}
export const posColor = (p) => POS_COLOR[p] || '#64748B'

// Skill positions first (people look for those), then the trenches — which is
// the part no other fantasy site values at all.
export const POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OL', 'DE', 'DT', 'LB', 'CB', 'S', 'K', 'P']

export const TIER_LABEL = (t) => `Tier ${t}`
