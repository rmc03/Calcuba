import React from 'react';
import UnitConverter, { UnitDef } from '../../components/UnitConverter';

const UNITS: UnitDef[] = [
  { id: 'h', label: 'Hora', symbol: 'h', toBase: 3600 },
  { id: 'min', label: 'Minuto', symbol: 'min', toBase: 60 },
  { id: 's', label: 'Segundo', symbol: 's', toBase: 1 },
  { id: 'ms', label: 'Milisegundo', symbol: 'ms', toBase: 0.001 },
  { id: 'd', label: 'Día', symbol: 'd', toBase: 86400 },
  { id: 'w', label: 'Semana', symbol: 'sem', toBase: 604800 },
  { id: 'mo', label: 'Mes', symbol: 'mes', toBase: 2_592_000 },
  { id: 'y', label: 'Año', symbol: 'año', toBase: 31_536_000 },
];

export default function Tiempo() {
  return <UnitConverter title="Tiempo" units={UNITS} />;
}
