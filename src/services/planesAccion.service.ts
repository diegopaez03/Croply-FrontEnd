import { apiClient } from './api';
import {
  PlanPreviewResponse,
  CrearPlanAccionRequest,
  PlanAccionDetalle,
  TareaPlanPayload,
  TareaPlanAccion,
  CambiarEstadoTareaResponse,
  EstadoPlanAccionManual,
} from '@/types/planesAccion.types';
import { mockCultivos as mockCultivosBase } from './cultivos.service';
import { mockPlantillas as mockPlantillasBase } from './plantillas.service';
import { mockFincas } from './fincas.service';
import { mockEstadosTarea } from './estadosTarea.service';
import { mockTiposTarea } from './tiposTarea.service';

export const planesAccionService = {
  obtenerPreviewPlan: async (id_cultivo_base: number, id_parcela: number): Promise<PlanPreviewResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let superficie_disponible_parcela = 0;
      mockFincas.forEach((f: any) => {
        const parcela = f.parcelas.find((p: any) => p.id_parcela === id_parcela);
        if (parcela) {
          const ocupada = parcela.cultivos_asignados?.reduce((acc: number, curr: any) => acc + Number(curr.superficie_asignada || 0), 0) || 0;
          superficie_disponible_parcela = parcela.superficie_parcela - ocupada;
        }
      });

      const cultivo = mockCultivosBase.find((c: any) => c.id_cultivo_base === id_cultivo_base);
      if (!cultivo) throw new Error('Cultivo no encontrado');

      const plantillas = mockPlantillasBase
        .filter((p: any) => p.id_cultivo_base === id_cultivo_base)
        .map((plantilla: any) => ({
          id_plantilla_base: plantilla.id_plantilla_base,
          variedades: cultivo.variedades.filter((v: any) => plantilla.variedades.includes(v.id_variedad)).map((v: any) => ({
            id_variedad: v.id_variedad,
            nombre_variedad: v.nombre_variedad
          })),
          hitos: plantilla.hitos.map((h: any) => ({
            id_hito_plantilla: h.id_hito_plantilla,
            nombre_hpb: h.nombre_hpb,
            orden_hpb: h.orden_hpb || 1,
            tareas: h.tareas
          }))
        }))
        .filter(p => p.variedades.length > 0);

      if (plantillas.length === 0 && mockPlantillasBase.length > 0) {
        plantillas.push({
          id_plantilla_base: mockPlantillasBase[0].id_plantilla_base,
          variedades: cultivo.variedades.map((v: any) => ({ id_variedad: v.id_variedad, nombre_variedad: v.nombre_variedad })),
          hitos: mockPlantillasBase[0].hitos.map((h: any) => ({
            id_hito_plantilla: h.id_hito_plantilla,
            nombre_hpb: h.nombre_hpb,
            orden_hpb: h.orden_hpb || 1,
            tareas: h.tareas
          }))
        });
      }

      return {
        superficie_disponible_parcela,
        plantillas
      };
    }
    const response = await apiClient.get<PlanPreviewResponse>(`/cultivos-base/${id_cultivo_base}/plan-preview?id_parcela=${id_parcela}`);
    return response.data;
  },

  crearPlanAccion: async (id_parcela: number, data: CrearPlanAccionRequest): Promise<{ message: string }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await new Promise(resolve => setTimeout(resolve, 800));
      let targetParcela: any = null;
      let superficie_disponible_parcela = 0;
      mockFincas.forEach((f: any) => {
        const parcela = f.parcelas.find((p: any) => p.id_parcela === id_parcela);
        if (parcela) {
          targetParcela = parcela;
          const ocupada = parcela.cultivos_asignados?.reduce((acc: number, curr: any) => acc + Number(curr.superficie_asignada || 0), 0) || 0;
          superficie_disponible_parcela = parcela.superficie_parcela - ocupada;
        }
      });

      const totalSuperficie = data.asignaciones.reduce((acc, curr) => acc + Number(curr.superficie_asignada), 0);
      
      if (totalSuperficie > superficie_disponible_parcela) {
        throw {
          isAxiosError: true,
          response: {
            status: 400,
            data: {
              code: 'ERR-09',
              message: 'INSUFFICIENT_AREA',
              field: 'superficie_asignada'
            }
          }
        };
      }

      if (targetParcela) {
        if (!targetParcela.cultivos_asignados) targetParcela.cultivos_asignados = [];
        
        const cultivoObj = mockCultivosBase.find((c: any) => c.id_cultivo_base === data.id_cultivo_base);
        
        data.asignaciones.forEach(asig => {
          const variedadObj = cultivoObj?.variedades?.find((v: any) => v.id_variedad === asig.id_variedad);
          targetParcela.cultivos_asignados.push({
            id_plan_accion: nextMockPlanId,
            id_cultivo_base: data.id_cultivo_base,
            nombre_cultivo_base: cultivoObj?.nombre_cultivo_base || "Desconocido",
            id_variedad: asig.id_variedad,
            nombre_variedad: variedadObj?.nombre_variedad || "Desconocida",
            superficie_asignada: Number(asig.superficie_asignada),
            fecha_inicio: asig.fecha_inicio,
            estado: 'Activo',
          });
          seedMockPlan(nextMockPlanId, asig.fecha_inicio, Number(asig.superficie_asignada));
          nextMockPlanId += 1;
        });
      }

      return { message: 'Plan de acción creado exitosamente.' };
    }
    const response = await apiClient.post<{ message: string }>(`/parcelas/${id_parcela}/planes-accion`, data);
    return response.data;
  },

  obtenerPlanAccion: async (
    id_plan_accion: number,
    filters?: { id_estado_tarea?: string; fecha?: string }
  ): Promise<PlanAccionDetalle> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await delay(300);
      const planBase = structuredClone(ensureMockPlan(id_plan_accion));
      
      const hoyStr = new Date().toISOString().split('T')[0];

      planBase.hitos.forEach(hito => {
        hito.tareas = hito.tareas.filter(tarea => {
          // Calculate atrasada
          const est = mockEstadosTarea.find(e => e.id_estado_tarea === tarea.id_estado_tarea);
          const isFinalizador = est?.es_estado_finalizador ?? false;
          tarea.atrasada = !isFinalizador && tarea.fecha_planificada_tarea < hoyStr;

          // Apply filters
          if (filters?.id_estado_tarea && filters.id_estado_tarea !== 'todos') {
            if (String(tarea.id_estado_tarea) !== filters.id_estado_tarea) return false;
          }
          if (filters?.fecha && filters.fecha !== '') {
            if (tarea.fecha_planificada_tarea !== filters.fecha) return false;
          }
          return true;
        });
      });

      return planBase;
    }
    const params = new URLSearchParams();
    if (filters?.id_estado_tarea && filters.id_estado_tarea !== 'todos') {
      params.append('estado', filters.id_estado_tarea);
    }
    if (filters?.fecha && filters.fecha !== '') {
      params.append('fecha', filters.fecha);
    }
    
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<PlanAccionDetalle>(`/planes-accion/${id_plan_accion}${queryStr}`);
    return response.data;
  },

  crearTarea: async (
    id_plan_accion: number,
    id_hito_real: number,
    data: TareaPlanPayload,
  ): Promise<TareaPlanAccion & { message: string }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await delay(300);
      const plan = ensureMockPlan(id_plan_accion);
      const hito = plan.hitos.find((item) => item.id_hito_real === id_hito_real);
      if (!hito) throw mockNotFound();
      const tarea = buildMockTarea(data);
      hito.tareas.push(tarea);
      return { message: 'Tarea agregada correctamente', ...tarea };
    }
    const response = await apiClient.post<TareaPlanAccion & { message: string }>(
      `/planes-accion/${id_plan_accion}/hitos/${id_hito_real}/tareas`,
      data,
    );
    return response.data;
  },

  editarTarea: async (
    id_plan_accion: number,
    id_tarea: number,
    data: TareaPlanPayload,
  ): Promise<TareaPlanAccion> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await delay(300);
      const found = findMockTarea(id_plan_accion, id_tarea);
      const estadoAnterior = mockEstadosTarea.find(e => e.id_estado_tarea === found.tarea.id_estado_tarea);
      if (estadoAnterior?.es_estado_finalizador) throw mockTaskNotEditable();
      Object.assign(found.tarea, buildMockTarea(data, found.tarea));
      return structuredClone(found.tarea);
    }
    const response = await apiClient.put<TareaPlanAccion>(
      `/planes-accion/${id_plan_accion}/tareas/${id_tarea}`,
      data,
    );
    return response.data;
  },

  cambiarEstadoTarea: async (
    id_plan_accion: number,
    id_tarea: number,
    id_estado_tarea: number,
  ): Promise<CambiarEstadoTareaResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await delay(300);
      const found = findMockTarea(id_plan_accion, id_tarea);
      const estadoAnterior = mockEstadosTarea.find(e => e.id_estado_tarea === found.tarea.id_estado_tarea);
      if (estadoAnterior?.es_estado_finalizador) throw mockTaskNotEditable();

      const estadoNuevo = mockEstadosTarea.find(e => e.id_estado_tarea === id_estado_tarea);
      if (!estadoNuevo) throw mockNotFound();

      found.tarea.id_estado_tarea = id_estado_tarea;
      found.tarea.nombre_estado_tarea = estadoNuevo.nombre_estado_tarea;
      
      if (estadoNuevo.cuenta_para_cierre_exitoso) {
        found.tarea.fecha_ejecucion_tarea = new Date().toISOString();
      } else {
        found.tarea.fecha_ejecucion_tarea = null;
      }

      let registro_agroquimico_generado = false;
      let message = 'Estado de la tarea actualizado correctamente';

      const tipoTarea = mockTiposTarea.find(t => t.id_tipo_tarea === found.tarea.id_tipo_tarea);
      if (tipoTarea?.es_tipo_agroquimico && estadoNuevo.cuenta_para_cierre_exitoso) {
        if ((found.tarea as any)._registroAgroquimicoGenerado) {
           message = 'Ya existe un registro de agroquímico asociado a esta tarea. No se generó un nuevo registro.';
        } else {
           (found.tarea as any)._registroAgroquimicoGenerado = true;
           registro_agroquimico_generado = true;
        }
      }

      const allTasks = found.plan.hitos.flatMap(h => h.tareas);
      const todasFinalizadoras = allTasks.every(t => {
         const est = mockEstadosTarea.find(e => e.id_estado_tarea === t.id_estado_tarea);
         return est?.es_estado_finalizador;
      });
      const alMenosUnaExitosa = allTasks.some(t => {
         const est = mockEstadosTarea.find(e => e.id_estado_tarea === t.id_estado_tarea);
         return est?.cuenta_para_cierre_exitoso;
      });
      const todas_tareas_completadas = allTasks.length > 0 && todasFinalizadoras && alMenosUnaExitosa;

      return {
        message,
        id_tarea,
        id_estado_tarea,
        nombre_estado_tarea: estadoNuevo.nombre_estado_tarea,
        fecha_ejecucion_tarea: found.tarea.fecha_ejecucion_tarea,
        todas_tareas_completadas,
        registro_agroquimico_generado,
      };
    }
    const response = await apiClient.put<CambiarEstadoTareaResponse>(
      `/planes-accion/${id_plan_accion}/tareas/${id_tarea}/estado`,
      { id_estado_tarea },
    );
    return response.data;
  },

  reprogramarTarea: async (
    id_plan_accion: number,
    id_tarea: number,
    payload: { fecha_planificada_tarea: string }
  ) => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await delay(300);
      const found = findMockTarea(id_plan_accion, id_tarea);
      const estadoActual = mockEstadosTarea.find(e => e.id_estado_tarea === found.tarea.id_estado_tarea);
      if (estadoActual?.es_estado_finalizador) throw mockTaskNotEditable();

      found.tarea.fecha_planificada_tarea = payload.fecha_planificada_tarea;
      
      const hoyStr = new Date().toISOString().split('T')[0];
      const isFinalizador = estadoActual?.es_estado_finalizador ?? false;
      const atrasada = !isFinalizador && payload.fecha_planificada_tarea < hoyStr;

      found.tarea.atrasada = atrasada;

      return {
        message: 'Tarea reprogramada exitosamente.',
        id_tarea,
        fecha_planificada_tarea: payload.fecha_planificada_tarea,
        atrasada,
      };
    }
    const response = await apiClient.put(
      `/planes-accion/${id_plan_accion}/tareas/${id_tarea}/fecha`,
      payload,
    );
    return response.data;
  },

  eliminarTarea: async (id_plan_accion: number, id_tarea: number): Promise<{ message: string }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await delay(300);
      const found = findMockTarea(id_plan_accion, id_tarea);
      const estadoAnterior = mockEstadosTarea.find(e => e.id_estado_tarea === found.tarea.id_estado_tarea);
      if (estadoAnterior?.es_estado_finalizador) throw mockTaskNotEditable();
      found.hito.tareas = found.hito.tareas.filter((tarea) => tarea.id_tarea !== id_tarea);
      return { message: 'Tarea eliminada correctamente' };
    }
    const response = await apiClient.delete<{ message: string }>(
      `/planes-accion/${id_plan_accion}/tareas/${id_tarea}`,
    );
    return response.data;
  },

  cambiarEstadoPlan: async (
    id_plan_accion: number,
    estado: EstadoPlanAccionManual,
  ): Promise<{ message: string }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await delay(300);
      if (estado === 'Inactivado' as EstadoPlanAccionManual) {
        throw mockDomain('INVALID_STATUS_TRANSITION', 400, 'El estado Inactivado no se puede asignar manualmente.');
      }
      const plan = ensureMockPlan(id_plan_accion);
      if (estado === 'Finalizado') {
        const allTasks = plan.hitos.flatMap(h => h.tareas);
        const todasFinalizadoras = allTasks.every(t => {
           const est = mockEstadosTarea.find(e => e.id_estado_tarea === t.id_estado_tarea);
           return est?.es_estado_finalizador;
        });
        if (!todasFinalizadoras || allTasks.length === 0) {
          throw mockDomain('TASKS_NOT_COMPLETED', 400, 'No se puede finalizar el plan hasta completar todas las tareas.');
        }
      }
      plan.estado = estado;
      plan.fecha_fin_pa = new Date().toISOString().slice(0, 10);

      if (['Finalizado', 'Cancelado', 'FinalizadoPorContingencia'].includes(estado)) {
        for (const f of mockFincas) {
          for (const p of f.parcelas) {
            if (p.cultivos_asignados) {
              const asigIndex = p.cultivos_asignados.findIndex((c: any) => c.id_plan_accion === id_plan_accion);
              if (asigIndex !== -1) {
                p.cultivos_asignados[asigIndex].estado = estado;
              }
            }
          }
        }
      }

      return { message: 'Estado del plan de acción actualizado correctamente' };
    }
    const response = await apiClient.put<{ message: string }>(
      `/planes-accion/${id_plan_accion}/estado`,
      { estado },
    );
    return response.data;
  },
};

