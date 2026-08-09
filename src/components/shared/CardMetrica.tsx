import React from 'react';

export interface CardMetricaProps {
  icon: React.ReactNode;
  labelTop: string;
  labelBottom?: string;
  value: string | number;
  iconBgColor?: string;
}

export function CardMetrica({
  icon,
  labelTop,
  labelBottom,
  value,
  iconBgColor = 'bg-primary/10'
}: CardMetricaProps) {
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
