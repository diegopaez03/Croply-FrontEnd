import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroupIcon } from "@hugeicons/core-free-icons";

import { rolesFincaService } from "@/services/roles.service";
import { RolFincaFormValues, rolFincaSchema } from "@/utils/validators";
import { handleFormError } from "@/utils/errorHandler";
import { CatalogoListaSimple } from "@/components/shared/CatalogoListaSimple";
import { RolFinca } from "@/types/roles.types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export function SeccionRolesFinca({ idFinca }: { idFinca: number }) {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedRole, setSelectedRole] = useState<RolFinca | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['rolesFinca', idFinca],
    queryFn: () => rolesFincaService.getRoles(idFinca),
  });

  const { data: permisosData, isLoading: isLoadingPermisos } = useQuery({
    queryKey: ['permisos-finca'],
    queryFn: rolesFincaService.getPermisos,
  });

  const form = useForm<RolFincaFormValues>({
    resolver: zodResolver(rolFincaSchema),
    defaultValues: {
      nombre_rol: "",
      descripcion: "",
      permisos: [],
    },
  });

  // ==========================================================================
  // MUTATIONS
  // ==========================================================================
  const saveRolMutation = useMutation({
    mutationFn: async (values: RolFincaFormValues) => {
      if (values.permisos.length === 0) {
        throw new Error("ERR_NO_PERMISSIONS");
      }

      let idRolToUse: number;

      if (selectedRole) {
        await rolesFincaService.updateRol(idFinca, selectedRole.id_rol, {
          nombre_rol: values.nombre_rol,
          descripcion: values.descripcion
        });
        idRolToUse = selectedRole.id_rol;
      } else {
        const res = await rolesFincaService.createRol(idFinca, {
          nombre_rol: values.nombre_rol,
          descripcion: values.descripcion
        }) as any;
        idRolToUse = res.id_rol;
      }

      try {
        await rolesFincaService.asignarPermisosFinca(idFinca, idRolToUse, { permisos: values.permisos });
      } catch (err) {
        throw new Error("ERR_PERMISSIONS_UPDATE_FAILED");
      }
      return "Rol guardado y configurado correctamente.";
    },
    onSuccess: (message) => {
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['rolesFinca', idFinca] });
      handleCloseModal();
    },
    onError: (error: any) => {
      if (error?.message === "ERR_NO_PERMISSIONS") {
        toast.error("Un rol debe contener al menos un permiso habilitado.", { duration: 4000 });
        form.setError("permisos", { message: "Un rol debe contener al menos un permiso habilitado." });
      } else if (error?.message === "ERR_PERMISSIONS_UPDATE_FAILED") {
        toast.error("El rol se guardó pero los permisos no pudieron actualizarse, reintentá.", { duration: 5000 });
        queryClient.invalidateQueries({ queryKey: ['rolesFinca', idFinca] });
      } else if (error?.response?.data?.errorCode === 'ERR-01') {
        toast.error(error.response.data.message);
        form.setError("permisos", { message: error.response.data.message });
      } else {
        handleFormError(error, form.setError);
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolesFincaService.deleteRol(idFinca, id),
    onSuccess: (res) => {
      toast.success(res.message || "Rol dado de baja correctamente");
      queryClient.invalidateQueries({ queryKey: ['rolesFinca', idFinca] });
      handleCloseDeleteModal();
    },
    onError: (error) => {
      handleFormError(error);
      handleCloseDeleteModal();
    },
  });

  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  const handleOpenModal = (role?: RolFinca) => {
    if (role) {
      setSelectedRole(role);
      form.reset({
        nombre_rol: role.nombre_rol,
        descripcion: role.descripcion || "",
        permisos: role.permisos || [],
      });
    } else {
      setSelectedRole(null);
      form.reset({
        nombre_rol: "",
        descripcion: "",
        permisos: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
    form.reset();
  };

  const onSubmit = (formData: RolFincaFormValues) => {
    saveRolMutation.mutate(formData);
  };

  const handleOpenDelete = (id: number | string) => {
    const role = data?.roles.find((r: RolFinca) => r.id_rol === id);
    if (role) {
      setSelectedRole(role);
      setIsDeleteModalOpen(true);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRole(null);
  };

  const confirmDelete = () => {
    if (selectedRole) {
      deleteMutation.mutate(selectedRole.id_rol);
    }
  };

  const items = data?.roles?.map((r: RolFinca) => ({
    id: r.id_rol,
    label: r.nombre_rol,
  })) || [];

  return (
    <>
      <CatalogoListaSimple
        icono={<HugeiconsIcon icon={UserGroupIcon} className="size-6 text-[#1c1c18]" />}
        titulo="Roles"
        descripcion="Gestión de los roles que seran aplicados a los usuarios"
        items={items}
        isLoading={isLoading}
        textoBotonAgregar="Agregar"
        onAgregar={() => handleOpenModal()}
        onEditar={(id) => {
          const role = data?.roles.find((r: RolFinca) => r.id_rol === id);
          if (role) handleOpenModal(role);
        }}
        onEliminar={handleOpenDelete}
      />

      {/* Modal Crear/Editar */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{selectedRole ? "Editar Rol" : "Crear Rol"}</DialogTitle>
                <DialogDescription>
                  {selectedRole ? 'Modificá los datos del rol.' : 'Completá los datos para crear un nuevo rol.'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="nombre_rol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Administrador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Breve descripción de los accesos..." 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="permisos"
                  render={() => (
                    <FormItem>
                      <div className="mb-4 mt-2">
                        <FormLabel className="text-base">Permisos</FormLabel>
                        <DialogDescription>
                          Seleccioná los módulos a los que este rol tendrá acceso.
                        </DialogDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isLoadingPermisos ? (
                          <div className="text-sm text-muted-foreground">Cargando permisos...</div>
                        ) : (
                          permisosData?.permisos.map((permiso: any) => (
                            <FormField
                              key={permiso.id_permiso}
                              control={form.control}
                              name="permisos"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={permiso.id_permiso}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(permiso.id_permiso)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), permiso.id_permiso])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value: number) => value !== permiso.id_permiso
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {permiso.nombre_permiso}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseModal} disabled={saveRolMutation.isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveRolMutation.isPending}>
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Deseás eliminar este rol?</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Al confirmar, el rol se dará de baja y no podrá ser asignado a nuevos usuarios.
            Los usuarios actuales podrían perder sus accesos.
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseDeleteModal}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              Sí, eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
