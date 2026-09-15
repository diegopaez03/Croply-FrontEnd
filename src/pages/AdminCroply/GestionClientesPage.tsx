import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CardMetrica } from '../../components/shared/CardMetrica';
import { SearchBar } from '../../components/shared/SearchBar';
import { TablaConPaginacion, ColumnDef } from '../../components/shared/TablaConPaginacion';
import { RegistrarClienteModal, ValoresInicialesCliente } from './components/RegistrarClienteModal';
import { EditarUsuarioModal } from '../../components/shared/EditarUsuarioModal';
import { ConfirmarBajaUsuarioDialog } from '../../components/shared/ConfirmarBajaUsuarioDialog';
import { DetalleSolicitudModal } from './components/DetalleSolicitudModal';
import { useAuth } from '../../context/AuthContext';
import { PERMISO_SISTEMA } from '../../constants/permisos';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserGroupIcon, CheckmarkCircle02Icon, MoreHorizontalCircle02Icon, UserListIcon, PencilEdit02Icon, Delete02Icon } from '@hugeicons/core-free-icons';

import { usuariosService } from '../../services/usuarios.service';
import { rolesService } from '../../services/roles.service';
import { solicitudesService } from '../../services/solicitudes.service';
import { useDebounce } from '../../hooks/useDebounce';
import { UsuarioListado } from '../../types/usuarios.types';
import { SolicitudDigitalizacionDetalle, SolicitudDigitalizacionListado } from '../../types/solicitudes.types';

function partirNombreCompleto(nombreCompleto: string): { nombre: string; apellido: string } {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
  if (partes.length <= 1) {
    return { nombre: partes[0] ?? '', apellido: '' };
  }
  return { nombre: partes[0], apellido: partes.slice(1).join(' ') };
}

function badgeEstadoSolicitud(estado: string) {
  if (estado === 'Pendiente') return 'bg-[#ffee9c] border-[#e9c162] text-[#8a6d3b]';
  if (estado === 'Contactado') return 'bg-[#dbeafe] border-[#93c5fd] text-[#1d4ed8]';
  if (estado === 'Aprobada') return 'bg-[#dcfce7] border-[#bbf7d0] text-[#15803d]';
  if (estado === 'Rechazada') return 'bg-[#f3f4f6] border-[#d1d5db] text-[#4b5563]';
  return 'bg-[#f3f4f6] border-[#d1d5db] text-[#4b5563]';
}

