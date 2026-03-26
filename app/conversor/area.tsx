import React from 'react';
import UnitConverter, { UnitDef } from '../../components/UnitConverter';

const UNITS: UnitDef[] = [
  { id: 'km2', label: 'Kilómetro²', toBase: 1_000_000 },
  { id: 'm2', label: 'Metro²', toBase: 1 },
  { id: 'cm2', label: 'Centímetro²', toBase: 0.0001 },
  { id: 'ha', label: 'Hectárea', toBase: 10_000 },
  { id: 'ac', label: 'Acre', toBase: 4046.856 },
  { id: 'mi2', label: 'Milla²', toBase: 2_589_988 },
  { id: 'ft2', label: 'Pie²', toBase: 0.092903 },
];

export default function Area() {
  return <UnitConverter title="Área" units={UNITS} />;
}
