import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import SubScreenHeader from '../../components/SubScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing, radii } from '../../constants/theme';
import { useRates } from '../../hooks/useRates';

const BILLETES = [5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 3, 1];

function getBreakdown(cupAmount: number) {
  let rem = Math.floor(cupAmount);
  const res: { val: number; c: number }[] = [];
  for (const b of BILLETES) {
    if (rem >= b) {
      const c = Math.floor(rem / b);
      res.push({ val: b, c });
      rem = rem % b;
    }
  }
  return res;
}

export default function Precios() {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [input, setInput] = useState('');
  const [currency, setCurrency] = useState<'CUP' | 'USD' | 'EUR' | 'MLC'>('MLC');
  const { rates, isLive, status } = useRates();

  const val = parseFloat(input);
  const isValid = !isNaN(val) && val > 0;

  const cupBase = useMemo(() => {
    if (!isValid) return 0;
    if (currency === 'CUP') return val;
    if (currency === 'USD') return val * rates.USD;
    if (currency === 'EUR') return val * rates.EUR;
    if (currency === 'MLC') return val * rates.MLC;
    return 0;
  }, [val, currency, rates.USD, rates.EUR, rates.MLC, isValid]);

  const equivalents = {
    CUP: cupBase,
    USD: rates.USD > 0 ? cupBase / rates.USD : 0,
    EUR: rates.EUR > 0 ? cupBase / rates.EUR : 0,
    MLC: rates.MLC > 0 ? cupBase / rates.MLC : 0,
  };

  const handleDigit = (d: string) => {
    if (d === '.' && input.includes('.')) return;
    if (input === '0' && d !== '.') { setInput(d); return; }
    if (d === '00' && input === '0') return;
    setInput(input + d);
  };
  const handleClear = () => setInput('');
  const handleBackspace = () => setInput(input.slice(0, -1));

  const haptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Keypad
  const GRID_PAD = 14;
  const BTN_GAP = 10;
  const BTN_W = (Math.min(screenWidth, 400) - GRID_PAD * 2 - BTN_GAP * 3) / 4;
  const BTN_H = BTN_W;

  const KEYPAD = [
    [{ id: 'c', label: 'C' }, { id: 'bs', label: '', icon: 'backspace-outline' }, { id: '.', label: '.' }, { id: 'usd', label: '$' }],
    [{ id: '7', label: '7' }, { id: '8', label: '8' }, { id: '9', label: '9' }, { id: 'eur', label: '€' }],
    [{ id: '4', label: '4' }, { id: '5', label: '5' }, { id: '6', label: '6' }, { id: 'mlc', label: 'MLC' }],
    [{ id: '1', label: '1' }, { id: '2', label: '2' }, { id: '3', label: '3' }, { id: 'cup', label: 'CUP' }],
    [{ id: '00', label: '00' }, { id: '0', label: '0' }],
  ];

  const handleKeyPress = (btn: any) => {
    haptic();
    if (btn.id === 'c') handleClear();
    else if (btn.id === 'bs') handleBackspace();
    else if (['cup', 'usd', 'eur', 'mlc'].includes(btn.id)) setCurrency(btn.id.toUpperCase() as any);
    else handleDigit(btn.label);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <SubScreenHeader title="Precios" />
      <ScrollView contentContainerStyle={styles.scroll}>

        {!isLive && (
          <View style={[styles.warningBanner, { backgroundColor: colors.amber + '22' }]}>
            <Ionicons name="warning-outline" size={16} color={colors.amber} />
            <Text style={[styles.warningText, { color: colors.amber }]}>
              Usando tasas estimadas. Abre Divisas para actualizar.
            </Text>
          </View>
        )}

        {/* Main Input */}
        <View style={styles.inputArea}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Precio a comparar:</Text>
          <View style={styles.inputRow}>
            <Text
              style={[styles.inputText, { color: isValid ? colors.textPrimary : colors.textTertiary, fontVariant: ['tabular-nums'] }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              selectable
            >
              {isValid ? input : '0'}
            </Text>
            <View style={[styles.currencyTag, { backgroundColor: colors.amber, borderCurve: 'continuous' as any }]}>
              <Text style={styles.currencyTagText}>{currency}</Text>
            </View>
          </View>
        </View>

        {isValid && (
          <View style={[styles.resultsCard, { backgroundColor: colors.bgCard, borderCurve: 'continuous' as any }]}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>EQUIVALENCIAS</Text>
            {(['CUP', 'USD', 'EUR', 'MLC'] as const).filter(c => c !== currency).map(c => (
              <View key={c} style={[styles.equivRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.equivCur, { color: colors.textSecondary }]}>{c}</Text>
                <Text style={[styles.equivVal, { color: colors.textPrimary, fontVariant: ['tabular-nums'] }]} selectable>
                  {c === 'CUP' ? `$${equivalents[c].toLocaleString('en-US')}` : equivalents[c].toFixed(2)}
                </Text>
              </View>
            ))}

            <Text style={[styles.sectionHeading, { color: colors.textSecondary, marginTop: spacing.xl }]}>
              BILLETES NECESARIOS (CUP)
            </Text>
            {getBreakdown(cupBase).map(({ val: v, c }, i, a) => (
              <View key={v} style={[styles.breakdownRow, i < a.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                <Text style={[styles.breakdownLabel, { color: colors.textPrimary }]}>{c}× ${v.toLocaleString('en-US')}</Text>
                <Text style={[styles.breakdownSub, { color: colors.textTertiary, fontVariant: ['tabular-nums'] }]}>= ${(c * v).toLocaleString('en-US')}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Keypad */}
      <View style={[styles.grid, { backgroundColor: colors.bgDeep, padding: GRID_PAD, gap: BTN_GAP }]}>
        {KEYPAD.map((row, ri) => (
          <View key={ri} style={[styles.row, { gap: BTN_GAP }]}>
            {row.map((k, ki) => {
              const isCur = ['cup', 'usd', 'eur', 'mlc'].includes(k.id);
              const isActiveCur = isCur && currency.toLowerCase() === k.id;
              const isAction = ['c', 'bs'].includes(k.id);
              const bg = isActiveCur ? colors.amber : colors.bgCard;
              const fg = isActiveCur ? '#000' : isCur ? colors.amber : isAction ? colors.amber : colors.textPrimary;
              return (
                <TouchableOpacity
                  key={ki}
                  style={[styles.btn, { backgroundColor: bg, width: BTN_W, height: BTN_H, borderRadius: BTN_W / 2, borderCurve: 'continuous' as any }]}
                  activeOpacity={0.6}
                  onPress={() => handleKeyPress(k)}
                  accessibilityLabel={k.id === 'bs' ? 'Borrar dígito' : k.id === 'c' ? 'Limpiar' : isCur ? `Moneda ${k.label}` : k.label}
                  accessibilityRole="button"
                >
                  {k.icon ? (
                    <Ionicons name={k.icon as keyof typeof Ionicons.glyphMap} size={BTN_W * 0.35} color={fg} />
                  ) : (
                    <Text style={[styles.btnText, { color: fg, fontSize: isCur ? 14 : 22 }]}>{k.label}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  warningBanner: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: 8, marginBottom: spacing.xl, gap: spacing.sm,
  },
  warningText: { fontSize: 13, fontFamily: typography.sans, flex: 1 },
  inputArea: { marginBottom: spacing.xl },
  inputLabel: { fontSize: 14, fontFamily: typography.sans, marginBottom: spacing.xs },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputText: { fontSize: 48, fontFamily: typography.sans, fontWeight: '300', flex: 1, marginRight: spacing.sm },
  currencyTag: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 8 },
  currencyTagText: { fontSize: 18, fontFamily: typography.sans, fontWeight: 'bold', color: '#000' },
  resultsCard: { borderRadius: 16, padding: spacing.lg },
  sectionHeading: { fontSize: 12, fontFamily: typography.sans, letterSpacing: 1, marginBottom: spacing.md },
  equivRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  equivCur: { fontSize: 18, fontFamily: typography.sans, fontWeight: '500' },
  equivVal: { fontSize: 20, fontFamily: typography.sans },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  breakdownLabel: { fontSize: 16, fontFamily: typography.sans },
  breakdownSub: { fontSize: 16, fontFamily: typography.sans },
  grid: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  row: { flexDirection: 'row', justifyContent: 'center' },
  btn: { alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: typography.sans, fontWeight: '500' },
});
