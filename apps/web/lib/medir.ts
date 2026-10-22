'use client';

/**
 * ============================================================================
 * MEDIR — UN SOLO SITIO DESDE EL QUE SE CUENTA LO QUE PASA
 * ============================================================================
 *
 * Esta web no medía nada. Ni analítica, ni píxel, ni etiqueta: cero. Y eso, el
 * día que haya publicidad, significa pagar a ciegas — no por no ver un informe
 * bonito, sino porque Meta y Google APRENDEN de lo que les devuelves. Si nadie
 * les dice «esta persona reservó», su algoritmo no puede ir a buscar más gente
 * parecida, y el anuncio no mejora nunca por mucho que se le eche dinero.
 *
 * ---------------------------------------------------------------------------
 * AQUÍ SE RESERVA HABLANDO, Y ESO CAMBIA CÓMO SE MIDE
 * ---------------------------------------------------------------------------
 * En una tienda normal la conversión se cuenta en la página de «gracias por tu
 * compra». Aquí no hay tal página: se reserva dentro de un chat y la dirección
 * no cambia en ningún momento. Así que el momento exacto en que alguien acaba
 * de reservar hay que marcarlo a mano, en el código, justo donde el servidor
 * contesta que la reserva ha entrado. Es lo que hace `medir('reserva')`.
 *
 * ---------------------------------------------------------------------------
 * MIENTRAS NO HAYA IDENTIFICADORES, ESTO NO HACE ABSOLUTAMENTE NADA
 * ---------------------------------------------------------------------------
 * `medir()` se puede llamar desde hoy en todos los sitios que hagan falta. Si no
 * están puestas las variables del píxel y de la etiqueta, o si la persona no ha
 * dado su consentimiento, la función no encuentra ni `fbq` ni `gtag` y se sale
 * sin hacer nada. Ni una petición, ni un error en consola, ni una cookie.
 *
 * Es a propósito: así el código queda instrumentado ANTES de que exista la
 * cuenta de anuncios, y el día que se pongan las variables empieza a medir solo,
 * sin tener que volver a tocar diez archivos buscando dónde iba cada evento.
 *
 * ---------------------------------------------------------------------------
 * LOS NOMBRES SON DOS, Y NO SE PUEDEN UNIFICAR
 * ---------------------------------------------------------------------------
 * Meta tiene sus eventos estándar («Lead», «Schedule», «Contact») y Google los
 * suyos. Un evento con nombre inventado se puede mandar, pero entonces no sirve
 * para optimizar una campaña: las plataformas sólo saben pujar por los que
 * reconocen. Por eso cada evento de esta casa lleva escrito a mano cómo se
 * llama en cada sitio, en la tabla de abajo, en vez de mandar el mismo nombre a
 * los dos y esperar lo mejor.
 */

/** Lo que de verdad pasa en esta web y merece contarse. */
export type Evento =
  /** Alguien ha abierto el chat de reservas. Es el principio del embudo. */
  | 'chat'
  /** LA CONVERSIÓN. Una reserva ha entrado de verdad en la agenda. */
  | 'reserva'
  /** Alguien ha dejado su correo — aviso de la comunidad, prueba gratis. */
  | 'lead'
  /** Alguien ha calculado su número gratis. Es el gancho, no la venta. */
  | 'numero'
  /**
   * EL FORMULARIO HA ENTRADO EN PANTALLA. Y el siguiente, que ha escrito algo.
   *
   * Gerson, el 22 de octubre, después de pagar 18 € y no conseguir ni un
   * registro: «¿qué podemos mejorar para tener resultados más precisos?».
   *
   * Esto es lo que faltaba para contestar a eso. Hasta hoy el embudo tenía un
   * agujero: se sabía cuánta gente LLEGA a la página y cuánta se APUNTA, y
   * entre esas dos cifras no había nada. Con 26 llegadas y cero registros no
   * se podía distinguir entre tres problemas que se arreglan de tres maneras
   * opuestas:
   *
   *   · No bajan hasta el formulario       → el problema es la página de arriba.
   *   · Lo ven y no escriben nada          → el problema es lo que se promete.
   *   · Lo empiezan y lo abandonan         → el problema es el propio formulario.
   *
   * Con estos dos eventos cada mañana se sabe cuál de los tres es, y se toca
   * ese y no los otros dos.
   *
   * VAN COMO PROPIOS Y NO COMO `ViewContent`: ese nombre ya lo usa el número
   * gratis, y dos cosas distintas con el mismo nombre se suman en el informe
   * de Meta sin avisar. Un número que mezcla dos cosas es peor que no tenerlo,
   * porque se usa igual para decidir.
   */
  | 'formularioVisto'
  | 'formularioEmpezado'
  /**
   * HA DADO AL PLAY. Y los cuatro de abajo, cuánto ha aguantado.
   *
   * Gerson pidió esto por su nombre: «quiero ver qué me hacen las personas, si
   * me ven el vídeo completo, si no me ven el vídeo completo».
   *
   * Sirve para dos cosas distintas y las dos valen dinero:
   *
   *   1. PARA DECIDIR. Si mucha gente da al play y casi nadie pasa del 25%, el
   *      problema no es el anuncio: es el primer medio minuto del vídeo. Y al
   *      revés: si quien llega al final tampoco se apunta, el vídeo está bien
   *      y lo que falla es el formulario. Sin estos cuatro números no se puede
   *      distinguir una cosa de la otra, y se acaba cambiando la que estaba
   *      bien.
   *   2. PARA QUE META APRENDA. Con `video75` se puede montar un público de
   *      gente que casi se lo ve entero y pedirle a Meta «búscame más gente
   *      así». Ese es el público objetivo que se construye solo, con datos de
   *      verdad, y no existe hasta que esto lleve unos días contando.
   */
  | 'video'
  | 'video25'
  | 'video50'
  | 'video75'
  | 'video100';

