import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(1, { message: "La contraseña es requerida" })
  .min(8, { message: "Debe tener al menos 8 caracteres" })
  .regex(/[A-Z]/, { message: "Debe contener al menos una mayúscula, una minúscula y un número" })
  .regex(/[a-z]/, { message: "Debe contener al menos una mayúscula, una minúscula y un número" })
  .regex(/[0-9]/, { message: "Debe contener al menos una mayúscula, una minúscula y un número" });

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
  contrasena_temporal: passwordSchema,
  id_rol: z.preprocess((val) => (val === "" || val === undefined ? null : Number(val)), z.number().nullable().optional()),
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
  contrasena: passwordSchema,
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
  nueva_contrasena: passwordSchema,
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
  nueva_contrasena: passwordSchema,
  confirmar_contrasena: z
    .string()
    .min(1, { message: "La confirmación de la contraseña es requerida" }),
}).refine((data) => data.nueva_contrasena === data.confirmar_contrasena, {
  message: "Las contraseñas no coinciden",
  path: ["confirmar_contrasena"],
});

export type CambioContrasenaFormValues = z.infer<typeof cambioContrasenaSchema>;

export const primerAccesoSchema = z.object({
  nueva_contrasena: passwordSchema,
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

export const rolSchema = z.object({
  nombre_rol: z
    .string()
    .min(3, { message: "El nombre del rol debe tener al menos 3 caracteres" })
    .max(30, { message: "El nombre del rol no puede superar los 30 caracteres" })
    .regex(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑüÜ]+$/, { message: "El nombre del rol solo puede contener letras y números" }),
  descripcion: z.string().optional(),
  permisos: z.array(z.number()).min(1, { message: "Un rol debe contener al menos un permiso habilitado." }),
});

export type RolFormValues = z.infer<typeof rolSchema>;

export const rolFincaSchema = rolSchema;
export type RolFincaFormValues = z.infer<typeof rolFincaSchema>;

export const EPOCAS_CULTIVO = ['Todo_el_anio', 'Primavera_verano', 'Otonio_invierno'] as const;
export const FORMAS_SIEMBRA = ['Directa', 'Almacigo'] as const;

const numeroRequerido = (mensaje: string) =>
  z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z
      .number({
        required_error: mensaje,
        invalid_type_error: 'Debe ser un número válido',
      })
      .int({ message: 'Debe ser un número entero' })
      .min(1, { message: 'Debe ser mayor a 0' }),
  );

export const cultivoBaseSchema = z
  .object({
    nombre_cultivo_base: z
      .string()
      .min(1, { message: 'El nombre del cultivo es requerido' })
      .max(80, { message: 'El nombre no puede superar los 80 caracteres' }),
    descripcion_cb: z.string().min(1, { message: 'La descripción es requerida' }),
    epoca_cultivo: z.enum(EPOCAS_CULTIVO, {
      errorMap: () => ({ message: 'La temporada es requerida' }),
    }),
    forma_siembra: z.enum(FORMAS_SIEMBRA, {
      errorMap: () => ({ message: 'La forma de siembra es requerida' }),
    }),
    mes_desde: z.string().min(1, { message: 'El mes de inicio es requerido' }),
    mes_hasta: z.string().min(1, { message: 'El mes de fin es requerido' }),
    ciclo_desde: numeroRequerido('Los días a cosecha son requeridos'),
    ciclo_hasta: numeroRequerido('Los días a cosecha son requeridos'),
    imagen_url: z.string().nullable().optional(),
  })
  .refine((data) => Number(data.ciclo_hasta) >= Number(data.ciclo_desde), {
    message: 'El máximo debe ser mayor o igual al mínimo',
    path: ['ciclo_hasta'],
  });

export type CultivoBaseFormValues = z.infer<typeof cultivoBaseSchema>;

export const variedadSchema = z.object({
  nombre_variedad: z
    .string()
    .min(1, { message: 'El nombre de la variedad es requerido' })
    .max(80, { message: 'El nombre no puede superar los 80 caracteres' }),
  distancia_plantas: numeroRequerido('La distancia entre plantas es requerida'),
  distancia_surcos: numeroRequerido('La distancia entre surcos es requerida'),
  dias_a_cosecha: numeroRequerido('Los días a cosecha son requeridos'),
  observaciones: z.string().optional(),
  imagen_url: z.string().nullable().optional(),
});

export type VariedadFormValues = z.infer<typeof variedadSchema>;

const diaRelativo = z.preprocess(
  (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
  z
    .number({
      required_error: 'El día relativo es requerido',
      invalid_type_error: 'Debe ser un número válido',
    })
    .int({ message: 'Debe ser un número entero' })
    .min(0, { message: 'El día relativo no puede ser negativo' }),
);

const tareaPlantillaSchema = z
  .object({
    dia_relativo_tp: diaRelativo,
    id_tipo_tarea: z.preprocess(
      (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
      z.number({ required_error: 'El tipo de tarea es requerido' }).min(1, {
        message: 'El tipo de tarea es requerido',
      }),
    ),
    descripcion_tp: z.string().min(1, { message: 'La descripción es requerida' }),
    nombre_producto: z.string().optional(),
    dosis_aa: z.string().optional(),
  })
  .superRefine((tarea, ctx) => {
    if (Number(tarea.id_tipo_tarea) !== 5) return;
    if (!tarea.nombre_producto?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nombre_producto'],
        message: 'El producto es requerido para aplicación de agroquímico',
      });
    }
    if (!tarea.dosis_aa?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dosis_aa'],
        message: 'La dosis es requerida para aplicación de agroquímico',
      });
    }
  });

export const plantillaBaseSchema = z.object({
  nombre_pb: z
    .string()
    .min(1, { message: 'El nombre de la plantilla es requerido' })
    .max(120, { message: 'El nombre no puede superar los 120 caracteres' }),
  cultivos: z
    .array(
      z.object({
        id_cultivo_base: z.number(),
        modo_variedades: z.enum(['todas', 'especificas']),
        ids_variedades: z.array(z.number()),
      }),
    )
    .min(1, { message: 'Debés seleccionar al menos un cultivo' }),
  hitos: z
    .array(
      z.object({
        nombre_hpb: z
          .string()
          .min(1, { message: 'El nombre del hito es requerido' })
          .max(80, { message: 'El nombre del hito no puede superar los 80 caracteres' }),
        tareas: z
          .array(tareaPlantillaSchema)
          .min(1, { message: 'El hito debe tener al menos una tarea para poder guardarse.' }),
      }),
    )
    .min(1, {
      message: 'La plantilla debe tener al menos un hito con una tarea para poder guardarse.',
    }),
});

export type PlantillaBaseFormValues = z.infer<typeof plantillaBaseSchema>;

