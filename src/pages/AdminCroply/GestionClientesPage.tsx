import { useState } from 'react';
import { CardMetrica } from '../../components/shared/CardMetrica';
import { SearchBar } from '../../components/shared/SearchBar';
import { TablaConPaginacion } from '../../components/shared/TablaConPaginacion';
import { RegistrarClienteModal } from './components/RegistrarClienteModal';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserGroupIcon, CheckmarkCircle02Icon, MoreHorizontalCircle02Icon } from '@hugeicons/core-free-icons';

export default function GestionClientesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Buscar cliente" 
             />
          </div>
          
          <div className="flex gap-4">
            <select className="h-9 bg-card border border-border rounded-lg px-3 text-sm text-muted-foreground outline-none w-full sm:w-40">
              <option>Rol: Todos</option>
            </select>
            <select className="h-9 bg-card border border-border rounded-lg px-3 text-sm text-muted-foreground outline-none w-full sm:w-40">
              <option>Estado: Todos</option>
            </select>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground font-bold text-sm h-10 px-6 rounded-lg whitespace-nowrap w-full sm:w-auto hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-lg leading-none">+</span>
          Agregar Cliente
        </button>
      </div>

      {/* Table */}
      <div className="w-full">
        <TablaConPaginacion />
      </div>

      {/* Modal */}
      <RegistrarClienteModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
