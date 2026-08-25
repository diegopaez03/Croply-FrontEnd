import { useState } from 'react';
import { useFieldArray, useForm, useWatch, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueries } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { plantillaBaseSchema, PlantillaBaseFormValues } from '@/utils/validators';
import { mapFormularioARequest } from '@/utils/plantilla-form.mapper';
import { TIPO_TAREA_CATALOG, esAplicacionAgroquimico } from '@/utils/tipo-tarea.catalog';
import { useCultivosBase, cultivoBaseQueryKey } from '@/hooks/useCultivosBase';
import { cultivosService } from '@/services/cultivos.service';
import { CrearPlantillaBaseRequest } from '@/types/plantillas.types';
import { handleFormError } from '@/utils/errorHandler';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const SELECT_CLASS =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const TAREA_VACIA = {
  dia_relativo_tp: 0 as unknown as number,
  id_tipo_tarea: '' as unknown as number,
  descripcion_tp: '',
  nombre_producto: '',
  dosis_aa: '',
};

interface PlantillaFormularioProps {
  defaultValues?: PlantillaBaseFormValues;
  onGuardar: (data: CrearPlantillaBaseRequest) => Promise<unknown>;
  onCancel: () => void;
  isPending?: boolean;
  textoSubmit?: string;
}

const FORM_VACIO: PlantillaBaseFormValues = {
  nombre_pb: '',
  cultivos: [],
  hitos: [],
};

