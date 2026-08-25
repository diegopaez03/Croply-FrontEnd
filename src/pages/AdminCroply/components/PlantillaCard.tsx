import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, ViewIcon } from '@hugeicons/core-free-icons';
import { PlantillaBaseListado } from '@/types/plantillas.types';

interface PlantillaCardProps {
  plantilla: PlantillaBaseListado;
  nombresCultivos: string[];
  onVer: () => void;
  onEliminar: () => void;
}

export function PlantillaCard({ plantilla, nombresCultivos, onVer, onEliminar }: PlantillaCardProps) {
  return (
    <div className="bg-[#FAF8F5] border border-border/50 rounded-xl p-5">
      <div className="flex justify-between items-start mb-6 gap-2">
        <h4 className="font-bold text-sm text-foreground">{plantilla.nombre_pb}</h4>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            className="text-blue-500 hover:bg-blue-50 p-1 rounded-md"
            title="Ver"
            onClick={onVer}
          >
            <HugeiconsIcon icon={ViewIcon} className="size-4" />
          </button>
          <button
            type="button"
            className="text-red-500 hover:bg-red-50 p-1 rounded-md"
            title="Eliminar"
            onClick={onEliminar}
          >
            <HugeiconsIcon icon={Delete02Icon} className="size-4" />
          </button>
        </div>
      </div>
      <div className="flex items-start gap-3 mb-4 flex-wrap">
        <span className="text-[10px] font-bold text-muted-foreground tracking-wider pt-0.5">
          CULTIVOS:
        </span>
        {nombresCultivos.length === 0 ? (
          <span className="text-xs text-muted-foreground">Sin cultivos</span>
        ) : (
          nombresCultivos.map((nombre) => (
            <span
              key={nombre}
              className="bg-[#EAF2ED] text-[#1A7B48] px-2.5 py-0.5 rounded-full text-xs font-semibold"
            >
              {nombre}
            </span>
          ))
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold text-muted-foreground tracking-wider">TAREAS:</span>
        <span className="bg-[#EAEAEA] px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#555]">
          {plantilla.cantidad_tareas} {plantilla.cantidad_tareas === 1 ? 'tarea creada' : 'tareas creadas'}
        </span>
      </div>
    </div>
  );
}
