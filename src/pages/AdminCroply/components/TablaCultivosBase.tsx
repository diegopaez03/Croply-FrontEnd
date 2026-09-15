import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon, Delete02Icon } from '@hugeicons/core-free-icons';
import { formatEpocaCultivo } from '@/utils/formatters';
import { CultivoBaseListado } from '@/types/cultivos.types';

interface TablaCultivosBaseProps {
  cultivos: CultivoBaseListado[];
  isLoading?: boolean;
  emptyMessage?: string;
  onVer: (id_cultivo_base: number) => void;
  onEliminar: (cultivo: CultivoBaseListado) => void;
}

export function TablaCultivosBase({
  cultivos,
  isLoading = false,
  emptyMessage = 'Aún no hay cultivos cargados en la biblioteca.',
  onVer,
  onEliminar,
}: TablaCultivosBaseProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-[#F8F6F1] text-[#6E6E6E] font-semibold border-y border-border/50">
          <tr>
            <th className="px-6 py-3 font-semibold text-center">Nombre</th>
            <th className="px-6 py-3 font-semibold text-center hidden md:table-cell">Temporada</th>
            <th className="px-6 py-3 font-semibold text-center">Variedades</th>
            <th className="px-6 py-3 font-semibold text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
                  Cargando...
                </div>
              </td>
            </tr>
          ) : cultivos.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                <p className="text-lg font-medium text-foreground mb-1">{emptyMessage}</p>
              </td>
            </tr>
          ) : (
            cultivos.map((cultivo) => (
              <tr
                key={cultivo.id_cultivo_base}
                className="border-b border-border/50 bg-white hover:bg-[#E8F5EF] cursor-pointer transition-colors"
                onClick={() => onVer(cultivo.id_cultivo_base)}
              >
                <td className="px-6 py-4 font-medium text-center">{cultivo.nombre_cultivo_base}</td>
                <td className="px-6 py-4 text-center hidden md:table-cell">
                  <span className="bg-[#EAEAEA] text-[#555] px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wide">
                    {formatEpocaCultivo(cultivo.epoca_cultivo)}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground text-center">
                  {cultivo.cantidad_variedades}{' '}
                  {cultivo.cantidad_variedades === 1 ? 'Variedad' : 'Variedades'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-md"
                      title="Ver"
                      onClick={(e) => {
                        e.stopPropagation();
                        onVer(cultivo.id_cultivo_base);
                      }}
                    >
                      <HugeiconsIcon icon={ViewIcon} className="size-4" />
                    </button>
                    <button
                      type="button"
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded-md"
                      title="Eliminar"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEliminar(cultivo);
                      }}
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
