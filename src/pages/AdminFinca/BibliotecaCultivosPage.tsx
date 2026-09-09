import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SearchBar } from '@/components/shared/SearchBar';
import { useCultivosBase } from '@/hooks/useCultivosBase';
import { useDebounce } from '@/hooks/useDebounce';
import { formatEpocaCultivo } from '@/utils/formatters';
import { mensajeListadoCultivosVacio } from '@/utils/cultivos-listado';
import { EPOCAS_CULTIVO } from '@/utils/validators';
import { EpocaCultivo } from '@/types/cultivos.types';
import { CultivoBibliotecaCard } from './components/CultivoBibliotecaCard';

const SELECT_CLASS =
  'h-9 bg-card border border-border rounded-lg px-3 text-sm text-muted-foreground outline-none w-full sm:w-52';

export default function BibliotecaCultivosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [epoca, setEpoca] = useState<EpocaCultivo | ''>('');
  const location = useLocation();

  const { data, isLoading } = useCultivosBase({
    search: debouncedSearch.trim() || undefined,
    epoca_cultivo: epoca || undefined,
  });

  const cultivos = useMemo(() => {
    const lista = data?.cultivos ?? [];
    if (epoca === 'Todo_el_anio') {
      return lista.filter((cultivo) => cultivo.epoca_cultivo === 'Todo_el_anio');
    }
    return lista;
  }, [data?.cultivos, epoca]);
  const emptyMessage = mensajeListadoCultivosVacio({
    search: debouncedSearch,
    epoca_cultivo: epoca,
  });

  return (
    <div className="w-full max-w-screen-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Biblioteca de cultivos</h1>
        <p className="text-muted-foreground mt-2">
          Consultá fichas técnicas, variedades y cronogramas de los cultivos base.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="w-full sm:w-96">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cultivo"
          />
        </div>
        <select
          className={SELECT_CLASS}
          value={epoca}
          onChange={(e) => setEpoca(e.target.value as EpocaCultivo | '')}
        >
          <option value="">Temporada: Todas</option>
          {EPOCAS_CULTIVO.filter((value) => value !== 'Todo_el_anio').map((value) => (
            <option key={value} value={value}>
              {formatEpocaCultivo(value)}
            </option>
          ))}
          <option value="Todo_el_anio">{formatEpocaCultivo('Todo_el_anio')}</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-16 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
          Cargando...
        </div>
      ) : cultivos.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cultivos.map((cultivo) => (
            <CultivoBibliotecaCard key={cultivo.id_cultivo_base} cultivo={cultivo} searchString={location.search} />
          ))}
        </div>
      )}
    </div>
  );
}
