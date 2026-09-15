import { HugeiconsIcon } from "@hugeicons/react";
import { CheckListIcon } from "@hugeicons/core-free-icons";
import { CatalogoListaSimple } from "@/components/shared/CatalogoListaSimple";

export function SeccionEstadosTareaBase() {
  const dummyItems = [
    { id: 1, label: "Planificado", pillColor: "bg-orange-100/50 text-orange-700" },
    { id: 2, label: "En Progreso", pillColor: "bg-blue-100/50 text-blue-700" },
    { id: 3, label: "Completado", pillColor: "bg-green-100/50 text-green-700" },
  ];

  return (
    <CatalogoListaSimple
      icono={<HugeiconsIcon icon={CheckListIcon} className="size-6" />}
      titulo="Estados de tareas base"
      descripcion="Listado de ciclo de vida de las tareas utilizadas en los planes de accion"
      items={dummyItems}
      textoBotonAgregar="Agregar"
      onAgregar={() => console.log('TODO: Implementar agregar en futura HU')}
      onEditar={() => console.log('TODO: Implementar editar en futura HU')}
      onEliminar={() => console.log('TODO: Implementar eliminar en futura HU')}
    />
  );
}
