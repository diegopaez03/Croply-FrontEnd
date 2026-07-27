import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import logoImg from '../../../assets/images/LogoCroplyHoriz.svg';

export default function LandingNavbar() {
  const navigate = useNavigate();

  return (
    <nav className="w-full h-[110px] bg-background flex items-center justify-between px-6 md:px-12 lg:px-24 border-b border-border">
      <Link to="/" className="flex items-center">
        <img src={logoImg} alt="Croply Logo" className="h-14 w-auto" />
      </Link>
      
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/login')}
          className="font-medium text-foreground hover:bg-primary/10 hover:text-primary h-12 px-6 text-primary border border-primary"
        >
          Iniciar Sesión
        </Button>
        <Button 
          onClick={() => navigate('/digitalizar-finca')}
          className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
        >
          Digitalizá tu finca
        </Button>
      </div>
    </nav>
  );
}
