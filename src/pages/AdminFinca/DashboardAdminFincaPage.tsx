import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useFincasQuery, useFincaQuery } from '../../hooks/useFincas';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, Plant01Icon } from '@hugeicons/core-free-icons';

export default function DashboardAdminFincaPage() {
  const navigate = useNavigate();
  const { data: fincasRes } = useFincasQuery(1, 10);
  const fincas = fincasRes?.fincas || [];
  
  const [selectedFincaId, setSelectedFincaId] = useState<number | null>(null);

  useEffect(() => {
    if (fincas.length > 0 && !selectedFincaId) {
      setSelectedFincaId(fincas[0].id_finca);
    }
  }, [fincas, selectedFincaId]);
  
  const { data: finca, isLoading } = useFincaQuery(selectedFincaId || 0);
  const parcelas = finca?.parcelas ?? [];

  const [selectedParcelaId, setSelectedParcelaId] = useState<number | null>(null);

  useEffect(() => {
    if (parcelas.length > 0) {
      if (!selectedParcelaId || !parcelas.find(p => p.id_parcela === selectedParcelaId)) {
        setSelectedParcelaId(parcelas[0].id_parcela);
      }
    } else {
      setSelectedParcelaId(null);
    }
  }, [parcelas]);

  const selectedParcela = parcelas.find(p => p.id_parcela === selectedParcelaId) || null;
  const cultivoSeleccionado = selectedParcela?.cultivos_asignados?.[0];

  return (
    <div className="w-full max-w-screen-xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Fincas</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Explorá tus tierras de forma interactiva. Elegí una finca y tocá una parcela en el modelo para desplegar sus métricas y estado actual.
          </p>
        </div>
        
        <div className="w-full md:w-64 shrink-0">
          <Select 
            value={selectedFincaId?.toString() || ""} 
            onValueChange={(val) => setSelectedFincaId(Number(val))}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Seleccionar finca" />
            </SelectTrigger>
            <SelectContent>
              {fincas.map(f => (
                <SelectItem key={f.id_finca} value={f.id_finca.toString()}>{f.nombre_finca}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Croquis de Parcelas */}
          <Card className="min-h-[350px] bg-card border-border shadow-sm p-6 flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex justify-center items-center text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
                Cargando finca...
              </div>
            ) : parcelas.length === 0 ? (
              <div className="flex-1 flex justify-center items-center text-muted-foreground">
                No hay parcelas configuradas en esta finca.
              </div>
            ) : (
              <div className="flex flex-wrap gap-4 h-full content-start">
                {parcelas.map(p => {
                  const isSelected = p.id_parcela === selectedParcelaId;
                  const cultivo = p.cultivos_asignados?.[0]?.nombre_cultivo_base || 'Sin cultivo';
                  return (
                    <div 
                      key={p.id_parcela}
                      onClick={() => setSelectedParcelaId(p.id_parcela)}
                      className={`flex flex-col items-center justify-center cursor-pointer transition-all rounded-xl p-6 min-h-[140px] flex-grow ${isSelected ? 'bg-primary ring-2 ring-primary ring-offset-2 scale-[1.02] shadow-md' : 'bg-primary/90 hover:bg-primary opacity-95 hover:opacity-100'} text-primary-foreground`}
                    >
                      <span className="text-sm opacity-90 mb-1 flex items-center gap-1.5">
                        <HugeiconsIcon icon={Plant01Icon} className="size-4" />
                        {p.nombre_parcela}
                      </span>
                      <span className="text-xl font-bold text-center tracking-wide">
                        Cultivo: {cultivo}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Cuaderno de notas (Placeholder visual) */}
          <Card className="bg-card border-dashed border-border shadow-none">
            <CardContent className="p-6 flex flex-col items-center justify-center text-muted-foreground min-h-[100px]">
              <span className="font-mono text-sm">// TODO: Cuaderno de notas</span>
            </CardContent>
          </Card>

          {/* Resumen de Costos (Placeholder visual) */}
          <div className="pt-2">
            <h2 className="text-xl font-bold text-foreground mb-4">Resumen de Costos</h2>
            <Card className="bg-card border-dashed border-border shadow-none">
              <CardContent className="p-6 flex flex-col items-center justify-center text-muted-foreground min-h-[140px]">
                <span className="font-mono text-sm">// TODO: EP-08 / HU-GC-05 Costos de producción</span>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Clima (Placeholder visual) */}
          <Card className="bg-card border-dashed border-border shadow-none">
            <CardContent className="p-6 flex flex-col items-center justify-center text-muted-foreground min-h-[100px]">
              <span className="font-mono text-sm text-center">// TODO: EP-07 / HU-IoT-03 Clima real</span>
            </CardContent>
          </Card>

          {/* Detalle Parcela Activa */}
          <Card className="bg-card border-border shadow-sm flex flex-col flex-1">
            <CardHeader className="pb-4">
              {selectedParcela ? (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-xl font-bold break-words">{selectedParcela.nombre_parcela}</CardTitle>
                    <CardDescription className="text-xs mt-1">Detalles en tiempo real de la parcela seleccionada</CardDescription>
                  </div>
                  <Badge className="bg-primary hover:bg-primary text-primary-foreground pointer-events-none shrink-0">
                    Activa
                  </Badge>
                </div>
              ) : (
                <CardTitle className="text-xl font-bold text-muted-foreground">Ninguna parcela seleccionada</CardTitle>
              )}
            </CardHeader>

            {selectedParcela && (
              <CardContent className="flex flex-col gap-6 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground flex items-center">
                      Cultivo
                    </span>
                    <span className="text-sm font-semibold truncate">{cultivoSeleccionado?.nombre_cultivo_base || '-'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground flex items-center">
                      Superficie
                    </span>
                    <span className="text-sm font-semibold">{selectedParcela.superficie_parcela} ha</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground flex items-center">
                      Transplante
                    </span>
                    <span className="text-sm font-semibold">-</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground flex items-center">
                      Est. Cosecha
                    </span>
                    <span className="text-sm font-semibold">-</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-auto">
                  <div className="bg-primary/5 border border-primary/20 border-dashed rounded-lg p-4 flex items-center justify-center min-h-[70px]">
                    <span className="font-mono text-xs text-primary/80 text-center">// TODO: EP-07 / HU-NA-03 Recomendación IA</span>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/20 border-dashed rounded-lg p-4 flex items-center justify-center min-h-[70px]">
                    <span className="font-mono text-xs text-amber-600/80 text-center">// TODO: EP-07 / HU-NA-01 Alertas automáticas</span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-2 bg-muted hover:bg-muted/80 text-foreground font-semibold"
                  onClick={() => navigate(`/admin-finca/parcelas/${selectedParcela.id_parcela}`)}
                >
                  Ver detalle parcela
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 ml-2" />
                </Button>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button 
          variant="outline"
          onClick={() => navigate('/digitalizar-finca')}
          className="text-primary border-primary/20 hover:bg-primary/5 font-semibold px-6 rounded-xl"
        >
          Solicitá la digitalización de finca
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
