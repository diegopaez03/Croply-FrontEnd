import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.stubEnv('VITE_USE_MOCKS', 'true');

const { planesAccionService } = await import('./planesAccion.service');

describe('planesAccionService mocks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('rechaza crearTarea si el id_tipo_tarea no existe con RESOURCE_NOT_FOUND', async () => {
    const promesa = planesAccionService.crearTarea(77, 201, {
      nombre_tarea: 'Test Invalid',
      descripcion_tarea: 'Desc',
      fecha_planificada_tarea: '2026-10-10',
      id_tipo_tarea: 9999
    });
    
    const assertion = expect(promesa).rejects.toMatchObject({
      response: { data: { errorCode: 'RESOURCE_NOT_FOUND' } },
    });
    
    await vi.runAllTimersAsync();
    await assertion;
  });
});
