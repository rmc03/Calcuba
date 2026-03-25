import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radii, shadows, spacing, typography } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_DESKTOP = SCREEN_WIDTH > 600;
const MAX_CALC_WIDTH = 400;
const CALC_WIDTH = Math.min(SCREEN_WIDTH, MAX_CALC_WIDTH);

const GRID_PADDING = IS_DESKTOP ? 20 : 14;
const BTN_GAP = IS_DESKTOP ? 12 : 10;
const _rawBtnSize = (CALC_WIDTH - GRID_PADDING * 2 - BTN_GAP * 3) / 4;
// Fit grid within available height (approx. SCREEN_HEIGHT - 320px for margins, display, and tabs)
const _maxBtnHeight = Math.max((SCREEN_HEIGHT - 320) / 7, 30);
const BTN_SIZE = Math.min(_rawBtnSize, _maxBtnHeight / 0.88);
const BTN_HEIGHT = BTN_SIZE * 0.88;

type BtnType = 'digit' | 'op' | 'eq' | 'ac' | 'sign' | 'pct' | 'sci' | 'backspace';

interface CalcBtn {
  label: string;
  type: BtnType;
  value?: string;
}

const BUTTONS: CalcBtn[][] = [
  [
    { label: 'sin', type: 'sci', value: 'sin' },
    { label: 'cos', type: 'sci', value: 'cos' },
    { label: 'tan', type: 'sci', value: 'tan' },
    { label: '', type: 'backspace', value: 'backspace' },
  ],
  [
    { label: 'log', type: 'sci', value: 'log' },
    { label: 'ln', type: 'sci', value: 'ln' },
    { label: '√', type: 'sci', value: 'sqrt' },
    { label: 'x²', type: 'sci', value: 'sq' },
  ],
  [
    { label: '¹/x', type: 'sci', value: 'inv' },
    { label: 'AC', type: 'ac' },
    { label: '+/-', type: 'sign' },
    { label: '%', type: 'pct' },
  ],
  [
    { label: '7', type: 'digit' },
    { label: '8', type: 'digit' },
    { label: '9', type: 'digit' },
    { label: '÷', type: 'op', value: '/' },
  ],
  [
    { label: '4', type: 'digit' },
    { label: '5', type: 'digit' },
    { label: '6', type: 'digit' },
    { label: '×', type: 'op', value: '*' },
  ],
  [
    { label: '1', type: 'digit' },
    { label: '2', type: 'digit' },
    { label: '3', type: 'digit' },
    { label: '−', type: 'op', value: '-' },
  ],
  [
    { label: '0', type: 'digit' },
    { label: '.', type: 'digit' },
    { label: '=', type: 'eq' },
    { label: '+', type: 'op', value: '+' },
  ],
];

