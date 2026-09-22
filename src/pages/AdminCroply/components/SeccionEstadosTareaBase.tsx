import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckListIcon } from "@hugeicons/core-free-icons";

import { useEstadosTarea, useEstadosTareaMutations } from "@/hooks/useEstadosTarea";
import { CatalogoListaSimple } from "@/components/shared/CatalogoListaSimple";
import { EstadoTarea } from "@/types/estadosTarea.types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const estadoTareaSchema = z.object({
  nombre_estado_tarea: z.string().min(1, "El nombre es obligatorio."),
});

type EstadoTareaFormValues = z.infer<typeof estadoTareaSchema>;

export function SeccionEstadosTareaBase() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState<EstadoTarea | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  const { query: { data, isLoading } } = useEstadosTarea();

  const form = useForm<EstadoTareaFormValues>({
    resolver: zodResolver(estadoTareaSchema),
    defaultValues: {
      nombre_estado_tarea: "",
    },
  });

  const { createMutation, updateMutation, deleteMutation } = useEstadosTareaMutations(
    () => handleCloseModal(),
    form.setError,
    setDeleteErrorMsg
  );

  const handleOpenModal = (estado?: EstadoTarea) => {
    if (estado) {
      setSelectedEstado(estado);
      form.reset({
        nombre_estado_tarea: estado.nombre_estado_tarea,
      });
    } else {
      setSelectedEstado(null);
      form.reset({
        nombre_estado_tarea: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEstado(null);
    form.reset();
  };

  const handleOpenDelete = (estadoId: number | string) => {
    const estado = data?.estados_tarea.find((e) => e.id_estado_tarea === estadoId);
    if (estado) {
      setSelectedEstado(estado);
      setDeleteErrorMsg(null);
      setIsDeleteModalOpen(true);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedEstado(null);
    setDeleteErrorMsg(null);
  };

  const onSubmit = (values: EstadoTareaFormValues) => {
    if (selectedEstado) {
      updateMutation.mutate({ id: selectedEstado.id_estado_tarea, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const confirmDelete = () => {
    if (selectedEstado) {
      setDeleteErrorMsg(null);
      deleteMutation.mutate(selectedEstado.id_estado_tarea, {
        onSuccess: () => {
          handleCloseDeleteModal();
        }
      });
    }
  };

  const getBadgeColor = (e: EstadoTarea) => {
    if (e.cuenta_para_cierre_exitoso) return "bg-green-50 text-green-700";   // Completado
    if (e.es_estado_finalizador) return "bg-yellow-50 text-yellow-800";      // Cancelada (y futuros terminales sin éxito)
    if (e.protegido) return "bg-muted text-muted-foreground";                // Planificado (el gris que ya tenía)
    return "bg-blue-50 text-blue-800";                                       // En Progreso y cualquier estado nuevo que se cree
  };

  const items = data?.estados_tarea.map((e) => ({
    id: e.id_estado_tarea,
    label: e.nombre_estado_tarea,
    pillColor: getBadgeColor(e),
  })) || [];

  return (
    <>
      <CatalogoListaSimple
        icono={<HugeiconsIcon icon={CheckListIcon} className="size-6" />}
        titulo="Estados de tareas base"
        descripcion="Listado de ciclo de vida de las tareas utilizadas en los planes de accion"
        items={items}
        isLoading={isLoading}
        textoBotonAgregar="Agregar"
        onAgregar={() => handleOpenModal()}
        onEditar={(id) => {
          const estado = data?.estados_tarea.find((e) => e.id_estado_tarea === id);
          if (estado) handleOpenModal(estado);
        }}
        onEliminar={handleOpenDelete}
      />

      {/* Modal Crear/Editar */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-[425px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{selectedEstado ? "Editar Estado de Tarea" : "Nuevo Estado de Tarea"}</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="nombre_estado_tarea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. En Progreso" {...field} />
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
                  Guardar
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
            <AlertDialogTitle>¿Estás seguro que deseás dar de baja este estado de tarea?</AlertDialogTitle>
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
            {!deleteErrorMsg && (
              <AlertDialogCancel disabled={deleteMutation.isPending} onClick={handleCloseDeleteModal}>
                Cancelar
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              className={deleteErrorMsg 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
              onClick={(e) => {
                e.preventDefault();
                if (deleteErrorMsg) {
                  handleCloseDeleteModal();
                } else {
                  confirmDelete();
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteErrorMsg ? "Aceptar" : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
