import { apiClient } from './api';
import { AxiosError } from 'axios';
import { SolicitudDigitalizacionRequest, SolicitudDigitalizacionResponse } from '../types/solicitudes.types';

export interface GetSolicitudesRequest {
  page: number;
  pageSize: number;
  search?: string;
  estado?: string;
}

/** El backend valida `estado` como enum: los centinelas de la UI no viajan. */
function limpiarFiltrosSolicitudes(params: GetSolicitudesRequest) {
  const { search, estado, ...resto } = params;
  return {
    ...resto,
    ...(search?.trim() ? { search: search.trim() } : {}),
    ...(estado && estado !== 'todos' ? { estado } : {}),
  };
}

function filtrarMockSolicitudes(params: GetSolicitudesRequest) {
  let filtradas = [...mockSolicitudes];

  if (params.search?.trim()) {
    const s = params.search.trim().toLowerCase();
    filtradas = filtradas.filter(
      (x) =>
        x.nombre_completo.toLowerCase().includes(s) ||
        x.correo_electronico.toLowerCase().includes(s)
    );
  }
  if (params.estado && params.estado !== 'todos') {
    filtradas = filtradas.filter((x) => x.estado === params.estado);
  }

  return filtradas;
}

export const solicitudesService = {
  solicitarDigitalizacion: async (data: SolicitudDigitalizacionRequest): Promise<SolicitudDigitalizacionResponse> => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    if (useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Simulamos error de negocio (ej. validación fallida por algún motivo exótico, o 500)
      if (data.correo_electronico === 'error@finca.com') {
        const err = new AxiosError('Unexpected Error');
        err.response = {
          data: {
            statusCode: 500,
            errorCode: 'UNEXPECTED_ERROR',
            message: 'Ha ocurrido un error al procesar su solicitud, intente nuevamente',
          },
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as any,
        };
        return Promise.reject(err);
      }

      // Respuesta de éxito (201 Created mock)
      const newSolicitud = {
        message: '¡Solicitud enviada con éxito! Nuestro equipo se pondrá en contacto a la brevedad.',
        id_solicitud_df: Math.floor(Math.random() * 1000) + 1,
        nombre_completo: data.nombre_completo,
        correo_electronico: data.correo_electronico,
        estado: 'Pendiente',
        fecha_solicitud: new Date().toISOString(),
      };
      
      mockSolicitudes.unshift({
        ...newSolicitud,
        telefono_contacto: data.telefono_contacto,
        provincia: data.provincia,
        departamento: data.departamento,
        localidad: data.localidad,
        numero_parcelas: data.numero_parcelas,
        superficie_total_hectareas: data.superficie_total_hectareas,
        comentario_adicional: data.comentario_adicional
      });
      
      return newSolicitud;
    }

    const response = await apiClient.post<SolicitudDigitalizacionResponse>('/solicitudes-digitalizacion', data);
    return response.data;
  },

  getSolicitudes: async (params: GetSolicitudesRequest): Promise<any> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve) => {
        setTimeout(() => {
          const filtradas = filtrarMockSolicitudes(params);
          const start = (params.page - 1) * params.pageSize;
          const end = start + params.pageSize;
          const paginatedItems = filtradas.slice(start, end).map(s => ({
            id_solicitud_df: s.id_solicitud_df,
            fecha_solicitud: s.fecha_solicitud,
            nombre_completo: s.nombre_completo,
            correo_electronico: s.correo_electronico,
            telefono_contacto: s.telefono_contacto,
            estado: s.estado
          }));
          resolve({
            solicitudes: paginatedItems,
            pagination: {
              page: params.page,
              pageSize: params.pageSize,
              totalItems: filtradas.length,
              totalPages: Math.ceil(filtradas.length / params.pageSize)
            }
          });
        }, 500);
      });
    }
    const response = await apiClient.get('/solicitudes-digitalizacion', {
      params: limpiarFiltrosSolicitudes(params),
    });
    return response.data;
  },

  getSolicitud: async (id: number): Promise<any> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const solicitud = mockSolicitudes.find(s => s.id_solicitud_df === id);
          if (!solicitud) {
            reject(new Error("Solicitud no encontrada"));
          } else {
            resolve(solicitud);
          }
        }, 500);
      });
    }
    const response = await apiClient.get(`/solicitudes-digitalizacion/${id}`);
    return response.data;
  },

  updateEstado: async (id: number, estado: string): Promise<{ message: string }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const idx = mockSolicitudes.findIndex(s => s.id_solicitud_df === id);
          if (idx === -1) return reject(new Error("Solicitud no encontrada"));
          mockSolicitudes[idx].estado = estado;
          resolve({ message: "Estado actualizado correctamente." });
        }, 500);
      });
    }
    const response = await apiClient.put(`/solicitudes-digitalizacion/${id}/estado`, { estado });
    return response.data;
  }
};

let mockSolicitudes: any[] = [
  {
    id_solicitud_df: 1,
    fecha_solicitud: "2024-03-20T10:30:00Z",
    nombre_completo: "Juan Pérez",
    correo_electronico: "juan.perez@fincasur.com",
    telefono_contacto: "+54 9 11 1234-5678",
    estado: "Pendiente",
    provincia: "Mendoza",
    departamento: "Luján de Cuyo",
    localidad: "Agrelo",
    numero_parcelas: 5,
    superficie_total_hectareas: 150.5,
    comentario_adicional: "Interesados en integrar sensores de humedad"
  },
  {
    id_solicitud_df: 2,
    fecha_solicitud: "2024-03-19T14:15:00Z",
    nombre_completo: "María González",
    correo_electronico: "maria.g@agrovalle.com",
    telefono_contacto: "+54 9 261 555-0123",
    estado: "Contactado",
    provincia: "San Juan",
    departamento: "Pocito",
    localidad: "Carpintería",
    numero_parcelas: 2,
    superficie_total_hectareas: 80,
  },
  {
    id_solicitud_df: 3,
    fecha_solicitud: "2024-03-18T09:45:00Z",
    nombre_completo: "Roberto Sánchez",
    correo_electronico: "rsanchez@viñasaltas.com",
    telefono_contacto: "+54 9 387 444-9999",
    estado: "Aprobada",
    provincia: "Salta",
    departamento: "Cafayate",
    localidad: "Cafayate",
    numero_parcelas: 10,
    superficie_total_hectareas: 300,
    comentario_adicional: "Necesitamos digitalizar urgentemente antes de la próxima vendimia."
  },
  {
    id_solicitud_df: 4,
    fecha_solicitud: "2024-03-17T16:20:00Z",
    nombre_completo: "Laura Martínez",
    correo_electronico: "laura.m@fincaelretiro.com",
    telefono_contacto: "+54 9 261 333-7777",
    estado: "Rechazada",
    provincia: "Mendoza",
    departamento: "Maipú",
    localidad: "Coquimbito",
    numero_parcelas: 1,
    superficie_total_hectareas: 5,
  },
  {
    id_solicitud_df: 5,
    fecha_solicitud: "2024-03-16T11:10:00Z",
    nombre_completo: "Carlos Rodríguez",
    correo_electronico: "crodriguez@agro.com",
    telefono_contacto: "+54 9 11 2222-3333",
    estado: "Pendiente",
    provincia: "Buenos Aires",
    departamento: "Pergamino",
    localidad: "Pergamino",
    numero_parcelas: 15,
    superficie_total_hectareas: 500,
  }
];
