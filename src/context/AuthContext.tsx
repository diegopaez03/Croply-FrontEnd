import React, { createContext, useContext, useState, useEffect } from 'react';
import { UsuarioAuth } from '../types/auth.types';
import {
  ACCESS_TOKEN_KEY,
  parseSessionFromAccessToken,
} from '../utils/auth-token';

interface AuthContextType {
  usuario: UsuarioAuth | null;
  token: string | null;
  isAuthenticated: boolean;
  debeCambiarContrasena: boolean;
  loginState: (accessToken: string) => void;
  completarPrimerAcceso: () => void;
  logoutState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredSession() {
  const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!storedToken) {
    return { token: null, usuario: null, debeCambiarContrasena: false };
  }

  const session = parseSessionFromAccessToken(storedToken);
  if (!session) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return { token: null, usuario: null, debeCambiarContrasena: false };
  }

  return {
    token: storedToken,
    usuario: session.usuario,
    debeCambiarContrasena: session.debeCambiarContrasena,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialSession = readStoredSession();

  const [token, setToken] = useState<string | null>(initialSession.token);
  const [usuario, setUsuario] = useState<UsuarioAuth | null>(initialSession.usuario);
  const [debeCambiarContrasena, setDebeCambiarContrasena] = useState<boolean>(
    initialSession.debeCambiarContrasena,
  );

  useEffect(() => {
    // Limpieza de keys legacy (usuario / flag guardados aparte del token)
    localStorage.removeItem('usuario');
    localStorage.removeItem('debeCambiarContrasena');
  }, []);

  const logoutState = () => {
    setUsuario(null);
    setToken(null);
    setDebeCambiarContrasena(false);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem('usuario');
    localStorage.removeItem('debeCambiarContrasena');
  };

  const loginState = (accessToken: string) => {
    const session = parseSessionFromAccessToken(accessToken);
    if (!session) {
      logoutState();
      return;
    }

    setUsuario(session.usuario);
    setToken(accessToken);
    setDebeCambiarContrasena(session.debeCambiarContrasena);
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

    localStorage.removeItem('usuario');
    localStorage.removeItem('debeCambiarContrasena');
  };

  const completarPrimerAcceso = () => {
    setDebeCambiarContrasena(false);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        isAuthenticated: !!token && !!usuario,
        debeCambiarContrasena,
        loginState,
        completarPrimerAcceso,
        logoutState,
      }}
    >
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
