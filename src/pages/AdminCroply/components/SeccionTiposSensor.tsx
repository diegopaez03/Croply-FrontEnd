import { HugeiconsIcon } from "@hugeicons/react";
import { Wifi01Icon } from "@hugeicons/core-free-icons";
import { CatalogoListaSimple } from "@/components/shared/CatalogoListaSimple";

export function SeccionTiposSensor() {
  const dummyItems = [
    { id: 1, label: "Temperatura y Humedad Ambiental" },
    { id: 2, label: "Humedad de Suelo" },
    { id: 3, label: "Radiación Solar" },
    { id: 4, label: "Precipitación" },
    { id: 5, label: "pH del Suelo" },
  ];

  return (
    <CatalogoListaSimple
      icono={<HugeiconsIcon icon={Wifi01Icon} className="size-6" />}
      titulo="Tipos de Sensores Base"
      descripcion="Gestión de los dispositivos de monitoreo climático y de suelo compatibles con el sistema."
      items={dummyItems}
      textoBotonAgregar="Agregar"
      onAgregar={() => console.log('TODO: Implementar agregar en futura HU')}
      onEditar={() => console.log('TODO: Implementar editar en futura HU')}
      onEliminar={() => console.log('TODO: Implementar eliminar en futura HU')}
    />
  );
}
