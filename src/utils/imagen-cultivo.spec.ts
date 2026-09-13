import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BANNER_CULTIVO,
  DEFAULT_IMAGEN_CULTIVO,
  urlBannerCultivo,
  urlImagenCultivo,
} from './imagen-cultivo';

describe('imagen-cultivo', () => {
  it('prioriza la URL cargada sobre el mock', () => {
    expect(urlImagenCultivo('https://cdn.example/tomate.jpg', 'Tomate')).toBe(
      'https://cdn.example/tomate.jpg',
    );
  });

  it('usa mock cuando no hay imagen cargada', () => {
    expect(urlImagenCultivo(null, 'Tomate')).not.toBe(DEFAULT_IMAGEN_CULTIVO);
    expect(urlImagenCultivo('   ', 'Lechuga')).not.toBe(DEFAULT_IMAGEN_CULTIVO);
    expect(urlImagenCultivo(null, 'Cultivo desconocido')).toBe(DEFAULT_IMAGEN_CULTIVO);
  });

  it('resuelve el banner con fallback a imagen y luego a mock', () => {
    expect(urlBannerCultivo('https://cdn.example/banner.jpg', 'https://cdn.example/card.jpg', 'Ajo')).toBe(
      'https://cdn.example/banner.jpg',
    );
    expect(urlBannerCultivo(null, 'https://cdn.example/card.jpg', 'Ajo')).toBe(
      'https://cdn.example/card.jpg',
    );
    expect(urlBannerCultivo(null, null, 'Lechuga')).not.toBe(DEFAULT_BANNER_CULTIVO);
    expect(urlBannerCultivo(null, null, 'Cultivo desconocido')).toBe(DEFAULT_BANNER_CULTIVO);
  });
});
