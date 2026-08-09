import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../context/AuthContext';
import { usuariosService } from '../../services/usuarios.service';
import { handleFormError } from '../../utils/errorHandler';
import { showSuccessToast } from '../../utils/successHandler';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { CambiarContrasenaModal } from './components/CambiarContrasenaModal';
import { HugeiconsIcon } from '@hugeicons/react';
import { Settings01Icon, UserCircleIcon, Shield01Icon } from '@hugeicons/core-free-icons';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

const perfilSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  telefono: z.string().optional(),
});

type PerfilFormValues = z.infer<typeof perfilSchema>;

export default function PerfilPage() {
  const { updateUsuario } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const { data: perfilData } = useQuery({
    queryKey: ['perfil'],
    queryFn: usuariosService.getPerfil,
  });

  const form = useForm<PerfilFormValues>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      telefono: '',
    },
  });

  // Efecto para re-inicializar el form cuando cargan los datos o entramos a edición
  useEffect(() => {
    if (perfilData) {
      form.reset({
        nombre: perfilData.nombre || '',
        apellido: perfilData.apellido || '',
        telefono: perfilData.telefono || '',
      });
    }
  }, [perfilData, form]);

  const mutation = useMutation({
    mutationFn: (data: PerfilFormValues) => usuariosService.actualizarPerfil(data),
    onSuccess: (response, variables) => {
      showSuccessToast(response);
      // Actualizamos el contexto de React para reflejar en tiempo real el cambio en toda la UI
      updateUsuario({
        nombre: variables.nombre,
        apellido: variables.apellido,
        telefono: variables.telefono,
      });
      setIsEditing(false);
    },
    onError: (error) => {
      handleFormError(error, form.setError);
    },
  });

  const onSubmit = (data: PerfilFormValues) => {
    mutation.mutate(data);
  };

  const handleCancel = () => {
    if (perfilData) {
      form.reset({
        nombre: perfilData.nombre || '',
        apellido: perfilData.apellido || '',
        telefono: perfilData.telefono || '',
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-auto flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Header de la página */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HugeiconsIcon icon={Settings01Icon} className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Mi cuenta</h1>
            <p className="text-sm text-muted-foreground">
              Gestioná tu información personal y la seguridad de tu cuenta.
            </p>
          </div>
        </div>

        <Tabs defaultValue="basica" className="w-full">
          <TabsList className="w-full justify-start h-auto p-1 bg-transparent border-b border-border rounded-none gap-4">
            <TabsTrigger 
              value="basica"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={UserCircleIcon} className="h-4 w-4" />
                Información básica
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="seguridad"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Shield01Icon} className="h-4 w-4" />
                Seguridad
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basica" className="mt-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Información personal</h2>
                  <p className="text-sm text-muted-foreground">
                    Actualizá tus datos personales y de contacto.
                  </p>
                </div>
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Editar
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="apellido"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Apellido</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <Label>Correo electrónico</Label>
                        <Input value={perfilData?.email || ''} disabled className="bg-muted" />
                      </div>
                      <FormField
                        control={form.control}
                        name="telefono"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {isEditing && (
                      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                        <Button type="button" variant="outline" onClick={handleCancel} disabled={mutation.isPending}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                          Guardar
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seguridad" className="mt-6">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <h2 className="text-lg font-semibold text-foreground">Seguridad de la cuenta</h2>
                <p className="text-sm text-muted-foreground">
                  Gestioná la contraseña de tu cuenta para mantener tu información segura.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border rounded-lg bg-card">
                  <div className="space-y-1">
                    <h3 className="font-medium text-foreground text-sm">Contraseña</h3>
                    <p className="text-sm text-muted-foreground">
                      Actualizá tu contraseña regularmente para mayor seguridad.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <CambiarContrasenaModal />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
