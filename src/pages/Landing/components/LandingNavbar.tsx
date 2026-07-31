import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../context/AuthContext';
import logoImg from '../../../assets/images/LogoCroplyHoriz2.svg';

export default function LandingNavbar() {
  const navigate = useNavigate();
  const { isAuthenticated, usuario } = useAuth();

  const handleDashboardRedirect = () => {
    if (usuario?.rol_sistema) {
      navigate('/admin-croply/dashboard');
    } else {
      navigate('/admin-finca/mi-finca');
    }
  };

  return (
    <nav className="w-full h-20 md:h-[110px] bg-background flex items-center justify-between px-4 md:px-12 lg:px-24 border-b border-border">
      <Link to="/" className="flex items-center">
        <img src={logoImg} alt="Croply Logo" className="h-10 md:h-14 w-auto" />
      </Link>
      
      <div className="flex items-center gap-2 md:gap-4">
        {isAuthenticated ? (
          <Button 
            variant="outline" 
            onClick={handleDashboardRedirect}
            className="font-medium text-primary hover:bg-primary/10 hover:text-primary h-9 px-3 text-xs md:h-12 md:px-6 md:text-sm border border-primary"
          >
            Ir al Dashboard
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => navigate('/login')}
            className="font-medium text-primary hover:bg-primary/10 hover:text-primary h-9 px-3 text-xs md:h-12 md:px-6 md:text-sm border border-primary"
          >
            Iniciar Sesión
          </Button>
        )}
        <Button 
          onClick={() => navigate('/digitalizar-finca')}
          className="h-9 px-3 text-xs md:h-12 md:px-6 md:text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
        >
          Digitalizá tu finca
        </Button>
      </div>
    </nav>
  );
}
