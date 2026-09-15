import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { useCultivosBase } from '@/hooks/useCultivosBase';
import { usePlantillasBase } from '@/hooks/usePlantillasBase';
import { nombresCultivosDePlantilla } from '@/utils/plantilla-form.mapper';
import { PlantillaCard } from './components/PlantillaCard';
import { ConfirmacionEliminarPlantilla } from './components/ConfirmacionEliminarPlantilla';
import { PaginacionCards } from './components/PaginacionCards';

const PAGE_SIZE = 10;

export default function PlantillasListadoPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);

  const { data, isLoading } = usePlantillasBase({ page, pageSize: PAGE_SIZE });
  const { data: cultivosData } = useCultivosBase();

  const plantillas = data?.plantillas ?? [];
  const pagination = data?.pagination;
  const cultivos = cultivosData?.cultivos ?? [];

  const cambiarPagina = (nuevaPage: number) => {
    setSearchParams({ page: String(nuevaPage) });
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

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Plantillas de Acción</h1>
          <p className="text-muted-foreground mt-2">
            Protocolos y planes de trabajo predefinidos para tareas agrícolas.
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin-croply/plantillas/nueva')}
          className="shrink-0 rounded-full px-5"
        >
          <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
          Nuevo
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-16 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
          Cargando...
        </div>
      ) : plantillas.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">Aún no hay plantillas cargadas.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {plantillas.map((plantilla) => (
              <PlantillaCard
                key={plantilla.id_plantilla_base}
                plantilla={plantilla}
                nombresCultivos={nombresCultivosDePlantilla(plantilla, cultivos)}
                onVer={() => navigate(`/admin-croply/plantillas/${plantilla.id_plantilla_base}`)}
                onEliminar={() => setIdAEliminar(plantilla.id_plantilla_base)}
              />
            ))}
          </div>
          {pagination && (
            <PaginacionCards
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize}
              isLoading={isLoading}
              onPageChange={cambiarPagina}
            />
          )}
        </>
      )}

      <ConfirmacionEliminarPlantilla
        idPlantilla={idAEliminar}
        open={idAEliminar != null}
        onOpenChange={(open) => {
          if (!open) setIdAEliminar(null);
        }}
      />
    </div>
  );
}
