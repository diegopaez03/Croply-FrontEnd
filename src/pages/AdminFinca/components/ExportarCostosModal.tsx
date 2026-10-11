import { useState, useRef, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFincaActiva } from '@/contexts/FincaActivaContext';
import { useGastosQuery, useEvolucionMensualQuery, useExportarGastosMutation } from '@/hooks/useCostos';
import { BarChart, Bar, XAxis, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ExportarCostosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportarCostosModal({ open, onOpenChange }: ExportarCostosModalProps) {
  const { fincaActivaId, fincas } = useFincaActiva();
  const fincaActiva = fincas.find(f => f.id_finca === fincaActivaId);

  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  
  useEffect(() => {
    if (open) {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const start = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
      const end = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())}`;
      setFechaDesde(start);
      setFechaHasta(end);
      setGlobalError(null);
    }
  }, [open]);

  const [globalError, setGlobalError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const exportMutation = useExportarGastosMutation();

  const handleClose = () => {
    if (exportMutation.isPending) return;
    onOpenChange(false);
  };

  const chartFechas = useMemo(() => ({
    fecha_desde: fechaDesde || undefined,
    fecha_hasta: fechaHasta || undefined,
  }), [fechaDesde, fechaHasta]);

  const { data: listadoData, isLoading: isListadoLoading } = useGastosQuery(fincaActivaId, { ...chartFechas, page: 1, pageSize: 5 });
  const { data: evolucionData, isLoading: isEvolucionLoading } = useEvolucionMensualQuery(fincaActivaId, chartFechas);

  const gastos = listadoData?.gastos || [];
  const montoTotalPeriodo = listadoData?.monto_total_periodo || 0;

  const handleExport = async () => {
    if (!fincaActivaId) return;
    setGlobalError(null);

    let dataUri = '';
    if (chartRef.current) {
      const svgElement = chartRef.current.querySelector('svg');
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        dataUri = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = svgElement.clientWidth * 2;
            canvas.height = svgElement.clientHeight * 2;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.scale(2, 2);
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, svgElement.clientWidth, svgElement.clientHeight);
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL('image/png'));
            } else {
              resolve('');
            }
            URL.revokeObjectURL(url);
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve('');
          };
          img.src = url;
        });
      }
    }

    exportMutation.mutate({
      id_finca: fincaActivaId,
      data: {
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
        imagen_grafico: dataUri
      }
    }, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const nombreFinca = fincaActiva?.nombre_finca.replace(/\s+/g, '-').toLowerCase() || 'finca';
        const fechaGen = new Date().toISOString().split('T')[0];
        a.download = `costos_${nombreFinca}_${fechaGen}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        onOpenChange(false);
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message || 'Ocurrió un error inesperado al generar el PDF.';
        setGlobalError(msg);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 border-b border-border bg-muted/50">
          <DialogTitle>Exportar Reporte de Costos</DialogTitle>
          <DialogDescription>
            Configurá los filtros y previsualizá el documento antes de descargarlo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row min-h-[400px]">
          {/* Columna Izquierda: Configuración */}
          <div className="w-full md:w-[35%] p-6 border-r border-border space-y-6 bg-card">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Configuración del Reporte</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Finca</Label>
                  <Select value={fincaActivaId?.toString() || ""} disabled>
                    <SelectTrigger className="w-full bg-background border-input">
                      <SelectValue placeholder="Seleccionar finca" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={fincaActivaId?.toString() || ""}>{fincaActiva?.nombre_finca}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rango de Fechas</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <DatePicker
                      value={fechaDesde}
                      max={fechaHasta || undefined}
                      placeholder="Desde"
                      onChange={setFechaDesde}
                    />
                    <DatePicker
                      value={fechaHasta}
                      min={fechaDesde || undefined}
                      placeholder="Hasta"
                      onChange={setFechaHasta}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Formato de Archivo</Label>
                  <Select value="pdf" disabled>
                    <SelectTrigger className="w-full bg-background border-input">
                      <SelectValue placeholder="PDF" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">Documento PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {globalError && (
                <p className="text-sm text-destructive mt-4">{globalError}</p>
              )}
            </div>
          </div>

          {/* Columna Derecha: Vista Previa */}
          <div className="w-full md:w-[65%] p-6 bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground mb-4">Vista Previa</h3>
            
            <div className="bg-white border border-border shadow-sm rounded-sm p-6 max-h-[400px] overflow-y-auto">
              <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold text-primary tracking-tight">Croply</h2>
                  <p className="text-xs text-muted-foreground mt-1">ID Reporte: #PREVIEW-1234</p>
                  <p className="text-xs text-muted-foreground">Generado: {new Date().toLocaleDateString('es-AR')} {new Date().toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-semibold text-foreground">Historial de Costos</h3>
                  <p className="text-xs text-muted-foreground">{fincaActiva?.nombre_finca}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {fechaDesde || fechaHasta 
                      ? `${fechaDesde ? new Date(fechaDesde + 'T00:00:00').toLocaleDateString('es-AR') : 'Inicio'} al ${fechaHasta ? new Date(fechaHasta + 'T00:00:00').toLocaleDateString('es-AR') : 'Hoy'}`
                      : 'Todo el historial'}
                  </p>
                </div>
              </div>

              {/* Muestra de tabla */}
              <div className="mb-6">
                {isListadoLoading ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Cargando muestra...</p>
                ) : gastos.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No hay gastos para mostrar en este período.</p>
                ) : (
                  <div className="border rounded-sm">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="px-2 py-2 font-medium">Fecha</th>
                          <th className="px-2 py-2 font-medium">Insumo</th>
                          <th className="px-2 py-2 font-medium text-right">Precio</th>
                          <th className="px-2 py-2 font-medium">Responsable</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {gastos.map((g) => {
                          const [y, m, d] = g.fecha_gp.split('-');
                          const formattedDate = new Date(Number(y), Number(m)-1, Number(d)).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
                          return (
                            <tr key={g.id_gasto_produccion}>
                              <td className="px-2 py-1.5">{formattedDate}</td>
                              <td className="px-2 py-1.5">{g.nombre_insumo_gp}</td>
                              <td className="px-2 py-1.5 text-right">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(g.monto_gp)}</td>
                              <td className="px-2 py-1.5">{g.nombre_responsable}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              <div className="mb-6 flex justify-end">
                <div className="bg-primary/10 rounded-sm px-4 py-2 text-right">
                  <p className="text-xs font-medium text-primary uppercase tracking-wide">Total del período</p>
                  <p className="text-lg font-bold text-foreground">
                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(montoTotalPeriodo)}
                  </p>
                </div>
              </div>

              {/* Gráfico */}
              <div className="mt-6" ref={chartRef}>
                <h4 className="text-sm font-semibold mb-2">Evolución de gastos</h4>
                {isEvolucionLoading ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Cargando gráfico...</p>
                ) : !evolucionData || evolucionData.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No hay datos suficientes para mostrar.</p>
                ) : (
                  <ChartContainer
                    config={{ monto: { label: 'Monto', color: 'hsl(var(--primary))' } }}
                    className="w-full h-[150px]"
                  >
                    <BarChart data={evolucionData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <XAxis 
                        dataKey="mes" 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(v) => {
                          const [y, m] = v.split('-');
                          const d = new Date(Number(y), Number(m)-1, 1);
                          return d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }).replace(/^\w/, c => c.toUpperCase());
                        }}
                        style={{ fontSize: '10px' }}
                      />
                      <ChartTooltip 
                        content={
                          <ChartTooltipContent
                            formatter={(value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(value))}
                          />
                        }
                      />
                      <Bar dataKey="monto" radius={[2, 2, 0, 0]}>
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
                          return <Cell key={`cell-${index}`} fill={isInRange ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.3)'} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-border bg-muted/50 sm:justify-end">
          <Button variant="outline" onClick={handleClose} disabled={exportMutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={exportMutation.isPending}>
            {exportMutation.isPending ? 'Descargando...' : 'Descargar PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
