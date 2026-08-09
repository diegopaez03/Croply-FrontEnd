import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { rolesService, rolesFincaService } from '../../services/roles.service';
import { usuariosService } from '../../services/usuarios.service';
import { handleFormError } from '../../utils/errorHandler';
import { showSuccessToast } from '../../utils/successHandler';
import { UsuarioListado } from '../../types/usuarios.types';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

// Shadcn UI components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

const editarUsuarioSchema = z.object({
  id_rol: z.string().min(1, 'Debe seleccionar un rol'),
  estado: z.enum(['Activo', 'Inactivo', 'Pendiente'], { required_error: 'Debe seleccionar un estado' }),
});

type EditarUsuarioFormValues = z.infer<typeof editarUsuarioSchema>;

interface EditarUsuarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: UsuarioListado | null;
  context: 'croply' | 'finca';
  id_finca?: number;
}

export function EditarUsuarioModal({ open, onOpenChange, usuario, context, id_finca }: EditarUsuarioModalProps) {
  const queryClient = useQueryClient();
  const { usuario: currentUser } = useAuth();

  const isFinca = context === 'finca';

  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: isFinca ? ['rolesFinca', id_finca] : ['rolesSistema'],
    queryFn: async () => {
      if (isFinca) {
        if (!id_finca) throw new Error("id_finca es requerido");
        return rolesFincaService.getRoles(id_finca);
      } else {
        return rolesService.getRolesSistema();
      }
    },
    enabled: open && (!isFinca || !!id_finca),
  });

  const form = useForm<EditarUsuarioFormValues>({
    resolver: zodResolver(editarUsuarioSchema),
    defaultValues: {
      id_rol: '',
      estado: 'Activo',
    },
  });

  // Pre-fill form when user changes
  useEffect(() => {
    if (usuario && open) {
      form.reset({
        id_rol: usuario.rol ? String(usuario.rol.id_rol) : '',
        estado: usuario.estado as 'Activo' | 'Inactivo' | 'Pendiente',
      });
    }
  }, [usuario, open, form]);

  const mutation = useMutation<any, Error, EditarUsuarioFormValues>({
    mutationFn: async (data: EditarUsuarioFormValues) => {
      if (!usuario) throw new Error("Usuario no encontrado");
      
      const promises: { type: 'rol' | 'estado', promise: Promise<any> }[] = [];
      const changedRol = data.id_rol !== (usuario.rol ? String(usuario.rol.id_rol) : '');
      const changedEstado = data.estado !== usuario.estado;

      if (changedRol) {
        if (isFinca) {
          if (!id_finca) throw new Error("id_finca es requerido");
          if (!usuario.id_usuario_finca) throw new Error("id_usuario_finca es requerido para finca");
          promises.push({ type: 'rol', promise: rolesFincaService.asignarRol(id_finca, usuario.id_usuario_finca, { id_rol: Number(data.id_rol) }) });
        } else {
          promises.push({ type: 'rol', promise: rolesService.asignarRolSistema(usuario.id_usuario, { id_rol: Number(data.id_rol) }) });
        }
      }

      if (changedEstado) {
        promises.push({ type: 'estado', promise: usuariosService.actualizarEstado(usuario.id_usuario, { estado: data.estado }) });
      }

      if (promises.length === 0) {
        throw new Error("No hay cambios para guardar.");
      }

      const results = await Promise.allSettled(promises.map(p => p.promise));
      
      const successResults: any[] = [];
      const failedResults: any[] = [];
      
      results.forEach((res, index) => {
        if (res.status === 'fulfilled') {
          successResults.push({ type: promises[index].type, data: res.value });
        } else {
          failedResults.push({ type: promises[index].type, error: res.reason });
        }
      });

      if (failedResults.length === promises.length) {
        // Todos fallaron, tirar el primer error para que lo ataje onError (y mantenga el comportamiento actual)
        throw failedResults[0].error;
      }

      if (failedResults.length > 0 && successResults.length > 0) {
        // Fallo parcial
        const successType = successResults[0].type;
        const failedType = failedResults[0].type;
        const failedError = failedResults[0].error;
        let errorMsg = "ocurrió un error";
        if (failedError?.response?.data?.message) {
          errorMsg = failedError.response.data.message;
        } else if (failedError instanceof Error) {
          errorMsg = failedError.message;
        }
        
        const successActionStr = successType === 'rol' ? 'asignar el rol' : 'actualizar el estado';
        const failedActionStr = failedType === 'rol' ? 'asignar el rol' : 'actualizar el estado';
        
        return {
          status: 'partial',
          message: `Se pudo ${successActionStr}, pero no se pudo ${failedActionStr}: ${errorMsg}`
        };
      }

      // Ambos (o el único) tuvieron éxito
      const estadoResult = successResults.find(r => r.type === 'estado');
      if (estadoResult) return { status: 'success', message: estadoResult.data.message };
      return { status: 'success', message: successResults[0].data.message };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: isFinca ? ['usuariosFinca', id_finca] : ['usuariosCroply'] });
      
      if (data.status === 'partial') {
        toast.error(data.message);
      } else {
        showSuccessToast({ message: data.message });
        form.reset();
        onOpenChange(false);
      }
    },
    onError: (error) => {
      handleFormError(error, form.setError);
      // Invalidate roles query in case ERR-01 occurs so the list of roles is refreshed
      queryClient.invalidateQueries({ queryKey: isFinca ? ['rolesFinca', id_finca] : ['rolesSistema'] });
    },
  });

  const onSubmit = (data: EditarUsuarioFormValues) => {
    mutation.mutate(data);
  };

  if (!usuario) return null;

  return (
    <Dialog open={open} onOpenChange={(val: boolean) => {
      if (!val) form.reset();
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isFinca ? "Editar Usuario (Finca)" : "Editar Usuario (Sistema)"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={usuario.nombre} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input value={usuario.apellido} disabled className="bg-muted" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={usuario.email} disabled className="bg-muted" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={usuario.telefono || '---'} disabled className="bg-muted" />
              </div>

              <FormField
                control={form.control}
                name="estado"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        disabled={mutation.isPending}
                      >
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                        {currentUser?.rol_sistema === 'ADMIN_CROPLY' && (
                          <option value="Pendiente">Pendiente</option>
                        )}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="id_rol"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>{isFinca ? "Rol de Finca" : "Rol de Sistema"}</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                      disabled={isLoadingRoles || mutation.isPending}
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
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending || isLoadingRoles}>
                Guardar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
