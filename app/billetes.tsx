import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radii, shadows, spacing, typography } from '../constants/theme';

interface Denominacion {
  valor: number;
  tipo: 'billete' | 'moneda';
  label: string;
}

const DENOMINACIONES: Denominacion[] = [
  { valor: 1000, tipo: 'billete', label: '$1000' },
  { valor: 500,  tipo: 'billete', label: '$500'  },
  { valor: 200,  tipo: 'billete', label: '$200'  },
  { valor: 100,  tipo: 'billete', label: '$100'  },
  { valor: 50,   tipo: 'billete', label: '$50'   },
  { valor: 20,   tipo: 'billete', label: '$20'   },
  { valor: 10,   tipo: 'billete', label: '$10'   },
  { valor: 5,    tipo: 'billete', label: '$5'    },
  { valor: 3,    tipo: 'billete', label: '$3'    },
  { valor: 1,    tipo: 'moneda',  label: '$1'    },
  { valor: 0.50, tipo: 'moneda',  label: '50¢'   },
  { valor: 0.25, tipo: 'moneda',  label: '25¢'   },
  { valor: 0.20, tipo: 'moneda',  label: '20¢'   },
  { valor: 0.05, tipo: 'moneda',  label: '5¢'    },
  { valor: 0.02, tipo: 'moneda',  label: '2¢'    },
  { valor: 0.01, tipo: 'moneda',  label: '1¢'    },
];

type Counts = Record<number, number>;

