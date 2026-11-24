import { Button } from '@/components/ui/button';

interface ErrorConexionServidorProps {
  onReintentar: () => void;
  isReintentando?: boolean;
  className?: string;
}

export function ErrorConexionServidor({
  onReintentar,
  isReintentando = false,
  className = '',
}: ErrorConexionServidorProps) {
  return (
    <div className={`w-full max-w-screen-xl mx-auto space-y-6 py-16 text-center ${className}`}>
      <p className="text-xl font-semibold text-foreground">No se pudo conectar con el servidor</p>
      <p className="text-sm text-muted-foreground mt-2">Revisá tu conexión e intentá nuevamente.</p>
      <div className="mt-6">
        <Button
          variant="outline"
          onClick={onReintentar}
          disabled={isReintentando}
          className="font-semibold px-6 rounded-xl"
        >
          {isReintentando ? 'Reintentando...' : 'Reintentar'}
        </Button>
      </div>
    </div>
  );
}
