import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01Icon, ViewOffSlashIcon, ViewIcon } from '@hugeicons/core-free-icons';

import { authService } from '../../services/auth.service';
import { loginSchema, LoginFormValues } from '../../utils/validators';
import { useAuth } from '../../context/AuthContext';
import { handleFormError } from '../../utils/errorHandler';
import { showSuccessToast } from '../../utils/successHandler';

import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';

import logoImg from '../../assets/images/LogoCroplyHoriz.svg';
export default function LoginPage() {
  const navigate = useNavigate();
  const { loginState } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      contrasena: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Manejar "debe_cambiar_contrasena"
      if (data.debe_cambiar_contrasena) {
        loginState(data.usuario, data.accessToken, true);
        navigate('/primer-acceso');
        return;
      }

      // Login normal: Determinar redirección basada en rol
      showSuccessToast({ message: "Inicio de sesión exitoso" });
      loginState(data.usuario, data.accessToken, false);
      
      const isSystemAdmin = !!data.usuario.rol_sistema;
      
      if (isSystemAdmin) {
        navigate('/admin-croply/dashboard');
      } else {
        navigate('/admin-finca/dashboard');
      }
    },
    onError: (error: any) => {
      // Manejo explícito del error de credenciales para cumplir con el AC
      if (error?.response?.data?.errorCode === 'INVALID_CREDENTIALS') {
        form.setError('contrasena', {
          type: 'server',
          message: error.response.data.message,
        });
      } else {
        // Otros errores transversales
        handleFormError(error, form.setError);
      }
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
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
            ¡Bienvenido otra vez!
          </h1>
          <p className="text-sm text-muted-foreground font-normal leading-5 max-w-[320px]">
            Ingresa tu correo electrónico para iniciar sesión en tu cuenta.
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            
            {/* Email Field */}
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
                        placeholder="m@ejemplo.com"
                        className="pl-9 h-10 border-[#EDE4D3] text-foreground focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary transition-colors"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="contrasena"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium text-foreground">
                      Contraseña
                    </FormLabel>
                    <Link
                      to="/recuperar-contrasena"
                      className="text-xs font-normal text-foreground hover:text-primary transition-colors"
                    >
                      Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        className="pr-10 h-10 border-[#EDE4D3] text-foreground focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary transition-colors"
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

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 rounded-lg font-medium bg-primary hover:bg-[#055534] transition-colors duration-150"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>

            {/* Signup Link */}
            <div className="mt-2 text-center text-sm font-normal text-muted-foreground">
              No tienes cuenta?{' '}
              <Link
                to="/registro"
                className="text-primary hover:underline font-medium"
              >
                Crear cuenta
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
