import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNotasCampoQuery } from '@/hooks/useNotasCampo';
import { listarNotasPendientes, obtenerParcelasCache } from '@/utils/offlineCache';
import { NotaCampoListado } from '@/types/notasCampo.types';
import { ConvertirNotaModal } from './ConvertirNotaModal';

interface VerNotasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idFinca?: number | null;
  idParcela?: number | null;
}

export function VerNotasModal({
  open,
  onOpenChange,
  idFinca,
  idParcela,
}: VerNotasModalProps) {
  const { usuario } = useAuth();
  
  const [notaAConvertir, setNotaAConvertir] = useState<NotaCampoListado | null>(null);

  const { data, isLoading } = useNotasCampoQuery(idFinca ?? null, idParcela ?? null);

  const notasCombinadas = useMemo(() => {
    if (!open) return []; // Optimization: don't compute when closed

    // 1. Obtener notas del backend (sincronizadas)
    const notasBackend = data?.notas || [];

    // 2. Obtener notas de la cola local (pendientes)
    let notasLocalesRaw = listarNotasPendientes();

    // 3. Obtener caché de parcelas para resolver nombres
    const parcelasCache = idFinca ? obtenerParcelasCache(idFinca) : [];

    // 4. Filtrar las notas locales según el contexto (idFinca o idParcela)
    if (idParcela) {
      notasLocalesRaw = notasLocalesRaw.filter((n) => n.id_parcela === idParcela);
    } else if (idFinca) {
      notasLocalesRaw = notasLocalesRaw.filter((n) => n.id_finca === idFinca);
    } else {
      notasLocalesRaw = [];
    }

    // 5. Mapear al shape de NotaCampoListado
    const notasLocales: NotaCampoListado[] = notasLocalesRaw.map((n) => {
      const parcelaEnCache = n.id_parcela ? parcelasCache.find(p => p.id_parcela === n.id_parcela) : null;
      return {
        id_nota_campo: -Math.abs(n.idLocal.charCodeAt(0)), // ID temporal negativo
        contenido_nota_campo: n.contenido_nota_campo,
        fecha_captura_nc: n.fecha_captura_nc,
        estado: 'Pendiente de sincronización',
        id_parcela: n.id_parcela,
        nombre_parcela: parcelaEnCache ? parcelaEnCache.nombre_parcela : (n.id_parcela ? `Parcela ${n.id_parcela}` : null),
        nombre_usuario: usuario?.nombre || 'Usuario actual',
        nombre_rol_finca: 'Administrador de Finca',
      };
    });

    // 6. Concatenar y ordenar por fecha descendente
    const combinadas = [...notasLocales, ...notasBackend];
    combinadas.sort(
      (a, b) => new Date(b.fecha_captura_nc).getTime() - new Date(a.fecha_captura_nc).getTime()
    );

    return combinadas;
  }, [data?.notas, idFinca, idParcela, usuario?.nombre, open]);

  const isEmpty = notasCombinadas.length === 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Notas de campo</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4">
            {isLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-3" />
                Cargando notas...
              </div>
            ) : isEmpty ? (
              <div className="py-10 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg bg-muted/10">
                {idParcela
                  ? 'No hay notas capturadas para esta parcela.'
                  : 'No hay notas capturadas para esta finca.'}
              </div>
            ) : (
              notasCombinadas.map((nota, index) => (
                <div
                  key={`${nota.id_nota_campo}-${index}`}
                  className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {new Date(nota.fecha_captura_nc).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })} hs
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {nota.nombre_usuario}
                      </span>
                      {nota.nombre_parcela && !idParcela && (
                        <span className="text-xs text-primary font-medium mt-0.5">
                          {nota.nombre_parcela}
                        </span>
                      )}
                    </div>
                    <Badge
                      variant={
                        nota.estado === 'Sincronizada'
                          ? 'success'
                          : nota.estado === 'Convertida_a_tarea'
                          ? 'info'
                          : 'warning'
                      }
                      className="text-[10px] uppercase tracking-wider px-2"
                    >
                      {nota.estado === 'Convertida_a_tarea' ? 'Convertida en tarea' : nota.estado}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {nota.contenido_nota_campo}
                  </p>

                  {nota.estado === 'Sincronizada' && (
                    <div className="flex justify-end pt-2 border-t border-border/50">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNotaAConvertir(nota)}
                      >
                        Convertir en tarea
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-border mt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConvertirNotaModal
        open={!!notaAConvertir}
        onOpenChange={(op) => {
          if (!op) setNotaAConvertir(null);
        }}
        nota={notaAConvertir}
        idFincaInicial={idFinca as number}
      />
    </>
  );
}
