import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { radii, shadows } from '../constants/theme';

function TabIcon({
  color,
  size,
  variant,
}: {
  color: string;
  size: number;
  variant: 'calc' | 'conversor' | 'billetes';
}) {
  if (variant === 'calc') {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.72, height: size * 0.72, borderWidth: 1.8, borderColor: color, borderRadius: 5 }}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ flex: 1, borderRightWidth: 0.8, borderBottomWidth: 0.8, borderColor: color }} />
            <View style={{ flex: 1, borderBottomWidth: 0.8, borderColor: color }} />
          </View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ flex: 1, borderRightWidth: 0.8, borderColor: color }} />
            <View style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    );
  }
  if (variant === 'conversor') {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <View style={{ width: size * 0.5, height: 1.5, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ width: 0, height: 0, borderTopWidth: 3.5, borderBottomWidth: 3.5, borderLeftWidth: 5, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: color }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <View style={{ width: 0, height: 0, borderTopWidth: 3.5, borderBottomWidth: 3.5, borderRightWidth: 5, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: color }} />
          <View style={{ width: size * 0.5, height: 1.5, backgroundColor: color, borderRadius: 1 }} />
        </View>
      </View>
    );
  }
  // billetes
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size * 0.85, height: size * 0.55, borderWidth: 1.8, borderColor: color, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15, borderWidth: 1.5, borderColor: color }} />
      </View>
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
      <Text style={styles.themeBtnText}>{isDark ? '☀️' : '🌙'}</Text>
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
          headerRight: () => <ThemeToggle />,
          headerRightContainerStyle: { paddingRight: 16, paddingBottom: 4 },
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.tabBorder,
            borderTopWidth: StyleSheet.hairlineWidth,
            height: 64,
            paddingBottom: 10,
            paddingTop: 6,
          },
          tabBarActiveTintColor: colors.tabActive,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.3,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Calcular',
            tabBarIcon: ({ color, size }) => <TabIcon color={color} size={size} variant="calc" />,
          }}
        />
        <Tabs.Screen
          name="conversor"
          options={{
            title: 'Conversor',
            tabBarIcon: ({ color, size }) => <TabIcon color={color} size={size} variant="conversor" />,
          }}
        />
        <Tabs.Screen
          name="billetes"
          options={{
            title: 'Billetes',
            tabBarIcon: ({ color, size }) => <TabIcon color={color} size={size} variant="billetes" />,
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
  themeBtnText: {
    fontSize: 16,
  },
});
