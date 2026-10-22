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
/* ESTE ES EL LOGO DE LA ESCUELA, y la flor de lis no lo era.
   Gerson, el 18 de octubre: «el logo del header no es ese pico, sino que es
   el de Escuela de Sabiduría, recuerda que era uno circular».
   Tenía razón y era un fallo de fondo: la flor de lis es un adorno de la
   marca —sale dentro del propio logo, a los lados— pero el logo es el sello
   circular con «IRIS SOARES · ESCUELA DE SABIDURÍA 33» alrededor de la flor
   de la vida. Firmar la web con el adorno en vez de con el sello es firmar
   con media marca.
   Hay versión blanca para los fondos oscuros, así que aquí sí son dos
   archivos distintos de verdad. */
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
 * QUIÉN DA LA MASTERCLASS.
 * ============================================================================
 *
 * Iris, en una nota de voz del 19 de octubre: «sería bueno que le pusiéramos
 * una foto de ambos antes de ver el vídeo, donde aparezca Marco —psicólogo y
 * terapeuta psicosomático clínico— y mi nombre, Iris Soares, también con la
 * foto».
 *
 * EL ORDEN DE LOS TÍTULOS NO ES CASUAL, y lo explicó ella misma: «a Marco, si
 * lo pones como psicoterapeuta, pueden pensar que no es psicólogo; quiero que
 * quede claro que Marco es psicólogo». Por eso «Psicólogo» va primero y a
 * secas. En una landing que recoge datos de gente que no conoce a nadie, el
 * título profesional es la mitad de la confianza — y el que se lee es el
 * primero.
 *
 * LA FOTO QUE FALTE NO ROMPE NADA: sale el sello de la escuela en su sitio, y
 * se ve que es un hueco y no una cara inventada (MARCA.md §7). En cuanto haya
 * archivo, se guarda en `public/images/` y se pone aquí la ruta.
 */
export type Presenta = {
  nombre: string;
  /** El título profesional, tal y como quiere que se lea. */
  titulo: string;
  /** Ruta dentro de `public/`. Vacío = sale el sello en vez de la cara. */
  foto: string;
  /** Qué se oye si no se ve la foto. Vacío mientras no haya foto. */
  alt: string;
};

export const PRESENTAN: Presenta[] = [
  {
    nombre: 'Marco Célio Sousa',
    /* EL TÍTULO ES EL QUE PIDIÓ IRIS, no el de su perfil de Instagram.
       Allí pone «Psicoterapia Somática», y ella avisó justo de eso: «a Marco,
       si lo pones como psicoterapeuta, pueden pensar que no es psicólogo;
       quiero que quede claro que Marco es psicólogo». Por eso «Psicólogo» va
       delante y a secas. */
    titulo: 'Psicólogo y terapeuta psicosomático clínico',
    /* OJO CON LA CALIDAD DE ESTE ARCHIVO. Sale recortado de una captura de
       su perfil, que es lo que había: son 206 px de origen. Da de sobra para
       el círculo de 54 px de la fila y no da para nada más grande. El día que
       haya una foto suya de verdad, se recorta en cuadrado igual que ésta y
       se cambia la ruta aquí. */
    foto: '/images/marco-retrato.jpg',
    alt: 'Marco Célio Sousa, de camisa blanca, en la playa al atardecer.',
  },
  {
    nombre: 'Iris Soares',
    titulo: 'Terapeuta psicosomática clínica y numeróloga transgeneracional',
    /* RECORTE CUADRADO Y A PROPÓSITO, no la foto entera.
       Gerson: «la foto de Iris, que se vea bien su rostro». La original es de
       900×1599 —vertical de móvil— y metida en un círculo de 54 px se queda
       en una tira de cara: el recorte se come las mejillas y deja medio
       hombro. `iris-retrato.jpg` es esa misma foto recortada en cuadrado
       alrededor de la cara, así que en el círculo entra entera y sin trucos
       de encuadre en el CSS. */
    foto: '/images/iris-retrato.jpg',
    alt: 'Iris Soares, sonriendo, en su consulta.',
  },
];

