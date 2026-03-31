import React, { useState, useMemo, useEffect } from 'react';
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
import { useTheme } from '../context/ThemeContext';
import { radii, spacing, typography } from '../constants/theme';
import TopNavBar from '../components/TopNavBar';

const { width: SW } = Dimensions.get('window');

// ─── Denominations ───────────────────────────────────────────
interface Denom {
  valor: number;
  label: string;
  tipo: 'billete' | 'moneda';
}

const DENOMS: Denom[] = [
  { valor: 1000, label: '$1,000', tipo: 'billete' },
  { valor: 500,  label: '$500',   tipo: 'billete' },
  { valor: 200,  label: '$200',   tipo: 'billete' },
  { valor: 100,  label: '$100',   tipo: 'billete' },
  { valor: 50,   label: '$50',    tipo: 'billete' },
  { valor: 20,   label: '$20',    tipo: 'billete' },
  { valor: 10,   label: '$10',    tipo: 'billete' },
  { valor: 5,    label: '$5',     tipo: 'billete' },
  { valor: 3,    label: '$3',     tipo: 'billete' },
  { valor: 1,    label: '$1',     tipo: 'moneda' },
];

type Counts = Record<number, number>;

function addCommas(n: number): string {
  return n.toLocaleString('en-US');
}

// ─── Component ───────────────────────────────────────────────
export default function Billetes() {
  const { colors } = useTheme();
  const [counts, setCounts] = useState<Counts>({});
  const [usdRate, setUsdRate] = useState(0);
  const [eurRate, setEurRate] = useState(0);

  // Load cached exchange rates
  useEffect(() => {
    AsyncStorage.getItem('calcuba_rates').then((cached) => {
      if (cached) {
        try {
          const r = JSON.parse(cached);
          if (r.USD) setUsdRate(r.USD);
          if (r.EUR) setEurRate(r.EUR);
        } catch (_) {}
      }
    });
  }, []);

  const increment = (v: number) =>
    setCounts((p) => ({ ...p, [v]: (p[v] ?? 0) + 1 }));
  const decrement = (v: number) =>
    setCounts((p) => ({ ...p, [v]: Math.max(0, (p[v] ?? 0) - 1) }));
  const reset = () => setCounts({});

  const total = useMemo(
    () => DENOMS.reduce((acc, d) => acc + (counts[d.valor] ?? 0) * d.valor, 0),
    [counts],
  );
  const pieces = useMemo(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts],
  );
  const hasAny = pieces > 0;

  const billetes = DENOMS.filter((d) => d.tipo === 'billete');
  const monedas = DENOMS.filter((d) => d.tipo === 'moneda');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <TopNavBar />

      {/* Total header */}
      <View style={[styles.totalSection, { borderBottomColor: colors.border }]}>
        <View style={styles.totalTop}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>TOTAL CUP</Text>
          {hasAny && (
            <TouchableOpacity onPress={reset} style={styles.resetBtn} activeOpacity={0.6}>
              <Ionicons name="trash-outline" size={16} color={colors.amber} />
              <Text style={[styles.resetText, { color: colors.amber }]}> Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text
          style={[styles.totalValue, { color: hasAny ? colors.textPrimary : colors.textSecondary }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          ${addCommas(total)}
        </Text>
        {hasAny && (
          <View style={styles.equivRow}>
            <Text style={[styles.equivText, { color: colors.textSecondary }]}>
              {pieces} {pieces === 1 ? 'pieza' : 'piezas'}
            </Text>
            {usdRate > 0 && (
              <Text style={[styles.equivText, { color: colors.amber }]}>
                {' '}· ≈ ${(total / usdRate).toFixed(2)} USD
              </Text>
            )}
            {eurRate > 0 && (
              <Text style={[styles.equivText, { color: colors.textSecondary }]}>
                {' '}· €{(total / eurRate).toFixed(2)}
              </Text>
            )}
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Billetes section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>BILLETES</Text>
        {billetes.map((d) => {
          const count = counts[d.valor] ?? 0;
          const sub = count * d.valor;
          return (
            <View key={d.valor} style={[styles.denomRow, { borderBottomColor: colors.border }]}>
              <View style={styles.denomLeft}>
                <Text style={[styles.denomLabel, { color: colors.textPrimary }]}>{d.label}</Text>
                {count > 0 && (
                  <Text style={[styles.denomSub, { color: colors.amber }]}>
                    = ${addCommas(sub)}
                  </Text>
                )}
              </View>

              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: colors.bgCard }]}
                  onPress={() => decrement(d.valor)}
                  disabled={count === 0}
                  activeOpacity={0.6}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={count === 0 ? colors.textSecondary : colors.amber}
                  />
                </TouchableOpacity>

                <Text style={[styles.countText, { color: colors.textPrimary }]}>
                  {count}
                </Text>

                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: colors.bgCard }]}
                  onPress={() => increment(d.valor)}
                  activeOpacity={0.6}
                >
                  <Ionicons name="add" size={20} color={colors.amber} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Monedas section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: spacing.xl }]}>
          MONEDAS
        </Text>
        {monedas.map((d) => {
          const count = counts[d.valor] ?? 0;
          const sub = count * d.valor;
          return (
            <View key={d.valor} style={[styles.denomRow, { borderBottomColor: colors.border }]}>
              <View style={styles.denomLeft}>
                <Text style={[styles.denomLabel, { color: colors.textPrimary }]}>{d.label}</Text>
                {count > 0 && (
                  <Text style={[styles.denomSub, { color: colors.amber }]}>
                    = ${addCommas(sub)}
                  </Text>
                )}
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: colors.bgCard }]}
                  onPress={() => decrement(d.valor)}
                  disabled={count === 0}
                  activeOpacity={0.6}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={count === 0 ? colors.textSecondary : colors.amber}
                  />
                </TouchableOpacity>
                <Text style={[styles.countText, { color: colors.textPrimary }]}>
                  {count}
                </Text>
                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: colors.bgCard }]}
                  onPress={() => increment(d.valor)}
                  activeOpacity={0.6}
                >
                  <Ionicons name="add" size={20} color={colors.amber} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Total section
  totalSection: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  totalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: typography.mono,
    letterSpacing: 2,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetText: {
    fontSize: 13,
    fontFamily: typography.sans,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 48,
    fontFamily: typography.sans,
    fontWeight: '300',
    letterSpacing: -1,
  },
  equivRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  equivText: {
    fontSize: 13,
    fontFamily: typography.mono,
  },

  // Scroll
  scroll: {
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: typography.mono,
    letterSpacing: 2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  // Denom rows
  denomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  denomLeft: {
    flex: 1,
  },
  denomLabel: {
    fontSize: 18,
    fontFamily: typography.sans,
    fontWeight: '500',
  },
  denomSub: {
    fontSize: 12,
    fontFamily: typography.mono,
    marginTop: 2,
  },

  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 20,
    fontFamily: typography.sans,
    fontWeight: '400',
    minWidth: 30,
    textAlign: 'center',
  },
});