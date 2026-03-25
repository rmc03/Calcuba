import { Platform } from 'react-native';

export const typography = {
  // Prefer SF Pro on iOS, clean system fonts elsewhere
  display: Platform.select({ ios: 'System', android: 'sans-serif-thin', default: 'monospace' }),
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
};

export const radii = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  accent: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  }),
};
