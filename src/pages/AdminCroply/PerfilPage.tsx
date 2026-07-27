import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { CambiarContrasenaModal } from './components/CambiarContrasenaModal';
import { HugeiconsIcon } from '@hugeicons/react';
import { Settings01Icon, UserCircleIcon, Shield01Icon } from '@hugeicons/core-free-icons';

export default function PerfilPage() {
  return (
    <div className="flex-1 p-6 md:p-8 overflow-auto flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Header de la página */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HugeiconsIcon icon={Settings01Icon} className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Mi cuenta</h1>
            <p className="text-sm text-muted-foreground">
              Gestioná tu información personal y la seguridad de tu cuenta.
            </p>
          </div>
        </div>

        <Tabs defaultValue="basica" className="w-full">
          <TabsList className="w-full justify-start h-auto p-1 bg-transparent border-b border-border rounded-none gap-4">
            <TabsTrigger 
              value="basica"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={UserCircleIcon} className="h-4 w-4" />
                Información básica
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="seguridad"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Shield01Icon} className="h-4 w-4" />
                Seguridad
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basica" className="mt-6">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <h2 className="text-lg font-semibold text-foreground">Información personal</h2>
                <p className="text-sm text-muted-foreground">
                  Actualizá tus datos personales y de contacto.
                </p>
              </CardHeader>
              <CardContent>
                {/* TODO: Implementar en HU-GU-11 */}
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-lg bg-muted/30">
                  <p className="text-sm font-medium text-muted-foreground">
                    Formulario de información básica en desarrollo...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Implementación pendiente: HU-GU-11)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seguridad" className="mt-6">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <h2 className="text-lg font-semibold text-foreground">Seguridad de la cuenta</h2>
                <p className="text-sm text-muted-foreground">
                  Gestioná la contraseña de tu cuenta para mantener tu información segura.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border rounded-lg bg-card">
                  <div className="space-y-1">
                    <h3 className="font-medium text-foreground text-sm">Contraseña</h3>
                    <p className="text-sm text-muted-foreground">
                      Actualizá tu contraseña regularmente para mayor seguridad.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <CambiarContrasenaModal />
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
