import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import SubScreenHeader from '../../components/SubScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing } from '../../constants/theme';
import * as Haptics from 'expo-haptics';

const { width: SW } = Dimensions.get('window');
const GRID_PAD = 14;
const BTN_GAP = 10;
const BTN_W = (Math.min(SW, 400) - GRID_PAD * 2 - BTN_GAP * 3) / 4;
const BTN_H = BTN_W;

const KEYPAD = [
  [{ id: 'c', label: 'C', icon: '' }, { id: 'm', label: 'M', icon: '' }, { id: 'd', label: 'D', icon: '' }, { id: 'bs', label: '', icon: 'backspace-outline' }],
  [{ id: '7', label: '7', icon: '' }, { id: '8', label: '8', icon: '' }, { id: '9', label: '9', icon: '' }, { id: 'usd', label: '$', icon: '' }],
  [{ id: '4', label: '4', icon: '' }, { id: '5', label: '5', icon: '' }, { id: '6', label: '6', icon: '' }, { id: 'eur', label: '€', icon: '' }],
  [{ id: '1', label: '1', icon: '' }, { id: '2', label: '2', icon: '' }, { id: '3', label: '3', icon: '' }, { id: 'mlc', label: 'M', icon: '' }],
  [{ id: '00', label: '00', icon: '' }, { id: '0', label: '0', icon: '' }, { id: '.', label: '.', icon: '' }, { id: 'cup', label: 'CUP', icon: '' }],
];

// Reusing denominations for breakdown
const BILLETES = [5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 3, 1];

interface Rates {
  USD: number;
  EUR: number;
  MLC: number;
}

const FALLBACK_RATES = { USD: 320, EUR: 330, MLC: 270 };

