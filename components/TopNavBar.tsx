import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../constants/theme';

export default function TopNavBar() {
  const { colors, isDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
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

        {/* Centered Pill Tabs */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={[styles.pillContainer, { backgroundColor: isDark ? colors.bgCard : colors.border }]}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.path}
                onPress={() => router.replace(tab.path as import('expo-router').Href)}
                activeOpacity={0.7}
                style={[
                  styles.pillItem,
                  tab.active && {
                    backgroundColor: isDark ? colors.bg : colors.bgCard,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.15,
                    shadowRadius: 2,
                    elevation: 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.navText,
                    {
                      color: tab.active ? (isDark ? colors.amber : colors.textPrimary) : colors.textTertiary,
                      fontFamily: tab.active ? typography.sansMedium : typography.sans,
                      fontWeight: tab.active ? '600' : '400',
                    },
                  ]}
                >
                  {tab.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Menu icon */}
        <View style={styles.iconSlot}>
          <TouchableOpacity style={styles.navIconBtn} onPress={() => setMenuOpen(true)}>
            <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Menu */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menuDropdown, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                setMenuOpen(false);
                router.push('/ajustes');
              }}
            >
              <Ionicons name="settings-outline" size={18} color={colors.textPrimary} />
              <Text style={[styles.menuText, { color: colors.textPrimary }]}>Ajustes</Text>
            </TouchableOpacity>
            
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                setMenuOpen(false);
                router.push('/acerca');
              }}
            >
              <Ionicons name="information-circle-outline" size={18} color={colors.textPrimary} />
              <Text style={[styles.menuText, { color: colors.textPrimary }]}>Acerca de</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  pillContainer: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 4,
    alignItems: 'center',
  },
  pillItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  navText: {
    fontSize: 14,
  },
  navIconBtn: {
    padding: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  menuDropdown: {
    position: 'absolute',
    top: 50,
    right: spacing.md,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    width: 180,
    paddingVertical: spacing.xs,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  menuText: {
    fontSize: 15,
    fontFamily: typography.sans,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: spacing.sm,
  },
});
