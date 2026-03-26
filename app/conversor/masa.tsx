import React from 'react';
import UnitConverter, { UnitDef } from '../../components/UnitConverter';

const UNITS: UnitDef[] = [
  { id: 'kg', label: 'Kilogramo', symbol: 'kg', toBase: 1 },
  { id: 'g', label: 'Gramo', symbol: 'g', toBase: 0.001 },
  { id: 'mg', label: 'Miligramo', symbol: 'mg', toBase: 0.000001 },
  { id: 't', label: 'Tonelada', symbol: 't', toBase: 1000 },
  { id: 'lb', label: 'Libra', symbol: 'lb', toBase: 0.453592 },
  { id: 'oz', label: 'Onza', symbol: 'oz', toBase: 0.0283495 },
  { id: 'ct', label: 'Quilate', symbol: 'ct', toBase: 0.0002 },
];

export default function Masa() {
  return <UnitConverter title="Masa" units={UNITS} />;
}
