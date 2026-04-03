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

export default function Descuento() {
  const { colors } = useTheme();
  const [price, setPrice] = useState('100');
  const [discount, setDiscount] = useState('10');
  const [editing, setEditing] = useState<'price' | 'discount'>('price');

  const saved = useMemo(() => {
    const p = parseFloat(price) || 0;
    const d = parseFloat(discount) || 0;
    return { saved: p * d / 100, final: p - p * d / 100 };
  }, [price, discount]);

  const handleDigit = (d: string) => {
    const setter = editing === 'price' ? setPrice : setDiscount;
    const current = editing === 'price' ? price : discount;
    if (d === '.' && current.includes('.')) return;
    if (d === '00' && current === '0') return;
    if (current === '0' && d !== '.' && d !== '00') { setter(d); return; }
    setter(current + d);
  };
  const handleClear = () => { setPrice('0'); setDiscount('0'); };
  const handleBackspace = () => {
    const setter = editing === 'price' ? setPrice : setDiscount;
    const current = editing === 'price' ? price : discount;
    if (current.length <= 1) { setter('0'); return; }
    setter(current.slice(0, -1));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <SubScreenHeader title="Descuento" />

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.field, editing === 'price' && { borderColor: colors.amber, borderWidth: 1 }]}
          onPress={() => setEditing('price')}
          accessibilityLabel={`Precio original: ${price}`}
          accessibilityRole="button"
          accessibilityState={{ selected: editing === 'price' }}
        >
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Precio original</Text>
          <Text style={[styles.fieldValue, { color: colors.amber, fontVariant: ['tabular-nums'] }]} selectable>${price}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.field, editing === 'discount' && { borderColor: colors.amber, borderWidth: 1 }]}
          onPress={() => setEditing('discount')}
          accessibilityLabel={`Descuento: ${discount}%`}
          accessibilityRole="button"
          accessibilityState={{ selected: editing === 'discount' }}
        >
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Descuento %</Text>
          <Text style={[styles.fieldValue, { color: colors.textPrimary, fontVariant: ['tabular-nums'] }]} selectable>{discount}%</Text>
        </TouchableOpacity>

        <View style={[styles.resultCard, { backgroundColor: colors.bgCard, borderCurve: 'continuous' as any }]}>
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Ahorras</Text>
            <Text style={[styles.resultVal, { color: colors.green, fontVariant: ['tabular-nums'] }]} selectable>${saved.saved.toFixed(2)}</Text>
          </View>
          <View style={[styles.resultSep, { backgroundColor: colors.border }]} />
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Precio final</Text>
            <Text style={[styles.resultVal, { color: colors.amber, fontVariant: ['tabular-nums'] }]} selectable>${saved.final.toFixed(2)}</Text>
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
  content: { paddingHorizontal: spacing.lg, gap: spacing.md },
  field: {
    borderRadius: radii.md,
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  fieldLabel: { fontSize: 12, fontFamily: typography.sans, letterSpacing: 0.5 },
  fieldValue: { fontSize: 28, fontFamily: typography.sans, fontWeight: '300', marginTop: 4 },
  resultCard: { borderRadius: radii.xl, padding: spacing.xl, marginTop: spacing.md },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultLabel: { fontSize: 15, fontFamily: typography.sans },
  resultVal: { fontSize: 22, fontFamily: typography.sans, fontWeight: '500' },
  resultSep: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
});
