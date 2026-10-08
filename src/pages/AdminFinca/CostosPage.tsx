import { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon, Download04Icon, Coins01Icon, Edit01Icon, Delete01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { useFincaActiva } from '@/contexts/FincaActivaContext';
import { useAuth } from '@/context/AuthContext';
import { PERMISO_FINCA } from '@/constants/permisos';
import { RegistrarGastoModal } from './components/RegistrarGastoModal';
import { EditarGastoModal } from './components/EditarGastoModal';
import { EliminarGastoModal } from './components/EliminarGastoModal';
import { ExportarCostosModal } from './components/ExportarCostosModal';
import { GastoProduccion } from '@/types/costos.types';
import { useGastosQuery, useEvolucionMensualQuery } from '@/hooks/useCostos';
import { TablaConPaginacion } from '@/components/shared/TablaConPaginacion';
import { BarChart, Bar, XAxis, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export default function CostosPage() {
  const { fincaActivaId, fincas } = useFincaActiva();
  const fincaActiva = fincas.find(f => f.id_finca === fincaActivaId);
  const { tienePermiso } = useAuth();
  const puedeExportar = tienePermiso(PERMISO_FINCA.REPORTES);
  
  // Modals
  const [isRegistrarOpen, setIsRegistrarOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [isEliminarOpen, setIsEliminarOpen] = useState(false);
  const [isExportarOpen, setIsExportarOpen] = useState(false);
  const [selectedGasto, setSelectedGasto] = useState<GastoProduccion | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  
  const hasDateFilters = !!(fechaDesde || fechaHasta);

  // Query
  const { data, isLoading, isFetching } = useGastosQuery(fincaActivaId, {
    page,
    pageSize: 10,
    fecha_desde: fechaDesde || undefined,
    fecha_hasta: fechaHasta || undefined,
  });

  const chartFechas = useMemo(() => {
    if (fechaDesde || fechaHasta) {
      return { fecha_desde: fechaDesde || undefined, fecha_hasta: fechaHasta || undefined };
    }
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return {
      fecha_desde: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-01`,
      fecha_hasta: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())}`,
    };
  }, [fechaDesde, fechaHasta]);

  const { data: evolucionData, isLoading: isEvolucionLoading } = useEvolucionMensualQuery(fincaActivaId, chartFechas);

  const pageSize = 10;
  const rawGastos = data?.gastos || [];
  const totalItems = data?.total ?? rawGastos.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const gastos = rawGastos.length > pageSize
    ? rawGastos.slice((page - 1) * pageSize, page * pageSize)
    : rawGastos;
  const montoTotalPeriodo = data?.monto_total_periodo || 0;
  const etiquetaPeriodo = data?.etiqueta_periodo || 'mes_actual';

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleEdit = (gasto: GastoProduccion) => {
    setSelectedGasto(gasto);
    setIsEditarOpen(true);
  };

  const handleDelete = (gasto: GastoProduccion) => {
    setSelectedGasto(gasto);
    setIsEliminarOpen(true);
  };

  const columns = [
    {
      key: 'fecha_gp',
      label: 'Fecha de Compra',
      render: (item: GastoProduccion) => {
        const [y, m, d] = item.fecha_gp.split('-');
        const date = new Date(Number(y), Number(m) - 1, Number(d));
        return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    },
    { 
      key: 'nombre_insumo_gp',
      label: 'Insumo', 
      render: (item: GastoProduccion) => item.nombre_insumo_gp 
    },
    {
      key: 'monto_gp',
      label: 'Precio',
      render: (item: GastoProduccion) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.monto_gp);
      }
    },
    { 
      key: 'nombre_responsable',
      label: 'Responsable', 
      render: (item: GastoProduccion) => item.nombre_responsable 
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (item: GastoProduccion) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="h-8 w-8 text-primary hover:text-primary">
            <HugeiconsIcon icon={Edit01Icon} size={18} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(item)} className="h-8 w-8 text-destructive hover:text-destructive">
            <HugeiconsIcon icon={Delete01Icon} size={18} />
          </Button>
        </div>
      )
    }
  ];

    const handleClearFilters = () => {
      setFechaDesde('');
      setFechaHasta('');
      setPage(1);
    };

    return (
      <div className="w-full flex flex-col min-h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Gestión de Costos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestión de los costos asociados a una finca
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {puedeExportar && (
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-10 w-full sm:w-auto"
              disabled={!fincaActivaId}
              onClick={() => setIsExportarOpen(true)}
            >
              <HugeiconsIcon icon={Download04Icon} size={16} />
              <span>Exportar</span>
            </Button>
          )}
  
          <Button 
            variant="default" 
            onClick={() => setIsRegistrarOpen(true)}
              className="flex items-center gap-2 h-10 w-full sm:w-auto"
              disabled={!fincaActivaId}
            >
              <HugeiconsIcon icon={PlusSignIcon} size={16} />
              <span>Registrar Gasto</span>
            </Button>
          </div>
        </div>
  
        <div className="flex-1 w-full flex flex-col gap-6">
          {fincaActivaId ? (
            <>
              {/* Filtros */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 bg-card p-4 rounded-xl border border-border">
                {/* Indicador de finca activa - Visualmente como un Select disabled pero solo informativo */}
                <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground opacity-70">
                  <span>{fincaActiva?.nombre_finca || 'Cargando finca...'}</span>
                </div>
  
                <DatePicker
                  value={fechaDesde}
                  max={fechaHasta || undefined}
                  placeholder="Fecha Desde"
                  onChange={(value) => {
                    setFechaDesde(value);
                    if (value && fechaHasta && value > fechaHasta) {
                      setFechaHasta('');
                    }
                    setPage(1);
                  }}
                />
  
                <DatePicker
                  value={fechaHasta}
                  min={fechaDesde || undefined}
                  placeholder="Fecha Hasta"
                  onChange={(value) => {
                    setFechaHasta(value);
                    setPage(1);
                  }}
                />

                {hasDateFilters && (
                  <Button 
                    variant="outline" 
                    onClick={handleClearFilters}
                    className="w-full text-primary border-primary/20 hover:bg-primary/5"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>

            {/* Tabla / Empty State */}
            {isLoading ? (
              <div className="flex-1 bg-card rounded-xl border border-border flex flex-col items-center justify-center p-12 min-h-[400px]">
                <p className="text-muted-foreground">Cargando gastos...</p>
              </div>
            ) : gastos.length === 0 ? (
              <div className="flex-1 bg-card rounded-xl border border-border flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4 text-primary">
                  <HugeiconsIcon icon={Coins01Icon} size={32} />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Historial de Costos</h2>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  {hasDateFilters 
                    ? "No hay gastos registrados en el período seleccionado."
                    : "Aún no hay gastos registrados. Hacé clic en 'Registrar Gasto' para comenzar."}
                </p>
              </div>
            ) : (
              <div className="flex-1 min-h-[400px]">
                <TablaConPaginacion
                  data={gastos}
                  columns={columns}
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  isLoading={isFetching}
                  totalItems={totalItems}
                  pageSize={pageSize}
                />
              </div>
            )}

            {/* Cards inferiores (Dashboard) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Card */}
              <div className="bg-primary/10 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">
                  {etiquetaPeriodo === 'mes_actual' ? "Total gastado este mes" : "Total gastado en el período"}
                </p>
                <p className="text-4xl font-bold text-foreground">
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(montoTotalPeriodo)}
                </p>
              </div>

              {/* Chart Card */}
              <div className="md:col-span-2 bg-card rounded-xl border border-border p-6 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Evolución de gastos</h3>
                  <p className="text-sm text-muted-foreground">
                    Historial del costo directo de producción mensual.
                  </p>
                </div>
                <div className="flex-1 min-h-[250px] mt-4">
                  {isEvolucionLoading ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Cargando gráfico...
                    </div>
                  ) : !evolucionData || evolucionData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                       <p className="text-muted-foreground">No hay datos suficientes para mostrar la evolución de gastos.</p>
                    </div>
                  ) : (
                    <ChartContainer
                      config={{
                        monto: {
                          label: 'Monto',
                          color: 'hsl(var(--primary))'
                        }
                      }}
                      className="w-full h-[250px]"
                    >
                      <BarChart data={evolucionData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <XAxis 
                          dataKey="mes" 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(value) => {
                             const [y, m] = value.split('-');
                             const date = new Date(Number(y), Number(m) - 1, 1);
                             return date.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
                          }}
                        />
                        <ChartTooltip 
                           content={
                             <ChartTooltipContent
                               formatter={(value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(value))}
                               labelFormatter={(label) => {
                                 const [y, m] = label.split('-');
                                 const date = new Date(Number(y), Number(m) - 1, 1);
                                 return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
                               }}
                             />
                           }
                        />
                        <Bar 
                          dataKey="monto" 
                          radius={[4, 4, 0, 0]} 
                        >
                          {evolucionData.map((entry, index) => {
                            let isInRange = true;
                            if (fechaDesde || fechaHasta) {
                               const [y, m] = entry.mes.split('-');
                               const currentMes = `${y}-${m}`;
                               
                               const desdeMes = fechaDesde ? fechaDesde.substring(0, 7) : null;
                               const hastaMes = fechaHasta ? fechaHasta.substring(0, 7) : null;

                               if (desdeMes && currentMes < desdeMes) isInRange = false;
                               if (hastaMes && currentMes > hastaMes) isInRange = false;
                            }
                            
                            return (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={isInRange ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.3)'} 
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">No tenés fincas disponibles.</p>
          </div>
        )}
      </div>

      <RegistrarGastoModal 
        open={isRegistrarOpen} 
        onOpenChange={setIsRegistrarOpen} 
      />

      <EditarGastoModal 
        open={isEditarOpen} 
        onOpenChange={(val) => {
          setIsEditarOpen(val);
          if (!val) setTimeout(() => setSelectedGasto(null), 300);
        }}
        gasto={selectedGasto}
      />

      <EliminarGastoModal 
        open={isEliminarOpen}
        onOpenChange={(val) => {
          setIsEliminarOpen(val);
          if (!val) setTimeout(() => setSelectedGasto(null), 300);
        }}
        gasto={selectedGasto}
      />

      <ExportarCostosModal
        open={isExportarOpen}
        onOpenChange={setIsExportarOpen}
      />
    </div>
  );
}
