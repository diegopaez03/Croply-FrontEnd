import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CardMetrica } from '../../components/shared/CardMetrica';
import { SearchBar } from '../../components/shared/SearchBar';
import { TablaConPaginacion, ColumnDef } from '../../components/shared/TablaConPaginacion';
import { RegistrarClienteModal } from './components/RegistrarClienteModal';
import { EditarUsuarioModal } from '../../components/shared/EditarUsuarioModal';
import { DetalleSolicitudModal } from './components/DetalleSolicitudModal';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserGroupIcon, CheckmarkCircle02Icon, MoreHorizontalCircle02Icon, UserListIcon, PencilEdit02Icon, Delete02Icon, ViewIcon } from '@hugeicons/core-free-icons';

import { usuariosService } from '../../services/usuarios.service';
import { rolesService } from '../../services/roles.service';
import { solicitudesService } from '../../services/solicitudes.service';
import { useDebounce } from '../../hooks/useDebounce';
import { UsuarioListado } from '../../types/usuarios.types';
import { SolicitudDigitalizacionListado } from '../../types/solicitudes.types';
import { handleFormError } from '../../utils/errorHandler';

export default function GestionClientesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'administradores' | 'solicitudes'>('administradores');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const [idRol, setIdRol] = useState<string>('todos');
  const [estado, setEstado] = useState<string>('todos');
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Pagination specifically for Solicitudes
  const [pageSolicitudes, setPageSolicitudes] = useState<number>(1);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState<number | null>(null);

  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioListado | null>(null);

  // Queries
  const { data: rolesData } = useQuery({
    queryKey: ['rolesSistema'],
    queryFn: rolesService.getRolesSistema,
  });

  const { data: usuariosData, isLoading } = useQuery({
    queryKey: ['usuariosCroply', page, debouncedSearch, idRol, estado],
    queryFn: () => usuariosService.getUsuariosCroply({
      page,
      pageSize,
      search: debouncedSearch,
      id_rol: idRol,
      estado
    }),
    enabled: activeTab === 'administradores'
  });

  const { data: solicitudesData, isLoading: isLoadingSolicitudes } = useQuery({
    queryKey: ['solicitudes', pageSolicitudes],
    queryFn: () => solicitudesService.getSolicitudes({ page: pageSolicitudes, pageSize }),
    enabled: activeTab === 'solicitudes'
  });

  const updateEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number, estado: string }) => solicitudesService.updateEstado(id, estado),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
    },
    onError: (err) => handleFormError(err)
  });

  // Manejo de vaciado de filtros (para el criterio de "sin datos" vs "sin resultados")
  const hasFilters = debouncedSearch !== '' || idRol !== 'todos' || estado !== 'todos';

  const emptyStateTitle = hasFilters ? "No se encontraron usuarios que coincidan con los criterios de búsqueda." : "No hay usuarios registrados.";
  const emptyStateMessage = hasFilters ? "Intentá ajustar los filtros o el texto de búsqueda." : "";

  // Columnas para Administradores
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
        else if (u.estado === 'Inactivo') colorClass = "bg-[#f3f4f6] border-[#d1d5db] text-[#4b5563]";
        else if (u.estado === 'Pendiente') colorClass = "bg-[#ffee9c] border-[#e9c162] text-[#8a6d3b]";
        
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

  // Columnas para Solicitudes
  const columnsSolicitudes: ColumnDef<SolicitudDigitalizacionListado>[] = [
    {
      key: 'fecha_solicitud',
      label: 'Fecha de solicitud',
      render: (s) => <span>{format(new Date(s.fecha_solicitud), "dd/MM/yyyy HH:mm")}</span>
    },
    {
      key: 'nombre',
      label: 'Nombre completo',
      render: (s) => <span className="font-semibold">{s.nombre_completo}</span>
    },
    {
      key: 'email',
      label: 'Correo electrónico',
      render: (s) => <span>{s.correo_electronico}</span>
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      render: (s) => <span>{s.telefono_contacto || '---'}</span>
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (s) => (
        <select
          value={s.estado}
          onChange={(e) => updateEstadoMutation.mutate({ id: s.id_solicitud_df, estado: e.target.value })}
          disabled={updateEstadoMutation.isPending}
          className="h-8 bg-card border border-border rounded-lg px-2 text-xs font-semibold text-muted-foreground outline-none cursor-pointer hover:bg-muted/50 focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
          onClick={(e) => e.stopPropagation()} // Prevent row click when clicking select
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Contactado">Contactado</option>
          <option value="Aprobada">Aprobada</option>
          <option value="Rechazada">Rechazada</option>
        </select>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'center',
      render: (s) => (
        <div className="flex gap-2 justify-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSolicitudId(s.id_solicitud_df);
            }}
            className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
            title="Ver detalle"
          >
            <HugeiconsIcon icon={ViewIcon} className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-4 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1 min-h-20 justify-center">
        <h1 className="text-4xl leading-10 font-bold text-foreground font-sans tracking-normal">Gestión de Clientes</h1>
        <p className="text-base leading-6 text-foreground font-sans tracking-normal">
          Listado de Administradores de Sistema registrados en la plataforma.
        </p>
      </div>

      {/* Bento-style stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <CardMetrica 
          icon={<HugeiconsIcon icon={UserGroupIcon} className="text-primary size-6" strokeWidth={1.5} />} 
          iconBgColor="bg-primary/10" 
          labelTop="TOTAL" 
          labelBottom="CLIENTES" 
          value={124} 
        />
        <CardMetrica 
          icon={<HugeiconsIcon icon={CheckmarkCircle02Icon} className="text-green-700 size-6" strokeWidth={1.5} />} 
          iconBgColor="bg-green-100" 
          labelTop="ACTIVOS" 
          value={118} 
        />
        <CardMetrica 
          icon={<HugeiconsIcon icon={MoreHorizontalCircle02Icon} className="text-yellow-700 size-6" strokeWidth={1.5} />} 
          iconBgColor="bg-yellow-100" 
          labelTop="PENDIENTES" 
          value={6} 
        />
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1">
          <div className="w-full sm:w-72 lg:w-96">
             <SearchBar 
                value={searchTerm} 
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1); // Reset page on search
                }} 
                placeholder="Buscar cliente" 
                disabled={activeTab === 'solicitudes'}
             />
          </div>
          
          <div className="flex gap-4">
            <select 
              value={idRol}
              onChange={(e) => { setIdRol(e.target.value); setPage(1); }}
              disabled={activeTab === 'solicitudes'}
              className="h-9 bg-card border border-border rounded-lg px-3 text-sm text-muted-foreground outline-none w-full sm:w-40 disabled:opacity-50"
            >
              <option value="todos">Rol: Todos</option>
              {rolesData?.roles?.map((r: any) => (
                <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
              ))}
            </select>
            <select 
              value={estado}
              onChange={(e) => { setEstado(e.target.value); setPage(1); }}
              disabled={activeTab === 'solicitudes'}
              className="h-9 bg-card border border-border rounded-lg px-3 text-sm text-muted-foreground outline-none w-full sm:w-40 disabled:opacity-50"
            >
              <option value="todos">Estado: Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>
        </div>

        <button 
          onClick={() => setIsAddClientModalOpen(true)}
          className="bg-primary text-primary-foreground font-bold text-sm h-10 px-6 rounded-lg whitespace-nowrap w-full sm:w-auto hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-lg leading-none">+</span>
          Agregar Cliente
        </button>
      </div>

      {/* Tabs / Table container */}
      <div className="bg-white border border-border rounded-xl shadow-sm w-full flex flex-col mb-6">
        <div className="border-b border-border h-14 px-6 flex">
          <div className="flex gap-8 h-full">
            <button 
              className={`flex items-center justify-center pt-4 pb-4 border-b-2 transition-colors ${activeTab === 'administradores' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
              onClick={() => setActiveTab('administradores')}
            >
              <p className="text-base">Administradores</p>
            </button>
            <button 
              className={`flex items-center justify-center pt-4 pb-4 border-b-2 transition-colors ${activeTab === 'solicitudes' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
              onClick={() => setActiveTab('solicitudes')}
            >
              <p className="text-base">Solicitudes de Clientes</p>
            </button>
          </div>
        </div>

        {activeTab === 'administradores' ? (
          <div className="border-none shadow-none">
            {/* Reusando la lógica interna de TablaConPaginacion pero ocultando el borde que ya le dimos al contenedor de tabs */}
            <TablaConPaginacion<UsuarioListado>
              title="Lista de Administradores"
              icon={<HugeiconsIcon icon={UserListIcon} className="size-6" strokeWidth={1.5} />}
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
        ) : (
          <div className="border-none shadow-none">
            <TablaConPaginacion<SolicitudDigitalizacionListado>
              title="Solicitudes de Digitalización"
              icon={<HugeiconsIcon icon={UserListIcon} className="size-6" strokeWidth={1.5} />}
              columns={columnsSolicitudes}
              data={solicitudesData?.solicitudes || []}
              isLoading={isLoadingSolicitudes}
              currentPage={solicitudesData?.pagination.page || 1}
              totalPages={solicitudesData?.pagination.totalPages || 0}
              totalItems={solicitudesData?.pagination.totalItems || 0}
              pageSize={pageSize}
              keyExtractor={(s) => s.id_solicitud_df}
              onPageChange={setPageSolicitudes}
              emptyStateTitle="Aún no hay solicitudes de digitalización registradas."
              emptyStateMessage=""
            />
          </div>
        )}
      </div>

      {/* Modal */}
      <RegistrarClienteModal open={isAddClientModalOpen} onOpenChange={setIsAddClientModalOpen} />
      <EditarUsuarioModal 
        open={!!selectedUsuario} 
        onOpenChange={(val) => !val && setSelectedUsuario(null)} 
        usuario={selectedUsuario}
        context="croply"
      />
      <DetalleSolicitudModal 
        open={!!selectedSolicitudId}
        onOpenChange={(val) => !val && setSelectedSolicitudId(null)}
        idSolicitud={selectedSolicitudId}
      />
    </div>
  );
}
