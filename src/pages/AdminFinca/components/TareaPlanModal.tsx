import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { tareaPlanSchema, TareaPlanFormValues } from '@/utils/validators';
import { TareaPlanAccion, TareaPlanPayload } from '@/types/planesAccion.types';
import {
  esAplicacionAgroquimico,
  TIPO_TAREA_CATALOG,
} from '@/utils/tipo-tarea.catalog';
import { usuariosService } from '@/services/usuarios.service';

interface TareaPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idFinca?: number;
  tarea?: TareaPlanAccion | null;
  isPending?: boolean;
  onSubmit: (data: TareaPlanPayload) => Promise<unknown> | void;
}

const SIN_RESPONSABLE = '__none__';

export function TareaPlanModal({
  open,
  onOpenChange,
  idFinca,
  tarea,
  isPending,
  onSubmit,
}: TareaPlanModalProps) {
  const form = useForm<TareaPlanFormValues>({
    resolver: zodResolver(tareaPlanSchema),
    defaultValues: valoresIniciales(tarea),
  });

  const idTipo = Number(form.watch('id_tipo_tarea'));
  const esAgro = esAplicacionAgroquimico(idTipo);

  const { data: usuariosData } = useQuery({
    queryKey: ['usuariosFinca', idFinca, 'responsables'],
    queryFn: () =>
      usuariosService.getUsuariosFinca(idFinca as number, {
        page: 1,
        pageSize: 100,
        estado: 'Activo',
      }),
    enabled: open && idFinca != null,
  });

  useEffect(() => {
    if (open) {
      form.reset(valoresIniciales(tarea));
    }
  }, [open, tarea, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: TareaPlanPayload = {
      nombre_tarea: values.nombre_tarea.trim(),
      descripcion_tarea: values.descripcion_tarea.trim(),
      fecha_planificada_tarea: values.fecha_planificada_tarea,
      id_tipo_tarea: Number(values.id_tipo_tarea),
      id_responsable: values.id_responsable ?? null,
      nombre_producto_aa: esAgro ? values.nombre_producto_aa?.trim() ?? null : null,
      dosis_aa: esAgro ? values.dosis_aa?.trim() ?? null : null,
      fecha_hora_aplicacion_aa: esAgro
        ? fromDatetimeLocal(values.fecha_hora_aplicacion_aa)
        : null,
    };
    try {
      await onSubmit(payload);
      onOpenChange(false);
    } catch {
      /* el hook ya mostró el error */
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tarea ? 'Editar tarea' : 'Agregar tarea'}</DialogTitle>
          <DialogDescription>
            Los hitos del plan no se pueden modificar. Solo se agregan o editan tareas.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre_tarea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
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
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIPO_TAREA_CATALOG.map((tipo) => (
                          <SelectItem
                            key={tipo.id_tipo_tarea}
                            value={String(tipo.id_tipo_tarea)}
                          >
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
                    onValueChange={(value) =>
                      field.onChange(value === SIN_RESPONSABLE ? null : Number(value))
                    }
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
                          <SelectItem
                            key={usuario.id_usuario_finca}
                            value={String(usuario.id_usuario_finca)}
                          >
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Guardando...' : tarea ? 'Guardar cambios' : 'Agregar tarea'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function valoresIniciales(tarea?: TareaPlanAccion | null): TareaPlanFormValues {
  return {
    nombre_tarea: tarea?.nombre_tarea ?? '',
    descripcion_tarea: tarea?.descripcion_tarea ?? '',
    fecha_planificada_tarea: tarea?.fecha_planificada_tarea ?? '',
    id_tipo_tarea: tarea?.id_tipo_tarea ?? 2,
    nombre_producto_aa: tarea?.nombre_producto_aa ?? '',
    dosis_aa: tarea?.dosis_aa ?? '',
    fecha_hora_aplicacion_aa: toDatetimeLocal(tarea?.fecha_hora_aplicacion_aa),
    id_responsable: tarea?.id_responsable ?? null,
  };
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 16);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocal(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}
