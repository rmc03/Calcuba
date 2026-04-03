import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

try { SplashScreen.preventAutoHideAsync(); } catch {}

function TabIcon({
  color,
  size,
  variant,
}: {
  color: string;
  size: number;
  variant: 'calc' | 'conversor' | 'billets';
}) {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    calc: 'calculator',
    conversor: 'swap-horizontal',
    billets: 'wallet',
  };

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons 
        name={iconMap[variant]} 
        size={size * 0.7} 
        color={color} 
      />
    </View>
  );
}

function InnerLayout() {
  const { colors, isDark } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.bg} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { 
            display: 'none', 
            borderTopWidth: 0, 
            elevation: 0, 
            backgroundColor: 'transparent' 
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Calculadora',
            tabBarIcon: ({ color, size }) => <TabIcon color={color} size={size} variant="calc" />,
          }}
        />
        <Tabs.Screen
          name="conversor"
          options={{
            title: 'Cambio',
            headerShown: false,
            tabBarIcon: ({ color, size }) => <TabIcon color={color} size={size} variant="conversor" />,
          }}
        />
        <Tabs.Screen
          name="billetes"
          options={{
            title: 'Efectivo',
            tabBarIcon: ({ color, size }) => <TabIcon color={color} size={size} variant="billets" />,
          }}
        />
      </Tabs>
    </View>
  );
}

export default function Layout() {
  const [loaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <InnerLayout />
    </ThemeProvider>
  );
}