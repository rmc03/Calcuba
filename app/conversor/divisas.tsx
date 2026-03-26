import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import SubScreenHeader from '../../components/SubScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { typography, radii, spacing } from '../../constants/theme';

const STORAGE_KEY = 'calcuba_rates';
const API_URL = 'https://api.eltoque.com/v1/trm?date=today';

const { width: SW } = Dimensions.get('window');
const GRID_PAD = 14;
const BTN_GAP = 10;
const BTN_W = (Math.min(SW, 400) - GRID_PAD * 2 - BTN_GAP * 3) / 4;
const BTN_H = BTN_W * 0.88;

interface Rates {
  USD: number;
  EUR: number;
  MLC: number;
  timestamp?: string;
}

const DEFAULT_RATES: Rates = { USD: 300, EUR: 330, MLC: 280, timestamp: 'Estimadas' };

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

function formatResult(n: number): string {
  if (!isFinite(n)) return 'Error';
  const s = parseFloat(n.toPrecision(10)).toString();
  if (s.includes('e')) return n.toExponential(4);
  return s;
}

export default function Divisas() {
  const { colors } = useTheme();

  // Rates state
  const [rates, setRates] = useState<Rates>(DEFAULT_RATES);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Converter state
  const [fromIdx, setFromIdx] = useState(0); // CUP
  const [toIdx, setToIdx] = useState(1);     // USD
  const [input, setInput] = useState('1');
  const [picker, setPicker] = useState<'from' | 'to' | null>(null);

  const fromCurr = CURRENCIES[fromIdx];
  const toCurr = CURRENCIES[toIdx];

  // Fetch rates
  const loadCachedRates = async () => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Rates;
        if (parsed.USD && parsed.EUR && parsed.MLC) {
          setRates(parsed);
          setOffline(true);
          return true;
        }
      }
    } catch (_) {}
    return false;
  };

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setOffline(false);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const data = json?.data;
      if (!data) throw new Error('Respuesta inesperada');

      const newRates: Rates = {
        USD: typeof data.USD === 'number' ? data.USD : DEFAULT_RATES.USD,
        EUR: typeof data.EUR === 'number' ? data.EUR : DEFAULT_RATES.EUR,
        MLC: typeof data.MLC === 'number' ? data.MLC : DEFAULT_RATES.MLC,
        timestamp: new Date().toLocaleString('es-CU'),
      };
      setRates(newRates);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newRates));
    } catch (err) {
      setOffline(true);
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Sin conexión (${msg})`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCachedRates().then(() => fetchRates());
  }, []);

  // Conversion
  const result = useMemo(() => {
    const n = parseFloat(input);
    if (isNaN(n) || input === '') return '';
    const fromRate = getRate(fromCurr.id, rates);
    const toRate = getRate(toCurr.id, rates);
    return formatResult((n * fromRate) / toRate);
  }, [input, fromIdx, toIdx, rates]);

  // Keypad handlers
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
    else setToIdx(idx);
    setPicker(null);
  };

  const activeIdx = picker === 'from' ? fromIdx : toIdx;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <SubScreenHeader title="Divisas" />

      {/* Status bar */}
      <View style={[styles.statusRow, { borderColor: offline ? colors.amber : colors.border }]}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.amber} />
        ) : (
          <View style={[styles.dot, { backgroundColor: offline ? colors.amber : colors.green }]} />
        )}
        <Text style={[styles.statusText, { color: colors.textSecondary }]} numberOfLines={1}>
          {loading
            ? 'Actualizando tasas...'
            : offline
            ? error ?? 'Modo offline'
            : `Actualizado: ${rates.timestamp ?? ''}`}
        </Text>
        <TouchableOpacity onPress={fetchRates} disabled={loading} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={18} color={loading ? colors.textTertiary : colors.amber} />
        </TouchableOpacity>
      </View>

      {/* Unit rows */}
      <View style={styles.unitSection}>
        <TouchableOpacity style={styles.unitRow} onPress={() => setPicker('from')} activeOpacity={0.6}>
          <View style={styles.unitLeft}>
            <Text style={[styles.unitLabel, { color: colors.textPrimary }]}>{fromCurr.label}</Text>
            <Text style={[styles.unitSymbol, { color: colors.textSecondary }]}> {fromCurr.symbol}</Text>
            <Ionicons name="chevron-expand-outline" size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
          </View>
          <Text style={[styles.unitValue, { color: colors.amber }]}>{input || '0'}</Text>
        </TouchableOpacity>

        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.unitRow} onPress={() => setPicker('to')} activeOpacity={0.6}>
          <View style={styles.unitLeft}>
            <Text style={[styles.unitLabel, { color: colors.textPrimary }]}>{toCurr.label}</Text>
            <Text style={[styles.unitSymbol, { color: colors.textSecondary }]}> {toCurr.symbol}</Text>
            <Ionicons name="chevron-expand-outline" size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
          </View>
          <Text style={[styles.unitValue, { color: colors.textPrimary }]}>{result}</Text>
        </TouchableOpacity>
      </View>

      {/* Rate info */}
      {!loading && (
        <Text style={[styles.rateInfo, { color: colors.textTertiary }]}>
          Tasas informales · eltoque.com{offline ? ' (caché)' : ''}
        </Text>
      )}

      <View style={{ flex: 1 }} />

      {/* Keypad */}
      <View style={styles.grid}>
        {KEYPAD.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((k, ki) => {
              const isEq = k.id === 'eq';
              const isAction = ['c', 'bs', 'pct', 'div', 'mul', 'sub', 'add'].includes(k.id);
              const bg = isEq ? colors.amber : colors.bgCard;
              const fg = isEq ? '#fff' : isAction ? colors.amber : colors.textPrimary;
              return (
                <TouchableOpacity
                  key={ki}
                  style={[styles.btn, { backgroundColor: bg, width: BTN_W, height: BTN_H }]}
                  activeOpacity={0.6}
                  onPress={() => {
                    if (k.id === 'c') handleClear();
                    else if (k.id === 'bs') handleBackspace();
                    else if (k.id === 'eq') swap();
                    else if (['div', 'mul', 'sub', 'add', 'pct'].includes(k.id)) {}
                    else handleDigit(k.label);
                  }}
                >
                  {k.icon ? (
                    <Ionicons name={k.icon as any} size={BTN_W * 0.35} color={fg} />
                  ) : (
                    <Text style={[styles.btnText, { color: fg, fontSize: BTN_W < 60 ? 18 : 22 }]}>{k.label}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Dropdown picker */}
      <Modal visible={picker !== null} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setPicker(null)}>
          <View style={[styles.dropdown, { backgroundColor: colors.bgCard }]}>
            <ScrollView bounces={false}>
              {CURRENCIES.map((u, i) => {
                const isSelected = i === activeIdx;
                return (
                  <TouchableOpacity
                    key={u.id}
                    style={[styles.dropdownItem, isSelected && { backgroundColor: colors.amber }]}
                    activeOpacity={0.7}
                    onPress={() => selectUnit(i)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.dropdownLabel, { color: isSelected ? '#fff' : colors.textPrimary }]}>
                        {u.label}
                      </Text>
                      <Text style={[styles.dropdownSymbol, { color: isSelected ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
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

const KEYPAD = [
  [{ id: 'c', label: 'C' }, { id: 'bs', label: '', icon: 'backspace-outline' }, { id: 'pct', label: '%' }, { id: 'div', label: '÷' }],
  [{ id: '7', label: '7' }, { id: '8', label: '8' }, { id: '9', label: '9' }, { id: 'mul', label: '×' }],
  [{ id: '4', label: '4' }, { id: '5', label: '5' }, { id: '6', label: '6' }, { id: 'sub', label: '−' }],
  [{ id: '1', label: '1' }, { id: '2', label: '2' }, { id: '3', label: '3' }, { id: 'add', label: '+' }],
  [{ id: '00', label: '00' }, { id: '0', label: '0' }, { id: '.', label: '.' }, { id: 'eq', label: '=', icon: 'swap-vertical' }],
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontFamily: typography.mono, flex: 1 },
  refreshBtn: { padding: 4 },
  unitSection: { paddingHorizontal: spacing.lg },
  unitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  unitLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  unitLabel: { fontSize: 16, fontFamily: typography.sans, fontWeight: '400' },
  unitSymbol: { fontSize: 13, fontFamily: typography.mono },
  unitValue: { fontSize: 26, fontFamily: typography.sans, fontWeight: '300', marginLeft: 12 },
  separator: { height: StyleSheet.hairlineWidth },
  rateInfo: { fontSize: 11, fontFamily: typography.mono, textAlign: 'center', marginTop: spacing.md },
  grid: { padding: GRID_PAD, gap: BTN_GAP },
  row: { flexDirection: 'row', gap: BTN_GAP, justifyContent: 'center' },
  btn: { borderRadius: radii.xl, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: typography.sans, fontWeight: '400', includeFontPadding: false },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-start', paddingTop: 80, paddingHorizontal: 24 },
  dropdown: { borderRadius: radii.xl, maxHeight: 420, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  dropdownLabel: { fontSize: 16, fontFamily: typography.sans, fontWeight: '500' },
  dropdownSymbol: { fontSize: 12, fontFamily: typography.mono, marginTop: 2 },
});
