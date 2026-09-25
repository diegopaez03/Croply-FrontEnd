import { useEffect } from 'react';
import { listarNotasPendientes, eliminarNotaPendiente } from '../utils/offlineCache';
import { notasCampoService } from '../services/notasCampo.service';
import { useQueryClient } from '@tanstack/react-query';

export function useSincronizacionNotas() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let isSyncing = false;

    const syncPendingNotes = async () => {
      if (isSyncing || !navigator.onLine) return;
      
      const pendientes = listarNotasPendientes();
      if (pendientes.length === 0) return;

      isSyncing = true;
      let someSynced = false;

      for (const nota of pendientes) {
        try {
          await notasCampoService.crearNotaCampo({
            id_finca: nota.id_finca,
            id_parcela: nota.id_parcela,
            contenido_nota_campo: nota.contenido_nota_campo,
            fecha_captura_nc: nota.fecha_captura_nc,
          });
          eliminarNotaPendiente(nota.idLocal);
          someSynced = true;
        } catch (error) {
          console.error('Error sincronizando nota:', error);
          // Si falla, se deja en la cola para intentar luego
        }
      }

      isSyncing = false;
      if (someSynced) {
        queryClient.invalidateQueries({ queryKey: ['notasCampo'] });
      }
    };

    // Intentar al montar
    syncPendingNotes();

    // Intentar al volver la conexión
    window.addEventListener('online', syncPendingNotes);
    return () => {
      window.removeEventListener('online', syncPendingNotes);
    };
  }, [queryClient]);
}
