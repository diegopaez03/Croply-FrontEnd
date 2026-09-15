import { useFieldArray, useFormContext, Control, FieldValues } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../../../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon, Delete02Icon, Settings01Icon, CellularNetworkIcon } from '@hugeicons/core-free-icons';
import { TipoSensor } from '../../../types/tiposSensor.types';

interface DispositivosIoTFieldsProps {
  /**
   * Ruta base en el formulario (ej: "controladores" o "parcelas.0.controladores")
   */
  namePrefix: string;
  /**
   * Catálogo de tipos de sensor para el dropdown
   */
  tiposSensor: TipoSensor[];
}

export function DispositivosIoTFields({ namePrefix, tiposSensor }: DispositivosIoTFieldsProps) {
  // Con namePrefix genérico (string) perdemos inferencia estricta en useFieldArray.
  // Es una decisión consciente ya que el componente se reutiliza para distintos esquemas (FincaCrearFormValues vs CrearEditarParcelaFormValues).
  const { control, formState: { errors } } = useFormContext<FieldValues>();
  
  const getArrayError = (errObj: any, path: string) => {
    const parts = path.split('.');
    let current = errObj;
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return current?.root?.message || current?.message;
  };
  
  const controladoresError = getArrayError(errors, namePrefix) as string | undefined;
  
  const { fields: controllerFields, append: appendController, remove: removeController } = useFieldArray({
    control,
    name: namePrefix,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-foreground">
          <HugeiconsIcon icon={Settings01Icon} className="size-5 text-primary" strokeWidth={1.5} />
          <h4 className="font-bold text-base">Controladores IoT</h4>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendController({ nombre_controlador: '', ip_controlador: '', sensores: [] }, { shouldFocus: false })}
          className="h-9 gap-2 text-primary border-primary/20 hover:bg-primary/5"
        >
          <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
          Añadir Controlador
        </Button>
      </div>
      {controladoresError && (
        <p className="text-sm font-medium text-destructive mt-1">{controladoresError}</p>
      )}

      {controllerFields.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border rounded-xl bg-muted/10">
          <HugeiconsIcon icon={Settings01Icon} className="size-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Sin controladores asignados</p>
          <p className="text-xs text-muted-foreground mt-1">Podés agregarlos luego de crear la parcela.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {controllerFields.map((ctrl, cIndex) => (
            <div key={ctrl.id} className="bg-muted/30 border border-border rounded-xl p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mr-4">
                  <FormField
                    control={control}
                    name={`${namePrefix}.${cIndex}.nombre_controlador`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Identificador / Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Controlador Riego 1" className="h-10 bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`${namePrefix}.${cIndex}.ip_controlador`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Dirección IP (Red local)</FormLabel>
                        <FormControl>
                          <Input placeholder="192.168.1.100" className="h-10 bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 mt-6"
                  onClick={() => removeController(cIndex)}
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-5" />
                </Button>
              </div>

              {/* Componente anidado para sensores */}
              <SensoresList
                control={control}
                controladorPrefix={`${namePrefix}.${cIndex}`}
                tiposSensor={tiposSensor}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface SensoresListProps {
  control: Control<FieldValues>;
  controladorPrefix: string;
  tiposSensor: TipoSensor[];
}

function SensoresList({ control, controladorPrefix, tiposSensor }: SensoresListProps) {
  const { formState: { errors } } = useFormContext<FieldValues>();
  
  const getArrayError = (errObj: any, path: string) => {
    const parts = path.split('.');
    let current = errObj;
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return current?.root?.message || current?.message;
  };
  
  const sensoresError = getArrayError(errors, `${controladorPrefix}.sensores`) as string | undefined;

  const { fields: sensorFields, append: appendSensor, remove: removeSensor } = useFieldArray({
    control,
    name: `${controladorPrefix}.sensores`,
  });

  return (
    <div className="pl-4 ml-2 border-l-2 border-primary/20 space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <HugeiconsIcon icon={CellularNetworkIcon} className="size-3.5" />
          Sensores conectados
        </h5>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => appendSensor({ id_tipo_sensor: undefined, profundidad_instalacion: undefined }, { shouldFocus: false })}
          className="h-7 text-xs px-2 text-primary hover:bg-primary/10"
        >
          <HugeiconsIcon icon={PlusSignIcon} className="size-3 mr-1" />
          Añadir Sensor
        </Button>
      </div>
      {sensoresError && (
        <p className="text-xs font-medium text-destructive mt-1">{sensoresError}</p>
      )}

      {sensorFields.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-1">Sin sensores registrados en este controlador.</p>
      ) : (
        <div className="space-y-2">
          {sensorFields.map((sens, sIndex) => (
            <div key={sens.id} className="flex items-start gap-3 bg-background p-2.5 rounded-lg border border-border/50">
              <FormField
                control={control}
                name={`${controladorPrefix}.sensores.${sIndex}.id_tipo_sensor`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 bg-muted/30">
                          <SelectValue placeholder="Tipo de sensor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tiposSensor.map(ts => (
                          <SelectItem key={ts.id_tipo_sensor} value={String(ts.id_tipo_sensor)}>
                            {ts.nombre_tipo_sensor} ({ts.codigo_tipo_sensor})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`${controladorPrefix}.sensores.${sIndex}.ip_sensor`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="IP de puerto/sensor" className="h-9 bg-muted/30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => removeSensor(sIndex)}
              >
                <HugeiconsIcon icon={Delete02Icon} className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
