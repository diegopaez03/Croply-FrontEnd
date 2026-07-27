import React, { createContext, useContext, useState } from 'react';
import { UsuarioAuth } from '../types/auth.types';

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
  const [usuario, setUsuario] = useState<UsuarioAuth | null>(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse stored user', e);
        return null;
      }
    }
    return null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('accessToken');
  });

  const [debeCambiarContrasena, setDebeCambiarContrasena] = useState<boolean>(() => {
    return localStorage.getItem('debeCambiarContrasena') === 'true';
  });

  const loginState = (newUsuario: UsuarioAuth, newToken: string, debeCambiar: boolean = false) => {
    setUsuario(newUsuario);
    setToken(newToken);
    setDebeCambiarContrasena(debeCambiar);
    localStorage.setItem('accessToken', newToken);
    localStorage.setItem('usuario', JSON.stringify(newUsuario));
    localStorage.setItem('debeCambiarContrasena', String(debeCambiar));
  };

  const completarPrimerAcceso = () => {
    setDebeCambiarContrasena(false);
    localStorage.setItem('debeCambiarContrasena', 'false');
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
      isAuthenticated: !!token, 
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
