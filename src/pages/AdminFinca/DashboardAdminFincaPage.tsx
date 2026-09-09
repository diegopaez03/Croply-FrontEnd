import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useFincasQuery, useFincaQuery } from '../../hooks/useFincas';

export default function DashboardAdminFincaPage() {
  const navigate = useNavigate();
  const { data: fincasRes } = useFincasQuery(1, 10);
  
  // Para el placeholder, tomamos la primera finca
  const firstFincaId = fincasRes?.fincas?.[0]?.id_finca;
  
  const { data: fincaDetalle, isLoading } = useFincaQuery(firstFincaId || null);
  const finca = fincaDetalle;
  const parcelas = finca?.parcelas ?? [];

  return (
    <div className="w-full max-w-screen-xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {finca ? `Mi finca: ${finca.nombre_finca}` : 'Mi finca'}
          </h1>
          <p className="text-muted-foreground mt-1">Gestión general de sectores y cultivos.</p>
        </div>
        
        {/* Este botón existía en el dashboard y se nos pidió conservarlo */}
        <Button 
          onClick={() => navigate('/digitalizar-finca')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 rounded-xl"
        >
          Solicitá digitalización de finca
        </Button>
      </div>
      
      {/* TODO: Completar selector de fincas, clima y recomendaciones en HU-FP-08 */}
      
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6">Mis Parcelas</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-16 text-muted-foreground">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
            Cargando...
          </div>
        ) : parcelas.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tenés parcelas configuradas.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {parcelas.map((parcela) => (
              <div
                key={parcela.id_parcela}
                onClick={() => navigate(`/admin-finca/parcelas/${parcela.id_parcela}`)}
                className="group cursor-pointer bg-muted/20 border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                    {parcela.nombre_parcela}
                  </h3>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium">
                    {parcela.superficie_parcela} ha
                  </span>
                </div>
                {/* Por ahora no tenemos la data exacta del cultivo en parcelaResumen del backend real, 
                    así que mostramos un placeholder simple para HU-FP-08 */}
                <p className="text-sm text-muted-foreground">
                  Clic para ver detalle y gestionar el cultivo.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
