export interface UsuarioListado {
  id_usuario: number;
  id_usuario_finca?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: { id_rol: number; nombre_rol: string } | null;
  estado: "Pendiente" | "Activo" | "Inactivo" | "Aprobada" | "Rechazada";
}

export interface GetUsuariosRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  id_rol?: number | string;
  estado?: string;
}

export interface GetUsuariosResponse {
  usuarios: UsuarioListado[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ActualizarEstadoRequest {
  estado: "Activo" | "Inactivo" | "Pendiente";
}

export interface ActualizarEstadoResponse {
  message: string;
  id_usuario: number;
  estado: "Activo" | "Inactivo" | "Pendiente";
}

export interface ActualizarPerfilRequest {
  nombre: string;
  apellido: string;
  telefono?: string;
}

export interface ActualizarPerfilResponse {
  message: string;
  usuario: {
    nombre: string;
    apellido: string;
    telefono?: string;
  };
}

export interface PerfilResponse {
  id_usuario: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  estado: string;
  rol_sistema?: string | null;
  fecha_alta: string;
}
