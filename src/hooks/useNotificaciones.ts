import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificacionesService } from '../services/notificaciones.service';
import { ListadoNotificaciones, Notificacion } from '../types/notificaciones.types';

const QUERY_KEY = ['notificaciones'] as const;
const CINCO_MINUTOS = 5 * 60 * 1000;

export function useNotificaciones(panelAbierto: boolean) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => notificacionesService.listar(),
    refetchInterval: panelAbierto ? false : CINCO_MINUTOS,
  });

  useEffect(() => {
    if (panelAbierto) {
      void query.refetch();
    }
    // Solo al abrir el panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelAbierto]);

  const marcarLeida = useMutation({
    mutationFn: (id: number) => notificacionesService.marcarLeida(id),
    onSuccess: (actualizada) => {
      queryClient.setQueryData<ListadoNotificaciones>(QUERY_KEY, (previo) => {
        if (!previo) return previo;
        const anterior = previo.notificaciones.find(
          (item) => item.id_notificacion === actualizada.id_notificacion,
        );
        const eraNoLeida = anterior != null && !anterior.leida && actualizada.leida;
        return {
          no_leidas: eraNoLeida ? Math.max(0, previo.no_leidas - 1) : previo.no_leidas,
          notificaciones: previo.notificaciones.map((item) =>
            item.id_notificacion === actualizada.id_notificacion ? actualizada : item,
          ),
        };
      });
    },
  });

  const marcarTodas = useMutation({
    mutationFn: () => notificacionesService.marcarTodasLeidas(),
    onSuccess: () => {
      const ahora = new Date().toISOString();
      queryClient.setQueryData<ListadoNotificaciones>(QUERY_KEY, (previo) => {
        if (!previo) return previo;
        return {
          no_leidas: 0,
          notificaciones: previo.notificaciones.map((item) =>
            item.leida ? item : { ...item, leida: true, fecha_lectura: ahora },
          ),
        };
      });
    },
  });

  return {
    notificaciones: query.data?.notificaciones ?? [],
    noLeidas: query.data?.no_leidas ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    marcarLeida: marcarLeida.mutate,
    marcarTodas: marcarTodas.mutate,
  };
}
