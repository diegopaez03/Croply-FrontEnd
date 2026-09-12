import { HugeiconsIcon } from '@hugeicons/react';
import { Plant01Icon } from '@hugeicons/core-free-icons';
import { CronogramaPlanAccion } from './CronogramaPlanAccion';

interface CultivoItemCardProps {
  cultivo: {
    id_plan_accion?: number;
    nombre_cultivo_base?: string;
    nombre_variedad?: string;
    fecha_inicio?: string;
    superficie_asignada?: number;
    estado?: string;
  };
  idFinca?: number;
  idParcela?: number;
}

export function CultivoItemCard({ cultivo, idFinca, idParcela }: CultivoItemCardProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/50">
        <div className="space-y-4">
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
              <p className="font-semibold text-foreground">{cultivo.fecha_inicio || '---'}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider mb-1">Superficie Utilizada</p>
              <p className="font-semibold text-foreground">{cultivo.superficie_asignada} ha</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider mb-1">Cosecha Estimada</p>
              <p className="font-semibold text-foreground">A calcular</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider mb-1">Estado Actual</p>
              <span className="inline-block bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                {cultivo.estado || 'Activo'}
              </span>
            </div>
          </div>
        </div>

        <div className="border border-border/60 rounded-xl p-3 bg-muted/10 text-center max-w-[200px] shrink-0 self-start lg:self-auto min-w-[150px]">
          <p className="text-[11px] font-bold text-muted-foreground uppercase">Ciclo de Siembra</p>
          <p className="text-xs font-semibold text-foreground mt-1">{cultivo.fecha_inicio || 'Inicio activo'}</p>
        </div>
      </div>

      {cultivo.id_plan_accion ? (
        <CronogramaPlanAccion
          idPlanAccion={cultivo.id_plan_accion}
          idFinca={idFinca}
          idParcela={idParcela}
        />
      ) : (
        <p className="text-xs text-muted-foreground">
          Este cultivo no tiene un plan de acción asociado.
        </p>
      )}
    </div>
  );
}