function getBreakdown(cupAmount: number) {
  let rem = Math.floor(cupAmount);
  const res: { val: number, c: number }[] = [];
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
  const [input, setInput] = useState('');
  const [currency, setCurrency] = useState<'CUP' | 'USD' | 'EUR' | 'MLC'>('MLC');
  const [rates, setRates] = useState<Rates>(FALLBACK_RATES);
  const [hasRates, setHasRates] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('calcuba_rates').then(str => {
      if (str) {
        try {
          const parsed = JSON.parse(str);
          if (parsed && typeof parsed.USD === 'number') {
            setRates(parsed);
            setHasRates(true);
          }
        } catch {}
      }
    });
  }, []);

  const val = parseFloat(input);
  const isValid = !isNaN(val) && val > 0;

  // Convert to CUP first as base
  const cupBase = useMemo(() => {
    if (!isValid) return 0;
    if (currency === 'CUP') return val;
    if (currency === 'USD') return val * rates.USD;
    if (currency === 'EUR') return val * rates.EUR;
    if (currency === 'MLC') return val * rates.MLC;
    return 0;
  }, [val, currency, rates, isValid]);

  const equivalents = {
    CUP: cupBase,
    USD: cupBase / rates.USD,
    EUR: cupBase / rates.EUR,
    MLC: cupBase / rates.MLC,
  };

  const handleDigit = (d: string) => {
    if (d === '.' && input.includes('.')) return;
    if (input === '0' && d !== '.') { setInput(d); return; }
    if (d === '00' && input === '0') return;
    setInput(input + d);
  };
  const handleClear = () => setInput('');
  const handleBackspace = () => setInput(input.slice(0, -1));

  const handleKeyPress = (btn: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (btn.id === 'c') handleClear();
    else if (btn.id === 'bs') handleBackspace();
    else if (['cup', 'usd', 'eur', 'mlc'].includes(btn.id)) setCurrency(btn.id.toUpperCase() as any);
    else if (!['m', 'd'].includes(btn.id)) handleDigit(btn.label);
  };

  const activeColor = colors.amber;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <SubScreenHeader title="Precios" />
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {!hasRates && (
          <View style={[styles.warningBanner, { backgroundColor: colors.amber + '22' }]}>
            <Ionicons name="warning-outline" size={16} color={colors.amber} />
            <Text style={[styles.warningText, { color: colors.amber }]}>No hay tasas actualizadas. Conéctate a internet desde Divisas.</Text>
          </View>
        )}

        {/* Main Input */}
        <View style={styles.inputArea}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Precio a comparar:</Text>
          <View style={styles.inputRow}>
            <Text style={[styles.inputText, { color: isValid ? colors.textPrimary : colors.textTertiary }]} numberOfLines={1} adjustsFontSizeToFit>
              {isValid ? input : '0'}
            </Text>
            <View style={[styles.currencyTag, { backgroundColor: activeColor }]}>
              <Text style={styles.currencyTagText}>{currency}</Text>
            </View>
          </View>
        </View>

        {isValid && (
          <View style={[styles.resultsCard, { backgroundColor: colors.bgCard }]}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>EQUIVALENCIAS</Text>
            {(['CUP', 'USD', 'EUR', 'MLC'] as const).filter(c => c !== currency).map((c) => (
              <View key={c} style={[styles.equivRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.equivCur, { color: colors.textSecondary }]}>{c}</Text>
                <Text style={[styles.equivVal, { color: colors.textPrimary }]}>
                  {c === 'CUP' ? `$${equivalents[c].toLocaleString('en-US')}` : equivalents[c].toFixed(2)}
                </Text>
              </View>
            ))}

            <Text style={[styles.sectionHeading, { color: colors.textSecondary, marginTop: spacing.xl }]}>
              BILLETES NECESARIOS (CUP)
            </Text>
            {getBreakdown(cupBase).map(({ val, c }, i, a) => (
              <View key={val} style={[styles.breakdownRow, i < a.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                <Text style={[styles.breakdownLabel, { color: colors.textPrimary }]}>{c}× ${val.toLocaleString('en-US')}</Text>
                <Text style={[styles.breakdownSub, { color: colors.textTertiary }]}>= ${(c * val).toLocaleString('en-US')}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Keypad */}
      <View style={[styles.grid, { backgroundColor: colors.bgDeep }]}>
        {KEYPAD.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((k, ki) => {
              const isCur = ['cup', 'usd', 'eur', 'mlc'].includes(k.id);
              const isActiveCur = isCur && currency.toLowerCase() === k.id;
              const isAction = ['c', 'bs'].includes(k.id);
              
              const bg = isActiveCur ? colors.amber : isAction ? colors.bgCard : colors.bg;
              const fg = isActiveCur ? '#000' : isCur ? colors.amber : isAction ? colors.amber : colors.textPrimary;
              
              const empty = ['m', 'd'].includes(k.id); // Placeholder for layout
              if (empty) return <View key={ki} style={{ width: BTN_W, height: BTN_H, margin: BTN_GAP / 2 }} />;
              
              return (
                <TouchableOpacity
                  key={ki}
                  style={[styles.btn, { backgroundColor: bg, width: BTN_W, height: BTN_H }]}
                  activeOpacity={0.6}
                  onPress={() => handleKeyPress(k)}
                >
                  {k.icon ? (
                    <Ionicons name={k.icon as any} size={BTN_W * 0.35} color={fg} />
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  warningText: {
    fontSize: 13,
    fontFamily: typography.sans,
    flex: 1,
  },
  inputArea: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: typography.sans,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 48,
    fontFamily: typography.mono,
    flex: 1,
    marginRight: spacing.sm,
  },
  currencyTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  currencyTagText: {
    fontSize: 18,
    fontFamily: typography.sans,
    fontWeight: 'bold',
    color: '#000',
  },
  resultsCard: {
    borderRadius: 16,
    padding: spacing.lg,
  },
  sectionHeading: {
    fontSize: 12,
    fontFamily: typography.mono,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  equivRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  equivCur: {
    fontSize: 18,
    fontFamily: typography.sans,
    fontWeight: '500',
  },
  equivVal: {
    fontSize: 20,
    fontFamily: typography.mono,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  breakdownLabel: {
    fontSize: 16,
    fontFamily: typography.sans,
  },
  breakdownSub: {
    fontSize: 16,
    fontFamily: typography.mono,
  },
  // Keypad
  grid: {
    padding: GRID_PAD,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  btn: {
    margin: BTN_GAP / 2,
    borderRadius: BTN_W / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 22,
    fontFamily: typography.sans,
    fontWeight: '500',
  },
});
