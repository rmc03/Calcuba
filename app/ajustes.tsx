import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, ThemePref } from '../context/ThemeContext';
import { typography, spacing, radii } from '../constants/theme';
import SubScreenHeader from '../components/SubScreenHeader';

// ─── Extracted as a standalone component (not inline) ────────
interface OptionRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  destructive?: boolean;
}

function OptionRow({ icon, title, onPress, destructive = false }: OptionRowProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.optionRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      accessibilityLabel={title}
      accessibilityRole="button"
    >
      <View style={styles.optionLeft}>
        <Ionicons name={icon} size={20} color={destructive ? colors.amber : colors.textPrimary} />
        <Text style={[styles.optionText, { color: destructive ? colors.amber : colors.textPrimary }]}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

export default function Ajustes() {
  const { colors, pref, setPref } = useTheme();
  const router = useRouter();

  const handleClearHistory = () => {
    Alert.alert(
      'Borrar historial',
      '¿Estás seguro de que quieres borrar el historial de la calculadora?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('calcuba_history');
            Alert.alert('Éxito', 'Historial borrado');
          },
        },
      ],
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Borrar caché de tasas',
      '¿Estás seguro de que quieres borrar las tasas de cambio guardadas? Necesitarás internet para obtener las tasas de nuevo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('calcuba_rates');
            Alert.alert('Éxito', 'Caché borrado');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <SubScreenHeader title="Ajustes" />
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APARIENCIA</Text>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderCurve: 'continuous' as any }]}>
          {(['system', 'light', 'dark'] as ThemePref[]).map((p, i, arr) => (
            <TouchableOpacity
              key={p}
              style={[styles.themeRow, i < arr.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
              onPress={() => setPref(p)}
              accessibilityLabel={p === 'system' ? 'Automático' : p === 'light' ? 'Tema Claro' : 'Tema Oscuro'}
              accessibilityRole="button"
              accessibilityState={{ selected: pref === p }}
            >
              <Text style={[styles.themeText, { color: colors.textPrimary }]}>
                {p === 'system' ? 'Automático (Sistema)' : p === 'light' ? 'Tema Claro' : 'Tema Oscuro'}
              </Text>
              {pref === p && <Ionicons name="checkmark" size={20} color={colors.amber} />}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: spacing.xl }]}>DATOS</Text>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderCurve: 'continuous' as any }]}>
          <OptionRow icon="time-outline" title="Borrar historial" onPress={handleClearHistory} destructive />
          <OptionRow icon="trash-outline" title="Borrar caché de divisas" onPress={handleClearCache} destructive />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg },
  sectionTitle: {
    fontSize: 12,
    fontFamily: typography.sans,
    letterSpacing: 2,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  themeText: {
    fontSize: 16,
    fontFamily: typography.sans,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionText: {
    fontSize: 16,
    fontFamily: typography.sans,
  },
});
