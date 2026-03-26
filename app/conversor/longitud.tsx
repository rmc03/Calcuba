import React from 'react';
import UnitConverter, { UnitDef } from '../../components/UnitConverter';

const UNITS: UnitDef[] = [
  { id: 'km', label: 'Kilómetro', symbol: 'km', toBase: 1000 },
  { id: 'm', label: 'Metro', symbol: 'm', toBase: 1 },
  { id: 'dm', label: 'Decímetro', symbol: 'dm', toBase: 0.1 },
  { id: 'cm', label: 'Centímetro', symbol: 'cm', toBase: 0.01 },
  { id: 'mm', label: 'Milímetro', symbol: 'mm', toBase: 0.001 },
  { id: 'um', label: 'Micrómetro', symbol: 'μm', toBase: 0.000001 },
  { id: 'mi', label: 'Milla', symbol: 'mi', toBase: 1609.344 },
  { id: 'yd', label: 'Yarda', symbol: 'yd', toBase: 0.9144 },
  { id: 'ft', label: 'Pie', symbol: 'ft', toBase: 0.3048 },
  { id: 'in', label: 'Pulgada', symbol: 'in', toBase: 0.0254 },
  { id: 'nmi', label: 'Milla náutica', symbol: 'nmi', toBase: 1852 },
];

export default function Longitud() {
  return <UnitConverter title="Longitud" units={UNITS} />;
}
