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

// ─── CONFIG ──────────────────────────────────────────────────
const STORAGE_KEY = 'calcuba_rates';

// Free, no-auth API with real-time informal rates
const MDIV_API = 'https://mdiv.pro/api/rates';

const { width: SW } = Dimensions.get('window');
const GRID_PAD = 14;
const BTN_GAP = 10;
const BTN_W = (Math.min(SW, 400) - GRID_PAD * 2 - BTN_GAP * 3) / 4;
const BTN_H = BTN_W * 0.88;

// ─── TYPES ───────────────────────────────────────────────────
interface Rates {
  USD: number;
  EUR: number;
  MLC: number;
  timestamp?: string;
  source?: string;
}

const FALLBACK_RATES: Rates = {
  USD: 515, EUR: 582, MLC: 392,
  timestamp: 'Estimadas', source: 'fallback',
};

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

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-CU', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
  } catch {
    return iso;
  }
}

// ─── FETCH ───────────────────────────────────────────────────
async function fetchFromMdiv(): Promise<Rates | null> {
  try {
    const res = await fetch(MDIV_API);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success || !json?.data?.rates) return null;

    const r = json.data.rates;
    const usd = parseFloat(r.avgUsdOverallRate);
    const eur = parseFloat(r.avgEurOverallRate);
    const mlc = parseFloat(r.avgMlcOverallRate);
    const ts = json.data.timestamp;

    if (isNaN(usd) || usd <= 0) return null;

    return {
      USD: Math.round(usd * 100) / 100,
      EUR: Math.round((isNaN(eur) ? usd * 1.1 : eur) * 100) / 100,
      MLC: Math.round((isNaN(mlc) ? usd * 0.76 : mlc) * 100) / 100,
      timestamp: ts ? formatTime(ts) : new Date().toLocaleString('es-CU'),
      source: 'mdiv.pro',
    };
  } catch (_) {}
  return null;
}

// ─── COMPONENT ───────────────────────────────────────────────
export default function Divisas() {
  const { colors } = useTheme();

  const [rates, setRates] = useState<Rates>(FALLBACK_RATES);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [input, setInput] = useState('1');
  const [picker, setPicker] = useState<'from' | 'to' | null>(null);

  const fromCurr = CURRENCIES[fromIdx];
  const toCurr = CURRENCIES[toIdx];

  const fetchRates = useCallback(async () => {
    setLoading(true);

    // 1. Try mdiv.pro (free, no auth)
    const liveRates = await fetchFromMdiv();
    if (liveRates) {
      setRates(liveRates);
      setStatus(`✓ ${liveRates.source} · ${liveRates.timestamp}`);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(liveRates));
      setLoading(false);
      return;
    }

    // 2. Use cached
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Rates;
        setRates(parsed);
        setStatus(`Caché · ${parsed.timestamp ?? ''}`);
        setLoading(false);
        return;
      }
    } catch (_) {}

    // 3. Fallback
    setRates(FALLBACK_RATES);
    setStatus('Sin conexión · tasas estimadas');
    setLoading(false);
  }, []);

  useEffect(() => {
    // Load cache instantly, then fetch live
    AsyncStorage.getItem(STORAGE_KEY).then((cached) => {
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as Rates;
          setRates(parsed);
          setStatus(`Caché · ${parsed.timestamp ?? ''}`);
        } catch (_) {}
      }
    });
    fetchRates();
  }, []);

  // Conversion
  const result = useMemo(() => {
    const n = parseFloat(input);
    if (isNaN(n) || input === '') return '';
    const fromRate = getRate(fromCurr.id, rates);
    const toRate = getRate(toCurr.id, rates);
    return formatResult((n * fromRate) / toRate);
  }, [input, fromIdx, toIdx, rates]);

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
    else setToIdx(idx);
    setPicker(null);
  };

  const activeIdx = picker === 'from' ? fromIdx : toIdx;
  const isLive = rates.source && rates.source !== 'fallback';

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
        <Text style={[styles.statusText, { color: colors.textSecondary }]} numberOfLines={1}>
          {loading ? 'Actualizando tasas...' : status}
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

        <View style={[styles.sep, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.unitRow} onPress={() => setPicker('to')} activeOpacity={0.6}>
          <View style={styles.unitLeft}>
            <Text style={[styles.unitLabel, { color: colors.textPrimary }]}>{toCurr.label}</Text>
            <Text style={[styles.unitSymbol, { color: colors.textSecondary }]}> {toCurr.symbol}</Text>
            <Ionicons name="chevron-expand-outline" size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
          </View>
          <Text style={[styles.unitValue, { color: colors.textPrimary }]}>{result}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.rateInfo, { color: colors.textTertiary }]}>
        Fuente: mdiv.pro · mercado informal
      </Text>

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
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: radii.md, borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontFamily: typography.mono, flex: 1 },
  refreshBtn: { padding: 4 },
  unitSection: { paddingHorizontal: spacing.lg },
  unitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18 },
  unitLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  unitLabel: { fontSize: 16, fontFamily: typography.sans },
  unitSymbol: { fontSize: 13, fontFamily: typography.mono },
  unitValue: { fontSize: 26, fontFamily: typography.sans, fontWeight: '300', marginLeft: 12 },
  sep: { height: StyleSheet.hairlineWidth },
  rateInfo: { fontSize: 11, fontFamily: typography.mono, textAlign: 'center', marginTop: spacing.md },
  grid: { padding: GRID_PAD, gap: BTN_GAP },
  row: { flexDirection: 'row', gap: BTN_GAP, justifyContent: 'center' },
  btn: { borderRadius: radii.xl, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: typography.sans, fontWeight: '400', includeFontPadding: false },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-start', paddingTop: 80, paddingHorizontal: 24 },
  dropdown: { borderRadius: radii.xl, maxHeight: 420, overflow: 'hidden' },
  ddItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  ddLabel: { fontSize: 16, fontFamily: typography.sans, fontWeight: '500' },
  ddSymbol: { fontSize: 12, fontFamily: typography.mono, marginTop: 2 },
});
