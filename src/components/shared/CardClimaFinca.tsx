import { useClimaFinca } from '@/hooks/useClimaFinca';
import { getClimaIcon } from '@/utils/climaIconMap';

interface CardClimaFincaProps {
  idFinca: number | null;
  variant: 'compacta' | 'extendida';
}

export function CardClimaFinca({ idFinca, variant }: CardClimaFincaProps) {
  const { data, isLoading, isError } = useClimaFinca(idFinca);

  if (isLoading) {
    return (
      <div className={`bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 shadow-sm ${variant === 'compacta' ? 'min-h-[140px]' : 'min-h-[220px]'}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (!idFinca) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col shadow-sm justify-between space-y-4">
      
      {/* HEADER COMPARTIDO */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5 text-foreground">
            Pronóstico del Clima
          </span>
          {data && (
            <span className="text-primary font-bold">
              {data.provincia}, AR
            </span>
          )}
        </div>

        {isError && (
          <div className="bg-destructive/10 text-destructive text-xs font-medium px-4 py-3 rounded-lg border border-destructive/20 mb-4">
            No se pudo actualizar el pronóstico del clima. Mostrando los últimos datos disponibles.
          </div>
        )}

        {data && (
          <div className="flex items-center gap-4">
            {getClimaIcon(data.clima_actual.condicion, "size-14")}
            <div className="flex flex-col">
              <span className="text-4xl font-bold tracking-tight text-foreground">
                {data.clima_actual.temperatura}°C
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {data.clima_actual.condicion}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER EXTENDIDO */}
      {variant === 'extendida' && data?.pronostico && (
        <div className="border-t border-border/50 pt-4 mt-2 grid grid-cols-4 gap-2">
          {data.pronostico.map((dia, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
                dia.es_hoy 
                  ? 'bg-primary/5 border border-primary/20' 
                  : 'bg-transparent border border-transparent'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${dia.es_hoy ? 'text-primary' : 'text-muted-foreground'}`}>
                {dia.dia_semana}
              </span>
              <div className="mb-2">
                {getClimaIcon(dia.condicion, "size-5")}
              </div>
              <span className="text-sm font-bold text-foreground">
                {dia.temperatura_max}°
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
