import { describe, expect, it } from 'vitest';
import { plantillaBaseSchema } from './validators';

const formValido = {
  nombre_pb: 'Plan de Cultivo de Tomate',
  cultivos: [{ id_cultivo_base: 45, modo_variedades: 'todas' as const, ids_variedades: [] }],
  hitos: [
    {
      nombre_hpb: 'Siembra',
      tareas: [
        {
          dia_relativo_tp: 0,
          id_tipo_tarea: 2,
          descripcion_tp: 'Preparación de almácigo',
        },
      ],
    },
  ],
};

describe('plantillaBaseSchema', () => {
  it('acepta una plantilla con cultivo, hito y tarea', () => {
    const parsed = plantillaBaseSchema.parse(formValido);
    expect(parsed.hitos[0].tareas[0].dia_relativo_tp).toBe(0);
  });

  it('exige al menos un cultivo', () => {
    const result = plantillaBaseSchema.safeParse({ ...formValido, cultivos: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Debés seleccionar al menos un cultivo');
    }
  });

  it('exige al menos un hito con una tarea', () => {
    const result = plantillaBaseSchema.safeParse({ ...formValido, hitos: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'La plantilla debe tener al menos un hito con una tarea para poder guardarse.',
      );
    }
  });

  it('rechaza un hito sin tareas', () => {
    const result = plantillaBaseSchema.safeParse({
      ...formValido,
      hitos: [{ nombre_hpb: 'Siembra', tareas: [] }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('tareas'))).toBe(true);
    }
  });

  it('no permite día relativo negativo', () => {
    const result = plantillaBaseSchema.safeParse({
      ...formValido,
      hitos: [
        {
          nombre_hpb: 'Siembra',
          tareas: [{ dia_relativo_tp: -1, id_tipo_tarea: 2, descripcion_tp: 'x' }],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('exige producto y dosis si el tipo es aplicación de agroquímico', () => {
    const result = plantillaBaseSchema.safeParse({
      ...formValido,
      hitos: [
        {
          nombre_hpb: 'Sanidad',
          tareas: [
            {
              dia_relativo_tp: 3,
              id_tipo_tarea: 5,
              descripcion_tp: 'Aplicar',
            },
          ],
        },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'));
      expect(paths).toContain('hitos.0.tareas.0.nombre_producto');
      expect(paths).toContain('hitos.0.tareas.0.dosis_aa');
    }
  });
});
