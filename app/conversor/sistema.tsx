import React from 'react';
import UnitConverter, { UnitDef } from '../../components/UnitConverter';

const UNITS: UnitDef[] = [
  { id: 'dec', label: 'Decimal', toBase: 1 },
  { id: 'bin', label: 'Binario', toBase: 1 },
  { id: 'oct', label: 'Octal', toBase: 1 },
  { id: 'hex', label: 'Hexadecimal', toBase: 1 },
];

function convert(value: number, from: string, to: string): number {
  // For number system, we just convert from decimal
  // The input is always decimal for now
  return value; // placeholder — full base conversion is more complex with strings
}

export default function Sistema() {
  return <UnitConverter title="Sistema numérico" units={UNITS} customConvert={convert} />;
}
