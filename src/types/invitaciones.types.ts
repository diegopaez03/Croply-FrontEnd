export interface CrearInvitacionRequest {
  email_invitado: string;
  id_rol: number;
}

export interface InvitacionResponse {
  message: string;
  id_invitacion_finca?: number;
}
