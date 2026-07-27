import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { authService } from '../../services/auth.service';
import { registroInvitadoSchema, RegistroInvitadoFormValues } from '../../utils/validators';
import { handleFormError } from '../../utils/errorHandler';
import { showSuccessToast } from '../../utils/successHandler';

import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01Icon, ViewOffSlashIcon, ViewIcon, UserIcon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';

import logoImg from '../../assets/images/LogoCroplyHoriz.svg';
import { AxiosError } from 'axios';

export default function RegistroInvitadoPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 1. Validar invitación al cargar la página
  const { data: validacionData, error: validacionError, isLoading: isValidating } = useQuery({
    queryKey: ['validarInvitacion', token],
    queryFn: () => authService.validarInvitacion(token || ''),
    enabled: !!token,
    retry: false,
  });

  // 2. Configurar formulario
  const form = useForm<RegistroInvitadoFormValues>({
    resolver: zodResolver(registroInvitadoSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      contrasena: '',
      confirmarContrasena: '',
    },
  });

  // Precargar el email cuando se obtenga de la validación
  useEffect(() => {
    if (validacionData?.email_invitado) {
      form.setValue('email', validacionData.email_invitado);
    }
  }, [validacionData, form]);

  // 3. Mutación para registrar
  const registroMutation = useMutation({
    mutationFn: authService.registrarInvitado,
    onSuccess: (data) => {
      showSuccessToast(data);
      navigate('/login');
    },
    onError: (error) => {
      handleFormError(error, form.setError);
    },
  });

  const onSubmit = (values: RegistroInvitadoFormValues) => {
    if (!validacionData?.id_InvitacionFinca) return;

    registroMutation.mutate({
      id_InvitacionFinca: validacionData.id_InvitacionFinca,
      nombre: values.nombre,
      apellido: values.apellido,
      contrasena: values.contrasena,
    });
  };

  // Rendering logic based on state
  if (isValidating) {
    return (
      <Card className="w-full max-w-lg border-border shadow-md rounded-2xl p-4 sm:p-7 bg-card flex flex-col items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground font-sans">Validando invitación...</p>
      </Card>
    );
  }

  // Si hay error en la validación (token usado, expirado, etc)
  if (validacionError) {
    const error = validacionError as AxiosError<any>;
    const errorMessage = error?.response?.data?.message || "Ocurrió un error al validar la invitación.";
    
    return (
      <Card className="w-full max-w-lg border-border shadow-md rounded-2xl p-4 sm:p-7 bg-card">
        <CardHeader className="flex flex-col items-center gap-6 p-0 pb-6">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Croply Logo" className="h-14 w-auto" />
          </div>
          <div className="flex flex-col items-center gap-2 text-center w-full">
            <h1 className="text-2xl font-semibold text-destructive leading-8">
              Enlace inválido
            </h1>
            <p className="text-sm text-muted-foreground font-normal leading-5">
              {errorMessage}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex justify-center mt-4">
           <Button onClick={() => navigate('/login')} className="w-full h-10 rounded-lg">
             Volver al inicio de sesión
           </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg border-border shadow-md rounded-2xl p-4 sm:p-7 bg-card">
      <CardHeader className="flex flex-col items-center gap-6 p-0 pb-6">
        {/* Logo and App Name */}
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Croply Logo" className="h-14 w-auto" />
        </div>

        {/* Welcome Text */}
        <div className="flex flex-col items-center gap-2 text-center w-full">
          <h1 className="text-2xl font-semibold text-foreground leading-8">
            Completá tu registro en Croply
          </h1>
          <p className="text-sm text-muted-foreground font-normal leading-5 max-w-sm">
            Ingresá tus datos para finalizar la creación de tu cuenta.
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre Field */}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-medium text-foreground">Nombre</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <HugeiconsIcon icon={UserIcon} className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          placeholder="Tu nombre"
                          className="pl-9 h-10 border-border text-foreground focus-visible:ring-primary"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />

              {/* Apellido Field */}
              <FormField
                control={form.control}
                name="apellido"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-medium text-foreground">Apellido</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <HugeiconsIcon icon={UserIcon} className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          placeholder="Tu apellido"
                          className="pl-9 h-10 border-border text-foreground focus-visible:ring-primary"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />
            </div>

            {/* Email Field (Disabled) */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-medium text-foreground">
                    Correo electrónico
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HugeiconsIcon icon={Mail01Icon} className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        className="pl-9 pr-10 h-10 border-primary bg-primary/5 text-foreground font-medium focus-visible:ring-primary disabled:opacity-100 disabled:cursor-not-allowed"
                        disabled
                        {...field}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password Field */}
              <FormField
                control={form.control}
                name="contrasena"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-medium text-foreground">Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pr-10 h-10 border-border text-foreground focus-visible:ring-primary"
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

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmarContrasena"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-medium text-foreground">Confirmar contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pr-10 h-10 border-border text-foreground focus-visible:ring-primary"
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
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 rounded-lg font-medium bg-primary hover:bg-primary/90 mt-2"
              disabled={registroMutation.isPending}
            >
              {registroMutation.isPending ? 'Completando...' : 'Completar registro'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
