import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, Delete02Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { PlantillaFormulario } from './components/PlantillaFormulario';
import { ConfirmacionEliminarPlantilla } from './components/ConfirmacionEliminarPlantilla';
import {
  useActualizarPlantillaBase,
  usePlantillaBase,
} from '@/hooks/usePlantillasBase';
import { useCultivosBase } from '@/hooks/useCultivosBase';
import {
  etiquetasVariedadesDeCultivo,
  mapDetalleAFormulario,
} from '@/utils/plantilla-form.mapper';
import { formatEpocaCultivo, formatFormaSiembra } from '@/utils/formatters';
import { handleFormError } from '@/utils/errorHandler';
import { showSuccessToast } from '@/utils/successHandler';
import { CrearPlantillaBaseRequest, PlantillaBaseDetalle } from '@/types/plantillas.types';
import { esAplicacionAgroquimico } from '@/utils/tipo-tarea.catalog';

export default function PlantillaDetallePage() {
  const { id } = useParams();
  const idPlantilla = Number(id);
  const navigate = useNavigate();
  const [editando, setEditando] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  const { data: detalle, isLoading, error } = usePlantillaBase(Number.isFinite(idPlantilla) ? idPlantilla : null);
  const { data: cultivosData } = useCultivosBase();
  const actualizarMutation = useActualizarPlantillaBase();

  useEffect(() => {
    if (error) {
      handleFormError(error, undefined, {
        onNotFoundRedirect: () => navigate('/admin-croply/plantillas'),
      });
    }
  }, [error, navigate]);

  const guardar = async (data: CrearPlantillaBaseRequest) => {
    const response = await actualizarMutation.mutateAsync({
      id_plantilla_base: idPlantilla,
      data,
    });
    showSuccessToast(response, 'Plantilla actualizada correctamente');
    setEditando(false);
  };

  useEffect(() => {
    if (!Number.isFinite(idPlantilla)) {
      navigate('/admin-croply/plantillas');
    }
  }, [idPlantilla, navigate]);

  return (
    <div className="w-full max-w-screen-xl mx-auto px-6 py-8">
      <Link
        to="/admin-croply/plantillas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-6"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        Volver al listado
      </Link>

      {isLoading ? (
        <div className="flex justify-center items-center py-16 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
          Cargando...
        </div>
      ) : !detalle ? null : editando ? (
        <>
          <h1 className="text-3xl font-bold text-foreground mb-8">Editar plantilla</h1>
          <PlantillaFormulario
            defaultValues={mapDetalleAFormulario(detalle)}
            onGuardar={guardar}
            onCancel={() => setEditando(false)}
            isPending={actualizarMutation.isPending}
            textoSubmit="Guardar"
          />
        </>
      ) : (
        <VistaDetallePlantilla
          detalle={detalle}
          formaSiembraPorCultivo={
            Object.fromEntries(
              (cultivosData?.cultivos ?? []).map((c) => [c.id_cultivo_base, c.forma_siembra]),
            ) as Record<number, 'Directa' | 'Almacigo'>
          }
          onEditar={() => setEditando(true)}
          onEliminar={() => setConfirmarEliminar(true)}
        />
      )}

      <ConfirmacionEliminarPlantilla
        idPlantilla={idPlantilla}
        open={confirmarEliminar}
        onOpenChange={setConfirmarEliminar}
        onEliminada={() => navigate('/admin-croply/plantillas')}
      />
    </div>
  );
}

function VistaDetallePlantilla({
  detalle,
  formaSiembraPorCultivo,
  onEditar,
  onEliminar,
}: {
  detalle: PlantillaBaseDetalle;
  formaSiembraPorCultivo: Record<number, 'Directa' | 'Almacigo'>;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground">{detalle.nombre_pb}</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onEditar}>
            <HugeiconsIcon icon={PencilEdit01Icon} className="size-4" />
            Editar
          </Button>
          <Button variant="destructive" onClick={onEliminar}>
            <HugeiconsIcon icon={Delete02Icon} className="size-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Cultivos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {detalle.cultivos_info.map((cultivo) => {
            const forma = formaSiembraPorCultivo[cultivo.id_cultivo_base];
            return (
              <div
                key={cultivo.id_cultivo_base}
                className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3"
              >
                <h3 className="font-bold text-foreground">{cultivo.nombre_cultivo_base}</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="text-[10px] font-bold text-muted-foreground tracking-wider">TEMPORADA</dt>
                    <dd>{formatEpocaCultivo(cultivo.epoca_cultivo)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold text-muted-foreground tracking-wider">FORMA DE SIEMBRA</dt>
                    <dd>{forma ? formatFormaSiembra(forma) : '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold text-muted-foreground tracking-wider">MESES</dt>
                    <dd>{cultivo.mes_siembra}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold text-muted-foreground tracking-wider">DÍAS A COSECHA</dt>
                    <dd>{cultivo.ciclo_productivo_cb}</dd>
                  </div>
                </dl>
                <p className="text-sm">
                  <span className="text-[10px] font-bold text-muted-foreground tracking-wider mr-2">
                    VARIEDADES
                  </span>
                  {etiquetasVariedadesDeCultivo(detalle, cultivo.id_cultivo_base)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Cronograma</h2>
        <div className="flex flex-col gap-4">
          {detalle.hitos.map((hito) => (
            <div key={hito.id_hito_plantilla} className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-bold mb-4">{hito.nombre_hpb}</h3>
              <ul className="flex flex-col gap-3">
                {[...hito.tareas]
                  .sort((a, b) => a.dia_relativo_tp - b.dia_relativo_tp)
                  .map((tarea) => (
                    <li key={tarea.id_tarea_plantilla} className="text-sm border-t border-border/50 pt-3 first:border-0 first:pt-0">
                      <p className="font-medium">
                        Día {tarea.dia_relativo_tp} · {tarea.nombre_tipo_tarea}
                      </p>
                      <p className="text-muted-foreground">{tarea.descripcion_tp}</p>
                      {esAplicacionAgroquimico(tarea.id_tipo_tarea) &&
                        (tarea.nombre_producto || tarea.dosis_aa) && (
                          <p className="text-muted-foreground mt-1">
                            {tarea.nombre_producto}
                            {tarea.nombre_producto && tarea.dosis_aa ? ' · ' : ''}
                            {tarea.dosis_aa}
                          </p>
                        )}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
