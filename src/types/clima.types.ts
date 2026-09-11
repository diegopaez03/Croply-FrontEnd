export type CondicionClimatica =
  | 'Despejado'
  | 'Parcialmente nublado'
  | 'Nublado'
  | 'Niebla'
  | 'Lluvia'
  | 'Nieve'
  | 'Tormenta'
  | 'Tormenta eléctrica'
  | 'Helada'
  | 'Granizo'
  | 'Temperatura elevada';

export interface ClimaActual {
  temperatura: number;
  condicion: CondicionClimatica;
}

export interface PronosticoDia {
  fecha: string;
  dia_semana: string;
  es_hoy: boolean;
  temperatura_max: number;
  temperatura_min: number;
  condicion: CondicionClimatica;
}

export interface ClimaResponse {
  provincia: string;
  departamento: string;
  clima_actual: ClimaActual;
  pronostico: PronosticoDia[];
}
