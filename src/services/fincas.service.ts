import { apiClient } from './api';
import { AxiosError } from 'axios';
import {
  FincasListResponse,
  FincaDetalle,
  FincaCreatePayload,
  FincaUpdatePayload,
  FincaStats,
  GetAdministradoresDisponiblesResponse,
  AsignarPropietarioPayload,
  CrearEditarParcelaPayload,
  ParcelaResumen,
  ParcelaByIdResponse,
  HistorialCultivosResponse,
  QRGenerarResponse,
  QRConsultarResponse
} from '../types/fincas.types';
import { MonitoreoSensoresResponse } from '../types/monitoreoSensores.types';
import { ClimaResponse } from '../types/clima.types';
import { mockUsuariosCroply } from './usuarios.service';
import { mockTiposSensor } from './tiposSensor.service';

// ============================================================================
// MOCKS
// ============================================================================

export let mockFincas: FincaDetalle[] = [
  {
    id_finca: 1,
    nombre_finca: 'Finca La Esperanza',
    provincia: 'Mendoza',
    departamento: 'Capital',
    longitud: '-68.8272',
    latitud: '-32.8908',
    superficie_finca: 150.5,
    descripcion_finca: 'Finca dedicada al cultivo de maíz.',
    propietario: {
      id_usuario: 55,
      id_usuario_finca: 201,
      nombre: 'Roberto',
      apellido: 'Sánchez',
      email: 'roberto@mail.com',
      estado: 'Activo',
    },
    estado: 'Activo',
    cantidad_parcelas: 2,
    cantidad_sensores: 2,
    parcelas: [
      {
        id_parcela: 101,
        nombre_parcela: 'Lote Norte',
        estado_parcela: 'Activa',
        superficie_parcela: 50.5,
        controladores: [
          {
            id_controlador_sensor: 7,
            nombre_controlador: 'Controlador Norte',
            ip_controlador: '192.168.1.10',
            estado_controlador: 'Transmitiendo',
            sensores: [
              {
                id_sensor: 501,
                codigo_tipo_sensor: 'PH',
                nombre_tipo_sensor: 'Sensor de pH',
                estado_senal: 'Transmitiendo',
                ultimo_valor: 7.2,
                fecha_ultima_lectura: '2026-09-02T10:00:00Z',
              },
            ],
          },
        ],
      },
      {
        id_parcela: 102,
        nombre_parcela: 'Lote Sur',
        estado_parcela: 'Activa',
        superficie_parcela: 100,
        controladores: [
          {
            id_controlador_sensor: 8,
            nombre_controlador: 'Controlador Sur',
            ip_controlador: '192.168.1.11',
            estado_controlador: 'Sin_senal',
            sensores: [
              {
                id_sensor: 502,
                codigo_tipo_sensor: 'HUM',
                nombre_tipo_sensor: 'Sensor de Humedad',
                estado_senal: 'Sin_senal',
                ultimo_valor: 45.0,
                fecha_ultima_lectura: '2026-09-01T15:30:00Z',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id_finca: 2,
    nombre_finca: 'Finca Los Álamos',
    provincia: 'Buenos Aires',
    departamento: 'Tandil',
    longitud: '-59.1367',
    latitud: '-37.3217',
    superficie_finca: 300,
    descripcion_finca: 'Producción mixta.',
    propietario: null,
    estado: 'Activo',
    cantidad_parcelas: 0,
    cantidad_sensores: 0,
    parcelas: [],
  },
];

let nextFincaId = 3;

// ============================================================================
// SERVICES
// ============================================================================

export const fincasService = {

  getMiFincaList: async () => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise<{ fincas: { id_finca: number; nombre_finca: string }[] }>((resolve) => {
        setTimeout(() => {
          const activas = mockFincas
            .filter(f => f.estado === 'Activo')
            .map(f => ({ id_finca: f.id_finca, nombre_finca: f.nombre_finca }));
          resolve({ fincas: activas });
        }, 500);
      });
    }
    const response = await apiClient.get('/mi-finca/fincas');
    return response.data;
  },

  getMiFincaResumen: async (id_finca: number) => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise<any>((resolve, reject) => {
        setTimeout(() => {
          const finca = mockFincas.find(f => f.id_finca === id_finca);
          if (!finca || finca.estado !== 'Activo') {
            return reject(new Error('FINCA_NOT_AVAILABLE'));
          }
          resolve({
            id_finca: finca.id_finca,
            nombre_finca: finca.nombre_finca,
            parcelas: finca.parcelas.map(p => ({
              id_parcela: p.id_parcela,
              nombre_parcela: p.nombre_parcela,
              estado_parcela: p.estado_parcela
            }))
          });
        }, 500);
      });
    }
    const response = await apiClient.get(`/fincas/${id_finca}/resumen`);
    return response.data;
  },

  getParcelaResumenDynamic: async (id_parcela: number) => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise<any>((resolve, reject) => {
        setTimeout(() => {
          let foundParcela: any = null;
          for (const f of mockFincas) {
            const p = f.parcelas.find(x => x.id_parcela === id_parcela);
            if (p) { foundParcela = p; break; }
          }
          if (!foundParcela) return reject(new Error('Not found'));
          
          const hasCultivo = foundParcela.cultivos_asignados && foundParcela.cultivos_asignados.length > 0;
          const cultivoActual = hasCultivo ? foundParcela.cultivos_asignados[0] : null;

          resolve({
            id_parcela: foundParcela.id_parcela,
            nombre_parcela: foundParcela.nombre_parcela,
            estado_parcela: foundParcela.estado_parcela,
            cultivo: cultivoActual ? {
              nombre_cultivo_base: cultivoActual.nombre_cultivo_base,
              nombre_variedad: cultivoActual.nombre_variedad,
              superficie_ocupada_pa: cultivoActual.superficie_asignada
            } : null,
            recomendacion_ia_resumen: null
          });
        }, 500);
      });
    }
    const response = await apiClient.get(`/parcelas/${id_parcela}/resumen`);
    return response.data;
  },

  getFincas: async (page = 1, pageSize = 10, estado?: string, search?: string): Promise<FincasListResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filtered = estado ? mockFincas.filter((f) => f.estado === estado) : mockFincas;
          if (search) {
            filtered = filtered.filter((f) => f.nombre_finca.toLowerCase().includes(search.toLowerCase()));
          }
          const totalItems = filtered.length;
          const totalPages = Math.ceil(totalItems / pageSize);
          const start = (page - 1) * pageSize;
          const fincasPaginadas = filtered.slice(start, start + pageSize).map((f) => ({
            id_finca: f.id_finca,
            nombre_finca: f.nombre_finca,
            propietario: f.propietario,
            provincia: f.provincia,
            departamento: f.departamento,
            longitud: f.longitud,
            latitud: f.latitud,
            cantidad_sensores: f.cantidad_sensores,
            estado: f.estado,
          }));
          resolve({
            fincas: fincasPaginadas,
            pagination: { page, pageSize, totalItems, totalPages },
          });
        }, 800);
      });
    }
    const response = await apiClient.get<FincasListResponse>('/fincas', {
      params: { page, pageSize, ...(estado ? { estado } : {}) },
    });
    return response.data;
  },

  getStats: async (): Promise<FincaStats> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve) => {
        setTimeout(() => {
          const activas = mockFincas.filter((f) => f.estado === 'Activo');
          const sensores = activas.reduce((acc, f) => acc + f.cantidad_sensores, 0);
          const superficie = activas.reduce((acc, f) => acc + f.superficie_finca, 0);
          resolve({
            sensores_totales: sensores,
            superficie_gestionada_total: parseFloat(superficie.toFixed(1)),
          });
        }, 600);
      });
    }
    const response = await apiClient.get<FincaStats>('/fincas/stats');
    return response.data;
  },

  getFincaById: async (id: number): Promise<FincaDetalle> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const finca = mockFincas.find((f) => f.id_finca === id);
          if (!finca) {
            const err = new AxiosError('Not found');
            err.response = {
              data: {
                statusCode: 404,
                errorCode: 'RESOURCE_NOT_FOUND',
                message: 'Finca no encontrada',
              },
              status: 404,
              statusText: 'Not Found',
              headers: {},
              config: {} as any,
            };
            return reject(err);
          }
          resolve(finca);
        }, 500);
      });
    }
    const response = await apiClient.get<FincaDetalle>(`/fincas/${id}`);
    return response.data;
  },

  getParcelaById: async (id_parcela: number): Promise<ParcelaByIdResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          for (const finca of mockFincas) {
            const p = finca.parcelas.find((px) => px.id_parcela === id_parcela);
            if (p) {
              return resolve({ 
                ...p, 
                id_finca: finca.id_finca,
                cultivos_asignados: p.cultivos_asignados || []
              } as ParcelaByIdResponse);
            }
          }
          const err = new AxiosError('Not found');
          err.response = {
            data: { statusCode: 404, message: 'Parcela no encontrada' },
            status: 404,
            statusText: 'Not Found',
            headers: {},
            config: {} as any,
          };
          return reject(err);
        }, 500);
      });
    }
    const response = await apiClient.get<ParcelaByIdResponse>(`/parcelas/${id_parcela}`);
    return response.data;
  },

  createFinca: async (data: FincaCreatePayload): Promise<FincaDetalle & { message: string }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const exists = mockFincas.some(
            (f) => f.nombre_finca.toLowerCase() === data.nombre_finca.toLowerCase()
          );
          if (exists) {
            const err = new AxiosError('Conflict');
            err.response = {
              data: {
                statusCode: 409,
                errorCode: 'DUPLICATE_VALUE',
                field: 'nombre_finca',
                message: 'El valor ingresado ya existe',
              },
              status: 409,
              statusText: 'Conflict',
              headers: {},
              config: {} as any,
            };
            return reject(err);
          }

          let propietarioObj = null;
          if (data.id_usuario_propietario) {
            const user = mockUsuariosCroply.find(u => u.id_usuario === data.id_usuario_propietario);
            if (user) {
              propietarioObj = {
                id_usuario: user.id_usuario,
                id_usuario_finca: Date.now(),
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                estado: user.estado as "Activo" | "Inactivo" | "Pendiente"
              };
            }
          }

          const mockParcelas = (data.parcelas || []).map((p: CrearEditarParcelaPayload, idx) => ({
            id_parcela: Date.now() + idx,
            nombre_parcela: p.nombre_parcela,
            superficie_parcela: p.superficie_parcela,
            estado_parcela: 'Activa',
            controladores: (p.controladores || []).map((c, cIdx) => ({
              id_controlador_sensor: Date.now() + 1000 + cIdx,
              nombre_controlador: c.nombre_controlador,
              ip_controlador: c.ip_controlador,
              estado_controlador: 'Transmitiendo',
              sensores: (c.sensores || []).map((s, sIdx) => {
                const tipoObj = mockTiposSensor.find(t => t.id_tipo_sensor === s.id_tipo_sensor);
                return {
                  id_sensor: Date.now() + 2000 + sIdx,
                  codigo_tipo_sensor: tipoObj?.codigo_tipo_sensor || `TS-${s.id_tipo_sensor}`,
                  nombre_tipo_sensor: tipoObj?.nombre_tipo_sensor || `Tipo ${s.id_tipo_sensor}`,
                  estado_senal: 'Transmitiendo',
                  ultimo_valor: null,
                  fecha_ultima_lectura: null
                };
              })
            }))
          }));

          const cantidadSensores = mockParcelas.reduce((acc, p) => 
            acc + p.controladores.reduce((cAcc, c) => cAcc + c.sensores.length, 0)
          , 0);

          const nuevaFinca: FincaDetalle = {
            id_finca: nextFincaId++,
            nombre_finca: data.nombre_finca,
            provincia: data.provincia,
            departamento: data.departamento,
            longitud: data.longitud,
            latitud: data.latitud,
            superficie_finca: data.superficie_finca,
            descripcion_finca: data.descripcion_finca || '',
            propietario: propietarioObj,
            estado: 'Activo',
            cantidad_parcelas: mockParcelas.length,
            cantidad_sensores: cantidadSensores,
            parcelas: mockParcelas as any,
          };
          mockFincas.unshift(nuevaFinca);
          resolve({ ...nuevaFinca, message: 'Finca creada correctamente' });
        }, 800);
      });
    }
    const response = await apiClient.post('/fincas', data);
    return response.data;
  },

  updateFinca: async (id: number, data: FincaUpdatePayload): Promise<{ message: string }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockFincas.findIndex((f) => f.id_finca === id);
          if (index === -1) return reject(new Error('Finca no encontrada'));

          const duplicate = mockFincas.some(
            (f) => f.id_finca !== id && f.nombre_finca.toLowerCase() === data.nombre_finca.toLowerCase()
          );
          if (duplicate) {
            const err = new AxiosError('Conflict');
            err.response = {
              data: {
                statusCode: 409,
                errorCode: 'DUPLICATE_VALUE',
                field: 'nombre_finca',
                message: 'El valor ingresado ya existe',
              },
              status: 409,
              statusText: 'Conflict',
              headers: {},
              config: {} as any,
            };
            return reject(err);
          }

          mockFincas[index] = {
            ...mockFincas[index],
            nombre_finca: data.nombre_finca,
            superficie_finca: data.superficie_finca,
            descripcion_finca: data.descripcion_finca || '',
          };
          resolve({ message: 'Finca actualizada correctamente' });
        }, 800);
      });
    }
    const response = await apiClient.put(`/fincas/${id}`, data);
    return response.data;
  },

  deleteFinca: async (id: number): Promise<{ message: string }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = mockFincas.findIndex((f) => f.id_finca === id);
          if (index !== -1) {
            mockFincas[index].estado = 'Inactivo';
          }
          resolve({
            message: 'Finca dada de baja correctamente. Las parcelas y datos asociados fueron actualizados.',
          });
        }, 800);
      });
    }
    const response = await apiClient.delete(`/fincas/${id}`);
    return response.data;
  },

  getAdministradoresFincaDisponibles: async (): Promise<GetAdministradoresDisponiblesResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve) => {
        setTimeout(() => {
          const disponibles = mockUsuariosCroply
            .filter(u => u.rol?.nombre_rol === "Administrador de Finca")
            .map(u => ({
              id_usuario: u.id_usuario,
              nombre: u.nombre,
              apellido: u.apellido,
              email: u.email
            }));
          resolve({ usuarios: disponibles });
        }, 500);
      });
    }
    const response = await apiClient.get<GetAdministradoresDisponiblesResponse>('/usuarios/administradores-finca-disponibles');
    return response.data;
  },

  asignarPropietario: async (id_finca: number, payload: AsignarPropietarioPayload): Promise<{ message: string }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const finca = mockFincas.find(f => f.id_finca === id_finca);
          if (!finca) return reject(new Error('Finca no encontrada'));

          if (payload.id_usuario_propietario === null) {
            finca.propietario = null;
          } else {
            const user = mockUsuariosCroply.find(u => u.id_usuario === payload.id_usuario_propietario);
            if (!user) return reject(new Error('Usuario no encontrado'));
            finca.propietario = {
              id_usuario: user.id_usuario,
              id_usuario_finca: Date.now(),
              nombre: user.nombre,
              apellido: user.apellido,
              email: user.email,
              estado: user.estado as "Activo" | "Inactivo" | "Pendiente"
            };
          }
          resolve({ message: 'Propietario actualizado correctamente' });
        }, 500);
      });
    }
    const response = await apiClient.put(`/fincas/${id_finca}/propietario`, payload);
    return response.data;
  },

  createParcela: async (id_finca: number, data: CrearEditarParcelaPayload): Promise<{ message: string; parcela: ParcelaResumen }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const finca = mockFincas.find(f => f.id_finca === id_finca);
          if (!finca) return reject(new Error('Finca no encontrada'));

          const duplicate = finca.parcelas.some(p => p.nombre_parcela.toLowerCase() === data.nombre_parcela.toLowerCase());
          if (duplicate) {
            const err = new AxiosError('Conflict');
            err.response = {
              data: {
                statusCode: 409,
                errorCode: 'DUPLICATE_VALUE',
                field: 'nombre_parcela',
                message: 'El valor ingresado ya existe',
              },
              status: 409,
              statusText: 'Conflict',
              headers: {},
              config: {} as any,
            };
            return reject(err);
          }

          const currentTotal = finca.parcelas.reduce((acc, p) => acc + (p.superficie_parcela || 0), 0);
          if (currentTotal + data.superficie_parcela > finca.superficie_finca) {
            const err = new AxiosError('Conflict');
            err.response = {
              data: {
                statusCode: 409,
                errorCode: 'INVALID_VALUE',
                field: 'superficie_parcela',
                message: `Excede la superficie disponible de la finca (total: ${finca.superficie_finca} ha)`,
              },
              status: 409,
              statusText: 'Conflict',
              headers: {},
              config: {} as any,
            };
            return reject(err);
          }

          const nuevaParcela: ParcelaResumen = {
            id_parcela: Date.now(),
            nombre_parcela: data.nombre_parcela,
            estado_parcela: 'Activo',
            superficie_parcela: data.superficie_parcela,
            controladores: (data.controladores || []).map(c => ({
              id_controlador_sensor: Date.now() + Math.floor(Math.random() * 1000),
              nombre_controlador: c.nombre_controlador,
              ip_controlador: c.ip_controlador,
              estado_controlador: 'Transmitiendo',
              sensores: (c.sensores || []).map(s => {
                const tipoObj = mockTiposSensor.find(t => t.id_tipo_sensor === s.id_tipo_sensor);
                return {
                  id_sensor: Date.now() + Math.floor(Math.random() * 10000),
                  codigo_tipo_sensor: tipoObj?.codigo_tipo_sensor || `TS-${s.id_tipo_sensor}`,
                  nombre_tipo_sensor: tipoObj?.nombre_tipo_sensor || `Tipo ${s.id_tipo_sensor}`,
                  estado_senal: 'Transmitiendo',
                  ultimo_valor: null,
                  fecha_ultima_lectura: null
                };
              })
            }))
          };

          finca.parcelas.unshift(nuevaParcela);
          finca.cantidad_parcelas++;
          resolve({ message: 'Parcela creada correctamente', parcela: nuevaParcela });
        }, 800);
      });
    }
    const response = await apiClient.post(`/fincas/${id_finca}/parcelas`, data);
    return response.data;
  },

  updateParcela: async (id_finca: number, id_parcela: number, data: CrearEditarParcelaPayload): Promise<{ message: string; parcela: ParcelaResumen }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const finca = mockFincas.find(f => f.id_finca === id_finca);
          if (!finca) return reject(new Error('Finca no encontrada'));

          const duplicate = finca.parcelas.some(p => p.id_parcela !== id_parcela && p.nombre_parcela.toLowerCase() === data.nombre_parcela.toLowerCase());
          if (duplicate) {
            const err = new AxiosError('Conflict');
            err.response = {
              data: {
                statusCode: 409,
                errorCode: 'DUPLICATE_VALUE',
                field: 'nombre_parcela',
                message: 'El valor ingresado ya existe',
              },
              status: 409,
              statusText: 'Conflict',
              headers: {},
              config: {} as any,
            };
            return reject(err);
          }

          const parcelaIndex = finca.parcelas.findIndex(p => p.id_parcela === id_parcela);
          if (parcelaIndex === -1) return reject(new Error('Parcela no encontrada'));

          const currentTotalOthers = finca.parcelas.reduce((acc, p) => p.id_parcela === id_parcela ? acc : acc + (p.superficie_parcela || 0), 0);
          if (currentTotalOthers + data.superficie_parcela > finca.superficie_finca) {
            const err = new AxiosError('Conflict');
            err.response = {
              data: {
                statusCode: 409,
                errorCode: 'INVALID_VALUE',
                field: 'superficie_parcela',
                message: `Excede la superficie disponible de la finca (total: ${finca.superficie_finca} ha)`,
              },
              status: 409,
              statusText: 'Conflict',
              headers: {},
              config: {} as any,
            };
            return reject(err);
          }

          const updatedParcela: ParcelaResumen = {
            ...finca.parcelas[parcelaIndex],
            nombre_parcela: data.nombre_parcela,
            superficie_parcela: data.superficie_parcela,
            controladores: (data.controladores || []).map(c => ({
              id_controlador_sensor: c.id_controlador_sensor || Date.now() + Math.floor(Math.random() * 1000),
              nombre_controlador: c.nombre_controlador,
              ip_controlador: c.ip_controlador,
              estado_controlador: 'Transmitiendo',
              sensores: (c.sensores || []).map(s => {
                const tipoObj = mockTiposSensor.find(t => t.id_tipo_sensor === s.id_tipo_sensor);
                return {
                  id_sensor: s.id_sensor || Date.now() + Math.floor(Math.random() * 10000),
                  codigo_tipo_sensor: tipoObj?.codigo_tipo_sensor || `TS-${s.id_tipo_sensor}`,
                  nombre_tipo_sensor: tipoObj?.nombre_tipo_sensor || `Tipo ${s.id_tipo_sensor}`,
                  estado_senal: 'Transmitiendo',
                  ultimo_valor: null,
                  fecha_ultima_lectura: null
                };
              })
            }))
          };

          finca.parcelas[parcelaIndex] = updatedParcela;
          resolve({ message: 'Parcela actualizada correctamente', parcela: updatedParcela });
        }, 800);
      });
    }
    const response = await apiClient.put(`/fincas/${id_finca}/parcelas/${id_parcela}`, data);
    return response.data;
  },

  deleteParcela: async (id_finca: number, id_parcela: number): Promise<{ message: string }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const finca = mockFincas.find(f => f.id_finca === id_finca);
          if (!finca) return reject(new Error('Finca no encontrada'));

          const parcela = finca.parcelas.find(p => p.id_parcela === id_parcela);
          if (parcela) {
            parcela.estado_parcela = 'Inactivo';
            finca.cantidad_parcelas = Math.max(0, finca.cantidad_parcelas - 1);
          }
          resolve({ message: 'Parcela dada de baja correctamente. Las tareas pendientes fueron canceladas y el cultivo activo fue inactivado.' });
        }, 800);
      });
    }
    const response = await apiClient.delete(`/fincas/${id_finca}/parcelas/${id_parcela}`);
    return response.data;
  },

  getHistorialCultivosParcela: async (id_parcela: number): Promise<HistorialCultivosResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (id_parcela === 101) {
            resolve({
              historial: [
                {
                  id_plan_accion: 10,
                  nombre_cultivo_base: 'Tomate',
                  nombre_variedad: 'Perita',
                  superficie_ocupada_pa: 20,
                  fecha_inicio_pa: '2023-08-01',
                  fecha_fin_pa: '2023-12-15',
                  estado: 'Finalizado'
                },
                {
                  id_plan_accion: 11,
                  nombre_cultivo_base: 'Zanahoria',
                  nombre_variedad: 'Criolla',
                  superficie_ocupada_pa: 15,
                  fecha_inicio_pa: '2023-01-10',
                  fecha_fin_pa: '2023-04-20',
                  estado: 'FinalizadoPorContingencia'
                },
                {
                  id_plan_accion: 12,
                  nombre_cultivo_base: 'Papa',
                  nombre_variedad: 'Spunta',
                  superficie_ocupada_pa: 25,
                  fecha_inicio_pa: '2022-09-01',
                  fecha_fin_pa: '2022-12-10',
                  estado: 'Inactivado'
                },
                {
                  id_plan_accion: 13,
                  nombre_cultivo_base: 'Lechuga',
                  nombre_variedad: 'Mantecosa',
                  superficie_ocupada_pa: 10,
                  fecha_inicio_pa: '2024-02-01',
                  fecha_fin_pa: null,
                  estado: 'Activo'
                }
              ]
            });
          } else {
            resolve({ historial: [] });
          }
        }, 500);
      });
    }
    const response = await apiClient.get<HistorialCultivosResponse>(`/parcelas/${id_parcela}/historial-cultivos`);
    return response.data;
  },

  generarQRParcela: async (id_parcela: number): Promise<QRGenerarResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve) => {
        setTimeout(() => {
          let found = null;
          for (const finca of mockFincas) {
            const p = finca.parcelas.find((px: any) => px.id_parcela === id_parcela);
            if (p) { 
              found = p;
              break;
            }
          }
          if (found) {
            if (!found.fecha_generacion_qr) {
              found.fecha_generacion_qr = new Date().toISOString();
              found.url_acceso_qr = `https://croply.app/qr/parcela/${id_parcela}`;
            }
            resolve({
              message: 'QR generado con éxito',
              url_acceso_qr: found.url_acceso_qr as string,
              fecha_generacion_qr: found.fecha_generacion_qr as string
            });
          } else {
            throw new Error('Parcela not found');
          }
        }, 600);
      });
    }
    const response = await apiClient.post<QRGenerarResponse>(`/parcelas/${id_parcela}/codigo-qr`);
    return response.data;
  },

  consultarQRParcela: async (id_parcela: number): Promise<QRConsultarResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve) => {
        setTimeout(() => {
          let found = null;
          for (const finca of mockFincas) {
            const p = finca.parcelas.find((px: any) => px.id_parcela === id_parcela);
            if (p) { 
              found = p;
              break;
            }
          }
          if (found && found.fecha_generacion_qr) {
            resolve({
              url_acceso_qr: found.url_acceso_qr as string,
              fecha_generacion_qr: found.fecha_generacion_qr as string
            });
          } else {
            throw new Error('QR not found');
          }
        }, 400);
      });
    }
    const response = await apiClient.get<QRConsultarResponse>(`/parcelas/${id_parcela}/codigo-qr`);
    return response.data;
  },

  getMonitoreoSensoresParcela: async (id_parcela: number): Promise<MonitoreoSensoresResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let found = null;
          for (const finca of mockFincas) {
            const p = finca.parcelas.find((px: any) => px.id_parcela === id_parcela);
            if (p) { 
              found = p;
              break;
            }
          }
          if (found) {
            const sensores: any[] = [];
            found.controladores.forEach((c: any) => {
              c.sensores.forEach((s: any) => {
                sensores.push({
                  id_sensor: s.id_sensor,
                  nombre_tipo_sensor: s.nombre_tipo_sensor,
                  unidad_medida_ts: s.codigo_tipo_sensor === 'PH' ? 'pH' : (s.codigo_tipo_sensor === 'HUM' ? '%' : ''),
                  ultimo_valor: s.ultimo_valor,
                  fecha_ultima_lectura: s.fecha_ultima_lectura,
                  estado_senal: s.estado_senal
                });
              });
            });

            if (sensores.length === 0) {
              return resolve({ estado_general: null, sensores: [] });
            }

            const todosSinSenal = sensores.every(s => s.estado_senal === 'Sin_senal');
            resolve({
              estado_general: todosSinSenal ? 'Sin_senal' : 'Transmitiendo',
              sensores
            });
          } else {
            const err = new AxiosError('Not found');
            err.response = {
              data: { statusCode: 404, errorCode: 'RESOURCE_NOT_FOUND', message: 'Parcela no encontrada' },
              status: 404,
              statusText: 'Not Found',
              headers: {},
              config: {} as any,
            };
            reject(err);
          }
        }, 500);
      });
    }
    const response = await apiClient.get<MonitoreoSensoresResponse>(`/parcelas/${id_parcela}/monitoreo-sensores`);
    return response.data;
  },

  getClimaFinca: async (id_finca: number): Promise<ClimaResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulamos error 503 para la Finca 2
          if (id_finca === 2) {
            const err = new AxiosError('Service Unavailable');
            err.response = {
              data: { statusCode: 503, errorCode: 'WEATHER_SERVICE_UNAVAILABLE', message: 'Servicio meteorológico no disponible' },
              status: 503,
              statusText: 'Service Unavailable',
              headers: {},
              config: {} as any,
            };
            return reject(err);
          }

          const finca = mockFincas.find((f) => f.id_finca === id_finca);
          if (!finca) {
            const err = new AxiosError('Not found');
            err.response = {
              data: { statusCode: 404, errorCode: 'RESOURCE_NOT_FOUND', message: 'Finca no encontrada' },
              status: 404,
              statusText: 'Not Found',
              headers: {},
              config: {} as any,
            };
            return reject(err);
          }

          const hoy = new Date();
          const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
          
          const response: ClimaResponse = {
            provincia: finca.provincia,
            departamento: finca.departamento,
            clima_actual: {
              temperatura: 22,
              condicion: 'Despejado'
            },
            pronostico: [
              {
                fecha: hoy.toISOString().split('T')[0],
                dia_semana: 'Hoy',
                es_hoy: true,
                temperatura_max: 24,
                temperatura_min: 15,
                condicion: 'Despejado'
              },
              {
                fecha: new Date(hoy.getTime() + 86400000).toISOString().split('T')[0],
                dia_semana: dias[new Date(hoy.getTime() + 86400000).getDay()],
                es_hoy: false,
                temperatura_max: 19,
                temperatura_min: 12,
                condicion: 'Lluvia'
              },
              {
                fecha: new Date(hoy.getTime() + 86400000 * 2).toISOString().split('T')[0],
                dia_semana: dias[new Date(hoy.getTime() + 86400000 * 2).getDay()],
                es_hoy: false,
                temperatura_max: 22,
                temperatura_min: 14,
                condicion: 'Parcialmente nublado'
              },
              {
                fecha: new Date(hoy.getTime() + 86400000 * 3).toISOString().split('T')[0],
                dia_semana: dias[new Date(hoy.getTime() + 86400000 * 3).getDay()],
                es_hoy: false,
                temperatura_max: 21,
                temperatura_min: 13,
                condicion: 'Nublado'
              }
            ]
          };
          resolve(response);
        }, 600);
      });
    }
    const response = await apiClient.get<ClimaResponse>(`/fincas/${id_finca}/clima`);
    return response.data;
  }
};