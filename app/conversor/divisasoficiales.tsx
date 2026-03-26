import React from 'react';
import UnitConverter, { UnitDef } from '../../components/UnitConverter';

// Placeholder static rates for international currencies
// A real app would fetch from exchangerate-api or similar
const UNITS: UnitDef[] = [
  { id: 'usd', label: 'Dólar (USD)', symbol: '$', toBase: 1 },
  { id: 'eur', label: 'Euro (EUR)', symbol: '€', toBase: 1.08 },
  { id: 'gbp', label: 'Libra esterlina (GBP)', symbol: '£', toBase: 1.26 },
  { id: 'mxn', label: 'Peso mexicano (MXN)', symbol: '$', toBase: 0.059 },
  { id: 'cad', label: 'Dólar canadiense (CAD)', symbol: '$', toBase: 0.74 },
  { id: 'jpy', label: 'Yen (JPY)', symbol: '¥', toBase: 0.0066 },
  { id: 'rub', label: 'Rublo ruso (RUB)', symbol: '₽', toBase: 0.011 },
];

export default function DivisasOficiales() {
  return <UnitConverter title="Divisas oficiales" units={UNITS} />;
}
