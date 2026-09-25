import { apiClient } from "./api";
import {
  ListarTiposTareaResponse,
  CreateTipoTareaRequest,
  CreateTipoTareaResponse,
  UpdateTipoTareaRequest,
  UpdateTipoTareaResponse,
  DeleteTipoTareaResponse,
  TipoTarea
} from "@/types/tiposTarea.types";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export let mockTiposTarea: TipoTarea[] = [
  {
    id_tipo_tarea: 1,
    nombre_tipo_tarea: "Aplicación de agroquímico",
    protegido: true,
    es_tipo_agroquimico: true,
  },
];

let nextId = 2;

export const tiposTareaService = {
  async getTiposTarea(): Promise<ListarTiposTareaResponse> {
    if (USE_MOCKS) {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ tipos_tarea: [...mockTiposTarea] }), 500);
      });
    }
    const response = await apiClient.get<ListarTiposTareaResponse>("/tipos-tarea");
    return response.data;
  },

  async createTipoTarea(data: CreateTipoTareaRequest): Promise<CreateTipoTareaResponse> {
    if (USE_MOCKS) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (mockTiposTarea.some((t) => t.nombre_tipo_tarea === data.nombre_tipo_tarea)) {
            reject({ response: { data: { errorCode: "DUPLICATE_VALUE", field: "nombre_tipo_tarea", message: "El valor ingresado ya existe" } } });
            return;
          }
          const nuevo = {
            id_tipo_tarea: nextId++,
            nombre_tipo_tarea: data.nombre_tipo_tarea,
            protegido: false,
            es_tipo_agroquimico: false,
          };
          mockTiposTarea.push(nuevo);
          resolve({
            ...nuevo,
            message: "Tipo de tarea creado correctamente",
            fecha_alta_tipo_tarea: new Date().toISOString().split("T")[0],
            fecha_baja_tipo_tarea: null,
          });
        }, 500);
      });
    }
    const response = await apiClient.post<CreateTipoTareaResponse>("/tipos-tarea", data);
    return response.data;
  },

  async updateTipoTarea(id: number, data: UpdateTipoTareaRequest): Promise<UpdateTipoTareaResponse> {
    if (USE_MOCKS) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const idx = mockTiposTarea.findIndex((t) => t.id_tipo_tarea === id);
          if (idx === -1) {
            reject({ response: { data: { errorCode: "RESOURCE_NOT_FOUND", message: "Recurso no encontrado" } } });
            return;
          }
          if (mockTiposTarea.some((t) => t.nombre_tipo_tarea === data.nombre_tipo_tarea && t.id_tipo_tarea !== id)) {
            reject({ response: { data: { errorCode: "DUPLICATE_VALUE", field: "nombre_tipo_tarea", message: "El valor ingresado ya existe" } } });
            return;
          }
          mockTiposTarea[idx] = { ...mockTiposTarea[idx], ...data };
          resolve({
            message: "Tipo de tarea actualizado correctamente",
            ...mockTiposTarea[idx],
          });
        }, 500);
      });
    }
    const response = await apiClient.put<UpdateTipoTareaResponse>(`/tipos-tarea/${id}`, data);
    return response.data;
  },

  async deleteTipoTarea(id: number): Promise<DeleteTipoTareaResponse> {
    if (USE_MOCKS) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const idx = mockTiposTarea.findIndex((t) => t.id_tipo_tarea === id);
          if (idx === -1) {
            reject({ response: { data: { errorCode: "RESOURCE_NOT_FOUND", message: "Recurso no encontrado" } } });
            return;
          }
          
          if (mockTiposTarea[idx].protegido) {
             reject({ response: { data: { errorCode: "PROTECTED_CATALOG_ITEM", message: "Este valor es necesario para el funcionamiento del sistema y no puede darse de baja." } } });
             return;
          }
          
          // ID 999 fallback error in MOCKS if ever triggered
          if (id === 999) {
             reject({ response: { data: { errorCode: "RESOURCE_IN_USE", message: "Este tipo de tarea no se puede dar de baja porque está en uso." } } });
             return;
          }

          mockTiposTarea.splice(idx, 1);
          resolve({
            message: "Tipo de tarea dado de baja correctamente",
            id_tipo_tarea: id,
          });
        }, 500);
      });
    }
    const response = await apiClient.delete<DeleteTipoTareaResponse>(`/tipos-tarea/${id}`);
    return response.data;
  },
};
