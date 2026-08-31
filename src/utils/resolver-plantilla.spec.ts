import { describe, expect, it } from 'vitest';
import { idPlantillaParaVariedad } from './resolver-plantilla';
import { CultivoBaseDetalle } from '../types/cultivos.types';

const cultivo: CultivoBaseDetalle = {
  id_cultivo_base: 45,
  nombre_cultivo_base: 'Tomate',
  descripcion_cb: 'Fruto',
  epoca_cultivo: 'Primavera_verano',
  mes_siembra: 'Sep-Oct',
  ciclo_productivo_cb: '70-90 días',
  forma_siembra: 'Almacigo',
  id_plantilla_general: 3,
  variedades: [
    {
      id_variedad: 12,
      nombre_variedad: 'Perita',
      distancia_plantacion: '30x60cm',
      observaciones: null,
      dias_a_cosecha: 75,
      fecha_alta: '2026-03-10',
      en_uso: true,
      id_plantilla_especifica: 8,
    },
    {
      id_variedad: 13,
      nombre_variedad: 'Redondo',
      distancia_plantacion: '40x70cm',
      observaciones: null,
      dias_a_cosecha: 68,
      fecha_alta: '2026-03-10',
      en_uso: false,
      id_plantilla_especifica: null,
    },
  ],
};

describe('idPlantillaParaVariedad', () => {
  it('prioriza la plantilla específica de la variedad', () => {
    expect(idPlantillaParaVariedad(cultivo, 12)).toBe(8);
  });

  it('cae a la plantilla general si la variedad no tiene específica', () => {
    expect(idPlantillaParaVariedad(cultivo, 13)).toBe(3);
  });

  it('usa la general si no hay variedad', () => {
    expect(idPlantillaParaVariedad(cultivo, null)).toBe(3);
  });

  it('devuelve null si no hay ninguna plantilla', () => {
    expect(idPlantillaParaVariedad({ ...cultivo, id_plantilla_general: null }, 13)).toBeNull();
  });
});
