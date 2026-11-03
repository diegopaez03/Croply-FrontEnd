import { Sparkles } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Plant01Icon } from '@hugeicons/core-free-icons';
import {
  esServicioIaNoDisponible,
  mensajeErrorRecomendacion,
  codigoErrorRecomendacion,
  useRecomendacionParcela,
} from '@/hooks/useRecomendacionParcela';
import { RecomendacionIaResponse } from '@/types/recomendacionesIa.types';

export const MENSAJE_RECOMENDACION_VACIA =
  'No hay recomendaciones activas en este momento.';

export const MENSAJE_RECOMENDACION_NO_DISPONIBLE =
  'No se pudo actualizar la recomendación de IA. Mostrando última información disponible.';

export const MENSAJE_SIN_PLAN =
  'Esta parcela no tiene un plan de acción. Asigná un cultivo para ver recomendaciones.';

export const MENSAJE_CULTIVO_NO_SOPORTADO =
  'Las recomendaciones todavía no están disponibles para este cultivo.';

export const MENSAJE_SIN_LECTURAS =
  'No hay lecturas de sensores para generar una recomendación.';

export const MENSAJE_ERROR_GENERICO = 'No se pudo cargar la recomendación.';

interface RecomendacionIaCardProps {
  idParcela: number | null;
  nombreParcela: string;
  consultar: boolean;
  sinPlan: boolean;
  variante: 'embebida' | 'detalle';
}

function tieneTextos(recomendacion: RecomendacionIaResponse | null | undefined): boolean {
  if (!recomendacion) return false;
  return Boolean(
    recomendacion.titulo_corto ||
      recomendacion.texto_breve ||
      recomendacion.texto_explicativo_extendido,
  );
}

function mensajeDeError(error: unknown): string {
  const codigo = codigoErrorRecomendacion(error);
  if (esServicioIaNoDisponible(error)) return MENSAJE_RECOMENDACION_NO_DISPONIBLE;
  if (codigo === 'CROP_NOT_SUPPORTED') {
    return mensajeErrorRecomendacion(error) ?? MENSAJE_CULTIVO_NO_SOPORTADO;
  }
  if (codigo === 'INSUFFICIENT_SENSOR_DATA') {
    return mensajeErrorRecomendacion(error) ?? MENSAJE_SIN_LECTURAS;
  }
  if (codigo === 'PARCEL_WITHOUT_ACTION_PLAN') return MENSAJE_SIN_PLAN;
  return MENSAJE_ERROR_GENERICO;
}

function AvisoSensor({
  texto,
  nombreParcela,
}: {
  texto: string;
  nombreParcela: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary">
        <HugeiconsIcon icon={Plant01Icon} className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{texto}</p>
        <p className="text-xs text-muted-foreground">Sensor · {nombreParcela}</p>
      </div>
    </div>
  );
}

function Encabezado({ titulo }: { titulo?: string | null }) {
  return (
    <div className="bg-primary px-4 py-3 text-primary-foreground">
      <div className="flex items-center gap-2 text-xs font-medium">
        <Sparkles className="size-3.5" />
        Recomendación IA
      </div>
      {titulo ? <p className="mt-1 text-base font-bold leading-snug">{titulo}</p> : null}
    </div>
  );
}

export function RecomendacionIaCard({
  idParcela,
  nombreParcela,
  consultar,
  sinPlan,
  variante,
}: RecomendacionIaCardProps) {
  const consulta = useRecomendacionParcela(idParcela, consultar);
  const embebida = variante === 'embebida';

  let titulo: string | null = null;
  let aviso: string | null = null;
  let cuerpo: string | null = null;
  let cargando = false;

  if (!consultar) {
    cuerpo = sinPlan ? MENSAJE_SIN_PLAN : MENSAJE_RECOMENDACION_VACIA;
  } else if (consulta.isPending) {
    cargando = true;
  } else if (consulta.isError) {
    cuerpo = mensajeDeError(consulta.error);
  } else if (!tieneTextos(consulta.data) || !consulta.data) {
    cuerpo = MENSAJE_RECOMENDACION_VACIA;
  } else {
    titulo = consulta.data.titulo_corto;
    aviso = consulta.data.texto_breve;
    cuerpo =
      embebida && consulta.data.texto_breve
        ? null
        : consulta.data.texto_explicativo_extendido;
  }

  if (embebida) {
    return (
      <div className="space-y-3 rounded-xl bg-primary p-4 text-primary-foreground">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <Sparkles className="size-3.5" />
            Recomendación IA
          </div>
          {titulo ? <p className="mt-1 text-base font-bold leading-snug">{titulo}</p> : null}
        </div>
        {cargando ? (
          <div className="flex justify-center py-2">
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary-foreground" />
          </div>
        ) : (
          <>
            {aviso ? <AvisoSensor texto={aviso} nombreParcela={nombreParcela} /> : null}
            {cuerpo ? <p className="text-sm leading-relaxed text-primary-foreground/90">{cuerpo}</p> : null}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <Encabezado titulo={titulo} />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {cargando ? (
          <div className="flex flex-1 items-center justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {aviso ? <AvisoSensor texto={aviso} nombreParcela={nombreParcela} /> : null}
            {cuerpo ? <p className="text-sm leading-relaxed text-foreground">{cuerpo}</p> : null}
          </>
        )}
      </div>
    </div>
  );
}