function formatNumber(val: number): string {
  if (!isFinite(val)) return 'Error';
  const str = parseFloat(val.toPrecision(10)).toString();
  if (str.includes('e')) return val.toExponential(4);
  return str;
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
  const [expr, setExpr] = useState('');
  const [op, setOp] = useState<string | null>(null);
  const [prev, setPrev] = useState<number | null>(null);
  const [waitOp, setWaitOp] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  const reset = () => {
    setCur('0'); setExpr(''); setOp(null);
    setPrev(null); setWaitOp(false); setHasResult(false);
  };

  const appendDigit = (d: string) => {
    if (hasResult && d !== '.') {
      setCur(d); setExpr(''); setHasResult(false); return;
    }
    if (waitOp) {
      setCur(d === '.' ? '0.' : d); setWaitOp(false); return;
    }
    if (d === '.' && cur.includes('.')) return;
    setCur(cur === '0' && d !== '.' ? d : cur + d);
  };

  const applyOp = (operator: string) => {
    const val = parseFloat(cur);
    if (prev !== null && op && !waitOp) {
      const res = compute(prev, val, op);
      setCur(formatNumber(res));
      setExpr(`${formatNumber(res)} ${opSymbol(operator)}`);
      setPrev(res);
    } else {
      setExpr(`${cur} ${opSymbol(operator)}`);
      setPrev(val);
    }
    setOp(operator); setWaitOp(true); setHasResult(false);
  };

  const equals = () => {
    if (op === null || prev === null) return;
    const val = parseFloat(cur);
    const res = compute(prev, val, op);
    setExpr(`${formatNumber(prev)} ${opSymbol(op)} ${cur} =`);
    setCur(formatNumber(res));
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
    setExpr(`${fn}(${cur}) =`);
    setCur(formatNumber(res));
    setHasResult(true); setPrev(null); setOp(null);
  };

  const handlePress = (btn: CalcBtn) => {
    switch (btn.type) {
      case 'digit': appendDigit(btn.label); break;
      case 'op': applyOp(btn.value!); break;
      case 'eq': equals(); break;
      case 'ac': reset(); break;
      case 'sign': toggleSign(); break;
      case 'pct': percent(); break;
      case 'sci': applySci(btn.value!); break;
      case 'backspace': backspace(); break;
    }
  };

  const getBtnBg = (btn: CalcBtn) => {
    switch (btn.type) {
      case 'eq': return colors.btnEq;
      case 'ac': return colors.btnAc;
      case 'op': return colors.btnOp;
      case 'sci': return colors.btnSci;
      case 'sign': case 'pct': return colors.btnMod;
      case 'backspace': return colors.btnDigit;
      default: return colors.btnDigit;
    }
  };

  const getBtnTextColor = (btn: CalcBtn) => {
    if (['ac', 'sign', 'pct'].includes(btn.type)) return '#000000';
    if (['op', 'eq'].includes(btn.type)) return '#ffffff';
    if (btn.type === 'backspace') return colors.amber;
    return colors.textPrimary;
  };

  const isDigitBtn = (btn: CalcBtn) => btn.type === 'digit';
  const isFuncBtn = (btn: CalcBtn) => ['ac', 'sign', 'pct', 'backspace', 'sci'].includes(btn.type);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[IS_DESKTOP && styles.desktopWrapper, { flex: 1 }]}>
        <View style={[styles.display, { backgroundColor: colors.bgDeep }]}>
          <Text style={[styles.appLabel, { color: colors.border }]}>CALCUBA</Text>
          <Text style={[styles.exprText, { color: colors.textSecondary }]} numberOfLines={1}>
            {expr || ' '}
          </Text>
          <Text
            style={[styles.curText, { color: colors.textPrimary }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.35}
          >
            {cur}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.grid}>
        {BUTTONS.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((btn, bi) => {
              const isEq = btn.type === 'eq';
              const shadow = isEq ? shadows.accent(colors.accent) : shadows.sm;
              
              const btnWidth = BTN_SIZE;

              return (
                <TouchableOpacity
                  key={bi}
                  style={[
                    styles.btn,
                    { 
                      backgroundColor: getBtnBg(btn), 
                      width: btnWidth, 
                      height: BTN_HEIGHT,
                    },
                    shadow,
                  ]}
                  onPress={() => handlePress(btn)}
                  activeOpacity={0.65}
                >
                  {btn.type === 'backspace' ? (
                    <Ionicons 
                      name="backspace-outline" 
                      size={22} 
                      color={getBtnTextColor(btn)} 
                    />
                  ) : (
                    <Text
                      style={[
                        styles.btnText,
                        {
                          color: getBtnTextColor(btn),
                          fontSize: btn.type === 'sci' ? (BTN_SIZE < 60 ? 11 : 13) : (BTN_SIZE < 60 ? 18 : 22),
                          fontFamily: btn.type === 'sci' ? typography.mono : typography.sans,
                          fontWeight: isDigitBtn(btn) ? '400' : isFuncBtn(btn) ? '500' : '500',
                        },
                      ]}
                    >
                      {btn.label}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
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
    paddingHorizontal: IS_DESKTOP ? spacing.xxl : spacing.xl,
    paddingBottom: spacing.lg,
  },
  appLabel: {
    fontSize: 9,
    letterSpacing: 6,
    fontFamily: typography.mono,
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  exprText: {
    fontSize: IS_DESKTOP ? 20 : 17,
    fontFamily: typography.mono,
    textAlign: 'right',
    marginBottom: 2,
  },
  curText: {
    fontSize: IS_DESKTOP ? 84 : 72,
    fontFamily: typography.sans,
    fontWeight: Platform.select({ ios: '200', android: '100', default: '200' }),
    textAlign: 'right',
    letterSpacing: -2,
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
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: IS_DESKTOP ? 24 : 22,
    includeFontPadding: false,
  },
});