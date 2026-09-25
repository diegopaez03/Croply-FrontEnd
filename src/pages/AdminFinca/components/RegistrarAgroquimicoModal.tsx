import { useState } from 'react';
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
import { useMiFincaResumenQuery, useParcelaQuery } from '@/hooks/useFincas';
import { usuariosService } from '@/services/usuarios.service';
import { useQuery } from '@tanstack/react-query';
import { planesAccionService } from '@/services/planesAccion.service';

const formSchema = z.object({
  fecha_hora_aplicacion_aa: z.string().min(1, 'La fecha y hora son obligatorias'),
  nombre_producto_aa: z.string().min(1, 'El producto es obligatorio'),
  dosis: z.coerce.number().min(0.01, 'La dosis debe ser mayor a 0'),
  unidad_dosis: z.string().min(1, 'La unidad es obligatoria'),
  id_parcela: z.coerce.number({ required_error: 'La parcela es obligatoria' }),
  id_hito_real: z.coerce.number({ required_error: 'El hito es obligatorio' }),
  id_responsable: z.coerce.number({ required_error: 'El responsable es obligatorio' }),
  observaciones: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const UNIDADES_DOSIS = ['L/ha', 'kg/ha', 'cc/ha', 'ml/ha'];

interface RegistrarAgroquimicoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id_finca: number;
}

export function RegistrarAgroquimicoModal({
  open,
  onOpenChange,
  id_finca,
}: RegistrarAgroquimicoModalProps) {
  const [selectedParcelaId, setSelectedParcelaId] = useState<number | null>(null);
  
  const { createMutation } = useAgroquimicosMutations(id_finca);
  const { data: fincaResumen, isLoading: loadingFincas } = useMiFincaResumenQuery(id_finca);

  const parcelasActivas = fincaResumen?.parcelas.filter((p: any) => p.estado_parcela === 'Activa') || [];
  
  const { data: parcelaObj } = useParcelaQuery(selectedParcelaId);
  const planActivo = parcelaObj?.cultivos?.find((c: any) => c.estado === 'Activo');

  const { data: planDetalle, isLoading: loadingPlan } = useQuery({
    queryKey: ['planAccion', planActivo?.id_plan_accion],
    queryFn: () => planesAccionService.obtenerPlanAccion(planActivo!.id_plan_accion),
    enabled: !!planActivo?.id_plan_accion,
  });

  const { data: usuariosData, isLoading: loadingUsuarios } = useQuery({
    queryKey: ['usuariosFinca', id_finca, 'Activos'],
    queryFn: () => usuariosService.getUsuariosFinca(id_finca, { page: 1, pageSize: 100, estado: 'Activo' }),
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unidad_dosis: UNIDADES_DOSIS[0],
    },
  });

  const handleClose = () => {
    reset();
    setSelectedParcelaId(null);
    onOpenChange(false);
  };

  const onSubmit = (data: FormValues) => {
    const dosis_aa = `${data.dosis} ${data.unidad_dosis}`;
    createMutation.mutate(
      {
        fecha_hora_aplicacion_aa: data.fecha_hora_aplicacion_aa,
        nombre_producto_aa: data.nombre_producto_aa,
        dosis_aa,
        observaciones: data.observaciones,
        id_parcela: data.id_parcela,
        id_hito_real: data.id_hito_real,
        id_responsable: data.id_responsable,
      },
      {
        onSuccess: () => {
          toast.success('Aplicación registrada correctamente.');
          handleClose();
        },
        onError: (error: any) => {
          const errorCode = error?.response?.data?.errorCode;
          const msg = error?.response?.data?.message || 'Error al registrar la aplicación';
          if (errorCode === 'AGROCHEMICAL_TASK_TYPE_UNAVAILABLE' || errorCode === 'PARCEL_WITHOUT_ACTION_PLAN') {
            toast.error(msg);
          } else {
            toast.error(msg);
          }
        },
      }
    );
  };

  const handleParcelaChange = (val: string) => {
    const id = Number(val);
    setValue('id_parcela', id);
    setSelectedParcelaId(id);
    setValue('id_hito_real', undefined as any); // clear previous selection
  };

  const hitos = planDetalle?.hitos || [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] bg-card border border-border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Registrar Aplicación
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Completá los datos para registrar un tratamiento fitosanitario.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Fila 1: Parcela y Hito */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Parcela</Label>
              <Select onValueChange={handleParcelaChange} value={watch('id_parcela')?.toString()}>
                <SelectTrigger className="bg-background border-input text-foreground">
                  <SelectValue placeholder="Seleccionar parcela" />
                </SelectTrigger>
                <SelectContent>
                  {loadingFincas ? (
                    <SelectItem value="loading" disabled>Cargando...</SelectItem>
                  ) : parcelasActivas.length === 0 ? (
                    <SelectItem value="empty" disabled>No hay parcelas activas</SelectItem>
                  ) : (
                    parcelasActivas.map((p: any) => (
                      <SelectItem key={p.id_parcela} value={p.id_parcela.toString()}>
                        {p.nombre_parcela}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.id_parcela && <p className="text-xs text-red-600">{errors.id_parcela.message}</p>}
              {!planActivo && selectedParcelaId && (
                <p className="text-xs text-yellow-600 mt-1">La parcela elegida no tiene plan activo.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Hito asociado</Label>
              <Select 
                onValueChange={(v) => setValue('id_hito_real', Number(v))}
                value={watch('id_hito_real')?.toString()}
                disabled={!selectedParcelaId || !planActivo}
              >
                <SelectTrigger className="bg-background border-input text-foreground">
                  <SelectValue placeholder="Seleccionar hito" />
                </SelectTrigger>
                <SelectContent>
                  {loadingPlan ? (
                    <SelectItem value="loading" disabled>Cargando...</SelectItem>
                  ) : hitos.length === 0 ? (
                    <SelectItem value="empty" disabled>No hay hitos disponibles</SelectItem>
                  ) : (
                    hitos.map((h: any) => (
                      <SelectItem key={h.id_hito_real} value={h.id_hito_real.toString()}>
                        {h.nombre_hito}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.id_hito_real && <p className="text-xs text-red-600">{errors.id_hito_real.message}</p>}
            </div>
          </div>

          {/* Fila 2: Fecha y Hora y Responsable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Fecha y hora</Label>
              <div className="relative w-full">
                <Input
                  type="datetime-local"
                  className="bg-background border-input text-foreground [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3"
                  {...register('fecha_hora_aplicacion_aa')}
                />
              </div>
              {errors.fecha_hora_aplicacion_aa && <p className="text-xs text-red-600">{errors.fecha_hora_aplicacion_aa.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Responsable</Label>
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
            </div>
          </div>

          {/* Fila 3: Producto y Dosis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Producto</Label>
              <Input
                type="text"
                placeholder="Ej. Fungicida XYZ"
                className="bg-background border-input text-foreground"
                {...register('nombre_producto_aa')}
              />
              {errors.nombre_producto_aa && <p className="text-xs text-red-600">{errors.nombre_producto_aa.message}</p>}
            </div>
            
            <div className="grid grid-cols-[2fr_1fr] gap-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Dosis</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ej. 2.5"
                  className="bg-background border-input text-foreground"
                  {...register('dosis')}
                />
                {errors.dosis && <p className="text-xs text-red-600">{errors.dosis.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Unidad</Label>
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
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Observaciones (Opcional)</Label>
            <Textarea
              placeholder="Detalles adicionales..."
              className="bg-background border-input text-foreground resize-none"
              rows={3}
              {...register('observaciones')}
            />
          </div>

          <DialogFooter className="mt-6 flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
