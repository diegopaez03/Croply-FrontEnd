import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { EventoPlanCalendario } from '@/utils/plan-calendario';

interface CalendarioPlanMensualProps {
  mesVisible: Date;
  onCambiarMes: (fecha: Date) => void;
  eventos: EventoPlanCalendario[];
}

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function CalendarioPlanMensual({ mesVisible, onCambiarMes, eventos }: CalendarioPlanMensualProps) {
  const inicio = startOfWeek(startOfMonth(mesVisible), { weekStartsOn: 1 });
  const fin = endOfWeek(endOfMonth(mesVisible), { weekStartsOn: 1 });
  const dias = eachDayOfInterval({ start: inicio, end: fin });

  const eventosPorDia = new Map<string, EventoPlanCalendario[]>();
  for (const evento of eventos) {
    const lista = eventosPorDia.get(evento.clave) ?? [];
    lista.push(evento);
    eventosPorDia.set(evento.clave, lista);
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          className="size-8 rounded border border-border flex items-center justify-center hover:bg-muted"
          onClick={() => onCambiarMes(subMonths(mesVisible, 1))}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        </button>
        <h3 className="font-semibold capitalize">
          {format(mesVisible, 'MMMM yyyy', { locale: es })}
        </h3>
        <button
          type="button"
          className="size-8 rounded border border-border flex items-center justify-center hover:bg-muted"
          onClick={() => onCambiarMes(addMonths(mesVisible, 1))}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground mb-2">
        {DIAS_SEMANA.map((dia) => (
          <div key={dia} className="py-2">
            {dia}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dias.map((dia) => {
          const clave = format(dia, 'yyyy-MM-dd');
          const delMes = isSameMonth(dia, mesVisible);
          const eventosDia = eventosPorDia.get(clave) ?? [];
          const esHoyPlan = eventosDia.some((e) => e.dia_relativo === 0);

          return (
            <div
              key={clave}
              className={`min-h-20 rounded-md border p-1 text-left ${
                delMes ? 'bg-white border-border/60' : 'bg-muted/40 border-transparent text-muted-foreground'
              } ${esHoyPlan ? 'ring-1 ring-primary' : ''}`}
            >
              <p className={`text-xs font-medium mb-1 ${isSameDay(dia, new Date()) ? 'text-primary' : ''}`}>
                {format(dia, 'd')}
              </p>
              <div className="flex flex-col gap-1">
                {eventosDia.slice(0, 2).map((evento) => (
                  <span
                    key={`${evento.clave}-${evento.titulo}`}
                    className={`block truncate rounded px-1 py-0.5 text-[10px] font-semibold ${
                      evento.dia_relativo === 0
                        ? 'bg-[#EAF2ED] text-[#1A7B48]'
                        : 'bg-[#EAEAEA] text-[#555]'
                    }`}
                    title={evento.titulo}
                  >
                    {evento.titulo}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
