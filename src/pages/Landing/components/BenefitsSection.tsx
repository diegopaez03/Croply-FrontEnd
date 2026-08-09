import { HugeiconsIcon } from '@hugeicons/react';
import { DashboardSquare01Icon, Analytics01Icon, File02Icon } from '@hugeicons/core-free-icons';
import { Card, CardContent } from '../../../components/ui/card';

export default function BenefitsSection() {
  const benefits = [
    {
      title: 'Gestión Inteligente',
      description: 'Visualización georreferenciada de lotes y parcelas. Organizá tus tareas diarias con mapas dinámicos y análisis de productividad sectorizado.',
      icon: DashboardSquare01Icon,
    },
    {
      title: 'Monitoreo IoT',
      description: 'Sensores de suelo y clima en tiempo real. Recibí alertas críticas sobre humedad, temperatura y estados fenológicos directamente en tu móvil.',
      icon: Analytics01Icon,
    },
    {
      title: 'Trazabilidad Total',
      description: 'Cuaderno de campo digital automatizado. Registro histórico de aplicaciones, riego y labores para certificaciones de calidad global.',
      icon: File02Icon,
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12 md:mb-16 text-center">
          <h2 className="text-2xl md:text-4xl font-semibold text-primary tracking-tight ">
            Tecnología al servicio de la tierra
          </h2>
          <div className="w-20 h-1 bg-primary mt-4 rounded-full mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-border shadow-sm hover:shadow-md transition-shadow bg-card h-full">
              <CardContent className="p-8 flex flex-col gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <HugeiconsIcon icon={benefit.icon} className="w-8 h-8" />
                </div>
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-lg md:text-xl font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