/**
 * Datos fiscales del aviso legal y de la política de datos. Son obligatorios
 * por ley.
 *
 * Nombre y dirección, el 21 de octubre de 2026: los que constan como titular
 * del dominio (Iris Soares, Vigo). Gerson: «esto fatal, estamos en plena
 * publicidad». El NIF sigue sin dárnoslo nadie y NO se inventa: mientras falte,
 * el aviso legal no enseña esa línea en rojo ante la gente que llega de los
 * anuncios. Hay que ponerlo cuanto antes: la Ley 34/2002 (art. 10) lo pide.
 */
export const TITULAR = {
  /** Nombre y apellidos, o la razón social si factura una sociedad. */
  nombre: 'Iris Soares',
  /** NIF o CIF. */
  nif: PENDIENTE,
  /** Domicilio fiscal completo. */
  direccion: 'Rúa de Urzáiz, 158, 3, 36205 Vigo (Pontevedra), España',
};

/**
 * ============================================================================
 * LA MASTERCLASS: CUÁNDO ES, EN UN SOLO SITIO
 * ============================================================================
 *
 * Gerson, el 19 de octubre: «lo de la masterclass está para el 26 de noviembre
 * de 9 a 10 pm», corregido después de las 15:00 que se dijo primero.
 *
 * Hasta hoy la fecha no existía, y por eso la web decía «te aviso en cuanto
 * haya fecha» en cuatro sitios distintos. Ahora existe, y se escribe UNA VEZ.
 *
 * POR QUÉ AQUÍ Y NO EN CADA PANTALLA. La fecha aparece en la página, en la
 * pantalla de gracias, en el correo de confirmación y en los anuncios. Escrita
 * cuatro veces, el día que se mueva —y las fechas se mueven— alguna se queda
 * atrás, y una web que anuncia dos días distintos para la misma clase es peor
 * que una que no anuncia ninguno. Aquí se cambia en un sitio y cambia en todos.
 *
 * Y LOS ANUNCIOS TIENEN QUE DECIR LO MISMO. Meta compara el anuncio con la
 * página a la que lleva: si el anuncio dice una fecha y la página dice otra,
 * eso es motivo de rechazo además de ser una mentira.
 *
 * `cuando` es para leer, `iso` es para las máquinas —el recordatorio del
 * calendario, el dato estructurado de Google— y `horaFin` cierra la hora.
 */
export const MASTERCLASS = {
  titulo: 'Desórdenes Amorosos',
  /** Como se lee en una frase: «el jueves 26 de noviembre, de 21:00 a 22:00». */
  cuando: 'el jueves 26 de noviembre, de 21:00 a 22:00',
  /** Más corto, para un botón o un titular de anuncio. */
  corto: '26 de noviembre · 21:00',
  /** Hora de España peninsular. Va escrito porque hay gente apuntada fuera. */
  zona: 'hora de España (Madrid)',
  iso: '2026-11-26T21:00:00+01:00',
  isoFin: '2026-11-26T22:00:00+01:00',
};

