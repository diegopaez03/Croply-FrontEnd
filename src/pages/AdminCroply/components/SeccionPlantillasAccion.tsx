import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Note01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { useCultivosBase } from '@/hooks/useCultivosBase';
import { usePlantillasBase } from '@/hooks/usePlantillasBase';
import { nombresCultivosDePlantilla } from '@/utils/plantilla-form.mapper';
import { PlantillaCard } from './PlantillaCard';
import { ConfirmacionEliminarPlantilla } from './ConfirmacionEliminarPlantilla';

export function SeccionPlantillasAccion() {
  const navigate = useNavigate();
  const { data, isLoading } = usePlantillasBase({ page: 1, pageSize: 2 });
  const { data: cultivosData } = useCultivosBase();
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);

  const plantillas = data?.plantillas ?? [];
  const total = data?.pagination.totalItems ?? 0;
  const cultivos = cultivosData?.cultivos ?? [];

  return (
    <>
      <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#FFF3E0] rounded-xl shrink-0">
              <HugeiconsIcon icon={Note01Icon} className="size-6 text-[#F5A623]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Plantillas de Acción</h3>
              <p className="text-sm text-muted-foreground">
                Protocolos y planes de trabajo predefinidos para tareas agrícolas.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/admin-croply/plantillas/nueva')}
            className="shrink-0 rounded-full px-5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
            Nuevo
          </Button>
        </div>

        <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-10 text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
              Cargando...
            </div>
          ) : plantillas.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-8">
              Aún no hay plantillas cargadas.
            </p>
          ) : (
            plantillas.map((plantilla) => (
              <PlantillaCard
                key={plantilla.id_plantilla_base}
                plantilla={plantilla}
                nombresCultivos={nombresCultivosDePlantilla(plantilla, cultivos)}
                onVer={() => navigate(`/admin-croply/plantillas/${plantilla.id_plantilla_base}`)}
                onEliminar={() => setIdAEliminar(plantilla.id_plantilla_base)}
              />
            ))
          )}
        </div>

        <div className="bg-[#F2F7F4] px-6 py-4 border-t border-border/50">
          <Link
            to="/admin-croply/plantillas"
            className="text-sm font-bold text-[#1A7B48] hover:underline"
          >
            Ver todas las plantillas ({total})
          </Link>
        </div>
      </div>

      <ConfirmacionEliminarPlantilla
        idPlantilla={idAEliminar}
        open={idAEliminar != null}
        onOpenChange={(open) => {
          if (!open) setIdAEliminar(null);
        }}
      />
    </>
  );
}
