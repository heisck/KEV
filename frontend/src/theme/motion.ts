/** Shared motion presets so every spring in the app feels like one system. */
export const springs = {
  /** Snappy UI response — pressed states, chips, toggles. */
  press: { damping: 18, stiffness: 320, mass: 0.7 },
  /** Drawers, sheets and cards sliding into place. */
  sheet: { damping: 22, stiffness: 220, mass: 0.9 },
  /** Gentle idle/float loops on illustrations. */
  drift: { damping: 14, stiffness: 60, mass: 1.2 },
} as const;

export const durations = {
  fast: 160,
  base: 260,
  slow: 420,
} as const;

/** Subtle press — pairs with native liquid-glass interactive morph (don't over-scale). */
export const pressedScale = 0.98;
