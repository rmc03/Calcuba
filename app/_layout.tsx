import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { radii, shadows } from '../constants/theme';
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

function ThemeToggle() {
  const { isDark, toggle, colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={toggle}
      style={[
        styles.themeBtn,
        { backgroundColor: colors.bgCard, borderColor: colors.border },
        shadows.sm,
      ]}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={isDark ? 'sunny' : 'moon'} 
        size={18} 
        color={colors.textSecondary} 
      />
    </TouchableOpacity>
  );
}

function InnerLayout() {
  const { colors, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.bg} />
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 17,
          },
          headerRight: () => <ThemeToggle />,
          headerRightContainerStyle: { paddingRight: 16, paddingBottom: 4 },
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.tabBorder,
            borderTopWidth: StyleSheet.hairlineWidth,
            height: 84,
            paddingBottom: 28,
            paddingTop: 8,
          },
          tabBarActiveTintColor: colors.tabActive,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
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

const styles = StyleSheet.create({
  themeBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});