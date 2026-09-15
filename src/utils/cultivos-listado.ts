import { CultivoBaseListado, EpocaCultivo, FormaSiembra } from '../types/cultivos.types';

export type OrdenCultivos =
  | 'nombre_asc'
  | 'nombre_desc'
  | 'temporada_asc'
  | 'variedades_desc';

const ORDEN_TEMPORADA: Record<EpocaCultivo, number> = {
  Primavera_verano: 0,
  Otonio_invierno: 1,
  Todo_el_anio: 2,
};

export function ordenarCultivosBase(
  cultivos: CultivoBaseListado[],
  orden: OrdenCultivos,
): CultivoBaseListado[] {
  const copia = [...cultivos];
  copia.sort((a, b) => {
    switch (orden) {
      case 'nombre_desc':
        return b.nombre_cultivo_base.localeCompare(a.nombre_cultivo_base, 'es');
      case 'temporada_asc':
        return ORDEN_TEMPORADA[a.epoca_cultivo] - ORDEN_TEMPORADA[b.epoca_cultivo]
          || a.nombre_cultivo_base.localeCompare(b.nombre_cultivo_base, 'es');
      case 'variedades_desc':
        return b.cantidad_variedades - a.cantidad_variedades
          || a.nombre_cultivo_base.localeCompare(b.nombre_cultivo_base, 'es');
      case 'nombre_asc':
      default:
        return a.nombre_cultivo_base.localeCompare(b.nombre_cultivo_base, 'es');
    }
  });
  return copia;
}

export function mensajeListadoCultivosVacio(filtros: {
  search?: string;
  epoca_cultivo?: EpocaCultivo | '';
  forma_siembra?: FormaSiembra | '';
}): string {
  const tieneSearch = Boolean(filtros.search?.trim());
  const tieneEpoca = Boolean(filtros.epoca_cultivo);
  const tieneForma = Boolean(filtros.forma_siembra);

  if (tieneSearch && !tieneEpoca && !tieneForma) {
    return 'No se encontraron cultivos que coincidan con la búsqueda.';
  }
  if (tieneEpoca && !tieneSearch && !tieneForma) {
    return 'No hay cultivos disponibles para la temporada seleccionada.';
  }
  if (tieneSearch || tieneEpoca || tieneForma) {
    return 'No se encontraron cultivos con los filtros seleccionados.';
  }
  return 'Aún no hay cultivos cargados en la biblioteca.';
}
