import { HugeiconsIcon } from '@hugeicons/react';
import { Plant01Icon } from '@hugeicons/core-free-icons';
import { Badge } from '../../../components/ui/badge';
import { CultivoHistorico } from '../../../types/fincas.types';

interface HistorialCultivoCardProps {
  cultivo: CultivoHistorico;
}

export function HistorialCultivoCard({ cultivo }: HistorialCultivoCardProps) {
  const getBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Finalizado': return 'success';
      case 'FinalizadoPorContingencia': return 'warning';
      case 'Cancelado': return 'neutral';
      case 'Inactivado': return 'neutral';
      case 'Activo': return 'info';
      default: return 'neutral';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'Finalizado': return 'Finalizado correctamente';
      case 'FinalizadoPorContingencia': return 'Finalizado por contingencia';
      case 'Cancelado': return 'Cancelado';
      case 'Inactivado': return 'Finalizado por baja de parcela';
      case 'Activo': return 'Activo';
      default: return estado;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-4 w-full">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <HugeiconsIcon icon={Plant01Icon} className="size-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{cultivo.nombre_cultivo_base || 'Cultivo'}</h3>
              <p className="text-xs text-muted-foreground">
                Variedad: <span className="font-semibold text-foreground">{cultivo.nombre_variedad || 'Estándar'}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider mb-1">Fecha de Siembra</p>
              <p className="font-semibold text-foreground">{cultivo.fecha_inicio_pa || '---'}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider mb-1">Superficie Ocupada</p>
              <p className="font-semibold text-foreground">{cultivo.superficie_ocupada_pa} ha</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider mb-1">Fecha de Fin</p>
              <p className="font-semibold text-foreground">{cultivo.fecha_fin_pa || '---'}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider mb-1">Estado</p>
              <Badge variant={getBadgeVariant(cultivo.estado) as any} className="mt-0.5">
                {getEstadoLabel(cultivo.estado)}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
