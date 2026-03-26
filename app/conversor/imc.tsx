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

export default function IMC() {
  const { colors } = useTheme();
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [editing, setEditing] = useState<'weight' | 'height'>('weight');

  const bmi = useMemo(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    if (h === 0) return { value: 0, label: '—', color: '#888' };
    const val = w / Math.pow(h / 100, 2);
    let label = 'Bajo peso';
    let color = '#3498db';
    if (val >= 18.5 && val < 25) { label = 'Normal'; color = '#2ecc71'; }
    else if (val >= 25 && val < 30) { label = 'Sobrepeso'; color = '#f39c12'; }
    else if (val >= 30) { label = 'Obesidad'; color = '#e74c3c'; }
    return { value: val, label, color };
  }, [weight, height]);

  const handleDigit = (d: string) => {
    const setter = editing === 'weight' ? setWeight : setHeight;
    const cur = editing === 'weight' ? weight : height;
    if (d === '.' && cur.includes('.')) return;
    if (cur === '0' && d !== '.') { setter(d); return; }
    setter(cur + d);
  };
  const handleClear = () => { setWeight('0'); setHeight('0'); };
  const handleBackspace = () => {
    const setter = editing === 'weight' ? setWeight : setHeight;
    const cur = editing === 'weight' ? weight : height;
    if (cur.length <= 1) { setter('0'); return; }
    setter(cur.slice(0, -1));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <SubScreenHeader title="IMC" />

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.field, editing === 'weight' && { borderColor: colors.amber, borderWidth: 1 }]}
          onPress={() => setEditing('weight')}
        >
          <Text style={[styles.fl, { color: colors.textSecondary }]}>Peso (kg)</Text>
          <Text style={[styles.fv, { color: editing === 'weight' ? colors.amber : colors.textPrimary }]}>{weight} kg</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.field, editing === 'height' && { borderColor: colors.amber, borderWidth: 1 }]}
          onPress={() => setEditing('height')}
        >
          <Text style={[styles.fl, { color: colors.textSecondary }]}>Estatura (cm)</Text>
          <Text style={[styles.fv, { color: editing === 'height' ? colors.amber : colors.textPrimary }]}>{height} cm</Text>
        </TouchableOpacity>

        <View style={[styles.resultCard, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.bmiValue, { color: bmi.color }]}>{bmi.value.toFixed(1)}</Text>
          <Text style={[styles.bmiLabel, { color: bmi.color }]}>{bmi.label}</Text>
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
  content: { paddingHorizontal: spacing.lg, gap: spacing.md },
  field: { borderRadius: radii.md, paddingVertical: 14, paddingHorizontal: spacing.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: 'transparent' },
  fl: { fontSize: 12, fontFamily: typography.mono },
  fv: { fontSize: 26, fontFamily: typography.sans, fontWeight: '300', marginTop: 2 },
  resultCard: { borderRadius: radii.xl, padding: spacing.xxl, alignItems: 'center', marginTop: spacing.md },
  bmiValue: { fontSize: 52, fontFamily: typography.sans, fontWeight: '300' },
  bmiLabel: { fontSize: 18, fontFamily: typography.sans, fontWeight: '500', marginTop: 4 },
  grid: { padding: PAD, gap: GAP },
  krow: { flexDirection: 'row', gap: GAP, justifyContent: 'center' },
  btn: { borderRadius: radii.xl, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 22, fontFamily: typography.sans, includeFontPadding: false },
});
