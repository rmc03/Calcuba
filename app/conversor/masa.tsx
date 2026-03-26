import React from 'react';
import UnitConverter, { UnitDef } from '../../components/UnitConverter';

const UNITS: UnitDef[] = [
  { id: 'kg', label: 'Kilogramo', toBase: 1 },
  { id: 'g', label: 'Gramo', toBase: 0.001 },
  { id: 'mg', label: 'Miligramo', toBase: 0.000001 },
  { id: 't', label: 'Tonelada', toBase: 1000 },
  { id: 'lb', label: 'Libra', toBase: 0.453592 },
  { id: 'oz', label: 'Onza', toBase: 0.0283495 },
];

export default function Masa() {
  return <UnitConverter title="Masa" units={UNITS} />;
}
