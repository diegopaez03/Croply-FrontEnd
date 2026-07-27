import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo electrónico es requerido" })
    .email({ message: "Debe ser un correo electrónico válido" }),
  contrasena: z
    .string()
    .min(1, { message: "La contraseña es requerida" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerAdminFincaSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre es requerido" }),
  apellido: z.string().min(1, { message: "El apellido es requerido" }),
  email: z
    .string()
    .min(1, { message: "El correo electrónico es requerido" })
    .email({ message: "Debe ser un correo electrónico válido" }),
  telefono: z.string().optional(),
  contrasena_temporal: z
    .string()
    .min(1, { message: "La contraseña temporal es requerida" })
    .min(8, { message: "Debe tener al menos 8 caracteres" }),
  id_Rol: z.preprocess((val) => (val === "" || val === undefined ? null : Number(val)), z.number().nullable().optional()),
  estado: z.enum(["Activo", "Pendiente", "Inactivo"], {
    required_error: "El estado es requerido",
  }).default("Pendiente"),
});

export type RegisterAdminFincaFormValues = z.infer<typeof registerAdminFincaSchema>;

export const registroInvitadoSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre es requerido" }),
  apellido: z.string().min(1, { message: "El apellido es requerido" }),
  email: z
    .string()
    .min(1, { message: "El correo electrónico es requerido" })
    .email({ message: "Debe ser un correo electrónico válido" }),
  contrasena: z
    .string()
    .min(1, { message: "La contraseña es requerida" })
    .min(8, { message: "Debe tener al menos 8 caracteres" }),
  confirmarContrasena: z
    .string()
    .min(1, { message: "La confirmación de la contraseña es requerida" }),
}).refine((data) => data.contrasena === data.confirmarContrasena, {
  message: "Las contraseñas no coinciden",
  path: ["confirmarContrasena"],
});

export type RegistroInvitadoFormValues = z.infer<typeof registroInvitadoSchema>;

export const olvideContrasenaSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo electrónico es requerido" })
    .email({ message: "Debe ser un correo electrónico válido" }),
});

export type OlvideContrasenaFormValues = z.infer<typeof olvideContrasenaSchema>;

export const resetearContrasenaSchema = z.object({
  nueva_contrasena: z
    .string()
    .min(1, { message: "La contraseña es requerida" })
    .min(8, { message: "Debe tener al menos 8 caracteres" }),
  confirmar_contrasena: z
    .string()
    .min(1, { message: "La confirmación de la contraseña es requerida" }),
}).refine((data) => data.nueva_contrasena === data.confirmar_contrasena, {
  message: "Las contraseñas no coinciden",
  path: ["confirmar_contrasena"],
});

export type ResetearContrasenaFormValues = z.infer<typeof resetearContrasenaSchema>;

export const cambioContrasenaSchema = z.object({
  contrasena_actual: z
    .string()
    .min(1, { message: "La contraseña actual es requerida" }),
  nueva_contrasena: z
    .string()
    .min(1, { message: "La nueva contraseña es requerida" })
    .min(8, { message: "Debe tener al menos 8 caracteres" }),
  confirmar_contrasena: z
    .string()
    .min(1, { message: "La confirmación de la contraseña es requerida" }),
}).refine((data) => data.nueva_contrasena === data.confirmar_contrasena, {
  message: "Las contraseñas no coinciden",
  path: ["confirmar_contrasena"],
});

export type CambioContrasenaFormValues = z.infer<typeof cambioContrasenaSchema>;

export const primerAccesoSchema = z.object({
  nueva_contrasena: z
    .string()
    .min(1, { message: "La nueva contraseña es requerida" })
    .min(8, { message: "Debe tener al menos 8 caracteres" }),
  confirmar_contrasena: z
    .string()
    .min(1, { message: "La confirmación de la contraseña es requerida" }),
}).refine((data) => data.nueva_contrasena === data.confirmar_contrasena, {
  message: "Las contraseñas no coinciden",
  path: ["confirmar_contrasena"],
});

export type PrimerAccesoFormValues = z.infer<typeof primerAccesoSchema>;

export const solicitudDigitalizacionSchema = z.object({
  nombre_completo: z.string().min(1, { message: "El nombre completo es requerido" }),
  correo_electronico: z
    .string()
    .min(1, { message: "El correo electrónico es requerido" })
    .email({ message: "Debe ser un correo electrónico válido" }),
  telefono_contacto: z.string().min(1, { message: "El teléfono es requerido" }),
  provincia: z.string().min(1, { message: "La provincia es requerida" }),
  departamento: z.string().min(1, { message: "El departamento es requerido" }),
  localidad: z.string().min(1, { message: "La localidad es requerida" }),
  numero_parcelas: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number({
    required_error: "El número de parcelas es requerido",
    invalid_type_error: "Debe ser un número válido",
  }).min(1, { message: "Debe tener al menos 1 parcela" })),
  superficie_total_hectareas: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number({
    required_error: "La superficie total es requerida",
    invalid_type_error: "Debe ser un número válido",
  }).min(0.1, { message: "La superficie debe ser mayor a 0" })),
  comentario_adicional: z.string().optional(),
});

export type SolicitudDigitalizacionFormValues = z.infer<typeof solicitudDigitalizacionSchema>;
