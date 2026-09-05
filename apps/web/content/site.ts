/**
 * TODO LO QUE SE CAMBIA A MANO ESTÁ EN ESTE ARCHIVO.
 * No hace falta tocar nada más para cambiar un curso, un precio o un vídeo.
 *
 * Lo que ponga `PENDIENTE` sale marcado en rojo en la web, para que se vea de un
 * vistazo qué falta por rellenar. En cuanto pongas el dato de verdad, la etiqueta
 * desaparece sola.
 */

export const PENDIENTE = 'PENDIENTE';

/**
 * Logo de la Escuela de Sabiduría 33, en dos versiones y las dos sin fondo.
 * LOGO va sobre el negro de la web: es la versión en blanco, de una sola tinta.
 * LOGO_COLOR va sobre el papel blanco del informe: conserva los colores.
 * Si falta el archivo, la página y el informe salen igual, solo que sin símbolo.
 */
export const LOGO = '/images/logo-33-blanco.png';
export const LOGO_COLOR = '/images/logo-33.png';

/**
 * FOTOS DE IRIS
 * Guarda los archivos en `public/images/` con estos nombres exactos.
 * El que no exista sale como un hueco discreto, sin romper la página.
 * Formato recomendado: vertical (3:4 o 4:5), 1200 px de ancho, JPG.
 */
export const FOTOS = {
  /**
   * La del arco de la portada. Ya viene recortada en 3:4 sobre ella; si la
   * cambias, procura que la cara quede centrada y sin fondo que distraiga.
   */
  portada: '/images/iris-portada.jpg',
  /** La principal, entera. Vertical. */
  retrato: '/images/iris.jpg',
  /** Ella hablando o en directo. Vertical. */
  hablando: '/images/iris-hablando.jpg',
  /** Un plano cercano, para el bloque de quién es. Vertical. */
  cerca: '/images/iris-cerca.jpg',
  /** Cualquier otra: sala, público, detalle de trabajo. Horizontal. */
  sala: '/images/iris-sala.jpg',
};

/**
 * Datos fiscales del aviso legal y de la política de datos. Son obligatorios
 * por ley: mientras estén en PENDIENTE, la web los enseña marcados.
 */
export const TITULAR = {
  /** Nombre y apellidos, o la razón social si factura una sociedad. */
  nombre: PENDIENTE,
  /** NIF o CIF. */
  nif: PENDIENTE,
  /** Domicilio fiscal completo. */
  direccion: PENDIENTE,
};

export const CONTACTO = {
  /** Correo al que se escribe la gente si algo falla. */
  email: 'irissoaresoficial@gmail.com',
  /** Con prefijo y sin espacios: 34600111222. Vacío = no se muestra el botón de WhatsApp. */
  whatsapp: '',
};

/* ------------------------------------------------------------------ */
/*  LA SESIÓN CON IRIS                                                 */
/* ------------------------------------------------------------------ */

/**
 * Los datos de la sesión.
 *
 * Estuvieron escritos a mano dentro de los textos —«Nos vemos 90 minutos», en
 * los tres idiomas— y nadie los había confirmado nunca: venían del diseño de
 * partida. Una web que afirma cuánto dura algo y cuánto cuesta y se equivoca
 * pierde mucho más que la frase en la que se equivoca.
 *
 * Aquí van, en un solo sitio y marcados en rojo hasta que sean de verdad.
 */
export const SESION = {
  /** Tal y como se quiera enseñar: "90 minutos", "una hora y media". */
  duracion: PENDIENTE,
  /** En euros. null = todavía sin precio, y la web no enseña ninguno. */
  precio: null as number | null,
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
  /** Texto libre: "26 y 27 de septiembre" */
  fechas: string;
  /**
   * El primer día del curso en formato AAAA-MM-DD. Solo se usa para la cuenta
   * atrás; vacío = no se dibuja. Nunca se inventa una fecha.
   */
  fechaISO: string;
  /** Desde cuándo se puede reservar. Es lo que llena el anillo de la cuenta. */
  inscripcionDesdeISO?: string;
  /** "18:00 → 21:00 (hora española)" */
  horario: string;
  /** "2 tardes · 6 h en directo" */
  duracion: string;
  /** En euros. null = todavía sin precio. */
  precio: number | null;
  /** Plazas totales. null = no se muestra contador. */
  plazas: number | null;
  /**
   * Enlace del vídeo donde Iris presenta el curso, tal cual lo da YouTube o
   * Vimeo al pulsar Compartir → Insertar (el que lleva /embed/ dentro).
   * Vacío = sale el hueco marcado como pendiente.
   */
  videoUrl: string;
  /**
   * Enlace de pago de Stripe: el que sale en Stripe → Enlaces de pago → Crear.
   * Vacío = el botón capta el dato y avisa de que aún no se cobra.
   */
  stripeUrl: string;
  /** Descripción larga, uno o dos párrafos. */
  descripcion: string;
  /** Lo que se ve en el curso, punto por punto. */
  bloques: { t: string; d: string }[];
  /** Para quién es y para quién no. Ayuda a que no se apunte quien no debe. */
  paraQuien: string[];
  /** Lo que la persona se lleva puesto al terminar. */
  teLlevas: string[];
};

export const CURSOS: Curso[] = [
  {
    id: 'septiembre',
    titulo: PENDIENTE,
    claim: PENDIENTE,
    fechas: '26 y 27 de septiembre',
    fechaISO: '2026-09-26',
    inscripcionDesdeISO: '2026-09-01',
    horario: PENDIENTE,
    duracion: '2 tardes en directo',
    precio: null,
    plazas: null,
    videoUrl: '',
    stripeUrl: '',
    descripcion: PENDIENTE,
    bloques: [
      { t: PENDIENTE, d: PENDIENTE },
      { t: PENDIENTE, d: PENDIENTE },
      { t: PENDIENTE, d: PENDIENTE },
    ],
    paraQuien: [PENDIENTE, PENDIENTE, PENDIENTE],
    teLlevas: [PENDIENTE, PENDIENTE, PENDIENTE],
  },
];

/** true si el valor sigue sin rellenar. */
export const falta = (v: unknown) => v === PENDIENTE || v === null || v === '' || v === undefined;

export const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: true }).format(n);
