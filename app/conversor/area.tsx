import React from 'react';
import UnitConverter, { UnitDef } from '../../components/UnitConverter';

const UNITS: UnitDef[] = [
  { id: 'km2', label: 'Kilómetro cuadrado', symbol: 'km²', toBase: 1_000_000 },
  { id: 'ha', label: 'Hectárea', symbol: 'ha', toBase: 10_000 },
  { id: 'a', label: 'Área', symbol: 'a', toBase: 100 },
  { id: 'm2', label: 'Metro cuadrado', symbol: 'm²', toBase: 1 },
  { id: 'dm2', label: 'Decímetro cuadrado', symbol: 'dm²', toBase: 0.01 },
  { id: 'cm2', label: 'Centímetro cuadrado', symbol: 'cm²', toBase: 0.0001 },
  { id: 'mm2', label: 'Milímetro cuadrado', symbol: 'mm²', toBase: 0.000001 },
  { id: 'mi2', label: 'Milla cuadrada', symbol: 'mi²', toBase: 2_589_988 },
  { id: 'ac', label: 'Acre', symbol: 'ac', toBase: 4046.856 },
  { id: 'ft2', label: 'Pie cuadrado', symbol: 'ft²', toBase: 0.092903 },
];

export default function Area() {
  return <UnitConverter title="Área" units={UNITS} />;
}
