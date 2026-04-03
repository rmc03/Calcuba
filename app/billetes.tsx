import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  ToastAndroid,
  Share,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../constants/theme';
import { useRates } from '../hooks/useRates';
import { addCommasToNumber } from '../utils/format';
import TopNavBar from '../components/TopNavBar';

// ─── Denominations ───────────────────────────────────────────
interface Denom {
  valor: number;
  label: string;
  tipo: 'billete' | 'moneda';
}

const DENOMS: Denom[] = [
  { valor: 5000, label: '$5,000', tipo: 'billete' },
  { valor: 2000, label: '$2,000', tipo: 'billete' },
  { valor: 1000, label: '$1,000', tipo: 'billete' },
  { valor: 500,  label: '$500',   tipo: 'billete' },
  { valor: 200,  label: '$200',   tipo: 'billete' },
  { valor: 100,  label: '$100',   tipo: 'billete' },
  { valor: 50,   label: '$50',    tipo: 'billete' },
  { valor: 20,   label: '$20',    tipo: 'billete' },
  { valor: 10,   label: '$10',    tipo: 'billete' },
  { valor: 5,    label: '$5',     tipo: 'billete' },
  { valor: 3,    label: '$3',     tipo: 'billete' },
  { valor: 1,    label: '$1',     tipo: 'billete' },
];

type Counts = Record<number, number>;

function AnimatedCounter({ value, textStyle }: { value: number; textStyle: any }) {
  const animatedValue = React.useRef(new Animated.Value(value)).current;
  const [displayVal, setDisplayVal] = useState(value);

  useEffect(() => {
    const listener = animatedValue.addListener((state) => {
      setDisplayVal(Math.round(state.value));
    });
    return () => {
      animatedValue.removeListener(listener);
    };
  }, [animatedValue]);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  return (
    <Text style={textStyle} numberOfLines={1} adjustsFontSizeToFit selectable>
      ${addCommasToNumber(displayVal)}
    </Text>
  );
}

// ─── Component ───────────────────────────────────────────────
export default function Billetes() {
  const { colors } = useTheme();
  const [counts, setCounts] = useState<Counts>({});
  const { rates } = useRates();

  const haptic = (style: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  };

  const increment = (v: number) => {
    haptic(Haptics.ImpactFeedbackStyle.Light);
    setCounts((p) => ({ ...p, [v]: (p[v] ?? 0) + 1 }));
  };
  const decrement = (v: number) => {
    haptic(Haptics.ImpactFeedbackStyle.Light);
    setCounts((p) => ({ ...p, [v]: Math.max(0, (p[v] ?? 0) - 1) }));
  };
  const reset = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setCounts({});
  };

  const total = useMemo(
    () => DENOMS.reduce((acc, d) => acc + (counts[d.valor] ?? 0) * d.valor, 0),
    [counts],
  );
  const pieces = useMemo(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts],
  );
  const hasAny = pieces > 0;

  const usdRate = rates.USD;
  const eurRate = rates.EUR;

  const copyToClipboard = async () => {
    if (total === 0) return;
    await Clipboard.setStringAsync(String(total));
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (Platform.OS === 'android') {
      ToastAndroid.show(`Copiado: ${total}`, ToastAndroid.SHORT);
    }
  };

  const shareDesglose = async () => {
    if (total === 0) return;
    haptic(Haptics.ImpactFeedbackStyle.Light);

    let text = '🧮 Calcuba — Conteo de billetes\n\n';
    DENOMS.forEach(d => {
      const c = counts[d.valor] ?? 0;
      if (c > 0) {
        text += `${c}× $${addCommasToNumber(d.valor)} = $${addCommasToNumber(c * d.valor)}\n`;
      }
    });
    text += '──────────\n';
    text += `Total: $${addCommasToNumber(total)} CUP`;
    if (usdRate > 0) {
      text += ` (≈ $${(total / usdRate).toFixed(2)} USD)`;
    }

    try {
      await Share.share({ message: text });
    } catch {}
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <TopNavBar />

      {/* Total header */}
      <View style={[styles.totalSection, { borderBottomColor: colors.border }]}>
        <View style={styles.totalTop}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>TOTAL CUP</Text>
          {hasAny && (
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <TouchableOpacity
                onPress={shareDesglose}
                style={styles.resetBtn}
                activeOpacity={0.6}
                accessibilityLabel="Compartir desglose"
                accessibilityRole="button"
              >
                <Ionicons name="share-outline" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={reset}
                style={styles.resetBtn}
                activeOpacity={0.6}
                accessibilityLabel="Limpiar conteo"
                accessibilityRole="button"
              >
                <Ionicons name="trash-outline" size={16} color={colors.amber} />
                <Text style={[styles.resetText, { color: colors.amber }]}> Limpiar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <TouchableOpacity onLongPress={copyToClipboard} activeOpacity={0.7} accessibilityLabel={`Total: ${total} pesos cubanos`}>
          <AnimatedCounter
            value={total}
            textStyle={[styles.totalValue, { color: hasAny ? colors.textPrimary : colors.textSecondary }]}
          />
        </TouchableOpacity>
        {hasAny && (
          <View style={styles.equivRow}>
            <Text style={[styles.equivText, { color: colors.textSecondary, fontVariant: ['tabular-nums'] }]}>
              {pieces} {pieces === 1 ? 'pieza' : 'piezas'}
            </Text>
            {usdRate > 0 && (
              <Text style={[styles.equivText, { color: colors.amber, fontVariant: ['tabular-nums'] }]}>
                {' '}· ≈ ${(total / usdRate).toFixed(2)} USD
              </Text>
            )}
            {eurRate > 0 && (
              <Text style={[styles.equivText, { color: colors.textSecondary, fontVariant: ['tabular-nums'] }]}>
                {' '}· €{(total / eurRate).toFixed(2)}
              </Text>
            )}
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>BILLETES</Text>
        {DENOMS.map((d) => {
          const count = counts[d.valor] ?? 0;
          const sub = count * d.valor;
          return (
            <View key={d.valor} style={[styles.denomRow, { borderBottomColor: colors.border }]}>
              <View style={styles.denomLeft}>
                <Text style={[styles.denomLabel, { color: colors.textPrimary }]}>{d.label}</Text>
                {count > 0 && (
                  <Text style={[styles.denomSub, { color: colors.amber, fontVariant: ['tabular-nums'] }]}>
                    = ${addCommasToNumber(sub)}
                  </Text>
                )}
              </View>

              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: colors.bgCard, borderCurve: 'continuous' as any }]}
                  onPress={() => decrement(d.valor)}
                  disabled={count === 0}
                  activeOpacity={0.6}
                  accessibilityLabel={`Quitar ${d.label}`}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: count === 0 }}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={count === 0 ? colors.textSecondary : colors.amber}
                  />
                </TouchableOpacity>

                <Text style={[styles.countText, { color: colors.textPrimary, fontVariant: ['tabular-nums'] }]}>
                  {count}
                </Text>

                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: colors.bgCard, borderCurve: 'continuous' as any }]}
                  onPress={() => increment(d.valor)}
                  activeOpacity={0.6}
                  accessibilityLabel={`Agregar ${d.label}`}
                  accessibilityRole="button"
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
    fontFamily: typography.sans,
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
    fontFamily: typography.sans,
  },

  // Scroll
  scroll: {
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: typography.sans,
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
    fontFamily: typography.sans,
    marginTop: 2,
  },

  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
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