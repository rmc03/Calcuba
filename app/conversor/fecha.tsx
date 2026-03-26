import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import SubScreenHeader from '../../components/SubScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { typography, radii, spacing } from '../../constants/theme';

function fmt(date: Date): string {
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function diffDates(a: Date, b: Date) {
  let from = a < b ? a : b;
  let to = a < b ? b : a;
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) { months--; days += new Date(to.getFullYear(), to.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }
  return { years, months, days };
}

export default function Fecha() {
  const { colors } = useTheme();
  const [fromDate] = useState(new Date());
  const [toDate] = useState(new Date());

  const diff = useMemo(() => diffDates(fromDate, toDate), [fromDate, toDate]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <SubScreenHeader title="Fecha" />

      <View style={styles.content}>
        {/* Desde */}
        <View style={styles.dateRow}>
          <Text style={[styles.dateLabel, { color: colors.textPrimary }]}>Desde</Text>
          <View style={styles.dateRight}>
            <Text style={[styles.dateValue, { color: colors.amber }]}>{fmt(fromDate)}</Text>
            <Text style={[styles.dateChevron, { color: colors.textSecondary }]}>⇅</Text>
          </View>
        </View>

        <View style={[styles.sep, { backgroundColor: colors.border }]} />

        {/* Hasta */}
        <View style={styles.dateRow}>
          <Text style={[styles.dateLabel, { color: colors.textPrimary }]}>Hasta</Text>
          <View style={styles.dateRight}>
            <Text style={[styles.dateValue, { color: colors.textPrimary }]}>{fmt(toDate)}</Text>
            <Text style={[styles.dateChevron, { color: colors.textSecondary }]}>⇅</Text>
          </View>
        </View>

        {/* Result card */}
        <View style={[styles.resultCard, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.resultTitle, { color: colors.amber }]}>Diferencia</Text>
          <View style={[styles.resultSep, { backgroundColor: colors.border }]} />

          <View style={styles.resultRow}>
            {[
              { label: 'Años', value: diff.years },
              { label: 'Meses', value: diff.months },
              { label: 'Días', value: diff.days },
            ].map((item) => (
              <View key={item.label} style={styles.resultCol}>
                <Text style={[styles.resultColLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                <Text style={[styles.resultColValue, { color: colors.textPrimary }]}>{item.value}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.resultSep, { backgroundColor: colors.border }]} />

          <View style={styles.resultFooter}>
            <View style={styles.resultCol}>
              <Text style={[styles.resultColLabel, { color: colors.amber }]}>Desde</Text>
              <Text style={[styles.resultColLabel, { color: colors.textSecondary }]}>{fmt(fromDate)}</Text>
            </View>
            <View style={styles.resultCol}>
              <Text style={[styles.resultColLabel, { color: colors.amber }]}>Hasta</Text>
              <Text style={[styles.resultColLabel, { color: colors.textSecondary }]}>{fmt(toDate)}</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: spacing.lg },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  dateLabel: { fontSize: 17, fontFamily: typography.sans },
  dateRight: { flexDirection: 'row', alignItems: 'center' },
  dateValue: { fontSize: 20, fontFamily: typography.sans, fontWeight: '500', marginRight: 8 },
  dateChevron: { fontSize: 16 },
  sep: { height: StyleSheet.hairlineWidth },
  resultCard: {
    marginTop: 40,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  resultTitle: {
    fontSize: 16,
    fontFamily: typography.sans,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  resultSep: { height: StyleSheet.hairlineWidth, marginVertical: spacing.md },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resultCol: { alignItems: 'center', flex: 1 },
  resultColLabel: { fontSize: 13, fontFamily: typography.sans, marginBottom: 4 },
  resultColValue: { fontSize: 32, fontFamily: typography.sans, fontWeight: '300' },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
