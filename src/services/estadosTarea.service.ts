import { apiClient } from "./api";
import {
  ListarEstadosTareaResponse,
  CreateEstadoTareaRequest,
  CreateEstadoTareaResponse,
  UpdateEstadoTareaRequest,
  UpdateEstadoTareaResponse,
  DeleteEstadoTareaResponse,
  EstadoTarea
} from "@/types/estadosTarea.types";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export let mockEstadosTarea: EstadoTarea[] = [
  { id_estado_tarea: 1, nombre_estado_tarea: "Planificado", protegido: true, es_estado_finalizador: false, cuenta_para_cierre_exitoso: false },
  { id_estado_tarea: 2, nombre_estado_tarea: "Completado", protegido: true, es_estado_finalizador: true, cuenta_para_cierre_exitoso: true },
  { id_estado_tarea: 3, nombre_estado_tarea: "Cancelada", protegido: true, es_estado_finalizador: true, cuenta_para_cierre_exitoso: false },
];

let nextId = 4;

export const estadosTareaService = {
  async getEstadosTarea(): Promise<ListarEstadosTareaResponse> {
    if (USE_MOCKS) {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ estados_tarea: [...mockEstadosTarea] }), 500);
      });
    }
    const response = await apiClient.get<ListarEstadosTareaResponse>("/estados-tarea");
    return response.data;
  },

  async createEstadoTarea(data: CreateEstadoTareaRequest): Promise<CreateEstadoTareaResponse> {
    if (USE_MOCKS) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (mockEstadosTarea.some((e) => e.nombre_estado_tarea === data.nombre_estado_tarea)) {
            reject({ response: { data: { errorCode: "DUPLICATE_VALUE", field: "nombre_estado_tarea", message: "El valor ingresado ya existe" } } });
            return;
          }
          const nuevo = {
            id_estado_tarea: nextId++,
            nombre_estado_tarea: data.nombre_estado_tarea,
            protegido: false,
            es_estado_finalizador: false,
            cuenta_para_cierre_exitoso: false,
          };
          mockEstadosTarea.push(nuevo);
          resolve({
            ...nuevo,
            message: "Estado de tarea creado correctamente",
            fecha_alta_estado_tarea: new Date().toISOString().split("T")[0],
            fecha_baja_estado_tarea: null,
          });
        }, 500);
      });
    }
    const response = await apiClient.post<CreateEstadoTareaResponse>("/estados-tarea", data);
    return response.data;
  },

  async updateEstadoTarea(id: number, data: UpdateEstadoTareaRequest): Promise<UpdateEstadoTareaResponse> {
    if (USE_MOCKS) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const idx = mockEstadosTarea.findIndex((e) => e.id_estado_tarea === id);
          if (idx === -1) {
            reject({ response: { data: { errorCode: "RESOURCE_NOT_FOUND", message: "Recurso no encontrado" } } });
            return;
          }
          if (mockEstadosTarea.some((e) => e.nombre_estado_tarea === data.nombre_estado_tarea && e.id_estado_tarea !== id)) {
            reject({ response: { data: { errorCode: "DUPLICATE_VALUE", field: "nombre_estado_tarea", message: "El valor ingresado ya existe" } } });
            return;
          }
          mockEstadosTarea[idx] = { ...mockEstadosTarea[idx], ...data };
          resolve({
            message: "Estado de tarea actualizado correctamente",
            ...mockEstadosTarea[idx],
          });
        }, 500);
      });
    }
    const response = await apiClient.put<UpdateEstadoTareaResponse>(`/estados-tarea/${id}`, data);
    return response.data;
  },

  async deleteEstadoTarea(id: number): Promise<DeleteEstadoTareaResponse> {
    if (USE_MOCKS) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const idx = mockEstadosTarea.findIndex((e) => e.id_estado_tarea === id);
          if (idx === -1) {
            reject({ response: { data: { errorCode: "RESOURCE_NOT_FOUND", message: "Recurso no encontrado" } } });
            return;
          }
          
          if (mockEstadosTarea[idx].protegido) {
             reject({ response: { data: { errorCode: "PROTECTED_CATALOG_ITEM", message: "Este valor es necesario para el funcionamiento del sistema y no puede darse de baja." } } });
             return;
          }
          
          if (id === 999) { // fallback error to simulate RESOURCE_IN_USE if tested
             reject({ response: { data: { errorCode: "RESOURCE_IN_USE", message: "Este estado de tarea no se puede dar de baja porque está en uso." } } });
             return;
          }

          mockEstadosTarea.splice(idx, 1);
          resolve({
            message: "Estado de tarea dado de baja correctamente",
            id_estado_tarea: id,
          });
        }, 500);
      });
    }
    const response = await apiClient.delete<DeleteEstadoTareaResponse>(`/estados-tarea/${id}`);
    return response.data;
  },
};
