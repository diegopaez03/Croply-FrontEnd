import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEliminarPlantillaBase } from '@/hooks/usePlantillasBase';
import { handleFormError } from '@/utils/errorHandler';
import { showSuccessToast } from '@/utils/successHandler';

interface ConfirmacionEliminarPlantillaProps {
  idPlantilla: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEliminada?: () => void;
}

export function ConfirmacionEliminarPlantilla({
  idPlantilla,
  open,
  onOpenChange,
  onEliminada,
}: ConfirmacionEliminarPlantillaProps) {
  const eliminarMutation = useEliminarPlantillaBase();

  const confirmar = () => {
    if (idPlantilla == null) return;
    eliminarMutation.mutate(idPlantilla, {
      onSuccess: (response) => {
        showSuccessToast(response);
        onOpenChange(false);
        onEliminada?.();
      },
      onError: (error) => {
        handleFormError(error);
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onOpenChange(false); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro que deseás eliminar esta plantilla?</DialogTitle>
          <DialogDescription>
            Los planes de acción ya generados a partir de ella no se verán afectados.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={eliminarMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={confirmar}
            disabled={eliminarMutation.isPending}
          >
            {eliminarMutation.isPending ? 'Eliminando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
