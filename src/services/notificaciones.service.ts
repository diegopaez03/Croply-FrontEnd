import { apiClient } from './api';
import { ListadoNotificaciones, Notificacion } from '../types/notificaciones.types';

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let mockNotificaciones: Notificacion[] = [
  {
    id_notificacion: 1,
    tipo: 'AlertaClimatica',
    titulo: 'Alerta de helada',
    descripcion: 'Se espera una mínima bajo cero en las próximas horas.',
    leida: false,
    fecha_creacion: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    fecha_lectura: null,
    id_finca: 1,
    id_parcela: null,
    id_tarea: null,
  },
  {
    id_notificacion: 2,
    tipo: 'TareaPendiente',
    titulo: 'Riego de la mañana',
    descripcion: 'Lote Norte',
    leida: false,
    fecha_creacion: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    fecha_lectura: null,
    id_finca: 1,
    id_parcela: 101,
    id_tarea: 5,
  },
];

function listado(): ListadoNotificaciones {
  const notificaciones = [...mockNotificaciones].sort(
    (a, b) =>
      new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime(),
  );
  return {
    no_leidas: notificaciones.filter((item) => !item.leida).length,
    notificaciones,
  };
}

export const notificacionesService = {
  listar: async (): Promise<ListadoNotificaciones> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return delay(listado());
    }
    const response = await apiClient.get<ListadoNotificaciones>('/notificaciones');
    return response.data;
  },

  marcarLeida: async (id_notificacion: number): Promise<Notificacion> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      const actual = mockNotificaciones.find(
        (item) => item.id_notificacion === id_notificacion,
      );
      if (actual && !actual.leida) {
        actual.leida = true;
        actual.fecha_lectura = new Date().toISOString();
      }
      return delay(actual ?? mockNotificaciones[0]);
    }
    const response = await apiClient.put<Notificacion>(
      `/notificaciones/${id_notificacion}/leida`,
    );
    return response.data;
  },

  marcarTodasLeidas: async (): Promise<{ no_leidas: number }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      const ahora = new Date().toISOString();
      mockNotificaciones = mockNotificaciones.map((item) =>
        item.leida ? item : { ...item, leida: true, fecha_lectura: ahora },
      );
      return delay({ no_leidas: 0 });
    }
    const response = await apiClient.put<{ no_leidas: number }>('/notificaciones/leidas');
    return response.data;
  },
};
