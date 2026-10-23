import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  esServicioIaNoDisponible,
  useRecomendacionParcela,
} from '@/hooks/useRecomendacionParcela';
import { RecomendacionIaResponse } from '@/types/recomendacionesIa.types';

export const MENSAJE_RECOMENDACION_VACIA =
  'No hay recomendaciones activas en este momento.';

export const MENSAJE_RECOMENDACION_NO_DISPONIBLE =
  'No se pudo actualizar la recomendación de IA. Mostrando última información disponible.';

interface RecomendacionIaCardProps {
  idParcela: number;
}

function etiquetaSensor(recomendacion: RecomendacionIaResponse): string {
  const nombre = recomendacion.sensor_origen_principal.replace(/_/g, ' ');
  const factor = recomendacion.factores_clave.find(
    (item) => item.sensor_ui === recomendacion.sensor_origen_principal,
  );
  if (factor?.valor == null) return nombre;
  return `${nombre}: ${factor.valor}`;
}

function tieneTextos(recomendacion: RecomendacionIaResponse | null | undefined): boolean {
  if (!recomendacion) return false;
  return Boolean(
    recomendacion.titulo_corto ||
      recomendacion.texto_breve ||
      recomendacion.texto_explicativo_extendido,
  );
}

export function EstadoRecomendacionVacio({ compacta = false }: { compacta?: boolean }) {
  return (
    <div
      className={`bg-muted/40 text-muted-foreground border border-border rounded-2xl p-6 shadow-sm ${
        compacta ? '' : 'h-full'
      }`}
    >
      <p className="text-sm font-normal">{MENSAJE_RECOMENDACION_VACIA}</p>
    </div>
  );
}

export function RecomendacionIaCard({ idParcela }: RecomendacionIaCardProps) {
  const { data, isPending, isError, error } = useRecomendacionParcela(idParcela);
  const servicioCaido = isError && esServicioIaNoDisponible(error);
  const mostrarContenido = tieneTextos(data);

  if (isPending && !mostrarContenido) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (!mostrarContenido && servicioCaido) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-full">
        <p className="text-sm text-muted-foreground">{MENSAJE_RECOMENDACION_NO_DISPONIBLE}</p>
      </div>
    );
  }

  if (!mostrarContenido && isError) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-full">
        <p className="text-sm text-muted-foreground">No se pudo cargar la recomendación.</p>
      </div>
    );
  }

  if (!mostrarContenido || !data) {
    return <EstadoRecomendacionVacio />;
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col space-y-4 shadow-sm h-full">
      {servicioCaido && (
        <p className="text-sm text-muted-foreground">{MENSAJE_RECOMENDACION_NO_DISPONIBLE}</p>
      )}
      <div className="flex items-start gap-2">
        <Sparkles className="size-4 text-primary shrink-0 mt-1" />
        <h3 className="text-lg font-semibold text-foreground">{data.titulo_corto}</h3>
      </div>
      <Badge variant="info" className="w-fit">
        {etiquetaSensor(data)}
      </Badge>
      {data.texto_explicativo_extendido && (
        <p className="text-base font-normal text-foreground">{data.texto_explicativo_extendido}</p>
      )}
    </div>
  );
}
