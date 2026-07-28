import React, { createContext, useContext, useState, useEffect } from 'react';
import { UsuarioAuth } from '../types/auth.types';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  usuario: UsuarioAuth;
  debe_cambiar_contrasena?: boolean;
}

interface AuthContextType {
  usuario: UsuarioAuth | null;
  token: string | null;
  isAuthenticated: boolean;
  debeCambiarContrasena: boolean;
  loginState: (usuario: UsuarioAuth, token: string, debeCambiarContrasena?: boolean) => void;
  completarPrimerAcceso: () => void;
  logoutState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('accessToken');
  });

  const [usuario, setUsuario] = useState<UsuarioAuth | null>(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        return decoded.usuario || null;
      } catch (err) {
        return null;
      }
    }
    return null;
  });

  const [debeCambiarContrasena, setDebeCambiarContrasena] = useState<boolean>(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        return decoded.debe_cambiar_contrasena || false;
      } catch (err) {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      try {
        jwtDecode<DecodedToken>(storedToken);
      } catch (err) {
        // Token inválido o corrupto -> auto logout
        logoutState();
      }
    }
    
    // Limpieza de keys viejas en caso de que existan
    localStorage.removeItem('usuario');
    localStorage.removeItem('debeCambiarContrasena');
  }, []);

  const loginState = (newUsuario: UsuarioAuth, newToken: string, debeCambiar: boolean = false) => {
    setUsuario(newUsuario);
    setToken(newToken);
    setDebeCambiarContrasena(debeCambiar);
    localStorage.setItem('accessToken', newToken);
    
    // Nos aseguramos de limpiar cualquier dato legacy
    localStorage.removeItem('usuario');
    localStorage.removeItem('debeCambiarContrasena');
  };

  const completarPrimerAcceso = () => {
    setDebeCambiarContrasena(false);
    // En el mundo real, acá el backend debería mandar un nuevo token JWT 
    // donde debe_cambiar_contrasena venga en false. Por ahora limpiamos local.
  };

  const logoutState = () => {
    setUsuario(null);
    setToken(null);
    setDebeCambiarContrasena(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('usuario');
    localStorage.removeItem('debeCambiarContrasena');
  };

  return (
    <AuthContext.Provider value={{ 
      usuario, 
      token, 
      isAuthenticated: !!token && !!usuario, 
      debeCambiarContrasena,
      loginState, 
      completarPrimerAcceso,
      logoutState 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
