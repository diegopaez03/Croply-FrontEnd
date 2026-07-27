import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  UserCircleIcon, 
  TractorIcon, 
  Comment01Icon, 
  SecurityCheckIcon, 
  FlashIcon, 
  CustomerService01Icon,
  ArrowRight02Icon
} from '@hugeicons/core-free-icons';

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { solicitudDigitalizacionSchema, SolicitudDigitalizacionFormValues } from '../../utils/validators';
import { solicitudesService } from '../../services/solicitudes.service';
import { handleFormError } from '../../utils/errorHandler';
import { showSuccessToast } from '../../utils/successHandler';

import logoImg from '../../assets/images/LogoCroplyHoriz.svg';

export default function DigitalizarFincaPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<SolicitudDigitalizacionFormValues>({
    resolver: zodResolver(solicitudDigitalizacionSchema),
    defaultValues: {
      nombre_completo: '',
      correo_electronico: '',
      telefono_contacto: '',
      provincia: '',
      departamento: '',
      localidad: '',
      numero_parcelas: undefined,
      superficie_total_hectareas: undefined,
      comentario_adicional: '',
    }
  });

  const onSubmit = async (values: SolicitudDigitalizacionFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await solicitudesService.solicitarDigitalizacion(values);
      showSuccessToast(response.message);
      setIsSuccess(true);
    } catch (error) {
      handleFormError(error, form.setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <header className="w-full h-[110px] bg-background flex items-center px-6 md:px-12 lg:px-24 border-b border-border">
          <Link to="/">
            <img src={logoImg} alt="Croply Logo" className="h-14 w-auto" />
          </Link>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
            <HugeiconsIcon icon={SecurityCheckIcon} className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">¡Solicitud enviada con éxito!</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
            Nuestro equipo se pondrá en contacto a la brevedad.
          </p>
          <Button asChild className="h-12 px-8 text-base">
            <Link to="/">Volver al inicio</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans pb-24">
      {/* Header Simple */}
      <header className="w-full h-[110px] bg-card flex items-center px-6 md:px-12 lg:px-24 border-b border-border">
        <Link to="/">
          <img src={logoImg} alt="Croply Logo" className="h-14 w-auto" />
        </Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 mt-12 md:mt-16">
        
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
            Da el primer paso hacia la agricultura inteligente.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-auto">
            Complete el siguiente formulario para solicitar un análisis técnico detallado de su explotación y comenzar su proceso de transformación digital.
          </p>
        </div>

        {/* Form Container */}
        <Card className="bg-card border-border shadow-sm mb-16">
          <div className="p-6 md:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                
                {/* Section 1: Datos Personales */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <HugeiconsIcon icon={UserCircleIcon} className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-semibold text-foreground">Datos Personales</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nombre_completo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Juan Pérez" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="correo_electronico"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo Electrónico</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="juan.perez@ejemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telefono_contacto"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Teléfono de Contacto</FormLabel>
                          <FormControl>
                            <Input placeholder="+549 2610 000 000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="h-px bg-border w-full" />

                {/* Section 2: Información de la Finca */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <HugeiconsIcon icon={TractorIcon} className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-semibold text-foreground">Información de la Finca</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="provincia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provincia</FormLabel>
                          <FormControl>
                            <Input placeholder="Mendoza" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="departamento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departamento</FormLabel>
                          <FormControl>
                            <Input placeholder="Guaymallén" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="localidad"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Localidad</FormLabel>
                          <FormControl>
                            <Input placeholder="Colonia Segovia" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numero_parcelas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Parcelas</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" placeholder="Ej. 4" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="superficie_total_hectareas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Superficie Total (Ha)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" min="0" placeholder="Ej. 150.5" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="h-px bg-border w-full" />

                {/* Section 3: Comentarios Adicionales */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <HugeiconsIcon icon={Comment01Icon} className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-semibold text-foreground">Comentarios Adicionales</h2>
                  </div>
                  <FormField
                    control={form.control}
                    name="comentario_adicional"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="Ingrese información adicional relevante sobre sus cultivos, métodos de riego, o desafíos actuales..." 
                            className="min-h-[120px] resize-y"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Footer & Submission */}
                <div className="text-center my-4 space-y-4">
                  <p className="text-sm text-muted-foreground flex-1">
                    Al hacer clic en el botón, acepta nuestros términos de servicio y política de privacidad. Sus datos serán tratados con la máxima confidencialidad para fines técnicos únicamente.
                  </p>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full md:w-auto h-14 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all group"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar solicitud de evaluación'}
                    {!isSubmitting && <HugeiconsIcon icon={ArrowRight02Icon} className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </Card>

        {/* Visual Support Elements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pt-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <HugeiconsIcon icon={SecurityCheckIcon} className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground">Seguridad Garantizada</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tus datos personales permanecen resguardados de forma privada y encriptada
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <HugeiconsIcon icon={FlashIcon} className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground">Respuesta Rápida</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Análisis preliminar en menos de 48 horas laborables.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <HugeiconsIcon icon={CustomerService01Icon} className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground">Soporte Técnico</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Expertos agrónomos a su disposición en cada paso.
            </p>
          </div>
        </div>
        <footer className="w-full bg-background border-t border-border pt-16 pb-8 px-6 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto pt-8 border-t border-border flex justify-center text-center">
            <p className="text-sm text-muted-foreground">
              © 2026 Croply. Todos los derechos reservados.
            </p>
          </div>
        </footer>

      </main>
    </div>
  );
}