export default function GestionClientesPage() {
  const { usuario: usuarioActual, tienePermiso } = useAuth();
  const puedeVerUsuarios = tienePermiso(PERMISO_SISTEMA.GESTION_USUARIOS);
  const puedeVerSolicitudes = tienePermiso(PERMISO_SISTEMA.SOLICITUDES_DIGITALIZACION);
  const [activeTab, setActiveTab] = useState<'usuarios' | 'solicitudes'>(
    puedeVerUsuarios ? 'usuarios' : 'solicitudes',
  );
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [searchSolicitudes, setSearchSolicitudes] = useState('');
  const debouncedSearchSolicitudes = useDebounce(searchSolicitudes, 500);
  
  const [idRol, setIdRol] = useState<string>('todos');
  const [estado, setEstado] = useState<string>('todos');
  const [estadoSolicitudes, setEstadoSolicitudes] = useState<string>('todos');
  const [ordenFecha, setOrdenFecha] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const [pageSolicitudes, setPageSolicitudes] = useState<number>(1);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState<number | null>(null);

  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [valoresInicialesCliente, setValoresInicialesCliente] = useState<ValoresInicialesCliente | undefined>();
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioListado | null>(null);
  const [usuarioADarDeBaja, setUsuarioADarDeBaja] = useState<UsuarioListado | null>(null);

  const { data: rolesData } = useQuery({
    queryKey: ['rolesSistema'],
    queryFn: rolesService.getRolesSistema,
    enabled: puedeVerUsuarios,
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
    enabled: activeTab === 'usuarios' && puedeVerUsuarios
  });

  // Conteos globales de las cards (independientes de los filtros de la tabla).
  // pageSize=1: solo necesitamos pagination.totalItems.
  const { data: statsTotal } = useQuery({
    queryKey: ['usuariosCroply', 'stats', 'total'],
    queryFn: () => usuariosService.getUsuariosCroply({ page: 1, pageSize: 1 }),
    enabled: puedeVerUsuarios,
  });
  const { data: statsActivos } = useQuery({
    queryKey: ['usuariosCroply', 'stats', 'activos'],
    queryFn: () =>
      usuariosService.getUsuariosCroply({ page: 1, pageSize: 1, estado: 'Activo' }),
    enabled: puedeVerUsuarios,
  });
  const { data: statsPendientes } = useQuery({
    queryKey: ['usuariosCroply', 'stats', 'pendientes'],
    queryFn: () =>
      usuariosService.getUsuariosCroply({ page: 1, pageSize: 1, estado: 'Pendiente' }),
    enabled: puedeVerUsuarios,
  });

  const { data: solicitudesData, isLoading: isLoadingSolicitudes, isError: isErrorSolicitudes } = useQuery({
    queryKey: ['solicitudes', pageSolicitudes, debouncedSearchSolicitudes, estadoSolicitudes],
    queryFn: () => solicitudesService.getSolicitudes({
      page: pageSolicitudes,
      pageSize,
      search: debouncedSearchSolicitudes,
      estado: estadoSolicitudes,
    }),
    enabled: activeTab === 'solicitudes' && puedeVerSolicitudes
  });

  const solicitudesOrdenadas = useMemo(() => {
    const items = [...(solicitudesData?.solicitudes || [])];
    items.sort((a, b) => {
      const da = new Date(a.fecha_solicitud).getTime();
      const db = new Date(b.fecha_solicitud).getTime();
      return ordenFecha === 'ASC' ? da - db : db - da;
    });
    return items;
  }, [solicitudesData, ordenFecha]);

  const hasFilters = debouncedSearch !== '' || idRol !== 'todos' || estado !== 'todos';
  const emptyStateTitle = hasFilters ? "No se encontraron usuarios que coincidan con los criterios de búsqueda." : "No hay usuarios registrados.";
  const emptyStateMessage = hasFilters ? "Intentá ajustar los filtros o el texto de búsqueda." : "";

  const hasFiltersSolicitudes = debouncedSearchSolicitudes !== '' || estadoSolicitudes !== 'todos';
  const emptyStateTitleSolicitudes = isErrorSolicitudes
    ? "No se pudieron cargar las solicitudes."
    : hasFiltersSolicitudes
      ? "No se encontraron solicitudes que coincidan con los criterios de búsqueda."
      : "Aún no hay solicitudes de digitalización registradas.";
  const emptyStateMessageSolicitudes = isErrorSolicitudes
    ? "Reintentá en unos instantes."
    : hasFiltersSolicitudes
      ? "Intentá ajustar los filtros o el texto de búsqueda."
      : "";

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
          <button
            onClick={() => setUsuarioADarDeBaja(u)}
            disabled={u.estado === 'Inactivo' || u.id_usuario === usuarioActual?.id_usuario}
            className="p-2 text-red-500 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            title={
              u.id_usuario === usuarioActual?.id_usuario
                ? 'No podés darte de baja a vos mismo'
                : u.estado === 'Inactivo'
                  ? 'El usuario ya está inactivo'
                  : 'Dar de baja'
            }
          >
            <HugeiconsIcon icon={Delete02Icon} className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      )
    }
  ];

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
        <span className={`px-3.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider font-sans ${badgeEstadoSolicitud(s.estado)}`}>
          {s.estado}
        </span>
      )
    },
  ];

  const abrirRegistroCliente = (valores?: ValoresInicialesCliente) => {
    setValoresInicialesCliente(valores);
    setIsAddClientModalOpen(true);
  };

  const handleRegistrarDesdeSolicitud = (solicitud: SolicitudDigitalizacionDetalle) => {
    const { nombre, apellido } = partirNombreCompleto(solicitud.nombre_completo);
    setSelectedSolicitudId(null);
    abrirRegistroCliente({
      nombre,
      apellido,
      email: solicitud.correo_electronico,
      telefono: solicitud.telefono_contacto,
      id_solicitud_df: solicitud.id_solicitud_df,
    });
  };

  return (
    <div className="flex flex-col gap-4 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1 min-h-20 justify-center">
        <h1 className="text-4xl leading-10 font-bold text-foreground font-sans tracking-normal">Gestión de Usuarios</h1>
        <p className="text-base leading-6 text-foreground font-sans tracking-normal">
          Listado de Usuarios registrados en la plataforma.
        </p>
      </div>

      {puedeVerUsuarios && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <CardMetrica 
          icon={<HugeiconsIcon icon={UserGroupIcon} className="text-primary size-6" strokeWidth={1.5} />} 
          iconBgColor="bg-primary/10" 
          labelTop="TOTAL" 
          labelBottom="USUARIOS" 
          value={statsTotal?.pagination.totalItems ?? 0} 
        />
        <CardMetrica 
          icon={<HugeiconsIcon icon={CheckmarkCircle02Icon} className="text-green-700 size-6" strokeWidth={1.5} />} 
          iconBgColor="bg-green-100" 
          labelTop="ACTIVOS" 
          value={statsActivos?.pagination.totalItems ?? 0} 
        />
        <CardMetrica 
          icon={<HugeiconsIcon icon={MoreHorizontalCircle02Icon} className="text-yellow-700 size-6" strokeWidth={1.5} />} 
          iconBgColor="bg-yellow-100" 
          labelTop="PENDIENTES" 
          value={statsPendientes?.pagination.totalItems ?? 0} 
        />
      </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 w-full">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1">
          {activeTab === 'usuarios' && puedeVerUsuarios && (
            <>
              <div className="w-full sm:w-72 lg:w-96">
                <SearchBar
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Buscar usuario"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={idRol}
                  onChange={(e) => { setIdRol(e.target.value); setPage(1); }}
                  className="h-9 bg-card border border-border rounded-lg px-3 text-sm text-muted-foreground outline-none w-full sm:w-40"
                >
                  <option value="todos">Rol: Todos</option>
                  {rolesData?.roles?.map((r: any) => (
                    <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
                  ))}
                </select>
                <select
                  value={estado}
                  onChange={(e) => { setEstado(e.target.value); setPage(1); }}
                  className="h-9 bg-card border border-border rounded-lg px-3 text-sm text-muted-foreground outline-none w-full sm:w-40"
                >
                  <option value="todos">Estado: Todos</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>
            </>
          )}
          {activeTab === 'solicitudes' && puedeVerSolicitudes && (
            <>
              <div className="w-full sm:w-72 lg:w-96">
                <SearchBar
                  value={searchSolicitudes}
                  onChange={(e) => {
                    setSearchSolicitudes(e.target.value);
                    setPageSolicitudes(1);
                  }}
                  placeholder="Buscar por nombre"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={estadoSolicitudes}
                  onChange={(e) => { setEstadoSolicitudes(e.target.value); setPageSolicitudes(1); }}
                  className="h-9 bg-card border border-border rounded-lg px-3 text-sm text-muted-foreground outline-none w-full sm:w-40"
                >
                  <option value="todos">Estado: Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Contactado">Contactado</option>
                  <option value="Aprobada">Aprobada</option>
                  <option value="Rechazada">Rechazada</option>
                </select>
                <select
                  value={ordenFecha}
                  onChange={(e) => { setOrdenFecha(e.target.value as 'ASC' | 'DESC'); setPageSolicitudes(1); }}
                  className="h-9 bg-card border border-border rounded-lg px-3 text-sm text-muted-foreground outline-none w-full sm:w-52"
                >
                  <option value="DESC">Fecha: más recientes</option>
                  <option value="ASC">Fecha: más antiguas</option>
                </select>
              </div>
            </>
          )}
        </div>

        {puedeVerUsuarios && (
          <button
            onClick={() => abrirRegistroCliente()}
            className="bg-primary text-primary-foreground font-bold text-sm h-10 px-6 rounded-lg whitespace-nowrap w-full sm:w-auto hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
            Agregar Usuario
          </button>
        )}
      </div>

      {/* Tabs / Table container */}
      <div className="bg-white border border-border rounded-xl shadow-sm w-full flex flex-col mb-6">
        <div className="border-b border-border h-14 px-6 flex">
          <div className="flex gap-8 h-full">
            {puedeVerUsuarios && (
            <button 
              className={`flex items-center justify-center pt-4 pb-4 border-b-2 transition-colors ${activeTab === 'usuarios' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
              onClick={() => setActiveTab('usuarios')}
            >
              <p className="text-base">Usuarios</p>
            </button>
            )}
            {puedeVerSolicitudes && (
            <button 
              className={`flex items-center justify-center pt-4 pb-4 border-b-2 transition-colors ${activeTab === 'solicitudes' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
              onClick={() => setActiveTab('solicitudes')}
            >
              <p className="text-base">Solicitudes</p>
            </button>
            )}
          </div>
        </div>

        {activeTab === 'usuarios' && puedeVerUsuarios && (
          <div className="border-none shadow-none">
            <TablaConPaginacion<UsuarioListado>
              title="Lista de Usuarios"
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
        )}
        {activeTab === 'solicitudes' && puedeVerSolicitudes && (
          <div className="border-none shadow-none">
            <TablaConPaginacion<SolicitudDigitalizacionListado>
              title="Solicitudes de Digitalización de fincas"
              icon={<HugeiconsIcon icon={UserListIcon} className="size-6" strokeWidth={1.5} />}
              columns={columnsSolicitudes}
              data={solicitudesOrdenadas}
              isLoading={isLoadingSolicitudes}
              currentPage={solicitudesData?.pagination.page || 1}
              totalPages={solicitudesData?.pagination.totalPages || 0}
              totalItems={solicitudesData?.pagination.totalItems || 0}
              pageSize={pageSize}
              keyExtractor={(s) => s.id_solicitud_df}
              onPageChange={setPageSolicitudes}
              onRowClick={(s) => setSelectedSolicitudId(s.id_solicitud_df)}
              getRowAriaLabel={(s) => `Ver solicitud de ${s.nombre_completo}`}
              emptyStateTitle={emptyStateTitleSolicitudes}
              emptyStateMessage={emptyStateMessageSolicitudes}
            />
          </div>
        )}
      </div>

      <RegistrarClienteModal
        open={isAddClientModalOpen}
        onOpenChange={(open) => {
          setIsAddClientModalOpen(open);
          if (!open) setValoresInicialesCliente(undefined);
        }}
        valoresIniciales={valoresInicialesCliente}
      />
      <EditarUsuarioModal 
        open={!!selectedUsuario} 
        onOpenChange={(val) => !val && setSelectedUsuario(null)} 
        usuario={selectedUsuario}
        context="croply"
      />
      <ConfirmarBajaUsuarioDialog
        usuario={usuarioADarDeBaja}
        open={!!usuarioADarDeBaja}
        onOpenChange={(open) => !open && setUsuarioADarDeBaja(null)}
        queryKeys={[['usuariosCroply']]}
      />
      <DetalleSolicitudModal 
        open={!!selectedSolicitudId}
        onOpenChange={(val) => !val && setSelectedSolicitudId(null)}
        idSolicitud={selectedSolicitudId}
        onRegistrarCliente={puedeVerUsuarios ? handleRegistrarDesdeSolicitud : undefined}
      />
    </div>
  );
}
