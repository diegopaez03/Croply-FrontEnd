import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

import { useTiposTarea, useTiposTareaMutations } from "@/hooks/useTiposTarea";
import { CatalogoListaSimple } from "@/components/shared/CatalogoListaSimple";
import { TipoTarea } from "@/types/tiposTarea.types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const tipoTareaSchema = z.object({
  nombre_tipo_tarea: z.string().min(1, "El nombre es obligatorio."),
});

type TipoTareaFormValues = z.infer<typeof tipoTareaSchema>;

export function SeccionTiposTareaBase() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoTarea | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  const { query: { data, isLoading } } = useTiposTarea();

  const form = useForm<TipoTareaFormValues>({
    resolver: zodResolver(tipoTareaSchema),
    defaultValues: {
      nombre_tipo_tarea: "",
    },
  });

  const { createMutation, updateMutation, deleteMutation } = useTiposTareaMutations(
    () => handleCloseModal(),
    form.setError,
    setDeleteErrorMsg
  );

  const handleOpenModal = (tipo?: TipoTarea) => {
    if (tipo) {
      setSelectedTipo(tipo);
      form.reset({
        nombre_tipo_tarea: tipo.nombre_tipo_tarea,
      });
    } else {
      setSelectedTipo(null);
      form.reset({
        nombre_tipo_tarea: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTipo(null);
    form.reset();
  };

  const handleOpenDelete = (tipoId: number | string) => {
    const tipo = data?.tipos_tarea.find((t) => t.id_tipo_tarea === tipoId);
    if (tipo) {
      setSelectedTipo(tipo);
      setDeleteErrorMsg(null);
      setIsDeleteModalOpen(true);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedTipo(null);
    setDeleteErrorMsg(null);
  };

  const onSubmit = (values: TipoTareaFormValues) => {
    if (selectedTipo) {
      updateMutation.mutate({ id: selectedTipo.id_tipo_tarea, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const confirmDelete = () => {
    if (selectedTipo) {
      setDeleteErrorMsg(null);
      deleteMutation.mutate(selectedTipo.id_tipo_tarea, {
        onSuccess: () => {
          handleCloseDeleteModal();
        }
      });
    }
  };

  const items = data?.tipos_tarea.map((t) => ({
    id: t.id_tipo_tarea,
    label: t.nombre_tipo_tarea,
  })) || [];

  return (
    <>
      <CatalogoListaSimple
        icono={<HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-6" />}
        titulo="Tipos de Tareas Base"
        descripcion="Gestión de los tipos de actividades disponibles para los planes de acción."
        items={items}
        isLoading={isLoading}
        textoBotonAgregar="Agregar"
        onAgregar={() => handleOpenModal()}
        onEditar={(id) => {
          const tipo = data?.tipos_tarea.find((t) => t.id_tipo_tarea === id);
          if (tipo) handleOpenModal(tipo);
        }}
        onEliminar={handleOpenDelete}
      />

      {/* Modal Crear/Editar */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-[425px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{selectedTipo ? "Editar Tipo de Tarea" : "Nuevo Tipo de Tarea"}</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="nombre_tipo_tarea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Siembra" {...field} />
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
            <AlertDialogTitle>¿Estás seguro que deseás dar de baja este tipo de tarea?</AlertDialogTitle>
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
