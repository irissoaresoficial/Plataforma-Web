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
/*  COMENTARIOS DE INSTAGRAM                                           */
/* ------------------------------------------------------------------ */

export type Testimonio = {
  /** Nombre de pila. La inicial se usa como avatar. */
  nombre: string;
  /** El usuario, con la arroba: "@carmen.lr". Opcional. */
  usuario?: string;
  /** El comentario, tal cual lo escribió. Sin arreglar la ortografía: se nota. */
  texto: string;
  /** Cuándo, como se quiera enseñar: "hace 2 semanas". Opcional. */
  cuando?: string;
};

/**
 * LOS COMENTARIOS DE VERDAD. AQUÍ SE PEGAN, LITERALES.
 *
 * Lo que la gente escribe en el Instagram de Iris, tal cual, sin arreglarle la
 * ortografía —se nota—. Con tres ya funciona el carrusel.
 *
 * En cuanto haya UNO aquí, los de muestra de abajo dejan de salir para siempre.
 * No hay que borrar nada ni acordarse de apagar nada: se apagan solos.
 */
export const TESTIMONIOS: Testimonio[] = [];

/**
 * LOS DE MUESTRA. SON INVENTADOS. NO PUEDEN LLEGAR AL DOMINIO DE VERDAD.
 *
 * Se piden para ver cómo queda el carrusel mientras se monta la web, y para eso
 * están. Pero un comentario inventado con el icono de Instagram al lado está
 * afirmando que una persona concreta escribió eso, y eso publicado es
 * infracción grave de la ley de consumidores en España desde la directiva
 * Ómnibus. La multa es lo de menos: toda esta web se sostiene sobre que lo que
 * no está confirmado sale marcado, y una reseña falsa la desmonta entera.
 *
 * Así que no se dejan a mano de nadie. La regla está en el código, en
 * `Testimonios.tsx`, y es ésta:
 *
 *   - En localhost y en las direcciones de prueba de Vercel se ven, con un
 *     aviso pequeño encima que dice lo que son.
 *   - En cualquier otro dominio NO SE VEN. Ni con aviso ni sin él.
 *
 * Es decir: el día que se ponga el dominio de Iris, desaparecen solos. Nadie
 * tiene que acordarse de quitarlos, que es exactamente como se quedan puestos
 * estas cosas.
 */
export const TESTIMONIOS_MUESTRA: Testimonio[] = [
  {
    nombre: 'Carmen',
    usuario: '@carmen.lr',
    texto: 'yo entré por curiosidad eh, y me quedé con la boca abierta cuando salió lo de mi abuela. no me lo esperaba',
    cuando: 'hace 2 semanas',
  },
  {
    nombre: 'Vane',
    usuario: '@vanessa_mgl',
    texto: 'Llevaba años diciendo "es que en mi familia siempre pasa lo mismo" y nunca supe explicarlo. Ahora sí 🤍',
    cuando: 'hace 1 mes',
  },
  {
    nombre: 'Rocío',
    usuario: '@rocio.dlt',
    texto: 'lo hice con mi madre y acabamos las dos llorando por teléfono jajaja gracias Iris de verdad',
    cuando: 'hace 3 semanas',
  },
  {
    nombre: 'Marta',
    usuario: '@martaaa.gc',
    texto: 'Lo que más me gustó es que no te dice lo que va a pasar. Te explica de dónde viene. Es otra cosa.',
    cuando: 'hace 1 semana',
  },
  {
    nombre: 'Nuria',
    usuario: '@nuriasr__',
    texto: 'me salió el mismo número que a mi padre y a mi hijo. tres generaciones. todavía le estoy dando vueltas',
    cuando: 'hace 2 meses',
  },
  {
    nombre: 'Bea',
    usuario: '@beatriz.pna',
    texto: 'venía escéptica al 100%. salí pidiendo cita. no sé qué más decir',
    cuando: 'hace 5 días',
  },
];

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
  /**
   * CUÁNDO ABRE. Es lo que mueve la cuenta atrás del lanzamiento.
   *
   * Lleva la hora a propósito. «Finales del 7 de noviembre» es el 7 entero, así
   * que la cuenta llega a cero cuando ese día se acaba, no cuando empieza. Sin
   * la hora, la web habría cerrado la puerta veinticuatro horas antes de lo
   * dicho, y la gente que entrara el día 7 se encontraría el cartel caído.
   *
   * Vacío = no hay cuenta atrás y el bloque se enseña sin prisa. La fecha no se
   * mueve para meter urgencia: si cambia de verdad, se cambia aquí.
   */
  abreISO: '2026-11-07T23:59:59',
  /** Desde cuándo está abierta la lista. Es lo que llena el anillo. */
  listaDesdeISO: '2026-09-05T00:00:00',
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

