import { useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEditarGastoMutation } from '@/hooks/useCostos';
import { useFincaActiva } from '@/contexts/FincaActivaContext';
import { usuariosService } from '@/services/usuarios.service';
import { useQuery } from '@tanstack/react-query';
import { GastoProduccion } from '@/types/costos.types';

const formSchema = z.object({
  nombre_insumo_gp: z.string().min(1, 'El insumo es obligatorio').max(150, 'El insumo no puede superar los 150 caracteres'),
  monto_gp: z.coerce.number().positive('El precio debe ser mayor a 0').refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), 'Máximo 2 decimales'),
  id_responsable: z.coerce.number({ required_error: 'El responsable es obligatorio' }).min(1, 'El responsable es obligatorio'),
  fecha_gp: z.string().min(1, 'La fecha es obligatoria'),
});

type FormValues = z.infer<typeof formSchema>;

interface EditarGastoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gasto: GastoProduccion | null;
}

export function EditarGastoModal({ open, onOpenChange, gasto }: EditarGastoModalProps) {
  const { fincaActivaId, fincas } = useFincaActiva();
  const editMutation = useEditarGastoMutation();

  const fincaActiva = fincas.find(f => f.id_finca === fincaActivaId);

  const { data: usuariosData, isLoading: loadingUsuarios } = useQuery({
    queryKey: ['usuariosFinca', fincaActivaId, 'Activos'],
    queryFn: () => usuariosService.getUsuariosFinca(fincaActivaId!, { page: 1, pageSize: 100, estado: 'Activo' }),
    enabled: open && !!fincaActivaId,
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
  });

  useEffect(() => {
    if (gasto && open) {
      reset({
        nombre_insumo_gp: gasto.nombre_insumo_gp,
        monto_gp: gasto.monto_gp,
        id_responsable: gasto.id_responsable,
        fecha_gp: gasto.fecha_gp.split('T')[0],
      });
    }
  }, [gasto, open, reset, fincaActivaId]);

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = (data: FormValues) => {
    if (!fincaActivaId || !gasto) return;
    editMutation.mutate(
      {
        id_finca: fincaActivaId,
        id_gasto_produccion: gasto.id_gasto_produccion,
        data: {
          nombre_insumo_gp: data.nombre_insumo_gp,
          monto_gp: data.monto_gp,
          id_responsable: data.id_responsable,
          fecha_gp: data.fecha_gp,
        }
      },
      {
        onSuccess: () => {
          handleClose();
        }
      }
    );
  };

  const id_responsable_val = watch('id_responsable');
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Gasto</DialogTitle>
          <DialogDescription>
            Actualizá los datos del gasto seleccionado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Finca</Label>
            <Select value={fincaActivaId?.toString() || ""} disabled>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar finca" />
              </SelectTrigger>
              <SelectContent>
                {fincaActiva && (
                  <SelectItem value={fincaActiva.id_finca.toString()}>{fincaActiva.nombre_finca}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre_insumo_gp">Insumo</Label>
            <Input id="nombre_insumo_gp" {...register('nombre_insumo_gp')} />
            {errors.nombre_insumo_gp && <p className="text-[0.8rem] text-destructive">{errors.nombre_insumo_gp.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto_gp">Precio</Label>
            <Input id="monto_gp" type="number" step="0.01" {...register('monto_gp')} />
            {errors.monto_gp && <p className="text-[0.8rem] text-destructive">{errors.monto_gp.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Responsable</Label>
            <Select 
              value={id_responsable_val ? id_responsable_val.toString() : ''} 
              onValueChange={(val) => setValue('id_responsable', Number(val), { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingUsuarios ? "Cargando..." : "Seleccionar responsable"} />
              </SelectTrigger>
              <SelectContent>
                {/* 
                  El responsable original podría estar inactivo, pero el requerimiento de HU-GC-01 indica que 
                  no es elegible si está inactivo. Así que solo listamos los activos.
                */}
                {usuariosData?.usuarios?.map(u => {
                  const val = u.id_usuario_finca ? u.id_usuario_finca.toString() : u.id_usuario.toString();
                  return (
                    <SelectItem key={val} value={val}>
                      {u.nombre} {u.apellido}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.id_responsable && <p className="text-[0.8rem] text-destructive">{errors.id_responsable.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_gp">Fecha de compra</Label>
            <Input id="fecha_gp" type="date" max={today} {...register('fecha_gp')} />
            {errors.fecha_gp && <p className="text-[0.8rem] text-destructive">{errors.fecha_gp.message}</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={editMutation.isPending}>
              {editMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
