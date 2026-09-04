/**
 * TODO LO QUE SE CAMBIA A MANO ESTÁ EN ESTE ARCHIVO.
 * No hace falta tocar nada más para cambiar un curso, un precio o un vídeo.
 *
 * Lo que ponga `PENDIENTE` sale marcado en rojo en la web, para que se vea de un
 * vistazo qué falta por rellenar. En cuanto pongas el dato de verdad, la etiqueta
 * desaparece sola.
 */

export const PENDIENTE = 'PENDIENTE';

export const CONTACTO = {
  /** Correo al que se escribe la gente si algo falla. */
  email: 'hola@irissoares.com',
  /** Con prefijo y sin espacios: 34600111222. Vacío = no se muestra el botón de WhatsApp. */
  whatsapp: '',
};

/* ------------------------------------------------------------------ */
/*  MEMBRESÍA — lista de espera                                        */
/* ------------------------------------------------------------------ */

export const MEMBRESIA = {
  /** Lo que costará cuando abra. */
  precio: 67,
  /** Lo que pagan los que reservan ahora desde la lista de espera. */
  precioReserva: 33,
  /**
   * Lo que incluye la membresía. Cada línea que dejes como PENDIENTE sale
   * marcada en rojo. Añade o quita las que quieras.
   */
  incluye: [PENDIENTE, PENDIENTE, PENDIENTE],
};

/* ------------------------------------------------------------------ */
/*  CURSOS Y TALLERES                                                  */
/* ------------------------------------------------------------------ */

export type Curso = {
  /** Se usa en la URL interna (#id). Sin espacios ni acentos. */
  id: string;
  titulo: string;
  /** Una frase corta: qué se lleva la persona. */
  claim: string;
  /** Texto libre: "27, 28 y 29 de septiembre" */
  fechas: string;
  /** "18:00 → 21:00 (hora española)" */
  horario: string;
  /** "3 tardes · 9 h en directo" */
  duracion: string;
  /** En euros. null = todavía sin precio. */
  precio: number | null;
  /** Plazas totales. null = no se muestra contador. */
  plazas: number | null;
  /**
   * Enlace del vídeo de presentación, tal cual lo da YouTube o Vimeo al
   * pulsar Compartir → Insertar (el que empieza por https://www.youtube.com/embed/...).
   * Vacío = sale el hueco marcado como pendiente.
   */
  videoUrl: string;
  /** Descripción larga, uno o dos párrafos. */
  descripcion: string;
  /** Lo que se ve en el curso, punto por punto. */
  bloques: { t: string; d: string }[];
};

export const CURSOS: Curso[] = [
  {
    id: 'proximo',
    titulo: PENDIENTE,
    claim: PENDIENTE,
    fechas: PENDIENTE,
    horario: PENDIENTE,
    duracion: PENDIENTE,
    precio: null,
    plazas: null,
    videoUrl: '',
    descripcion: PENDIENTE,
    bloques: [
      { t: PENDIENTE, d: PENDIENTE },
      { t: PENDIENTE, d: PENDIENTE },
      { t: PENDIENTE, d: PENDIENTE },
    ],
  },
];

/** true si el valor sigue sin rellenar. */
export const falta = (v: unknown) => v === PENDIENTE || v === null || v === '' || v === undefined;

export const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: true }).format(n);
