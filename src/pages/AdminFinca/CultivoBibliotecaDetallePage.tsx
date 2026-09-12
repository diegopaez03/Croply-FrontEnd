import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  Calendar01Icon,
  Clock01Icon,
  File01Icon,
  InformationCircleIcon,
  Note01Icon,
  Plant01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import { useCultivoBase } from '@/hooks/useCultivosBase';
import { usePlantillaBase } from '@/hooks/usePlantillasBase';
import { formatEpocaCultivo, formatFormaSiembra } from '@/utils/formatters';
import { handleFormError } from '@/utils/errorHandler';
import { idPlantillaParaVariedad } from '@/utils/resolver-plantilla';
import { CultivoImagen } from '@/components/shared/CultivoImagen';
import { DEFAULT_BANNER_CULTIVO, urlBannerCultivo } from '@/utils/imagen-cultivo';
import { HitoPlantillaDetalle } from '@/types/plantillas.types';
import { VariedadDetalle } from '@/types/cultivos.types';
import { cn } from '@/utils/index';

function columnasCronograma(hitos: HitoPlantillaDetalle[]) {
  return [...hitos]
    .sort((a, b) => a.orden_hpb - b.orden_hpb)
    .map((hito) => {
      const dias = hito.tareas.map((tarea) => tarea.dia_relativo_tp);
      return {
        id: hito.id_hito_plantilla,
        dia: dias.length > 0 ? Math.min(...dias) : 0,
        titulo: hito.nombre_hpb,
        tareas: [...hito.tareas]
          .sort((a, b) => a.dia_relativo_tp - b.dia_relativo_tp)
          .map((tarea) => tarea.descripcion_tp),
      };
    });
}

