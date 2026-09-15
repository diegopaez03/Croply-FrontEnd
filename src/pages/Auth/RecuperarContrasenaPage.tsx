import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';

import { authService } from '../../services/auth.service';
import { olvideContrasenaSchema, OlvideContrasenaFormValues } from '../../utils/validators';
import { handleFormError } from '../../utils/errorHandler';

import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';

import logoImg from '../../assets/images/LogoCroplyHoriz.svg';

export default function RecuperarContrasenaPage() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<OlvideContrasenaFormValues>({
    resolver: zodResolver(olvideContrasenaSchema),
    defaultValues: {
      email: '',
    },
  });

  const recuperarMutation = useMutation({
    mutationFn: authService.olvideMiContrasena,
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (error) => {
      handleFormError(error, form.setError);
    },
  });

  const onSubmit = (values: OlvideContrasenaFormValues) => {
    recuperarMutation.mutate(values);
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-[471px] border-border shadow-md rounded-2xl p-4 sm:p-7 bg-card">
        <CardHeader className="flex flex-col items-center gap-6 p-0 pb-6">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Croply Logo" className="h-14 w-auto" />
          </div>

          <div className="flex flex-col items-center gap-4 w-full text-center">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-16 w-16 text-primary" />
            
            <p className="text-base text-foreground font-medium leading-6 max-w-[320px]">
              Si el correo ingresado está registrado, recibirás un enlace para restablecer tu contraseña.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col gap-4">
          <Button onClick={() => navigate('/login')} className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 transition-colors duration-150">
            Volver a iniciar sesión
          </Button>
          
          <button 
            type="button"
            onClick={() => {
              setIsSuccess(false);
              form.reset();
            }}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            ¿Usaste el correo equivocado? Intentar de nuevo
          </button>
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
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-sm text-muted-foreground font-normal leading-5 max-w-[320px]">
            Ingresá tu correo electrónico registrado y te enviaremos un enlace para restablecerla.
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            
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
                        className="pl-9 h-10 border-border text-foreground focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary transition-colors"
                        {...field}
                      />
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
                disabled={recuperarMutation.isPending}
              >
                {recuperarMutation.isPending ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-10 rounded-lg font-medium border-border hover:bg-muted transition-colors duration-150"
                onClick={() => navigate('/login')}
              >
                Volver al inicio de sesión
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
