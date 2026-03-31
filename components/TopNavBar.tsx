import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../constants/theme';

export default function TopNavBar() {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const isCalc = pathname === '/' || pathname === '/index';
  const isConv = pathname.startsWith('/conversor');
  const isBill = pathname === '/billetes';

  const tabs = [
    { title: 'Calculadora', path: '/', active: isCalc },
    { title: 'Convertidor', path: '/conversor', active: isConv },
    { title: 'Billetes', path: '/billetes', active: isBill },
  ];

  return (
    <SafeAreaView style={{ backgroundColor: colors.bg }}>
      <View style={styles.topNav}>
        {/* Spacer to balance the right icon */}
        <View style={styles.iconSlot} />

        {/* Centered tabs */}
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

        {/* Menu icon */}
        <View style={styles.iconSlot}>
          <TouchableOpacity style={styles.navIconBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  iconSlot: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLinks: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 16,
    fontFamily: typography.sans,
  },
  navIconBtn: {
    padding: spacing.xs,
  },
});