let nextMockPlanId = 77;
let nextMockTareaId = 501;
const mockPlanes = new Map<number, PlanAccionDetalle>();

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function seedMockPlan(
  id_plan_accion: number,
  fecha_inicio_pa: string,
  superficie_ocupada_pa: number,
): PlanAccionDetalle {
  const plan: PlanAccionDetalle = {
    id_plan_accion,
    fecha_inicio_pa,
    fecha_fin_pa: null,
    superficie_ocupada_pa,
    estado: 'Activo',
    hitos: [
      {
        id_hito_real: id_plan_accion * 10 + 1,
        nombre_hito: 'Siembra',
        orden_hito: 1,
        tareas: [
          buildMockTarea({
            nombre_tarea: 'Preparación de almácigo',
            descripcion_tarea: 'Preparación de almácigo en sector norte',
            fecha_planificada_tarea: fecha_inicio_pa,
            id_tipo_tarea: mockTiposTarea[0]?.id_tipo_tarea ?? 1,
          }),
        ],
      },
    ],
  };
  mockPlanes.set(id_plan_accion, plan);
  return plan;
}

function ensureMockPlan(id_plan_accion: number): PlanAccionDetalle {
  return mockPlanes.get(id_plan_accion) ?? seedMockPlan(id_plan_accion, '2026-09-15', 12.5);
}

