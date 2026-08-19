import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { HugeiconsIcon } from "@hugeicons/react";
import { Wifi01Icon } from "@hugeicons/core-free-icons";

import { useTiposSensor, useTiposSensorMutations } from "@/hooks/useTiposSensor";
import { CatalogoListaSimple } from "@/components/shared/CatalogoListaSimple";
import { TipoSensor } from "@/types/tiposSensor.types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const tipoSensorSchema = z.object({
  codigo_tipo_sensor: z.string().min(1, "Debe seleccionar un código de integración."),
  nombre_tipo_sensor: z.string().min(1, "El nombre es obligatorio."),
  unidad_medida_ts: z.string().min(1, "La unidad de medida es obligatoria."),
});

type TipoSensorFormValues = z.infer<typeof tipoSensorSchema>;

const DICCIONARIO_SUGERENCIAS: Record<string, { nombre: string; unidad: string }> = {
  "TEMP_HUME_AMBIENTAL": { nombre: "Temperatura y Humedad Ambiental", unidad: "°C / %" },
  "HUMEDAD_SUELO": { nombre: "Humedad de Suelo", unidad: "%" },
  "RADIACION_SOLAR": { nombre: "Radiación Solar", unidad: "W/m²" },
  "PRECIPITACION": { nombre: "Precipitación", unidad: "mm" },
  "PH": { nombre: "pH del Suelo", unidad: "pH" },
};

export function SeccionTiposSensor() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<TipoSensor | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  const { query: { data, isLoading }, codigosQuery: { data: codigosData } } = useTiposSensor();

  const form = useForm<TipoSensorFormValues>({
    resolver: zodResolver(tipoSensorSchema),
    defaultValues: {
      codigo_tipo_sensor: "",
      nombre_tipo_sensor: "",
      unidad_medida_ts: "",
    },
  });

  const { createMutation, updateMutation, deleteMutation } = useTiposSensorMutations(
    () => handleCloseModal(),
    form.setError,
    setDeleteErrorMsg
  );

  const watchCodigo = form.watch("codigo_tipo_sensor");
  
  useEffect(() => {
    // Solo sugerir automáticamente en creación (no si estamos editando) 
    // y si no hemos tocado aún los campos o si están vacíos.
    if (!selectedSensor && watchCodigo) {
      const sugerencia = DICCIONARIO_SUGERENCIAS[watchCodigo];
      if (sugerencia) {
        // Usamos setValue en lugar de reset para no borrar errores, pero solo rellenamos si está vacío o si queremos sobreescribir.
        // Lo más amigable es sobreescribir para ayudar al usuario a no escribir todo a mano, ya que él mismo acaba de cambiar el Select.
        form.setValue("nombre_tipo_sensor", sugerencia.nombre, { shouldValidate: true });
        form.setValue("unidad_medida_ts", sugerencia.unidad, { shouldValidate: true });
      }
    }
  }, [watchCodigo, selectedSensor, form]);

  const handleOpenModal = (sensor?: TipoSensor) => {
    if (sensor) {
      setSelectedSensor(sensor);
      form.reset({
        codigo_tipo_sensor: sensor.codigo_tipo_sensor,
        nombre_tipo_sensor: sensor.nombre_tipo_sensor,
        unidad_medida_ts: sensor.unidad_medida_ts,
      });
    } else {
      setSelectedSensor(null);
      form.reset({
        codigo_tipo_sensor: "",
        nombre_tipo_sensor: "",
        unidad_medida_ts: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSensor(null);
    form.reset();
  };

  const handleOpenDelete = (sensorId: number | string) => {
    const sensor = data?.tipos_sensor.find((s) => s.id_tipo_sensor === sensorId);
    if (sensor) {
      setSelectedSensor(sensor);
      setDeleteErrorMsg(null);
      setIsDeleteModalOpen(true);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedSensor(null);
    setDeleteErrorMsg(null);
  };

  const onSubmit = (values: TipoSensorFormValues) => {
    if (selectedSensor) {
      updateMutation.mutate({ id: selectedSensor.id_tipo_sensor, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const confirmDelete = () => {
    if (selectedSensor) {
      setDeleteErrorMsg(null);
      deleteMutation.mutate(selectedSensor.id_tipo_sensor, {
        onSuccess: () => {
          handleCloseDeleteModal();
        }
      });
    }
  };

  const items = data?.tipos_sensor.map((s) => ({
    id: s.id_tipo_sensor,
    label: `${s.nombre_tipo_sensor} (${s.unidad_medida_ts})`,
  })) || [];

  return (
    <>
      <CatalogoListaSimple
        icono={<HugeiconsIcon icon={Wifi01Icon} className="size-6" />}
        titulo="Tipos de Sensores Base"
        descripcion="Gestión de los dispositivos de monitoreo climático y de suelo compatibles con el sistema."
        items={items}
        isLoading={isLoading}
        textoBotonAgregar="Agregar"
        onAgregar={() => handleOpenModal()}
        onEditar={(id) => {
          const sensor = data?.tipos_sensor.find((s) => s.id_tipo_sensor === id);
          if (sensor) handleOpenModal(sensor);
        }}
        onEliminar={handleOpenDelete}
      />

      {/* Modal Crear/Editar */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-[425px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{selectedSensor ? "Editar Tipo de Sensor" : "Nuevo Tipo de Sensor"}</DialogTitle>
                <DialogDescription>
                  {selectedSensor ? "Modificá los datos del tipo de sensor." : "Completá los datos para registrar un nuevo tipo de sensor."}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="codigo_tipo_sensor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de Integración IoT</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccioná un código soportado..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {codigosData?.codigos_tipo_sensor.map((codigo) => (
                            <SelectItem key={codigo} value={codigo}>
                              {codigo}
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
                  name="nombre_tipo_sensor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Sensor de pH" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unidad_medida_ts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidad de Medida</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. pH, %, °C" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseModal} disabled={createMutation.isPending || updateMutation.isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {selectedSensor ? "Guardar cambios" : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Eliminar */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={(open) => !open && handleCloseDeleteModal()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que querés dar de baja este tipo de sensor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {deleteErrorMsg && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20 mt-2">
              {deleteErrorMsg}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending} onClick={handleCloseDeleteModal}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleteMutation.isPending}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
