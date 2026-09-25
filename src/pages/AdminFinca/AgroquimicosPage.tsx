import { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon, FlaskConicalIcon, Search01Icon, ViewIcon, Calendar01Icon, Download04Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { RegistrarAgroquimicoModal } from './components/RegistrarAgroquimicoModal';
import { EditarAgroquimicoModal } from './components/EditarAgroquimicoModal';
import { ExportarAgroquimicosModal } from './components/ExportarAgroquimicosModal';
import { useMiFincaListQuery, useMiFincaResumenQuery } from '@/hooks/useFincas';
import { useAplicacionesQuery } from '@/hooks/useAgroquimicos';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { TablaConPaginacion } from '@/components/shared/TablaConPaginacion';
import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '@/services/usuarios.service';
import { AplicacionAgroquimicoDetalle } from '@/types/agroquimicos.types';


export function AgroquimicosPage() {
  const { data: fincasRes } = useMiFincaListQuery();
  const fincas = fincasRes?.fincas || [];
  
  const [selectedFincaId, setSelectedFincaId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEditApp, setSelectedEditApp] = useState<AplicacionAgroquimicoDetalle | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    if (fincas.length > 0 && !selectedFincaId) {
      setSelectedFincaId(fincas[0].id_finca);
    }
  }, [fincas, selectedFincaId]);

  // Filtros
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const [filterParcela, setFilterParcela] = useState<string>('all');
  const [filterResponsable, setFilterResponsable] = useState<string>('all');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  const handleParcelaChange = (val: string) => {
    setFilterParcela(val);
    setPage(1);
  };
  const handleResponsableChange = (val: string) => {
    setFilterResponsable(val);
    setPage(1);
  };
  const handleFechaDesdeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFechaDesde(val);
    if (val && fechaHasta && val > fechaHasta) {
      setFechaHasta('');
    }
    setPage(1);
  };
  const handleFechaHastaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFechaHasta(e.target.value);
    setPage(1);
  };

  const isFiltered = filterParcela !== 'all' || filterResponsable !== 'all' || fechaDesde !== '' || fechaHasta !== '';

  const handleClearFilters = () => {
    setFilterParcela('all');
    setFilterResponsable('all');
    setFechaDesde('');
    setFechaHasta('');
    setPage(1);
  };

  // Queries
  const { data: aplicacionesData, isLoading: loadingAplicaciones } = useAplicacionesQuery(selectedFincaId, {
    page,
    pageSize,
    id_parcela: filterParcela !== 'all' ? Number(filterParcela) : undefined,
    id_responsable: filterResponsable !== 'all' ? Number(filterResponsable) : undefined,
    fecha_desde: fechaDesde || undefined,
    fecha_hasta: fechaHasta || undefined,
  });

  const { data: fincaResumen } = useMiFincaResumenQuery(selectedFincaId);
  const parcelas = fincaResumen?.parcelas || [];

  const { data: usuariosData } = useQuery({
    queryKey: ['usuariosFinca', selectedFincaId, 'Activos'],
    queryFn: () => usuariosService.getUsuariosFinca(selectedFincaId!, { page: 1, pageSize: 100, estado: 'Activo' }),
    enabled: !!selectedFincaId,
  });

  const columnas = [
    {
      key: 'fecha',
      label: 'Fecha y Hora',
      render: (row: any) => {
        const date = new Date(row.fecha_hora_aplicacion_aa);
        return date.toLocaleString('es-AR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
      }
    },
    {
      key: 'producto',
      label: 'Producto',
      render: (row: any) => row.nombre_producto_aa,
    },
    {
      key: 'dosis',
      label: 'Dosis',
      render: (row: any) => row.dosis_aa,
    },
    {
      key: 'parcela',
      label: 'Parcela',
      render: (row: any) => row.nombre_parcela,
    },
    {
      key: 'responsable',
      label: 'Responsable',
      render: (row: any) => row.nombre_responsable,
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'center' as const,
      render: (row: AplicacionAgroquimicoDetalle) => (
        <div className="flex items-center justify-center gap-2">
          <button 
            className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors"
            title="Ver / Editar"
            onClick={() => {
              setSelectedEditApp(row);
              setIsEditModalOpen(true);
            }}
          >
            <HugeiconsIcon icon={ViewIcon} className="size-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header de sección */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Agroquímicos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Historial detallado y trazable de los tratamientos fitosanitarios realizados en la finca.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {fincas.length > 1 && (
            <div className="w-full sm:w-48 shrink-0">
              <Select 
                value={selectedFincaId?.toString() || ""} 
                onValueChange={(val) => {
                  setSelectedFincaId(Number(val));
                  handleClearFilters();
                }}
              >
                <SelectTrigger className="bg-background border-input text-foreground h-10">
                  <SelectValue placeholder="Seleccionar finca" />
                </SelectTrigger>
                <SelectContent>
                  {fincas.map((f: any) => (
                    <SelectItem key={f.id_finca} value={f.id_finca.toString()}>
                      {f.nombre_finca}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 h-10 w-full sm:w-auto"
            disabled={!selectedFincaId}
          >
            <HugeiconsIcon icon={Download04Icon} size={16} />
            <span>Exportar</span>
          </Button>

          <Button 
            variant="default" 
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 h-10 w-full sm:w-auto"
            disabled={!selectedFincaId}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            <span>Registrar Aplicación</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full flex flex-col gap-6">
        {selectedFincaId ? (
          <>
            {/* Barra de Filtros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 bg-card p-4 rounded-xl border border-border">
              <Select value={filterParcela} onValueChange={handleParcelaChange}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Todas las parcelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las parcelas</SelectItem>
                  {parcelas.map((p: any) => (
                    <SelectItem key={p.id_parcela} value={p.id_parcela.toString()}>
                      {p.nombre_parcela}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative w-full">
                <Input
                  type={fechaDesde ? "date" : "text"}
                  value={fechaDesde}
                  onChange={handleFechaDesdeChange}
                  onFocus={(e) => { e.target.type = 'date'; e.target.showPicker && e.target.showPicker(); }}
                  onBlur={(e) => !fechaDesde && (e.target.type = 'text')}
                  className="bg-background border-input text-foreground pr-10 [&::-webkit-datetime-edit]:text-foreground [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:z-10"
                  placeholder="Fecha desde"
                />
                <HugeiconsIcon 
                  icon={Calendar01Icon} 
                  className="absolute right-3 top-2.5 size-4 text-muted-foreground pointer-events-none" 
                />
              </div>

              <div className="relative w-full">
                <Input
                  type={fechaHasta ? "date" : "text"}
                  value={fechaHasta}
                  onChange={handleFechaHastaChange}
                  onFocus={(e) => { e.target.type = 'date'; e.target.showPicker && e.target.showPicker(); }}
                  onBlur={(e) => !fechaHasta && (e.target.type = 'text')}
                  min={fechaDesde || undefined}
                  className="bg-background border-input text-foreground pr-10 [&::-webkit-datetime-edit]:text-foreground [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:z-10"
                  placeholder="Fecha hasta"
                />
                <HugeiconsIcon 
                  icon={Calendar01Icon} 
                  className="absolute right-3 top-2.5 size-4 text-muted-foreground pointer-events-none" 
                />
              </div>

              <Select value={filterResponsable} onValueChange={handleResponsableChange}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Todos los responsables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los responsables</SelectItem>
                  {usuariosData?.usuarios?.map((u: any) => (
                    <SelectItem key={u.id_usuario} value={u.id_usuario.toString()}>
                      {u.nombre} {u.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isFiltered && (
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="w-full text-primary border-primary/20 hover:bg-primary/5"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>

            {/* Tabla / Estados Vacíos */}
            {loadingAplicaciones ? (
              <div className="flex-1 bg-card rounded-xl border border-border flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Cargando aplicaciones...</p>
              </div>
            ) : aplicacionesData && aplicacionesData.aplicaciones.length > 0 ? (
              <div className="bg-card rounded-xl border border-border p-4">
                <TablaConPaginacion
                  data={aplicacionesData.aplicaciones}
                  columns={columnas}
                  currentPage={aplicacionesData.page}
                  totalPages={Math.ceil(aplicacionesData.total / pageSize)}
                  totalItems={aplicacionesData.total}
                  onPageChange={setPage}
                />
              </div>
            ) : isFiltered ? (
              <div className="flex-1 bg-card rounded-xl border border-border flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4 text-muted-foreground">
                  <HugeiconsIcon icon={Search01Icon} size={32} />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">No hay resultados</h2>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  {filterParcela !== 'all' && filterResponsable === 'all' && !fechaDesde && !fechaHasta 
                    ? "No hay aplicaciones registradas para la parcela seleccionada."
                    : filterResponsable !== 'all' && filterParcela === 'all' && !fechaDesde && !fechaHasta
                    ? "No hay aplicaciones registradas para dicho responsable."
                    : fechaDesde && fechaHasta && filterParcela === 'all' && filterResponsable === 'all'
                    ? "No hay aplicaciones registradas para dicha fecha."
                    : "No hay aplicaciones que coincidan con los filtros seleccionados."}
                </p>
                <Button variant="outline" onClick={handleClearFilters}>
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <div className="flex-1 bg-card rounded-xl border border-border flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4 text-green-500">
                  <HugeiconsIcon icon={FlaskConicalIcon} size={32} />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Historial de Aplicaciones</h2>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  Aún no hay aplicaciones registradas. Hacé clic en "Registrar Aplicación" para comenzar a llevar el registro.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">No tenés fincas disponibles.</p>
          </div>
        )}
      </div>

      {/* Modal para Registrar Aplicación */}
      {selectedFincaId && (
        <RegistrarAgroquimicoModal 
          open={modalOpen} 
          onOpenChange={setModalOpen} 
          id_finca={selectedFincaId}
        />
      )}

      {/* Modal para Ver / Editar Aplicación */}
      {selectedFincaId && selectedEditApp && (
        <EditarAgroquimicoModal
          open={isEditModalOpen}
          onOpenChange={(val) => {
            setIsEditModalOpen(val);
            if (!val) {
              setTimeout(() => setSelectedEditApp(null), 300);
            }
          }}
          id_finca={selectedFincaId}
          initialData={selectedEditApp}
        />
      )}

      {/* Modal para Exportar */}
      {selectedFincaId && (
        <ExportarAgroquimicosModal
          open={isExportModalOpen}
          onOpenChange={setIsExportModalOpen}
          id_finca={selectedFincaId}
          nombreFinca={fincas.find((f: any) => f.id_finca === selectedFincaId)?.nombre_finca || 'Finca'}
          parcelas={parcelas}
        />
      )}
    </div>
  );
}
