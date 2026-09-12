import { Link } from 'react-router-dom';
import { CultivoImagen } from '@/components/shared/CultivoImagen';
import { formatEpocaCultivo } from '@/utils/formatters';
import { DEFAULT_IMAGEN_CULTIVO, urlImagenCultivo } from '@/utils/imagen-cultivo';
import { CultivoBaseListado } from '@/types/cultivos.types';

interface CultivoBibliotecaCardProps {
  cultivo: CultivoBaseListado;
  searchString?: string;
}

export function CultivoBibliotecaCard({ cultivo, searchString = '' }: CultivoBibliotecaCardProps) {
  const imagen = urlImagenCultivo(cultivo.imagen_url, cultivo.nombre_cultivo_base);

  return (
    <Link
      to={`/admin-finca/biblioteca/${cultivo.id_cultivo_base}${searchString}`}
      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col"
    >
      <div className="h-40 bg-[#EAF2ED] overflow-hidden">
        <CultivoImagen
          src={imagen}
          fallbackSrc={DEFAULT_IMAGEN_CULTIVO}
          alt={cultivo.nombre_cultivo_base}
          className="h-full w-full"
        />
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
