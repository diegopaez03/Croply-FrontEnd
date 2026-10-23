import { Badge } from '@/components/ui/badge';
import {
  ParcelaParaRecomendacion,
  useRecomendacionDestacadaFinca,
} from '@/hooks/useRecomendacionParcela';
import {
  EstadoRecomendacionVacio,
  MENSAJE_RECOMENDACION_NO_DISPONIBLE,
} from './RecomendacionIaCard';

interface RecomendacionIaResumenCardProps {
  parcelas: ParcelaParaRecomendacion[];
  cargandoParcelas?: boolean;
}

export function RecomendacionIaResumenCard({
  parcelas,
  cargandoParcelas = false,
}: RecomendacionIaResumenCardProps) {
  const { isLoading, destacada, servicioNoDisponible } = useRecomendacionDestacadaFinca(parcelas);

  if (cargandoParcelas || isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[96px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
      </div>
    );
  }

  if (servicioNoDisponible) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">{MENSAJE_RECOMENDACION_NO_DISPONIBLE}</p>
      </div>
    );
  }

  if (!destacada) {
    return <EstadoRecomendacionVacio compacta />;
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
      <p className="text-sm font-semibold text-foreground">{destacada.recomendacion.titulo_corto}</p>
      <Badge variant="neutral" className="w-fit">
        {destacada.nombre_parcela}
      </Badge>
    </div>
  );
}
