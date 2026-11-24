export type TipoNotificacion = 'AlertaClimatica' | 'TareaPendiente';

export interface Notificacion {
  id_notificacion: number;
  tipo: TipoNotificacion;
  titulo: string;
  descripcion: string;
  leida: boolean;
  fecha_creacion: string;
  fecha_lectura: string | null;
  id_finca: number | null;
  id_parcela: number | null;
  id_tarea: number | null;
}

export interface ListadoNotificaciones {
  no_leidas: number;
  notificaciones: Notificacion[];
}
