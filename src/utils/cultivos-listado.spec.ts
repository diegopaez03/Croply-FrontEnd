import { describe, expect, it } from 'vitest';
import { CultivoBaseListado } from '../types/cultivos.types';
import { mensajeListadoCultivosVacio, ordenarCultivosBase } from './cultivos-listado';

const cultivos: CultivoBaseListado[] = [
  {
    id_cultivo_base: 2,
    nombre_cultivo_base: 'Tomate',
    descripcion_cb: '',
    epoca_cultivo: 'Primavera_verano',
    mes_siembra: 'Sep-Oct',
    ciclo_productivo_cb: '70-90 días',
    forma_siembra: 'Almacigo',
    cantidad_variedades: 2,
  },
  {
    id_cultivo_base: 1,
    nombre_cultivo_base: 'Ajo',
    descripcion_cb: '',
    epoca_cultivo: 'Otonio_invierno',
    mes_siembra: 'Mar-Abr',
    ciclo_productivo_cb: '180-210 días',
    forma_siembra: 'Directa',
    cantidad_variedades: 5,
  },
];

describe('ordenarCultivosBase', () => {
  it('ordena por nombre A-Z', () => {
    expect(ordenarCultivosBase(cultivos, 'nombre_asc').map((c) => c.nombre_cultivo_base)).toEqual([
      'Ajo',
      'Tomate',
    ]);
  });

  it('ordena por más variedades', () => {
    expect(ordenarCultivosBase(cultivos, 'variedades_desc')[0].nombre_cultivo_base).toBe('Ajo');
  });
});

describe('mensajeListadoCultivosVacio', () => {
  it('usa el mensaje de búsqueda', () => {
    expect(mensajeListadoCultivosVacio({ search: 'xyz' })).toBe(
      'No se encontraron cultivos que coincidan con la búsqueda.',
    );
  });

  it('usa el mensaje de temporada', () => {
    expect(mensajeListadoCultivosVacio({ epoca_cultivo: 'Primavera_verano' })).toBe(
      'No hay cultivos disponibles para la temporada seleccionada.',
    );
  });

  it('usa el mensaje sin datos', () => {
    expect(mensajeListadoCultivosVacio({})).toBe('Aún no hay cultivos cargados en la biblioteca.');
  });
});
