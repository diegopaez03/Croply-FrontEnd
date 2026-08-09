import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewOffSlashIcon, ViewIcon } from '@hugeicons/core-free-icons';

import { authService } from '../../services/auth.service';
import { resetearContrasenaSchema, ResetearContrasenaFormValues } from '../../utils/validators';
import { handleFormError } from '../../utils/errorHandler';
import { showSuccessToast } from '../../utils/successHandler';

import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';

import logoImg from '../../assets/images/LogoCroplyHoriz.svg';
import { AxiosError } from 'axios';

export default function ResetearContrasenaPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasExpiredError, setHasExpiredError] = useState<{ message: string } | null>(null);

  const form = useForm<ResetearContrasenaFormValues>({
    resolver: zodResolver(resetearContrasenaSchema),
    defaultValues: {
      nueva_contrasena: '',
      confirmar_contrasena: '',
    },
  });

  const resetearMutation = useMutation({
    mutationFn: authService.resetearContrasena,
    onSuccess: (data) => {
      showSuccessToast(data);
      navigate('/login');
    },
    onError: (error) => {
      const axiosError = error as AxiosError<any>;
      if (axiosError?.response?.data?.errorCode === 'TOKEN_EXPIRED') {
        setHasExpiredError({
          message: axiosError.response.data.message
        });
      } else if (axiosError?.response?.data?.errorCode === 'PASSWORD_MISMATCH') {
        form.setError('confirmar_contrasena', {
          type: 'server',
          message: axiosError.response.data.message,
        });
      } else {
        handleFormError(error, form.setError);
      }
    },
  });

  const onSubmit = (values: ResetearContrasenaFormValues) => {
    if (!token) return;
    
    resetearMutation.mutate({
      token_hash: token,
      nueva_contrasena: values.nueva_contrasena,
      confirmar_contrasena: values.confirmar_contrasena,
    });
  };

  // Manejo de token expirado o usado (se muestra si la mutación falla con 410)
  if (hasExpiredError) {
    return (
      <Card className="w-full max-w-[471px] border-border shadow-md rounded-2xl p-4 sm:p-7 bg-card">
        <CardHeader className="flex flex-col items-center gap-6 p-0 pb-6">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Croply Logo" className="h-14 w-auto" />
          </div>
          <div className="flex flex-col items-center gap-2 text-center w-full">
            <h1 className="text-2xl font-semibold text-destructive leading-8">
              Enlace inválido
            </h1>
            <p className="text-sm text-muted-foreground font-normal leading-5">
              {hasExpiredError.message}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex justify-center mt-4">
           <Button onClick={() => navigate('/recuperar-contrasena')} className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90">
             Solicitar nuevo enlace
           </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[471px] border-border shadow-md rounded-2xl p-4 sm:p-7 bg-card">
      <CardHeader className="flex flex-col items-center gap-6 p-0 pb-6">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Croply Logo" className="h-14 w-auto" />
        </div>

        <div className="flex flex-col items-center gap-2 text-center w-full">
          <h1 className="text-2xl font-semibold text-foreground leading-8">
            Restablecer contraseña
          </h1>
          <p className="text-sm text-muted-foreground font-normal leading-5 max-w-[320px]">
            Ingresá tu nueva contraseña y confirmala para recuperar el acceso a tu cuenta.
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            
            <FormField
              control={form.control}
              name="nueva_contrasena"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-medium text-foreground">
                    Nueva contraseña
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pr-10 h-10 border-border text-foreground focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary transition-colors"
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
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmar_contrasena"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-medium text-foreground">
                    Confirmar nueva contraseña
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pr-10 h-10 border-border text-foreground focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary transition-colors"
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

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full h-10 rounded-lg font-medium bg-primary hover:bg-primary/90 transition-colors duration-150"
                disabled={resetearMutation.isPending}
              >
                {resetearMutation.isPending ? 'Restableciendo...' : 'Restablecer contraseña'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
