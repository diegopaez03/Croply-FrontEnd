import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AxiosError } from 'axios';
import { handleFormError } from './errorHandler';

vi.mock('@/components/ui/sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { toast } from '@/components/ui/sonner';

function errorApi(status: number, data: Record<string, unknown>): AxiosError {
  const err = new AxiosError(String(data.message ?? 'Error'));
  err.response = {
    data,
    status,
    statusText: 'Error',
    headers: {},
    config: {} as never,
  };
  return err;
}

describe('handleFormError — HU-BC-02', () => {
  beforeEach(() => {
    vi.mocked(toast.error).mockClear();
  });

  it('mapea DUPLICATE_VALUE al campo nombre_pb', () => {
    const setError = vi.fn();
    handleFormError(
      errorApi(409, {
        statusCode: 409,
        errorCode: 'DUPLICATE_VALUE',
        message: 'El valor ingresado ya existe',
        field: 'nombre_pb',
      }),
      setError,
    );
    expect(setError).toHaveBeenCalledWith('nombre_pb', {
      type: 'server',
      message: 'El valor ingresado ya existe',
    });
  });

  it('muestra EMPTY_SCHEDULE con el mensaje de cronograma vacío', () => {
    const setError = vi.fn();
    const message = 'La plantilla debe tener al menos un hito con una tarea para poder guardarse.';
    handleFormError(
      errorApi(400, { statusCode: 400, errorCode: 'EMPTY_SCHEDULE', message }),
      setError,
    );
    expect(setError).toHaveBeenCalledWith('hitos', { type: 'server', message });
    expect(toast.error).toHaveBeenCalledWith(message);
  });

  it('resalta VARIETY_ALREADY_ASSIGNED y notifica el id_variedad', () => {
    const setError = vi.fn();
    const onVarietyAlreadyAssigned = vi.fn();
    handleFormError(
      errorApi(409, {
        statusCode: 409,
        errorCode: 'VARIETY_ALREADY_ASSIGNED',
        message: 'Esta variedad ya tiene una plantilla específica asignada.',
        id_variedad: 12,
      }),
      setError,
      { onVarietyAlreadyAssigned },
    );
    expect(setError).toHaveBeenCalledWith('cultivos', expect.objectContaining({ type: 'server' }));
    expect(onVarietyAlreadyAssigned).toHaveBeenCalledWith(12);
    expect(toast.error).toHaveBeenCalled();
  });
});
