import { FincaListado } from '@/types/fincas.types';
import { ParcelaListado } from '@/types/parcelas.types';

export function guardarFincasCache(fincas: FincaListado[]) {
  localStorage.setItem('fincas_cache', JSON.stringify(fincas));
}

export function obtenerFincasCache(): FincaListado[] {
  const data = localStorage.getItem('fincas_cache');
  return data ? JSON.parse(data) : [];
}

export function guardarParcelasCache(idFinca: number, parcelas: ParcelaListado[]) {
  localStorage.setItem(`parcelas_cache_${idFinca}`, JSON.stringify(parcelas));
}

export function obtenerParcelasCache(idFinca: number): ParcelaListado[] {
  const data = localStorage.getItem(`parcelas_cache_${idFinca}`);
  return data ? JSON.parse(data) : [];
}

export interface NotaPendiente {
  idLocal: string;
  id_finca: number;
  id_parcela?: number | null;
  contenido_nota_campo: string;
  fecha_captura_nc: string;
}

export function guardarNotaPendiente(nota: NotaPendiente) {
  const pendientes = listarNotasPendientes();
  pendientes.push(nota);
  localStorage.setItem('notas_pendientes', JSON.stringify(pendientes));
}

export function listarNotasPendientes(): NotaPendiente[] {
  const data = localStorage.getItem('notas_pendientes');
  return data ? JSON.parse(data) : [];
}

export function eliminarNotaPendiente(idLocal: string) {
  const pendientes = listarNotasPendientes();
  const index = pendientes.findIndex(n => n.idLocal === idLocal);
  if (index !== -1) {
    pendientes.splice(index, 1);
    localStorage.setItem('notas_pendientes', JSON.stringify(pendientes));
  }
}
