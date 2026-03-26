import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

function TabIcon({
  color,
  size,
  variant,
}: {
  color: string;
  size: number;
  variant: 'calc' | 'conversor' | 'billets';
}) {
  const iconMap: Record<string, string> = {
    calc: 'calculator',
    conversor: 'swap-horizontal',
    billets: 'wallet',
  };

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons 
        name={iconMap[variant] as any} 
        size={size * 0.7} 
        color={color} 
      />
    </View>
  );
}

function InnerLayout() {
  const { colors, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.bg} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
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
    </>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <InnerLayout />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({});