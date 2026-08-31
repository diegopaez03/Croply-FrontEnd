import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Plant01Icon } from '@hugeicons/core-free-icons';
import { formatEpocaCultivo } from '@/utils/formatters';
import { CultivoBaseListado } from '@/types/cultivos.types';

interface CultivoBibliotecaCardProps {
  cultivo: CultivoBaseListado;
}

export function CultivoBibliotecaCard({ cultivo }: CultivoBibliotecaCardProps) {
  return (
    <Link
      to={`/admin-finca/biblioteca/${cultivo.id_cultivo_base}`}
      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col"
    >
      <div className="h-36 bg-[#EAF2ED] flex items-center justify-center">
        <HugeiconsIcon icon={Plant01Icon} className="size-16 text-[#1A7B48]" />
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-foreground">{cultivo.nombre_cultivo_base}</h3>
          <span className="bg-[#EAEAEA] text-[#555] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide shrink-0">
            {formatEpocaCultivo(cultivo.epoca_cultivo)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{cultivo.descripcion_cb}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>{cultivo.ciclo_productivo_cb}</span>
          <span>
            {cultivo.cantidad_variedades}{' '}
            {cultivo.cantidad_variedades === 1 ? 'variedad' : 'variedades'}
          </span>
        </div>
      </div>
    </Link>
  );
}
