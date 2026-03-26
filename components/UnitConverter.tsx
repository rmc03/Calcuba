import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SubScreenHeader from './SubScreenHeader';
import { useTheme } from '../context/ThemeContext';
import { typography, radii, spacing } from '../constants/theme';

const { width: SW } = Dimensions.get('window');
const GRID_PAD = 14;
const BTN_GAP = 10;
const BTN_W = (Math.min(SW, 400) - GRID_PAD * 2 - BTN_GAP * 3) / 4;
const BTN_H = BTN_W * 0.88;

export interface UnitDef {
  id: string;
  label: string;
  /** Short symbol shown in the dropdown subtitle, e.g. "km²" */
  symbol?: string;
  /** Factor to convert 1 of this unit into the base unit. */
  toBase: number;
}

interface Props {
  title: string;
  units: UnitDef[];
  customConvert?: (value: number, fromId: string, toId: string) => number;
}

export default function UnitConverter({ title, units, customConvert }: Props) {
  const { colors } = useTheme();
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [input, setInput] = useState('1');
  const [picker, setPicker] = useState<'from' | 'to' | null>(null);

  const fromUnit = units[fromIdx];
  const toUnit = units[toIdx];

  const result = useMemo(() => {
    const n = parseFloat(input);
    if (isNaN(n) || input === '') return '';
    if (customConvert) {
      return formatResult(customConvert(n, fromUnit.id, toUnit.id));
    }
    return formatResult((n * fromUnit.toBase) / toUnit.toBase);
  }, [input, fromIdx, toIdx]);

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

  const swap = () => {
    const f = fromIdx;
    setFromIdx(toIdx);
    setToIdx(f);
  };

  const selectUnit = (idx: number) => {
    if (picker === 'from') setFromIdx(idx);
    else setToIdx(idx);
    setPicker(null);
  };

  const activeIdx = picker === 'from' ? fromIdx : toIdx;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <SubScreenHeader title={title} />

      {/* Unit rows */}
      <View style={styles.unitSection}>
        <TouchableOpacity style={styles.unitRow} onPress={() => setPicker('from')} activeOpacity={0.6}>
          <View style={styles.unitLeft}>
            <Text style={[styles.unitLabel, { color: colors.textPrimary }]}>{fromUnit.label}</Text>
            {fromUnit.symbol && (
              <Text style={[styles.unitSymbol, { color: colors.textSecondary }]}> {fromUnit.symbol}</Text>
            )}
            <Ionicons name="chevron-expand-outline" size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
          </View>
          <Text style={[styles.unitValue, { color: colors.amber }]}>{input || '0'}</Text>
        </TouchableOpacity>

        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.unitRow} onPress={() => setPicker('to')} activeOpacity={0.6}>
          <View style={styles.unitLeft}>
            <Text style={[styles.unitLabel, { color: colors.textPrimary }]}>{toUnit.label}</Text>
            {toUnit.symbol && (
              <Text style={[styles.unitSymbol, { color: colors.textSecondary }]}> {toUnit.symbol}</Text>
            )}
            <Ionicons name="chevron-expand-outline" size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
          </View>
          <Text style={[styles.unitValue, { color: colors.textPrimary }]}>{result}</Text>
        </TouchableOpacity>
      </View>

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
                    else if (['div', 'mul', 'sub', 'add', 'pct'].includes(k.id)) { /* placeholder */ }
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

      {/* Dropdown picker overlay */}
      <Modal visible={picker !== null} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setPicker(null)}>
          <View style={[styles.dropdown, { backgroundColor: colors.bgCard }]}>
            <ScrollView bounces={false} style={styles.dropdownScroll}>
              {units.map((u, i) => {
                const isSelected = i === activeIdx;
                return (
                  <TouchableOpacity
                    key={u.id}
                    style={[
                      styles.dropdownItem,
                      isSelected && { backgroundColor: colors.amber },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => selectUnit(i)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[
                        styles.dropdownLabel,
                        { color: isSelected ? '#fff' : colors.textPrimary },
                      ]}>
                        {u.label}
                      </Text>
                      {u.symbol && (
                        <Text style={[
                          styles.dropdownSymbol,
                          { color: isSelected ? 'rgba(255,255,255,0.7)' : colors.textSecondary },
                        ]}>
                          {u.symbol}
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark" size={22} color="#fff" />
                    )}
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
  [
    { id: 'c', label: 'C' },
    { id: 'bs', label: '', icon: 'backspace-outline' },
    { id: 'pct', label: '%' },
    { id: 'div', label: '÷' },
  ],
  [
    { id: '7', label: '7' },
    { id: '8', label: '8' },
    { id: '9', label: '9' },
    { id: 'mul', label: '×' },
  ],
  [
    { id: '4', label: '4' },
    { id: '5', label: '5' },
    { id: '6', label: '6' },
    { id: 'sub', label: '−' },
  ],
  [
    { id: '1', label: '1' },
    { id: '2', label: '2' },
    { id: '3', label: '3' },
    { id: 'add', label: '+' },
  ],
  [
    { id: '00', label: '00' },
    { id: '0', label: '0' },
    { id: '.', label: '.' },
    { id: 'eq', label: '=', icon: 'swap-vertical' },
  ],
];

function formatResult(n: number): string {
  if (!isFinite(n)) return 'Error';
  const s = parseFloat(n.toPrecision(10)).toString();
  if (s.includes('e')) return n.toExponential(4);
  return s;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  unitSection: { paddingHorizontal: spacing.lg },
  unitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  unitLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  unitLabel: { fontSize: 17, fontFamily: typography.sans, fontWeight: '400' },
  unitSymbol: { fontSize: 14, fontFamily: typography.mono },
  unitValue: { fontSize: 28, fontFamily: typography.sans, fontWeight: '300', marginLeft: 12 },
  separator: { height: StyleSheet.hairlineWidth },
  grid: { padding: GRID_PAD, gap: BTN_GAP },
  row: { flexDirection: 'row', gap: BTN_GAP, justifyContent: 'center' },
  btn: { borderRadius: radii.xl, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: typography.sans, fontWeight: '400', includeFontPadding: false },

  // Dropdown overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  dropdown: {
    borderRadius: radii.xl,
    maxHeight: 420,
    overflow: 'hidden',
  },
  dropdownScroll: {
    paddingVertical: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  dropdownLabel: {
    fontSize: 16,
    fontFamily: typography.sans,
    fontWeight: '500',
  },
  dropdownSymbol: {
    fontSize: 13,
    fontFamily: typography.mono,
    marginTop: 2,
  },
});
