import { EpocaCultivo, FormaSiembra } from '../types/cultivos.types';

export const MESES_SIEMBRA = [
  { value: 'Ene', label: 'Enero' },
  { value: 'Feb', label: 'Febrero' },
  { value: 'Mar', label: 'Marzo' },
  { value: 'Abr', label: 'Abril' },
  { value: 'May', label: 'Mayo' },
  { value: 'Jun', label: 'Junio' },
  { value: 'Jul', label: 'Julio' },
  { value: 'Ago', label: 'Agosto' },
  { value: 'Sep', label: 'Septiembre' },
  { value: 'Oct', label: 'Octubre' },
  { value: 'Nov', label: 'Noviembre' },
  { value: 'Dic', label: 'Diciembre' },
] as const;

export type MesSiembraValue = (typeof MESES_SIEMBRA)[number]['value'];

const LABELS_EPOCA: Record<EpocaCultivo, string> = {
  Todo_el_anio: 'Todo el año',
  Primavera_verano: 'Primavera-Verano',
  Otonio_invierno: 'Otoño-Invierno',
};

const LABELS_FORMA_SIEMBRA: Record<FormaSiembra, string> = {
  Directa: 'Directa',
  Almacigo: 'Almácigo',
};

export function formatEpocaCultivo(epoca: EpocaCultivo): string {
  return LABELS_EPOCA[epoca] ?? epoca;
}

export function formatFormaSiembra(forma: FormaSiembra): string {
  return LABELS_FORMA_SIEMBRA[forma] ?? forma;
}

export function formatMesSiembra(mesDesde: string, mesHasta: string): string {
  if (!mesDesde && !mesHasta) return '';
  if (mesDesde === mesHasta || !mesHasta) return mesDesde;
  if (!mesDesde) return mesHasta;
  return `${mesDesde}-${mesHasta}`;
}

export function parseMesSiembra(mesSiembra: string): { mes_desde: string; mes_hasta: string } {
  const partes = mesSiembra.split('-').map((parte) => parte.trim()).filter(Boolean);
  if (partes.length >= 2) {
    return { mes_desde: partes[0], mes_hasta: partes[1] };
  }
  return { mes_desde: partes[0] ?? '', mes_hasta: partes[0] ?? '' };
}

export function formatCicloProductivo(cicloDesde: number, cicloHasta: number): string {
  if (cicloDesde === cicloHasta) {
    return `${cicloDesde} días`;
  }
  const min = Math.min(cicloDesde, cicloHasta);
  const max = Math.max(cicloDesde, cicloHasta);
  return `${min}-${max} días`;
}

export function parseCicloProductivo(ciclo: string): { ciclo_desde: number; ciclo_hasta: number } {
  const match = ciclo.match(/(\d+)\s*(?:-\s*(\d+))?/);
  const ciclo_desde = match ? Number(match[1]) : 0;
  const ciclo_hasta = match && match[2] ? Number(match[2]) : ciclo_desde;
  return { ciclo_desde, ciclo_hasta };
}

export function formatDistanciaPlantacion(entrePlantas: number, entreSurcos: number): string {
  return `${entrePlantas}x${entreSurcos}cm`;
}

export function parseDistanciaPlantacion(distancia: string): {
  distancia_plantas: number;
  distancia_surcos: number;
} {
  const match = distancia.match(/(\d+)\s*[x×]\s*(\d+)/i);
  return {
    distancia_plantas: match ? Number(match[1]) : 0,
    distancia_surcos: match ? Number(match[2]) : 0,
  };
}
