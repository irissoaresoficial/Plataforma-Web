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
/*
 * LA FLOR DE LIS DORADA es el icono oficial de Iris, y va sola en los dos
 * sitios: sobre el papel y sobre el granate.
 *
 * Antes eran dos archivos —uno en color y otro en blanco— porque el sello
 * antiguo se perdía sobre el granate del pie. El dorado no tiene ese problema:
 * es EL color que la casa usa sobre granate (los botones del bloque de la
 * membresía son exactamente eso), así que se lee igual de bien en los dos
 * fondos y no hay dos versiones que puedan acabar diciendo cosas distintas.
 *
 * Las dos constantes se quedan porque `Marca` sabe pedir una u otra según el
 * fondo, y el día que haya una versión de una tinta se cambia sólo aquí.
 */
export const LOGO = '/images/flor-de-lis.png';
export const LOGO_COLOR = '/images/flor-de-lis.png';

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
  hablando: '/images/iris-consulta.jpg',

  /*
   * EL VÍDEO DE LA PORTADA.
   *
   * Un reel de Iris de medio minuto: «tu fecha es un código sagrado». Vive en el
   * hueco del bloque «¿Y a ti qué número te tocó?» mientras nadie ha escrito su
   * fecha — dice con su cara y su voz justo lo que ese bloque pide que hagas— y
   * desaparece en cuanto aparece la cuenta.
   *
   * El cartel NO es decorativo: sin él, `preload="metadata"` sigue enseñando un
   * rectángulo negro, y con él la portada se ve entera aunque nadie le dé al
   * play. Sale del segundo 1,5 del propio vídeo, que es donde ya se lee la
   * frase.
   */
  video: '/video/codigo-sagrado.mp4',
  videoCartel: '/images/codigo-sagrado-cartel.jpg',
  /** Un plano cercano, para el bloque de quién es. Vertical. */
  cerca: '/images/iris-cerca.jpg',
  /**
   * LA FILA DE GENERACIONES. No es una foto de Iris: es la única imagen de la
   * web que no enseña a nadie de la casa, y por eso está aquí abajo y aparte.
   *
   * Va en el bloque de «Por qué pasa», que dice «No es tu carácter. Es una
   * historia que nadie cerró». Un hombre detrás de otro, en la misma postura y
   * con las mismas manos, perdiéndose hacia el fondo: es esa frase, sin tener
   * que explicarla. Antes ahí había un retrato de Iris en un coche, que no
   * decía nada de lo que se estaba contando al lado.
   */
  generaciones: '/images/generaciones.png',

  /*
   * LA FRANJA DE TRES, SIN UNA PALABRA.
   *
   * Antes eran tres retratos de Iris —y uno de ellos, el hueco rojo de una foto
   * que no existía—. Tres fotos de la misma persona, seguidas y sin texto, son
   * adorno; y esta web tiene una regla que dice que nada es adorno.
   *
   * Ahora son las tres la PRUEBA DEL TRABAJO: el árbol dibujándose en la
   * pizarra, la cuenta hecha a mano en un papel, y el sitio donde se hace.
   * Quien pasa por delante no ve a alguien: ve lo que se hace. Que es
   * exactamente lo que hay que demostrar antes de pedir 397 € por aprenderlo.
   */
  arbolPizarra: '/images/arbol-pizarra.jpg',
  laCuenta: '/images/la-cuenta.jpg',
  cristales: '/images/cristales.jpg',
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
 * LA REGLA, Y EL INTERRUPTOR DE ABAJO
 *
 * Por defecto: se ven en localhost y en las direcciones de prueba, y en
 * cualquier otro dominio NO. El día que se ponga el dominio de Iris desaparecen
 * solos, sin que nadie tenga que acordarse — que es exactamente como se quedan
 * puestas estas cosas.
 *
 * Y hay un interruptor para enseñarlos igualmente mientras la web se está
 * PRESENTANDO, que es para lo que se ha encendido hoy. Ver
 * `MUESTRA_EN_PRESENTACION` justo debajo.
 */
