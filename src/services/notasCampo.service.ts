import { apiClient } from './api';
import { NotaCampoPayload, NotaCampoResponse, NotaCampoListado, ConvertirNotaPayload } from '../types/notasCampo.types';
import { mockFincas } from './fincas.service';
import { planesAccionService } from './planesAccion.service';
import { AxiosError } from 'axios';

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let mockNotaId = 1000;

// Estado en memoria para que se mantengan durante la sesión del mock
const mockNotas: (NotaCampoListado & { id_finca: number })[] = [
  {
    id_nota_campo: 901,
    contenido_nota_campo: 'Se observa baja humedad en el sector este.',
    fecha_captura_nc: new Date(Date.now() - 86400000).toISOString(),
    estado: 'Sincronizada',
    id_finca: 1, // Asumido
    id_parcela: null,
    nombre_parcela: null,
    nombre_usuario: 'Administrador Mock',
    nombre_rol_finca: 'Administrador de Finca',
  },
  {
    id_nota_campo: 902,
    contenido_nota_campo: 'Rastro de plaga en hojas bajas de la parcela.',
    fecha_captura_nc: new Date(Date.now() - 40000000).toISOString(),
    estado: 'Sincronizada',
    id_finca: 1, // Asumido
    id_parcela: 101, // Actualizado a id_parcela real del mock
    nombre_parcela: 'Lote Norte',
    nombre_usuario: 'Administrador Mock',
    nombre_rol_finca: 'Administrador de Finca',
  }
];

export const notasCampoService = {
  crearNotaCampo: async (data: NotaCampoPayload): Promise<NotaCampoResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await delay(300);
      
      mockNotaId++;
      const fecha = data.fecha_captura_nc || new Date().toISOString();
      
      // Intentar buscar el nombre de la parcela en mockFincas
      let nombreParcela = null;
      if (data.id_parcela) {
        const finca = mockFincas.find(f => f.id_finca === data.id_finca);
        const parcela = finca?.parcelas?.find(p => p.id_parcela === data.id_parcela);
        nombreParcela = parcela ? parcela.nombre_parcela : `Parcela ${data.id_parcela}`;
      }
      
      const nuevaNota = {
        id_nota_campo: mockNotaId,
        contenido_nota_campo: data.contenido_nota_campo,
        fecha_captura_nc: fecha,
        estado: 'Sincronizada',
        id_finca: data.id_finca,
        id_parcela: data.id_parcela || null,
        nombre_parcela: nombreParcela,
        nombre_usuario: 'Administrador Mock',
        nombre_rol_finca: 'Administrador de Finca',
      };
      
      mockNotas.unshift(nuevaNota); // Add to beginning
      
      return {
        message: 'Nota guardada correctamente',
        ...nuevaNota,
        id_usuario_finca: 1,
      };
    }

    const response = await apiClient.post<NotaCampoResponse>('/notas-campo', data);
    return response.data;
  },

  listarNotasPorFinca: async (id_finca: number): Promise<{ notas: NotaCampoListado[] }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await delay(300);
      return {
        notas: mockNotas.filter(n => n.id_finca === id_finca)
      };
    }
    const response = await apiClient.get<{ notas: NotaCampoListado[] }>(`/fincas/${id_finca}/notas-campo`);
    return response.data;
  },

  listarNotasPorParcela: async (id_parcela: number): Promise<{ notas: NotaCampoListado[] }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await delay(300);
      return {
        notas: mockNotas.filter(n => n.id_parcela === id_parcela)
      };
    }
    const response = await apiClient.get<{ notas: NotaCampoListado[] }>(`/parcelas/${id_parcela}/notas-campo`);
    return response.data;
  },

  convertirNotaEnTarea: async (id_nota_campo: number, data: ConvertirNotaPayload) => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await delay(400);

      const notaIdx = mockNotas.findIndex((n) => n.id_nota_campo === id_nota_campo);
      if (notaIdx === -1) {
        throw new Error('Nota no encontrada');
      }

      if (mockNotas[notaIdx].estado === 'Convertida_a_tarea') {
        const err = new AxiosError('Conflict');
        err.response = {
          data: { errorCode: 'NOTE_ALREADY_CONVERTED', message: 'La nota ya fue convertida' },
          status: 409,
        } as any;
        throw err;
      }

      // Buscar plan activo
      let idPlanAccion: number | null = null;
      for (const f of mockFincas) {
        const parcela = f.parcelas.find(p => p.id_parcela === data.id_parcela);
        if (parcela && parcela.cultivos_asignados) {
          const cultivo = parcela.cultivos_asignados.find((c: any) => c.estado === 'Activo' || !c.estado);
          if (cultivo && cultivo.id_plan_accion) {
            idPlanAccion = cultivo.id_plan_accion;
            break;
          }
        }
      }

      if (!idPlanAccion) {
        const err = new AxiosError('Bad Request');
        err.response = {
          data: { errorCode: 'PARCEL_WITHOUT_ACTION_PLAN', message: 'La parcela no tiene plan activo' },
          status: 400,
        } as any;
        throw err;
      }

      const resTarea = await planesAccionService.crearTarea(idPlanAccion, data.id_hito_real, data as any);

      // Actualizar la nota localmente para que se refleje
      mockNotas[notaIdx].estado = 'Convertida_a_tarea';

      return resTarea;
    }
    const response = await apiClient.post(`/notas-campo/${id_nota_campo}/convertir-en-tarea`, data);
    return response.data;
  },
};
