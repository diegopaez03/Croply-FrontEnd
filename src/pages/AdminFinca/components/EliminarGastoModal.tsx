import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEliminarGastoMutation } from '@/hooks/useCostos';
import { GastoProduccion } from '@/types/costos.types';
import { useFincaActiva } from '@/contexts/FincaActivaContext';

interface EliminarGastoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gasto: GastoProduccion | null;
}

export function EliminarGastoModal({ open, onOpenChange, gasto }: EliminarGastoModalProps) {
  const { fincaActivaId } = useFincaActiva();
  const deleteMutation = useEliminarGastoMutation();

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (!fincaActivaId || !gasto) return;
    deleteMutation.mutate(
      { id_finca: fincaActivaId, id_gasto_produccion: gasto.id_gasto_produccion },
      {
        onSuccess: () => {
          handleClose();
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Eliminar Gasto</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que querés eliminar este gasto? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {gasto && (
            <div className="pb-6 text-sm space-y-2">
              <p><strong>Insumo:</strong> {gasto.nombre_insumo_gp}</p>
              <p><strong>Precio:</strong> ${gasto.monto_gp}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={deleteMutation.isPending}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Eliminando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
