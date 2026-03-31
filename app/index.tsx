import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  ScrollView,
  ToastAndroid,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing, typography } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import TopNavBar from '../components/TopNavBar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_DESKTOP = SCREEN_WIDTH > 600;
const MAX_CALC_WIDTH = 400;
const CALC_WIDTH = Math.min(SCREEN_WIDTH, MAX_CALC_WIDTH);

const GRID_PADDING = IS_DESKTOP ? 20 : 14;
const BTN_GAP = IS_DESKTOP ? 12 : 10;
const _rawBtnSize = (CALC_WIDTH - GRID_PADDING * 2 - BTN_GAP * 3) / 4;

type BtnType = 'digit' | 'op' | 'eq' | 'ac' | 'sign' | 'pct' | 'sci' | 'backspace' | 'toggle_sci';

interface CalcBtn {
  label: string;
  type: BtnType;
  value?: string;
}

const BUTTONS_SCI: CalcBtn[][] = [
  [
    { label: 'sin', type: 'sci', value: 'sin' },
    { label: 'cos', type: 'sci', value: 'cos' },
    { label: 'tan', type: 'sci', value: 'tan' },
    { label: 'log', type: 'sci', value: 'log' },
  ],
  [
    { label: 'ln', type: 'sci', value: 'ln' },
    { label: '√', type: 'sci', value: 'sqrt' },
    { label: 'x²', type: 'sci', value: 'sq' },
    { label: '¹/x', type: 'sci', value: 'inv' },
  ],
];

const BUTTONS_MAIN: CalcBtn[][] = [
  [
    { label: 'C', type: 'ac' },
    { label: '', type: 'backspace', value: 'backspace' },
    { label: '%', type: 'pct' },
    { label: '÷', type: 'op', value: '/' },
  ],
  [
    { label: '7', type: 'digit' },
    { label: '8', type: 'digit' },
    { label: '9', type: 'digit' },
    { label: '×', type: 'op', value: '*' },
  ],
  [
    { label: '4', type: 'digit' },
    { label: '5', type: 'digit' },
    { label: '6', type: 'digit' },
    { label: '−', type: 'op', value: '-' },
  ],
  [
    { label: '1', type: 'digit' },
    { label: '2', type: 'digit' },
    { label: '3', type: 'digit' },
    { label: '+', type: 'op', value: '+' },
  ],
  [
    { label: '', type: 'toggle_sci' },
    { label: '0', type: 'digit' },
    { label: '.', type: 'digit' },
    { label: '=', type: 'eq' },
  ],
];

// ─── Number formatting with commas ───────────────────────────
function addCommas(numStr: string): string {
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

function formatNumber(val: number): string {
  if (!isFinite(val)) return 'Error';
  const str = parseFloat(val.toPrecision(10)).toString();
  if (str.includes('e')) return val.toExponential(4);
  return str;
}

function displayNumber(str: string): string {
  if (str === 'Error' || str.includes('e')) return str;
  // Handle negative
  if (str.startsWith('-')) return '-' + addCommas(str.slice(1));
  return addCommas(str);
}

const opSymbol = (o: string) =>
  ({ '/': '÷', '*': '×', '-': '−', '+': '+' }[o] ?? o);

const compute = (a: number, b: number, o: string): number => {
  switch (o) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? NaN : a / b;
    default: return b;
  }
};

