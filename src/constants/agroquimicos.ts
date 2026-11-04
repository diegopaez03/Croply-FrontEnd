export const UNIDADES_DOSIS = ['L/ha', 'kg/ha', 'cc/ha', 'ml/ha'] as const;
export type UnidadDosis = (typeof UNIDADES_DOSIS)[number];
export const UNIDAD_DOSIS_DEFAULT: UnidadDosis = 'L/ha';

/**
 * Parsea un string de dosis_aa (ej. "2.5 L/ha", "2", "100 litros", null, "")
 * tolerando datos antiguos o mockeados sin unidad y preservando unidades no estándar
 * para que no se pierdan ni se pisen en silencio.
 */
export function parseDosis(dosis_aa?: string | null): {
  dosis: number | undefined;
  unidad_dosis: string;
} {
  if (!dosis_aa || !dosis_aa.trim()) {
    return { dosis: undefined, unidad_dosis: UNIDAD_DOSIS_DEFAULT };
  }
  const [dosisStr, ...rest] = dosis_aa.trim().split(/\s+/);
  const num = parseFloat(dosisStr);
  const dosis = !isNaN(num) && num > 0 ? num : undefined;
  const unidad_dosis = rest.length > 0 ? rest.join(' ') : UNIDAD_DOSIS_DEFAULT;
  return { dosis, unidad_dosis };
}

/**
 * Obtiene la lista de unidades para un selector, asegurando que si la unidad actual
 * es un valor existente no estándar (ej. "litros"), se incluya como opción para que
 * el select no quede en blanco ni pise el valor en silencio.
 */
export function obtenerOpcionesUnidades(unidadActual?: string | null): string[] {
  if (!unidadActual || (UNIDADES_DOSIS as readonly string[]).includes(unidadActual)) {
    return [...UNIDADES_DOSIS];
  }
  return [...UNIDADES_DOSIS, unidadActual];
}

/**
 * Formatea dosis numérica y unidad en un único string combinado dosis_aa.
 * Respeta el límite de 80 caracteres del backend.
 */
export function formatDosis(
  dosis?: number | string | null,
  unidad?: string | null
): string | null {
  if (dosis == null || dosis === '' || isNaN(Number(dosis))) return null;
  const unidadFinal = unidad?.trim() || UNIDAD_DOSIS_DEFAULT;
  const combinado = `${dosis} ${unidadFinal}`.trim();
  return combinado.length > 80 ? combinado.slice(0, 80) : combinado;
}
