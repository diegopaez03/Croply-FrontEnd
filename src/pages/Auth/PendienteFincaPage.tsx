import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Logout01Icon, InformationCircleIcon } from '@hugeicons/core-free-icons';

export function PendienteFincaPage() {
  const { logoutState } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-border shadow-sm rounded-xl p-8 text-center space-y-6">
        <div className="mx-auto bg-amber-50 border border-amber-200 rounded-full w-16 h-16 flex items-center justify-center mb-2">
          <HugeiconsIcon icon={InformationCircleIcon} className="size-8 text-amber-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground">
          Finca pendiente de asignación
        </h1>
        
        <p className="text-muted-foreground leading-relaxed">
          Tu cuenta todavía no tiene una finca asignada. Esto puede deberse a que tu solicitud de digitalización sigue en proceso — nuestro equipo se pondrá en contacto a la brevedad.
        </p>

        <div className="pt-4">
          <Button 
            onClick={() => logoutState()}
            variant="outline"
            className="gap-2 w-full"
          >
            <HugeiconsIcon icon={Logout01Icon} className="size-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
