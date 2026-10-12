import { HugeiconsIcon } from '@hugeicons/react';
import { UserGroupIcon, HotspotIcon, MapsIcon } from '@hugeicons/core-free-icons';
import { CardMetrica } from '@/components/shared/CardMetrica';
import { useDashboardAdminCroplyQuery } from '@/hooks/useDashboardAdminCroply';
import { BarChart, Bar, XAxis, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export default function DashboardAdminCroplyPage() {
  const { data, isLoading } = useDashboardAdminCroplyQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-10">
        <div className="flex flex-col gap-1 mt-2">
          <h1 className="text-4xl leading-10 font-bold text-foreground font-sans">
            Tablero Global
          </h1>
          <p className="text-base leading-6 text-muted-foreground font-sans">
            Estado general de la plataforma Croply y métricas clave de operación.
          </p>
        </div>
        <div className="flex-1 bg-card rounded-xl border border-border flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Cargando tablero...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-10">
      {/* Header */}
      <div className="flex flex-col gap-1 mt-2">
        <h1 className="text-4xl leading-10 font-bold text-foreground font-sans">
          Tablero Global
        </h1>
        <p className="text-base leading-6 text-muted-foreground font-sans">
          Estado general de la plataforma Croply y métricas clave de operación.
        </p>
      </div>

      {/* Métricas clave superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
        <CardMetrica
          orientation="vertical"
          icon={<HugeiconsIcon icon={UserGroupIcon} className="text-primary size-6" strokeWidth={1.5} />}
          iconBgColor="bg-primary/10"
          labelTop="TOTAL CLIENTES"
          value={
            <div className="flex flex-col">
              <span>{data?.clientes.total.toLocaleString('es-AR') ?? '—'}</span>
              <span className="text-xs font-normal text-muted-foreground mt-1 tracking-normal font-sans">
                +{data?.clientes.nuevos_este_mes ?? 0} este mes
              </span>
            </div>
          }
        />

        <CardMetrica
          orientation="vertical"
          icon={<HugeiconsIcon icon={HotspotIcon} className="text-primary size-6" strokeWidth={1.5} />}
          iconBgColor="bg-primary/10"
          labelTop="SENSORES IOT ACTIVOS"
          value={
            <div className="flex flex-col">
              <span>{data?.sensores.activos.toLocaleString('es-AR') ?? '—'}</span>
              <span className="text-xs font-normal text-muted-foreground mt-1 tracking-normal font-sans">
                {data?.sensores.porcentaje_parque_total ?? 0}% del parque total
              </span>
            </div>
          }
        />

        <CardMetrica
          orientation="vertical"
          icon={<HugeiconsIcon icon={MapsIcon} className="text-primary size-6" strokeWidth={1.5} />}
          iconBgColor="bg-primary/10"
          labelTop="HECTÁREAS GESTIONADAS"
          value={
            <div className="flex flex-col">
              <span>{data?.hectareas.total.toLocaleString('es-AR') ?? '—'}</span>
              <span className="text-xs font-normal text-muted-foreground mt-1 tracking-normal font-sans">
                En {data?.hectareas.provincias ?? 0} provincias
              </span>
            </div>
          }
        />
      </div>

      {/* Gráficos inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Card Izquierda: Registros de Nuevas Fincas */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground font-sans">
              Registros de Nuevas Fincas
            </h3>
            <p className="text-sm text-muted-foreground font-sans mt-0.5">
              Crecimiento de infraestructura en los últimos 6 meses
            </p>
          </div>

          <div className="w-full flex-1 min-h-[280px]">
            <ChartContainer
              config={{
                nuevas_fincas: {
                  label: 'Total de fincas',
                  color: 'hsl(var(--chart-1))',
                },
              }}
              className="w-full h-[280px]"
            >
              <BarChart
                data={data?.evolucion_fincas ?? []}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <XAxis
                  dataKey="mes"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => (
                        <span className="font-medium text-foreground">
                          Total de fincas: {value} fincas
                        </span>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="nuevas_fincas"
                  fill="hsl(var(--chart-1))"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        {/* Card Derecha: Estado de Sensores */}
        <div className="lg:col-span-1 bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-foreground font-sans">
              Estado de Sensores
            </h3>
            <p className="text-sm text-muted-foreground font-sans mt-0.5">
              Disponibilidad en tiempo real
            </p>
          </div>

          {/* Gráfico circular */}
          <div className="relative flex items-center justify-center my-auto min-h-[200px]">
            <ChartContainer
              config={{
                activos: {
                  label: 'Activos',
                  color: 'hsl(var(--chart-1))',
                },
              }}
              className="w-full h-[200px] flex items-center justify-center"
            >
              <RadialBarChart
                data={[{ name: 'Activos', value: data?.sensores.porcentaje_parque_total ?? 94, fill: 'hsl(var(--chart-1))' }]}
                startAngle={90}
                endAngle={-270}
                innerRadius="75%"
                outerRadius="95%"
                barSize={16}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  dataKey="value"
                  background={{ fill: 'hsl(var(--muted))' }}
                  cornerRadius={10}
                />
              </RadialBarChart>
            </ChartContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-bold text-foreground font-sans">
                {data?.sensores.porcentaje_parque_total ?? 94}%
              </span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-sans mt-0.5">
                ACTIVOS
              </span>
            </div>
          </div>

          {/* Estadísticas de sensores al pie */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-muted/50 rounded-xl p-3 text-center border border-border/50">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="size-2 rounded-full bg-primary inline-block shrink-0" />
                <span className="text-sm font-bold text-foreground font-sans">
                  {data?.sensores.total_activos.toLocaleString('es-AR') ?? '—'}
                </span>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-sans">
                ACTIVOS
              </span>
            </div>

            <div className="bg-muted/50 rounded-xl p-3 text-center border border-border/50">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="size-2 rounded-full bg-destructive inline-block shrink-0" />
                <span className="text-sm font-bold text-foreground font-sans">
                  {data?.sensores.total_inactivos.toLocaleString('es-AR') ?? '—'}
                </span>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-sans">
                INACTIVOS
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
