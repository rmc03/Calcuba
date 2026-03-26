import React from 'react';
import UnitConverter, { UnitDef } from '../../components/UnitConverter';

const UNITS: UnitDef[] = [
  { id: 'km', label: 'Kilómetro', toBase: 1000 },
  { id: 'm', label: 'Metro', toBase: 1 },
  { id: 'cm', label: 'Centímetro', toBase: 0.01 },
  { id: 'mm', label: 'Milímetro', toBase: 0.001 },
  { id: 'mi', label: 'Milla', toBase: 1609.344 },
  { id: 'yd', label: 'Yarda', toBase: 0.9144 },
  { id: 'ft', label: 'Pie', toBase: 0.3048 },
  { id: 'in', label: 'Pulgada', toBase: 0.0254 },
];

export default function Longitud() {
  return <UnitConverter title="Longitud" units={UNITS} />;
}
