import { AxiosError } from 'axios';
import { apiClient } from './api';
import {
  ListarPreguntasFrecuentesGestionRequest,
  ListarPreguntasFrecuentesGestionResponse,
  CrearPreguntaFrecuenteRequest,
  CrearPreguntaFrecuenteResponse,
  EditarPreguntaFrecuenteRequest,
  EditarPreguntaFrecuenteResponse,
  EliminarPreguntaFrecuenteResponse,
  ConsultarPreguntasFrecuentesResponse,
  ConfiguracionSoporteResponse,
  PreguntaFrecuente,
} from '@/types/soporte.types';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const MOCK_MANUAL_USUARIO_URL: string | null = 'https://ejemplo.com/manual-croply';
export const MOCK_SOPORTE_EMAIL: string | null = 'croplyagronomia@gmail.com';

interface MockPreguntaFrecuente extends PreguntaFrecuente {
  fecha_alta: string;
  fecha_baja: string | null;
}

export function esPreguntaActiva(p: { fecha_baja?: string | null }): boolean {
  return p.fecha_baja === null || p.fecha_baja === undefined;
}

export function normalizarPregunta(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^[¿¡"'\s]+/, '')
    .replace(/[?!.,;:"'\s]+$/, '')
    .trim();
}

const crearErrorDuplicado = () => {
  const err = new AxiosError('El valor ingresado ya existe');
  err.response = {
    data: {
      statusCode: 409,
      errorCode: 'DUPLICATE_VALUE',
      field: 'pregunta',
      message: 'El valor ingresado ya existe',
    },
    status: 409,
    statusText: 'Conflict',
    headers: {},
    config: {} as any,
  };
  return err;
};

const crearErrorNoEncontrado = () => {
  const err = new AxiosError('La pregunta frecuente solicitada no existe o ya fue eliminada.');
  err.response = {
    data: {
      statusCode: 404,
      errorCode: 'RESOURCE_NOT_FOUND',
      message: 'La pregunta frecuente solicitada no existe o ya fue eliminada.',
    },
    status: 404,
    statusText: 'Not Found',
    headers: {},
    config: {} as any,
  };
  return err;
};

let nextId = 13;

export let mockPreguntasFrecuentes: MockPreguntaFrecuente[] = [
  {
    id_pregunta_frecuente: 12,
    pregunta: '¿Cómo descargo los reportes de costos en formato PDF?',
    respuesta: 'En la sección Costos, hacé clic en el botón "Exportar Reporte", seleccioná el rango de fechas deseado y confirmá la descarga.',
    fecha_alta: '2026-03-12T10:00:00.000Z',
    fecha_baja: null,
  },
  {
    id_pregunta_frecuente: 11,
    pregunta: '¿Quién puede autorizar solicitudes de digitalización de fincas?',
    respuesta: 'Únicamente los usuarios con rol Administrador Croply y permiso de Solicitudes de digitalización pueden revisar y aprobar nuevos ingresos.',
    fecha_alta: '2026-03-11T10:00:00.000Z',
    fecha_baja: null,
  },
  {
    id_pregunta_frecuente: 10,
    pregunta: '¿Cómo genero un plan de acción para una nueva temporada?',
    respuesta: 'Dirigite a la Biblioteca de Cultivos, elegí el cultivo y variedad deseados, y presioná "Generar Plan de Acción".',
    fecha_alta: '2026-03-10T10:00:00.000Z',
    fecha_baja: null,
  },
  {
    id_pregunta_frecuente: 9,
    pregunta: '¿Puedo registrar tareas de campo sin conexión a internet?',
    respuesta: 'Sí, las notas y observaciones se almacenan localmente en su dispositivo y se sincronizan automáticamente en cuanto se restablece la conexión.',
    fecha_alta: '2026-03-09T10:00:00.000Z',
    fecha_baja: null,
  },
  {
    id_pregunta_frecuente: 8,
    pregunta: '¿Cómo se calculan los costos de producción mensuales?',
    respuesta: 'Los costos se totalizan a partir de los gastos registrados en insumos, mano de obra y servicios durante el mes calendario en curso.',
    fecha_alta: '2026-03-08T10:00:00.000Z',
    fecha_baja: null,
  },
  {
    id_pregunta_frecuente: 7,
    pregunta: '¿Qué formato deben tener las imágenes que subo al sistema?',
    respuesta: 'Se admiten formatos JPEG, PNG y WebP con un tamaño máximo de 5 MB por archivo.',
    fecha_alta: '2026-03-07T10:00:00.000Z',
    fecha_baja: null,
  },
  {
    id_pregunta_frecuente: 6,
    pregunta: '¿Dónde configuro los umbrales de alerta de los sensores?',
    respuesta: 'En el detalle de cada parcela, dentro del panel de monitoreo ambiental, podés definir los rangos óptimos de temperatura y humedad.',
    fecha_alta: '2026-03-06T10:00:00.000Z',
    fecha_baja: null,
  },
  {
    id_pregunta_frecuente: 5,
    pregunta: '¿Cómo asigno un trabajador a una parcela?',
    respuesta: 'Desde el módulo Gestión de Usuarios, seleccioná al trabajador y asignale la parcela o las tareas correspondientes.',
    fecha_alta: '2026-03-05T10:00:00.000Z',
    fecha_baja: null,
  },
  {
    id_pregunta_frecuente: 4,
    pregunta: '¿Cómo registro una aplicación de agroquímico?',
    respuesta: 'Ingresá a la sección Agroquímicos y presioná "Registrar Aplicación".',
    fecha_alta: '2026-03-04T10:00:00.000Z',
    fecha_baja: null,
  },
  {
    id_pregunta_frecuente: 3,
    pregunta: '¿Cómo agregar un nuevo tipo de cultivo no listado?',
    respuesta: 'Los nuevos cultivos se gestionan desde el módulo de Catálogos Base. Debe tener permisos de SuperAdmin para crear entradas globales o solicitarlo vía ticket técnico.',
    fecha_alta: '2026-03-03T10:00:00.000Z',
    fecha_baja: null,
  },
  {
    id_pregunta_frecuente: 2,
    pregunta: '¿Es posible exportar los mapas de suelo en formato PDF?',
    respuesta: 'Sí, en la sección de Fincas, seleccione el lote deseado y haga clic en el ícono de descarga. Podrá elegir entre PDF, CSV o formato GeoJSON para aplicaciones GIS externas.',
    fecha_alta: '2026-03-02T10:00:00.000Z',
    fecha_baja: null,
  },
  {
    id_pregunta_frecuente: 1,
    pregunta: '¿Cómo puedo reestablecer mi contraseña de administrador?',
    respuesta: 'Para reestablecer su acceso, diríjase a la pantalla de login, seleccione "Olvidé mi contraseña" e ingrese su correo institucional. Recibirá un código de seguridad de 6 dígitos...',
    fecha_alta: '2026-03-01T10:00:00.000Z',
    fecha_baja: null,
  },
];

export const soporteService = {
  getPreguntasFrecuentesGestion: async (
    params: ListarPreguntasFrecuentesGestionRequest = {}
  ): Promise<ListarPreguntasFrecuentesGestionResponse> => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const page = params.page ? Math.max(1, params.page) : 1;
      const pageSize = params.pageSize ? Math.max(1, params.pageSize) : 10;

      // Filtrar preguntas activas usando el helper unificado
      const activas = mockPreguntasFrecuentes.filter(esPreguntaActiva);

      // Ordenar por fecha_alta descendente, desempate por id descendente
      activas.sort((a, b) => {
        const diff = new Date(b.fecha_alta).getTime() - new Date(a.fecha_alta).getTime();
        if (diff !== 0) return diff;
        return b.id_pregunta_frecuente - a.id_pregunta_frecuente;
      });

      const totalItems = activas.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 0;
      const start = (page - 1) * pageSize;
      const paginated = activas.slice(start, start + pageSize);

      return {
        preguntas_frecuentes: paginated.map(({ id_pregunta_frecuente, pregunta, respuesta }) => ({
          id_pregunta_frecuente,
          pregunta,
          respuesta,
        })),
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
        },
      };
    }

    const response = await apiClient.get<ListarPreguntasFrecuentesGestionResponse>(
      '/preguntas-frecuentes/gestion',
      {
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 10,
        },
      }
    );
    return response.data;
  },

  getPreguntasFrecuentesConsulta: async (): Promise<ConsultarPreguntasFrecuentesResponse> => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const activas = mockPreguntasFrecuentes.filter(esPreguntaActiva);

      // Ordenar alfabéticamente por pregunta ignorando mayúsculas, acentos y signos iniciales
      activas.sort((a, b) => {
        const comp = normalizarPregunta(a.pregunta).localeCompare(normalizarPregunta(b.pregunta));
        if (comp !== 0) return comp;
        return a.id_pregunta_frecuente - b.id_pregunta_frecuente;
      });

      return {
        preguntas_frecuentes: activas.map(({ id_pregunta_frecuente, pregunta, respuesta }) => ({
          id_pregunta_frecuente,
          pregunta,
          respuesta,
        })),
      };
    }

    const response = await apiClient.get<ConsultarPreguntasFrecuentesResponse>(
      '/preguntas-frecuentes'
    );
    return response.data;
  },

  getConfiguracionSoporte: async (): Promise<ConfiguracionSoporteResponse> => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return {
        manual_usuario_url: MOCK_MANUAL_USUARIO_URL,
        email_soporte: MOCK_SOPORTE_EMAIL,
      };
    }

    const response = await apiClient.get<ConfiguracionSoporteResponse>(
      '/soporte/configuracion'
    );
    return response.data;
  },

  crearPreguntaFrecuente: async (
    data: CrearPreguntaFrecuenteRequest
  ): Promise<CrearPreguntaFrecuenteResponse> => {
    const preguntaTrim = data.pregunta.trim();
    const respuestaTrim = data.respuesta.trim();

    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const claveNorm = normalizarPregunta(preguntaTrim);

      const existeDuplicado = mockPreguntasFrecuentes
        .filter(esPreguntaActiva)
        .some((p) => normalizarPregunta(p.pregunta) === claveNorm);

      if (existeDuplicado) {
        throw crearErrorDuplicado();
      }

      const nuevaPregunta: MockPreguntaFrecuente = {
        id_pregunta_frecuente: nextId++,
        pregunta: preguntaTrim,
        respuesta: respuestaTrim,
        fecha_alta: new Date().toISOString(),
        fecha_baja: null,
      };

      mockPreguntasFrecuentes.unshift(nuevaPregunta);

      return {
        message: 'Pregunta frecuente creada correctamente.',
        id_pregunta_frecuente: nuevaPregunta.id_pregunta_frecuente,
        pregunta: nuevaPregunta.pregunta,
        respuesta: nuevaPregunta.respuesta,
      };
    }

    const response = await apiClient.post<CrearPreguntaFrecuenteResponse>(
      '/preguntas-frecuentes',
      {
        pregunta: preguntaTrim,
        respuesta: respuestaTrim,
      }
    );
    return response.data;
  },

  editarPreguntaFrecuente: async (
    id: number,
    data: EditarPreguntaFrecuenteRequest
  ): Promise<EditarPreguntaFrecuenteResponse> => {
    const preguntaTrim = data.pregunta.trim();
    const respuestaTrim = data.respuesta.trim();

    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const idx = mockPreguntasFrecuentes.findIndex(
        (p) => p.id_pregunta_frecuente === id && esPreguntaActiva(p)
      );

      if (idx === -1) {
        throw crearErrorNoEncontrado();
      }

      const claveNorm = normalizarPregunta(preguntaTrim);

      // La unicidad excluye la propia pregunta
      const existeDuplicado = mockPreguntasFrecuentes
        .filter((p) => esPreguntaActiva(p) && p.id_pregunta_frecuente !== id)
        .some((p) => normalizarPregunta(p.pregunta) === claveNorm);

      if (existeDuplicado) {
        throw crearErrorDuplicado();
      }

      mockPreguntasFrecuentes[idx] = {
        ...mockPreguntasFrecuentes[idx],
        pregunta: preguntaTrim,
        respuesta: respuestaTrim,
      };

      return {
        message: 'Pregunta frecuente actualizada correctamente.',
        id_pregunta_frecuente: id,
        pregunta: preguntaTrim,
        respuesta: respuestaTrim,
      };
    }

    const response = await apiClient.put<EditarPreguntaFrecuenteResponse>(
      `/preguntas-frecuentes/${id}`,
      {
        pregunta: preguntaTrim,
        respuesta: respuestaTrim,
      }
    );
    return response.data;
  },

  eliminarPreguntaFrecuente: async (
    id: number
  ): Promise<EliminarPreguntaFrecuenteResponse> => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const idx = mockPreguntasFrecuentes.findIndex(
        (p) => p.id_pregunta_frecuente === id && esPreguntaActiva(p)
      );

      if (idx === -1) {
        throw crearErrorNoEncontrado();
      }

      mockPreguntasFrecuentes[idx] = {
        ...mockPreguntasFrecuentes[idx],
        fecha_baja: new Date().toISOString(),
      };

      return {
        message: 'Pregunta frecuente eliminada correctamente.',
        id_pregunta_frecuente: id,
      };
    }

    const response = await apiClient.delete<EliminarPreguntaFrecuenteResponse>(
      `/preguntas-frecuentes/${id}`
    );
    return response.data;
  },
};
