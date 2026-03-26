import React from 'react';
import UnitConverter, { UnitDef } from '../../components/UnitConverter';

const UNITS: UnitDef[] = [
  { id: 'l', label: 'Litro', symbol: 'L', toBase: 1 },
  { id: 'ml', label: 'Mililitro', symbol: 'mL', toBase: 0.001 },
  { id: 'm3', label: 'Metro cúbico', symbol: 'm³', toBase: 1000 },
  { id: 'cm3', label: 'Centímetro cúbico', symbol: 'cm³', toBase: 0.001 },
  { id: 'gal', label: 'Galón (US)', symbol: 'gal', toBase: 3.78541 },
  { id: 'qt', label: 'Cuarto (US)', symbol: 'qt', toBase: 0.946353 },
  { id: 'pt', label: 'Pinta (US)', symbol: 'pt', toBase: 0.473176 },
  { id: 'cup', label: 'Taza (US)', symbol: 'cup', toBase: 0.236588 },
  { id: 'floz', label: 'Onza líquida', symbol: 'fl oz', toBase: 0.0295735 },
];

export default function Volumen() {
  return <UnitConverter title="Volumen" units={UNITS} />;
}
