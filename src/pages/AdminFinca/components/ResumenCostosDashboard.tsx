import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, SquareArrowOutUpRight } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useEvolucionMensualQuery, useGastosQuery } from '@/hooks/useCostos';

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function isoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatPesos(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\s/g, '');
}

function formatFechaCorta(fecha: string) {
  const [year, month, day] = fecha.slice(0, 10).split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const label = date
    .toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    .replace('.', '');
  const [dia, mes = ''] = label.split(' ');
  return `${dia} ${mes.charAt(0).toUpperCase()}${mes.slice(1)}`;
}

interface ResumenCostosDashboardProps {
  idFinca: number | null;
}

export function ResumenCostosDashboard({ idFinca }: ResumenCostosDashboardProps) {
  const navigate = useNavigate();
  const now = new Date();
  const mesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const finMesActual = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const { data, isLoading } = useGastosQuery(idFinca, { page: 1, pageSize: 2 });
  const { data: evolucion } = useEvolucionMensualQuery(idFinca, {
    fecha_desde: isoDate(mesAnterior),
    fecha_hasta: isoDate(finMesActual),
  });

  const compras = data?.gastos ?? [];
  const totalMes = data?.monto_total_periodo ?? 0;
  const montoActual = evolucion?.find((item) => item.mes === monthKey(now))?.monto ?? 0;
  const montoAnterior = evolucion?.find((item) => item.mes === monthKey(mesAnterior))?.monto ?? 0;
  const variacion =
    montoAnterior > 0 ? Math.round(((montoActual - montoAnterior) / montoAnterior) * 100) : null;

  return (
    <section className="pt-2">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">Resumen de Costos</h2>
        <Link
          to={ROUTES.FINCA.COSTOS}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Ir a sección de Costos
          <SquareArrowOutUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <ShoppingCart className="size-4" />
            Últimas compras
          </div>
          {isLoading ? (
            <p className="py-6 text-sm text-muted-foreground">Cargando compras...</p>
          ) : compras.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">Todavía no hay compras registradas.</p>
          ) : (
            <ul className="divide-y divide-border">
              {compras.map((gasto) => (
                <li key={gasto.id_gasto_produccion} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{gasto.nombre_insumo_gp}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatFechaCorta(gasto.fecha_gp)}
                      {gasto.nombre_responsable ? ` · ${gasto.nombre_responsable}` : ''}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-foreground">{formatPesos(gasto.monto_gp)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl bg-accent px-6 py-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Total del mes</p>
            <p className="mt-2 text-4xl font-bold text-foreground">{formatPesos(totalMes)}</p>
            {variacion !== null && (
              <span className="mt-3 inline-flex rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground">
                {variacion > 0 ? '+' : ''}
                {variacion}% vs mes anterior
              </span>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/digitalizar-finca')}
            className="rounded-xl border-primary/20 px-6 font-semibold text-primary hover:bg-primary/5"
          >
            Solicitá la digitalización de finca
            <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
