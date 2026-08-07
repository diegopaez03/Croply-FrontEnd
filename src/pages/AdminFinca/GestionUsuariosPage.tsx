import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sent02Icon, InformationCircleIcon, CheckmarkCircle02Icon, CancelCircleIcon, PencilEdit02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { SeccionRolesFinca } from "./components/SeccionRolesFinca";
import { SearchBar } from "@/components/shared/SearchBar";
import { TablaConPaginacion, ColumnDef } from "@/components/shared/TablaConPaginacion";
import { EditarUsuarioModal } from "@/components/shared/EditarUsuarioModal";
import { InvitarUsuarioModal } from "./components/InvitarUsuarioModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { usuariosService } from "@/services/usuarios.service";
import { rolesFincaService } from "@/services/roles.service";
import { UsuarioListado } from "@/types/usuarios.types";

export default function GestionUsuariosPage() {
  const { usuario } = useAuth();
  
  // TODO: Este código asume una sola finca por Admin de Finca. Si el negocio permite multi-finca (confirmar con backend/producto), 
  // hay que agregar un selector de finca activa antes de usar esta lógica en cualquier pantalla scoped a finca.
  const idFinca = usuario?.fincas?.[0]?.id_finca;

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const [idRol, setIdRol] = useState<string>('todos');
  const [estado, setEstado] = useState<string>('todos');
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioListado | null>(null);
  const [isInvitarModalOpen, setIsInvitarModalOpen] = useState(false);

  // Queries
  const { data: rolesData } = useQuery({
    queryKey: ['rolesFinca', idFinca],
    queryFn: () => rolesFincaService.getRoles(idFinca!),
    enabled: !!idFinca
  });

  const { data: usuariosData, isLoading } = useQuery({
    queryKey: ['usuariosFinca', idFinca, page, debouncedSearch, idRol, estado],
    queryFn: () => usuariosService.getUsuariosFinca(idFinca!, {
      page,
      pageSize,
      search: debouncedSearch,
      id_rol: idRol,
      estado
    }),
    enabled: !!idFinca
  });

  if (!idFinca) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-muted-foreground">No tienes ninguna finca asignada.</p>
      </div>
    );
  }

  // Manejo de vaciado de filtros (para el criterio de "sin datos" vs "sin resultados")
  const hasFilters = debouncedSearch !== '' || idRol !== 'todos' || estado !== 'todos';
  const emptyStateTitle = hasFilters ? "No se encontraron usuarios que coincidan con los criterios de búsqueda." : "No hay usuarios registrados.";
  const emptyStateMessage = hasFilters ? "Intentá ajustar los filtros o el texto de búsqueda." : "";

  // Columnas para Usuarios Finca
  const columns: ColumnDef<UsuarioListado>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (u) => <span className="font-semibold">{`${u.nombre} ${u.apellido}`}</span>
    },
    {
      key: 'email',
      label: 'Email',
      align: 'center',
      render: (u) => <span>{u.email}</span>
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      align: 'center',
      render: (u) => <span>{u.telefono || '---'}</span>
    },
    {
      key: 'rol',
      label: 'Rol',
      align: 'center',
      render: (u) => <span>{u.rol?.nombre_rol || '---'}</span>
    },
    {
      key: 'estado',
      label: 'Estado de cuenta',
      render: (u) => {
        let colorClass = "";
        if (u.estado === 'Activo') colorClass = "bg-[#dcfce7] border-[#bbf7d0] text-[#15803d]";
        else if (u.estado === 'Inactivo') colorClass = "bg-[#cecece] border-[#cecece] text-[#696867]"; // Según UI reference: gris
        else if (u.estado === 'Pendiente') colorClass = "bg-[#ffee9c] border-[#ffee9c] text-[#8a6d3b]";
        
        return (
          <span className={`px-3.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider font-sans ${colorClass}`}>
            {u.estado}
          </span>
        );
      }
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'center',
      render: (u) => (
        <div className="flex gap-2 justify-center">
          <button 
            onClick={() => setSelectedUsuario(u)}
            className="p-2 text-muted-foreground hover:bg-muted rounded-md"
            title="Editar Rol"
          >
            <HugeiconsIcon icon={PencilEdit02Icon} className="size-5" strokeWidth={1.5} />
          </button>
          <button className="p-2 text-red-500 hover:bg-red-50 rounded-md opacity-50 cursor-not-allowed">
            <HugeiconsIcon icon={Delete02Icon} className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full max-w-screen-xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios asociados a tus fincas, asigna roles y genera invitaciones
          </p>
        </div>
      </div>

      {/* 
        Estados de cuenta 
        NOTA: El contenido de este bloque es 100% ESTÁTICO y descriptivo.
        No proviene de ningún endpoint, sino que sirve como guía visual para el usuario.
        Hay que implementar la lógica de estados de cuenta en el backend y reflejarla en la tabla de usuarios.
      */}
      <div className="bg-white border border-border shadow-sm rounded-xl p-6 mb-6">
        <p className="text-base text-foreground mb-4">Los posibles estados de las cuentas pueden ser:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pendiente */}
          <div className="bg-yellow-100 border border-border rounded-xl p-4 flex gap-4 shadow-sm items-start">
            <div className="bg-yellow-50 border border-border rounded-lg p-2 shadow-sm shrink-0">
              <HugeiconsIcon icon={InformationCircleIcon} className="size-5 text-yellow-700" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1 uppercase">Pendiente</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Usuario no ha aceptado o rechazado la invitación que enviaste a su correo electrónico
              </p>
            </div>
          </div>
          {/* Activo */}
          <div className="bg-green-50 border border-border rounded-xl p-4 flex gap-4 shadow-sm items-start">
            <div className="bg-primary border border-border rounded-lg p-2 shadow-sm shrink-0">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1 uppercase">Activo</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Usuario ha aceptado la invitación que enviaste a su correo electrónico y tiene acceso a la plataforma
              </p>
            </div>
          </div>
          {/* Inactivo */}
          <div className="bg-muted border border-border rounded-xl p-4 flex gap-4 shadow-sm items-start">
            <div className="bg-muted-foreground border border-muted-foreground rounded-lg p-2 shadow-sm shrink-0">
              <HugeiconsIcon icon={CancelCircleIcon} className="size-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1 uppercase">Inactivo</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Usuario no ha aceptado la invitación que enviaste a su correo electrónico y no tiene acceso a la plataforma
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Tabla */}
      <div className="bg-white border border-border shadow-sm rounded-xl overflow-hidden mb-6 flex flex-col">
        {/* Filters Top Bar */}
        <div className="p-4 bg-[rgba(246,243,237,0.3)] border-b border-border flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="w-full sm:w-72">
              <SearchBar 
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} 
                placeholder="Buscar usuario" 
              />
            </div>
            <div className="flex gap-4">
              <select 
                value={idRol}
                onChange={(e) => { setIdRol(e.target.value); setPage(1); }}
                className="h-9 bg-white border border-border rounded-lg px-3 text-sm text-foreground outline-none w-full sm:w-40 shadow-sm"
              >
                <option value="todos">Rol: Todos</option>
                {rolesData?.roles?.map((r: any) => (
                  <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
                ))}
              </select>
              <select 
                value={estado}
                onChange={(e) => { setEstado(e.target.value); setPage(1); }}
                className="h-9 bg-white border border-border rounded-lg px-3 text-sm text-foreground outline-none w-full sm:w-40 shadow-sm"
              >
                <option value="todos">Estado: Todos</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsInvitarModalOpen(true)}
            className="gap-2 shadow-sm w-full lg:w-auto"
          >
            <HugeiconsIcon icon={Sent02Icon} className="size-5" />
            <span>Enviar invitación a usuario</span>
          </Button>
        </div>
        
        {/* Table Area */}
        <div className="p-0 border-none shadow-none">
          <TablaConPaginacion<UsuarioListado>
            title="Lista de Usuarios"
            columns={columns}
            data={usuariosData?.usuarios || []}
            isLoading={isLoading}
            currentPage={usuariosData?.pagination.page || 1}
            totalPages={usuariosData?.pagination.totalPages || 0}
            totalItems={usuariosData?.pagination.totalItems || 0}
            pageSize={pageSize}
            keyExtractor={(u) => u.id_usuario}
            onPageChange={setPage}
            emptyStateTitle={emptyStateTitle}
            emptyStateMessage={emptyStateMessage}
          />
        </div>
      </div>

      {/* Sección Roles */}
      <SeccionRolesFinca idFinca={idFinca} />

      <EditarUsuarioModal 
        open={!!selectedUsuario} 
        onOpenChange={(val) => !val && setSelectedUsuario(null)} 
        usuario={selectedUsuario}
        context="finca"
        id_finca={idFinca}
      />
      <InvitarUsuarioModal
        open={isInvitarModalOpen}
        onOpenChange={setIsInvitarModalOpen}
        idFinca={idFinca}
        rolesData={rolesData}
        isLoadingRoles={!rolesData}
      />
    </div>
  );
}
