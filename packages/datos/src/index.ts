/**
 * EL CONTRATO ENTRE LA WEB Y LA PLATAFORMA
 *
 * Aquí vive, una sola vez, la forma de las cosas que las dos partes se pasan:
 * quién es una persona, qué es un curso, qué es una reserva, qué es una cita.
 *
 * Por qué existe este paquete: si la web define su `Curso` y la plataforma
 * define el suyo, el día que Iris cambie un precio en el panel y la web siga
 * enseñando el viejo, nadie sabrá por qué. Con una sola definición, el
 * compilador avisa antes de que eso llegue a pasar.
 *
 * Regla de la casa: aquí NO se importa nada de ninguna de las dos aplicaciones.
 * Este paquete es el suelo; si empieza a depender hacia arriba, deja de servir.
 */

export * from './respaldo';

/* ------------------------------------------------------------------ */
/*  PERSONAS                                                           */
/* ------------------------------------------------------------------ */

/** De dónde salió esta persona. Es lo primero que Iris mira en el panel. */
export type Origen =
  | 'web-sinergia'
  | 'web-membresia'
  | 'web-curso'
  | 'web-cita'
  | 'web-chat'
  | 'plataforma'
  | 'a-mano';

/**
 * El consentimiento no se supone: se guarda con la versión del texto que la
 * persona aceptó de verdad. Si mañana cambia el aviso de privacidad, los
 * registros viejos siguen apuntando al texto viejo, que es lo que hace que el
 * expediente se sostenga si alguien lo pide.
 */
export type Consentimiento = {
  /** Identificador de la versión del texto: 'privacidad-2026-09'. */
  version: string;
  /** Cuándo lo aceptó, en ISO. */
  fecha: string;
  /** A qué dijo que sí. */
  para: Array<'contacto' | 'boletin' | 'estudio'>;
};

export type Persona = {
  id: string;
  nombre: string;
  /** Indexado, pero nunca la clave: la gente se equivoca al teclearlo. */
  email: string;
  telefono?: string;
  origen: Origen;
  etiquetas: string[];
  consentimiento: Consentimiento;
  /** Notas privadas de Iris. No se le enseñan a nadie más. */
  notas?: string;
  creada: string;
  actualizada: string;
};

/* ------------------------------------------------------------------ */
/*  CURSOS Y RESERVAS                                                  */
/* ------------------------------------------------------------------ */

/**
 * Lo que hoy vive a mano en `content/site.ts` de la web. Cuando esto esté en
 * la base de datos, Iris lo edita desde el panel y la web lo lee: es lo que le
 * quita la dependencia de que alguien toque un archivo por ella.
 *
 * `null` significa «todavía sin decidir», y la web lo enseña marcado en rojo.
 * No se rellena con un valor inventado para que quede bonito.
 */
export type Curso = {
  id: string;
  titulo: string | null;
  claim: string | null;
  /** Texto libre tal y como se enseña: «26 y 27 de septiembre». */
  fechas: string | null;
  /** El primer día, AAAA-MM-DD. Es lo único que mueve la cuenta atrás. */
  fechaISO: string | null;
  /** Desde cuándo se puede reservar. Llena el anillo de la cuenta atrás. */
  inscripcionDesdeISO?: string | null;
  horario: string | null;
  duracion: string | null;
  precio: number | null;
  plazas: number | null;
  /** El de /embed/ de YouTube o Vimeo. */
  videoUrl: string | null;
  /** Enlace de pago de Stripe. */
  stripeUrl: string | null;
  descripcion: string | null;
  bloques: Array<{ t: string; d: string }>;
  paraQuien: string[];
  teLlevas: string[];
  publicado: boolean;
};

/**
 * `interesada` es quien dejó el dato. `pagada` SÓLO lo pone el webhook de
 * Stripe: la vuelta del navegador a la página de gracias no vale como prueba
 * de nada, porque esa dirección la puede abrir cualquiera.
 */
export type EstadoReserva = 'interesada' | 'pagada' | 'anulada' | 'asistio';

export type Reserva = {
  id: string;
  personaId: string;
  cursoId: string;
  estado: EstadoReserva;
  /** Para poder casar el cobro con la reserva cuando llegue el webhook. */
  stripeSessionId?: string;
  importe?: number;
  creada: string;
  actualizada: string;
};

/* ------------------------------------------------------------------ */
/*  AGENDA                                                             */
/* ------------------------------------------------------------------ */

/**
 * La cita vive aquí y se refleja en Google Calendar, nunca al revés. El
 * calendario es la copia que Iris mira desde el móvil; si las dos partes
 * pudieran mandar, acabarían discutiendo y ganaría la última en escribir.
 */
export type Cita = {
  id: string;
  personaId: string;
  /** Inicio en ISO con zona. */
  inicioISO: string;
  minutos: number;
  tipo: 'sinergia' | 'sesion' | 'seguimiento';
  estado: 'pedida' | 'confirmada' | 'hecha' | 'anulada';
  /** El identificador del evento en Google, para poder actualizarlo o borrarlo. */
  googleEventId?: string;
  notas?: string;
  creada: string;
};

/* ------------------------------------------------------------------ */
/*  EL REGISTRO                                                        */
/* ------------------------------------------------------------------ */

/**
 * Un renglón por cosa que pasa. Sólo se añade, nunca se borra ni se corrige.
 *
 * Es lo que convierte una base de datos en un CRM —poder ver la historia de
 * una persona— y lo que te salva el día que algo salga mal y haya que
 * reconstruir qué ocurrió y en qué orden.
 */
export type Evento = {
  id: string;
  /** A qué se refiere: 'persona', 'reserva', 'cita', 'estudio'. */
  sobre: string;
  sobreId: string;
  /** Qué pasó, en palabras: 'reserva.pagada', 'cita.confirmada'. */
  que: string;
  /** Quién lo hizo: 'web', 'iris', 'stripe', 'sistema'. */
  quien: string;
  /** Lo que haga falta para entenderlo después. */
  detalle?: Record<string, unknown>;
  cuando: string;
};
