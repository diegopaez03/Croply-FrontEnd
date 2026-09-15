import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { CatalogoListaSimple } from "@/components/shared/CatalogoListaSimple";

export function SeccionTiposTareaBase() {
  const dummyItems = [
    { id: 1, label: "Siembra" },
    { id: 2, label: "Riego" },
    { id: 3, label: "Fertilización" },
    { id: 4, label: "Control de Plagas" },
    { id: 5, label: "Cosecha" },
  ];

  return (
    <CatalogoListaSimple
      icono={<HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-6" />}
      titulo="Tipos de Tareas Base"
      descripcion="Gestión de los tipos de actividades disponibles para los planes de acción."
      items={dummyItems}
      textoBotonAgregar="Agregar"
      onAgregar={() => console.log('TODO: Implementar agregar en futura HU')}
      onEditar={() => console.log('TODO: Implementar editar en futura HU')}
      onEliminar={() => console.log('TODO: Implementar eliminar en futura HU')}
    />
  );
}
