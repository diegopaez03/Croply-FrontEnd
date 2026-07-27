import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, ArtificialIntelligence08Icon, TractorIcon } from '@hugeicons/core-free-icons';
import { Card, CardContent } from '../../../components/ui/card';

export default function AIRecommendationSection() {
  const items = [
    'Alertas y Recomendaciones Agrícolas',
    'Registro de aplicaciones de agroquímicos',
    'Control de Costos Directos',
  ];

  const stats = [
    { value: '98%', label: 'Precisión en datos climáticos' },
    { value: '30%', label: 'Ahorro en costos operativos' },
    { value: '100%', label: 'Trazabilidad en la aplicación de agroquímicos' },
    { value: '24/7', label: 'Soporte y Monitoreo' },
  ];

  return (
    <section className="w-full py-24 bg-background">
      <div className="mx-auto px-6 md:px-8">
        <div className="bg-primary/5 border border-primary/10 rounded-[20px] p-8 md:p-12 relative overflow-hidden flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Background Tractor Icon */}
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
            <HugeiconsIcon icon={TractorIcon} className="w-32 h-32" />
          </div>

          {/* Left Content */}
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <HugeiconsIcon icon={ArtificialIntelligence08Icon} className="w-4 h-4" />
            Potenciado por Inteligencia Artificial
          </div>
          
          <h2 className="text-3xl md:text-4xl font-semibold text-primary tracking-tight leading-tight">
            Anticipá problemas antes de que ocurran.
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            Nuestra plataforma integra lecturas de sensores IoT y servicios climáticos en tiempo real para generar recomendaciones y alertas personalizadas. Tomá decisiones respaldadas por datos objetivos para eficientizar tus ciclos de riego y proteger la salud de tu cultivo.
          </p>

          <ul className="space-y-4 pt-4">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 text-muted-foreground font-medium">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-6 h-6 text-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Stats Grid */}
        <div className="flex-1 w-full grid grid-cols-2 gap-4 md:gap-6">
          {stats.map((stat, idx) => (
            <Card key={idx} className={`border-border bg-card shadow-sm hover:shadow-md transition-all ${idx % 2 !== 0 ? 'mt-8 md:mt-12' : ''}`}>
              <CardContent className="p-6 md:p-8 flex flex-col justify-center h-full gap-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium leading-snug">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        </div>
      </div>
    </section>
  );
}
