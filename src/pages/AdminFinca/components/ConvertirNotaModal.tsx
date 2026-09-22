import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NotaCampoListado, ConvertirNotaPayload } from '@/types/notasCampo.types';
import { useParcelasPorFinca } from '@/hooks/useParcelas';
import { useParcelaQuery } from '@/hooks/useFincas';
import { usePlanAccionQuery } from '@/hooks/usePlanesAccion';
import { useTiposTarea } from '@/hooks/useTiposTarea';
import { usuariosService } from '@/services/usuarios.service';
import { useConvertirNotaCampo } from '@/hooks/useNotasCampo';

const SIN_RESPONSABLE = '__none__';

const fromDatetimeLocal = (val?: string | null) => {
  if (!val) return null;
  return new Date(val).toISOString();
};

const convertirNotaSchema = z.object({
  id_parcela: z.coerce.number().min(1, 'Requerido'),
  id_hito_real: z.coerce.number().min(1, 'Requerido'),
  nombre_tarea: z.string().min(1, 'Requerido'),
  descripcion_tarea: z.string().min(1, 'Requerido'),
  fecha_planificada_tarea: z.string().min(1, 'Requerido'),
  id_tipo_tarea: z.coerce.number().min(1, 'Requerido'),
  id_responsable: z.coerce.number().nullable().optional(),
  nombre_producto_aa: z.string().nullable().optional(),
  dosis_aa: z.string().nullable().optional(),
  fecha_hora_aplicacion_aa: z.string().nullable().optional(),
}).superRefine(() => {
  // Aquí la lógica extra podría venir del hook, pero para evitar deps pasamos un validador suelto o lo manejamos en el submit
});

interface ConvertirNotaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nota: NotaCampoListado | null;
  idFincaInicial: number;
}

