import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';

import { authService } from '../../services/auth.service';
import { primerAccesoSchema, PrimerAccesoFormValues } from '../../utils/validators';
import { useAuth } from '../../context/AuthContext';
import { handleFormError } from '../../utils/errorHandler';
import { showSuccessToast } from '../../utils/successHandler';

import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';

import logoImg from '../../assets/images/LogoCroplyHoriz.svg';

export default function PrimerAccesoPage() {
  const navigate = useNavigate();
  const { completarPrimerAcceso, usuario } = useAuth();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PrimerAccesoFormValues>({
    resolver: zodResolver(primerAccesoSchema),
    defaultValues: {
      nueva_contrasena: '',
      confirmar_contrasena: '',
    },
  });

  const mutation = useMutation({
    mutationFn: authService.contrasenaPrimerAcceso,
    onSuccess: (data) => {
      showSuccessToast(data);
      completarPrimerAcceso();

      // Redirigir al dashboard según el rol
      const isSystemAdmin = !!usuario?.rol_sistema;
      if (isSystemAdmin) {
        navigate('/admin-croply/dashboard');
      } else {
        navigate('/admin-finca/dashboard');
      }
    },
    onError: (error) => {
      handleFormError(error, form.setError);
    },
  });

  const onSubmit = (values: PrimerAccesoFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Card className="w-full max-w-[471px] border-[#EDE4D3] shadow-md rounded-2xl p-4 sm:p-7 bg-white">
      <CardHeader className="flex flex-col items-center gap-6 p-0 pb-6">
        {/* Logo and App Name */}
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Croply Logo" className="h-14 w-auto" />
        </div>

        {/* Welcome Text */}
        <div className="flex flex-col items-center gap-2 text-center w-full">
          <h1 className="text-2xl font-semibold text-foreground leading-8">
            Cambio de contraseña
          </h1>
          <p className="text-sm text-muted-foreground font-normal leading-5 max-w-[320px]">
            Por seguridad, debés cambiar tu contraseña antes de continuar.
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            
            {/* New Password Field */}
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
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pr-10 h-10 border-[#EDE4D3] text-foreground focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary transition-colors"
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

            {/* Confirm Password Field */}
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
                        className="pr-10 h-10 border-[#EDE4D3] text-foreground focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary transition-colors"
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

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 rounded-lg font-medium bg-primary hover:bg-[#055534] transition-colors duration-150"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Confirmando...' : 'Confirmar y continuar'}
            </Button>

          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
