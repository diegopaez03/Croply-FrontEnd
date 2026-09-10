import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { usuariosService } from '@/services/usuarios.service';
import { handleFormError } from '@/utils/errorHandler';
import { showSuccessToast } from '@/utils/successHandler';
import { UsuarioListado } from '@/types/usuarios.types';

interface ConfirmarBajaUsuarioDialogProps {
  usuario: UsuarioListado | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queryKeys: readonly unknown[][];
}

export function ConfirmarBajaUsuarioDialog({
  usuario,
  open,
  onOpenChange,
  queryKeys,
}: ConfirmarBajaUsuarioDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id_usuario: number) =>
      usuariosService.actualizarEstado(id_usuario, { estado: 'Inactivo' }),
    onSuccess: (res) => {
      showSuccessToast(res);
      for (const queryKey of queryKeys) {
        queryClient.invalidateQueries({ queryKey });
      }
      onOpenChange(false);
    },
    onError: (err) => handleFormError(err),
  });

  const nombre = usuario ? `${usuario.nombre} ${usuario.apellido}` : 'este usuario';

  return (
    <AlertDialog open={open} onOpenChange={(val) => !mutation.isPending && onOpenChange(val)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Dar de baja a este usuario?</AlertDialogTitle>
          <AlertDialogDescription>
            Se cambiará el estado de {nombre} a Inactivo.
            Podés reactivarlo más adelante desde la edición del usuario.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending || !usuario}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault();
              if (usuario) mutation.mutate(usuario.id_usuario);
            }}
          >
            {mutation.isPending ? 'Procesando...' : 'Confirmar baja'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
