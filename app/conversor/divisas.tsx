import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  Pressable,
  ActivityIndicator,
  Platform,
  ToastAndroid,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import SubScreenHeader from '../../components/SubScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { typography, radii, spacing } from '../../constants/theme';
import { useRates } from '../../hooks/useRates';
import { formatNumber } from '../../utils/format';
import NumericKeypad from '../../components/NumericKeypad';
import type { Rates } from '../../constants/rates';

// ─── TYPES ───────────────────────────────────────────────────
interface CurrencyDef {
  id: string;
  label: string;
  symbol: string;
}

const CURRENCIES: CurrencyDef[] = [
  { id: 'cup', label: 'Peso cubano', symbol: 'CUP' },
  { id: 'usd', label: 'Dólar estadounidense', symbol: 'USD' },
  { id: 'eur', label: 'Euro', symbol: 'EUR' },
  { id: 'mlc', label: 'MLC', symbol: 'MLC' },
];

function getRate(id: string, rates: Rates): number {
  if (id === 'cup') return 1;
  if (id === 'usd') return rates.USD;
  if (id === 'eur') return rates.EUR;
  if (id === 'mlc') return rates.MLC;
  return 1;
}

// ─── COMPONENT ───────────────────────────────────────────────
export default function Divisas() {
  const { colors } = useTheme();
  const { rates, loading, status, isLive, refresh } = useRates();

  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [extraIdx, setExtraIdx] = useState(2);
  const [input, setInput] = useState('1');
  const [picker, setPicker] = useState<'from' | 'to' | 'extra' | null>(null);

  const fromCurr = CURRENCIES[fromIdx];
  const toCurr = CURRENCIES[toIdx];
  const extraCurr = CURRENCIES[extraIdx];

  // Conversion using primitive deps for correct memoization
  const result = useMemo(() => {
    const n = parseFloat(input);
    if (isNaN(n) || input === '') return '';
    const fromRate = getRate(fromCurr.id, rates);
    const toRate = getRate(toCurr.id, rates);
    return formatNumber((n * fromRate) / toRate);
  }, [input, fromCurr.id, toCurr.id, rates.USD, rates.EUR, rates.MLC]);

  const extraResult = useMemo(() => {
    const n = parseFloat(input);
    if (isNaN(n) || input === '') return '';
    const fromRate = getRate(fromCurr.id, rates);
    const toRate = getRate(extraCurr.id, rates);
    return formatNumber((n * fromRate) / toRate);
  }, [input, fromCurr.id, extraCurr.id, rates.USD, rates.EUR, rates.MLC]);

  // Keypad
  const handleDigit = (d: string) => {
    if (d === '.' && input.includes('.')) return;
    if (input === '0' && d !== '.') { setInput(d); return; }
    setInput(input + d);
  };
  const handleClear = () => setInput('0');
  const handleBackspace = () => {
    if (input.length <= 1) { setInput('0'); return; }
    setInput(input.slice(0, -1));
  };
  const swap = () => { const f = fromIdx; setFromIdx(toIdx); setToIdx(f); };
  const selectUnit = (idx: number) => {
    if (picker === 'from') setFromIdx(idx);
    else if (picker === 'to') setToIdx(idx);
    else if (picker === 'extra') setExtraIdx(idx);
    setPicker(null);
  };

  const activeIdx = picker === 'from' ? fromIdx : picker === 'extra' ? extraIdx : toIdx;

  const copyToClipboard = async (val: string) => {
    if (!val || val === 'Error') return;
    await Clipboard.setStringAsync(val);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (Platform.OS === 'android') {
      ToastAndroid.show(`Copiado: ${val}`, ToastAndroid.SHORT);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <SubScreenHeader title="Divisas" />

      {/* Status */}
      <View style={[styles.statusRow, { borderColor: isLive ? colors.green : colors.amber }]}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.amber} />
        ) : (
          <View style={[styles.dot, { backgroundColor: isLive ? colors.green : colors.amber }]} />
        )}
        <Text style={[styles.statusText, { color: colors.textSecondary }]} numberOfLines={1} selectable>
          {loading ? 'Actualizando tasas...' : status}
        </Text>
        <TouchableOpacity
          onPress={refresh}
          disabled={loading}
          style={styles.refreshBtn}
          accessibilityLabel="Actualizar tasas"
          accessibilityRole="button"
        >
          <Ionicons name="refresh" size={18} color={loading ? colors.textTertiary : colors.amber} />
        </TouchableOpacity>
      </View>

      {/* Unit rows */}
      <View style={styles.unitSection}>
        <TouchableOpacity style={styles.unitRow} onPress={() => setPicker('from')} onLongPress={() => copyToClipboard(input)} activeOpacity={0.6} accessibilityLabel={`Desde ${fromCurr.label}: ${input}`}>
          <View style={styles.unitLeft}>
            <Text style={[styles.unitLabel, { color: colors.textPrimary }]}>{fromCurr.label}</Text>
            <Text style={[styles.unitSymbol, { color: colors.textSecondary }]}> {fromCurr.symbol}</Text>
            <Ionicons name="chevron-expand-outline" size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
          </View>
          <Text style={[styles.unitValue, { color: colors.amber, fontVariant: ['tabular-nums'] }]} numberOfLines={1} adjustsFontSizeToFit selectable>{input || '0'}</Text>
        </TouchableOpacity>

        <View style={[styles.sep, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.unitRow} onPress={() => setPicker('to')} onLongPress={() => copyToClipboard(result)} activeOpacity={0.6} accessibilityLabel={`A ${toCurr.label}: ${result}`}>
          <View style={styles.unitLeft}>
            <Text style={[styles.unitLabel, { color: colors.textPrimary }]}>{toCurr.label}</Text>
            <Text style={[styles.unitSymbol, { color: colors.textSecondary }]}> {toCurr.symbol}</Text>
            <Ionicons name="chevron-expand-outline" size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
          </View>
          <Text style={[styles.unitValue, { color: colors.textPrimary, fontVariant: ['tabular-nums'] }]} numberOfLines={1} adjustsFontSizeToFit selectable>{result}</Text>
        </TouchableOpacity>

        <View style={[styles.sep, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.unitRow} onPress={() => setPicker('extra')} onLongPress={() => copyToClipboard(extraResult)} activeOpacity={0.6} accessibilityLabel={`Extra ${extraCurr.label}: ${extraResult}`}>
          <View style={styles.unitLeft}>
            <Text style={[styles.unitLabel, { color: colors.textPrimary }]}>{extraCurr.label}</Text>
            <Text style={[styles.unitSymbol, { color: colors.textSecondary }]}> {extraCurr.symbol}</Text>
            <Ionicons name="chevron-expand-outline" size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
          </View>
          <Text style={[styles.unitValue, { color: colors.textPrimary, fontVariant: ['tabular-nums'] }]} numberOfLines={1} adjustsFontSizeToFit selectable>{extraResult}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.rateInfo, { color: colors.textTertiary }]}>
        Fuente: mdiv.pro · mercado informal
      </Text>

      <View style={{ flex: 1 }} />

      {/* Keypad */}
      <NumericKeypad
        onDigit={handleDigit}
        onClear={handleClear}
        onBackspace={handleBackspace}
        onSwap={swap}
        showOperators={true}
      />

      {/* Dropdown */}
      <Modal visible={picker !== null} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setPicker(null)}>
          <View style={[styles.dropdown, { backgroundColor: colors.bgCard }]}>
            <ScrollView bounces={false}>
              {CURRENCIES.map((u, i) => {
                const isSelected = i === activeIdx;
                return (
                  <TouchableOpacity
                    key={u.id}
                    style={[styles.ddItem, isSelected && { backgroundColor: colors.amber }]}
                    activeOpacity={0.7}
                    onPress={() => selectUnit(i)}
                    accessibilityLabel={`${u.label} ${u.symbol}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.ddLabel, { color: isSelected ? '#fff' : colors.textPrimary }]}>
                        {u.label}
                      </Text>
                      <Text style={[styles.ddSymbol, { color: isSelected ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
                        {u.symbol}
                        {u.id !== 'cup' ? ` · 1 ${u.symbol} = ${getRate(u.id, rates)} CUP` : ''}
                      </Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark" size={22} color="#fff" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: radii.md, borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontFamily: typography.sans, flex: 1 },
  refreshBtn: { padding: 4 },
  unitSection: { paddingHorizontal: spacing.lg },
  unitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18 },
  unitLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  unitLabel: { fontSize: 16, fontFamily: typography.sans },
  unitSymbol: { fontSize: 13, fontFamily: typography.sans },
  unitValue: { fontSize: 26, fontFamily: typography.sans, fontWeight: '300', marginLeft: 12 },
  sep: { height: StyleSheet.hairlineWidth },
  rateInfo: { fontSize: 11, fontFamily: typography.sans, textAlign: 'center', marginTop: spacing.md },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-start', paddingTop: 80, paddingHorizontal: 24 },
  dropdown: { borderRadius: radii.xl, maxHeight: 420, overflow: 'hidden' },
  ddItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  ddLabel: { fontSize: 16, fontFamily: typography.sans, fontWeight: '500' },
  ddSymbol: { fontSize: 12, fontFamily: typography.sans, marginTop: 2 },
});
