import { ParcelaListado } from '../types/parcelas.types';

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const parcelasService = {
  listarPorFinca: async (id_finca: number): Promise<ParcelaListado[]> => {
    // TODO: Reemplazar por GET de parcelas (Épica 3) cuando exista el contrato.
    const parcelas = [
      {
        id_parcela: id_finca * 10 + 1,
        id_finca,
        nombre_parcela: 'Lote A-12',
        superficie_ha: 12,
        superficie_disponible_ha: 10,
      },
      {
        id_parcela: id_finca * 10 + 2,
        id_finca,
        nombre_parcela: 'Parcela 1 - Norte',
        superficie_ha: 8,
        superficie_disponible_ha: 8,
      },
    ];
    return delay(parcelas);
  },
};
