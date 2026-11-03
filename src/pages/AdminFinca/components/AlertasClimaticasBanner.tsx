import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAlertasClimaticas } from '@/hooks/useAlertasClimaticas';
import { formatearCodigoAlerta } from '@/utils/alertasClimaticas';

interface AlertasClimaticasBannerProps {
  idFinca: number | null;
}

export function AlertasClimaticasBanner({ idFinca }: AlertasClimaticasBannerProps) {
  const { data, isPending, isError } = useAlertasClimaticas(idFinca);

  if (idFinca == null || isPending) {
    return null;
  }

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">
        No se pudieron cargar las alertas climáticas.
      </p>
    );
  }

  const alertas = data?.alertas ?? [];
  if (alertas.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {alertas.map((alerta) => (
        <Alert key={alerta.id_alerta} variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{formatearCodigoAlerta(alerta.codigo_alerta)}</AlertTitle>
          <AlertDescription>{alerta.descripcion}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