export default function CultivoBibliotecaDetallePage() {
  const { id } = useParams();
  const idCultivo = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
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
  const cronograma = useMemo(
    () => (plantilla ? columnasCronograma(plantilla.hitos) : []),
    [plantilla],
  );

  const irAGenerarPlan = () => {
    if (!detalle) return;
    const params = new URLSearchParams(location.search);
    if (idVariedad) params.set('variedad', String(idVariedad));
    navigate(
      `/admin-finca/biblioteca/${detalle.id_cultivo_base}/generar-plan?${params.toString()}`,
    );
  };

  if (isLoading || !detalle) {
    return (
      <div className="flex justify-center items-center py-16 text-muted-foreground">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
        Cargando...
      </div>
    );
  }

  const datosBase = [
    {
      icon: Calendar01Icon,
      label: 'Temporada',
      value: formatEpocaCultivo(detalle.epoca_cultivo),
    },
    {
      icon: Plant01Icon,
      label: 'Forma de siembra',
      value: formatFormaSiembra(detalle.forma_siembra),
    },
    {
      icon: Calendar01Icon,
      label: 'Meses de siembra',
      value: detalle.mes_siembra,
    },
    {
      icon: Clock01Icon,
      label: 'Ciclo productivo',
      value: detalle.ciclo_productivo_cb,
    },
  ];

  return (
    <div className="w-full max-w-screen-xl mx-auto">
      <div className="relative h-56 sm:h-72 lg:h-[22rem] rounded-2xl overflow-hidden mb-8 bg-[#EAF2ED]">
        <CultivoImagen
          src={urlBannerCultivo(detalle.banner_url, detalle.imagen_url, detalle.nombre_cultivo_base)}
          fallbackSrc={DEFAULT_BANNER_CULTIVO}
          alt={`Banner de ${detalle.nombre_cultivo_base}`}
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/20" />

        <Link
          to={`/admin-finca/biblioteca${location.search}`}
          className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-white"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          Volver
        </Link>

        <div className="absolute bottom-5 left-5 right-5 sm:max-w-2xl">
          <div className="rounded-xl bg-black/50 px-5 py-4 backdrop-blur-sm">
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Cultivo de {detalle.nombre_cultivo_base}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/90">
              {detalle.descripcion_cb}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_17rem] gap-6 mb-6">
        <section className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <HugeiconsIcon icon={Note01Icon} className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Ficha técnica</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {datosBase.map((dato) => (
              <div
                key={dato.label}
                className="flex items-start gap-3 rounded-xl border border-border/70 bg-[#FBF9F5] px-4 py-3"
              >
                <div className="size-9 rounded-lg bg-white border border-border/60 flex items-center justify-center text-primary shrink-0">
                  <HugeiconsIcon icon={dato.icon} className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{dato.label}</p>
                  <p className="font-semibold text-foreground">{dato.value}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="font-semibold text-foreground">Variedades del cultivo</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Vinculá una o varias variedades de este cultivo con un plan de acción sugerido a tu parcela.
          </p>

          {detalle.variedades.length === 0 ? (
            <p className="text-sm text-muted-foreground">Este cultivo aún no tiene variedades.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {detalle.variedades.map((variedad) => (
                <FilaVariedad
                  key={variedad.id_variedad}
                  variedad={variedad}
                  seleccionada={variedad.id_variedad === idVariedad}
                  onSelect={() => setIdVariedad(variedad.id_variedad)}
                />
              ))}
            </ul>
          )}
        </section>

        <aside className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <HugeiconsIcon icon={Plant01Icon} className="size-7" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Plan de trabajo del cultivo</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Vinculá este cultivo a un plan de trabajo. Al hacerlo, se programarán automáticamente las
            tareas sugeridas para su cuidado en el calendario.
          </p>
          <button
            type="button"
            disabled={idPlantilla == null}
            onClick={irAGenerarPlan}
            className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm px-4 py-3 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HugeiconsIcon icon={SparklesIcon} className="size-4" />
            Asociar cultivo y Plan de acción
          </button>
        </aside>
      </div>

      <section className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <HugeiconsIcon icon={File01Icon} className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Cronograma de trabajo</h2>
          <span className="text-sm text-muted-foreground">Vista previa</span>
        </div>

        {idPlantilla == null ? (
          <p className="text-sm text-muted-foreground">
            Este cultivo no tiene un plan de acción predefinido disponible.
          </p>
        ) : isLoadingPlantilla || !plantilla ? (
          <p className="text-sm text-muted-foreground">Cargando cronograma...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {cronograma.map((columna, index) => (
              <div key={columna.id} className="relative">
                <div className="flex items-center mb-4">
                  <span className="size-2.5 rounded-full bg-primary shrink-0" />
                  {index < cronograma.length - 1 && (
                    <span className="hidden xl:block h-px flex-1 bg-border ml-2" />
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Día {columna.dia}
                  {/cosecha/i.test(columna.titulo) ? ' · Cosecha estimada' : ''}
                </p>
                <p className="text-sm text-muted-foreground mb-3">{columna.titulo}</p>
                <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                  {columna.tareas.map((tarea, tareaIndex) => (
                    <li key={`${columna.id}-${tareaIndex}`}>· {tarea}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-xl border border-border/70 bg-[#FBF9F5] px-4 py-3 flex items-start gap-2 text-sm text-muted-foreground">
          <HugeiconsIcon icon={InformationCircleIcon} className="size-4 mt-0.5 shrink-0" />
          <p>
            Hacé clic en una variedad para consultar la vista previa del plan de trabajo. Luego avanzá
            para confirmar la asignación por parcela.
          </p>
        </div>
      </section>
    </div>
  );
}

function FilaVariedad({
  variedad,
  seleccionada,
  onSelect,
}: {
  variedad: VariedadDetalle;
  seleccionada: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'w-full text-left rounded-xl border px-4 py-3 flex items-center gap-3 transition-colors',
          seleccionada
            ? 'border-border bg-white shadow-sm'
            : 'border-transparent bg-[#F7F5F1] hover:bg-[#F1EEE8]',
        )}
      >
        <span
          className={cn(
            'w-1.5 self-stretch rounded-full shrink-0',
            seleccionada ? 'bg-primary' : 'bg-transparent',
          )}
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">{variedad.nombre_variedad}</p>
          <p className="text-sm text-muted-foreground truncate">
            {variedad.observaciones || variedad.distancia_plantacion}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-foreground">{variedad.dias_a_cosecha} días</p>
          <p className="text-xs text-muted-foreground">A cosecha</p>
        </div>
      </button>
    </li>
  );
}
