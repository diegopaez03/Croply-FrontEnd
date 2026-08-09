import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { registerAdminFincaSchema, RegisterAdminFincaFormValues } from '../../../utils/validators';
import { authService } from '../../../services/auth.service';
import { rolesService } from '../../../services/roles.service';
import { handleFormError } from '../../../utils/errorHandler';
import { showSuccessToast } from '../../../utils/successHandler';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';

// Shadcn UI components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

// We don't have Select in components/ui/ yet, let's use a native select for now or if we do, we can use it.
// Assuming we have to use standard native select for simplicity if Shadcn Select is missing or complex without it.
// Actually, I'll use standard select styled like Shadcn Input to be safe.

interface RegistrarClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegistrarClienteModal({ open, onOpenChange }: RegistrarClienteModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<RegisterAdminFincaFormValues>({
    resolver: zodResolver(registerAdminFincaSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      contrasena_temporal: '',
      estado: 'Pendiente',
    },
  });

  const queryClient = useQueryClient();

  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['rolesSistema'],
    queryFn: rolesService.getRolesSistema,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: authService.registrarAdminFinca,
    onSuccess: (data) => {
      showSuccessToast(data);
      queryClient.invalidateQueries({ queryKey: ['usuariosCroply'] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      handleFormError(error, form.setError);
    },
  });

  const onSubmit = (data: RegisterAdminFincaFormValues) => {
    mutation.mutate(data);
  };

  const onCancel = () => {
    form.reset();
    setShowPassword(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) onCancel();
    }}>
      <DialogContent className="sm:max-w-xl bg-card p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-border bg-muted/50">
          <DialogTitle className="text-xl font-bold text-primary">Registrar cliente</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 flex flex-col gap-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingresá el nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apellido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingresá el apellido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico *</FormLabel>
                  <FormControl>
                    <Input placeholder="ejemplo@finca.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+54 9 11 1234-5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contrasena_temporal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña temporal *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Ingresá una contraseña" 
                          type={showPassword ? 'text' : 'password'} 
                          className="pr-10"
                          {...field} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                        >
                          {showPassword ? (
                            <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" />
                          ) : (
                            <HugeiconsIcon icon={ViewOffSlashIcon} className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="id_rol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        value={field.value || ''}
                        disabled={isLoadingRoles}
                      >
                        <option value="">Sin rol asignado (Opcional)</option>
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

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <FormControl>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Registrando..." : "Registrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
