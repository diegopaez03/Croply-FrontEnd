import { Link } from 'react-router-dom';
import logoImg from '../../../assets/images/LogoCroplyHoriz.svg';

export default function LandingFooter() {
  const columns = [
    {
      title: 'Producto',
      links: ['Plataforma', 'Sensores IoT', 'Precios', 'Casos de éxito']
    },
    {
      title: 'Compañía',
      links: ['Sobre nosotros', 'Carreras', 'Blog', 'Prensa']
    }
  ];

  return (
    <footer className="w-full bg-background border-t border-border pt-16 pb-8 px-6 md:px-12 lg:px-24">
      <div className="max-w-2xl mx-auto flex flex-col md:flex-row md:items-center gap-12 mb-16">
  
        {/* Logo */}
        <div className="flex flex-col">
          <Link to="/">
            <img src={logoImg} alt="Croply Logo" className="h-16 w-auto" />
          </Link>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-12 md:gap-24">
          {columns.map((col, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <h4 className="font-semibold text-foreground">{col.title}</h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <button 
                      onClick={() => console.log(`TODO: Footer link - ${link}`)}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-border flex justify-center text-center">
        <p className="text-sm text-muted-foreground">
          © 2026 Croply. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}