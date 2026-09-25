import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { agroquimicosService } from '@/services/agroquimicos.service';
import { RegistrarAplicacionRequest, EditarAplicacionRequest, ExportarAplicacionesParams } from '@/types/agroquimicos.types';

export function useAgroquimicosMutations(id_finca: number) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: RegistrarAplicacionRequest) => agroquimicosService.registrarAplicacion(id_finca, data),
    onSuccess: (_, _variables) => {
      queryClient.invalidateQueries({ queryKey: ['agroquimicos', id_finca] });
      
      // Invalidar el plan de acción de la parcela ya que se crea una tarea automática ahí adentro
      queryClient.invalidateQueries({ queryKey: ['planAccion'] });
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id_aplicacion, data }: { id_aplicacion: number; data: EditarAplicacionRequest }) =>
      agroquimicosService.editarAplicacion(id_finca, id_aplicacion, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agroquimicos', id_finca] });
      queryClient.invalidateQueries({ queryKey: ['planAccion'] });
    },
  });

  return { createMutation, editMutation };
}

export function useAplicacionesQuery(
  id_finca: number | null,
  params: {
    page: number;
    pageSize: number;
    id_parcela?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
    id_responsable?: number;
  }
) {
  return useQuery({
    queryKey: ['agroquimicos', id_finca, params],
    queryFn: () => agroquimicosService.listarAplicaciones(id_finca!, params),
    enabled: !!id_finca,
    retry: false,
  });
}

export function useExportarAgroquimicosMutation(id_finca: number, nombreFinca: string) {
  return useMutation({
    mutationFn: (params: ExportarAplicacionesParams) => agroquimicosService.exportarAplicaciones(id_finca, params),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanFincaName = nombreFinca.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `agroquimicos_${cleanFincaName}_${dateStr}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });
}
