import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, type ColorScheme } from '../constants/colors';

export type ThemePref = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  colors: ColorScheme;
  isDark: boolean;
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: darkColors,
  isDark: true,
  pref: 'system',
  setPref: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [pref, setPrefState] = useState<ThemePref>('system');

  useEffect(() => {
    AsyncStorage.getItem('calcuba_theme').then((val) => {
      if (val === 'light' || val === 'dark' || val === 'system') {
        setPrefState(val as ThemePref);
      }
    });
  }, []);

  const setPref = (p: ThemePref) => {
    setPrefState(p);
    AsyncStorage.setItem('calcuba_theme', p).catch(() => {});
  };

  const isDark = pref === 'system' ? systemScheme === 'dark' : pref === 'dark';

  return (
    <ThemeContext.Provider value={{ colors: isDark ? darkColors : lightColors, isDark, pref, setPref }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
