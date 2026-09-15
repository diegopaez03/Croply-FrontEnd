import { CultivoBaseDetalle } from '../types/cultivos.types';

export function idPlantillaParaVariedad(
  cultivo: CultivoBaseDetalle,
  id_variedad: number | null,
): number | null {
  if (id_variedad != null) {
    const variedad = cultivo.variedades.find((item) => item.id_variedad === id_variedad);
    if (variedad?.id_plantilla_especifica) {
      return variedad.id_plantilla_especifica;
    }
  }
  return cultivo.id_plantilla_general ?? null;
}

export function etiquetaDiaRelativo(dia: number): string {
  if (dia === 0) return 'Día 0';
  if (dia < 0) return `Día ${dia}`;
  return `+${dia} Días`;
}
