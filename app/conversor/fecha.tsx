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

// ─── Date helpers ─────────────────────────────────────────────
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function fmtDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function diffDates(a: Date, b: Date) {
  const from = a < b ? a : b;
  const to = a < b ? b : a;
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) { months--; days += new Date(to.getFullYear(), to.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }
  const totalDays = Math.floor((to.getTime() - from.getTime()) / 86400000);
  const totalWeeks = Math.floor(totalDays / 7);
  return { years, months, days, totalDays, totalWeeks };
}

function isValidDate(d: number, m: number, y: number): boolean {
  if (y < 1 || m < 1 || m > 12 || d < 1) return false;
  const maxDay = new Date(y, m, 0).getDate();
  return d <= maxDay;
}

// ─── Component ────────────────────────────────────────────────
export default function Fecha() {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  // Store as strings for manual input
  const [fromDay, setFromDay] = useState(String(new Date().getDate()));
  const [fromMonth, setFromMonth] = useState(String(new Date().getMonth() + 1));
  const [fromYear, setFromYear] = useState(String(new Date().getFullYear()));
  const [toDay, setToDay] = useState(String(new Date().getDate()));
  const [toMonth, setToMonth] = useState(String(new Date().getMonth() + 1));
  const [toYear, setToYear] = useState(String(new Date().getFullYear()));
  const [editing, setEditing] = useState<'fromDay' | 'fromMonth' | 'fromYear' | 'toDay' | 'toMonth' | 'toYear'>('fromDay');

  const fromDate = useMemo(() => {
    const d = parseInt(fromDay) || 1;
    const m = parseInt(fromMonth) || 1;
    const y = parseInt(fromYear) || 2024;
    return isValidDate(d, m, y) ? new Date(y, m - 1, d) : null;
  }, [fromDay, fromMonth, fromYear]);

  const toDate = useMemo(() => {
    const d = parseInt(toDay) || 1;
    const m = parseInt(toMonth) || 1;
    const y = parseInt(toYear) || 2024;
    return isValidDate(d, m, y) ? new Date(y, m - 1, d) : null;
  }, [toDay, toMonth, toYear]);

  const diff = useMemo(() => {
    if (!fromDate || !toDate) return null;
    return diffDates(fromDate, toDate);
  }, [fromDate, toDate]);

  // Keypad helpers
  const setters: Record<string, React.Dispatch<React.SetStateAction<string>>> = {
    fromDay: setFromDay, fromMonth: setFromMonth, fromYear: setFromYear,
    toDay: setToDay, toMonth: setToMonth, toYear: setToYear,
  };
  const values: Record<string, string> = {
    fromDay, fromMonth, fromYear, toDay, toMonth, toYear,
  };

  const haptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDigit = (d: string) => {
    const current = values[editing];
    const setter = setters[editing];
    if (current === '0') { setter(d); return; }
    setter(current + d);
  };
  const handleClear = () => setters[editing]('');
  const handleBackspace = () => {
    const current = values[editing];
    if (current.length <= 1) { setters[editing](''); return; }
    setters[editing](current.slice(0, -1));
  };

  // Tab order — pressing "next" cycles through fields
  const FIELD_ORDER: typeof editing[] = ['fromDay', 'fromMonth', 'fromYear', 'toDay', 'toMonth', 'toYear'];
  const nextField = () => {
    const idx = FIELD_ORDER.indexOf(editing);
    setEditing(FIELD_ORDER[(idx + 1) % FIELD_ORDER.length]);
  };

  // Keypad layout
  const GRID_PAD = 14;
  const BTN_GAP = 10;
  const cols = 3;
  const BTN_W = (Math.min(screenWidth, 400) - GRID_PAD * 2 - BTN_GAP * (cols - 1)) / cols;
  const BTN_H = BTN_W * 0.72;

  const KEYPAD = [
    [{ id: 'c', label: 'C' }, { id: 'bs', label: '', icon: 'backspace-outline' }, { id: 'next', label: '→', icon: 'arrow-forward' }],
    [{ id: '7', label: '7' }, { id: '8', label: '8' }, { id: '9', label: '9' }],
    [{ id: '4', label: '4' }, { id: '5', label: '5' }, { id: '6', label: '6' }],
    [{ id: '1', label: '1' }, { id: '2', label: '2' }, { id: '3', label: '3' }],
    [{ id: 'x', label: '' }, { id: '0', label: '0' }, { id: 'x2', label: '' }],
  ];

  const isFrom = editing.startsWith('from');
  const fieldLabels: Record<string, string> = { fromDay: 'Día', fromMonth: 'Mes', fromYear: 'Año', toDay: 'Día', toMonth: 'Mes', toYear: 'Año' };

  const renderDateField = (
    label: string,
    dayKey: 'fromDay' | 'toDay',
    monthKey: 'fromMonth' | 'toMonth',
    yearKey: 'fromYear' | 'toYear',
    sectionLabel: string,
    dateObj: Date | null,
  ) => (
    <View style={styles.dateSection}>
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{sectionLabel}</Text>
      <View style={styles.dateFieldRow}>
        {[
          { key: dayKey, placeholder: 'DD', val: values[dayKey] },
          { key: monthKey, placeholder: 'MM', val: values[monthKey] },
          { key: yearKey, placeholder: 'AAAA', val: values[yearKey] },
        ].map(field => (
          <TouchableOpacity
            key={field.key}
            style={[
              styles.dateField,
              {
                backgroundColor: editing === field.key ? colors.amber + '22' : colors.bgCard,
                borderColor: editing === field.key ? colors.amber : 'transparent',
                borderCurve: 'continuous' as any,
              },
            ]}
            onPress={() => { haptic(); setEditing(field.key as any); }}
            accessibilityLabel={`${sectionLabel} ${fieldLabels[field.key]}: ${field.val || field.placeholder}`}
            accessibilityRole="button"
          >
            <Text style={[styles.dateFieldLabel, { color: colors.textSecondary }]}>{fieldLabels[field.key]}</Text>
            <Text style={[styles.dateFieldValue, { color: field.val ? colors.textPrimary : colors.textTertiary, fontVariant: ['tabular-nums'] }]}>
              {field.val || field.placeholder}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {dateObj && (
        <Text style={[styles.dateFormatted, { color: colors.amber }]}>{fmtDate(dateObj)}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <SubScreenHeader title="Fecha" />

      <View style={styles.content}>
        {renderDateField('Desde', 'fromDay', 'fromMonth', 'fromYear', 'DESDE', fromDate)}
        {renderDateField('Hasta', 'toDay', 'toMonth', 'toYear', 'HASTA', toDate)}

        {/* Result card */}
        {diff ? (
          <View style={[styles.resultCard, { backgroundColor: colors.bgCard, borderCurve: 'continuous' as any }]}>
            <Text style={[styles.resultTitle, { color: colors.amber }]}>Diferencia</Text>
            <View style={[styles.resultSep, { backgroundColor: colors.border }]} />

            <View style={styles.resultRow}>
              {[
                { label: 'Años', value: diff.years },
                { label: 'Meses', value: diff.months },
                { label: 'Días', value: diff.days },
              ].map(item => (
                <View key={item.label} style={styles.resultCol}>
                  <Text style={[styles.resultColLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                  <Text style={[styles.resultColValue, { color: colors.textPrimary, fontVariant: ['tabular-nums'] }]} selectable>{item.value}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.resultSep, { backgroundColor: colors.border }]} />
            <View style={styles.resultFooter}>
              <Text style={[styles.resultFooterText, { color: colors.textSecondary }]}>
                {diff.totalDays} días totales · {diff.totalWeeks} semanas
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.resultCard, { backgroundColor: colors.bgCard }]}>
            <Text style={[styles.resultTitle, { color: colors.textSecondary }]}>Ingresa fechas válidas</Text>
          </View>
        )}
      </View>

      <View style={{ flex: 1 }} />

      {/* Keypad */}
      <View style={[styles.grid, { padding: GRID_PAD, gap: BTN_GAP }]}>
        {KEYPAD.map((row, ri) => (
          <View key={ri} style={[styles.krow, { gap: BTN_GAP }]}>
            {row.map((k, ki) => {
              const isEmpty = k.id.startsWith('x');
              if (isEmpty) return <View key={ki} style={{ width: BTN_W, height: BTN_H }} />;
              const isAction = ['c', 'bs', 'next'].includes(k.id);
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
                    else if (k.id === 'next') nextField();
                    else handleDigit(k.label);
                  }}
                  accessibilityLabel={k.id === 'bs' ? 'Borrar' : k.id === 'c' ? 'Limpiar' : k.id === 'next' ? 'Siguiente campo' : k.label}
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
  content: { paddingHorizontal: spacing.lg },
  sectionLabel: {
    fontSize: 11,
    fontFamily: typography.sans,
    letterSpacing: 2,
    marginBottom: 8,
  },
  dateSection: { marginBottom: spacing.lg },
  dateFieldRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateField: {
    flex: 1,
    borderRadius: radii.md,
    padding: 12,
    borderWidth: 1.5,
  },
  dateFieldLabel: {
    fontSize: 11,
    fontFamily: typography.sans,
    marginBottom: 2,
  },
  dateFieldValue: {
    fontSize: 22,
    fontFamily: typography.sans,
    fontWeight: '400',
  },
  dateFormatted: {
    fontSize: 13,
    fontFamily: typography.sans,
    marginTop: 6,
    textAlign: 'center',
  },
  resultCard: {
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  resultTitle: {
    fontSize: 16,
    fontFamily: typography.sans,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  resultSep: { height: StyleSheet.hairlineWidth, marginVertical: spacing.md },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resultCol: { alignItems: 'center', flex: 1 },
  resultColLabel: { fontSize: 13, fontFamily: typography.sans, marginBottom: 4 },
  resultColValue: { fontSize: 32, fontFamily: typography.sans, fontWeight: '300' },
  resultFooter: { alignItems: 'center' },
  resultFooterText: { fontSize: 13, fontFamily: typography.sans },
  grid: {},
  krow: { flexDirection: 'row', justifyContent: 'center' },
  btn: { alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 22, fontFamily: typography.sans, fontWeight: '400' },
});
