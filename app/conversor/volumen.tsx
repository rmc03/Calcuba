import React from 'react';
import UnitConverter, { UnitDef } from '../../components/UnitConverter';

const UNITS: UnitDef[] = [
  { id: 'l', label: 'Litro', toBase: 1 },
  { id: 'ml', label: 'Mililitro', toBase: 0.001 },
  { id: 'm3', label: 'Metro³', toBase: 1000 },
  { id: 'gal', label: 'Galón (US)', toBase: 3.78541 },
  { id: 'qt', label: 'Cuarto (US)', toBase: 0.946353 },
  { id: 'pt', label: 'Pinta (US)', toBase: 0.473176 },
  { id: 'cup', label: 'Taza (US)', toBase: 0.236588 },
  { id: 'floz', label: 'Onza líquida', toBase: 0.0295735 },
];

export default function Volumen() {
  return <UnitConverter title="Volumen" units={UNITS} />;
}
