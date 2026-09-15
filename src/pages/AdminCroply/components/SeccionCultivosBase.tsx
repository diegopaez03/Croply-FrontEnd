import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Plant01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCultivosBase, useEliminarCultivoBase } from '@/hooks/useCultivosBase';
import { handleFormError } from '@/utils/errorHandler';
import { showSuccessToast } from '@/utils/successHandler';
import { CultivoBaseListado } from '@/types/cultivos.types';
import { CultivoBaseModal } from './CultivoBaseModal';
import { TablaCultivosBase } from './TablaCultivosBase';

export function SeccionCultivosBase() {
  const { data, isLoading } = useCultivosBase();
  const eliminarMutation = useEliminarCultivoBase();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);
  const [cultivoAEliminar, setCultivoAEliminar] = useState<CultivoBaseListado | null>(null);

  const cultivos = data?.cultivos ?? [];

  const abrirCrear = () => {
    setIdSeleccionado(null);
    setModalAbierto(true);
  };

  const abrirDetalle = (id_cultivo_base: number) => {
    setIdSeleccionado(id_cultivo_base);
    setModalAbierto(true);
  };

  const confirmarEliminar = () => {
    if (!cultivoAEliminar) return;
    eliminarMutation.mutate(cultivoAEliminar.id_cultivo_base, {
      onSuccess: (response) => {
        showSuccessToast(response);
        setCultivoAEliminar(null);
      },
      onError: (error) => {
        handleFormError(error);
        setCultivoAEliminar(null);
      },
    });
  };

  const cantidad = cultivos.length;

  return (
    <>
      <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#EAF2ED] rounded-xl text-primary shrink-0">
              <HugeiconsIcon icon={Plant01Icon} className="size-6 text-[#1A7B48]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Cultivos Base</h3>
              <p className="text-sm text-muted-foreground">
                Especies, variedades y requerimientos técnicos del sistema.
              </p>
            </div>
          </div>
          <Button
            onClick={abrirCrear}
            className="shrink-0 rounded-full px-5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
            Nuevo
          </Button>
        </div>

        <TablaCultivosBase
          cultivos={cultivos}
          isLoading={isLoading}
          onVer={abrirDetalle}
          onEliminar={setCultivoAEliminar}
        />

        <div className="bg-[#F2F7F4] px-6 py-4 border-t border-border/50">
          <Link
            to="/admin-croply/cultivos"
            className="text-sm font-bold text-[#1A7B48] hover:underline"
          >
            Ver todos los cultivos ({cantidad})
          </Link>
        </div>
      </div>

      <CultivoBaseModal
        open={modalAbierto}
        onOpenChange={setModalAbierto}
        idCultivoBase={idSeleccionado}
      />

      <Dialog open={Boolean(cultivoAEliminar)} onOpenChange={(val) => { if (!val) setCultivoAEliminar(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro que deseás eliminar este cultivo?</DialogTitle>
            <DialogDescription>
              Esta acción dará de baja el cultivo y ya no estará disponible en la biblioteca.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCultivoAEliminar(null)}
              disabled={eliminarMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarEliminar}
              disabled={eliminarMutation.isPending}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
