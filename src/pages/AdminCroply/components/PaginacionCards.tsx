import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

interface PaginacionCardsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

export function PaginacionCards({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  isLoading = false,
  onPageChange,
}: PaginacionCardsProps) {
  if (totalPages <= 0) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-1 py-2">
      <p className="text-muted-foreground text-sm">
        {totalItems > 0
          ? `Mostrando ${startItem}-${endItem} de ${totalItems} plantillas`
          : '0 plantillas'}
      </p>
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="flex items-center justify-center size-8 rounded border border-border bg-white text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            disabled={isLoading}
            className={`flex items-center justify-center size-8 rounded font-semibold transition-colors ${
              p === currentPage
                ? 'bg-primary text-primary-foreground'
                : 'bg-transparent text-muted-foreground hover:bg-muted'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="flex items-center justify-center size-8 rounded border border-border bg-white text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
        </button>
      </div>
    </div>
  );
}
