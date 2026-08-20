import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Plant01Icon, PlusSignIcon, ViewIcon, Delete02Icon } from '@hugeicons/core-free-icons';
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
import { formatEpocaCultivo } from '@/utils/formatters';
import { CultivoBaseListado } from '@/types/cultivos.types';
import { CultivoBaseModal } from './CultivoBaseModal';

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
  const textoConteo = cantidad === 1 ? '1 cultivo' : `${cantidad} cultivos`;

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

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F8F6F1] text-[#6E6E6E] font-semibold border-y border-border/50">
              <tr>
                <th className="px-6 py-3 font-semibold text-center">Nombre</th>
                <th className="px-6 py-3 font-semibold text-center hidden md:table-cell">Temporada</th>
                <th className="px-6 py-3 font-semibold text-center">Variedades</th>
                <th className="px-6 py-3 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
                      Cargando...
                    </div>
                  </td>
                </tr>
              ) : cultivos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <p className="text-lg font-medium text-foreground mb-1">
                      Aún no hay cultivos cargados en la biblioteca.
                    </p>
                  </td>
                </tr>
              ) : (
                cultivos.map((cultivo) => (
                  <tr
                    key={cultivo.id_cultivo_base}
                    className="border-b border-border/50 bg-white hover:bg-[#E8F5EF] cursor-pointer transition-colors"
                    onClick={() => abrirDetalle(cultivo.id_cultivo_base)}
                  >
                    <td className="px-6 py-4 font-medium text-center">{cultivo.nombre_cultivo_base}</td>
                    <td className="px-6 py-4 text-center hidden md:table-cell">
                      <span className="bg-[#EAEAEA] text-[#555] px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wide">
                        {formatEpocaCultivo(cultivo.epoca_cultivo)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-center">
                      {cultivo.cantidad_variedades}{' '}
                      {cultivo.cantidad_variedades === 1 ? 'Variedad' : 'Variedades'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-md"
                          title="Ver"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirDetalle(cultivo.id_cultivo_base);
                          }}
                        >
                          <HugeiconsIcon icon={ViewIcon} className="size-4" />
                        </button>
                        <button
                          type="button"
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded-md"
                          title="Eliminar"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCultivoAEliminar(cultivo);
                          }}
                        >
                          <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-[#F2F7F4] px-6 py-4">
          <p className="text-sm font-bold text-[#1A7B48]">{textoConteo}</p>
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
