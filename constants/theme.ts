import { Platform } from 'react-native';

export const typography = {
  display: Platform.select({ ios: 'System', android: 'sans-serif-thin', default: 'monospace' }),
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
};

export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: Platform.OS === 'ios' ? 0.08 : 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  accent: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  }),
};