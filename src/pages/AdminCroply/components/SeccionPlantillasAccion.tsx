import { HugeiconsIcon } from "@hugeicons/react";
import { Note01Icon, PlusSignIcon, PencilEdit01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export function SeccionPlantillasAccion() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
      <div className="p-6 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#FFF3E0] rounded-xl shrink-0">
            <HugeiconsIcon icon={Note01Icon} className="size-6 text-[#F5A623]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">Plantillas de Acción</h3>
            <p className="text-sm text-muted-foreground">Protocolos y planes de trabajo predefinidos para tareas agrícolas.</p>
          </div>
        </div>
        <Button onClick={() => console.log('TODO: Implementar en futura HU')} className="shrink-0 rounded-full px-5 bg-primary text-primary-foreground hover:bg-primary/90">
          <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
          Nuevo
        </Button>
      </div>

      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#FAF8F5] border border-border/50 rounded-xl p-5">
          <div className="flex justify-between items-start mb-6">
            <h4 className="font-bold text-sm text-foreground">Plan de Cultivo de Ajo</h4>
            <div className="flex gap-2">
               <button className="text-blue-500 hover:bg-blue-50 p-1 rounded-md"><HugeiconsIcon icon={PencilEdit01Icon} className="size-4" /></button>
               <button className="text-red-500 hover:bg-red-50 p-1 rounded-md"><HugeiconsIcon icon={Delete02Icon} className="size-4" /></button>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-bold text-muted-foreground tracking-wider">CULTIVOS:</span>
            <span className="bg-[#EAF2ED] text-[#1A7B48] px-2.5 py-0.5 rounded-full text-xs font-semibold">Ajo</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-muted-foreground tracking-wider">TAREAS:</span>
            <span className="bg-[#EAEAEA] px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#555]">28 tareas creadas</span>
          </div>
        </div>

        <div className="bg-[#FAF8F5] border border-border/50 rounded-xl p-5">
          <div className="flex justify-between items-start mb-6">
            <h4 className="font-bold text-sm text-foreground">Plan de Cultivos de Verdeo</h4>
            <div className="flex gap-2">
               <button className="text-blue-500 hover:bg-blue-50 p-1 rounded-md"><HugeiconsIcon icon={PencilEdit01Icon} className="size-4" /></button>
               <button className="text-red-500 hover:bg-red-50 p-1 rounded-md"><HugeiconsIcon icon={Delete02Icon} className="size-4" /></button>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-bold text-muted-foreground tracking-wider">CULTIVOS:</span>
            <span className="bg-[#EAF2ED] text-[#1A7B48] px-2.5 py-0.5 rounded-full text-xs font-semibold">Lechuga</span>
            <span className="bg-[#EAF2ED] text-[#1A7B48] px-2.5 py-0.5 rounded-full text-xs font-semibold">Acelga</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-muted-foreground tracking-wider">TAREAS:</span>
            <span className="bg-[#EAEAEA] px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#555]">13 tareas creadas</span>
          </div>
        </div>
      </div>

      <div className="bg-[#F2F7F4] px-6 py-4 border-t border-border/50">
        <button className="text-sm font-bold text-[#1A7B48] hover:underline">
          Ver todas las plantillas (24)
        </button>
      </div>
    </div>
  );
}
