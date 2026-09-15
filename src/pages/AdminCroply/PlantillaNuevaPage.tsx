import { Link, useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { PlantillaFormulario } from './components/PlantillaFormulario';
import { useCrearPlantillaBase } from '@/hooks/usePlantillasBase';
import { showSuccessToast } from '@/utils/successHandler';
import { CrearPlantillaBaseRequest } from '@/types/plantillas.types';

export default function PlantillaNuevaPage() {
  const navigate = useNavigate();
  const crearMutation = useCrearPlantillaBase();

  const guardar = async (data: CrearPlantillaBaseRequest) => {
    const response = await crearMutation.mutateAsync(data);
    showSuccessToast(response, 'Plantilla creada correctamente');
    navigate(`/admin-croply/plantillas/${response.id_plantilla_base}`);
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

      <h1 className="text-3xl font-bold text-foreground mb-2">Crear plantilla</h1>
      <p className="text-muted-foreground mb-8">
        Definí los cultivos, variedades y el cronograma de hitos y tareas.
      </p>

      <PlantillaFormulario
        onGuardar={guardar}
        onCancel={() => navigate('/admin-croply/catalogos-base')}
        isPending={crearMutation.isPending}
        textoSubmit="Guardar"
      />
    </div>
  );
}
