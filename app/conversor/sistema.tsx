import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import SubScreenHeader from '../../components/SubScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { typography, radii, spacing } from '../../constants/theme';

// ─── Base conversion ─────────────────────────────────────────
type Base = 'dec' | 'bin' | 'oct' | 'hex';

const BASES: { id: Base; label: string; radix: number; chars: string }[] = [
  { id: 'dec', label: 'Decimal', radix: 10, chars: '0123456789' },
  { id: 'bin', label: 'Binario', radix: 2, chars: '01' },
  { id: 'oct', label: 'Octal', radix: 8, chars: '01234567' },
  { id: 'hex', label: 'Hexadecimal', radix: 16, chars: '0123456789ABCDEF' },
];

function convertBase(value: string, fromBase: Base, toBase: Base): string {
  if (!value || value === '0') return '0';
  const from = BASES.find(b => b.id === fromBase)!;
  const to = BASES.find(b => b.id === toBase)!;

  // Parse to decimal integer
  const decimal = parseInt(value, from.radix);
  if (isNaN(decimal)) return 'Error';

  // Convert to target base
  return decimal.toString(to.radix).toUpperCase();
}

// ─── Dynamic keypad for each base ──────────────────────────
function getKeypad(base: Base) {
  const b = BASES.find(x => x.id === base)!;
  const chars = b.chars.split('');
  // Build a grid of 3 columns + actions
  const rows: { id: string; label: string; icon?: string }[][] = [];

  // Row 0: C, BS, base indicator
  rows.push([
    { id: 'c', label: 'C' },
    { id: 'bs', label: '', icon: 'backspace-outline' },
  ]);

  // Digit rows (chunks of 3)
  for (let i = chars.length - 1; i >= 0; i -= 3) {
    const row: { id: string; label: string }[] = [];
    for (let j = Math.max(0, i - 2); j <= i; j++) {
      row.push({ id: chars[j], label: chars[j] });
    }
    rows.push(row);
  }

  // Add a '0' row if not already present
  if (!rows.some(r => r.some(k => k.id === '0'))) {
    rows.push([{ id: '0', label: '0' }]);
  }

  return rows;
}

// ─── Component ──────────────────────────────────────────────
export default function Sistema() {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [input, setInput] = useState('42');
  const [fromBase, setFromBase] = useState<Base>('dec');

  const results = useMemo(() => {
    return BASES.filter(b => b.id !== fromBase).map(b => ({
      ...b,
      value: convertBase(input, fromBase, b.id),
    }));
  }, [input, fromBase]);

  const validChars = BASES.find(b => b.id === fromBase)!.chars;
  const keypad = useMemo(() => getKeypad(fromBase), [fromBase]);

  const handleDigit = (d: string) => {
    if (!validChars.includes(d.toUpperCase())) return;
    if (input === '0') { setInput(d); return; }
    setInput(input + d);
  };
  const handleClear = () => setInput('0');
  const handleBackspace = () => {
    if (input.length <= 1) { setInput('0'); return; }
    setInput(input.slice(0, -1));
  };
  const haptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const GRID_PAD = 14;
  const BTN_GAP = 10;
  const cols = 3;
  const BTN_W = (Math.min(screenWidth, 400) - GRID_PAD * 2 - BTN_GAP * (cols - 1)) / cols;
  const BTN_H = BTN_W * 0.75;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <SubScreenHeader title="Sistema numérico" />

      {/* Base selector */}
      <View style={styles.baseRow}>
        {BASES.map(b => (
          <TouchableOpacity
            key={b.id}
            style={[
              styles.baseBtn,
              {
                backgroundColor: fromBase === b.id ? colors.amber : colors.bgCard,
                borderCurve: 'continuous' as any,
              },
            ]}
            onPress={() => { haptic(); setFromBase(b.id); }}
            accessibilityLabel={`Base ${b.label}`}
            accessibilityRole="button"
            accessibilityState={{ selected: fromBase === b.id }}
          >
            <Text style={[styles.baseBtnText, { color: fromBase === b.id ? '#000' : colors.textPrimary }]}>
              {b.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input */}
      <View style={styles.inputSection}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{BASES.find(b => b.id === fromBase)!.label}</Text>
        <Text
          style={[styles.inputValue, { color: colors.amber, fontVariant: ['tabular-nums'] }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          selectable
        >
          {input}
        </Text>
      </View>

      {/* Results */}
      <View style={styles.resultSection}>
        {results.map(r => (
          <View key={r.id} style={[styles.resultRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>{r.label}</Text>
            <Text
              style={[styles.resultValue, { color: colors.textPrimary, fontVariant: ['tabular-nums'] }]}
              selectable
            >
              {r.value}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ flex: 1 }} />

      {/* Keypad */}
      <View style={[styles.grid, { padding: GRID_PAD, gap: BTN_GAP }]}>
        {keypad.map((row, ri) => (
          <View key={ri} style={[styles.row, { gap: BTN_GAP }]}>
            {row.map((k, ki) => {
              const isAction = ['c', 'bs'].includes(k.id);
              const fg = isAction ? colors.amber : colors.textPrimary;
              return (
                <TouchableOpacity
                  key={ki}
                  style={[
                    styles.btn,
                    {
                      backgroundColor: colors.bgCard,
                      width: BTN_W,
                      height: BTN_H,
                      borderRadius: BTN_H * 0.32,
                      borderCurve: 'continuous' as any,
                    },
                  ]}
                  activeOpacity={0.6}
                  onPress={() => {
                    haptic();
                    if (k.id === 'c') handleClear();
                    else if (k.id === 'bs') handleBackspace();
                    else handleDigit(k.label);
                  }}
                  accessibilityLabel={k.id === 'bs' ? 'Borrar dígito' : k.id === 'c' ? 'Limpiar' : k.label}
                  accessibilityRole="button"
                >
                  {k.icon ? (
                    <Ionicons name={k.icon as keyof typeof Ionicons.glyphMap} size={BTN_W * 0.3} color={fg} />
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
  baseRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  baseBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  baseBtnText: {
    fontSize: 13,
    fontFamily: typography.sans,
    fontWeight: '500',
  },
  inputSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: typography.sans,
    letterSpacing: 1,
    marginBottom: 4,
  },
  inputValue: {
    fontSize: 40,
    fontFamily: typography.sans,
    fontWeight: '300',
    letterSpacing: 2,
  },
  resultSection: {
    paddingHorizontal: spacing.xl,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultLabel: {
    fontSize: 14,
    fontFamily: typography.sans,
  },
  resultValue: {
    fontSize: 22,
    fontFamily: typography.sans,
    fontWeight: '400',
    letterSpacing: 1,
  },
  grid: {},
  row: { flexDirection: 'row', justifyContent: 'center' },
  btn: { alignItems: 'center', justifyContent: 'center' },
  btnText: {
    fontSize: 20,
    fontFamily: typography.sans,
    fontWeight: '400',
  },
});
