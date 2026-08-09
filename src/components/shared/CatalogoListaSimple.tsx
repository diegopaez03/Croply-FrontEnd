import { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, PencilEdit01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export interface CatalogoListaSimpleItem {
  id: number | string;
  label: string;
  pillColor?: string; // Optional class for specific colors like 'text-blue-600 bg-blue-100'
}

export interface CatalogoListaSimpleProps {
  icono: ReactNode;
  titulo: string;
  descripcion: string;
  items: CatalogoListaSimpleItem[];
  onAgregar: () => void;
  onEditar: (id: number | string) => void;
  onEliminar: (id: number | string) => void;
  textoBotonAgregar?: string;
  onVerTodos?: () => void;
  textoVerTodos?: string;
  isLoading?: boolean;
}

export function CatalogoListaSimple({
  icono,
  titulo,
  descripcion,
  items,
  onAgregar,
  onEditar,
  onEliminar,
  textoBotonAgregar = "Agregar",
  onVerTodos,
  textoVerTodos = "Ver todos",
  isLoading = false
}: CatalogoListaSimpleProps) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
      <div className="p-6 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-muted/50 rounded-xl text-primary shrink-0">
            {icono}
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">{titulo}</h3>
            <p className="text-sm text-muted-foreground">{descripcion}</p>
          </div>
        </div>
        <Button onClick={onAgregar} className="shrink-0 rounded-full px-5 bg-primary text-primary-foreground hover:bg-primary/90">
          <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
          {textoBotonAgregar}
        </Button>
      </div>

      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No hay elementos registrados.</div>
        ) : (
          <div className="flex flex-col">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className={`flex items-center justify-between py-4 ${index !== items.length - 1 ? 'border-b border-border/50' : ''}`}
              >
                <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${item.pillColor || 'bg-[#F2F2F2] text-foreground'}`}>
                  {item.label}
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onEditar(item.id)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 transition-colors rounded-md"
                    title="Editar"
                  >
                    <HugeiconsIcon icon={PencilEdit01Icon} className="size-4" />
                  </button>
                  <button 
                    onClick={() => onEliminar(item.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 transition-colors rounded-md"
                    title="Eliminar"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {onVerTodos && items.length > 0 && (
        <div className="bg-muted/20 px-6 py-4 border-t border-border">
          <button onClick={onVerTodos} className="text-sm font-semibold text-primary hover:underline">
            {textoVerTodos}
          </button>
        </div>
      )}
    </div>
  );
}
