import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import {
  Plant01Icon,
  TractorIcon,
  DropletIcon,
  TestTubeIcon,
  PotIcon,
  ShoppingBasket01Icon,
} from '@hugeicons/core-free-icons';
import { Checkbox } from '@/components/ui/checkbox';
import { HitoPlantillaDetalle } from '@/types/plantillas.types';
import { etiquetaDiaRelativo } from '@/utils/resolver-plantilla';

const ICONOS: IconSvgElement[] = [
  TractorIcon,
  Plant01Icon,
  DropletIcon,
  TestTubeIcon,
  PotIcon,
  ShoppingBasket01Icon,
];

interface HitosPlanGridProps {
  hitos: HitoPlantillaDetalle[];
  tareasActivas: Set<number>;
  onToggleTarea: (id_tarea_plantilla: number) => void;
}

export function HitosPlanGrid({ hitos, tareasActivas, onToggleTarea }: HitosPlanGridProps) {
  const ordenados = [...hitos].sort((a, b) => a.orden_hpb - b.orden_hpb);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {ordenados.map((hito, index) => {
        const esInicio = index === 0;
        const esFin = index === ordenados.length - 1;
        const diaRef = hito.tareas[0]?.dia_relativo_tp ?? 0;
        const icono = ICONOS[index % ICONOS.length];

        return (
          <div
            key={hito.id_hito_plantilla}
            className="bg-[#FAF8F5] border border-border/60 rounded-xl p-5 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="p-2 rounded-lg bg-[#EAF2ED] text-[#1A7B48]">
                <HugeiconsIcon icon={icono} className="size-6" />
              </div>
              <div className="flex flex-wrap gap-1 justify-end">
                {esInicio && (
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground bg-white px-2 py-0.5 rounded">
                    INICIO
                  </span>
                )}
                {esFin && (
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground bg-white px-2 py-0.5 rounded">
                    FIN
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${
                    diaRef === 0
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white text-muted-foreground'
                  }`}
                >
                  {etiquetaDiaRelativo(diaRef)}
                </span>
              </div>
            </div>
            <h4 className="font-semibold text-sm">{hito.nombre_hpb}</h4>
            <div className="flex flex-col gap-2">
              {hito.tareas.map((tarea) => (
                <label key={tarea.id_tarea_plantilla} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={tareasActivas.has(tarea.id_tarea_plantilla)}
                    onCheckedChange={() => onToggleTarea(tarea.id_tarea_plantilla)}
                  />
                  <span>{tarea.descripcion_tp}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
