export const palette = {
  // iOS Accent Blue (like system blue)
  accent: '#007AFF',
  accentDim: 'rgba(0,122,255,0.15)',
  
  // Secondary accent - orange for highlights (like iOS orange)
  amber: '#FF9500',
  amberDim: 'rgba(255,149,0,0.12)',
  
  // Green for success states
  green: '#34C759',
  
  // System grays (iOS style)
  gray1: '#8E8E93',
  gray2: '#636366',
  gray3: '#48484A',
  gray4: '#3A3A3C',
  gray5: '#2C2C2E',
  gray6: '#1C1C1E',

  // Dark mode backgrounds (iOS dark mode)
  dark0: '#000000',
  dark1: '#1C1C1E',
  dark2: '#2C2C2E',
  dark3: '#3A3A3C',
  dark4: '#48484A',
  dark5: '#636366',
  dark6: '#787880',

  // Light mode backgrounds (iOS light mode)
  light0: '#FFFFFF',
  light1: '#F2F2F7',
  light2: '#E5E5EA',
  light3: '#D1D1D6',
  light4: '#C7C7CC',
  light5: '#AEAEB2',

  // Text colors
  white: '#FFFFFF',
  black: '#000000',
};

export type ColorScheme = Omit<typeof darkColors, 'statusBar'> & Omit<typeof lightColors, 'statusBar'> & { statusBar: 'light' | 'dark' };

export const darkColors = {
  // Backgrounds - iOS dark mode depth
  bg: palette.dark0,
  bgDeep: palette.dark0,
  bgCard: palette.dark1,
  bgInput: palette.dark1,

  // Borders - subtle iOS separators
  border: palette.dark4,
  borderFocus: palette.dark5,

  // Calculator buttons - iOS dark style
  btnDigit: palette.dark2,
  btnOp: palette.amber,
  btnSci: palette.dark2,
  btnEq: palette.amber,
  btnAc: palette.light4,
  btnMod: palette.light4,

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
  // Backgrounds - iOS light mode
  bg: palette.light1,
  bgDeep: palette.light1,
  bgCard: palette.light0,
  bgInput: palette.light2,

  // Borders - subtle iOS separators
  border: palette.light3,
  borderFocus: palette.light4,

  // Calculator buttons - iOS light style
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