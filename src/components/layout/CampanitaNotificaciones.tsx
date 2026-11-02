import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Alert02Icon,
  CheckListIcon,
  Notification01Icon,
} from '@hugeicons/core-free-icons';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ROUTES } from '@/constants/routes';
import { useFincaActiva } from '@/contexts/FincaActivaContext';
import { useNotificaciones } from '@/hooks/useNotificaciones';
import { Notificacion } from '@/types/notificaciones.types';

export function CampanitaNotificaciones() {
  const [abierto, setAbierto] = useState(false);
  const navigate = useNavigate();
  const { setFincaActivaId } = useFincaActiva();
  const { notificaciones, noLeidas, isLoading, isError, marcarLeida, marcarTodas } =
    useNotificaciones(abierto);

  function abrirDestino(notificacion: Notificacion) {
    if (notificacion.id_finca != null) {
      setFincaActivaId(notificacion.id_finca);
    }
    if (notificacion.tipo === 'TareaPendiente' && notificacion.id_parcela != null) {
      navigate(ROUTES.FINCA.parcelaDetalle(notificacion.id_parcela));
      return;
    }
    if (notificacion.tipo === 'AlertaClimatica') {
      navigate(ROUTES.FINCA.MI_FINCA);
    }
  }

  function alClick(notificacion: Notificacion) {
    if (!notificacion.leida) {
      marcarLeida(notificacion.id_notificacion);
    }
    setAbierto(false);
    abrirDestino(notificacion);
  }

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative flex items-center justify-center size-8 rounded-lg hover:bg-muted text-foreground"
        >
          <HugeiconsIcon icon={Notification01Icon} className="size-5" />
          {noLeidas > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
              {noLeidas > 99 ? '99+' : noLeidas}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <p className="text-sm font-semibold">Notificaciones</p>
          {noLeidas > 0 && (
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => marcarTodas()}
            >
              Marcar todas como leídas
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading && (
            <p className="px-4 py-6 text-sm text-muted-foreground">Cargando...</p>
          )}
          {isError && notificaciones.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No se pudieron cargar las notificaciones.
            </p>
          )}
          {!isLoading && !isError && notificaciones.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No tenés notificaciones nuevas.
            </p>
          )}
          {!isLoading &&
            notificaciones.map((notificacion) => (
              <button
                key={notificacion.id_notificacion}
                type="button"
                onClick={() => alClick(notificacion)}
                className="flex w-full items-start gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-muted"
              >
                <HugeiconsIcon
                  icon={
                    notificacion.tipo === 'TareaPendiente' ? CheckListIcon : Alert02Icon
                  }
                  className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium leading-snug">
                      {notificacion.titulo}
                    </span>
                    {!notificacion.leida && (
                      <span
                        aria-hidden
                        className="mt-1 size-2 shrink-0 rounded-full bg-primary"
                      />
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {notificacion.descripcion}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {tiempoRelativo(notificacion.fecha_creacion)}
                  </span>
                </span>
              </button>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function tiempoRelativo(iso: string): string {
  const minutos = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 60_000),
  );
  if (minutos < 1) return 'Hace un momento';
  if (minutos < 60) {
    return minutos === 1 ? 'Hace 1 minuto' : `Hace ${minutos} minutos`;
  }
  const horas = Math.floor(minutos / 60);
  if (horas < 24) {
    return horas === 1 ? 'Hace 1 hora' : `Hace ${horas} horas`;
  }
  const dias = Math.floor(horas / 24);
  return dias === 1 ? 'Hace 1 día' : `Hace ${dias} días`;
}
