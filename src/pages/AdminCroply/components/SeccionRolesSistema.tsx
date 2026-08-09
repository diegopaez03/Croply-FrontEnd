import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroupIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { rolesService } from "@/services/roles.service";
import { CatalogoListaSimple } from "@/components/shared/CatalogoListaSimple";
import { getPermisoIds, RolSistema } from "@/types/roles.types";
import { rolSchema, RolFormValues } from "@/utils/validators";
import { handleFormError } from "@/utils/errorHandler";
import { showSuccessToast } from "@/utils/successHandler";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export function SeccionRolesSistema() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RolSistema | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['rolesSistema'],
    queryFn: rolesService.getRolesSistema,
  });

  const { data: permisosData, isLoading: isLoadingPermisos } = useQuery({
    queryKey: ['permisos-sistema'],
    queryFn: rolesService.getPermisos,
  });

  const form = useForm<RolFormValues>({
    resolver: zodResolver(rolSchema),
    defaultValues: {
      nombre_rol: "",
      descripcion: "",
      permisos: [],
    },
  });

  const saveRolMutation = useMutation({
    mutationFn: async (values: RolFormValues) => {
      // Si el array de permisos está vacío, se rechaza
      if (values.permisos.length === 0) {
        throw new Error("ERR_NO_PERMISSIONS");
      }

      let idRolToUse: number;

      // 1. Crear o actualizar rol
      if (selectedRole) {
        await rolesService.updateRolSistema(selectedRole.id_rol, {
          nombre_rol: values.nombre_rol,
          descripcion: values.descripcion
        });
        idRolToUse = selectedRole.id_rol;
      } else {
        const res = await rolesService.createRolSistema({
          nombre_rol: values.nombre_rol,
          descripcion: values.descripcion
        }) as any;
        idRolToUse = res.id_rol;
      }

      // 2. Asignar permisos
      try {
        await rolesService.asignarPermisosSistema(idRolToUse, { permisos: values.permisos });
      } catch (err) {
        throw new Error("ERR_PERMISSIONS_UPDATE_FAILED");
      }
      return "Rol guardado y configurado correctamente.";
    },
    onSuccess: (message) => {
      showSuccessToast(message);
      queryClient.invalidateQueries({ queryKey: ['rolesSistema'] });
      handleCloseModal();
    },
    onError: (error: any) => {
      if (error?.message === "ERR_NO_PERMISSIONS") {
        toast.error("Un rol debe contener al menos un permiso habilitado.", { duration: 4000 });
        form.setError("permisos", { message: "Un rol debe contener al menos un permiso habilitado." });
      } else if (error?.message === "ERR_PERMISSIONS_UPDATE_FAILED") {
        toast.error("El rol se guardó pero los permisos no pudieron actualizarse, reintentá.", { duration: 5000 });
        queryClient.invalidateQueries({ queryKey: ['rolesSistema'] });
      } else if (error?.response?.data?.errorCode === 'ERR-01') {
        toast.error(error.response.data.message);
        form.setError("permisos", { message: error.response.data.message });
      } else {
        handleFormError(error, form.setError);
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolesService.deleteRolSistema(id),
    onSuccess: (res) => {
      showSuccessToast(res.message);
      queryClient.invalidateQueries({ queryKey: ['rolesSistema'] });
      setIsDeleteModalOpen(false);
      setSelectedRole(null);
    },
    onError: (error) => handleFormError(error)
  });

  const handleOpenModal = (role?: RolSistema) => {
    if (role) {
      setSelectedRole(role);
      form.reset({
        nombre_rol: role.nombre_rol,
        descripcion: role.descripcion || "",
        permisos: getPermisoIds(role.permisos),
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

  const onSubmit = (values: RolFormValues) => {
    saveRolMutation.mutate(values);
  };

  const handleOpenDelete = (roleId: number | string) => {
    const role = data?.roles.find(r => r.id_rol === roleId);
    if (role) {
      setSelectedRole(role);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (selectedRole) {
      deleteMutation.mutate(selectedRole.id_rol);
    }
  };

  const items = data?.roles.map(r => ({
    id: r.id_rol,
    label: r.nombre_rol
  })) || [];

  return (
    <>
      <CatalogoListaSimple
        icono={<HugeiconsIcon icon={UserGroupIcon} className="size-6" />}
        titulo="Roles"
        descripcion="Gestión de los roles que serán aplicados a los usuarios"
        items={items}
        isLoading={isLoading}
        textoBotonAgregar="Agregar"
        onAgregar={() => handleOpenModal()}
        onEditar={(id) => {
          const role = data?.roles.find(r => r.id_rol === id);
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
                <DialogTitle>{selectedRole ? 'Editar Rol' : 'Agregar Rol'}</DialogTitle>
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
                      <FormLabel>Nombre</FormLabel>
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
                          permisosData?.permisos.map((permiso) => (
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
                                                  (value) => value !== permiso.id_permiso
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
            <DialogTitle>¿Estás seguro que deseás dar de baja este rol?</DialogTitle>
            <DialogDescription>
              {selectedRole?.cantidad_usuarios_asignados && selectedRole.cantidad_usuarios_asignados > 0 
                ? "Este rol tiene usuarios asignados. Si lo das de baja, esos usuarios mantendrán su acceso a la plataforma pero perderán los permisos asociados hasta que se les asigne un nuevo rol. ¿Deseás continuar?"
                : "Esta acción no se puede deshacer y el rol ya no estará disponible."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={deleteMutation.isPending}>Cancelar</Button>
            <Button 
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                confirmDelete();
              }}
              variant="destructive"
              disabled={deleteMutation.isPending}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