function buildMockTarea(data: TareaPlanPayload, base?: TareaPlanAccion): TareaPlanAccion {
  const tipo = mockTiposTarea.find(t => t.id_tipo_tarea === data.id_tipo_tarea);
  const estadoBase = mockEstadosTarea.find(e => e.id_estado_tarea === 1) || mockEstadosTarea[0]; // Planificado (1) by default
  
  return {
    id_tarea: base?.id_tarea ?? (nextMockTareaId += 1),
    nombre_tarea: data.nombre_tarea,
    descripcion_tarea: data.descripcion_tarea,
    fecha_planificada_tarea: data.fecha_planificada_tarea,
    fecha_ejecucion_tarea: base?.fecha_ejecucion_tarea ?? null,
    fecha_creacion_tarea: base?.fecha_creacion_tarea ?? new Date().toISOString(),
    id_tipo_tarea: data.id_tipo_tarea,
    nombre_tipo_tarea: tipo?.nombre_tipo_tarea ?? 'Tipo de tarea',
    id_estado_tarea: base?.id_estado_tarea ?? estadoBase.id_estado_tarea,
    nombre_estado_tarea: base?.nombre_estado_tarea ?? estadoBase.nombre_estado_tarea,
    nombre_producto_aa: data.nombre_producto_aa ?? null,
    dosis_aa: data.dosis_aa ?? null,
    id_responsable: data.id_responsable ?? null,
    nombre_responsable: null,
    fecha_hora_aplicacion_aa: data.fecha_hora_aplicacion_aa ?? null,
    atrasada: false, // Calculated on the fly in obtenerPlanAccion
  };
}

function findMockTarea(id_plan_accion: number, id_tarea: number) {
  const plan = ensureMockPlan(id_plan_accion);
  for (const hito of plan.hitos) {
    const tarea = hito.tareas.find((item) => item.id_tarea === id_tarea);
    if (tarea) {
      return { plan, hito, tarea };
    }
  }
  throw mockNotFound();
}

function mockNotFound() {
  return mockDomain('RESOURCE_NOT_FOUND', 404, 'El recurso solicitado no existe o ya fue eliminado.');
}

function mockTaskNotEditable() {
  return mockDomain('TASK_NOT_EDITABLE', 409, 'No se puede modificar una tarea que ya fue completada.');
}

function mockDomain(errorCode: string, status: number, message: string) {
  return {
    isAxiosError: true,
    response: {
      status,
      data: { statusCode: status, errorCode, message },
    },
  };
}
