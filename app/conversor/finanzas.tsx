import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SubScreenHeader from '../../components/SubScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { typography, radii, spacing } from '../../constants/theme';

const SW = Dimensions.get('window').width;
const PAD = 14; const GAP = 10;
const BW = (Math.min(SW, 400) - PAD * 2 - GAP * 3) / 4;
const BH = BW * 0.88;

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
    if (cur === '0' && d !== '.') { setter(d); return; }
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
        {fields.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.field, editing === f.key && { borderColor: colors.amber, borderWidth: 1 }]}
            onPress={() => setEditing(f.key)}
          >
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{f.label}</Text>
            <Text style={[styles.fieldValue, { color: editing === f.key ? colors.amber : colors.textPrimary }]}>
              {f.prefix ?? ''}{f.value}{f.suffix ?? ''}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={[styles.resultCard, { backgroundColor: colors.bgCard }]}>
          <View style={styles.resultRow}>
            <Text style={[styles.rl, { color: colors.textSecondary }]}>Intereses</Text>
            <Text style={[styles.rv, { color: colors.green }]}>${result.interest.toFixed(2)}</Text>
          </View>
          <View style={[styles.sep, { backgroundColor: colors.border }]} />
          <View style={styles.resultRow}>
            <Text style={[styles.rl, { color: colors.textSecondary }]}>Total</Text>
            <Text style={[styles.rv, { color: colors.amber }]}>${result.total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <View style={styles.grid}>
        {KEYPAD.map((row, ri) => (
          <View key={ri} style={styles.krow}>
            {row.map((k, ki) => {
              const isAct = ['c', 'bs'].includes(k.id);
              return (
                <TouchableOpacity
                  key={ki}
                  style={[styles.btn, { backgroundColor: colors.bgCard, width: BW, height: BH }]}
                  activeOpacity={0.6}
                  onPress={() => {
                    if (k.id === 'c') handleClear();
                    else if (k.id === 'bs') handleBackspace();
                    else if (k.label) handleDigit(k.label);
                  }}
                >
                  {k.icon ? (
                    <Ionicons name={k.icon as any} size={BW * 0.35} color={isAct ? colors.amber : colors.textPrimary} />
                  ) : (
                    <Text style={[styles.btnText, { color: isAct ? colors.amber : colors.textPrimary }]}>{k.label}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const KEYPAD = [
  [{ id: 'c', label: 'C' }, { id: 'bs', label: '', icon: 'backspace-outline' }, { id: '.', label: '.' }, { id: 'x', label: '' }],
  [{ id: '7', label: '7' }, { id: '8', label: '8' }, { id: '9', label: '9' }, { id: 'x2', label: '' }],
  [{ id: '4', label: '4' }, { id: '5', label: '5' }, { id: '6', label: '6' }, { id: 'x3', label: '' }],
  [{ id: '1', label: '1' }, { id: '2', label: '2' }, { id: '3', label: '3' }, { id: 'x4', label: '' }],
  [{ id: '00', label: '00' }, { id: '0', label: '0' }, { id: 'x5', label: '' }, { id: 'x6', label: '' }],
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  field: { borderRadius: radii.md, paddingVertical: 12, paddingHorizontal: spacing.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: 'transparent' },
  fieldLabel: { fontSize: 12, fontFamily: typography.mono },
  fieldValue: { fontSize: 24, fontFamily: typography.sans, fontWeight: '300', marginTop: 2 },
  resultCard: { borderRadius: radii.xl, padding: spacing.xl, marginTop: spacing.sm },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  rl: { fontSize: 15, fontFamily: typography.sans },
  rv: { fontSize: 20, fontFamily: typography.sans, fontWeight: '500' },
  sep: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
  grid: { padding: PAD, gap: GAP },
  krow: { flexDirection: 'row', gap: GAP, justifyContent: 'center' },
  btn: { borderRadius: radii.xl, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 22, fontFamily: typography.sans, includeFontPadding: false },
});