export function ConvertirNotaModal({
  open,
  onOpenChange,
  nota,
  idFincaInicial,
}: ConvertirNotaModalProps) {
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const { data: parcelasData } = useParcelasPorFinca(idFincaInicial);
  const { query: { data: tiposData } } = useTiposTarea();

  const form = useForm<z.infer<typeof convertirNotaSchema>>({
    resolver: zodResolver(convertirNotaSchema),
    defaultValues: {
      id_parcela: undefined,
      id_hito_real: undefined,
      nombre_tarea: '',
      descripcion_tarea: '',
      fecha_planificada_tarea: '',
      id_tipo_tarea: undefined,
      id_responsable: null,
      nombre_producto_aa: null,
      dosis_aa: null,
      fecha_hora_aplicacion_aa: null,
    },
  });

  const watchIdParcela = form.watch('id_parcela');
  const watchIdTipo = form.watch('id_tipo_tarea');
  const esAgro = tiposData?.tipos_tarea.find(t => t.id_tipo_tarea === Number(watchIdTipo))?.es_tipo_agroquimico ?? false;

  const { data: parcelaObj } = useParcelaQuery(watchIdParcela ? Number(watchIdParcela) : null);
  
  // Buscar el id_plan_accion del cultivo activo de esta parcela
  let idPlanAccion: number | null = null;
  if (parcelaObj && parcelaObj.cultivos) {
    const cultivo = parcelaObj.cultivos.find((c: any) => c.estado === 'Activo' || !c.estado);
    if (cultivo && cultivo.id_plan_accion) {
      idPlanAccion = cultivo.id_plan_accion;
    }
  }

  // Verificar ERR-01: Parcela sin plan de acción
  const noTienePlan = Boolean(watchIdParcela && !idPlanAccion);

  const { data: planAccion } = usePlanAccionQuery(idPlanAccion);

  const { data: usuariosData } = useQuery({
    queryKey: ['usuariosFinca', idFincaInicial, 'responsables'],
    queryFn: () => usuariosService.getUsuariosFinca(idFincaInicial, { page: 1, pageSize: 100, estado: 'Activo' }),
    enabled: open,
  });

  const { mutate: convertir, isPending } = useConvertirNotaCampo(
    () => onOpenChange(false),
    (err) => {
      if (err.response?.data?.errorCode === 'PARCEL_WITHOUT_ACTION_PLAN') {
         setErrorLocal('La parcela seleccionada no tiene un plan de acción generado. No es posible convertir la nota en tarea.');
      }
    }
  );

  useEffect(() => {
    if (open && nota) {
      form.reset({
        id_parcela: nota.id_parcela ?? undefined,
        id_hito_real: undefined,
        nombre_tarea: '',
        descripcion_tarea: nota.contenido_nota_campo,
        fecha_planificada_tarea: new Date().toISOString().slice(0, 10),
        id_tipo_tarea: undefined,
        id_responsable: null,
        nombre_producto_aa: null,
        dosis_aa: null,
        fecha_hora_aplicacion_aa: null,
      });
      setErrorLocal(null);
    }
  }, [open, nota, form]);

  // Al cambiar la parcela, resetear el hito
  useEffect(() => {
    form.setValue('id_hito_real', undefined as any);
  }, [watchIdParcela, form]);

  const handleSubmit = form.handleSubmit((values) => {
    if (esAgro) {
      if (!values.nombre_producto_aa || !values.dosis_aa || !values.fecha_hora_aplicacion_aa) {
        form.setError('nombre_producto_aa', { type: 'manual', message: 'Falta producto' });
        form.setError('dosis_aa', { type: 'manual', message: 'Falta dosis' });
        form.setError('fecha_hora_aplicacion_aa', { type: 'manual', message: 'Falta fecha' });
        return;
      }
    }

    const payload: ConvertirNotaPayload = {
      id_parcela: Number(values.id_parcela),
      id_hito_real: Number(values.id_hito_real),
      nombre_tarea: values.nombre_tarea.trim(),
      descripcion_tarea: values.descripcion_tarea.trim(),
      fecha_planificada_tarea: values.fecha_planificada_tarea,
      id_tipo_tarea: Number(values.id_tipo_tarea),
      id_responsable: values.id_responsable ?? undefined,
      nombre_producto_aa: esAgro ? values.nombre_producto_aa?.trim() ?? undefined : undefined,
      dosis_aa: esAgro ? values.dosis_aa?.trim() ?? undefined : undefined,
      fecha_hora_aplicacion_aa: esAgro ? fromDatetimeLocal(values.fecha_hora_aplicacion_aa) ?? undefined : undefined,
    };

    if (nota) {
      convertir({ id_nota_campo: nota.id_nota_campo, data: payload });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convertir en tarea</DialogTitle>
          <DialogDescription>
            Crea una nueva tarea en el plan de acción a partir de esta nota de campo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <FormField
              control={form.control}
              name="id_parcela"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parcela</FormLabel>
                  <Select value={field.value ? String(field.value) : ''} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar parcela" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {parcelasData?.map((p) => (
                        <SelectItem key={p.id_parcela} value={String(p.id_parcela)}>
                          {p.nombre_parcela}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {noTienePlan && (
              <div className="text-sm font-medium text-destructive">
                La parcela seleccionada no tiene un plan de acción generado. No es posible convertir la nota en tarea.
              </div>
            )}

            <FormField
              control={form.control}
              name="id_hito_real"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hito del Plan de Acción</FormLabel>
                  <Select 
                    value={field.value ? String(field.value) : ''} 
                    onValueChange={field.onChange}
                    disabled={noTienePlan || !idPlanAccion}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar hito" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {planAccion?.hitos.map((h) => (
                        <SelectItem key={h.id_hito_real} value={String(h.id_hito_real)}>
                          {h.nombre_hito}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nombre_tarea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de tarea</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion_tarea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fecha_planificada_tarea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha planificada</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="id_tipo_tarea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de tarea</FormLabel>
                    <Select value={field.value ? String(field.value) : ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tiposData?.tipos_tarea.map((tipo) => (
                          <SelectItem key={tipo.id_tipo_tarea} value={String(tipo.id_tipo_tarea)}>
                            {tipo.nombre_tipo_tarea}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="id_responsable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsable (opcional)</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : SIN_RESPONSABLE}
                    onValueChange={(value) => field.onChange(value === SIN_RESPONSABLE ? null : Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sin asignar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={SIN_RESPONSABLE}>Sin asignar</SelectItem>
                      {(usuariosData?.usuarios ?? [])
                        .filter((usuario) => usuario.id_usuario_finca)
                        .map((usuario) => (
                          <SelectItem key={usuario.id_usuario_finca} value={String(usuario.id_usuario_finca)}>
                            {usuario.nombre} {usuario.apellido}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {esAgro && (
              <div className="grid grid-cols-1 gap-4 rounded-xl border border-border/60 p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Aplicación de agroquímico
                </p>
                <FormField
                  control={form.control}
                  name="nombre_producto_aa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Producto</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dosis_aa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosis</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fecha_hora_aplicacion_aa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha y hora de aplicación</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {errorLocal && <div className="text-sm font-medium text-destructive">{errorLocal}</div>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending || noTienePlan}>
                Convertir
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
