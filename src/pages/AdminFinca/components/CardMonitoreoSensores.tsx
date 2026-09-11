import { Badge } from '@/components/ui/badge';
import { useMonitoreoSensoresQuery } from '@/hooks/useMonitoreoSensores';
import { mapNombreSensorAIcono } from '@/utils/sensorIconMap';

interface CardMonitoreoSensoresProps {
  idParcela: number;
}

const estadoSenalBadge = (estado: string) => {
  if (estado === 'Transmitiendo') return <Badge variant="success" className="uppercase text-[10px] tracking-wider px-2 py-0.5">{estado}</Badge>;
  if (estado === 'Sin_senal') return <Badge variant="neutral" className="uppercase text-[10px] tracking-wider px-2 py-0.5">Sin señal</Badge>;
  return <Badge variant="neutral" className="uppercase text-[10px] tracking-wider px-2 py-0.5">{estado}</Badge>;
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  } catch (e) {
    return dateStr;
  }
};

export function CardMonitoreoSensores({ idParcela }: CardMonitoreoSensoresProps) {
  const { data, isLoading, isError } = useMonitoreoSensoresQuery(idParcela);

  // Mismos estilos base que el placeholder, pero sin dashed
  const baseClasses = "lg:col-span-2 bg-card border border-border rounded-2xl p-6 flex flex-col space-y-4 shadow-sm h-full";

  if (isLoading) {
    return (
      <div className={baseClasses}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-foreground">Sensores IoT</h3>
          </div>
        </div>
        <div className="py-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={baseClasses}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-foreground">Sensores IoT</h3>
          </div>
        </div>
        <div className="py-6 text-center text-destructive space-y-1">
          <p className="text-sm font-medium">No se pudo cargar la información de sensores</p>
        </div>
      </div>
    );
  }

  // Caso: parcela sin sensores asociados
  if (!data?.sensores || data.sensores.length === 0) {
    return (
      <div className={baseClasses}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-foreground">Sensores IoT</h3>
          </div>
        </div>
        <div className="py-6 text-center text-muted-foreground space-y-1">
          <p className="text-sm">Esta parcela no tiene sensores asociados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm text-foreground">Sensores IoT</h3>
        </div>
        {data.estado_general && estadoSenalBadge(data.estado_general)}
      </div>

      {/* Warning No Bloqueante */}
      {data.estado_general === 'Sin_senal' && (
        <div className="bg-destructive/10 text-destructive text-xs font-medium px-4 py-3 rounded-lg border border-destructive/20">
          No se pudo actualizar la información de los sensores. Mostrando los últimos datos disponibles.
        </div>
      )}

      {/* Grid de Sensores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-2">
        {data.sensores.map((sensor) => (
          <div key={sensor.id_sensor} className="border border-border/70 rounded-xl p-4 flex flex-col justify-between bg-card hover:border-primary/30 transition-colors">
            
            {/* Top row: Label + Icon */}
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest break-words pr-2">
                {sensor.nombre_tipo_sensor}
              </span>
              <div className="text-primary/70 shrink-0">
                {mapNombreSensorAIcono(sensor.nombre_tipo_sensor)}
              </div>
            </div>

            {/* Middle row: Value + Unit */}
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-bold text-foreground">
                {sensor.ultimo_valor != null ? sensor.ultimo_valor : '—'}
              </span>
              {sensor.ultimo_valor != null && sensor.unidad_medida_ts && (
                <span className="text-sm font-semibold text-muted-foreground">
                  {sensor.unidad_medida_ts}
                </span>
              )}
            </div>

            {/* Bottom row: Status badge + Date */}
            <div className="flex flex-col gap-1.5 mt-auto">
              <div className="self-start">
                {estadoSenalBadge(sensor.estado_senal)}
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">
                Últ. lectura: {formatDate(sensor.fecha_ultima_lectura)}
              </span>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
