import React from 'react';
import UnitConverter, { UnitDef } from '../../components/UnitConverter';

const UNITS: UnitDef[] = [
  { id: 'tb', label: 'Terabyte', toBase: 1_099_511_627_776 },
  { id: 'gb', label: 'Gigabyte', toBase: 1_073_741_824 },
  { id: 'mb', label: 'Megabyte', toBase: 1_048_576 },
  { id: 'kb', label: 'Kilobyte', toBase: 1024 },
  { id: 'b', label: 'Byte', toBase: 1 },
  { id: 'bit', label: 'Bit', toBase: 0.125 },
];

export default function Datos() {
  return <UnitConverter title="Datos" units={UNITS} />;
}
