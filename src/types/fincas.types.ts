export interface PropietarioFinca {
  id_usuario: number;
  id_usuario_finca: number;
  nombre: string;
  apellido: string;
  email: string;
  estado: "Activo" | "Inactivo" | "Pendiente";
}

export interface FincaStats {
  sensores_totales: number;
  superficie_gestionada_total: number;
}

export interface FincaListado {
  id_finca: number;
  nombre_finca: string;
  propietario: PropietarioFinca | null;
  provincia: string;
  departamento: string;
  longitud: string;
  latitud: string;
  cantidad_sensores: number;
  estado: "Activo" | "Inactivo";
}

export interface FincasListResponse {
  fincas: FincaListado[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface SensorResumen {
  id_sensor: number;
  codigo_tipo_sensor: string;
  nombre_tipo_sensor: string;
  estado_senal: string;
  ultimo_valor: number | null;
  fecha_ultima_lectura: string | null;
  ip_sensor?: string;
}

export interface ControladorResumen {
  id_controlador_sensor: number;
  nombre_controlador: string;
  ip_controlador: string;
  estado_controlador: string;
  sensores: SensorResumen[];
}

export interface ParcelaResumen {
  id_parcela: number;
  nombre_parcela: string;
  estado_parcela: string;
  superficie_parcela: number;
  controladores: ControladorResumen[];
  cultivos_asignados?: {
    id_cultivo_base: number;
    nombre_cultivo_base: string;
    id_variedad: number;
    nombre_variedad: string;
    superficie_asignada: number;
    fecha_inicio: string;
  }[];
  fecha_generacion_qr?: string | null;
  url_acceso_qr?: string | null;
}

export interface ParcelaByIdResponse extends ParcelaResumen {
  id_finca: number;
}

export interface FincaDetalle {
  id_finca: number;
  nombre_finca: string;
  provincia: string;
  departamento: string;
  longitud: string;
  latitud: string;
  superficie_finca: number;
  descripcion_finca: string;
  propietario: PropietarioFinca | null;
  estado: "Activo" | "Inactivo";
  cantidad_parcelas: number;
  cantidad_sensores: number;
  parcelas: ParcelaResumen[];
}

export interface FincaCreatePayload {
  nombre_finca: string;
  provincia: string;
  departamento: string;
  longitud: string;
  latitud: string;
  superficie_finca: number;
  descripcion_finca?: string;
  id_usuario_propietario?: number | null;
  parcelas?: any[];
}

export interface FincaUpdatePayload {
  nombre_finca: string;
  superficie_finca: number;
  descripcion_finca?: string;
}

export interface AdministradorFincaDisponible {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
}

export interface GetAdministradoresDisponiblesResponse {
  usuarios: AdministradorFincaDisponible[];
}

export interface AsignarPropietarioPayload {
  id_usuario_propietario: number | null;
}

export interface SensorPayload {
  id_sensor?: number;
  id_tipo_sensor: number;
  ip_sensor: string;
}

export interface ControladorPayload {
  id_controlador_sensor?: number;
  nombre_controlador: string;
  ip_controlador: string;
  sensores: SensorPayload[];
}

export interface CrearEditarParcelaPayload {
  nombre_parcela: string;
  superficie_parcela: number;
  controladores: ControladorPayload[];
}
export type EstadoPlanAccion = 'Activo' | 'Finalizado' | 'FinalizadoPorContingencia' | 'Inactivado';

export interface CultivoHistorico {
  id_plan_accion: number;
  nombre_cultivo_base: string;
  nombre_variedad: string;
  superficie_ocupada_pa: number;
  fecha_inicio_pa: string;
  fecha_fin_pa: string | null;
  estado: EstadoPlanAccion;
}

export interface HistorialCultivosResponse {
  historial: CultivoHistorico[];
}

export interface QRGenerarResponse {
  message: string;
  url_acceso_qr: string;
  fecha_generacion_qr: string;
}

export interface QRConsultarResponse {
  url_acceso_qr: string;
  fecha_generacion_qr: string;
}
