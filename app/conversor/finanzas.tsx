import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import SubScreenHeader from '../../components/SubScreenHeader';
import NumericKeypad from '../../components/NumericKeypad';
import { useTheme } from '../../context/ThemeContext';
import { typography, radii, spacing } from '../../constants/theme';

export default function Finanzas() {
  const { colors } = useTheme();
  const [capital, setCapital] = useState('1000');
  const [rate, setRate] = useState('5');
  const [years, setYears] = useState('1');
  const [editing, setEditing] = useState<'capital' | 'rate' | 'years'>('capital');

  const result = useMemo(() => {
    const c = parseFloat(capital) || 0;
    const r = parseFloat(rate) || 0;
    const y = parseFloat(years) || 0;
    const total = c * Math.pow(1 + r / 100, y);
    return { total, interest: total - c };
  }, [capital, rate, years]);

  const handleDigit = (d: string) => {
    const setters: Record<string, React.Dispatch<React.SetStateAction<string>>> = { capital: setCapital, rate: setRate, years: setYears };
    const vals: Record<string, string> = { capital, rate, years };
    const setter = setters[editing];
    const cur = vals[editing];
    if (d === '.' && cur.includes('.')) return;
    if (d === '00' && cur === '0') return;
    if (cur === '0' && d !== '.' && d !== '00') { setter(d); return; }
    setter(cur + d);
  };
  const handleClear = () => { setCapital('0'); setRate('0'); setYears('0'); };
  const handleBackspace = () => {
    const setters: Record<string, React.Dispatch<React.SetStateAction<string>>> = { capital: setCapital, rate: setRate, years: setYears };
    const vals: Record<string, string> = { capital, rate, years };
    const cur = vals[editing];
    if (cur.length <= 1) { setters[editing]('0'); return; }
    setters[editing](cur.slice(0, -1));
  };

  const fields = [
    { key: 'capital' as const, label: 'Capital', value: capital, prefix: '$' },
    { key: 'rate' as const, label: 'Tasa anual %', value: rate, suffix: '%' },
    { key: 'years' as const, label: 'Años', value: years },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <SubScreenHeader title="Finanzas" />

      <View style={styles.content}>
        {fields.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.field, editing === f.key && { borderColor: colors.amber, borderWidth: 1 }]}
            onPress={() => setEditing(f.key)}
            accessibilityLabel={`${f.label}: ${f.prefix ?? ''}${f.value}${f.suffix ?? ''}`}
            accessibilityRole="button"
            accessibilityState={{ selected: editing === f.key }}
          >
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{f.label}</Text>
            <Text style={[styles.fieldValue, { color: editing === f.key ? colors.amber : colors.textPrimary, fontVariant: ['tabular-nums'] }]} selectable>
              {f.prefix ?? ''}{f.value}{f.suffix ?? ''}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={[styles.resultCard, { backgroundColor: colors.bgCard, borderCurve: 'continuous' as any }]}>
          <View style={styles.resultRow}>
            <Text style={[styles.rl, { color: colors.textSecondary }]}>Intereses</Text>
            <Text style={[styles.rv, { color: colors.green, fontVariant: ['tabular-nums'] }]} selectable>${result.interest.toFixed(2)}</Text>
          </View>
          <View style={[styles.sep, { backgroundColor: colors.border }]} />
          <View style={styles.resultRow}>
            <Text style={[styles.rl, { color: colors.textSecondary }]}>Total</Text>
            <Text style={[styles.rv, { color: colors.amber, fontVariant: ['tabular-nums'] }]} selectable>${result.total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <NumericKeypad
        onDigit={handleDigit}
        onClear={handleClear}
        onBackspace={handleBackspace}
        showOperators={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  field: { borderRadius: radii.md, paddingVertical: 12, paddingHorizontal: spacing.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: 'transparent' },
  fieldLabel: { fontSize: 12, fontFamily: typography.sans, letterSpacing: 0.5 },
  fieldValue: { fontSize: 24, fontFamily: typography.sans, fontWeight: '300', marginTop: 2 },
  resultCard: { borderRadius: radii.xl, padding: spacing.xl, marginTop: spacing.sm },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  rl: { fontSize: 15, fontFamily: typography.sans },
  rv: { fontSize: 20, fontFamily: typography.sans, fontWeight: '500' },
  sep: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
});
