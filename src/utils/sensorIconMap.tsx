import { HugeiconsIcon } from '@hugeicons/react';
import {
  SoilTemperatureFieldIcon,
  Sun01Icon,
  CloudMidRainIcon,
  FlaskConicalIcon,
  DashboardSpeed01Icon,
  HumidityIcon
} from '@hugeicons/core-free-icons';

export function mapNombreSensorAIcono(nombre: string) {
  const nombreLower = nombre.toLowerCase();

  if (nombreLower.includes('temp') || nombreLower.includes('ambiente')) {
    return <HugeiconsIcon icon={SoilTemperatureFieldIcon} className="size-5" />;
  }
  if (nombreLower.includes('radiaci') || nombreLower.includes('solar')) {
    return <HugeiconsIcon icon={Sun01Icon} className="size-5" />;
  }
  if (nombreLower.includes('pluvi') || nombreLower.includes('precipitaci')) {
    return <HugeiconsIcon icon={CloudMidRainIcon} className="size-5" />;
  }
  if (nombreLower.includes('ph')) {
    return <HugeiconsIcon icon={FlaskConicalIcon} className="size-5" />;
  }
  if (nombreLower.includes('humedad') && nombreLower.includes('suelo')) {
    return <HugeiconsIcon icon={HumidityIcon} className="size-5" />; // Usamos WaterEnergy o fallback
  }

  // Fallback
  return <HugeiconsIcon icon={DashboardSpeed01Icon} className="size-5" />;
}