export function PlantillaFormulario({
  defaultValues,
  onGuardar,
  onCancel,
  isPending = false,
  textoSubmit = 'Guardar',
}: PlantillaFormularioProps) {
  const [variedadConflictiva, setVariedadConflictiva] = useState<number | null>(null);
  const { data: cultivosData } = useCultivosBase();
  const cultivosDisponibles = cultivosData?.cultivos ?? [];

  const form = useForm<PlantillaBaseFormValues>({
    resolver: zodResolver(plantillaBaseSchema),
    defaultValues: defaultValues ?? FORM_VACIO,
  });

  const { fields: hitosFields, append: appendHito, remove: removeHito } = useFieldArray({
    control: form.control,
    name: 'hitos',
  });

  const cultivosSeleccionados = useWatch({ control: form.control, name: 'cultivos' }) ?? [];

  const detallesQueries = useQueries({
    queries: cultivosSeleccionados.map((cultivo) => ({
      queryKey: cultivoBaseQueryKey(cultivo.id_cultivo_base),
      queryFn: () => cultivosService.obtenerDetalle(cultivo.id_cultivo_base),
    })),
  });

  const toggleCultivo = (id_cultivo_base: number, checked: boolean) => {
    const actuales = form.getValues('cultivos') ?? [];
    if (checked) {
      form.setValue(
        'cultivos',
        [...actuales, { id_cultivo_base, modo_variedades: 'todas', ids_variedades: [] }],
        { shouldDirty: true, shouldValidate: true },
      );
    } else {
      form.setValue(
        'cultivos',
        actuales.filter((c) => c.id_cultivo_base !== id_cultivo_base),
        { shouldDirty: true, shouldValidate: true },
      );
    }
  };

  const submit = async (values: PlantillaBaseFormValues) => {
    setVariedadConflictiva(null);
    try {
      await onGuardar(mapFormularioARequest(values));
    } catch (error) {
      handleFormError(error, form.setError, {
        onVarietyAlreadyAssigned: (id_variedad) => {
          setVariedadConflictiva(id_variedad ?? null);
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-8">
        <FormField
          control={form.control}
          name="nombre_pb"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la plantilla *</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Plan de Cultivo de Tomate" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <section>
          <h3 className="text-base font-semibold mb-2">Cultivos *</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Seleccioná uno o más cultivos. Para cada uno podés dejar &quot;Todas las variedades&quot; o elegir variedades específicas.
          </p>
          {cultivosDisponibles.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no hay cultivos en la biblioteca.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {cultivosDisponibles.map((cultivo) => {
                const seleccionado = cultivosSeleccionados.find(
                  (c) => c.id_cultivo_base === cultivo.id_cultivo_base,
                );
                const indexForm = cultivosSeleccionados.findIndex(
                  (c) => c.id_cultivo_base === cultivo.id_cultivo_base,
                );
                const detalle = detallesQueries.find(
                  (_, i) => cultivosSeleccionados[i]?.id_cultivo_base === cultivo.id_cultivo_base,
                )?.data;

                return (
                  <div key={cultivo.id_cultivo_base} className="border border-border rounded-xl p-4 bg-card">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={Boolean(seleccionado)}
                        onCheckedChange={(checked) => toggleCultivo(cultivo.id_cultivo_base, checked === true)}
                      />
                      <span className="font-medium">{cultivo.nombre_cultivo_base}</span>
                    </label>

                    {seleccionado && indexForm >= 0 && (
                      <div className="mt-4 pl-7 flex flex-col gap-3">
                        <p className="text-xs font-semibold text-muted-foreground tracking-wide">VARIEDADES</p>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="radio"
                              name={`variedades-${cultivo.id_cultivo_base}`}
                              className="accent-primary"
                              checked={seleccionado.modo_variedades === 'todas'}
                              onChange={() => {
                                form.setValue(`cultivos.${indexForm}.modo_variedades`, 'todas', {
                                  shouldDirty: true,
                                });
                                form.setValue(`cultivos.${indexForm}.ids_variedades`, [], {
                                  shouldDirty: true,
                                });
                              }}
                            />
                            Todas las variedades
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="radio"
                              name={`variedades-${cultivo.id_cultivo_base}`}
                              className="accent-primary"
                              checked={seleccionado.modo_variedades === 'especificas'}
                              onChange={() =>
                                form.setValue(`cultivos.${indexForm}.modo_variedades`, 'especificas', {
                                  shouldDirty: true,
                                })
                              }
                            />
                            Variedades específicas
                          </label>
                        </div>

                        {seleccionado.modo_variedades === 'especificas' && (
                          <div className="flex flex-col gap-2">
                            {(detalle?.variedades ?? []).length === 0 ? (
                              <p className="text-xs text-muted-foreground">
                                Este cultivo no tiene variedades cargadas.
                              </p>
                            ) : (
                              detalle?.variedades.map((variedad) => {
                                const checked = seleccionado.ids_variedades.includes(variedad.id_variedad);
                                const conflicto = variedadConflictiva === variedad.id_variedad;
                                return (
                                  <label
                                    key={variedad.id_variedad}
                                    className={`flex items-center gap-2 text-sm cursor-pointer rounded-md px-2 py-1 ${
                                      conflicto ? 'bg-destructive/10 ring-1 ring-destructive' : ''
                                    }`}
                                  >
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={(value) => {
                                        const actuales =
                                          form.getValues(`cultivos.${indexForm}.ids_variedades`) ?? [];
                                        form.setValue(
                                          `cultivos.${indexForm}.ids_variedades`,
                                          value === true
                                            ? [...actuales, variedad.id_variedad]
                                            : actuales.filter((id) => id !== variedad.id_variedad),
                                          { shouldDirty: true },
                                        );
                                      }}
                                    />
                                    {variedad.nombre_variedad}
                                  </label>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <FormField
            control={form.control}
            name="cultivos"
            render={() => (
              <FormItem className="mt-2">
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-base font-semibold">Cronograma</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() => appendHito({ nombre_hpb: '', tareas: [] })}
            >
              <HugeiconsIcon icon={Add01Icon} className="size-4" />
              Agregar hito
            </Button>
          </div>
          <FormField
            control={form.control}
            name="hitos"
            render={() => (
              <FormItem>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-4">
            {hitosFields.map((hito, hitoIndex) => (
              <HitoEditor
                key={hito.id}
                form={form}
                hitoIndex={hitoIndex}
                onRemove={() => removeHito(hitoIndex)}
                disabled={isPending}
              />
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : textoSubmit}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function HitoEditor({
  form,
  hitoIndex,
  onRemove,
  disabled,
}: {
  form: UseFormReturn<PlantillaBaseFormValues>;
  hitoIndex: number;
  onRemove: () => void;
  disabled: boolean;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `hitos.${hitoIndex}.tareas`,
  });

  const tareas = useWatch({ control: form.control, name: `hitos.${hitoIndex}.tareas` }) ?? [];

  return (
    <div className="border border-border rounded-xl p-4 bg-card flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <FormField
          control={form.control}
          name={`hitos.${hitoIndex}.nombre_hpb`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Nombre del hito *</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Siembra" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="button" variant="ghost" className="mt-7 text-destructive" onClick={onRemove} disabled={disabled}>
          <HugeiconsIcon icon={Delete02Icon} className="size-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Tareas</p>
        <Button type="button" variant="outline" size="sm" onClick={() => append(TAREA_VACIA)}>
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
          Agregar tarea
        </Button>
      </div>
      <FormField
        control={form.control}
        name={`hitos.${hitoIndex}.tareas`}
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />

      {fields.map((tarea, tareaIndex) => {
        const idTipo = Number(tareas[tareaIndex]?.id_tipo_tarea);
        const agroquimico = esAplicacionAgroquimico(idTipo);
        return (
          <div
            key={tarea.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start border-t border-border/50 pt-4"
          >
            <FormField
              control={form.control}
              name={`hitos.${hitoIndex}.tareas.${tareaIndex}.dia_relativo_tp`}
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Día relativo *</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`hitos.${hitoIndex}.tareas.${tareaIndex}.id_tipo_tarea`}
              render={({ field }) => (
                <FormItem className="md:col-span-3">
                  <FormLabel>Tipo de tarea *</FormLabel>
                  <FormControl>
                    <select className={SELECT_CLASS} {...field} value={field.value ?? ''}>
                      <option value="">Seleccioná un tipo</option>
                      {TIPO_TAREA_CATALOG.map((tipo) => (
                        <option key={tipo.id_tipo_tarea} value={tipo.id_tipo_tarea}>
                          {tipo.nombre_tipo_tarea}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`hitos.${hitoIndex}.tareas.${tareaIndex}.descripcion_tp`}
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel>Descripción *</FormLabel>
                  <FormControl>
                    <Input placeholder="Descripción de la tarea" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-1 flex md:justify-end md:pt-8">
              <Button type="button" variant="ghost" className="text-destructive" onClick={() => remove(tareaIndex)}>
                <HugeiconsIcon icon={Delete02Icon} className="size-4" />
              </Button>
            </div>
            {agroquimico && (
              <>
                <FormField
                  control={form.control}
                  name={`hitos.${hitoIndex}.tareas.${tareaIndex}.nombre_producto`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-6">
                      <FormLabel>Producto *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del producto" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`hitos.${hitoIndex}.tareas.${tareaIndex}.dosis_aa`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-5">
                      <FormLabel>Dosis *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. 2 L/ha" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
