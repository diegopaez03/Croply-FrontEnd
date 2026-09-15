import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SearchBar } from '@/components/shared/SearchBar';
import { useCultivosBase, useEliminarCultivoBase } from '@/hooks/useCultivosBase';
import { useDebounce } from '@/hooks/useDebounce';
import { handleFormError } from '@/utils/errorHandler';
import { showSuccessToast } from '@/utils/successHandler';
import { formatEpocaCultivo, formatFormaSiembra } from '@/utils/formatters';
import {
  mensajeListadoCultivosVacio,
  ordenarCultivosBase,
  OrdenCultivos,
} from '@/utils/cultivos-listado';
import { EPOCAS_CULTIVO, FORMAS_SIEMBRA } from '@/utils/validators';
import { CultivoBaseListado, EpocaCultivo, FormaSiembra } from '@/types/cultivos.types';
import { CultivoBaseModal } from './components/CultivoBaseModal';
import { TablaCultivosBase } from './components/TablaCultivosBase';

const SELECT_CLASS =
  'h-9 bg-card border border-border rounded-lg px-3 text-sm text-muted-foreground outline-none w-full sm:w-52 disabled:opacity-50';

export default function CultivosListadoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [epoca, setEpoca] = useState<EpocaCultivo | ''>('');
  const [formaSiembra, setFormaSiembra] = useState<FormaSiembra | ''>('');
  const [orden, setOrden] = useState<OrdenCultivos>('nombre_asc');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);
  const [cultivoAEliminar, setCultivoAEliminar] = useState<CultivoBaseListado | null>(null);

  const { data, isLoading } = useCultivosBase({
    search: debouncedSearch.trim() || undefined,
    epoca_cultivo: epoca || undefined,
    forma_siembra: formaSiembra || undefined,
  });
  const eliminarMutation = useEliminarCultivoBase();

  const cultivos = useMemo(() => {
    let lista = data?.cultivos ?? [];
    if (epoca === 'Todo_el_anio') {
      lista = lista.filter((cultivo) => cultivo.epoca_cultivo === 'Todo_el_anio');
    }
    return ordenarCultivosBase(lista, orden);
  }, [data?.cultivos, orden, epoca]);

  const emptyMessage = mensajeListadoCultivosVacio({
    search: debouncedSearch,
    epoca_cultivo: epoca,
    forma_siembra: formaSiembra,
  });

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

  return (
    <div className="w-full max-w-screen-xl mx-auto px-6 py-8">
      <Link
        to="/admin-croply/catalogos-base"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-6"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        Volver a catálogos
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cultivos Base</h1>
          <p className="text-muted-foreground mt-2">
            Buscá, filtrá y ordená los cultivos de la biblioteca.
          </p>
        </div>
        <Button onClick={abrirCrear} className="shrink-0 rounded-full px-5">
          <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
          Nuevo
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="w-full lg:w-96">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cultivo"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <select
            className={SELECT_CLASS}
            value={epoca}
            onChange={(e) => setEpoca(e.target.value as EpocaCultivo | '')}
          >
            <option value="">Temporada: Todas</option>
            {EPOCAS_CULTIVO.map((value) => (
              <option key={value} value={value}>
                {formatEpocaCultivo(value)}
              </option>
            ))}
          </select>
          <select
            className={SELECT_CLASS}
            value={formaSiembra}
            onChange={(e) => setFormaSiembra(e.target.value as FormaSiembra | '')}
          >
            <option value="">Siembra: Todas</option>
            {FORMAS_SIEMBRA.map((value) => (
              <option key={value} value={value}>
                {formatFormaSiembra(value)}
              </option>
            ))}
          </select>
          <select
            className={SELECT_CLASS}
            value={orden}
            onChange={(e) => setOrden(e.target.value as OrdenCultivos)}
          >
            <option value="nombre_asc">Orden: Nombre A-Z</option>
            <option value="nombre_desc">Orden: Nombre Z-A</option>
            <option value="temporada_asc">Orden: Temporada</option>
            <option value="variedades_desc">Orden: Más variedades</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <TablaCultivosBase
          cultivos={cultivos}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          onVer={abrirDetalle}
          onEliminar={setCultivoAEliminar}
        />
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
    </div>
  );
}
