import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { typography, spacing } from '../constants/theme';
import SubScreenHeader from '../components/SubScreenHeader';

export default function Acerca() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <SubScreenHeader title="Acerca de" />
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Calcuba</Text>
          <Text style={[styles.version, { color: colors.textSecondary }]}>Versión 2.0.0</Text>
        </View>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Herramienta esencial multifuncional para Cuba: Calculadora con interfaz premium, convertidor de divisas, unidades y utilitario para el conteo de billetes.
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Contacto y Soporte</Text>
        <Text style={[styles.link, { color: colors.amber }]}>github.com/ruslan-mc</Text>
        
        <Text style={[styles.footer, { color: colors.textTertiary }]}>
          Las tasas de cambio mostradas en el convertidor son tasas informales recolectadas a partir del mercado (mdiv.pro). No son tasas oficiales.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontFamily: typography.mono,
    fontWeight: 'bold',
  },
  version: {
    fontSize: 14,
    fontFamily: typography.sans,
    marginTop: spacing.xs,
  },
  description: {
    fontSize: 16,
    fontFamily: typography.sans,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    marginVertical: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: typography.sans,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  link: {
    fontSize: 16,
    fontFamily: typography.sans,
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 60,
    fontSize: 12,
    fontFamily: typography.sans,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
});
