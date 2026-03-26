import React from 'react';
import UnitConverter, { UnitDef } from '../../components/UnitConverter';

const UNITS: UnitDef[] = [
  { id: 'cup', label: 'Peso cubano CUP', toBase: 1 },
  { id: 'usd', label: 'Dólar USD', toBase: 300 },
  { id: 'eur', label: 'Euro EUR', toBase: 330 },
  { id: 'mlc', label: 'MLC', toBase: 280 },
];

export default function Divisas() {
  return <UnitConverter title="Divisas" units={UNITS} />;
}
