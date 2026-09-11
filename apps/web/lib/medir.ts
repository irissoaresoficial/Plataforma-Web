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
  | 'numero';

/**
 * Cómo se llama cada uno en cada plataforma.
 *
 * `meta` son los nombres estándar de Meta; `google` va en minúscula y con guion
 * bajo, que es la convención de GA4. Cambiar uno de estos nombres después de
 * lanzar una campaña rompe la campaña: la plataforma deja de recibir el evento
 * por el que está pujando y no avisa.
 */
const NOMBRES: Record<Evento, { meta: string; google: string }> = {
  chat: { meta: 'Contact', google: 'contacto_iniciado' },
  reserva: { meta: 'Schedule', google: 'reserva_hecha' },
  lead: { meta: 'Lead', google: 'generate_lead' },
  numero: { meta: 'ViewContent', google: 'numero_calculado' },
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
export function medir(evento: Evento, datos?: Record<string, string | number>) {
  if (typeof window === 'undefined') return;
  const w = window as Ventana;
  const n = NOMBRES[evento];
  try {
    w.fbq?.('track', n.meta, datos);
    w.gtag?.('event', n.google, datos);
  } catch {
    /* Que una plataforma de anuncios se caiga no puede romper una reserva.
       Nunca. Este `catch` vacío es de los pocos que están justificados. */
  }
}
