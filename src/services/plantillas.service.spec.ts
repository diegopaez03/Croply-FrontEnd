import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.stubEnv('VITE_USE_MOCKS', 'true');

const { plantillasService } = await import('../services/plantillas.service');

const payloadBase = {
  nombre_pb: 'Plan de prueba HU-BC-02',
  cultivos: [{ id_cultivo_base: 99, id_variedad: null as number | null }],
  hitos: [
    {
      nombre_hpb: 'Siembra',
      orden_hpb: 1,
      tareas: [
        {
          dia_relativo_tp: 0,
          id_tipo_tarea: 2,
          descripcion_tp: 'Preparar almácigo',
          nombre_producto: null,
          dosis_aa: null,
        },
      ],
    },
  ],
};

describe('plantillasService mocks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('crea una plantilla y devuelve el toast de alta', async () => {
    const promesa = plantillasService.crear({
      ...payloadBase,
      nombre_pb: `Plan único ${Date.now()}`,
    });
    await vi.runAllTimersAsync();
    const result = await promesa;
    expect(result.message).toBe('Plantilla creada correctamente');
    expect(result.id_plantilla_base).toBeGreaterThan(0);
    expect(result.hitos[0].tareas).toHaveLength(1);
  });

  it('rechaza cronograma vacío con EMPTY_SCHEDULE', async () => {
    const promesa = plantillasService.crear({
      ...payloadBase,
      nombre_pb: 'Sin cronograma',
      hitos: [{ nombre_hpb: 'Siembra', orden_hpb: 1, tareas: [] }],
    });
    const assertion = expect(promesa).rejects.toMatchObject({
      response: { data: { errorCode: 'EMPTY_SCHEDULE' } },
    });
    await vi.runAllTimersAsync();
    await assertion;
  });

  it('rechaza nombre duplicado con DUPLICATE_VALUE en nombre_pb', async () => {
    const promesa = plantillasService.crear({
      ...payloadBase,
      nombre_pb: 'Plan de Cultivo de Ajo',
    });
    const assertion = expect(promesa).rejects.toMatchObject({
      response: { data: { errorCode: 'DUPLICATE_VALUE', field: 'nombre_pb' } },
    });
    await vi.runAllTimersAsync();
    await assertion;
  });
});
