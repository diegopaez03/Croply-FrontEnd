import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { notasCampoService } from '../services/notasCampo.service';
import { NotaCampoPayload } from '../types/notasCampo.types';

export function useCrearNotaCampo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NotaCampoPayload) => notasCampoService.crearNotaCampo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notasCampo'] });
    },
  });
}

export function useNotasCampoQuery(id_finca: number | null, id_parcela: number | null) {
  return useQuery({
    queryKey: ['notasCampo', { id_finca, id_parcela }],
    queryFn: async () => {
      if (id_parcela) {
        return notasCampoService.listarNotasPorParcela(id_parcela);
      }
      return notasCampoService.listarNotasPorFinca(id_finca as number);
    },
    enabled: !!id_finca || !!id_parcela,
  });
}

export function useConvertirNotaCampo(
  onSuccess?: () => void,
  onError?: (err: any) => void
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id_nota_campo, data }: { id_nota_campo: number; data: any }) =>
      notasCampoService.convertirNotaEnTarea(id_nota_campo, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notasCampo'] });
      // Invalida el planAccion y parcela que podrían verse afectados
      queryClient.invalidateQueries({ queryKey: ['planAccion'] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });
}
