import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { useTiposSensor } from '../../../hooks/useTiposSensor';
import { ParcelaResumen } from '../../../types/fincas.types';
import { DispositivosIoTFields } from './DispositivosIoTFields';

import { UseFormReturn } from 'react-hook-form';
import { parcelaSchema, CrearEditarParcelaFormValues } from '../../../utils/validators';

type FormValues = CrearEditarParcelaFormValues;

interface ParcelaFormProps {
  initialData?: ParcelaResumen;
  fincaUbicacion: string; // e.g. "Luján de Cuyo, Mendoza (-32.11, -68.12)"
  onSave: (data: FormValues, setFormError: UseFormReturn<FormValues>['setError']) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function CrearEditarParcelaForm({ initialData, fincaUbicacion, onSave, onCancel, isPending }: ParcelaFormProps) {
  const { query: tiposSensorQuery } = useTiposSensor();
  const tiposSensor = tiposSensorQuery.data?.tipos_sensor || [];

  const form = useForm<FormValues>({
    mode: 'onTouched',
    resolver: zodResolver(parcelaSchema),
    defaultValues: {
      nombre_parcela: '',
      superficie_parcela: 0,
      controladores: [],
    },
  });

  useEffect(() => {
    if (initialData && tiposSensor.length > 0) {
      form.reset({
        nombre_parcela: initialData.nombre_parcela,
        superficie_parcela: initialData.superficie_parcela || 0,
        controladores: initialData.controladores.map(c => ({
          id_controlador_sensor: c.id_controlador_sensor,
          nombre_controlador: c.nombre_controlador,
          ip_controlador: c.ip_controlador,
          sensores: c.sensores.map(s => {
            const tipo = tiposSensor.find(t => t.codigo_tipo_sensor === s.codigo_tipo_sensor);
            return {
              id_sensor: s.id_sensor,
              id_tipo_sensor: tipo ? tipo.id_tipo_sensor : 1, 
              ip_sensor: s.ip_sensor || '192.168.0.1',
            };
          })
        }))
      });
    }
  }, [initialData, form, tiposSensor]);

  const onSubmit = (data: FormValues) => {
    onSave(data, form.setError);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="p-6 border border-border rounded-xl bg-card shadow-sm">
          <h3 className="text-lg font-bold mb-4">{initialData ? 'Editar Parcela' : 'Nueva Parcela'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <FormField
              control={form.control}
              name="nombre_parcela"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de parcela</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Lote Norte" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="superficie_parcela"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Superficie (ha)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground">Ubicación</label>
              <Input disabled value={fincaUbicacion} className="mt-2 bg-muted/50" />
              <p className="text-xs text-muted-foreground mt-1">La ubicación se hereda de la finca.</p>
            </div>
          </div>

          <DispositivosIoTFields namePrefix="controladores" tiposSensor={tiposSensor} />
          
          <div className="flex justify-end gap-3 mt-8">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
