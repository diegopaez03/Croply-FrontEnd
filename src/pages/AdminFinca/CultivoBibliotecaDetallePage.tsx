import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { useCultivoBase } from '@/hooks/useCultivosBase';
import { usePlantillaBase } from '@/hooks/usePlantillasBase';
import { formatEpocaCultivo, formatFormaSiembra } from '@/utils/formatters';
import { handleFormError } from '@/utils/errorHandler';
import { etiquetaDiaRelativo, idPlantillaParaVariedad } from '@/utils/resolver-plantilla';

const SELECT_CLASS =
  'flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export default function CultivoBibliotecaDetallePage() {
  const { id } = useParams();
  const idCultivo = Number(id);
  const navigate = useNavigate();
  const [idVariedad, setIdVariedad] = useState<number | null>(null);

  const { data: detalle, isLoading, error } = useCultivoBase(
    Number.isFinite(idCultivo) ? idCultivo : null,
  );

  useEffect(() => {
    if (error) {
      handleFormError(error, undefined, {
        onNotFoundRedirect: () => navigate('/admin-finca/biblioteca'),
      });
    }
  }, [error, navigate]);

  useEffect(() => {
    if (!detalle) return;
    if (idVariedad == null && detalle.variedades[0]) {
      setIdVariedad(detalle.variedades[0].id_variedad);
    }
  }, [detalle, idVariedad]);

  const idPlantilla = useMemo(
    () => (detalle ? idPlantillaParaVariedad(detalle, idVariedad) : null),
    [detalle, idVariedad],
  );
  const { data: plantilla, isLoading: isLoadingPlantilla } = usePlantillaBase(idPlantilla);

  const variedadSeleccionada = detalle?.variedades.find((v) => v.id_variedad === idVariedad);

  if (isLoading || !detalle) {
    return (
      <div className="flex justify-center items-center py-16 text-muted-foreground">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
        Cargando...
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto">
      <Link
        to="/admin-finca/biblioteca"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-6"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        Volver a la biblioteca
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{detalle.nombre_cultivo_base}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">{detalle.descripcion_cb}</p>
        </div>
        <Button
          disabled={idPlantilla == null}
          onClick={() =>
            navigate(
              `/admin-finca/biblioteca/${detalle.id_cultivo_base}/generar-plan${
                idVariedad ? `?variedad=${idVariedad}` : ''
              }`,
            )
          }
        >
          Generar plan de acción
        </Button>
      </div>

      <section className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Ficha técnica</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground mb-1">Temporada</dt>
            <dd className="font-medium">{formatEpocaCultivo(detalle.epoca_cultivo)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground mb-1">Forma de siembra</dt>
            <dd className="font-medium">{formatFormaSiembra(detalle.forma_siembra)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground mb-1">Meses de siembra</dt>
            <dd className="font-medium">{detalle.mes_siembra}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground mb-1">Días a cosecha</dt>
            <dd className="font-medium">
              {variedadSeleccionada
                ? `${variedadSeleccionada.dias_a_cosecha} días`
                : detalle.ciclo_productivo_cb}
            </dd>
          </div>
        </dl>
      </section>

      <section className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Variedades</h2>
        {detalle.variedades.length === 0 ? (
          <p className="text-sm text-muted-foreground">Este cultivo aún no tiene variedades.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <select
              className={SELECT_CLASS}
              value={idVariedad ?? ''}
              onChange={(e) => setIdVariedad(e.target.value ? Number(e.target.value) : null)}
            >
              {detalle.variedades.map((variedad) => (
                <option key={variedad.id_variedad} value={variedad.id_variedad}>
                  {variedad.nombre_variedad}
                </option>
              ))}
            </select>
            {variedadSeleccionada && (
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground mb-1">Distancia de plantación</dt>
                  <dd className="font-medium">{variedadSeleccionada.distancia_plantacion}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground mb-1">Días a cosecha</dt>
                  <dd className="font-medium">{variedadSeleccionada.dias_a_cosecha}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground mb-1">Observaciones</dt>
                  <dd className="font-medium">{variedadSeleccionada.observaciones || '—'}</dd>
                </div>
              </dl>
            )}
          </div>
        )}
      </section>

      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Cronograma teórico</h2>
        {idPlantilla == null ? (
          <p className="text-sm text-muted-foreground">
            Este cultivo no tiene un plan de acción predefinido disponible.
          </p>
        ) : isLoadingPlantilla || !plantilla ? (
          <p className="text-sm text-muted-foreground">Cargando cronograma...</p>
        ) : (
          <div className="flex flex-col gap-4">
            {plantilla.hitos.map((hito) => (
              <div key={hito.id_hito_plantilla} className="border border-border/60 rounded-lg p-4">
                <h3 className="font-semibold mb-3">{hito.nombre_hpb}</h3>
                <ul className="flex flex-col gap-2">
                  {[...hito.tareas]
                    .sort((a, b) => a.dia_relativo_tp - b.dia_relativo_tp)
                    .map((tarea) => (
                      <li key={tarea.id_tarea_plantilla} className="text-sm">
                        <span className="font-medium">{etiquetaDiaRelativo(tarea.dia_relativo_tp)}</span>
                        {' · '}
                        {tarea.nombre_tipo_tarea}
                        {' · '}
                        <span className="text-muted-foreground">{tarea.descripcion_tp}</span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
