import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { variedadSchema, VariedadFormValues } from '@/utils/validators';
import { handleFormError } from '@/utils/errorHandler';
import { showSuccessToast } from '@/utils/successHandler';
import { formatDistanciaPlantacion, parseDistanciaPlantacion } from '@/utils/formatters';
import { useActualizarVariedad, useAgregarVariedad } from '@/hooks/useCultivosBase';
import { VariedadDetalle } from '@/types/cultivos.types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface FormularioVariedadInlineProps {
  idCultivoBase: number;
  variedad?: VariedadDetalle | null;
  onCancel: () => void;
  onSuccess: () => void;
}

function valoresIniciales(variedad?: VariedadDetalle | null): VariedadFormValues {
  if (!variedad) {
    return {
      nombre_variedad: '',
      distancia_plantas: undefined as unknown as number,
      distancia_surcos: undefined as unknown as number,
      dias_a_cosecha: undefined as unknown as number,
      observaciones: '',
    };
  }

  const distancia = parseDistanciaPlantacion(variedad.distancia_plantacion);
  return {
    nombre_variedad: variedad.nombre_variedad,
    distancia_plantas: distancia.distancia_plantas || (undefined as unknown as number),
    distancia_surcos: distancia.distancia_surcos || (undefined as unknown as number),
    dias_a_cosecha: variedad.dias_a_cosecha,
    observaciones: variedad.observaciones ?? '',
  };
}

export function FormularioVariedadInline({
  idCultivoBase,
  variedad,
  onCancel,
  onSuccess,
}: FormularioVariedadInlineProps) {
  const agregarMutation = useAgregarVariedad();
  const actualizarMutation = useActualizarVariedad();
  const isPending = agregarMutation.isPending || actualizarMutation.isPending;
  const esEdicion = Boolean(variedad);

  const form = useForm<VariedadFormValues>({
    resolver: zodResolver(variedadSchema),
    defaultValues: valoresIniciales(variedad),
  });

  useEffect(() => {
    form.reset(valoresIniciales(variedad));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variedad]);

  const onSubmit = (values: VariedadFormValues) => {
    const data = {
      nombre_variedad: values.nombre_variedad,
      distancia_plantacion: formatDistanciaPlantacion(
        Number(values.distancia_plantas),
        Number(values.distancia_surcos),
      ),
      observaciones: values.observaciones?.trim() ? values.observaciones.trim() : null,
      dias_a_cosecha: Number(values.dias_a_cosecha),
    };

    if (esEdicion && variedad) {
      actualizarMutation.mutate(
        { id_cultivo_base: idCultivoBase, id_variedad: variedad.id_variedad, data },
        {
          onSuccess: (response) => {
            showSuccessToast(response);
            onSuccess();
          },
          onError: (error) => handleFormError(error, form.setError),
        },
      );
      return;
    }

    agregarMutation.mutate(
      { id_cultivo_base: idCultivoBase, data },
      {
        onSuccess: (response) => {
          showSuccessToast(response);
          onSuccess();
        },
        onError: (error) => handleFormError(error, form.setError),
      },
    );
  };

  return (
    <div className="bg-[#FAF8F5] border border-border/50 rounded-xl p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nombre_variedad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de variedad *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Perita" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dias_a_cosecha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Días a cosecha *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="75"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="distancia_plantas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entre plantas (cm) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="30"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="distancia_surcos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entre surcos (cm) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="60"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="observaciones"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observaciones de cosecha</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Opcional"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
