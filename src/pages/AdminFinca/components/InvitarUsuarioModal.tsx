import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { invitacionesService } from '@/services/invitaciones.service';
import { handleFormError } from '@/utils/errorHandler';
import { showSuccessToast } from '@/utils/successHandler';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, MailSend02Icon } from '@hugeicons/core-free-icons';

const invitarUsuarioSchema = z.object({
  email_invitado: z.string().email('Debe ser un correo válido'),
  id_rol: z.string().min(1, 'Debe seleccionar un rol'),
});

type InvitarUsuarioFormValues = z.infer<typeof invitarUsuarioSchema>;

interface InvitarUsuarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idFinca: number | undefined;
  rolesData: any;
  isLoadingRoles: boolean;
}

export function InvitarUsuarioModal({ open, onOpenChange, idFinca, rolesData, isLoadingRoles }: InvitarUsuarioModalProps) {
  const queryClient = useQueryClient();
  const [pendingInvitationId, setPendingInvitationId] = useState<number | null>(null);

  const form = useForm<InvitarUsuarioFormValues>({
    resolver: zodResolver(invitarUsuarioSchema),
    defaultValues: {
      email_invitado: '',
      id_rol: '',
    },
  });

  const handleClose = () => {
    form.reset();
    setPendingInvitationId(null);
    onOpenChange(false);
  };

  const crearMutation = useMutation({
    mutationFn: (data: InvitarUsuarioFormValues) => {
      if (!idFinca) throw new Error("Finca no definida");
      return invitacionesService.crearInvitacion(idFinca, {
        email_invitado: data.email_invitado,
        id_rol: Number(data.id_rol)
      });
    },
    onSuccess: (data) => {
      showSuccessToast({ message: data.message });
      queryClient.invalidateQueries({ queryKey: ['usuariosFinca', idFinca] });
      handleClose();
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        // Invitación pendiente
        setPendingInvitationId(error.response.data.id_invitacion_finca);
      } else if (error?.response?.data?.errorCode === 'ERR-01') {
        // Usuario ya vinculado
        form.setError("email_invitado", { message: error.response.data.message });
      } else {
        handleFormError(error, form.setError);
      }
    }
  });

  const reenviarMutation = useMutation({
    mutationFn: () => {
      if (!pendingInvitationId) throw new Error("ID de invitación no definido");
      return invitacionesService.reenviarInvitacion(pendingInvitationId);
    },
    onSuccess: (data) => {
      showSuccessToast({ message: data.message });
      handleClose();
    },
    onError: (error: any) => {
      handleFormError(error);
    }
  });

  const onSubmit = (data: InvitarUsuarioFormValues) => {
    setPendingInvitationId(null);
    crearMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) handleClose();
    }}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Invitar empleado</DialogTitle>
          <DialogDescription>
            Enviá un correo de invitación para sumar a un nuevo empleado a tu finca.
          </DialogDescription>
        </DialogHeader>

        {pendingInvitationId ? (
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-900">
              <HugeiconsIcon icon={Alert02Icon} className="size-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-semibold">Invitación pendiente</p>
                <p>Ya existe una invitación enviada a este correo que aún no ha sido aceptada.</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setPendingInvitationId(null)}
                disabled={reenviarMutation.isPending}
              >
                Volver
              </Button>
              <Button 
                onClick={() => reenviarMutation.mutate()} 
                disabled={reenviarMutation.isPending}
                className="gap-2"
              >
                <HugeiconsIcon icon={MailSend02Icon} className="size-4" />
                Reenviar invitación
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="email_invitado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. empleado@agro.com" {...field} disabled={crearMutation.isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="id_rol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol asignado <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        disabled={isLoadingRoles || crearMutation.isPending}
                      >
                        <option value="" disabled>Seleccione un rol</option>
                        {rolesData?.roles?.map((rol: any) => (
                          <option key={rol.id_rol} value={rol.id_rol}>
                            {rol.nombre_rol}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={crearMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={crearMutation.isPending || isLoadingRoles}>
                  Enviar invitación
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
