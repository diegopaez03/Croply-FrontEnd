export interface MetricaClientes {
  total: number;
  crecimiento_porcentaje?: number;
  nuevos_este_mes: number;
}

export interface MetricaSensores {
  activos: number;
  porcentaje_parque_total: number;
  estado?: string;
  total_activos: number;
  total_inactivos: number;
}

export interface MetricaHectareas {
  total: number;
  provincias: number;
}

export interface RegistroMensualFincas {
  mes: string;
  nuevas_fincas: number;
}

export interface TableroGlobalResponse {
  clientes: MetricaClientes;
  sensores: MetricaSensores;
  hectareas: MetricaHectareas;
  evolucion_fincas: RegistroMensualFincas[];
}
