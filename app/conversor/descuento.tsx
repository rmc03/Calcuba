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
const PAD = 14;
const GAP = 10;
const BW = (Math.min(SW, 400) - PAD * 2 - GAP * 3) / 4;
const BH = BW * 0.88;

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
    if (current === '0' && d !== '.') { setter(d); return; }
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
        >
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Precio original</Text>
          <Text style={[styles.fieldValue, { color: colors.amber }]}>${price}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.field, editing === 'discount' && { borderColor: colors.amber, borderWidth: 1 }]}
          onPress={() => setEditing('discount')}
        >
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Descuento %</Text>
          <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{discount}%</Text>
        </TouchableOpacity>

        <View style={[styles.resultCard, { backgroundColor: colors.bgCard }]}>
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Ahorras</Text>
            <Text style={[styles.resultVal, { color: colors.green }]}>${saved.saved.toFixed(2)}</Text>
          </View>
          <View style={[styles.resultSep, { backgroundColor: colors.border }]} />
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Precio final</Text>
            <Text style={[styles.resultVal, { color: colors.amber }]}>${saved.final.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      {/* Keypad */}
      <View style={styles.grid}>
        {KEYPAD.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((k, ki) => {
              const isAction = ['c', 'bs'].includes(k.id);
              const bg = colors.bgCard;
              const fg = isAction ? colors.amber : colors.textPrimary;
              return (
                <TouchableOpacity
                  key={ki}
                  style={[styles.btn, { backgroundColor: bg, width: BW, height: BH }]}
                  activeOpacity={0.6}
                  onPress={() => {
                    if (k.id === 'c') handleClear();
                    else if (k.id === 'bs') handleBackspace();
                    else handleDigit(k.label);
                  }}
                >
                  {k.icon ? (
                    <Ionicons name={k.icon as any} size={BW * 0.35} color={fg} />
                  ) : (
                    <Text style={[styles.btnText, { color: fg }]}>{k.label}</Text>
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
  [{ id: 'c', label: 'C' }, { id: 'bs', label: '', icon: 'backspace-outline' }, { id: '.', label: '.' }, { id: 'noop', label: '' }],
  [{ id: '7', label: '7' }, { id: '8', label: '8' }, { id: '9', label: '9' }, { id: 'noop2', label: '' }],
  [{ id: '4', label: '4' }, { id: '5', label: '5' }, { id: '6', label: '6' }, { id: 'noop3', label: '' }],
  [{ id: '1', label: '1' }, { id: '2', label: '2' }, { id: '3', label: '3' }, { id: 'noop4', label: '' }],
  [{ id: '00', label: '00' }, { id: '0', label: '0' }, { id: 'noop5', label: '' }, { id: 'noop6', label: '' }],
];

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
  fieldLabel: { fontSize: 12, fontFamily: typography.mono },
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
  grid: { padding: PAD, gap: GAP },
  row: { flexDirection: 'row', gap: GAP, justifyContent: 'center' },
  btn: { borderRadius: radii.xl, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 22, fontFamily: typography.sans, includeFontPadding: false },
});
