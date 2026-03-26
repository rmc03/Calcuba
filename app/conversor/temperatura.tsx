import React from 'react';
import UnitConverter, { UnitDef } from '../../components/UnitConverter';

const UNITS: UnitDef[] = [
  { id: 'c', label: 'Celsius °C', toBase: 1 },
  { id: 'f', label: 'Fahrenheit °F', toBase: 1 },
  { id: 'k', label: 'Kelvin K', toBase: 1 },
];

function convert(value: number, from: string, to: string): number {
  // Convert to Celsius first
  let c: number;
  if (from === 'c') c = value;
  else if (from === 'f') c = (value - 32) * 5 / 9;
  else c = value - 273.15; // kelvin

  // Convert from Celsius to target
  if (to === 'c') return c;
  if (to === 'f') return c * 9 / 5 + 32;
  return c + 273.15; // kelvin
}

export default function Temperatura() {
  return <UnitConverter title="Temperatura" units={UNITS} customConvert={convert} />;
}
