import { jwtDecode } from 'jwt-decode';
import { AuthJwtPayload, AuthSession, UsuarioAuth } from '../types/auth.types';

export const ACCESS_TOKEN_KEY = 'accessToken';

function mapPayloadToUsuario(payload: AuthJwtPayload): UsuarioAuth {
  return {
    id_usuario: payload.sub,
    email: payload.email,
    nombre: payload.nombre,
    apellido: payload.apellido,
    estado: payload.estado,
    fecha_alta: payload.fecha_alta,
    rol_sistema: payload.rol_sistema,
    fincas: payload.fincas ?? [],
  };
}

function isPayloadValid(payload: AuthJwtPayload): boolean {
  if (payload.sub == null || !payload.email) {
    return false;
  }

  if (payload.exp != null && payload.exp * 1000 <= Date.now()) {
    return false;
  }

  return true;
}

/**
 * Decodifica el accessToken y construye la sesión de la app.
 * Solo se persiste el token; el resto se deriva de sus claims.
 */
export function parseSessionFromAccessToken(token: string): AuthSession | null {
  try {
    const payload = jwtDecode<AuthJwtPayload>(token);

    if (!isPayloadValid(payload)) {
      return null;
    }

    return {
      usuario: mapPayloadToUsuario(payload),
      debeCambiarContrasena: Boolean(payload.debe_cambiar_contrasena),
    };
  } catch {
    return null;
  }
}