/*
 * EL CURSO DE SEPTIEMBRE
 *
 * QUÉ ESTÁ ESCRITO AQUÍ Y POR QUÉ. El temario es materia de la disciplina: la
 * reducción teosófica, el camino de vida, la tabla pitagórica del nombre, el
 * año personal, las deudas kármicas y el trabajo sobre tres generaciones. Eso
 * no me lo he inventado ni se lo he atribuido a nadie: es lo que es la
 * numerología transgeneracional, y es exactamente lo que ya calcula el motor de
 * esta misma web —que es de donde salen los números de la portada y del estudio
 * de sinergia—. Si Iris lo da en otro orden o con otro nombre, se cambia aquí y
 * la web entera cambia con ello.
 *
 * LO QUE SIGUE EN ROJO. El horario, el precio, las plazas, el vídeo y el enlace
 * de pago. Eso no es materia: son decisiones que sólo Iris puede tomar, y
 * ponerlas a ojo sería mentir a alguien que va a pagar.
 */
export const CURSOS: Curso[] = [
  {
    id: 'septiembre',
    titulo: 'Tu fecha, tu nombre y tu línea',
    claim: 'Dos tardes para salir sabiendo calcular tus números y los de tu familia, y ver qué se repite.',
    fechas: '26 y 27 de septiembre',
    fechaISO: '2026-09-26',
    inscripcionDesdeISO: '2026-09-01',
    horario: PENDIENTE,
    duracion: '2 tardes en directo',
    precio: null,
    plazas: null,
    videoUrl: '',
    stripeUrl: '',
    descripcion:
      'La numerología no adivina nada. Coge dos datos que ya tienes —la fecha en que naciste y el nombre con el que te ' +
      'inscribieron— y los convierte en cifras con las que se puede trabajar. En estas dos tardes aprendes a hacer esa ' +
      'cuenta tú, a mano, sin depender de ninguna aplicación: de dónde sale cada número, por qué el 11, el 22 y el 33 no ' +
      'se reducen, y qué se está mirando exactamente cuando se mira un camino de vida.\n\n' +
      'Y después damos el paso que la mayoría de los cursos no da: sacamos las fechas de tus padres y de tus abuelos y las ' +
      'ponemos juntas. Ahí es donde aparece lo interesante. Las cifras que se repiten generación tras generación, las ' +
      'edades en las que pasa lo mismo, los años que vuelven. Eso es lo transgeneracional: no una teoría, una tabla con ' +
      'tu apellido encima que sales sabiendo hacer.',
    bloques: [
      {
        t: 'Reducir: la operación de la que sale todo',
        d: 'Cómo se pliega cualquier número hasta dejar una sola cifra, y por qué el 11, el 22 y el 33 se paran ahí y no se reducen. Es la cuenta que hay debajo de todas las demás, y la que da nombre a la escuela.',
      },
      {
        t: 'El camino de vida',
        d: 'Tu número principal, el que sale de la fecha de nacimiento. Se reducen por separado el día, el mes y el año y después se suman: hacerlo del tirón da otro resultado en una de cada siete fechas, y ése es el error más repetido que hay.',
      },
      {
        t: 'Los números del nombre',
        d: 'La tabla pitagórica, letra por letra. De ahí salen tres cifras distintas: la expresión (todas las letras), el alma (sólo las vocales) y la personalidad (sólo las consonantes). Qué dice cada una y por qué no son la misma cosa.',
      },
      {
        t: 'En qué año estás',
        d: 'El año personal y el ciclo de nueve. Sirve para entender por qué hay temporadas en las que todo empuja y otras en las que nada arranca, y para saber en cuál estás ahora mismo.',
      },
      {
        t: 'Lo que viene con deuda',
        d: 'El 13, el 14, el 16 y el 19: los números que en numerología clásica llegan con algo pendiente detrás. Cómo se detectan en una fecha y cómo se leen sin dramatizarlos.',
      },
      {
        t: 'El árbol: tres generaciones sobre la mesa',
        d: 'Aquí se junta todo. Colocamos tus fechas, las de tus padres y las de tus abuelos, y buscamos lo que vuelve: las mismas cifras, las mismas edades, los mismos años. Es el trabajo que da sentido a la palabra transgeneracional.',
      },
    ],
    paraQuien: [
      'Para quien empieza de cero. No hace falta saber nada antes: se empieza por la suma.',
      'Para quien ya ha visto su número por ahí y quiere entender de dónde sale en vez de creérselo.',
      'Para quien mira a su familia y ve algo que se repite y no sabe ponerle nombre.',
      'No es para quien busque una predicción. Aquí no se adivina el futuro de nadie.',
    ],
    teLlevas: [
      'Tu carta hecha por ti: camino de vida, expresión, alma, personalidad y año personal.',
      'El árbol de tres generaciones empezado, con las repeticiones que hayan salido señaladas.',
      'Las tablas y las cuentas por escrito, para poder hacérselo a otra persona al día siguiente.',
      /* Aquí iba «la grabación de las dos tardes». Lo he quitado: eso no sale
         del temario, es una decisión de servicio que sólo Iris puede tomar, y
         prometérsela a alguien que ha pagado sin saber si va a existir es
         exactamente lo que esta web no hace. Si la hay, se añade aquí. */
    ],
  },
];

/** true si el valor sigue sin rellenar. */
export const falta = (v: unknown) => v === PENDIENTE || v === null || v === '' || v === undefined;

export const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: true }).format(n);
