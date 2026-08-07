import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon } from '@hugeicons/core-free-icons';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export function SearchBar({ placeholder = 'Buscar...', value, onChange, disabled = false }: SearchBarProps) {
  return (
    <div className={`bg-card border border-border h-9 flex items-center rounded-lg drop-shadow-[0px_1px_1px_rgba(0,0,0,0.1)] px-3 w-full ${disabled ? 'opacity-50' : ''}`}>
      <HugeiconsIcon icon={Search01Icon} className="size-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full h-full bg-transparent border-none outline-none ml-2 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />
    </div>
  );
}
