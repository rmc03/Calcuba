import React from 'react';
import UnitConverter, { UnitDef } from '../../components/UnitConverter';

const UNITS: UnitDef[] = [
  { id: 'kmh', label: 'Kilómetro por hora', symbol: 'km/h', toBase: 1 },
  { id: 'ms', label: 'Metro por segundo', symbol: 'm/s', toBase: 3.6 },
  { id: 'mph', label: 'Milla por hora', symbol: 'mph', toBase: 1.60934 },
  { id: 'kn', label: 'Nudo', symbol: 'kn', toBase: 1.852 },
  { id: 'mach', label: 'Mach', symbol: 'Ma', toBase: 1234.8 },
];

export default function Velocidad() {
  return <UnitConverter title="Velocidad" units={UNITS} />;
}
