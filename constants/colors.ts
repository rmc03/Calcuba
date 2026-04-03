export const palette = {
  accent: '#3B82F6', // Cobalt Blue
  accentDim: 'rgba(59,130,246,0.15)',
  
  // Repurposing 'amber' as our main Neo-Fintech Emerald accent
  amber: '#10B981', // Emerald Green
  amberDim: 'rgba(16,185,129,0.15)',
  
  green: '#10B981',
  
  // System grays (Zinc scale for Fintech feel)
  gray1: '#a1a1aa', // zinc-400
  gray2: '#71717a', // zinc-500
  gray3: '#52525b', // zinc-600
  gray4: '#3f3f46', // zinc-700
  gray5: '#27272a', // zinc-800
  gray6: '#18181b', // zinc-900

  // Dark mode backgrounds (Deep Zinc)
  dark0: '#09090b', // zinc-950
  dark1: '#18181b', // zinc-900
  dark2: '#27272a', // zinc-800
  dark3: '#3f3f46', // zinc-700
  dark4: '#52525b', // zinc-600
  dark5: '#71717a', // zinc-500
  dark6: '#a1a1aa', // zinc-400

  // Light mode backgrounds
  light0: '#FFFFFF',
  light1: '#fafafa', // zinc-50
  light2: '#f4f4f5', // zinc-100
  light3: '#e4e4e7', // zinc-200
  light4: '#d4d4d8', // zinc-300
  light5: '#a1a1aa', // zinc-400

  white: '#FFFFFF',
  black: '#000000',
};

export type ColorScheme = typeof darkColors | typeof lightColors;

export const darkColors = {
  bg: palette.dark0,
  bgDeep: palette.dark0,
  bgCard: palette.dark1,
  bgInput: palette.dark1,

  border: palette.dark2,
  borderFocus: palette.dark4,

  btnDigit: palette.dark2,
  btnOp: palette.amber,
  btnSci: palette.dark2,
  btnEq: palette.amber,
  btnAc: palette.dark3,
  btnMod: palette.dark3,

  // Text colors
  textPrimary: palette.white,
  textSecondary: palette.dark6,
  textTertiary: palette.gray1,
  textAccent: palette.accent,
  textAmber: palette.amber,
  textGreen: palette.green,

  // Tab bar - iOS style
  tabBar: palette.dark1,
  tabBorder: palette.dark3,
  tabActive: palette.accent,
  tabInactive: palette.gray1,

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
  bg: palette.light1,
  bgDeep: palette.light1,
  bgCard: palette.light0,
  bgInput: palette.light0,

  border: palette.light3,
  borderFocus: palette.light5,

  btnDigit: palette.light0,
  btnOp: palette.amber,
  btnSci: palette.light0,
  btnEq: palette.amber,
  btnAc: palette.light3,
  btnMod: palette.light3,

  // Text colors
  textPrimary: palette.black,
  textSecondary: palette.gray2,
  textTertiary: palette.gray1,
  textAccent: palette.accent,
  textAmber: '#CC7700',
  textGreen: '#228B22',

  // Tab bar - iOS style
  tabBar: palette.light0,
  tabBorder: palette.light2,
  tabActive: palette.accent,
  tabInactive: palette.gray1,

  // Status bar
  statusBar: 'dark' as const,

  // Brand
  accent: palette.accent,
  accentDim: palette.accentDim,
  amber: palette.amber,
  amberDim: palette.amberDim,
  green: palette.green,
};