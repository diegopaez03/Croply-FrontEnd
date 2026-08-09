import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

export interface ColumnDef<T> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render: (item: T) => React.ReactNode;
}

export interface TablaConPaginacionProps<T> {
  title?: string;
  icon?: React.ReactNode;
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  keyExtractor?: (item: T, index: number) => string | number;
}

export function TablaConPaginacion<T>({
  title,
  icon,
  columns,
  data,
  isLoading = false,
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  emptyStateTitle = "No se encontraron resultados",
  emptyStateMessage = "No hay registros para mostrar.",
  keyExtractor
}: TablaConPaginacionProps<T>) {
  
  const generatePageNumbers = () => {
    const pages = [];
    // Logica simplificada para mostrar siempre todas las paginas (asumiendo que no hay miles)
    // En una app real, si totalPages es > 5, se mostrarían elipses
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const getRowKey = (item: any, index: number) => {
    if (keyExtractor) return keyExtractor(item, index);
    return item.id || index;
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="bg-white border border-border rounded-xl shadow-sm w-full flex flex-col">
      {/* Table Title and Pagination summary */}
      {(title || icon) && (
        <div className="bg-muted/50 border-b border-border px-6 py-6 flex justify-between items-center">
          <div className="flex gap-2 items-center">
            {icon && <div className="text-primary">{icon}</div>}
            {title && <h2 className="text-primary font-semibold text-xl font-sans">{title}</h2>}
          </div>
          <p className="text-muted-foreground text-sm font-normal font-sans">
            {totalItems > 0 ? `Mostrando ${startItem}-${endItem} de ${totalItems} registros` : '0 registros'}
          </p>
        </div>
      )}

      {/* Table content */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[970px]">
          <thead className="bg-muted/80">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className={`border-b border-border py-4 px-4 text-muted-foreground font-semibold text-sm font-sans ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-muted-foreground">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                    Cargando...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-muted-foreground">
                  <p className="text-lg font-medium text-foreground mb-1">{emptyStateTitle}</p>
                  <p className="text-sm">{emptyStateMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={getRowKey(row, idx)} className="bg-white hover:bg-muted/30 transition-colors">
                  {columns.map((col) => (
                    <td 
                      key={`${getRowKey(row, idx)}-${col.key}`} 
                      className={`border-b border-border py-4 px-4 text-base font-sans leading-6 text-foreground ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 0 && (
        <div className="bg-muted/50 px-6 py-4 flex justify-between items-center border-t border-border">
          <p className="text-muted-foreground text-sm font-sans">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className="flex items-center justify-center size-8 rounded border border-border bg-white text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={1.5} />
            </button>
            
            {generatePageNumbers().map((p) => (
              <button 
                key={p}
                onClick={() => onPageChange(p)}
                disabled={isLoading}
                className={`flex items-center justify-center size-8 rounded font-semibold transition-colors ${p === currentPage ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-muted'}`}
              >
                {p}
              </button>
            ))}

            <button 
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className="flex items-center justify-center size-8 rounded border border-border bg-white text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
