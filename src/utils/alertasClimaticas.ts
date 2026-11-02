const TITULOS_ALERTA: Record<string, string> = {
  ALERTA_HELADA: 'Alerta de Helada',
  ALERTA_HELADA_AGRONOMICA: 'Alerta de helada agronómica',
  ALERTA_LLUVIA_INTENSA: 'Alerta de lluvia intensa',
  ALERTA_VIENTO_FUERTE_ZONDA: 'Alerta de viento Zonda',
  ALERTA_OLA_CALOR: 'Alerta de ola de calor',
};

export function formatearCodigoAlerta(codigo: string): string {
  return TITULOS_ALERTA[codigo] ?? 'Alerta climática';
}
