import { useState } from 'react';
import { useFieldArray, useForm, useWatch, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueries } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { plantillaBaseSchema, PlantillaBaseFormValues } from '@/utils/validators';
import { mapFormularioARequest } from '@/utils/plantilla-form.mapper';
import { useTiposTarea } from '@/hooks/useTiposTarea';
import { useCultivosBase, cultivoBaseQueryKey } from '@/hooks/useCultivosBase';
import { cultivosService } from '@/services/cultivos.service';
import { CrearPlantillaBaseRequest } from '@/types/plantillas.types';
import { handleFormError } from '@/utils/errorHandler';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  const { query: tiposTareaQuery } = useTiposTarea();
  const tiposTarea = tiposTareaQuery.data?.tipos_tarea ?? [];

  const form = useForm<PlantillaBaseFormValues>({
    resolver: zodResolver(plantillaBaseSchema),
    defaultValues: defaultValues ?? FORM_VACIO,
  });

  const { fields: cultivosFields, append: appendCultivo, remove: removeCultivo, update: updateCultivo } = useFieldArray({
    control: form.control,
    name: 'cultivos',
  });

  // Si no hay defaultValues.cultivos ni cultivosFields (recién abre vacío), arranca con 1 slot
  const [emptySlots, setEmptySlots] = useState<string[]>(
    defaultValues?.cultivos && defaultValues.cultivos.length > 0 ? [] : [Math.random().toString()]
  );

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

  const handleSelectEmptySlot = (slotId: string, idCultivo: number) => {
    // 1. Lo quitamos de emptySlots
    setEmptySlots(prev => prev.filter(id => id !== slotId));
    // 2. Lo agregamos al array real validado de RHF
    appendCultivo({ id_cultivo_base: idCultivo, modo_variedades: 'todas', ids_variedades: [] });
  };

  const handleAddEmptySlot = () => {
    setEmptySlots(prev => [...prev, Math.random().toString()]);
  };

  const handleDeleteEmptySlot = (slotId: string) => {
    setEmptySlots(prev => {
      const remaining = prev.filter(id => id !== slotId);
      // Nunca dejamos todo vacío: si borramos el último slot y no hay validos, creamos uno nuevo
      if (remaining.length === 0 && cultivosFields.length === 0) {
        return [Math.random().toString()];
      }
      return remaining;
    });
  };

  const handleDeleteCultivo = (index: number) => {
    removeCultivo(index);
    // Si al borrar el último RHF queda vacío y no hay slots vacíos, creamos uno
    if (cultivosFields.length === 1 && emptySlots.length === 0) {
      setEmptySlots([Math.random().toString()]);
    }
  };

  const submit = async (values: PlantillaBaseFormValues) => {
    setVariedadConflictiva(null);
    try {
      await onGuardar(mapFormularioARequest(values, tiposTarea));
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
      <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-4">
        <section className="bg-card border border-border rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-1">Nombre de la plantilla *</h3>
            <p className="text-sm text-muted-foreground">
              Ingresá un nombre descriptivo para identificar esta plantilla de trabajo.
            </p>
          </div>
          <FormField
            control={form.control}
            name="nombre_pb"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Ej. Plan de Cultivo de Tomate" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="bg-card border border-border rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-1">Cultivos *</h3>
            <p className="text-sm text-muted-foreground">
              Seleccioná uno o más cultivos y definí sus variedades.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Filas válidas (React Hook Form) */}
            {cultivosSeleccionados.map((seleccionado, indexForm) => {
              const cultivo = cultivosDisponibles.find(c => c.id_cultivo_base === seleccionado.id_cultivo_base);
              if (!cultivo) return null;
              
              const detalle = detallesQueries.find(
                (_, i) => cultivosSeleccionados[i]?.id_cultivo_base === cultivo.id_cultivo_base,
              )?.data;

              return (
                <div key={`rhf-${seleccionado.id_cultivo_base}-${indexForm}`} className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8 border border-border rounded-xl p-4 bg-muted/20 relative">
                  {/* Select del Cultivo */}
                  <div className="w-full sm:w-[250px] shrink-0 flex flex-col gap-1">
                    <Select 
                      value={String(cultivo.id_cultivo_base)}
                      onValueChange={(val) => {
                        const newId = Number(val);
                        updateCultivo(indexForm, { id_cultivo_base: newId, modo_variedades: 'todas', ids_variedades: [] });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cultivo..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={String(cultivo.id_cultivo_base)}>
                          {cultivo.nombre_cultivo_base}
                        </SelectItem>
                        {cultivosDisponibles
                          .filter(c => !cultivosSeleccionados.some(sel => sel.id_cultivo_base === c.id_cultivo_base))
                          .map(c => (
                            <SelectItem key={c.id_cultivo_base} value={String(c.id_cultivo_base)}>
                              {c.nombre_cultivo_base}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lado derecho: Variedades */}
                  <div className="flex-1 flex flex-col gap-3 min-w-0 pr-8 sm:pr-4 mt-2 sm:mt-0">
                    <div className="w-full sm:w-[250px]">
                      <Select
                        value={seleccionado.modo_variedades}
                        onValueChange={(val: 'todas' | 'especificas') => {
                          form.setValue(`cultivos.${indexForm}.modo_variedades`, val, {
                            shouldDirty: true,
                          });
                          if (val === 'todas') {
                            form.setValue(`cultivos.${indexForm}.ids_variedades`, [], {
                              shouldDirty: true,
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Variedades..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas las variedades</SelectItem>
                          <SelectItem value="especificas">Variedades específicas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {seleccionado.modo_variedades === 'especificas' && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(detalle?.variedades ?? []).length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            Este cultivo no tiene variedades cargadas. Seleccione "Todas las variedades" o cargue variedades en el catálogo de cultivos.
                          </p>
                        ) : (
                          detalle?.variedades.map((variedad) => {
                            const checked = seleccionado.ids_variedades.includes(variedad.id_variedad);
                            const conflicto = variedadConflictiva === variedad.id_variedad;
                            return (
                              <label
                                key={variedad.id_variedad}
                                className={`flex items-center gap-2 text-sm cursor-pointer rounded-md px-2 py-1 ${
                                  conflicto ? 'bg-destructive/10 ring-1 ring-destructive' : 'bg-background border border-border'
                                }`}
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(value) => {
                                    const actuales = form.getValues(`cultivos.${indexForm}.ids_variedades`) ?? [];
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

                  {/* Quitar fila */}
                  <button
                    type="button"
                    onClick={() => handleDeleteCultivo(indexForm)}
                    className="absolute top-4 right-4 sm:static sm:mt-1.5 text-muted-foreground hover:text-destructive flex items-center justify-center shrink-0"
                    title="Quitar fila"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="size-5" />
                  </button>
                </div>
              );
            })}

            {/* Slots Vacíos (Estado Local) */}
            {emptySlots.map((slotId) => (
              <div key={slotId} className="flex flex-col sm:flex-row items-start gap-4 border border-border border-dashed rounded-xl p-4 bg-transparent relative">
                <div className="w-full sm:w-[250px] shrink-0">
                  <Select 
                    value=""
                    onValueChange={(val) => handleSelectEmptySlot(slotId, Number(val))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cultivo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cultivosDisponibles
                        .filter(c => !cultivosSeleccionados.some(sel => sel.id_cultivo_base === c.id_cultivo_base))
                        .map(c => (
                          <SelectItem key={c.id_cultivo_base} value={String(c.id_cultivo_base)}>
                            {c.nombre_cultivo_base}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 min-w-0 pr-8 sm:pr-4 sm:pt-2 mt-2 sm:mt-0">
                  <p className="text-sm text-muted-foreground">Elegí un cultivo para configurar sus variedades...</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteEmptySlot(slotId)}
                  className="absolute top-4 right-4 sm:static sm:mt-1.5 text-muted-foreground hover:text-destructive flex items-center justify-center shrink-0"
                  title="Quitar fila"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-5" />
                </button>
              </div>
            ))}

            <div className="flex justify-start mt-2">
              <Button type="button" variant="default" onClick={handleAddEmptySlot}>
                <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
                Agregar cultivo
              </Button>
            </div>
          </div>
          
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

        <section className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-semibold mb-1">Cronograma</h3>
              <p className="text-sm text-muted-foreground">
                Definí los hitos y tareas a lo largo del tiempo.
              </p>
            </div>
            <Button
              type="button"
              variant="default"
              onClick={() => appendHito({ nombre_hpb: '', tareas: [] })}
            >
              <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
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
                tiposTarea={tiposTarea}
                onRemove={() => removeHito(hitoIndex)}
                disabled={isPending}
              />
            ))}
            {hitosFields.length === 0 && (
              <p className="text-sm text-muted-foreground italic text-center py-4">
                No hay hitos definidos.
              </p>
            )}
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {textoSubmit}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function HitoEditor({
  form,
  hitoIndex,
  tiposTarea,
  onRemove,
  disabled,
}: {
  form: UseFormReturn<PlantillaBaseFormValues>;
  hitoIndex: number;
  tiposTarea: { id_tipo_tarea: number, es_tipo_agroquimico: boolean, nombre_tipo_tarea: string }[];
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
        <p className="text-sm font-semibold">Tareas</p>
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
        const agroquimico = tiposTarea.find(t => t.id_tipo_tarea === idTipo)?.es_tipo_agroquimico ?? false;
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
                      {tiposTarea.map((tipo) => (
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
