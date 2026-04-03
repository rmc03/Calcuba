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
  Platform,
  ToastAndroid,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import SubScreenHeader from './SubScreenHeader';
import NumericKeypad from './NumericKeypad';
import { useTheme } from '../context/ThemeContext';
import { typography, radii, spacing } from '../constants/theme';
import { formatNumber } from '../utils/format';

export interface UnitDef {
  id: string;
  label: string;
  symbol?: string;
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
  const [extraIdx, setExtraIdx] = useState(units.length > 2 ? 2 : -1);
  const [input, setInput] = useState('1');
  const [picker, setPicker] = useState<'from' | 'to' | 'extra' | null>(null);

  const fromUnit = units[fromIdx];
  const toUnit = units[toIdx];
  const extraUnit = extraIdx >= 0 ? units[extraIdx] : null;

  const convertValue = (fromId: string, toId: string): string => {
    const n = parseFloat(input);
    if (isNaN(n) || input === '') return '';
    if (customConvert) return formatNumber(customConvert(n, fromId, toId));
    const fromU = units.find(u => u.id === fromId)!;
    const toU = units.find(u => u.id === toId)!;
    return formatNumber((n * fromU.toBase) / toU.toBase);
  };

  const result = useMemo(() => convertValue(fromUnit.id, toUnit.id), [input, fromIdx, toIdx]);
  const extraResult = useMemo(
    () => (extraUnit ? convertValue(fromUnit.id, extraUnit.id) : ''),
    [input, fromIdx, extraIdx],
  );

  const handleDigit = (d: string) => {
    if (d === '.' && input.includes('.')) return;
    if (d === '00' && input === '0') return;
    if (input === '0' && d !== '.' && d !== '00') { setInput(d); return; }
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
      ToastAndroid.show('Copiado al portapapeles', ToastAndroid.SHORT);
    }
  };

  const renderUnitRow = (
    unit: UnitDef,
    value: string,
    valueColor: string,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      style={styles.unitRow}
      onPress={onPress}
      onLongPress={() => copyToClipboard(value)}
      activeOpacity={0.6}
      accessibilityLabel={`${unit.label}: ${value || '0'}`}
      accessibilityRole="button"
    >
      <View style={styles.unitLeft}>
        <Text style={[styles.unitLabel, { color: colors.textPrimary }]}>{unit.label}</Text>
        {unit.symbol && (
          <Text style={[styles.unitSymbol, { color: colors.textSecondary }]}> {unit.symbol}</Text>
        )}
        <Ionicons name="chevron-expand-outline" size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
      </View>
      <Text
        style={[styles.unitValue, { color: valueColor, fontVariant: ['tabular-nums'] }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
        selectable
      >
        {value || '0'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <SubScreenHeader title={title} />

      <View style={styles.unitSection}>
        {renderUnitRow(fromUnit, input || '0', colors.amber, () => setPicker('from'))}
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        {renderUnitRow(toUnit, result, colors.textPrimary, () => setPicker('to'))}
        {extraUnit && (
          <>
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            {renderUnitRow(extraUnit, extraResult, colors.textPrimary, () => setPicker('extra'))}
          </>
        )}
      </View>

      <View style={{ flex: 1 }} />

      <NumericKeypad
        onDigit={handleDigit}
        onClear={handleClear}
        onBackspace={handleBackspace}
        onSwap={swap}
        showOperators={true}
      />

      {/* Dropdown picker */}
      <Modal visible={picker !== null} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setPicker(null)}>
          <View style={[styles.dropdown, { backgroundColor: colors.bgCard }]}>
            <ScrollView bounces={false} style={styles.dropdownScroll}>
              {units.map((u, i) => {
                const isSelected = i === activeIdx;
                return (
                  <TouchableOpacity
                    key={u.id}
                    style={[styles.dropdownItem, isSelected && { backgroundColor: colors.amber }]}
                    activeOpacity={0.7}
                    onPress={() => selectUnit(i)}
                    accessibilityLabel={`${u.label}${u.symbol ? ' ' + u.symbol : ''}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.dropdownLabel, { color: isSelected ? '#fff' : colors.textPrimary }]}>
                        {u.label}
                      </Text>
                      {u.symbol && (
                        <Text style={[styles.dropdownSymbol, { color: isSelected ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
                          {u.symbol}
                        </Text>
                      )}
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
  unitSection: { paddingHorizontal: spacing.lg },
  unitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    minHeight: 56,
  },
  unitLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, flexWrap: 'wrap', maxWidth: '55%' },
  unitLabel: { fontSize: 16, fontFamily: typography.sans, fontWeight: '400' },
  unitSymbol: { fontSize: 13, fontFamily: typography.sans },
  unitValue: { fontSize: 26, fontFamily: typography.sans, fontWeight: '300', marginLeft: 12, flexShrink: 0 },
  separator: { height: StyleSheet.hairlineWidth },
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
  dropdownScroll: { paddingVertical: 8 },
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
    fontFamily: typography.sans,
    marginTop: 2,
  },
});
