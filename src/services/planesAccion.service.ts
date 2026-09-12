import { apiClient } from './api';
import { PlanPreviewResponse, CrearPlanAccionRequest } from '@/types/planesAccion.types';
import { mockCultivos as mockCultivosBase } from './cultivos.service';
import { mockPlantillas as mockPlantillasBase } from './plantillas.service';
import { mockFincas } from './fincas.service';

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
            id_cultivo_base: data.id_cultivo_base,
            nombre_cultivo_base: cultivoObj?.nombre_cultivo_base || "Desconocido",
            id_variedad: asig.id_variedad,
            nombre_variedad: variedadObj?.nombre_variedad || "Desconocida",
            superficie_asignada: Number(asig.superficie_asignada),
            fecha_inicio: asig.fecha_inicio
          });
        });
      }

      return { message: 'Plan de acción creado exitosamente.' };
    }
    const response = await apiClient.post<{ message: string }>(`/parcelas/${id_parcela}/planes-accion`, data);
    return response.data;
  }
};
