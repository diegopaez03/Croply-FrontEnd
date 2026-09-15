import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFincasQuery, useFincasStats, useDeleteFincaMutation } from '../../hooks/useFincas';
import { FincaListado } from '../../types/fincas.types';
import { TablaConPaginacion, ColumnDef } from '../../components/shared/TablaConPaginacion';
import { CardMetrica } from '../../components/shared/CardMetrica';
import { SearchBar } from '../../components/shared/SearchBar';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useDebounce } from '../../hooks/useDebounce';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PlusSignIcon,
  ViewIcon,
  Delete02Icon,
  TractorIcon,
  CheckmarkCircle02Icon,
  LiveStreaming02Icon,
  MapsLocation01Icon,
  Plant01Icon,
} from '@hugeicons/core-free-icons';

export default function FincasListadoPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const pageSize = 10;

  const { data, isLoading } = useFincasQuery(page, pageSize, debouncedSearch);
  const { mutate: deleteFinca, isPending: isDeleting } = useDeleteFincaMutation();
  const { statsTotal, statsActivas, statsAggregados } = useFincasStats();

  const [fincaToDelete, setFincaToDelete] = useState<number | null>(null);

  const estadoBadge = (estado: string) => {
    if (estado === 'Activo') return <Badge variant="success">ACTIVO</Badge>;
    if (estado === 'Inactivo') return <Badge variant="neutral">INACTIVO</Badge>;
    if (estado === 'Pendiente') return <Badge variant="warning">PENDIENTE</Badge>;
    return <Badge variant="neutral">{estado.toUpperCase()}</Badge>;
  };

  const columns: ColumnDef<FincaListado>[] = [
    {
      key: 'id_finca',
      label: 'ID Finca',
      render: (item) => (
        <span className="text-foreground font-bold text-sm">
          FN-{item.id_finca.toString().padStart(3, '0')}
        </span>
      ),
    },
    {
      key: 'nombre_finca',
      label: 'Nombre de Finca',
      render: (item) => <span className="font-medium text-muted-foreground">{item.nombre_finca}</span>,
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (item) =>
        item.propietario ? (
          <div className="flex flex-col">
            <span className="font-medium text-muted-foreground">
              {item.propietario.nombre} {item.propietario.apellido}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground italic text-sm">Sin asignar</span>
        ),
    },
    {
      key: 'ubicacion',
      label: 'Ubicación',
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">{item.departamento},</span>
          <span className="text-sm text-muted-foreground">{item.provincia}</span>
        </div>
      ),
    },
    {
      key: 'sensores',
      label: 'Sensores',
      align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center gap-1.5">
          <HugeiconsIcon icon={LiveStreaming02Icon} className="size-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="font-medium text-muted-foreground">{item.cantidad_sensores}</span>
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado de finca',
      align: 'center',
      render: (item) => estadoBadge(item.estado),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'center',
      render: (item) => (
        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/admin-croply/fincas/${item.id_finca}`)}
            title="Ver detalle"
            className="size-8 text-muted-foreground hover:text-primary hover:bg-accent"
          >
            <HugeiconsIcon icon={ViewIcon} className="size-5" strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFincaToDelete(item.id_finca)}
            title="Dar de baja"
            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <HugeiconsIcon icon={Delete02Icon} className="size-5 text-red-400" strokeWidth={1.5} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-10">
      {/* Header */}
      <div className="flex flex-col gap-1 mt-2">
        <h1 className="text-4xl leading-10 font-bold text-foreground font-sans">
          Gestión de Fincas e Infraestructura
        </h1>
        <p className="text-base leading-6 text-muted-foreground font-sans">
          Monitoreo y administración centralizada de activos agrícolas.
        </p>
      </div>

      {/* Cards de métricas — 4 cards, 3 queries en paralelo con layout vertical */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6 w-full max-w-5xl">
        <CardMetrica
          orientation="vertical"
          icon={<HugeiconsIcon icon={TractorIcon} className="text-primary size-6" strokeWidth={2} />}
          iconBgColor="bg-primary/10"
          labelTop="TOTAL FINCAS"
          value={statsTotal.data?.pagination.totalItems ?? '—'}
        />
        <CardMetrica
          orientation="vertical"
          icon={<HugeiconsIcon icon={CheckmarkCircle02Icon} className="text-primary size-6" strokeWidth={2} />}
          iconBgColor="bg-primary/10"
          labelTop="FINCAS ACTIVAS"
          value={statsActivas.data?.pagination.totalItems ?? '—'}
        />
        <CardMetrica
          orientation="vertical"
          icon={<HugeiconsIcon icon={LiveStreaming02Icon} className="text-primary size-6" strokeWidth={2} />}
          iconBgColor="bg-primary/10"
          labelTop="SENSORES TOTALES"
          value={statsAggregados.data?.sensores_totales != null ? statsAggregados.data.sensores_totales.toLocaleString('es-AR') : '—'}
        />
        <CardMetrica
          orientation="vertical"
          icon={<HugeiconsIcon icon={MapsLocation01Icon} className="text-primary size-6" strokeWidth={2} />}
          iconBgColor="bg-primary/10"
          labelTop="SUPERFICIE GESTIONADA"
          value={
            statsAggregados.data?.superficie_gestionada_total != null
              ? (
                  <span className="flex items-baseline gap-1">
                    {statsAggregados.data.superficie_gestionada_total.toLocaleString('es-AR')}
                    <span className="text-base font-normal text-muted-foreground">ha</span>
                  </span>
                )
              : '—'
          }
        />
      </div>

      {/* Barra de búsqueda y acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full mt-2">
        <div className="w-full sm:w-80">
          <SearchBar
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar finca"
          />
        </div>
        <Button onClick={() => navigate('/admin-croply/fincas/nueva')} className="gap-2 px-6">
          <HugeiconsIcon icon={PlusSignIcon} className="size-4" strokeWidth={2} />
          Nueva Finca
        </Button>
      </div>

      {/* Tabla */}
      <TablaConPaginacion
        title="Listado de Fincas"
        icon={<HugeiconsIcon icon={Plant01Icon} className="size-5" strokeWidth={2} />}
        columns={columns}
        data={data?.fincas || []}
        isLoading={isLoading}
        currentPage={data?.pagination?.page || 1}
        totalPages={data?.pagination?.totalPages || 0}
        totalItems={data?.pagination?.totalItems || 0}
        pageSize={pageSize}
        onPageChange={setPage}
        keyExtractor={(item) => item.id_finca}
        emptyStateTitle="No se encontraron fincas"
        emptyStateMessage={debouncedSearch ? "No hay resultados para tu búsqueda." : "Hacé clic en 'Nueva Finca' para comenzar."}
      />

      {/* Modal de baja */}
      <AlertDialog open={!!fincaToDelete} onOpenChange={(open) => !open && setFincaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Dar de baja esta finca?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseás dar de baja esta finca? Todas las parcelas asociadas serán
              inactivadas automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                if (fincaToDelete) {
                  deleteFinca(fincaToDelete, {
                    onSuccess: () => {
                      setFincaToDelete(null);
                    },
                  });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Procesando...' : 'Confirmar baja'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
