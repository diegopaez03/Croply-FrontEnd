import { useParams, useNavigate, Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ArrowLeft01Icon, 
  QrCodeIcon, 
  Sun01Icon, 
  DashboardSpeed01Icon, 
  AiBrain01Icon,
  NoteEditIcon,
  PlusSignIcon,
  Plant01Icon
} from '@hugeicons/core-free-icons';
import { Button } from '../../components/ui/button';
import { useParcelaQuery, useFincaQuery, useHistorialCultivosQuery } from '../../hooks/useFincas';
import { CultivoItemCard } from './components/CultivoItemCard';
import { HistorialCultivoCard } from './components/HistorialCultivoCard';
import { useState } from 'react';
import { useGenerarQRParcela, useConsultarQRParcela } from '../../hooks/useFincas';
import { QRModal } from './components/QRModal';

export default function ParcelaDetallePage() {
  const [activeTab, setActiveTab] = useState<'cultivo' | 'historial'>('cultivo');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  const { mutate: generarQR, isPending: isGeneratingQR } = useGenerarQRParcela((res: any) => {
    setQrUrl(res.url_acceso_qr);
    setIsQRModalOpen(true);
  });

  const { mutate: consultarQR, isPending: isConsultingQR } = useConsultarQRParcela((res: any) => {
    setQrUrl(res.url_acceso_qr);
    setIsQRModalOpen(true);
  });

  const handleQRClick = () => {
    if (parcela?.fecha_generacion_qr) {
      consultarQR(parcela.id_parcela);
    } else {
      generarQR(parcela?.id_parcela || 0);
    }
  };

  const { id } = useParams();
  const navigate = useNavigate();
  
  const idParcela = id ? Number(id) : null;
  const { data: parcela, isLoading } = useParcelaQuery(idParcela);
  const fincaId = parcela?.id_finca;
  const { data: fincaDetalle } = useFincaQuery(fincaId || null);
  const { data: historialRes, isLoading: loadingHistorial } = useHistorialCultivosQuery(activeTab === 'historial' ? idParcela : null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-muted-foreground">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary mr-3" />
        Cargando parcela...
      </div>
    );
  }

  if (!parcela) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Parcela no encontrada</h2>
        <Button onClick={() => navigate('/admin-finca/mi-finca')}>Volver a Mi finca</Button>
      </div>
    );
  }

  const cultivosAsignados = parcela.cultivos_asignados || [];
  const hasCultivo = cultivosAsignados.length > 0;
  const ocupada = cultivosAsignados.reduce((acc: number, curr: any) => acc + Number(curr.superficie_asignada || 0), 0);
  const superficieDisponible = parcela.superficie_parcela - ocupada; 
  const canAsociar = superficieDisponible > 0.001;

  return (
    <>
    <div className="w-full max-w-screen-xl mx-auto space-y-6 pb-20">
      
      {/* Header navegación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/admin-finca/mi-finca"
          className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          Volver
        </Link>

        {/* Placeholder QR */}
                <Button 
          variant="outline" 
          onClick={handleQRClick}
          disabled={isGeneratingQR || isConsultingQR}
          className="gap-2 border-border text-foreground rounded-xl font-medium"
        >
          <HugeiconsIcon icon={QrCodeIcon} className="size-4" />
          {isGeneratingQR || isConsultingQR ? 'Cargando...' : (parcela?.fecha_generacion_qr ? 'Ver código QR' : 'Generar código QR')}
        </Button>
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground">{fincaDetalle?.nombre_finca || 'Finca'}</h2>
      </div>

      {/* Grid superior: Info Parcela + Clima Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Parcela Info */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{parcela.nombre_parcela}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Detalles en tiempo real de la parcela seleccionada</p>
            </div>
            <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
              Activa
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Cultivos Activos</p>
              <p className="font-semibold text-foreground mt-0.5">{cultivosAsignados.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Superficie Total</p>
              <p className="font-semibold text-foreground mt-0.5">{parcela.superficie_parcela} ha</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Superficie Ocupada</p>
              <p className="font-semibold text-foreground mt-0.5">{ocupada.toFixed(2)} ha</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Superficie Libre</p>
              <p className="font-semibold text-foreground mt-0.5">{Math.max(0, superficieDisponible).toFixed(2)} ha</p>
            </div>
          </div>
        </div>

        {/* Card Clima Placeholder */}
        <div className="bg-card border border-dashed border-border rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Sun01Icon} className="size-4" />
              Pronóstico del Clima
            </span>
            <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono">// TODO</span>
          </div>
          <div className="text-center py-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">// TODO: HU-IoT-03 / Épica 7</p>
            <p className="text-[11px] text-muted-foreground/70">Conexión con pronóstico meteorológico</p>
          </div>
          <div className="border-t border-border/50 pt-2 text-center text-[10px] text-muted-foreground">
            Pronóstico de 3 días pendiente de integración
          </div>
        </div>
      </div>

      {/* Grid media: Sensores IoT Placeholder + Recomendación IA Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card Sensores IoT Placeholder */}
        <div className="lg:col-span-2 bg-card border border-dashed border-border rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={DashboardSpeed01Icon} className="size-4 text-muted-foreground" />
              <h3 className="font-bold text-sm text-foreground">Sensores IoT</h3>
            </div>
            <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono">// TODO: HU-FP-04 / HU-IoT-02</span>
          </div>
          <div className="py-6 text-center text-muted-foreground space-y-1">
            <p className="text-xs font-medium">// TODO: Telemetría ambiental en tiempo real</p>
            <p className="text-[11px] text-muted-foreground/70">Temperatura, Humedad de suelo, Radiación, Pluviómetro y pH</p>
          </div>
        </div>

        {/* Card Recomendación IA Placeholder */}
        <div className="bg-card border border-dashed border-border rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={AiBrain01Icon} className="size-4 text-muted-foreground" />
              <h4 className="font-bold text-sm text-foreground">Recomendación IA</h4>
            </div>
            <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono">// TODO: HU-NA-03</span>
          </div>
          <div className="py-6 text-center text-muted-foreground space-y-1">
            <p className="text-xs font-medium">// TODO: Recomendaciones contextuales de IA</p>
            <p className="text-[11px] text-muted-foreground/70">Generadas según estado del cultivo y sensores</p>
          </div>
        </div>
      </div>

      {/* Banner de Observaciones Placeholder */}
      <div className="bg-card border border-dashed border-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
            <HugeiconsIcon icon={NoteEditIcon} className="size-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-foreground">Cuaderno de Notas de Campo</h4>
            <p className="text-[11px] text-muted-foreground">// TODO: HU-TC-07 Captura y seguimiento de notas de campo</p>
          </div>
        </div>
        <Button size="sm" variant="outline" disabled className="text-xs h-8 rounded-xl cursor-not-allowed">
          Capturar Nota (// TODO)
        </Button>
      </div>
      {/* SECCIÓN DE CULTIVOS ASOCIADOS (HU-FP-04 & HU-FP-06) */}
      <div className="space-y-0 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-0">
          {/* Tab interactiva izquierda */}
          <div
            onClick={() => setActiveTab('cultivo')}
            className={`px-8 py-3 rounded-t-xl border border-b-0 border-border inline-flex items-center font-bold z-10 cursor-pointer transition-colors ${
              activeTab === 'cultivo'
                ? 'bg-card text-foreground shadow-[0_4px_0_0_var(--background)]'
                : 'bg-transparent text-foreground hover:bg-muted/30'
            }`}
          >
            Cultivos
          </div>
          
          {/* Botones derecha */}
          <div className="flex items-center gap-3 pb-3">
            <Button
              onClick={() => navigate(`/admin-finca/biblioteca?id_finca=${fincaId}&id_parcela=${parcela.id_parcela}`)}
              disabled={activeTab === 'historial' || !canAsociar}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs h-9"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-1.5" />
              Asignar cultivo
            </Button>

            <Button
              variant="outline"
              onClick={() => setActiveTab('historial')}
              className={`rounded-xl h-9 transition-colors ${
                activeTab === 'historial' 
                  ? 'bg-card text-foreground shadow-sm border-border' 
                  : 'bg-transparent text-foreground hover:bg-muted/30'
              }`}
            >
              Historial de cultivos
            </Button>
          </div>
        </div>

                {/* Renderizado condicional envuelto en la gran Tab Panel */}
        <div className="bg-card border border-border rounded-b-2xl rounded-tr-2xl p-6 md:p-8 relative z-0 -mt-[1px] shadow-xs">
          {activeTab === 'cultivo' ? (
            !hasCultivo ? (
              <div className="text-center py-12 px-4 max-w-xl mx-auto space-y-4">
                <div className="size-14 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <HugeiconsIcon icon={Plant01Icon} className="size-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Parcela lista para producción</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Esta parcela no tiene un cultivo asignado actualmente. Comienza asociando un cultivo para registrar un nuevo ciclo de siembra y habilitar el seguimiento detallado y las alertas.
                  </p>
                </div>
                <Button
                  onClick={() => navigate(`/admin-finca/biblioteca?id_finca=${fincaId}&id_parcela=${parcela.id_parcela}`)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl px-6 text-sm mt-4"
                >
                  <HugeiconsIcon icon={Plant01Icon} className="size-4 mr-2" />
                  Asignar Cultivo
                </Button>
              </div>
            ) : (
              <div className="space-y-8 divide-y divide-border/50">
                {cultivosAsignados.map((cultivo: any, idx: number) => (
                  <div key={idx} className="pt-8 first:pt-0">
                    <CultivoItemCard
                      cultivo={cultivo}
                      idFinca={parcela.id_finca}
                      idParcela={parcela.id_parcela}
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Historial View */
            <div className="space-y-8 divide-y divide-border/50">
              {loadingHistorial ? (
                <div className="flex justify-center items-center py-12 text-muted-foreground">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
                  Cargando historial...
                </div>
              ) : historialRes?.historial.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-2">
                  <p className="text-muted-foreground text-sm font-medium">Esta parcela no tiene historial de cultivos.</p>
                </div>
              ) : (
                historialRes?.historial.map((hc: any, idx: number) => (
                  <div key={idx} className="pt-8 first:pt-0">
                    <HistorialCultivoCard cultivo={hc} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

    </div>
      <QRModal 
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        url={qrUrl}
        nombreParcela={parcela?.nombre_parcela || 'Parcela'}
      />
    </>
  );
}
