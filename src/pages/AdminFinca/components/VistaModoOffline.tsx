import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFincaActiva } from '@/context/FincaActivaContext';
import { listarNotasPendientes, NOTAS_PENDIENTES_UPDATED_EVENT } from '@/utils/offlineCache';
import { CuadernoNotasCard } from './CuadernoNotasCard';

export function VistaModoOffline() {
  const { fincaActivaId } = useFincaActiva();
  const [pendientesCount, setPendientesCount] = useState<number>(() => listarNotasPendientes().length);

  useEffect(() => {
    const handleUpdate = () => {
      setPendientesCount(listarNotasPendientes().length);
    };

    window.addEventListener(NOTAS_PENDIENTES_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(NOTAS_PENDIENTES_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pt-2 pb-12">
      <Card className="border-amber-200 bg-amber-50/70 dark:bg-amber-950/20 dark:border-amber-800 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full shrink-0">
              <WifiOff className="size-6" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200">
                  Modo sin conexión
                </h2>
                <Badge variant={pendientesCount > 0 ? "warning" : "neutral"} className="w-fit">
                  {pendientesCount === 1 ? '1 nota pendiente' : `${pendientesCount} notas pendientes`}
                </Badge>
              </div>
              <p className="text-sm text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                No se detecta conexión a internet. La navegación y las funciones administrativas están temporalmente deshabilitadas. Podés seguir capturando notas de campo desde el cuaderno; se guardarán en este dispositivo y se sincronizarán automáticamente al reconectar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <CuadernoNotasCard idFinca={fincaActivaId} />
    </div>
  );
}
