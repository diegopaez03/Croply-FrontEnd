import React from 'react';

export interface CardMetricaProps {
  icon: React.ReactNode;
  labelTop: string;
  labelBottom?: string;
  value: React.ReactNode;
  iconBgColor?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function CardMetrica({
  icon,
  labelTop,
  labelBottom,
  value,
  iconBgColor = 'bg-primary/10',
  orientation = 'horizontal'
}: CardMetricaProps) {
  if (orientation === 'vertical') {
    return (
      <div className="bg-white border border-border flex flex-col gap-4 p-5 rounded-xl drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.06)] w-full">
        <div className={`${iconBgColor} flex items-center justify-center rounded-lg size-12 shrink-0`}>
          {icon}
        </div>
        <div className="flex flex-col gap-1 mt-1">
          <div className="text-muted-foreground text-xs font-bold tracking-wide uppercase">
            {labelTop} {labelBottom && ` ${labelBottom}`}
          </div>
          <div className="text-foreground text-3xl font-bold">
            {value}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border flex gap-4 h-28 items-center p-6 rounded-lg drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.06)] w-full">
      <div className={`${iconBgColor} flex items-center justify-center rounded-xl size-12 shrink-0`}>
        {icon}
      </div>
      <div className="flex flex-col items-start justify-center">
        <div className="text-muted-foreground text-xs font-bold tracking-normal uppercase leading-4">
          <p className="mb-0">{labelTop}</p>
          {labelBottom && <p>{labelBottom}</p>}
        </div>
        <div className="text-foreground text-2xl font-bold leading-8 mt-1">
          {value}
        </div>
      </div>
    </div>
  );
}