/**
 * Cómo se llama cada uno en cada plataforma.
 *
 * `meta` son los nombres estándar de Meta; `google` va en minúscula y con guion
 * bajo, que es la convención de GA4. Cambiar uno de estos nombres después de
 * lanzar una campaña rompe la campaña: la plataforma deja de recibir el evento
 * por el que está pujando y no avisa.
 */
const NOMBRES: Record<Evento, { meta: string; google: string; propio?: true }> = {
  chat: { meta: 'Contact', google: 'contacto_iniciado' },
  reserva: { meta: 'Schedule', google: 'reserva_hecha' },
  lead: { meta: 'Lead', google: 'generate_lead' },
  numero: { meta: 'ViewContent', google: 'numero_calculado' },
  formularioVisto: { meta: 'FormularioVisto', google: 'formulario_visto', propio: true },
  formularioEmpezado: { meta: 'FormularioEmpezado', google: 'formulario_empezado', propio: true },

  /* LOS DEL VÍDEO VAN MARCADOS COMO PROPIOS, y no es un capricho.
     Meta tiene una lista cerrada de eventos estándar —Lead, Contact, Schedule,
     ViewContent— y «se vio el 75% de un vídeo» no está en ella. Mandar un
     nombre inventado por la puerta de los estándar no da error: lo acepta y lo
     tira, y uno se queda esperando unos números que no van a llegar nunca.
     Por la puerta de los propios (`trackCustom`) sí llegan, y desde ahí se
     puede montar un público o una conversión personalizada. */
  video: { meta: 'VideoPlay', google: 'video_inicio', propio: true },
  video25: { meta: 'Video25', google: 'video_25', propio: true },
  video50: { meta: 'Video50', google: 'video_50', propio: true },
  video75: { meta: 'Video75', google: 'video_75', propio: true },
  video100: { meta: 'VideoCompleto', google: 'video_100', propio: true },
};

type Ventana = Window & {
  fbq?: (...args: unknown[]) => void;
  gtag?: (...args: unknown[]) => void;
};

/**
 * Cuenta que ha pasado algo.
 *
 * `datos` sólo debe llevar lo que ayuda a medir —el valor en euros de lo que se
 * ha reservado, de dónde venía la persona— y NUNCA datos personales: ni correo,
 * ni teléfono, ni nombre, ni fecha de nacimiento. Eso no es una recomendación de
 * estilo: mandar datos personales a un tercero sin una base legal es
 * exactamente el tipo de cosa por la que multa la Agencia de Protección de
 * Datos, y además las dos plataformas lo prohíben en sus condiciones.
 */
export function medir(evento: Evento, datos?: Record<string, string | number>, id?: string) {
  if (typeof window === 'undefined') return;
  const w = window as Ventana;
  const n = NOMBRES[evento];
  try {
    /* `id` ES PARA QUE NO SE CUENTE DOS VECES, y sólo lo usa el registro.
       Desde el 22 de octubre el servidor también le cuenta a Meta que alguien
       se ha apuntado (`lib/capi.ts`), porque el navegador se pierde avisos:
       bloqueadores, iPhone, pestañas que se cierran. Los dos avisos llevan el
       mismo identificador y Meta los junta en uno. Sin él vería dos registros
       por persona, creería que convierte el doble, y pujaría el doble. */
    w.fbq?.(n.propio ? 'trackCustom' : 'track', n.meta, datos, id ? { eventID: id } : undefined);
    w.gtag?.('event', n.google, datos);
  } catch {
    /* Que una plataforma de anuncios se caiga no puede romper una reserva.
       Nunca. Este `catch` vacío es de los pocos que están justificados. */
  }
}
