import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';

import { authService } from '../../../services/auth.service';
import { cambioContrasenaSchema, CambioContrasenaFormValues } from '../../../utils/validators';
import { handleFormError } from '../../../utils/errorHandler';
import { showSuccessToast } from '../../../utils/successHandler';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { AxiosError } from 'axios';

export function CambiarContrasenaModal() {
  const [open, setOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<CambioContrasenaFormValues>({
    resolver: zodResolver(cambioContrasenaSchema),
    defaultValues: {
      contrasena_actual: '',
      nueva_contrasena: '',
      confirmar_contrasena: '',
    },
  });

  const mutation = useMutation({
    mutationFn: authService.cambioContrasena,
    onSuccess: (data) => {
      showSuccessToast(data);
      handleOpenChange(false);
    },
    onError: (error) => {
      const axiosError = error as AxiosError<any>;
      const errorCode = axiosError?.response?.data?.errorCode;
      
      if (errorCode === 'CURRENT_PASSWORD_INCORRECT') {
        form.setError('contrasena_actual', {
          type: 'server',
          message: axiosError.response?.data?.message || 'La contraseña actual es incorrecta',
        });
      } else if (errorCode === 'PASSWORD_MISMATCH') {
        form.setError('confirmar_contrasena', {
          type: 'server',
          message: axiosError.response?.data?.message || 'Las contraseñas no coinciden',
        });
      } else {
        handleFormError(error, form.setError);
      }
    },
  });

  const onSubmit = (values: CambioContrasenaFormValues) => {
    mutation.mutate(values);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg h-10 px-4">
          Cambiar contraseña
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-6 gap-6 bg-card border-border rounded-xl shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between p-0 m-0 space-y-0">
          <DialogTitle className="text-xl font-semibold text-foreground tracking-tight">Cambiar contraseña</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="contrasena_actual"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-medium text-foreground">Contraseña actual</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pr-10 h-10 border-border text-foreground focus-visible:ring-primary rounded-lg"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                      >
                        {showCurrentPassword ? (
                          <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" />
                        ) : (
                          <HugeiconsIcon icon={ViewOffSlashIcon} className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nueva_contrasena"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-medium text-foreground">Nueva contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pr-10 h-10 border-border text-foreground focus-visible:ring-primary rounded-lg"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                      >
                        {showNewPassword ? (
                          <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" />
                        ) : (
                          <HugeiconsIcon icon={ViewOffSlashIcon} className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmar_contrasena"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-medium text-foreground">Confirmar nueva contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pr-10 h-10 border-border text-foreground focus-visible:ring-primary rounded-lg"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" />
                        ) : (
                          <HugeiconsIcon icon={ViewOffSlashIcon} className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="h-10 px-4 rounded-lg font-medium"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
