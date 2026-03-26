import React from 'react';
import UnitConverter, { UnitDef } from '../../components/UnitConverter';

const UNITS: UnitDef[] = [
  { id: 'kmh', label: 'km/h', toBase: 1 },
  { id: 'ms', label: 'm/s', toBase: 3.6 },
  { id: 'mph', label: 'mi/h', toBase: 1.60934 },
  { id: 'kn', label: 'Nudo', toBase: 1.852 },
  { id: 'mach', label: 'Mach', toBase: 1234.8 },
];

export default function Velocidad() {
  return <UnitConverter title="Velocidad" units={UNITS} />;
}