/**
 * ENSEÑAR LOS DE MUESTRA AUNQUE EL DOMINIO SEA EL DE VERDAD.
 *
 * Está en `true` porque la web todavía no se ha abierto al público y hay que
 * poder enseñarla entera para presentarla. Con la sección vacía no se ve cómo
 * queda, y cómo queda es justo lo que hay que enseñar.
 *
 * MIENTRAS ESTÉ ENCENDIDO, CADA TARJETA LLEVA LA PALABRA «EJEMPLO». Y eso no es
 * una pega puesta a regañadientes: es lo único que separa una demostración de
 * una infracción. Lo que la ley persigue no es enseñar un comentario de
 * mentira, es hacerlo pasar por real — un nombre, un icono de Instagram y una
 * fecha son exactamente eso. Con la etiqueta puesta, quien lo ve sabe qué está
 * viendo, y la sección cumple su función en la presentación sin afirmar nada
 * que no sea cierto.
 *
 * SE APAGA SOLO EN CUANTO HAYA UNO REAL. Basta con pegar un comentario de
 * verdad arriba, en `TESTIMONIOS`: los de muestra dejan de salir y esta
 * constante deja de importar. No hay que acordarse de volver aquí.
 *
 * Y si se abre al público antes de tener comentarios reales, esto se pone en
 * `false` y la sección desaparece entera, como estaba.
 */
export const MUESTRA_EN_PRESENTACION = true;

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
  precio: 150 as number | null,
  /**
   * EL PRECIO DE ANIVERSARIO — 111 € PARA LAS DIECISÉIS PRIMERAS.
   *
   * Confirmado por Gerson el 14 de septiembre de 2026. Los tres números tienen
   * un porqué y por eso se pueden decir en voz alta:
   *
   *   · 111 sale del aniversario, que cae en día 14;
   *   · 16 plazas, una por cada año de consulta — Iris abrió en 2010;
   *   · y se acaba cuando se llenan las dieciséis. No hay fecha límite, así que
   *     la web NO monta una cuenta atrás: una cuenta atrás sobre una escasez
   *     que no es de tiempo es mentir con un reloj.
   *
   * Una rebaja con motivo se lee como una condición; una sin motivo se lee como
   * que mañana seguirá ahí. Por eso el motivo va escrito al lado del número, y
   * no en un correo al que llega poca gente.
   *
   * `null` en cualquiera de los dos apaga la oferta entera y la web vuelve a
   * enseñar sólo el precio normal, sin tachar nada.
   */
  precioOferta: 111 as number | null,
  /** Cuántas quedan a ese precio. Se baja a mano según se van llenando. */
  plazasOferta: 16 as number | null,
  /** El año en que Iris abrió consulta. De aquí salen los «años» del motivo. */
  desde: 2010,
};

/**
 * Los años de consulta, contados solos.
 *
 * Escrito a mano se queda viejo el 1 de enero y nadie se acuerda de tocarlo:
 * una web que dice «16 años» cuando ya son 17 se lee como abandonada, y es el
 * dato que sostiene el motivo de la oferta.
 */
export function aniosDeConsulta(): number {
  return new Date().getFullYear() - SESION.desde;
}

/* ------------------------------------------------------------------ */
/*  LA CONSULTA DE KÁBALA                                              */
/* ------------------------------------------------------------------ */

/**
 * El otro servicio del catálogo. Confirmado por Gerson el 14 de septiembre de
 * 2026: es una consulta, con el mismo formato que la de arriba, pero leyendo la
 * carta con Kábala en vez de con numerología transgeneracional.
 *
 * NO es un curso ni una formación. Si algún día lo es, se escribe en otro sitio
 * — mezclar «consulta» y «formación» en la misma ficha es lo que hace que la
 * gente pregunte por WhatsApp qué está comprando exactamente.
 */
