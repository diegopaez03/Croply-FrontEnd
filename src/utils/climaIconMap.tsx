import { HugeiconsIcon } from '@hugeicons/react';
import {
  Sun01Icon,
  SunCloud01Icon,
  CloudIcon,
  CloudFogIcon,
  CloudRainIcon,
  CloudSnowIcon,
  CloudAngledRainIcon,
  CloudLightningIcon,
  ThermometerColdIcon,
  CloudHailstoneIcon,
  ThermometerWarmIcon
} from '@hugeicons/core-free-icons';
import { CondicionClimatica } from '@/types/clima.types';

export function getClimaIcon(condicion: CondicionClimatica, className?: string) {
  const classes = className || "size-8";
  
  switch (condicion) {
    case 'Despejado':
      return <HugeiconsIcon icon={Sun01Icon} className={`${classes} text-amber-500`} />;
    case 'Parcialmente nublado':
      return <HugeiconsIcon icon={SunCloud01Icon} className={`${classes} text-amber-400`} />;
    case 'Nublado':
      return <HugeiconsIcon icon={CloudIcon} className={`${classes} text-slate-400`} />;
    case 'Niebla':
      return <HugeiconsIcon icon={CloudFogIcon} className={`${classes} text-slate-400`} />;
    case 'Lluvia':
      return <HugeiconsIcon icon={CloudRainIcon} className={`${classes} text-blue-400`} />;
    case 'Nieve':
      return <HugeiconsIcon icon={CloudSnowIcon} className={`${classes} text-sky-300`} />;
    case 'Tormenta':
      return <HugeiconsIcon icon={CloudAngledRainIcon} className={`${classes} text-indigo-500`} />;
    case 'Tormenta eléctrica':
      return <HugeiconsIcon icon={CloudLightningIcon} className={`${classes} text-purple-500`} />;
    case 'Helada':
      return <HugeiconsIcon icon={ThermometerColdIcon} className={`${classes} text-sky-400`} />;
    case 'Granizo':
      return <HugeiconsIcon icon={CloudHailstoneIcon} className={`${classes} text-slate-500`} />;
    case 'Temperatura elevada':
      return <HugeiconsIcon icon={ThermometerWarmIcon} className={`${classes} text-red-500`} />;
    default:
      return <HugeiconsIcon icon={Sun01Icon} className={`${classes} text-muted-foreground`} />;
  }
}
