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

export const sensorSchema = z.object({
  id_sensor: z.number().optional(),
  id_tipo_sensor: z.coerce.number().min(1, 'Obligatorio'),
  ip_sensor: z.string().min(1, 'Obligatorio').regex(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/, 'IP inválida'),
});

export const controladorSchema = z.object({
  id_controlador_sensor: z.number().optional(),
  nombre_controlador: z.string().min(1, 'Obligatorio'),
  ip_controlador: z.string().min(1, 'Obligatorio').regex(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/, 'IP inválida'),
  sensores: z.array(sensorSchema).min(1, 'Debe agregar al menos 1 sensor'),
});

export const parcelaSchema = z.object({
  nombre_parcela: z.string().min(1, 'Obligatorio'),
  superficie_parcela: z.coerce.number().min(0.01, 'Mayor a 0'),
  controladores: z.array(controladorSchema).min(1, 'Debe agregar al menos 1 controlador'),
});

export type CrearEditarParcelaFormValues = z.infer<typeof parcelaSchema>;

export const fincaCrearSchema = z.object({
  nombre_finca: z.string().min(1, 'El nombre es obligatorio'),
  provincia: z.string().min(1, 'La provincia es obligatoria'),
  departamento: z.string().min(1, 'El departamento es obligatorio'),
  latitud: z.string().min(1, 'La latitud es obligatoria'),
  longitud: z.string().min(1, 'La longitud es obligatoria'),
  superficie_finca: z.coerce.number().min(0.01, 'La superficie debe ser mayor a 0'),
  descripcion_finca: z.string().optional(),
  id_usuario_propietario: z.string().optional(),
  parcelas: z.array(parcelaSchema).optional().default([]),
}).superRefine((data, ctx) => {
  if (data.parcelas && data.parcelas.length > 0) {
    const totalParcelas = data.parcelas.reduce((acc, p) => acc + (p.superficie_parcela || 0), 0);
    if (totalParcelas > data.superficie_finca) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `La superficie total de parcelas (${totalParcelas.toFixed(2)} ha) excede la superficie de la finca (${data.superficie_finca} ha)`,
        path: ['parcelas'],
      });
      if (data.parcelas.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Excede total (${data.superficie_finca} ha)`,
          path: ['parcelas', data.parcelas.length - 1, 'superficie_parcela'],
        });
      }
    }
  }
});

export type FincaCrearFormValues = z.infer<typeof fincaCrearSchema>;

export const asignacionVariedadSchema = z.object({
  id_variedad: z.coerce.number().min(1, 'Obligatorio'),
  superficie_asignada: z.coerce.number().min(0.01, 'Debe ser mayor a 0'),
});

export const generarPlanAccionSchema = z.object({
  id_finca: z.coerce.number().min(1, 'Obligatorio'),
  id_parcela: z.coerce.number().min(1, 'Obligatorio'),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
  asignaciones: z.array(asignacionVariedadSchema).min(1, 'Debe asignar al menos una variedad'),
  superficie_disponible: z.number().optional(),
});

export type GenerarPlanAccionFormValues = z.infer<typeof generarPlanAccionSchema>;
