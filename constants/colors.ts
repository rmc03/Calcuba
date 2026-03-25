export const palette = {
  // Brand
  accent: '#e94560',
  accentDim: 'rgba(233,69,96,0.15)',
  amber: '#f5a623',
  amberDim: 'rgba(245,166,35,0.12)',
  green: '#22c55e',

  // Dark neutrals
  dark0: '#070f19',
  dark1: '#0d1b2a',
  dark2: '#0a1520',
  dark3: '#111c2b',
  dark4: '#1a2d42',
  dark5: '#1e3a56',
  dark6: '#2a4a6e',
  dark7: '#3a5a7e',

  // Light neutrals
  light0: '#f0f4f8',
  light1: '#e8edf3',
  light2: '#dce3ec',
  light3: '#cdd6e2',
  light4: '#b5c2d1',
  light5: '#8a9ab0',

  // Text
  white: '#ffffff',
  black: '#0a0f1a',
};

export type ColorScheme = typeof darkColors & typeof lightColors;

export const darkColors = {
  // Backgrounds
  bg: palette.dark1,
  bgDeep: palette.dark2,
  bgCard: palette.dark3,
  bgInput: palette.dark2,

  // Borders
  border: palette.dark4,
  borderFocus: palette.dark5,

  // Calculator buttons
  btnDigit: palette.dark4,
  btnOp: '#1b3a6b',
  btnSci: '#0f2035',
  btnEq: palette.accent,
  btnAc: palette.dark4,
  btnMod: palette.dark6,

  // Text
  textPrimary: palette.white,
  textSecondary: '#94a3b8',
  textTertiary: '#4a5568',
  textAccent: palette.accent,
  textAmber: palette.amber,
  textGreen: palette.green,

  // Tab bar
  tabBar: '#0d1b2aee',
  tabBorder: palette.dark4,
  tabActive: palette.accent,
  tabInactive: '#4a5568',

  // Status bar
  statusBar: 'light' as const,

  // Brand
  accent: palette.accent,
  accentDim: palette.accentDim,
  amber: palette.amber,
  amberDim: palette.amberDim,
  green: palette.green,
};

export const lightColors = {
  // Backgrounds
  bg: palette.light0,
  bgDeep: palette.white,
  bgCard: palette.white,
  bgInput: palette.light1,

  // Borders
  border: palette.light3,
  borderFocus: palette.light4,

  // Calculator buttons
  btnDigit: palette.white,
  btnOp: '#dbeafe',
  btnSci: palette.light2,
  btnEq: palette.accent,
  btnAc: palette.white,
  btnMod: '#e0e7ef',

  // Text
  textPrimary: palette.black,
  textSecondary: '#4a5568',
  textTertiary: '#94a3b8',
  textAccent: palette.accent,
  textAmber: '#c47d0e',
  textGreen: '#16a34a',

  // Tab bar
  tabBar: '#f0f4f8ee',
  tabBorder: palette.light3,
  tabActive: palette.accent,
  tabInactive: '#94a3b8',

  // Status bar
  statusBar: 'dark' as const,

  // Brand
  accent: palette.accent,
  accentDim: palette.accentDim,
  amber: palette.amber,
  amberDim: palette.amberDim,
  green: palette.green,
};
