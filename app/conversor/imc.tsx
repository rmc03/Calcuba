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
    if (d === '00' && cur === '0') return;
    if (cur === '0' && d !== '.' && d !== '00') { setter(d); return; }
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
          accessibilityLabel={`Peso: ${weight} kilogramos`}
          accessibilityRole="button"
          accessibilityState={{ selected: editing === 'weight' }}
        >
          <Text style={[styles.fl, { color: colors.textSecondary }]}>Peso (kg)</Text>
          <Text style={[styles.fv, { color: editing === 'weight' ? colors.amber : colors.textPrimary, fontVariant: ['tabular-nums'] }]} selectable>{weight} kg</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.field, editing === 'height' && { borderColor: colors.amber, borderWidth: 1 }]}
          onPress={() => setEditing('height')}
          accessibilityLabel={`Estatura: ${height} centímetros`}
          accessibilityRole="button"
          accessibilityState={{ selected: editing === 'height' }}
        >
          <Text style={[styles.fl, { color: colors.textSecondary }]}>Estatura (cm)</Text>
          <Text style={[styles.fv, { color: editing === 'height' ? colors.amber : colors.textPrimary, fontVariant: ['tabular-nums'] }]} selectable>{height} cm</Text>
        </TouchableOpacity>

        <View style={[styles.resultCard, { backgroundColor: colors.bgCard, borderCurve: 'continuous' as any }]}>
          <Text style={[styles.bmiValue, { color: bmi.color, fontVariant: ['tabular-nums'] }]} selectable>{bmi.value.toFixed(1)}</Text>
          <Text style={[styles.bmiLabel, { color: bmi.color }]}>{bmi.label}</Text>
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
  content: { paddingHorizontal: spacing.lg, gap: spacing.md },
  field: { borderRadius: radii.md, paddingVertical: 14, paddingHorizontal: spacing.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: 'transparent' },
  fl: { fontSize: 12, fontFamily: typography.sans, letterSpacing: 0.5 },
  fv: { fontSize: 26, fontFamily: typography.sans, fontWeight: '300', marginTop: 2 },
  resultCard: { borderRadius: radii.xl, padding: spacing.xxl, alignItems: 'center', marginTop: spacing.md },
  bmiValue: { fontSize: 52, fontFamily: typography.sans, fontWeight: '300' },
  bmiLabel: { fontSize: 18, fontFamily: typography.sans, fontWeight: '500', marginTop: 4 },
});
