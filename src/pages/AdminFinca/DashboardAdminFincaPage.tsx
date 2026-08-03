import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';

export default function DashboardAdminFincaPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 text-center space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Sección en construcción</h1>
      <p className="text-muted-foreground max-w-md">
        Estamos trabajando en el panel principal de su finca. Mientras tanto, puede solicitarnos la digitalización para comenzar.
      </p>
      
      {/* TODO: Completar con el dashboard real en HU-FP-06 */}
      
      <Button 
        onClick={() => navigate('/digitalizar-finca')}
        className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-6 rounded-xl"
      >
        Solicitá digitalización de finca
      </Button>
    </div>
  );
}
