import { Outlet } from 'react-router-dom';
import bgImage from '../../assets/images/FondoLogin-Register.svg';

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-8 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={bgImage}
          alt="Fondo agrícola"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
}
