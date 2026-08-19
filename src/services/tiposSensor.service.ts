import { apiClient } from "./api";
import {
  ListarTiposSensorResponse,
  ConsultarCodigosDisponiblesResponse,
  CreateTipoSensorRequest,
  CreateTipoSensorResponse,
  UpdateTipoSensorRequest,
  UpdateTipoSensorResponse,
  DeleteTipoSensorResponse,
  TipoSensor
} from "@/types/tiposSensor.types";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

let mockTiposSensor: TipoSensor[] = [
  {
    id_tipo_sensor: 15,
    codigo_tipo_sensor: "PH",
    nombre_tipo_sensor: "Sensor de pH",
    unidad_medida_ts: "pH",
  },
  {
    id_tipo_sensor: 16,
    codigo_tipo_sensor: "HUMEDAD_SUELO",
    nombre_tipo_sensor: "Sensor de humedad del suelo",
    unidad_medida_ts: "%",
  },
];

let nextId = 17;

export const tiposSensorService = {
  async getTiposSensor(): Promise<ListarTiposSensorResponse> {
    if (USE_MOCKS) {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ tipos_sensor: [...mockTiposSensor] }), 500);
      });
    }
    const response = await apiClient.get<ListarTiposSensorResponse>("/tipos-sensor");
    return response.data;
  },

  async getCodigosDisponibles(): Promise<ConsultarCodigosDisponiblesResponse> {
    if (USE_MOCKS) {
      return new Promise((resolve) => {
        setTimeout(
          () =>
            resolve({
              codigos_tipo_sensor: [
                "TEMP_HUME_AMBIENTAL",
                "HUMEDAD_SUELO",
                "RADIACION_SOLAR",
                "PRECIPITACION",
                "PH",
              ],
            }),
          300
        );
      });
    }
    const response = await apiClient.get<ConsultarCodigosDisponiblesResponse>(
      "/tipos-sensor/codigos-disponibles"
    );
    return response.data;
  },

  async createTipoSensor(data: CreateTipoSensorRequest): Promise<CreateTipoSensorResponse> {
    if (USE_MOCKS) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (mockTiposSensor.some((t) => t.nombre_tipo_sensor === data.nombre_tipo_sensor)) {
            reject({ response: { data: { errorCode: "ERR-02", field: "nombre_tipo_sensor", message: "El nombre del tipo de sensor ya existe." } } });
            return;
          }
          const nuevo = {
            id_tipo_sensor: nextId++,
            codigo_tipo_sensor: data.codigo_tipo_sensor,
            nombre_tipo_sensor: data.nombre_tipo_sensor,
            unidad_medida_ts: data.unidad_medida_ts,
          };
          mockTiposSensor.push(nuevo);
          resolve({
            ...nuevo,
            message: "Tipo de sensor creado correctamente.",
            fecha_alta: new Date().toISOString().split("T")[0],
            fecha_baja: null,
          });
        }, 500);
      });
    }
    const response = await apiClient.post<CreateTipoSensorResponse>("/tipos-sensor", data);
    return response.data;
  },

  async updateTipoSensor(id: number, data: UpdateTipoSensorRequest): Promise<UpdateTipoSensorResponse> {
    if (USE_MOCKS) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const idx = mockTiposSensor.findIndex((t) => t.id_tipo_sensor === id);
          if (idx === -1) {
            reject({ response: { data: { errorCode: "ERR-05", message: "Recurso no encontrado" } } });
            return;
          }
          if (mockTiposSensor.some((t) => t.nombre_tipo_sensor === data.nombre_tipo_sensor && t.id_tipo_sensor !== id)) {
            reject({ response: { data: { errorCode: "ERR-02", field: "nombre_tipo_sensor", message: "El nombre del tipo de sensor ya existe." } } });
            return;
          }
          mockTiposSensor[idx] = { ...mockTiposSensor[idx], ...data };
          resolve({
            message: "Tipo de sensor actualizado correctamente.",
            ...mockTiposSensor[idx],
          });
        }, 500);
      });
    }
    const response = await apiClient.put<UpdateTipoSensorResponse>(`/tipos-sensor/${id}`, data);
    return response.data;
  },

  async deleteTipoSensor(id: number): Promise<DeleteTipoSensorResponse> {
    if (USE_MOCKS) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const idx = mockTiposSensor.findIndex((t) => t.id_tipo_sensor === id);
          if (idx === -1) {
            reject({ response: { data: { errorCode: "ERR-05", message: "Recurso no encontrado" } } });
            return;
          }
          // ID 15 fallará a propósito para simular RESOURCE_IN_USE (como indica el Contrato que no puede darse de baja si hay sensores)
          if (id === 15) {
            reject({ response: { data: { errorCode: "RESOURCE_IN_USE", message: "No es posible dar de baja este tipo de sensor porque está asignado a una o más parcelas." } } });
            return;
          }
          mockTiposSensor.splice(idx, 1);
          resolve({
            message: "Tipo de sensor dado de baja correctamente.",
            id_tipo_sensor: id,
          });
        }, 500);
      });
    }
    const response = await apiClient.delete<DeleteTipoSensorResponse>(`/tipos-sensor/${id}`);
    return response.data;
  },
};
