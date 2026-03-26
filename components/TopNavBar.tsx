import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../constants/theme';

export default function TopNavBar() {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const isCalc = pathname === '/' || pathname === '/index';
  const isConv = pathname.startsWith('/conversor');

  const tabs = [
    { title: 'Calculadora', path: '/', active: isCalc },
    { title: 'Convertidor', path: '/conversor', active: isConv },
  ];

  return (
    <SafeAreaView style={{ backgroundColor: colors.bg }}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navIconBtn}>
          <Ionicons
            name="resize-outline"
            size={22}
            color={colors.textSecondary}
            style={{ transform: [{ rotate: '45deg' }] }}
          />
        </TouchableOpacity>

        <View style={styles.navLinks}>
          {tabs.map((tab) => (
            <TouchableOpacity key={tab.path} onPress={() => router.replace(tab.path as any)}>
              <Text
                style={[
                  styles.navText,
                  {
                    color: tab.active ? colors.textPrimary : colors.textSecondary,
                    fontWeight: tab.active ? '600' : '400',
                  },
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.navIconBtn}>
          <Ionicons name="ellipsis-vertical" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
