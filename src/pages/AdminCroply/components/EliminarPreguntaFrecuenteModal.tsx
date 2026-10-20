import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface EliminarPreguntaFrecuenteModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function EliminarPreguntaFrecuenteModal({
  isOpen,
  isLoading = false,
  onClose,
  onConfirm,
}: EliminarPreguntaFrecuenteModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <AlertDialogContent className="sm:max-w-md bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-foreground">
            Eliminar Pregunta Frecuente
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm">
            ¿Estás seguro de que querés eliminar esta pregunta frecuente? Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0 pt-2">
          <AlertDialogCancel onClick={onClose} disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={cn(buttonVariants({ variant: 'destructive' }))}
          >
            {isLoading ? 'Eliminando...' : 'Confirmar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
