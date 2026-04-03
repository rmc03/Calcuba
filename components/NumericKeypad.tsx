import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { typography, radii } from '../constants/theme';

export interface KeyDef {
  id: string;
  label: string;
  icon?: string;
}

interface NumericKeypadProps {
  /** Called when a digit key (0-9, '.', '00') is pressed */
  onDigit: (digit: string) => void;
  /** Called when C is pressed */
  onClear: () => void;
  /** Called when backspace is pressed */
  onBackspace: () => void;
  /** Optional: Called when swap/equals key is pressed */
  onSwap?: () => void;
  /** Whether to show the right column (÷×−+ and swap) — default true */
  showOperators?: boolean;
  /** Extra right-column buttons, replaces the operator column if provided */
  rightColumn?: KeyDef[];
  /** Handle any custom key press */
  onCustomKey?: (key: KeyDef) => void;
}

const BASE_KEYS: KeyDef[][] = [
  [{ id: 'c', label: 'C' }, { id: 'bs', label: '', icon: 'backspace-outline' }, { id: '.', label: '.' }],
  [{ id: '7', label: '7' }, { id: '8', label: '8' }, { id: '9', label: '9' }],
  [{ id: '4', label: '4' }, { id: '5', label: '5' }, { id: '6', label: '6' }],
  [{ id: '1', label: '1' }, { id: '2', label: '2' }, { id: '3', label: '3' }],
  [{ id: '00', label: '00' }, { id: '0', label: '0' }],
];

const OP_COLUMN: KeyDef[] = [
  { id: 'div', label: '÷' },
  { id: 'mul', label: '×' },
  { id: 'sub', label: '−' },
  { id: 'add', label: '+' },
  { id: 'eq', label: '=', icon: 'swap-vertical' },
];

export default function NumericKeypad({
  onDigit,
  onClear,
  onBackspace,
  onSwap,
  showOperators = true,
  rightColumn,
  onCustomKey,
}: NumericKeypadProps) {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const GRID_PAD = 14;
  const BTN_GAP = 10;
  const cols = showOperators || rightColumn ? 4 : 3;
  const BTN_W = (Math.min(screenWidth, 400) - GRID_PAD * 2 - BTN_GAP * (cols - 1)) / cols;
  const BTN_H = BTN_W * 0.88;

  const rightCol = rightColumn || (showOperators ? OP_COLUMN : undefined);

  const rows = BASE_KEYS.map((baseRow, ri) => {
    const row = [...baseRow];
    if (rightCol && rightCol[ri]) {
      row.push(rightCol[ri]);
    }
    return row;
  });

  const handlePress = (k: KeyDef) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (k.id === 'c') { onClear(); return; }
    if (k.id === 'bs') { onBackspace(); return; }
    if (k.id === 'eq') { onSwap?.(); return; }
    if (['div', 'mul', 'sub', 'add', 'pct'].includes(k.id)) {
      onCustomKey?.(k);
      return;
    }
    // Custom keys from rightColumn
    if (rightColumn && rightColumn.find(r => r.id === k.id)) {
      onCustomKey?.(k);
      return;
    }
    // Digit key
    onDigit(k.label);
  };

  return (
    <View style={[s.grid, { padding: GRID_PAD, gap: BTN_GAP }]}>
      {rows.map((row, ri) => (
        <View key={ri} style={[s.row, { gap: BTN_GAP }]}>
          {row.map((k, ki) => {
            const isEq = k.id === 'eq';
            const isAction = ['c', 'bs', 'pct', 'div', 'mul', 'sub', 'add'].includes(k.id);
            const bg = isEq ? colors.amber : colors.bgCard;
            const fg = isEq ? '#fff' : isAction ? colors.amber : colors.textPrimary;

            return (
              <TouchableOpacity
                key={ki}
                style={[
                  s.btn,
                  {
                    backgroundColor: bg,
                    width: BTN_W,
                    height: BTN_H,
                    borderRadius: BTN_H * 0.32,
                    borderCurve: 'continuous' as any,
                  },
                ]}
                activeOpacity={0.6}
                onPress={() => handlePress(k)}
                accessibilityLabel={
                  k.id === 'bs' ? 'Borrar dígito'
                    : k.id === 'c' ? 'Limpiar'
                    : k.id === 'eq' ? 'Intercambiar'
                    : k.label || k.id
                }
                accessibilityRole="button"
              >
                {k.icon ? (
                  <Ionicons
                    name={k.icon as keyof typeof Ionicons.glyphMap}
                    size={BTN_W * 0.35}
                    color={fg}
                  />
                ) : (
                  <Text
                    style={[
                      s.btnText,
                      { color: fg, fontSize: BTN_W < 60 ? 18 : 22 },
                    ]}
                  >
                    {k.label}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  grid: {},
  row: { flexDirection: 'row', justifyContent: 'center' },
  btn: { alignItems: 'center', justifyContent: 'center' },
  btnText: {
    fontFamily: typography.sans,
    fontWeight: '400',
    includeFontPadding: false,
  },
});
