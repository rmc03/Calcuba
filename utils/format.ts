/**
 * Shared formatting utilities for numbers and display
 */

/** Add comma separators to a number string (e.g. "1234567" → "1,234,567") */
export function addCommas(numStr: string): string {
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

/** Format a numeric value for display, handling Infinity/NaN and scientific notation */
export function formatNumber(val: number): string {
  if (!isFinite(val)) return 'Error';
  const str = parseFloat(val.toPrecision(10)).toString();
  if (str.includes('e')) return val.toExponential(4);
  return str;
}

/** Display a number string with commas, handling negatives and scientific notation */
export function displayNumber(str: string): string {
  if (str === 'Error' || str.includes('e')) return str;
  if (str.startsWith('-')) return '-' + addCommas(str.slice(1));
  return addCommas(str);
}

/** Add commas to a plain number */
export function addCommasToNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/** Map operator strings to display symbols */
export function opSymbol(o: string): string {
  return ({ '/': '÷', '*': '×', '-': '−', '+': '+' }[o] ?? o);
}

/** Basic arithmetic computation */
export function compute(a: number, b: number, o: string): number {
  switch (o) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? NaN : a / b;
    default: return b;
  }
}
