export interface LoginRequest {
  email: string;
  contrasena: string;
}

export interface FincaRol {
  id_Finca: number;
  nombre_finca: string;
  rol_finca: string;
}

export interface UsuarioAuth {
  id_Usuario: number;
  email: string;
  nombre: string;
  apellido: string;
  estado: "Activo" | "Pendiente" | "Inactivo";
  fecha_alta: string;
  rol_sistema: string | null;
  fincas: FincaRol[];
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  debe_cambiar_contrasena: boolean;
  usuario: UsuarioAuth;
}

export interface RegisterAdminFincaRequest {
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  contrasena_temporal: string;
  id_Rol?: number | null;
  estado: "Activo" | "Pendiente" | "Inactivo";
}

export interface RegisterAdminFincaResponse {
  message: string;
  id_Usuario: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  estado: "Activo" | "Pendiente" | "Inactivo";
  id_Rol?: number | null;
  fecha_alta: string;
  fecha_baja?: string | null;
}

export interface ValidarInvitacionResponse {
  valido: boolean;
  email_invitado: string;
  id_InvitacionFinca: number;
}

export interface RegistrarInvitadoRequest {
  id_InvitacionFinca: number;
  nombre: string;
  apellido: string;
  contrasena: string;
}

export interface RegistrarInvitadoResponse {
  message: string;
  usuario: {
    id_Usuario: number;
    email: string;
    nombre: string;
    apellido: string;
    estado: "Activo" | "Pendiente" | "Inactivo";
    fecha_alta: string;
  };
}

export interface OlvideContrasenaRequest {
  email: string;
}

export interface OlvideContrasenaResponse {
  message: string;
}

export interface ResetearContrasenaRequest {
  token_hash: string;
  nueva_contrasena: string;
  confirmar_contrasena: string;
}

export interface ResetearContrasenaResponse {
  success: boolean;
  message: string;
}

export interface CambioContrasenaRequest {
  contrasena_actual: string;
  nueva_contrasena: string;
  confirmar_contrasena: string;
}

export interface CambioContrasenaResponse {
  message: string;
}

export interface ContrasenaPrimerAccesoRequest {
  nueva_contrasena: string;
  confirmar_contrasena: string;
}

export interface ContrasenaPrimerAccesoResponse {
  message: string;
}
