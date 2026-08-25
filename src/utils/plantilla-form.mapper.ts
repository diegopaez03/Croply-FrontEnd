import { CultivoBaseListado } from '../types/cultivos.types';
import {
  CrearPlantillaBaseRequest,
  PlantillaBaseDetalle,
  PlantillaBaseListado,
  PlantillaCultivoRequest,
} from '../types/plantillas.types';
import { esAplicacionAgroquimico } from './tipo-tarea.catalog';

export interface CultivoFormularioPlantilla {
  id_cultivo_base: number;
  modo_variedades: 'todas' | 'especificas';
  ids_variedades: number[];
}

export interface TareaFormularioPlantilla {
  dia_relativo_tp: number;
  id_tipo_tarea: number;
  descripcion_tp: string;
  nombre_producto?: string;
  dosis_aa?: string;
}

export interface HitoFormularioPlantilla {
  nombre_hpb: string;
  tareas: TareaFormularioPlantilla[];
}

export interface PlantillaFormularioValores {
  nombre_pb: string;
  cultivos: CultivoFormularioPlantilla[];
  hitos: HitoFormularioPlantilla[];
}

export function nombresCultivosDePlantilla(
  plantilla: PlantillaBaseListado,
  cultivos: CultivoBaseListado[],
): string[] {
  const ids = [...new Set(plantilla.cultivos.map((c) => c.id_cultivo_base))];
  return ids.map(
    (id) =>
      cultivos.find((c) => c.id_cultivo_base === id)?.nombre_cultivo_base ?? `Cultivo ${id}`,
  );
}

export function mapCultivosFormularioARequest(
  cultivos: CultivoFormularioPlantilla[],
): PlantillaCultivoRequest[] {
  const filas: PlantillaCultivoRequest[] = [];
  for (const cultivo of cultivos) {
    if (cultivo.modo_variedades === 'todas' || cultivo.ids_variedades.length === 0) {
      filas.push({ id_cultivo_base: cultivo.id_cultivo_base, id_variedad: null });
    } else {
      for (const id_variedad of cultivo.ids_variedades) {
        filas.push({ id_cultivo_base: cultivo.id_cultivo_base, id_variedad });
      }
    }
  }
  return filas;
}

export function mapHitosFormularioARequest(
  hitos: HitoFormularioPlantilla[],
): CrearPlantillaBaseRequest['hitos'] {
  return hitos.map((hito, index) => ({
    nombre_hpb: hito.nombre_hpb.trim(),
    orden_hpb: index + 1,
    tareas: hito.tareas.map((tarea) => {
      const agroquimico = esAplicacionAgroquimico(Number(tarea.id_tipo_tarea));
      return {
        dia_relativo_tp: Number(tarea.dia_relativo_tp),
        id_tipo_tarea: Number(tarea.id_tipo_tarea),
        descripcion_tp: tarea.descripcion_tp.trim(),
        nombre_producto: agroquimico ? (tarea.nombre_producto?.trim() || null) : null,
        dosis_aa: agroquimico ? (tarea.dosis_aa?.trim() || null) : null,
      };
    }),
  }));
}

export function mapFormularioARequest(
  values: PlantillaFormularioValores,
): CrearPlantillaBaseRequest {
  return {
    nombre_pb: values.nombre_pb.trim(),
    cultivos: mapCultivosFormularioARequest(values.cultivos),
    hitos: mapHitosFormularioARequest(values.hitos),
  };
}

export function cronogramaTieneTareas(hitos: HitoFormularioPlantilla[]): boolean {
  return hitos.some((hito) => hito.tareas.length > 0);
}

export function etiquetasVariedadesDeCultivo(
  detalle: PlantillaBaseDetalle,
  id_cultivo_base: number,
): string {
  const filas = detalle.cultivos.filter(
    (pcv) => pcv.cultivo_base.id_cultivo_base === id_cultivo_base,
  );
  const tieneTodas = filas.some((fila) => fila.variedad == null);
  const nombres = filas
    .map((fila) => fila.variedad?.nombre_variedad)
    .filter((nombre): nombre is string => Boolean(nombre));

  if (tieneTodas && nombres.length === 0) return 'Todas las variedades';
  if (tieneTodas) return ['Todas las variedades', ...nombres].join(', ');
  return nombres.join(', ') || 'Todas las variedades';
}

export function mapDetalleAFormulario(detalle: PlantillaBaseDetalle): PlantillaFormularioValores {
  const porCultivo = new Map<number, CultivoFormularioPlantilla>();

  for (const pcv of detalle.cultivos) {
    const id = pcv.cultivo_base.id_cultivo_base;
    const existente = porCultivo.get(id);
    const idVariedad = pcv.variedad?.id_variedad ?? null;

    if (!existente) {
      porCultivo.set(id, {
        id_cultivo_base: id,
        modo_variedades: idVariedad == null ? 'todas' : 'especificas',
        ids_variedades: idVariedad == null ? [] : [idVariedad],
      });
      continue;
    }

    if (idVariedad != null) {
      existente.modo_variedades = 'especificas';
      if (!existente.ids_variedades.includes(idVariedad)) {
        existente.ids_variedades.push(idVariedad);
      }
    }
  }

  return {
    nombre_pb: detalle.nombre_pb,
    cultivos: [...porCultivo.values()],
    hitos: detalle.hitos.map((hito) => ({
      nombre_hpb: hito.nombre_hpb,
      tareas: hito.tareas.map((tarea) => ({
        dia_relativo_tp: tarea.dia_relativo_tp,
        id_tipo_tarea: tarea.id_tipo_tarea,
        descripcion_tp: tarea.descripcion_tp,
        nombre_producto: tarea.nombre_producto ?? '',
        dosis_aa: tarea.dosis_aa ?? '',
      })),
    })),
  };
}