export const CONTACTO = {
  /** Correo al que se escribe la gente si algo falla. */
  email: 'irissoaresoficial@gmail.com',
  /** Con prefijo y sin espacios: 34600111222. Vacío = no se muestra el botón de WhatsApp. */
  whatsapp: '',

  /*
   * EL GRUPO DE WHATSAPP DE LA MASTERCLASS.
   *
   * Gerson, el 18 de octubre: «si yo dejo los datos, eso tiene que hacer un
   * gracias y debe haber un link de un grupo de WhatsApp para que entren».
   *
   * AQUÍ VA EL ENLACE DE INVITACIÓN DEL GRUPO, el que empieza por
   * https://chat.whatsapp.com/ y sale en WhatsApp con:
   *   el grupo → el nombre del grupo arriba → Invitar con enlace → Copiar.
   *
   * SI SE QUEDA VACÍO NO SE INVENTA NINGUNO, y la web no finge que existe: la
   * pantalla de gracias dice entonces que el enlace va por correo, y el correo
   * no habla del grupo. Es la misma regla del enlace de pago de la consulta
   * (`PAGO_URL` en el script de Google) y está en MARCA.md §7.
   *
   * VA LIMPIO, SIN LA COLA DE LA URL. Gerson lo pasó copiado desde la app, y
   * WhatsApp le engancha al copiar un rabo de parámetros con el sitio desde el
   * que se compartió: `?s=cl&p=i&mlu=4&ilr=4&iam=0`. No sirven para nada aquí
   * —el enlace funciona igual sin ellos— y lo que hacen es publicar a la vista
   * de todos un dato de su teléfono. El código del grupo es lo único que
   * importa y es lo único que se guarda.
   *
   * OJO: ESTE ENLACE VA EN DOS SITIOS, porque el correo lo manda Google y no
   * esta web. El otro es `GRUPO_WHATSAPP` en google-apps-script/reservas.gs.
   * Si se cambia aquí y allí no, la mitad de la gente se queda sin él.
   */
  grupo: 'https://chat.whatsapp.com/D4TuFMeoJemGODdCzJyYkd',
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
  /**
   * CÓMO SE DA: «Online», «Presencial», «Online y presencial».
   *
   * Es un dato de venta y no un detalle: quien duda entre dos cursos mira esto
   * antes que el temario. Vacío = no se enseña la celda, y así una web sin el
   * dato no afirma nada.
   *
   * OJO SI ALGÚN DÍA DICE «presencial»: hace falta también la ciudad. «Online
   * y presencial» a secas deja a quien lo lee con la pregunta a medias, y esa
   * pregunta llega por correo o no llega — y si no llega, se ha perdido.
   */
  modalidad?: string;
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
   * EL CARTEL DEL CURSO. La imagen con la que se anuncia.
   *
   * Va aquí, colgando del curso, y no en la lista general de fotos de la web.
   * El motivo: el cartel es del PRÓXIMO curso, así que el día que haya otro
   * con otra imagen, cambia solo con añadir el curso — sin acordarse de ir a
   * tocar una segunda lista.
   *
   * Vacío = no sale cartel y la tarjeta vuelve a dos columnas. No se rompe
   * nada por no tener uno.
   *
   * EL MARCO TIENE DOS FORMAS, y conviene saberlo antes de encargar la
   * imagen: franja apaisada 16:9 por debajo de 1100 px, y vertical 4:5 por
   * encima, cuando recupera su columna. Así que lo que importe tiene que
   * estar CENTRADO: lo que se arrime a un borde se pierde en una de las dos.
   */
  cartel?: string;
  /**
   * EL CARTEL, EN MOVIMIENTO.
   *
   * Opcional y encima del de arriba: si está, se reproduce en bucle, sin
   * sonido y sin controles, y el `cartel` de arriba pasa a ser su primer
   * fotograma — el que se ve mientras el vídeo carga y el que se queda fijo
   * para quien ha pedido que no se mueva nada en pantalla.
   *
   * POR ESO EL CARTEL QUIETO SIGUE HACIENDO FALTA aunque haya vídeo. Sin él
   * se ve un rectángulo negro durante el primer segundo, que en la página que
   * vende es el primer segundo que cuenta.
   *
   * Pesa poco a propósito: es decoración de una tarjeta, no una clase. Si un
   * día alguien pone aquí un vídeo de varios megas, la página que vende tarda
   * en cargar y eso cuesta ventas.
   */
  cartelVideo?: string;
  /**
   * Enlace de pago de Stripe: el que sale en Stripe → Enlaces de pago → Crear.
   * Vacío = el botón capta el dato y avisa de que aún no se cobra.
   */
  stripeUrl: string;
  /** Descripción larga, uno o dos párrafos. */
  descripcion: string;
  /**
   * LO QUE SE VE EN EL CURSO.
   *
   * TENÍA UN SOLO NIVEL Y EL TEMARIO DE VERDAD TIENE DOS. Esto era una lista
   * plana de seis puntos, y servía mientras el temario era mío. El que ha
   * pasado Iris no es plano: cada bloque lleva sus apartados dentro, y además
   * la jornada está partida en dos mitades con dos caras distintas —por la
   * mañana se explica, por la tarde se practica—.
   *
   * Aplanar eso habría costado lo mejor que tiene el curso. Que por la tarde se
   * lean cartas de verdad, incluidas las de quienes están en la sala, es justo
   * lo que lo separa de un vídeo grabado; en una lista de catorce puntos
   * seguidos eso se lee igual de plano que «tipos de carta numerológica».
   *
   *   · `momento` parte el programa en mañana y tarde, para que se vea cómo es
   *     un día entero antes de pagar dos.
   *   · `puntos` son los apartados de dentro. Opcional: un bloque sin ellos se
   *     pinta con su descripción y ya está.
   */
  bloques: {
    t: string;
    d: string;
    momento?: 'manana' | 'tarde';
    puntos?: string[];
  }[];
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
  /*
   * ===========================================================================
   * DESÓRDENES AMOROSOS — el curso nuevo.
   * ===========================================================================
   *
   * Dado por Gerson el 15 de octubre de 2026, y de momento sólo dos cosas: el
   * nombre y la marca animada con la que se anuncia. Nada más.
   *
   * POR QUÉ ESTÁ CASI ENTERO EN ROJO Y NO RELLENO A OJO. Todo lo que falta aquí
   * —las fechas, el horario, el precio, el programa, lo que te llevas— son
   * decisiones de Iris, y van pegadas a un botón de pagar. Escribir un precio
   * verosímil o inventarse un temario de dos días sería poner a alguien a
   * comprar algo que no existe con esas condiciones. Así que el sitio lo
   * enseña en rojo, y en rojo se queda hasta que Iris lo diga.
   *
   * Eso no es un fallo que arreglar deprisa: es el aviso funcionando. Mientras
   * haya un `PENDIENTE` en esta ficha, esta web no se publica de cara al
   * público con este curso dentro.
   *
   * VA EL PRIMERO a propósito. `CURSOS[0]` es el que la página saca de
   * cabecera y el que va en los metadatos que se ven al compartir el enlace,
   * así que el orden del array es el orden de importancia, no el cronológico.
   */
  {
    id: 'desordenes-amorosos',
    titulo: 'Desórdenes Amorosos',
    claim: PENDIENTE,
    fechas: PENDIENTE,
    fechaISO: '',
    horario: PENDIENTE,
    duracion: PENDIENTE,
    modalidad: PENDIENTE,
    precio: null,
    precioAntes: null,
    plazas: null,
    videoUrl: '',
    /*
     * LA MARCA DEL CURSO, ANIMADA. Siete segundos en bucle, sin sonido: el
     * logotipo se forma sobre granate y se deshace. El fotograma quieto sale
     * del segundo 4,2 del propio vídeo —donde ya está formado y antes de que
     * se deshaga— y es lo que se ve mientras carga, y lo único que se ve para
     * quien ha pedido que nada se mueva en pantalla.
     *
     * Está centrado sobre fondo liso, que es justo lo que necesita este hueco:
     * se recorta a franja apaisada en móvil y a vertical en pantalla ancha, y
     * no se pierde nada por ningún lado.
     */
    cartel: '/images/desordenes-amorosos-cartel.jpg',
    cartelVideo: '/video/desordenes-amorosos.mp4',
    stripeUrl: '',
    descripcion: PENDIENTE,
    bloques: [],
    paraQuien: [],
    teLlevas: [],
    incluye: [],
  },
  /*
   * AQUÍ ESTABA LA FORMACIÓN EN NUMEROLOGÍA TRANSGENERACIONAL, la de los días
   * 26 y 27 de septiembre de 2026. Borrada el 15 de octubre de 2026 por orden
   * de Gerson: el curso ya se había dado y la web lo seguía anunciando como
   * «PRÓXIMO CURSO», con su precio y su botón de pagar.
   *
   * Esto no se pierde: está entero en el historial de Git, con su temario, sus
   * bloques y sus textos. El día que Iris repita esa formación se recupera de
   * ahí con las fechas nuevas, en vez de escribirla otra vez desde cero.
   *
   * LO QUE ENSEÑA ESTE BORRADO, y por eso queda escrito: un curso con fecha
   * pasada no se cae solo de la web. Mientras los cursos vivan en este
   * archivo hay que acordarse de quitarlos a mano, y acordarse falla. En
   * cuanto los cursos los lleve Iris desde la plataforma, la fecha la tendrá
   * la ficha del curso y lo viejo dejará de anunciarse sin que nadie se
   * acuerde de nada.
   */
];

