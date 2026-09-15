import { describe, expect, it } from 'vitest';
import {
  cronogramaTieneTareas,
  etiquetasVariedadesDeCultivo,
  mapCultivosFormularioARequest,
  mapDetalleAFormulario,
  mapFormularioARequest,
  nombresCultivosDePlantilla,
} from './plantilla-form.mapper';
import { PlantillaBaseDetalle } from '../types/plantillas.types';
import { CultivoBaseListado } from '../types/cultivos.types';

const cultivosCatalogo: CultivoBaseListado[] = [
  {
    id_cultivo_base: 45,
    nombre_cultivo_base: 'Tomate',
    descripcion_cb: '',
    epoca_cultivo: 'Primavera_verano',
    mes_siembra: 'Sep-Oct',
    ciclo_productivo_cb: '70-90 días',
    forma_siembra: 'Almacigo',
    cantidad_variedades: 1,
  },
];

const detalle: PlantillaBaseDetalle = {
  id_plantilla_base: 3,
  nombre_pb: 'Plan de Cultivo de Tomate',
  cultivos_info: [
    {
      id_cultivo_base: 45,
      nombre_cultivo_base: 'Tomate',
      epoca_cultivo: 'Primavera_verano',
      mes_siembra: 'Sep-Oct',
      ciclo_productivo_cb: '70-90 días',
    },
  ],
  cultivos: [
    {
      id_pbcv: 23,
      cultivo_base: {
        id_cultivo_base: 45,
        nombre_cultivo_base: 'Tomate',
        epoca_cultivo: 'Primavera_verano',
        mes_siembra: 'Sep-Oct',
        ciclo_productivo_cb: '70-90 días',
      },
      variedad: null,
    },
    {
      id_pbcv: 24,
      cultivo_base: {
        id_cultivo_base: 45,
        nombre_cultivo_base: 'Tomate',
        epoca_cultivo: 'Primavera_verano',
        mes_siembra: 'Sep-Oct',
        ciclo_productivo_cb: '70-90 días',
      },
      variedad: {
        id_variedad: 12,
        nombre_variedad: 'Perita',
        distancia_plantacion: '30x60cm',
        observaciones: null,
        dias_a_cosecha: 75,
        fecha_alta: '2026-03-10',
        en_uso: true,
      },
    },
  ],
  hitos: [
    {
      id_hito_plantilla: 10,
      nombre_hpb: 'Siembra',
      orden_hpb: 1,
      tareas: [
        {
          id_tarea_plantilla: 33,
          dia_relativo_tp: 0,
          id_tipo_tarea: 5,
          nombre_tipo_tarea: 'Aplicación de agroquímico',
          descripcion_tp: 'Aplicar cobre',
          nombre_producto: 'Cobre 50%',
          dosis_aa: '2 L/ha',
        },
      ],
    },
  ],
};

describe('mapCultivosFormularioARequest', () => {
  it('traduce "Todas las variedades" a id_variedad null', () => {
    expect(
      mapCultivosFormularioARequest([
        { id_cultivo_base: 45, modo_variedades: 'todas', ids_variedades: [] },
      ]),
    ).toEqual([{ id_cultivo_base: 45, id_variedad: null }]);
  });

  it('si eligió específicas pero no marcó ninguna, también envía null', () => {
    expect(
      mapCultivosFormularioARequest([
        { id_cultivo_base: 45, modo_variedades: 'especificas', ids_variedades: [] },
      ]),
    ).toEqual([{ id_cultivo_base: 45, id_variedad: null }]);
  });

  it('expande una fila por variedad específica', () => {
    expect(
      mapCultivosFormularioARequest([
        { id_cultivo_base: 45, modo_variedades: 'especificas', ids_variedades: [12, 13] },
      ]),
    ).toEqual([
      { id_cultivo_base: 45, id_variedad: 12 },
      { id_cultivo_base: 45, id_variedad: 13 },
    ]);
  });
});

describe('mapFormularioARequest', () => {
  it('asigna orden_hpb secuencial y limpia agroquímico si el tipo no lo requiere', () => {
    const request = mapFormularioARequest({
      nombre_pb: '  Plan Tomate  ',
      cultivos: [{ id_cultivo_base: 45, modo_variedades: 'todas', ids_variedades: [] }],
      hitos: [
        {
          nombre_hpb: ' Siembra ',
          tareas: [
            {
              dia_relativo_tp: 0,
              id_tipo_tarea: 2,
              descripcion_tp: 'Preparar almácigo',
              nombre_producto: 'no aplica',
              dosis_aa: 'no aplica',
            },
          ],
        },
      ],
    });

    expect(request.nombre_pb).toBe('Plan Tomate');
    expect(request.hitos[0].orden_hpb).toBe(1);
    expect(request.hitos[0].tareas[0].nombre_producto).toBeNull();
    expect(request.hitos[0].tareas[0].dosis_aa).toBeNull();
  });

  it('incluye producto y dosis cuando el tipo es aplicación de agroquímico', () => {
    const request = mapFormularioARequest({
      nombre_pb: 'Plan',
      cultivos: [{ id_cultivo_base: 45, modo_variedades: 'todas', ids_variedades: [] }],
      hitos: [
        {
          nombre_hpb: 'Sanidad',
          tareas: [
            {
              dia_relativo_tp: 7,
              id_tipo_tarea: 5,
              descripcion_tp: 'Aplicar cobre',
              nombre_producto: ' Cobre 50% ',
              dosis_aa: ' 2 L/ha ',
            },
          ],
        },
      ],
    });

    expect(request.hitos[0].tareas[0]).toMatchObject({
      nombre_producto: 'Cobre 50%',
      dosis_aa: '2 L/ha',
    });
  });
});

describe('mapDetalleAFormulario', () => {
  it('agrupa el cultivo y marca específicas si hay variedades', () => {
    const form = mapDetalleAFormulario(detalle);
    expect(form.nombre_pb).toBe('Plan de Cultivo de Tomate');
    expect(form.cultivos).toEqual([
      {
        id_cultivo_base: 45,
        modo_variedades: 'especificas',
        ids_variedades: [12],
      },
    ]);
    expect(form.hitos[0].tareas[0].nombre_producto).toBe('Cobre 50%');
  });
});

describe('helpers de plantilla', () => {
  it('resuelve nombres de cultivo desde el catálogo', () => {
    expect(
      nombresCultivosDePlantilla(
        {
          id_plantilla_base: 3,
          nombre_pb: 'Plan',
          cultivos: [{ id_pbcv: 1, id_cultivo_base: 45, id_variedad: null }],
          cantidad_tareas: 1,
        },
        cultivosCatalogo,
      ),
    ).toEqual(['Tomate']);
  });

  it('describe variedades generales y específicas', () => {
    expect(etiquetasVariedadesDeCultivo(detalle, 45)).toBe('Todas las variedades, Perita');
  });

  it('detecta cronograma vacío', () => {
    expect(cronogramaTieneTareas([])).toBe(false);
    expect(cronogramaTieneTareas([{ nombre_hpb: 'Siembra', tareas: [] }])).toBe(false);
    expect(
      cronogramaTieneTareas([
        {
          nombre_hpb: 'Siembra',
          tareas: [{ dia_relativo_tp: 0, id_tipo_tarea: 2, descripcion_tp: 'x' }],
        },
      ]),
    ).toBe(true);
  });
});
