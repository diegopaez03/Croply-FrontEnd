import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Plant01Icon } from '@hugeicons/core-free-icons';
import { CronogramaPlanAccion } from './CronogramaPlanAccion';
import { useCultivoBase } from '../../../hooks/useCultivosBase';
import { addDays, parseISO, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface CultivoItemCardProps {
  cultivo: {
    id_plan_accion: number;
    id_cultivo_base: number;
    nombre_cultivo_base: string;
    id_variedad: number | null;
    nombre_variedad: string | null;
    superficie_ocupada_pa: number;
    fecha_inicio_pa: string;
    estado: string;
  };
  idFinca?: number;
  idParcela?: number;
}

function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const today = new Date();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="w-full min-w-[240px] max-w-[280px]">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold uppercase text-foreground">{format(currentDate, dateFormat, { locale: es })}</span>
        <div className="flex gap-4">
          <button onClick={prevMonth} className="text-muted-foreground hover:text-foreground font-bold text-xs">{'<'}</button>
          <button onClick={nextMonth} className="text-muted-foreground hover:text-foreground font-bold text-xs">{'>'}</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-2 font-bold text-muted-foreground">
        {weekDays.map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-xs">
        {days.map((day, i) => {
          const isSelected = isSameDay(day, today);
          const isCurrentMonth = isSameMonth(day, monthStart);
          return (
            <div 
              key={i} 
              className={`flex items-center justify-center size-7 rounded-full mx-auto ${
                isSelected 
                  ? 'bg-primary text-primary-foreground font-bold' 
                  : !isCurrentMonth 
                    ? 'text-muted-foreground/30' 
                    : 'text-foreground font-medium'
              }`}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CultivoItemCard({ cultivo, idFinca, idParcela }: CultivoItemCardProps) {
  const { data: cultivoBase, isLoading } = useCultivoBase(cultivo.id_variedad ? cultivo.id_cultivo_base : null);

  let cosechaEstimada = '---';
  if (cultivo.id_variedad && !isLoading && cultivoBase) {
    const variedad = cultivoBase.variedades?.find((v: any) => v.id_variedad === cultivo.id_variedad);
    if (variedad?.dias_a_cosecha != null && cultivo.fecha_inicio_pa) {
      try {
        const fechaEstimada = addDays(parseISO(cultivo.fecha_inicio_pa), variedad.dias_a_cosecha);
        cosechaEstimada = format(fechaEstimada, 'yyyy-MM-dd');
      } catch (error) {
        // Fallback a '---' en caso de error al parsear
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between pb-8 border-b border-border/50">
        
        {/* Detalles del Cultivo */}
        <div className="flex-1 pr-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="size-14 rounded-2xl bg-muted border border-border/50 flex items-center justify-center text-primary">
              <HugeiconsIcon icon={Plant01Icon} className="size-7" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-foreground">{cultivo.nombre_cultivo_base || 'Cultivo'}</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6">
            <div>
              <p className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider mb-2">Variedad</p>
              <p className="font-bold text-foreground text-sm">{cultivo.nombre_variedad || 'Estándar'}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider mb-2">Fecha de Siembra</p>
              <p className="font-bold text-foreground text-sm capitalize">
                {cultivo.fecha_inicio_pa ? format(parseISO(cultivo.fecha_inicio_pa), 'dd MMM yyyy', { locale: es }) : '---'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold text-[11px] mb-2">Superficie utilizada</p>
              <p className="font-bold text-foreground text-sm">{cultivo.superficie_ocupada_pa} ha</p>
            </div>
            
            <div>
              <p className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider mb-2">Cosecha Estimada</p>
              <p className="font-bold text-primary text-sm capitalize">
                {cosechaEstimada !== '---' ? format(parseISO(cosechaEstimada), 'dd MMM yyyy', { locale: es }) : '---'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider mb-2">Estado Actual</p>
              <span className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-3 py-1 rounded-full text-[11px]">
                {cultivo.estado || 'Activo'}
              </span>
            </div>
          </div>
        </div>

        {/* Calendario */}
        <div className="mt-8 lg:mt-0 lg:pl-10 lg:border-l lg:border-border/50 flex items-center justify-center bg-muted/10 lg:bg-transparent rounded-xl p-6 lg:p-0">
          <MiniCalendar />
        </div>
      </div>

      {cultivo.id_plan_accion ? (
        <CronogramaPlanAccion
          idPlanAccion={cultivo.id_plan_accion}
          idFinca={idFinca}
          idParcela={idParcela}
        />
      ) : (
        <p className="text-xs text-muted-foreground">
          Este cultivo no tiene un plan de acción asociado.
        </p>
      )}
    </div>
  );
}
