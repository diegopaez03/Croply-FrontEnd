import { describe, expect, it } from 'vitest';
import { eventosDesdeHitos } from './plan-calendario';
import { HitoPlantillaDetalle } from '../types/plantillas.types';

const hitos: HitoPlantillaDetalle[] = [
  {
    id_hito_plantilla: 1,
    nombre_hpb: 'Siembra',
    orden_hpb: 1,
    tareas: [
      {
        id_tarea_plantilla: 1,
        dia_relativo_tp: 0,
        id_tipo_tarea: 2,
        nombre_tipo_tarea: 'Siembra',
        descripcion_tp: 'Preparación de almácigo',
      },
    ],
  },
  {
    id_hito_plantilla: 2,
    nombre_hpb: 'Riego',
    orden_hpb: 2,
    tareas: [
      {
        id_tarea_plantilla: 2,
        dia_relativo_tp: 7,
        id_tipo_tarea: 3,
        nombre_tipo_tarea: 'Riego',
        descripcion_tp: 'Riego inicial',
      },
    ],
  },
];

describe('eventosDesdeHitos', () => {
  it('calcula fechas a partir del día de siembra', () => {
    const eventos = eventosDesdeHitos(hitos, new Date(2026, 9, 3));
    expect(eventos[0].clave).toBe('2026-10-03');
    expect(eventos[1].clave).toBe('2026-10-10');
    expect(eventos[1].titulo).toBe('Riego inicial');
  });
});
