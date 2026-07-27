import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="w-full py-24 bg-background text-primary">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-8 flex flex-col items-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          ¿Listo para transformar tu producción?
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
          <Button 
            onClick={() => navigate('/digitalizar-finca')}
            className="w-full sm:w-auto h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl"
          >
            Solicitar Demostración
          </Button>
          <Button 
            onClick={() => console.log('TODO: Hablar con un experto')}
            variant="outline"
            className="w-full sm:w-auto h-14 px-8 text-lg bg-transparent text-primary border-primary hover:bg-primary/10 hover:text-primary font-semibold rounded-xl"
          >
            Hablar con un experto
          </Button>
        </div>
        
        <p className="text-muted-foreground font-medium">
          Sin compromisos. Analizamos tu finca de forma personalizada.
        </p>
      </div>
    </section>
  );
}
