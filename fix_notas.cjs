const fs = require('fs');

const content = `import { apiClient } from './api';
import { NotaCampoPayload, NotaCampoResponse, NotaCampoListado } from '../types/notasCampo.types';

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let mockNotaId = 1000;

// Estado en memoria para que se mantengan durante la sesión del mock
const mockNotas: (NotaCampoListado & { id_finca: number })[] = [
  {
    id_nota_campo: 901,
    contenido_nota_campo: 'Se observa baja humedad en el sector este.',
    fecha_captura_nc: new Date(Date.now() - 86400000).toISOString(),
    estado: 'Sincronizada',
    id_finca: 1, // Asumido
    id_parcela: null,
    nombre_parcela: null,
    nombre_usuario: 'Administrador Mock',
    nombre_rol_finca: 'Administrador de Finca',
  },
  {
    id_nota_campo: 902,
    contenido_nota_campo: 'Rastro de plaga en hojas bajas de la parcela.',
    fecha_captura_nc: new Date(Date.now() - 40000000).toISOString(),
    estado: 'Sincronizada',
    id_finca: 1, // Asumido
    id_parcela: 1, // Asumido, se devolverá para las que matchen
    nombre_parcela: 'Lote Norte',
    nombre_usuario: 'Administrador Mock',
    nombre_rol_finca: 'Administrador de Finca',
  }
];

export const notasCampoService = {
  crearNotaCampo: async (data: NotaCampoPayload): Promise<NotaCampoResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await delay(300);
      
      mockNotaId++;
      const fecha = data.fecha_captura_nc || new Date().toISOString();
      
      const nuevaNota = {
        id_nota_campo: mockNotaId,
        contenido_nota_campo: data.contenido_nota_campo,
        fecha_captura_nc: fecha,
        estado: 'Sincronizada',
        id_finca: data.id_finca,
        id_parcela: data.id_parcela || null,
        nombre_parcela: data.id_parcela ? 'Parcela ' + data.id_parcela : null,
        nombre_usuario: 'Administrador Mock',
        nombre_rol_finca: 'Administrador de Finca',
      };
      
      mockNotas.unshift(nuevaNota); // Add to beginning
      
      return {
        message: 'Nota guardada correctamente',
        ...nuevaNota,
        id_usuario_finca: 1,
      };
    }

    const response = await apiClient.post<NotaCampoResponse>('/notas-campo', data);
    return response.data;
  },

  listarNotasPorFinca: async (id_finca: number): Promise<{ notas: NotaCampoListado[] }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await delay(300);
      return {
        notas: mockNotas.filter(n => n.id_finca === id_finca)
      };
    }
    const response = await apiClient.get<{ notas: NotaCampoListado[] }>(\`/fincas/\${id_finca}/notas-campo\`);
    return response.data;
  },

  listarNotasPorParcela: async (id_parcela: number): Promise<{ notas: NotaCampoListado[] }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await delay(300);
      return {
        notas: mockNotas.filter(n => n.id_parcela === id_parcela)
      };
    }
    const response = await apiClient.get<{ notas: NotaCampoListado[] }>(\`/parcelas/\${id_parcela}/notas-campo\`);
    return response.data;
  },
};
`;

fs.writeFileSync('src/services/notasCampo.service.ts', content);
