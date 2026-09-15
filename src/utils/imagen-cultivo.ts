import ajo from '@/assets/images/cultivos/ajo.jpg';
import cebolla from '@/assets/images/cultivos/cebolla.jpg';
import defaultBanner from '@/assets/images/cultivos/default-banner.jpg';
import defaultCard from '@/assets/images/cultivos/default.jpg';
import lechuga from '@/assets/images/cultivos/lechuga.jpg';
import lechugaBanner from '@/assets/images/cultivos/lechuga-banner.jpg';
import pimiento from '@/assets/images/cultivos/pimiento.jpg';
import tomate from '@/assets/images/cultivos/tomate.jpg';

export const DEFAULT_IMAGEN_CULTIVO = defaultCard;
export const DEFAULT_BANNER_CULTIVO = defaultBanner;

const MOCK_CARDS: Record<string, string> = {
  tomate,
  lechuga,
  ajo,
  cebolla,
  pimiento,
  pimenton: pimiento,
  morron: pimiento,
};

const MOCK_BANNERS: Record<string, string> = {
  lechuga: lechugaBanner,
};

function normalizarNombre(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function claveMock(nombre: string): string | null {
  const normalizado = normalizarNombre(nombre);
  return (
    Object.keys(MOCK_CARDS).find((clave) => normalizado.includes(clave)) ?? null
  );
}

function urlCargada(url?: string | null): string | null {
  const valor = url?.trim();
  return valor ? valor : null;
}

export function urlImagenCultivo(imagenUrl: string | null | undefined, nombre: string): string {
  return urlCargada(imagenUrl) ?? MOCK_CARDS[claveMock(nombre) ?? ''] ?? defaultCard;
}

export function urlBannerCultivo(
  bannerUrl: string | null | undefined,
  imagenUrl: string | null | undefined,
  nombre: string,
): string {
  const clave = claveMock(nombre);
  return (
    urlCargada(bannerUrl) ??
    urlCargada(imagenUrl) ??
    (clave ? MOCK_BANNERS[clave] : undefined) ??
    (clave ? MOCK_CARDS[clave] : undefined) ??
    defaultBanner
  );
}
