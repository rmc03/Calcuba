import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Text, StyleSheet, View, SafeAreaView } from 'react-native';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { radii, shadows, spacing } from '../constants/theme';
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
          headerShown: true,
          header: ({ navigation, route }) => {
            const state = navigation.getState();
            if (!state) return null;
            return (
              <SafeAreaView style={{ backgroundColor: colors.bg }}>
                <View style={styles.topNav}>
                  <TouchableOpacity style={styles.navIconBtn}>
                    <Ionicons name="resize-outline" size={22} color={colors.textSecondary} style={{ transform: [{ rotate: '45deg' }] }} />
                  </TouchableOpacity>
                  
                  <View style={styles.navLinks}>
                    {state.routes.map((r: any, index: number) => {
                      // Optionally hide billetes from header since screenshot only shows 2, but we'll include it or keep it hidden.
                      if (r.name !== 'index' && r.name !== 'conversor') return null;
                      
                      const isFocused = state.index === index;
                      const title = r.name === 'index' ? 'Calculadora' : 'Convertidor';
                      
                      return (
                        <TouchableOpacity key={r.key} onPress={() => navigation.navigate(r.name)}>
                          <Text style={[
                            styles.navText, 
                            { color: isFocused ? colors.textPrimary : colors.textSecondary, fontWeight: isFocused ? '600' : '400' }
                          ]}>
                            {title}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity style={styles.navIconBtn}>
                    <Ionicons name="ellipsis-vertical" size={22} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            );
          },
          tabBarStyle: { display: 'none' }, // Hide bottom bar completely
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
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  navLinks: {
    flexDirection: 'row',
    gap: spacing.xl,
    justifyContent: 'center',
  },
  navText: {
    fontSize: 18,
  },
  navIconBtn: {
    padding: spacing.xs,
  },
});