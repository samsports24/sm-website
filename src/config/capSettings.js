/* ══════════════════════════════════════════════════════════
   CAP SETTINGS — Dynamic Salary Cap Configuration

   Values are editable from the Admin Panel → NFL → Salary tab.
   Stored in localStorage so changes propagate across the entire
   platform without a backend deploy.
   ══════════════════════════════════════════════════════════ */

const STORAGE_KEY = "samsports_cap_settings";

// ── Defaults (used when nothing is saved yet) ──
const DEFAULTS = {
  nflCeiling:   301_200_000,  // $301.2M — 2026 NFL salary cap
  nflFloor:     280_000_000,  // $280M   — NFL salary floor
  soccerCap:    200_000_000,  // $200M   — Soccer salary cap
};

/**
 * Read all cap settings from localStorage (with defaults).
 */
export const getCapSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return {
      nflCeiling:  parsed.nflCeiling  ?? DEFAULTS.nflCeiling,
      nflFloor:    parsed.nflFloor    ?? DEFAULTS.nflFloor,
      soccerCap:   parsed.soccerCap   ?? DEFAULTS.soccerCap,
    };
  } catch {
    return { ...DEFAULTS };
  }
};

/**
 * Save cap settings to localStorage.
 * @param {{ nflCeiling?: number, nflFloor?: number, soccerCap?: number }} updates
 */
export const saveCapSettings = (updates) => {
  const current = getCapSettings();
  const merged = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
};

// ── Convenience getters ──
export const getNFLCeiling  = () => getCapSettings().nflCeiling;
export const getNFLFloor    = () => getCapSettings().nflFloor;
export const getSoccerCap   = () => getCapSettings().soccerCap;
