import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { radii, shadows, spacing, typography } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const STORAGE_KEY = 'calcuba_rates';
const API_URL = 'https://api.eltoque.com/v1/trm?date=today';

interface Rates {
  USD: number;
  EUR: number;
  MLC: number;
  timestamp?: string;
}

type Currency = 'CUP' | 'USD' | 'EUR' | 'MLC';

const CURRENCIES: { code: Currency; name: string; flag: string }[] = [
  { code: 'CUP', name: 'Peso Cubano', flag: '🇨🇺' },
  { code: 'USD', name: 'Dólar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'MLC', name: 'MLC', flag: '💳' },
];

const DEFAULT_RATES: Rates = { USD: 300, EUR: 330, MLC: 280, timestamp: 'Estimadas' };

function toCUP(value: number, currency: Currency, rates: Rates): number {
  if (currency === 'CUP') return value;
  const rate = rates[currency as keyof Rates] as number;
  return value * rate;
}

function fromCUP(value: number, currency: Currency, rates: Rates): number {
  if (currency === 'CUP') return value;
  const rate = rates[currency as keyof Rates] as number;
  return rate === 0 ? 0 : value / rate;
}

function safeRound(n: number): string {
  return parseFloat(n.toPrecision(10)).toString();
}

export default function Conversor() {
  const { colors } = useTheme();
  const [rates, setRates] = useState<Rates | null>(null);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCurr, setFromCurr] = useState<Currency>('USD');
  const [toCurr, setToCurr] = useState<Currency>('CUP');
  const [fromVal, setFromVal] = useState('1');
  const [toVal, setToVal] = useState('');

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
      if (!data) throw new Error('Respuesta inesperada de la API');

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
      if (!rates) {
        setRates(DEFAULT_RATES);
      }
    } finally {
      setLoading(false);
    }
  }, [rates]);

  useEffect(() => {
    loadCachedRates().then(() => fetchRates());
  }, []);

  useEffect(() => {
    if (!rates) return;
    const num = parseFloat(fromVal);
    if (isNaN(num) || fromVal === '') { setToVal(''); return; }
    const cup = toCUP(num, fromCurr, rates);
    setToVal(safeRound(fromCUP(cup, toCurr, rates)));
  }, [fromVal, fromCurr, toCurr, rates]);

  const handleToChange = (val: string) => {
    if (!rates) return;
    const num = parseFloat(val);
    if (isNaN(num) || val === '') { setFromVal(''); return; }
    const cup = toCUP(num, toCurr, rates);
    setFromVal(safeRound(fromCUP(cup, fromCurr, rates)));
  };

  const swap = () => {
    setFromCurr(toCurr);
    setToCurr(fromCurr);
    setFromVal(toVal || '1');
  };

  const unitRate =
    rates
      ? safeRound(fromCUP(toCUP(1, fromCurr, rates), toCurr, rates))
      : '—';

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <View
          style={[
            s.statusBar,
            { backgroundColor: colors.bgDeep, borderColor: offline ? colors.amber : colors.border },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <View style={[s.dot, { backgroundColor: offline ? colors.amber : colors.green }]} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={[s.statusText, { color: colors.textSecondary }]}>
              {loading
                ? 'Actualizando tasas...'
                : offline
                ? error ?? 'Modo offline'
                : `Actualizado: ${rates?.timestamp ?? ''}`}
            </Text>
            {offline && !loading && (
              <Text style={[s.statusSub, { color: colors.textTertiary }]}>
                Usando tasas {rates?.timestamp === 'Estimadas' ? 'estimadas' : 'en caché'}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={fetchRates}
            disabled={loading}
            style={[s.refreshBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }, shadows.sm]}
          >
            <Ionicons 
              name="refresh" 
              size={20} 
              color={loading ? colors.textTertiary : colors.accent}
              style={loading && { opacity: 0.5 }} 
            />
          </TouchableOpacity>
        </View>

        {rates && (
          <View style={s.ratesBanner}>
            <RateChip label="USD" value={rates.USD} colors={colors} />
            <RateChip label="EUR" value={rates.EUR} colors={colors} />
            <RateChip label="MLC" value={rates.MLC} colors={colors} />
          </View>
        )}

        <View style={[s.card, { backgroundColor: colors.bgCard, borderColor: colors.border }, shadows.md]}>
          <CurrencyField
            label="De"
            currencies={CURRENCIES}
            selected={fromCurr}
            onSelect={setFromCurr}
            value={fromVal}
            onChangeValue={setFromVal}
            colors={colors}
          />

          <View style={s.swapRow}>
            <View style={[s.swapLine, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={[s.swapBtn, { backgroundColor: colors.bgDeep, borderColor: colors.accent }, shadows.sm]}
              onPress={swap}
            >
              <Ionicons name="swap-vertical" size={22} color={colors.accent} />
            </TouchableOpacity>
            <View style={[s.swapLine, { backgroundColor: colors.border }]} />
          </View>

          <CurrencyField
            label="A"
            currencies={CURRENCIES}
            selected={toCurr}
            onSelect={setToCurr}
            value={toVal}
            onChangeValue={handleToChange}
            colors={colors}
          />
        </View>

        {rates && fromVal && toVal && (
          <View style={[s.resultCard, { backgroundColor: colors.bgDeep, borderColor: colors.borderFocus }]}>
            <Text style={[s.resultText, { color: colors.textSecondary }]}>
              1 {fromCurr}{' '}
              <Text style={{ color: colors.textTertiary }}>=</Text>{' '}
              <Text style={[s.resultAccent, { color: colors.amber }]}>{unitRate}</Text>{' '}
              {toCurr}
            </Text>
          </View>
        )}

        <Text style={[s.footnote, { color: colors.textTertiary }]}>
          Tasas informales · eltoque.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function RateChip({ label, value, colors }: { label: string; value: number; colors: any }) {
  return (
    <View style={[s.chip, { backgroundColor: colors.bgCard, borderColor: colors.border }, shadows.sm]}>
      <Text style={[s.chipLabel, { color: colors.amber }]}>{label}</Text>
      <Text style={[s.chipValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[s.chipUnit, { color: colors.textTertiary }]}>CUP</Text>
    </View>
  );
}

interface CurrencyFieldProps {
  label: string;
  currencies: typeof CURRENCIES;
  selected: Currency;
  onSelect: (c: Currency) => void;
  value: string;
  onChangeValue: (v: string) => void;
  colors: any;
}

function CurrencyField({ label, currencies, selected, onSelect, value, onChangeValue, colors }: CurrencyFieldProps) {
  return (
    <View style={s.fieldBlock}>
      <Text style={[s.fieldLabel, { color: colors.textTertiary }]}>{label}</Text>
      <View style={[s.fieldInput, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
        <TextInput
          style={[s.fieldText, { color: colors.textPrimary }]}
          value={value}
          onChangeText={onChangeValue}
          keyboardType="decimal-pad"
          placeholderTextColor={colors.textTertiary}
          placeholder="0"
          selectionColor={colors.accent}
        />
      </View>
      <View style={s.selectorRow}>
        {currencies.map(({ code }) => (
          <TouchableOpacity
            key={code}
            style={[
              s.currBtn,
              { backgroundColor: colors.bgInput, borderColor: colors.border },
              selected === code && { backgroundColor: colors.accent, borderColor: colors.accent },
            ]}
            onPress={() => onSelect(code)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                s.currBtnText,
                { color: selected === code ? '#fff' : colors.textSecondary },
              ]}
            >
              {code}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 48 },
  statusBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md,
    borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontFamily: typography.mono },
  statusSub: { fontSize: 10, fontFamily: typography.mono, marginTop: 2 },
  refreshBtn: {
    width: 36, height: 36, borderRadius: radii.full,
    alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth,
  },
  ratesBanner: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    flex: 1, borderRadius: radii.md, padding: spacing.sm,
    alignItems: 'center', borderWidth: StyleSheet.hairlineWidth,
  },
  chipLabel: { fontSize: 10, fontFamily: typography.mono, fontWeight: '700' },
  chipValue: { fontSize: 18, fontFamily: typography.mono, fontWeight: '600', marginTop: 2 },
  chipUnit: { fontSize: 9, fontFamily: typography.mono, marginTop: 1 },
  card: {
    borderRadius: radii.xl, padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.md, gap: 0,
  },
  swapRow: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: spacing.md, gap: spacing.sm,
  },
  swapLine: { flex: 1, height: StyleSheet.hairlineWidth },
  swapBtn: {
    width: 44, height: 44, borderRadius: radii.full,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  fieldBlock: { gap: spacing.sm },
  fieldLabel: { fontSize: 10, fontFamily: typography.mono, letterSpacing: 1, textTransform: 'uppercase' },
  fieldInput: {
    borderRadius: radii.md, borderWidth: 1, overflow: 'hidden',
  },
  fieldText: {
    fontSize: 30, fontFamily: typography.sans,
    fontWeight: '300', padding: spacing.md,
    includeFontPadding: false,
  },
  selectorRow: { flexDirection: 'row', gap: spacing.xs },
  currBtn: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: radii.sm,
    alignItems: 'center', borderWidth: 1,
  },
  currBtnText: { fontSize: 11, fontFamily: typography.mono, fontWeight: '700' },
  resultCard: {
    borderRadius: radii.md, padding: spacing.md,
    alignItems: 'center', borderWidth: 1, marginBottom: spacing.sm,
  },
  resultText: { fontSize: 14, fontFamily: typography.mono },
  resultAccent: { fontWeight: '700', fontSize: 16 },
  footnote: {
    fontSize: 10, fontFamily: typography.mono, textAlign: 'center', marginTop: spacing.sm,
  },
});