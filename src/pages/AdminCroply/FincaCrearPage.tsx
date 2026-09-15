import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateFincaMutation, useAdministradoresFincaDisponiblesQuery } from '../../hooks/useFincas';
import { useTiposSensor } from '../../hooks/useTiposSensor';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserIcon,
  InformationCircleIcon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  PlusSignIcon,
  Delete02Icon,
} from '@hugeicons/core-free-icons';

import { fincaCrearSchema, FincaCrearFormValues } from '../../utils/validators';
import { DispositivosIoTFields } from './components/DispositivosIoTFields';

type FormValues = FincaCrearFormValues;

export default function FincaCrearPage() {
  const navigate = useNavigate();
  const [isAddingParcela, setIsAddingParcela] = useState(false);

  const { data: administradoresRes, isLoading: loadingAdmins } = useAdministradoresFincaDisponiblesQuery();
  const administradores = administradoresRes?.usuarios || [];

  const { query: { data: tiposSensorRes } } = useTiposSensor();
  const tiposSensor = tiposSensorRes?.tipos_sensor || [];

  const form = useForm<FormValues>({
    mode: 'onTouched',
    resolver: zodResolver(fincaCrearSchema),
    defaultValues: {
      nombre_finca: '',
      provincia: '',
      departamento: '',
      latitud: '',
      longitud: '',
      superficie_finca: 0,
      descripcion_finca: '',
      id_usuario_propietario: 'none',
      parcelas: [],
    },
  });

  const { fields: parcelaFields, append: appendParcela, remove: removeParcela } = useFieldArray({
    control: form.control,
    name: "parcelas",
  });

  const { mutate: createFinca, isPending } = useCreateFincaMutation(
    (id) => navigate(`/admin-croply/fincas/${id}`),
    form.setError
  );

  const onSubmit = (data: FormValues) => {
    const propietarioId = data.id_usuario_propietario && data.id_usuario_propietario !== 'none' 
      ? Number(data.id_usuario_propietario) 
      : null;

    createFinca({
      ...data,
      id_usuario_propietario: propietarioId,
    });
  };
  const nombreFinca = form.watch('nombre_finca');
  const superficieFinca = form.watch('superficie_finca');
  const paso1Completo = Boolean(nombreFinca && Number(superficieFinca) > 0);
  
  const propietario = form.watch('id_usuario_propietario');
  const paso2Completo = Boolean(propietario && propietario !== 'none');

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-20">
      
      {/* Header con Breadcrumbs y Título */}
      <div className="flex flex-col mt-2">
        <div className="flex items-center text-sm text-muted-foreground gap-2 mb-3">
          <Link to="/admin-croply/fincas" className="hover:text-foreground transition-colors font-medium">
            Fincas e Infraestructura
          </Link>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
          <span className="text-primary font-semibold">Crear nueva finca</span>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-foreground font-sans tracking-tight mb-2">
            Configuración de Infraestructura
          </h1>
          <p className="text-base text-muted-foreground">
            Completa los pasos técnicos para digitalizar la unidad de producción.
          </p>
        </div>
      </div>

      {/* Progress Bar de Pasos */}
      <div className="grid grid-cols-3 gap-6 my-2">
        {/* Paso 1: Información de Finca */}
        <div className="flex flex-col gap-2.5">
          <div
            className={`h-2 w-full rounded-full transition-all duration-300 ${
              paso1Completo
                ? 'bg-green-700 border border-green-700'
                : 'bg-muted-foreground/15 border border-border/80'
            }`}
          />
          <span
            className={`text-sm tracking-wide transition-colors duration-300 ${
              paso1Completo
                ? 'text-green-700 font-bold'
                : 'text-muted-foreground font-semibold'
            }`}
          >
            1. Información de finca
          </span>
        </div>

        {/* Paso 2: Asignación Cliente */}
        <div className="flex flex-col gap-2.5">
          <div
            className={`h-2 w-full rounded-full transition-all duration-300 ${
              paso2Completo
                ? 'bg-green-700 border border-green-700'
                : isAddingParcela
                ? 'bg-muted border border-border'
                : 'bg-muted-foreground/15 border border-border/80'
            }`}
          />
          <span
            className={`text-sm tracking-wide transition-colors duration-300 ${
              paso2Completo
                ? 'text-green-700 font-bold'
                : 'text-muted-foreground font-semibold'
            }`}
          >
            2. Asignación Cliente
          </span>
        </div>

        {/* Paso 3: Parcelas y Sensores */}
        <div className="flex flex-col gap-2.5">
          <div
            className={`h-2 w-full rounded-full transition-all duration-300 ${
              isAddingParcela
                ? 'bg-green-700 border border-green-700'
                : 'bg-muted-foreground/15 border border-border/80'
            }`}
          />
          <span
            className={`text-sm tracking-wide transition-colors duration-300 ${
              isAddingParcela
                ? 'text-green-700 font-bold'
                : 'text-muted-foreground font-semibold'
            }`}
          >
            3. Parcelas y Sensores
          </span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {!isAddingParcela && (
            <>
              {/* Card 1: Información de la Finca */}
              <Card className="shadow-sm border-border/50">
                <CardContent className="p-8 space-y-6">
                  
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/10 text-primary size-10 rounded-xl flex items-center justify-center shrink-0">
                      <HugeiconsIcon icon={InformationCircleIcon} className="size-5" strokeWidth={2} />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Información de la Finca</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nombre_finca"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-muted-foreground">Nombre de la Finca</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Finca Argumedo" className="h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="superficie_finca"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-muted-foreground">Superficie de la Finca</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="Ej. 150.5" className="h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="descripcion_finca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-muted-foreground">Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Breve descripción de la finca..."
                            className="resize-none min-h-[100px] p-3"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="latitud"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-muted-foreground">Latitud</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. -32.8908" className="h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="longitud"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-muted-foreground">Longitud</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. -68.8272" className="h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="provincia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-muted-foreground">Provincia</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Mendoza" className="h-11" {...field} />
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
                          <FormLabel className="font-semibold text-muted-foreground">Departamento</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Luján de Cuyo" className="h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                </CardContent>
              </Card>

              {/* Card 2: Asignación de Propietario (HU-FP-02) */}
              <Card className="shadow-sm border-border/50">
                <CardContent className="p-8 space-y-6">
                  
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-muted text-muted-foreground size-10 rounded-xl flex items-center justify-center shrink-0">
                      <HugeiconsIcon icon={UserIcon} className="size-5" strokeWidth={2} />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Asignación de Cliente</h2>
                  </div>

                  <FormField
                    control={form.control}
                    name="id_usuario_propietario"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-semibold text-muted-foreground">Seleccionar Cliente Existente</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={loadingAdmins}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder={loadingAdmins ? "Cargando..." : "Seleccione un cliente..."} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Sin asignar</SelectItem>
                            {administradores.map((admin) => (
                              <SelectItem key={admin.id_usuario} value={String(admin.id_usuario)}>
                                {admin.nombre} {admin.apellido} ({admin.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-2">
                          Si el cliente no existe, deberá crearlo primero en el módulo de 'Gestión de Clientes'.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 border-t border-border mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        const isValid = await form.trigger(['nombre_finca', 'provincia', 'departamento', 'latitud', 'longitud', 'superficie_finca']);
                        if (isValid) {
                          if (parcelaFields.length === 0) {
                            appendParcela({ nombre_parcela: '', superficie_parcela: 0, controladores: [] });
                          }
                          setIsAddingParcela(true);
                        }
                      }}
                      className="h-11 px-6 font-semibold gap-2 border-primary/20 text-primary hover:bg-primary/5 w-full md:w-auto"
                    >
                      Siguiente: Parcelas
                      <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" strokeWidth={2} />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Configurá las parcelas y sus sensores IoT opcionalmente antes de guardar la finca.
                    </p>
                  </div>

                </CardContent>
              </Card>
            </>
          )}

          {isAddingParcela && (
            <div className="space-y-6 mb-24">
              {parcelaFields.map((parcela, index) => (
                <ParcelaCard 
                  key={parcela.id} 
                  index={index} 
                  form={form} 
                  onRemove={() => removeParcela(index)} 
                  tiposSensor={tiposSensor}
                />
              ))}

              <Button 
                type="button" 
                variant="outline" 
                onClick={() => appendParcela({ nombre_parcela: '', superficie_parcela: 0, controladores: [] })}
                className="w-full h-12 border-dashed border-2 text-primary font-semibold border-primary/30 hover:bg-primary/5"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-5 mr-2" />
                Agregar parcela
              </Button>
            </div>
          )}

          {/* Sticky Footer Acciones */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border p-4 px-8 z-50 lg:left-64">
            <div className="max-w-5xl mx-auto flex items-center justify-end gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (isAddingParcela) {
                    setIsAddingParcela(false);
                  } else {
                    navigate('/admin-croply/fincas');
                  }
                }}
                disabled={isPending}
                className="h-11 px-6 font-semibold"
              >
                {isAddingParcela ? 'Atrás' : 'Cancelar'}
              </Button>
              <Button type="submit" disabled={isPending} className="h-11 px-8 font-semibold text-white bg-primary hover:bg-primary/90">
                {isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
          
        </form>
      </Form>
    </div>
  );
}

function ParcelaCard({ index, form, onRemove, tiposSensor }: { index: number, form: any, onRemove: () => void, tiposSensor: any }) {


  return (
    <Card className="shadow-sm border-border relative overflow-hidden">
      {index > 0 && (
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={onRemove}
          className="absolute top-4 right-4 text-destructive hover:bg-destructive/10"
        >
          <HugeiconsIcon icon={Delete02Icon} className="size-5" />
        </Button>
      )}
      <CardHeader className="pb-4 border-b border-border bg-muted/5">
        <CardTitle className="text-xl flex items-center gap-3">
          <div className="bg-primary/10 text-primary size-10 rounded-xl flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={InformationCircleIcon} className="size-5" strokeWidth={2} />
          </div>
          Mapeo de Parcelas
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name={`parcelas.${index}.nombre_parcela`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-muted-foreground">Nombre de parcelas</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Parcela Norte" className="h-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`parcelas.${index}.superficie_parcela`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-muted-foreground">Superficie de la parcela (ha)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type="number" step="0.01" className="h-11 pr-12" {...field} />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">ha</div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-4 border-t border-border">
          <DispositivosIoTFields namePrefix={`parcelas.${index}.controladores`} tiposSensor={tiposSensor} />
        </div>
      </CardContent>
    </Card>
  );
}


