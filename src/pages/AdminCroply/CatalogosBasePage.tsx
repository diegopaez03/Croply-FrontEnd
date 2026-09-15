import { SeccionCultivosBase } from "./components/SeccionCultivosBase";
import { SeccionPlantillasAccion } from "./components/SeccionPlantillasAccion";
import { SeccionRolesSistema } from "./components/SeccionRolesSistema";
import { SeccionEstadosTareaBase } from "./components/SeccionEstadosTareaBase";
import { SeccionTiposTareaBase } from "./components/SeccionTiposTareaBase";
import { SeccionTiposSensor } from "./components/SeccionTiposSensor";

export default function CatalogosBasePage() {
  return (
    <div className="w-full max-w-screen-xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Catálogos Base del Sistema</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona la información centralizada de Croply y los activos fundamentales del sistema.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <SeccionCultivosBase />
        <SeccionPlantillasAccion />
        <SeccionRolesSistema />
        <SeccionEstadosTareaBase />
        <SeccionTiposTareaBase />
        <SeccionTiposSensor />
      </div>
    </div>
  );
}
