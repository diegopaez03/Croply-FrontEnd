import { addDays, format, startOfDay } from 'date-fns';
import { HitoPlantillaDetalle } from '../types/plantillas.types';

export interface EventoPlanCalendario {
  fecha: Date;
  clave: string;
  titulo: string;
  dia_relativo: number;
}

export function eventosDesdeHitos(
  hitos: HitoPlantillaDetalle[],
  fechaSiembra: Date,
): EventoPlanCalendario[] {
  const origen = startOfDay(fechaSiembra);
  const eventos: EventoPlanCalendario[] = [];

  for (const hito of hitos) {
    for (const tarea of hito.tareas) {
      const fecha = addDays(origen, tarea.dia_relativo_tp);
      eventos.push({
        fecha,
        clave: format(fecha, 'yyyy-MM-dd'),
        titulo: tarea.descripcion_tp || hito.nombre_hpb,
        dia_relativo: tarea.dia_relativo_tp,
      });
    }
  }

  return eventos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
}