/* ------------------------------------------------------------------ */
/*  EL TALLER GRATUITO                                                  */
/* ------------------------------------------------------------------ */

/**
 * EL TALLER ONLINE GRATUITO.
 *
 * Decidido en la reunión del 13 de septiembre de 2026: un taller de hora y
 * media, gratis, para octubre. Es la pieza que puede traer gente antes que
 * ninguna otra, porque lo gratis no se piensa: se entra.
 *
 * ---------------------------------------------------------------------------
 * LA PÁGINA EXISTE ANTES QUE LA FECHA, Y ESO ES A PROPÓSITO
 * ---------------------------------------------------------------------------
 * Todavía no hay día. La reacción normal sería esperar a tenerlo para publicar
 * la página, y sería un error: cada día sin página es un día sin recoger
 * correos de gente que ya está interesada.
 *
 * Así que la página funciona en dos estados y cambia sola:
 *
 *   SIN FECHA  ·  «Estoy cerrando el día. Déjame tu correo y te aviso yo.»
 *                 Es una lista de espera, y es verdad. Nadie promete una fecha
 *                 que no existe.
 *   CON FECHA  ·  sale el día, la hora y la cuenta atrás, y el botón pasa a ser
 *                 «Guardar mi plaza».
 *
 * Para encenderla basta con rellenar `fechaISO` y `hora` aquí abajo. No hay que
 * tocar la página.
 *
 * NADA DE LO QUE HAY AQUÍ ESTÁ INVENTADO, y lo que falta se queda vacío. La
 * frase y el titular sí los he escrito yo, porque son la voz de la casa y no un
 * dato: salen del mismo sitio que el bloque «A ver si te suena» de la portada.
 */
export const TALLER = {
  /** Se enseña sólo si hay las dos. Vacío = la página es lista de espera. */
  fechaISO: '' as string,
  /** «19:00 (hora española)». Vacío = no se dice ninguna hora. */
  hora: '' as string,
  /** Acordado en la reunión: hora y media. */
  duracion: '1 h 30 min',
  /** Zoom, YouTube, directo de Instagram… Vacío = no se promete plataforma. */
  donde: '' as string,
  /** Plazas. null = no se enseña contador y no se mete prisa falsa. */
  plazas: null as number | null,
  /**
   * ¿Se graba y se manda a quien se apunte?
   *
   * `null` mientras no esté decidido, y entonces no se dice nada. Prometer la
   * grabación sube mucho los registros — y por eso mismo no se puede prometer
   * sin que sea verdad: quien se apunta por la grabación y no la recibe no
   * vuelve a abrir un correo de Iris.
   */
  grabacion: null as boolean | null,
} as const;

/** true si el valor sigue sin rellenar. */
export const falta = (v: unknown) => v === PENDIENTE || v === null || v === '' || v === undefined;

export const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: true }).format(n);
