import { HugeiconsIcon } from "@hugeicons/react";
import { Plant01Icon, PlusSignIcon, PencilEdit01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export function SeccionCultivosBase() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
      <div className="p-6 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#EAF2ED] rounded-xl text-primary shrink-0">
            <HugeiconsIcon icon={Plant01Icon} className="size-6 text-[#1A7B48]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">Cultivos Base</h3>
            <p className="text-sm text-muted-foreground">Especies, variedades y requerimientos técnicos del sistema.</p>
          </div>
        </div>
        <Button onClick={() => console.log('TODO: Implementar en futura HU')} className="shrink-0 rounded-full px-5 bg-primary text-primary-foreground hover:bg-primary/90">
          <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
          Nuevo
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#F8F6F1] text-[#6E6E6E] font-semibold border-y border-border/50">
            <tr>
              <th className="px-6 py-3 font-semibold text-center">Nombre Científico</th>
              <th className="px-6 py-3 font-semibold text-center">Nombre Común</th>
              <th className="px-6 py-3 font-semibold text-center">Categoría</th>
              <th className="px-6 py-3 font-semibold text-center">Variedades</th>
              <th className="px-6 py-3 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50 bg-white">
              <td className="px-6 py-4 text-muted-foreground text-center">Zea mays</td>
              <td className="px-6 py-4 font-medium text-center">Maíz Blanco</td>
              <td className="px-6 py-4 text-center">
                <span className="bg-[#EAEAEA] text-[#555] px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wide">CEREAL</span>
              </td>
              <td className="px-6 py-4 text-muted-foreground text-center">42 Variedades</td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-3">
                  <button className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-md"><HugeiconsIcon icon={PencilEdit01Icon} className="size-4" /></button>
                  <button className="text-red-500 hover:bg-red-50 p-1.5 rounded-md"><HugeiconsIcon icon={Delete02Icon} className="size-4" /></button>
                </div>
              </td>
            </tr>
            <tr className="border-b border-border/50 bg-white">
              <td className="px-6 py-4 text-muted-foreground text-center">Solanum lycopersicum</td>
              <td className="px-6 py-4 font-medium text-center">Tomate</td>
              <td className="px-6 py-4 text-center">
                <span className="bg-[#EAEAEA] text-[#555] px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wide">HORTALIZA</span>
              </td>
              <td className="px-6 py-4 text-muted-foreground text-center">15 Variedades</td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-3">
                  <button className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-md"><HugeiconsIcon icon={PencilEdit01Icon} className="size-4" /></button>
                  <button className="text-red-500 hover:bg-red-50 p-1.5 rounded-md"><HugeiconsIcon icon={Delete02Icon} className="size-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-[#F2F7F4] px-6 py-4">
        <button className="text-sm font-bold text-[#1A7B48] hover:underline">
          Ver todos los cultivos (128)
        </button>
      </div>
    </div>
  );
}