export default function Calculadora() {
  const { colors } = useTheme();
  const [cur, setCur] = useState('0');
  const [op, setOp] = useState<string | null>(null);
  const [prev, setPrev] = useState<number | null>(null);
  const [waitOp, setWaitOp] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [showSci, setShowSci] = useState(false);
  // History: stores past { expr, result } entries
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);
  // Live expression parts for the big display
  const [liveExpr, setLiveExpr] = useState('');

  const BUTTONS = useMemo(() => showSci ? [...BUTTONS_SCI, ...BUTTONS_MAIN] : BUTTONS_MAIN, [showSci]);
  const _maxBtnHeight = Math.max((SCREEN_HEIGHT - 320) / BUTTONS.length, 30);
  const BTN_SIZE = Math.min(_rawBtnSize, _maxBtnHeight / 0.88);
  const BTN_HEIGHT = BTN_SIZE * 0.88;

  useEffect(() => {
    AsyncStorage.getItem('calcuba_history').then((cached) => {
      if (cached) {
        try {
          setHistory(JSON.parse(cached));
        } catch (_) {}
      }
    });
  }, []);

  const saveHistory = (newHistory: { expr: string; result: string }[]) => {
    setHistory(newHistory);
    AsyncStorage.setItem('calcuba_history', JSON.stringify(newHistory)).catch(() => {});
  };

  const reset = () => {
    setCur('0'); setLiveExpr(''); setOp(null);
    setPrev(null); setWaitOp(false); setHasResult(false);
  };

  const appendDigit = (d: string) => {
    if (hasResult && d !== '.') {
      setCur(d); setLiveExpr(''); setHasResult(false); return;
    }
    if (waitOp) {
      const newCur = d === '.' ? '0.' : d;
      setCur(newCur);
      setWaitOp(false);
      return;
    }
    if (d === '.' && cur.includes('.')) return;
    const newCur = cur === '0' && d !== '.' ? d : cur + d;
    setCur(newCur);
  };

  const applyOp = (operator: string) => {
    const val = parseFloat(cur);
    if (prev !== null && op && !waitOp) {
      const res = compute(prev, val, op);
      const resStr = formatNumber(res);
      setCur(resStr);
      setLiveExpr(`${displayNumber(resStr)}${opSymbol(operator)}`);
      setPrev(res);
    } else {
      setLiveExpr(`${displayNumber(cur)}${opSymbol(operator)}`);
      setPrev(val);
    }
    setOp(operator); setWaitOp(true); setHasResult(false);
  };

  const equals = () => {
    if (op === null || prev === null) return;
    const val = parseFloat(cur);
    const res = compute(prev, val, op);
    const resStr = formatNumber(res);
    const exprStr = `${displayNumber(formatNumber(prev))}${opSymbol(op)}${displayNumber(cur)}`;
    // Add to history
    const newHist = [...history.slice(-8), { expr: exprStr, result: displayNumber(resStr) }];
    saveHistory(newHist);
    setCur(resStr);
    setLiveExpr('');
    setPrev(null); setOp(null); setWaitOp(false); setHasResult(true);
  };

  const toggleSign = () => {
    if (cur === '0') return;
    setCur(cur.startsWith('-') ? cur.slice(1) : '-' + cur);
  };

  const percent = () => {
    const val = parseFloat(cur);
    setCur(formatNumber(prev !== null ? (prev * val) / 100 : val / 100));
  };

  const backspace = () => {
    if (hasResult) { reset(); return; }
    if (cur.length <= 1 || (cur.length === 2 && cur.startsWith('-'))) {
      setCur('0');
    } else {
      setCur(cur.slice(0, -1));
    }
  };

  const applySci = (fn: string) => {
    const val = parseFloat(cur);
    let res: number;
    switch (fn) {
      case 'sin': res = Math.sin((val * Math.PI) / 180); break;
      case 'cos': res = Math.cos((val * Math.PI) / 180); break;
      case 'tan': res = Math.tan((val * Math.PI) / 180); break;
      case 'log': res = Math.log10(val); break;
      case 'ln': res = Math.log(val); break;
      case 'sqrt': res = Math.sqrt(val); break;
      case 'sq': res = val * val; break;
      case 'inv': res = val === 0 ? NaN : 1 / val; break;
      default: res = val;
    }
    const resStr = formatNumber(res);
    const newHist = [...history.slice(-8), { expr: `${fn}(${displayNumber(cur)})`, result: displayNumber(resStr) }];
    saveHistory(newHist);
    setCur(resStr);
    setLiveExpr('');
    setHasResult(true); setPrev(null); setOp(null);
  };

  const handlePress = (btn: CalcBtn) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (btn.type) {
      case 'digit': appendDigit(btn.label); break;
      case 'op': applyOp(btn.value!); break;
      case 'eq': equals(); break;
      case 'ac': reset(); break;
      case 'sign': toggleSign(); break;
      case 'pct': percent(); break;
      case 'sci': applySci(btn.value!); break;
      case 'backspace': backspace(); break;
      case 'toggle_sci': setShowSci((s) => !s); break;
    }
  };

  const copyToClipboard = async () => {
    // Only copy if it's a valid number display
    if (cur === 'Error' || cur === '') return;
    await Clipboard.setStringAsync(cur);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Copiado al portapapeles', ToastAndroid.SHORT);
    }
  };

  const getBtnBg = (btn: CalcBtn) => {
    if (btn.type === 'eq') return colors.amber;
    return colors.bgCard;
  };

  const getBtnTextColor = (btn: CalcBtn) => {
    if (btn.type === 'eq') return '#ffffff';
    if (['op', 'ac', 'pct', 'backspace', 'toggle_sci'].includes(btn.type)) return colors.amber;
    if (btn.type === 'sci') return colors.textSecondary;
    return colors.textPrimary;
  };

  // Build the big display: either the live expression or the current number
  const bigDisplay = liveExpr
    ? `${liveExpr}${waitOp ? '' : displayNumber(cur)}`
    : displayNumber(cur);

  // Build the result line (shown when there's a pending operation and user typed digits)
  const resultLine = useMemo(() => {
    if (op && prev !== null && !waitOp) {
      const val = parseFloat(cur);
      const res = compute(prev, val, op);
      return `= ${displayNumber(formatNumber(res))}`;
    }
    if (hasResult) {
      return '';
    }
    return '';
  }, [cur, op, prev, waitOp, hasResult]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <TopNavBar />
      <View style={[IS_DESKTOP && styles.desktopWrapper, { flex: 1 }]}>
        <View style={[styles.display, { backgroundColor: colors.bgDeep }]}>
          {/* History lines */}
          <ScrollView
            style={styles.historyScroll}
            contentContainerStyle={styles.historyContent}
            showsVerticalScrollIndicator={false}
          >
            {history.map((h, i) => (
              <Text key={i} style={[styles.historyText, { color: colors.textSecondary }]} numberOfLines={1}>
                {h.expr}= {h.result}
              </Text>
            ))}
          </ScrollView>

          {/* Big expression or number */}
          <TouchableOpacity onLongPress={copyToClipboard} activeOpacity={0.7}>
            <Text
              style={[styles.bigText, { color: colors.textPrimary }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.3}
            >
              {bigDisplay}
            </Text>
          </TouchableOpacity>

          {/* Result preview line */}
          {resultLine !== '' && (
            <Text style={[styles.resultText, { color: colors.textSecondary }]} numberOfLines={1}>
              {resultLine}
            </Text>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.grid}>
          {BUTTONS.map((row, ri) => (
            <View key={ri} style={styles.row}>
              {row.map((btn, bi) => (
                <TouchableOpacity
                  key={bi}
                  style={[
                    styles.btn,
                    {
                      backgroundColor: getBtnBg(btn),
                      width: BTN_SIZE,
                      height: BTN_HEIGHT,
                      borderRadius: BTN_HEIGHT * 0.32,
                    },
                  ]}
                  onPress={() => handlePress(btn)}
                  activeOpacity={0.65}
                >
                  {btn.type === 'backspace' ? (
                    <Ionicons
                      name="backspace-outline"
                      size={BTN_SIZE * 0.32}
                      color={getBtnTextColor(btn)}
                    />
                  ) : btn.type === 'toggle_sci' ? (
                    <Ionicons
                      name="calculator-outline"
                      size={BTN_SIZE * 0.36}
                      color={getBtnTextColor(btn)}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.btnText,
                        {
                          color: getBtnTextColor(btn),
                          fontSize:
                            btn.type === 'sci'
                              ? (BTN_SIZE < 60 ? 11 : 13)
                              : btn.type === 'digit'
                              ? (IS_DESKTOP ? 28 : 26)
                              : (IS_DESKTOP ? 24 : 22),
                          fontFamily: btn.type === 'sci' ? typography.mono : typography.sans,
                          fontWeight: btn.type === 'digit' ? '400' : '500',
                        },
                      ]}
                    >
                      {btn.label}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  desktopWrapper: {
    maxWidth: MAX_CALC_WIDTH,
    alignSelf: 'center',
    width: '100%',
    flex: 1,
  },
  display: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  historyScroll: {
    flexGrow: 0,
    maxHeight: 90,
    marginBottom: spacing.lg,
  },
  historyContent: {
    justifyContent: 'flex-end',
  },
  historyText: {
    fontSize: 16,
    fontFamily: typography.sans,
    fontWeight: '400',
    textAlign: 'right',
    lineHeight: 28,
  },
  bigText: {
    fontSize: IS_DESKTOP ? 72 : 56,
    fontFamily: typography.sans,
    fontWeight: Platform.select({ ios: '300', android: '300', default: '300' }),
    textAlign: 'right',
    letterSpacing: -1,
    lineHeight: IS_DESKTOP ? 84 : 68,
  },
  resultText: {
    fontSize: IS_DESKTOP ? 28 : 24,
    fontFamily: typography.sans,
    fontWeight: '300',
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: GRID_PADDING },
  grid: {
    padding: GRID_PADDING,
    paddingTop: spacing.md,
    gap: BTN_GAP,
  },
  row: {
    flexDirection: 'row',
    gap: BTN_GAP,
    justifyContent: 'center',
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    includeFontPadding: false,
  },
});