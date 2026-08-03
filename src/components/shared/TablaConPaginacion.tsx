
import { HugeiconsIcon } from '@hugeicons/react';
import { UserListIcon, PencilEdit02Icon, Delete02Icon, ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

// TODO: Implementar en HU-GU-08
export function TablaConPaginacion() {
  return (
    <div className="bg-white border border-border rounded-xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] w-full flex flex-col">
      {/* Table Header / Tabs placeholder */}
      <div className="bg-white border-b border-border h-14 px-6">
        <div className="flex gap-8 h-full">
          <div className="border-b-2 border-primary flex items-center justify-center pt-4 pb-4">
            <p className="text-primary font-bold text-base">Administradores</p>
          </div>
          <div className="flex items-center justify-center py-4 cursor-not-allowed opacity-50">
            <p className="text-foreground text-base">Solicitudes de Clientes</p>
          </div>
        </div>
      </div>

      {/* Table Title and Pagination summary */}
      <div className="bg-muted/50 border-b border-border px-6 py-6 flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <div className="text-primary">
            <HugeiconsIcon icon={UserListIcon} className="size-6" strokeWidth={1.5} />
          </div>
          <h2 className="text-primary font-semibold text-xl font-sans">Lista de Administradores</h2>
        </div>
        <p className="text-muted-foreground text-sm font-normal font-sans">Mostrando 1-10 de 124 registros</p>
      </div>

      {/* Table content (Mock for layout) */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[970px]">
          <thead className="bg-muted/80">
            <tr>
              <th className="border-b border-border py-4 px-4 text-muted-foreground font-semibold text-sm font-sans">Nombre</th>
              <th className="border-b border-border py-4 px-4 text-muted-foreground font-semibold text-sm font-sans text-center">Email</th>
              <th className="border-b border-border py-4 px-4 text-muted-foreground font-semibold text-sm font-sans text-center">Teléfono</th>
              <th className="border-b border-border py-4 px-4 text-muted-foreground font-semibold text-sm font-sans text-center">Rol</th>
              <th className="border-b border-border py-4 px-4 text-muted-foreground font-semibold text-sm font-sans">Estado de cuenta</th>
              <th className="border-b border-border py-4 px-4 text-muted-foreground font-semibold text-sm font-sans text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Carlos Mendoza", email: "c.mendoza@agroterra.com", phone: "+54 114555-0123", role: "---", status: "PENDIENTE", color: "bg-[#ffee9c] border-[#e9c162] text-muted-foreground" },
              { name: "María Eugenia Lopez", email: "m.lopez@estancia-sol.cl", phone: "+54 114555-0123", role: "Administrador de Sistema", status: "ACTIVO", color: "bg-[#dcfce7] border-[#bbf7d0] text-[#15803d]" },
              { name: "Roberto Sanchez", email: "rsanchez@campo-verde.ar", phone: "+54 114555-0123", role: "Administrador de Sistema", status: "INACTIVO", color: "bg-[#f3f4f6] border-[#d1d5db] text-[#4b5563]" },
              { name: "Lucía Fernández", email: "lfernandez@pampa.com.ar", phone: "+54 119988-7766", role: "Administrador de Sistema", status: "ACTIVO", color: "bg-[#dcfce7] border-[#bbf7d0] text-[#15803d]" },
            ].map((row, idx) => (
              <tr key={idx} className="bg-white">
                <td className="border-b border-border py-4 px-4 font-semibold text-base font-sans leading-6">{row.name}</td>
                <td className="border-b border-border py-4 px-4 text-center text-base font-sans leading-6 text-foreground">{row.email}</td>
                <td className="border-b border-border py-4 px-4 text-center text-base font-sans leading-6 text-foreground">{row.phone}</td>
                <td className="border-b border-border py-4 px-4 text-center text-base font-sans leading-6 text-foreground">{row.role}</td>
                <td className="border-b border-border py-4 px-4">
                  <span className={`px-3.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider font-sans ${row.color}`}>
                    {row.status}
                  </span>
                </td>
                <td className="border-b border-border py-4 px-4 text-center">
                  <div className="flex gap-2 justify-center">
                    <button className="p-2 text-muted-foreground hover:bg-muted rounded-md opacity-50 cursor-not-allowed"><HugeiconsIcon icon={PencilEdit02Icon} className="size-6" strokeWidth={1.5} /></button>
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-md opacity-50 cursor-not-allowed"><HugeiconsIcon icon={Delete02Icon} className="size-6" strokeWidth={1.5} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-muted/50 px-6 py-4 flex justify-between items-center border-t border-border">
        <p className="text-muted-foreground text-sm font-sans">Página 1 de 13</p>
        <div className="flex gap-2 items-center">
          <button className="flex items-center justify-center size-8 rounded border border-border bg-white text-muted-foreground hover:bg-muted disabled:opacity-50" disabled>
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={1.5} />
          </button>
          <button className="flex items-center justify-center size-8 rounded bg-primary text-primary-foreground font-semibold">1</button>
          <button className="flex items-center justify-center size-8 rounded bg-transparent text-muted-foreground hover:bg-muted font-semibold">2</button>
          <button className="flex items-center justify-center size-8 rounded bg-transparent text-muted-foreground hover:bg-muted font-semibold">3</button>
          <button className="flex items-center justify-center size-8 rounded border border-border bg-white text-muted-foreground hover:bg-muted">
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
