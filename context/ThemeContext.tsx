import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ColorScheme } from '../constants/colors';

interface ThemeContextValue {
  colors: ColorScheme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: darkColors,
  isDark: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ThemeContext.Provider value={{ colors: isDark ? darkColors : lightColors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
