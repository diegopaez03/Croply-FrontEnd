import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight02Icon } from '@hugeicons/core-free-icons';
import heroBg from '../../../assets/images/FondoLanding.png';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full h-[600px] md:h-[840px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto space-y-14 mt-12 md:mt-24">
        <h1 className="text-4xl md:text-6xl lg:text-6xl font-bold text-white leading-tight tracking-tight drop-shadow-sm">
          Digitalizá tu finca y tomá el control de tu producción.
        </h1>
        <p className="text-lg md:text-xl text-white/90 font-medium max-w-3xl leading-relaxed">
          Potenciamos el agro con sensores IoT y modelos de Inteligencia Artificial diseñados para maximizar tu rendimiento y optimizar recursos en tiempo real.
        </p>
        <div className="pt-4">
          <Button 
          onClick={() => navigate('/digitalizar-finca')}
          className="h-16 px-8 text-lg bg-card hover:bg-primary/90 text-primary hover:text-primary-foreground font-semibold rounded-xl shadow-lg transition-all hover:scale-105 gap-3 group"
        >
          Solicitá la digitalización de tu finca
          <HugeiconsIcon icon={ArrowRight02Icon} className="w-6 h-6 transition-transform group-hover:translate-x-1" />
        </Button>
        </div>
      </div>
    </section>
  );
}