function formatCUP(val: number): string {
  return parseFloat(val.toPrecision(10)).toLocaleString('es-CU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Billetes() {
  const { colors } = useTheme();
  const [counts, setCounts] = useState<Counts>({});

  const setCount = (valor: number, val: string) => {
    const num = parseInt(val) || 0;
    setCounts((prev) => ({ ...prev, [valor]: Math.max(0, num) }));
  };

  const increment = (valor: number) =>
    setCounts((prev) => ({ ...prev, [valor]: (prev[valor] ?? 0) + 1 }));

  const decrement = (valor: number) =>
    setCounts((prev) => ({ ...prev, [valor]: Math.max(0, (prev[valor] ?? 0) - 1) }));

  const limpiar = () => setCounts({});

  const total = useMemo(
    () => DENOMINACIONES.reduce((acc, d) => acc + (counts[d.valor] ?? 0) * d.valor, 0),
    [counts]
  );

  const billetes = DENOMINACIONES.filter((d) => d.tipo === 'billete');
  const monedas = DENOMINACIONES.filter((d) => d.tipo === 'moneda');
  const hasAny = Object.values(counts).some((v) => v > 0);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.bg }]}>
      {/* ── Total card ── */}
      <View style={[s.totalCard, { backgroundColor: colors.bgDeep, borderColor: colors.border }]}>
        <View>
          <Text style={[s.totalLabel, { color: colors.textTertiary }]}>TOTAL EN CUP</Text>
          <Text style={[s.totalValue, { color: hasAny ? colors.amber : colors.textTertiary }]}>
            ${formatCUP(total)}
          </Text>
          {hasAny && (
            <Text style={[s.totalSub, { color: colors.textSecondary }]}>
              {Object.values(counts).reduce((a, b) => a + b, 0)} piezas
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[
            s.clearBtn,
            { backgroundColor: colors.bgCard, borderColor: colors.accent },
            !hasAny && { opacity: 0.35 },
            shadows.sm,
          ]}
          onPress={limpiar}
          disabled={!hasAny}
        >
          <Text style={[s.clearText, { color: colors.accent }]}>✕ Limpiar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <SectionHeader label="💵 Billetes" colors={colors} />
        {billetes.map((d) => (
          <DenomRow
            key={d.valor}
            denom={d}
            count={counts[d.valor] ?? 0}
            onIncrement={() => increment(d.valor)}
            onDecrement={() => decrement(d.valor)}
            onChangeText={(v) => setCount(d.valor, v)}
            colors={colors}
          />
        ))}

        <SectionHeader label="🪙 Monedas" colors={colors} />
        {monedas.map((d) => (
          <DenomRow
            key={d.valor}
            denom={d}
            count={counts[d.valor] ?? 0}
            onIncrement={() => increment(d.valor)}
            onDecrement={() => decrement(d.valor)}
            onChangeText={(v) => setCount(d.valor, v)}
            colors={colors}
          />
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ label, colors }: { label: string; colors: any }) {
  return (
    <View style={[s.sectionHeader, { borderBottomColor: colors.border }]}>
      <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

interface DenomRowProps {
  denom: Denominacion;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onChangeText: (v: string) => void;
  colors: any;
}

function DenomRow({ denom, count, onIncrement, onDecrement, onChangeText, colors }: DenomRowProps) {
  const subtotal = count * denom.valor;
  const hasValue = count > 0;

  return (
    <View
      style={[
        s.row,
        { backgroundColor: colors.bgCard, borderColor: hasValue ? colors.borderFocus : colors.border },
        hasValue && shadows.sm,
      ]}
    >
      {/* Left */}
      <View style={s.rowLeft}>
        <Text style={[s.denomLabel, { color: colors.textPrimary }]}>{denom.label}</Text>
        {hasValue && (
          <Text style={[s.subtotal, { color: colors.green }]}>
            = ${formatCUP(subtotal)}
          </Text>
        )}
      </View>

      {/* Counter */}
      <View style={s.counter}>
        <TouchableOpacity
          style={[s.counterBtn, { backgroundColor: colors.bgInput, borderColor: colors.border }]}
          onPress={onDecrement}
          activeOpacity={0.7}
          disabled={count === 0}
        >
          <Text style={[s.counterBtnText, { color: count === 0 ? colors.textTertiary : colors.textSecondary }]}>
            −
          </Text>
        </TouchableOpacity>

        <TextInput
          style={[
            s.counterInput,
            { backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.textPrimary },
          ]}
          value={count === 0 ? '' : String(count)}
          onChangeText={onChangeText}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.accent}
          textAlign="center"
        />

        <TouchableOpacity
          style={[s.counterBtnPlus, { backgroundColor: colors.accent }]}
          onPress={onIncrement}
          activeOpacity={0.7}
        >
          <Text style={[s.counterBtnText, { color: '#fff' }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  totalCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg, paddingTop: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  totalLabel: { fontSize: 10, fontFamily: typography.mono, letterSpacing: 2 },
  totalValue: { fontSize: 36, fontFamily: typography.sans, fontWeight: '700', marginTop: 2 },
  totalSub: { fontSize: 11, fontFamily: typography.mono, marginTop: 2 },
  clearBtn: {
    borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  clearText: { fontFamily: typography.mono, fontSize: 12, fontWeight: '600' },
  scroll: { padding: spacing.md },
  sectionHeader: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.xs,
    marginTop: spacing.md, marginBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionLabel: { fontSize: 11, fontFamily: typography.mono, letterSpacing: 2 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: radii.md, padding: spacing.md, marginVertical: 3,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: { flex: 1 },
  denomLabel: { fontSize: 17, fontFamily: typography.sans, fontWeight: '600' },
  subtotal: { fontSize: 11, fontFamily: typography.mono, marginTop: 2 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  counterBtn: {
    width: 34, height: 34, borderRadius: radii.sm,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  counterBtnPlus: {
    width: 34, height: 34, borderRadius: radii.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  counterBtnText: { fontSize: 20, fontFamily: typography.sans, lineHeight: 24 },
  counterInput: {
    width: 52, height: 34, borderRadius: radii.xs,
    fontSize: 15, fontFamily: typography.mono,
    borderWidth: StyleSheet.hairlineWidth,
    includeFontPadding: false,
  },
});
