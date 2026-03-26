import React from 'react';
import UnitConverter, { UnitDef } from '../../components/UnitConverter';

const UNITS: UnitDef[] = [
  { id: 'h', label: 'Hora', toBase: 3600 },
  { id: 'min', label: 'Minuto', toBase: 60 },
  { id: 's', label: 'Segundo', toBase: 1 },
  { id: 'ms', label: 'Milisegundo', toBase: 0.001 },
  { id: 'd', label: 'Día', toBase: 86400 },
  { id: 'w', label: 'Semana', toBase: 604800 },
  { id: 'y', label: 'Año', toBase: 31_536_000 },
];

export default function Tiempo() {
  return <UnitConverter title="Tiempo" units={UNITS} />;
}
