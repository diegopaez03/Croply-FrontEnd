import { apiClient } from './api';

export interface SubirImagenResponse {
  message: string;
  url: string;
  public_id: string;
}

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const uploadsService = {
  subirImagen: async (archivo: File): Promise<SubirImagenResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return delay({
        message: 'Imagen subida correctamente',
        url: URL.createObjectURL(archivo),
        public_id: 'mock',
      });
    }

    const formData = new FormData();
    formData.append('archivo', archivo);
    const { data } = await apiClient.post<SubirImagenResponse>(
      '/uploads/imagenes',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return data;
  },
};
