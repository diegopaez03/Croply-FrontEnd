import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAgroquimicosMutations } from '@/hooks/useAgroquimicos';
import { usuariosService } from '@/services/usuarios.service';
import { useQuery } from '@tanstack/react-query';
import { AplicacionAgroquimicoDetalle } from '@/types/agroquimicos.types';

const formSchema = z.object({
  fecha_hora_aplicacion_aa: z.string().min(1, 'La fecha y hora son obligatorias'),
  nombre_producto_aa: z.string().min(1, 'El producto es obligatorio'),
  dosis: z.coerce.number().min(0.01, 'La dosis debe ser mayor a 0'),
  unidad_dosis: z.string().min(1, 'La unidad es obligatoria'),
  id_responsable: z.coerce.number({ required_error: 'El responsable es obligatorio' }),
  observaciones: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const UNIDADES_DOSIS = ['L/ha', 'kg/ha', 'cc/ha', 'ml/ha'];

interface EditarAgroquimicoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id_finca: number;
  initialData: AplicacionAgroquimicoDetalle | null;
}

export function EditarAgroquimicoModal({
  open,
  onOpenChange,
  id_finca,
  initialData,
}: EditarAgroquimicoModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const { editMutation } = useAgroquimicosMutations(id_finca);

  const { data: usuariosData, isLoading: loadingUsuarios } = useQuery({
    queryKey: ['usuariosFinca', id_finca, 'Activos'],
    queryFn: () => usuariosService.getUsuariosFinca(id_finca, { page: 1, pageSize: 100, estado: 'Activo' }),
    enabled: open && isEditing, // Solo cargar si pasamos a editar
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (open && initialData) {
      setIsEditing(false); // Siempre abre en modo solo lectura
      
      const [dosisStr, ...rest] = (initialData.dosis_aa || '').split(' ');
      const dosis = parseFloat(dosisStr) || 0;
      const unidad_dosis = rest.join(' ') || UNIDADES_DOSIS[0];

      reset({
        fecha_hora_aplicacion_aa: initialData.fecha_hora_aplicacion_aa.slice(0, 16), // datetime-local max 16 chars
        nombre_producto_aa: initialData.nombre_producto_aa,
        dosis,
        unidad_dosis,
        id_responsable: initialData.id_responsable,
        observaciones: initialData.observaciones || '',
      });
    }
  }, [open, initialData, reset]);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsEditing(false);
    }, 300);
  };

  const onSubmit = (data: FormValues) => {
    if (!initialData) return;

    const dosis_aa = `${data.dosis} ${data.unidad_dosis}`;
    
    editMutation.mutate(
      {
        id_aplicacion: initialData.id_aplicacion,
        data: {
          fecha_hora_aplicacion_aa: data.fecha_hora_aplicacion_aa,
          nombre_producto_aa: data.nombre_producto_aa,
          dosis_aa,
          observaciones: data.observaciones,
          id_responsable: data.id_responsable,
        }
      },
      {
        onSuccess: () => {
          toast.success('Aplicación actualizada correctamente.');
          handleClose();
        },
        onError: (error: any) => {
          const msg = error?.response?.data?.message || 'Error al actualizar la aplicación';
          toast.error(msg);
        },
      }
    );
  };

  if (!initialData) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] bg-card border border-border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {isEditing ? 'Editar Aplicación' : 'Detalle de Aplicación'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEditing 
              ? 'Modificá los datos necesarios del tratamiento fitosanitario.' 
              : 'Visualizá los datos del tratamiento fitosanitario.'}
          </DialogDescription>
        </DialogHeader>

        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="space-y-4"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
        >
          {/* Fila 1: Parcela y Hito (Siempre solo lectura) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Parcela</Label>
              <div className="p-2 border border-border bg-muted/50 rounded-md text-sm text-muted-foreground">
                {initialData.nombre_parcela}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Hito asociado</Label>
              <div className="p-2 border border-border bg-muted/50 rounded-md text-sm text-muted-foreground">
                {initialData.nombre_hito || 'No asignado'}
              </div>
            </div>
          </div>

          {/* Fila 2: Fecha y Hora y Responsable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Fecha y hora</Label>
              {isEditing ? (
                <>
                  <div className="relative w-full">
                    <Input
                      type="datetime-local"
                      className="bg-background border-input text-foreground [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3"
                      {...register('fecha_hora_aplicacion_aa')}
                    />
                  </div>
                  {errors.fecha_hora_aplicacion_aa && <p className="text-xs text-red-600">{errors.fecha_hora_aplicacion_aa.message}</p>}
                </>
              ) : (
                <div className="p-2 border border-border bg-muted/50 rounded-md text-sm text-muted-foreground">
                  {new Date(initialData.fecha_hora_aplicacion_aa).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              )}
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Responsable</Label>
              {isEditing ? (
                <>
                  <Select
                    onValueChange={(v) => setValue('id_responsable', Number(v))}
                    value={watch('id_responsable')?.toString()}
                  >
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Seleccionar usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingUsuarios ? (
                        <SelectItem value="loading" disabled>Cargando...</SelectItem>
                      ) : !usuariosData?.usuarios?.length ? (
                        <SelectItem value="empty" disabled>No hay usuarios activos</SelectItem>
                      ) : (
                        usuariosData.usuarios.map((u: any) => (
                          <SelectItem key={u.id_usuario_finca} value={u.id_usuario_finca.toString()}>
                            {u.nombre} {u.apellido}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.id_responsable && <p className="text-xs text-red-600">{errors.id_responsable.message}</p>}
                </>
              ) : (
                <div className="p-2 border border-border bg-muted/50 rounded-md text-sm text-muted-foreground">
                  {initialData.nombre_responsable}
                </div>
              )}
            </div>
          </div>

          {/* Fila 3: Producto y Dosis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Producto</Label>
              {isEditing ? (
                <>
                  <Input
                    type="text"
                    placeholder="Ej. Fungicida XYZ"
                    className="bg-background border-input text-foreground"
                    {...register('nombre_producto_aa')}
                  />
                  {errors.nombre_producto_aa && <p className="text-xs text-red-600">{errors.nombre_producto_aa.message}</p>}
                </>
              ) : (
                <div className="p-2 border border-border bg-muted/50 rounded-md text-sm text-muted-foreground">
                  {initialData.nombre_producto_aa}
                </div>
              )}
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Dosis</Label>
              {isEditing ? (
                <div className="grid grid-cols-[2fr_1fr] gap-2">
                  <div>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ej. 2.5"
                      className="bg-background border-input text-foreground"
                      {...register('dosis')}
                    />
                    {errors.dosis && <p className="text-xs text-red-600">{errors.dosis.message}</p>}
                  </div>
                  <div>
                    <Select
                      onValueChange={(v) => setValue('unidad_dosis', v)}
                      value={watch('unidad_dosis')}
                    >
                      <SelectTrigger className="bg-background border-input text-foreground">
                        <SelectValue placeholder="Unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIDADES_DOSIS.map(u => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.unidad_dosis && <p className="text-xs text-red-600">{errors.unidad_dosis.message}</p>}
                  </div>
                </div>
              ) : (
                <div className="p-2 border border-border bg-muted/50 rounded-md text-sm text-muted-foreground">
                  {initialData.dosis_aa}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Observaciones (Opcional)</Label>
            {isEditing ? (
              <Textarea
                placeholder="Detalles adicionales..."
                className="bg-background border-input text-foreground resize-none"
                rows={3}
                {...register('observaciones')}
              />
            ) : (
              <div className="p-2 border border-border bg-muted/50 rounded-md text-sm text-muted-foreground min-h-[80px]">
                {initialData.observaciones || '-'}
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 flex gap-2 justify-end">
            {!isEditing ? (
              <>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cerrar
                </Button>
                <Button type="button" variant="default" onClick={() => setIsEditing(true)}>
                  Editar
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={editMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={editMutation.isPending || !isDirty}
                >
                  {editMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
