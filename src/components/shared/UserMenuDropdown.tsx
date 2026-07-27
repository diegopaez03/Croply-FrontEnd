import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface UserMenuDropdownProps {
  children: React.ReactNode;
}

export function UserMenuDropdown({ children }: UserMenuDropdownProps) {
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    // TODO: cerrar sesión - pendiente de confirmar con el equipo
    console.log('TODO: cerrar sesión - pendiente de confirmar con el equipo');
  };

  const handleMiCuenta = () => {
    navigate('/perfil');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border-border">
        <DropdownMenuItem 
          onClick={handleMiCuenta}
          className="cursor-pointer text-foreground focus:bg-muted focus:text-foreground hover:bg-muted"
        >
          Mi cuenta
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleCerrarSesion}
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