export const KABALA = {
  precio: 333 as number | null,
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
  /**
   * LOS PRECIOS ESTÁN APAGADOS. Decisión de Gerson, 13 de septiembre de 2026.
   *
   * Estuvieron en 67 € y 33 €, confirmados el 7 de septiembre y publicados en
   * tres sitios. Se apagan porque la membresía ha pasado a ser otra cosa: no es
   * una lista de espera con precio reservado, es un PRÓXIMAMENTE. Lo único que
   * se pide es el correo y el WhatsApp para avisar el día que abra.
   *
   * Y esto es lo importante: no se apaga sólo el número, se apaga TODA la
   * promesa. Con estos dos en `null`, la portada, la página de la comunidad y
   * la de cursos dejan de enseñar precio, dejan de tachar nada y dejan de decir
   * «lo mantienes mientras sigas dentro» — porque no hay un precio que
   * mantener. Un precio tachado que ya no existe es publicidad engañosa, no un
   * descuido de maquetación.
   *
   * El día que haya precio de verdad se rellenan aquí los dos y vuelve solo.
   */
  /** Lo que costará cuando abra. `null` = todavía no se dice. */
  precio: null as number | null,
  /** Lo que pagarían quienes entren primero. `null` = no se cobra nada aún. */
  precioReserva: null as number | null,
  /**
   * CON CUÁNTA GENTE ABRE EL GRUPO.
   *
   * Nació como «cuántas se quedan con el precio de fundadora». Ese precio ya no
   * existe, pero el número sí sigue significando algo, y es lo que de verdad
   * importaba: la comunidad abre con diez personas porque cada mes se revisa un
   * caso en voz alta, y con cuarenta eso no se puede hacer.
   *
   * Es una escasez REAL —sale de cómo funciona la sesión, no de una táctica de
   * venta— y por eso se puede decir. El día que deje de serlo, se cambia este
   * número o se pone a null y desaparece de la página; no se deja puesto
   * mintiendo.
   */
  plazasLanzamiento: 10 as number | null,
  /**
   * Lo que incluye la membresía. Cada línea que dejes como PENDIENTE sale
   * marcada en rojo. Añade o quita las que quieras.
   */
  incluye: [PENDIENTE, PENDIENTE, PENDIENTE],
  /**
   * QUÉ PASA SI ALGUIEN PAGA Y LUEGO SE ECHA ATRÁS.
   *
   * Hace falta decidirlo antes de encender los cobros, y no lo puede decidir la
   * web. Quien reserva paga el primer mes hoy y no recibe nada hasta el día que
   * abre: entre esas dos fechas hay semanas, y en esas semanas la gente cambia
   * de opinión. Sin una frase clara aquí, cada uno de esos casos acaba en una
   * discusión por WhatsApp o en una devolución peleada con el banco, que sale
   * mucho más cara que devolver el dinero.
   *
   * Escríbelo como se lo dirías a la persona. Por ejemplo: «Si antes de que
   * abramos decides que no, me escribes y te devuelvo el mes.» O lo contrario,
   * si la plaza no se devuelve — pero entonces que esté escrito, no supuesto.
   *
   * Mientras sea PENDIENTE sale marcado en rojo en la página, a propósito: es
   * lo último que debería quedar sin decidir el día que se abran los cobros.
   */
  devoluciones: PENDIENTE,
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
  /**
   * EL PRECIO TACHADO. En euros, o null si no hay promoción.
   *
   * OJO CON ESTE NÚMERO, PORQUE ES EL ÚNICO DE LA WEB QUE PUEDE COSTAR UNA
   * MULTA. En España, tachar un precio al que nunca se ha vendido es publicidad
   * engañosa: desde la directiva Ómnibus (Ley 7/1996, art. 20), el precio
   * tachado tiene que ser el más bajo que se haya aplicado en los treinta días
   * anteriores.
   *
   * Gerson confirmó el 8 de septiembre de 2026 que los 697 € son el precio
   * normal del curso fuera de promoción, no un «valor equivalente» inventado
   * para que el descuento parezca mayor. Con eso, tacharlo es correcto.
   *
   * Si algún día el precio de fuera de promoción cambia, se cambia aquí; y si
   * deja de haber promoción, se pone a null y el tachado desaparece solo.
   */
  precioAntes?: number | null;
  /** Plazas totales. null = no se muestra contador. */
  plazas: number | null;
  /**
   * Enlace del vídeo donde Iris presenta el curso, tal cual lo da YouTube o
   * Vimeo al pulsar Compartir → Insertar (el que lleva /embed/ dentro).
   * Vacío = sale el hueco marcado como pendiente.
   */
  videoUrl: string;
  /**
   * EL CARTEL DEL CURSO. La imagen que lo anuncia, en vertical.
   *
   * Va aquí, colgando del curso, y no en la lista general de fotos de la web.
   * El motivo: la portada enseña el cartel del PRÓXIMO curso, así que el día
   * que haya otro con otra imagen, la portada cambia sola con sólo añadir el
   * curso — sin tocar la portada ni acordarse de cambiar dos sitios.
   *
   * Vacío = la portada vuelve al retrato de Iris, que es lo que había antes.
   * No se rompe nada por no tener cartel.
   *
   * Que sea VERTICAL, cerca de 4:5. El marco de la portada tiene esa forma y
   * una imagen apaisada saldría recortada por los lados.
   */
  cartel?: string;
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
  /**
   * LO QUE INCLUYE, PARA LA TARJETA. Cinco líneas cortas, de un renglón.
   *
   * Es otra cosa que `teLlevas`, aunque hablen de lo mismo. `teLlevas` se lee
   * dentro de la ficha, con tiempo, y explica; esto se lee de un vistazo
   * mientras se mira el precio, y su trabajo es que ese precio parezca poco.
   *
   * Por eso no se saca cortando `teLlevas` — cortar textos es justamente lo que
   * se acaba de quitar de toda la plataforma — sino escribiendo cada línea para
   * el sitio donde va. Y sólo con lo confirmado: aquí no entra nada que no esté
   * decidido, porque va pegado a un botón de pagar.
   */
  incluye: string[];
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
    /*
     * EL NOMBRE DE VERDAD DEL CURSO, puesto por Iris. Antes era «Tu fecha, tu
     * nombre y tu línea», que dice bien lo que se hace dentro pero no es un
     * nombre: es un reclamo. Y en una web donde el mismo curso entrega un
     * certificado de Consultor de Numerología, el título que se anuncia y el
     * que se certifica tienen que sonar a lo mismo — si no, quien paga se
     * queda con la duda de si le van a certificar otra cosa.
     *
     * El reclamo no se pierde: sigue justo debajo, en `claim`.
     */
    titulo: 'Formación en Numerología Transgeneracional',
    claim: 'Dos días completos para salir sabiendo calcular tus números y los de tu familia, y ver qué se repite.',
    fechas: '26 y 27 de septiembre',
    fechaISO: '2026-09-26',
    inscripcionDesdeISO: '2026-09-01',
    /* Confirmado por Gerson el 8 de septiembre de 2026: los dos días de
       10:00 a 19:00, con una hora para comer. */
    horario: '10:00 → 19:00 (hora española), con una hora para comer',
    duracion: '2 jornadas completas · 16 h en directo',
    precio: 397,
    precioAntes: 697,
    plazas: null,
    videoUrl: '',
    cartel: '/images/curso-cartel.png',
    /* Enlace de pago de Stripe, dado por Gerson el 8 de septiembre de 2026.
       Es un enlace público de cobro: está hecho para publicarlo, no es un
       secreto que se filtre por estar aquí. */
    stripeUrl: 'https://buy.stripe.com/cNi28r2mc2xL72la8K1ZS00',
    descripcion:
      'La numerología no adivina nada. Coge dos datos que ya tienes —la fecha en que naciste y el nombre con el que te ' +
      'inscribieron— y los convierte en cifras con las que se puede trabajar. En estos dos días aprendes a hacer esa ' +
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
      'Todo el material lo pone Iris: no hace falta traer nada ni comprar nada aparte.',
      /* El certificado, con las palabras exactas que se acordaron. Dice lo que
         de verdad acredita —haber superado un curso teórico-práctico— y no
         insinúa una titulación oficial, que no la hay: la numerología no es
         una profesión regulada y prometer un título en un sitio donde se
         cobran 397 € es justo lo que no se puede hacer. */
      'Certificado de Consultor de Numerología, que acredita haber superado el curso teórico-práctico.',
      /* Aquí iba «la grabación de las dos tardes». Lo he quitado: eso no sale
         del temario, es una decisión de servicio que sólo Iris puede tomar, y
         prometérsela a alguien que ha pagado sin saber si va a existir es
         exactamente lo que esta web no hace. Si la hay, se añade aquí. */
    ],
    incluye: [
      '16 horas en directo con Iris, en dos jornadas completas',
      'Todo el material, puesto por ella',
      'Certificado de Consultor de Numerología',
      'Tu carta y tu árbol de tres generaciones, hechos por ti',
      'Las tablas y las cuentas por escrito, para repetirlo en casa',
    ],
  },
];

/** true si el valor sigue sin rellenar. */
export const falta = (v: unknown) => v === PENDIENTE || v === null || v === '' || v === undefined;

export const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: true }).format(n);
