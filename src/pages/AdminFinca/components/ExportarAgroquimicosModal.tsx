import { useState, useEffect, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Download04Icon, InformationCircleIcon } from '@hugeicons/core-free-icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExportarAgroquimicosMutation } from '@/hooks/useAgroquimicos';
import { mockAplicaciones } from '@/services/agroquimicos.service';

interface ExportarAgroquimicosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id_finca: number;
  nombreFinca: string;
  parcelas: any[];
}

export function ExportarAgroquimicosModal({ open, onOpenChange, id_finca, nombreFinca, parcelas }: ExportarAgroquimicosModalProps) {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [idParcela, setIdParcela] = useState('all');
  const [errorMsg, setErrorMsg] = useState('');

  const exportMutation = useExportarAgroquimicosMutation(id_finca, nombreFinca);

  useEffect(() => {
    if (open) {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      setFechaDesde(firstDay.toISOString().split('T')[0]);
      setFechaHasta(lastDay.toISOString().split('T')[0]);
      setIdParcela('all');
      setErrorMsg('');
      exportMutation.reset();
    }
  }, [open]);

  // Validaciones
  const dateError = fechaDesde && fechaHasta && fechaHasta < fechaDesde 
    ? 'La fecha de fin debe ser igual o posterior a la fecha de inicio.' 
    : '';

  // Vista Previa filtrando los mocks localmente
  const vistaPreviaData = useMemo(() => {
    if (!open) return [];
    
    let filtradas = mockAplicaciones;

    if (idParcela !== 'all') {
      filtradas = filtradas.filter(a => a.id_parcela.toString() === idParcela);
    }
    if (fechaDesde) {
      filtradas = filtradas.filter(a => a.fecha_hora_aplicacion_aa.split('T')[0] >= fechaDesde);
    }
    if (fechaHasta) {
      filtradas = filtradas.filter(a => a.fecha_hora_aplicacion_aa.split('T')[0] <= fechaHasta);
    }

    return filtradas;
  }, [open, fechaDesde, fechaHasta, idParcela, mockAplicaciones]);

  const handleDownload = () => {
    if (dateError) {
      setErrorMsg(dateError);
      return;
    }
    setErrorMsg('');

    exportMutation.mutate({
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
      id_parcela: idParcela !== 'all' ? Number(idParcela) : undefined,
    }, {
      onSuccess: () => {
        onOpenChange(false);
      },
      onError: (err: any) => {
        setErrorMsg(err?.response?.data?.message || 'Error al generar el reporte.');
      }
    });
  };

  const formatearRango = () => {
    if (fechaDesde && fechaHasta) return `${fechaDesde.split('-').reverse().join('/')} - ${fechaHasta.split('-').reverse().join('/')}`;
    if (fechaDesde) return `Desde ${fechaDesde.split('-').reverse().join('/')}`;
    if (fechaHasta) return `Hasta ${fechaHasta.split('-').reverse().join('/')}`;
    return 'Todo el historial';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden bg-card border border-border flex flex-col md:flex-row h-[600px] max-h-[95vh]">
        {/* Izquierda: Configuración */}
        <div className="w-full md:w-1/2 p-6 flex flex-col h-full border-r border-border overflow-hidden">
          <DialogHeader className="mb-4 shrink-0">
            <DialogTitle className="text-xl font-semibold text-foreground">Exportar Reporte de Agroquímicos</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">Configurá los filtros para descargar el historial.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Configuración del Reporte</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Rango de Fechas</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                      className="bg-background border-input text-foreground text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 flex flex-col justify-end">
                  <div className="relative">
                    <Input
                      type="date"
                      value={fechaHasta}
                      min={fechaDesde}
                      onChange={(e) => setFechaHasta(e.target.value)}
                      className="bg-background border-input text-foreground text-sm"
                    />
                  </div>
                </div>
              </div>
              {dateError && <p className="text-xs text-red-500">{dateError}</p>}

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Parcela</Label>
                <Select value={idParcela} onValueChange={setIdParcela}>
                  <SelectTrigger className="bg-background border-input text-foreground h-10">
                    <SelectValue placeholder="Todas las parcelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las parcelas</SelectItem>
                    {parcelas.map(p => (
                      <SelectItem key={p.id_parcela} value={p.id_parcela.toString()}>{p.nombre_parcela}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Formato de Archivo</Label>
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/30">
                  <div className="w-10 h-10 rounded-md bg-red-500/10 flex items-center justify-center text-red-500 font-bold">
                    PDF
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Documento PDF</p>
                    <p className="text-xs text-muted-foreground">Optimizado para impresión</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <HugeiconsIcon icon={InformationCircleIcon} className="size-5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                El reporte incluirá el historial de aplicaciones de las parcelas seleccionadas y en el rango seleccionado. Las columnas mostrarán la fecha, producto, dosis y parcela asociada.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                <p className="text-sm text-red-600">{errorMsg}</p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2 pt-4 border-t border-border shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exportMutation.isPending}>
              Cancelar
            </Button>
            <Button 
              className="gap-2" 
              onClick={handleDownload}
              disabled={exportMutation.isPending || !!dateError}
            >
              <HugeiconsIcon icon={Download04Icon} className="size-4" />
              {exportMutation.isPending ? 'Generando...' : 'Descargar PDF'}
            </Button>
          </DialogFooter>
        </div>

        {/* Derecha: Vista Previa */}
        <div className="hidden md:flex md:w-1/2 bg-muted/30 p-6 flex-col items-center justify-start overflow-hidden h-full">
          <div className="w-full flex justify-between items-center mb-4 shrink-0">
            <h3 className="text-sm font-medium flex items-center gap-2 text-primary">
              <HugeiconsIcon icon={InformationCircleIcon} className="size-4" /> Vista Previa
            </h3>
          </div>
          
          {/* Contenedor flexible para centrar la hoja */}
          <div className="flex-1 w-full flex items-center justify-center relative min-h-0 overflow-hidden">
            {/* Hoja A4 Simulada (tamaño fijo, escalada con CSS si la pantalla es chica) */}
            <div 
              className="w-[340px] h-[480px] bg-white rounded shadow-sm border border-border/50 p-5 flex flex-col shrink-0 origin-center"
              style={{ transform: 'scale(min(1, calc(100cqh / 480)))', containerType: 'size' }}
            >
              <div className="flex justify-between items-start mb-6 border-b border-gray-200 pb-3 shrink-0">
                <div>
                  <h1 className="text-lg font-bold text-green-800 leading-tight">Croply</h1>
                  <p className="text-[9px] text-gray-500">Sostenibilidad Agrícola</p>
                </div>
                <div className="text-right text-[9px] text-gray-500 space-y-0.5">
                  <p className="font-semibold text-gray-700">ID Reporte: #{Math.floor(Math.random() * 90000) + 10000}</p>
                  <p>Generado: {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="text-center mb-5 shrink-0">
                <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">Historial de Agroquímicos</h2>
                <p className="text-[9px] text-gray-500">Rango: {formatearRango()}</p>
                <p className="text-[9px] text-gray-500 mt-0.5">
                  Finca: {nombreFinca}
                  {idParcela !== 'all' && ` | Parcela: ${parcelas.find(p => p.id_parcela.toString() === idParcela)?.nombre_parcela}`}
                </p>
              </div>

              <div className="flex-1 overflow-hidden">
                <table className="w-full text-left text-[9px] border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200 text-gray-600 bg-gray-50">
                      <th className="py-1.5 px-1 font-semibold">Fecha</th>
                      <th className="py-1.5 px-1 font-semibold">Producto</th>
                      <th className="py-1.5 px-1 font-semibold">Dosis</th>
                      <th className="py-1.5 px-1 font-semibold text-right">Parcela</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vistaPreviaData.slice(0, 8).map((app, i) => (
                      <tr key={i} className="text-gray-700">
                        <td className="py-1.5 px-1">{app.fecha_hora_aplicacion_aa.split('T')[0].split('-').reverse().join('/')}</td>
                        <td className="py-1.5 px-1 font-medium">{app.nombre_producto_aa}</td>
                        <td className="py-1.5 px-1">{app.dosis_aa}</td>
                        <td className="py-1.5 px-1 text-right">{app.nombre_parcela}</td>
                      </tr>
                    ))}
                    {vistaPreviaData.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-400 italic">
                          No hay aplicaciones registradas en este período.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {vistaPreviaData.length > 8 && (
                <p className="text-[8px] text-gray-400 text-center mt-2 italic shrink-0">
                  ... y {vistaPreviaData.length - 8} filas más.
                </p>
              )}

              <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between text-[7px] text-gray-400 uppercase tracking-widest shrink-0">
                <span>Página 1 de 1</span>
                <span>Sello de Verificación Digital</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
