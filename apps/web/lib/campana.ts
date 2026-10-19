'use client';

/**
 * ============================================================================
 * DE DÓNDE VINO CADA PERSONA
 * ============================================================================
 *
 * Gerson, el 19 de octubre: «métricas de dónde vienen las personas, métricas
 * que necesitemos para constantes mejoras».
 *
 * Eso no se puede saber mirando la base de datos de hoy. Un lead guarda el
 * correo, el nombre y por qué formulario entró — y nada más. Dos personas que
 * se apuntan a la masterclass se guardan exactamente igual, venga una de un
 * anuncio de 40 € y la otra de un mensaje de WhatsApp de su prima. Y si no se
 * distinguen, no hay forma de saber qué anuncio apagar.
 *
 * ---------------------------------------------------------------------------
 * CÓMO SE SABE: LA COLA DE LA DIRECCIÓN
 * ---------------------------------------------------------------------------
 * Cuando Meta manda a alguien a la web, la dirección lleva una cola:
 *
 *     escueladesabiduria33.com/masterclass
 *       ?utm_source=meta
 *       &utm_medium=cpc
 *       &utm_campaign=masterclass-desordenes
 *       &utm_content=video-marco-30s
 *
 * Son cinco etiquetas estándar que entiende todo el mundo —Meta, Google,
 * cualquier herramienta— y que las pone quien monta el anuncio, no el
 * navegador. Aquí se leen, se guardan con el lead, y entonces Métricas puede
 * decir «el vídeo de Marco trajo 31 leads a 2,10 € y el cartel trajo 4 a 14 €».
 * Eso es una decisión, no un número bonito.
 *
 * ---------------------------------------------------------------------------
 * NO SE GUARDA EN NINGUNA COOKIE, Y ES A PROPÓSITO
 * ---------------------------------------------------------------------------
 * Lo normal en la industria es meter esto en una cookie o en `localStorage`
 * para que sobreviva si la persona se va y vuelve tres días después. Aquí no,
 * y conviene que quede escrito por qué:
 *
 * Guardar algo en el navegador para fines de medición publicitaria exige
 * consentimiento previo en España — lo mismo que el píxel. O sea que meter
 * esto en una cookie obligaría a enseñar el cartel ANTES de poder atribuir
 * nada, y quien dijera «no, gracias» se quedaría sin atribuir igualmente.
 *
 * Así que vive en memoria: una variable de este módulo, que dura lo que dura
 * la pestaña abierta. Sin cookie, sin almacenamiento, sin consentimiento que
 * pedir, sin nada que declarar.
 *
 * LO QUE SE PIERDE, DICHO SIN DISIMULO: si alguien pincha el anuncio, cierra
 * la pestaña y vuelve mañana escribiendo la dirección a mano, ese lead se
 * guarda sin campaña. Es un caso real y no se va a atribuir.
 *
 * LO QUE NO SE PIERDE, que es el 95% de lo que importa: en la masterclass el
 * formulario está en la MISMA PÁGINA donde aterriza el anuncio. Pincha, baja,
 * rellena. La pestaña no se ha cerrado en ningún momento, así que la etiqueta
 * llega entera. Y si navega por la web, Next tampoco recarga la página: la
 * memoria sigue ahí.
 *
 * ---------------------------------------------------------------------------
 * ESTO NO ES UN DATO PERSONAL, Y LA DIFERENCIA IMPORTA
 * ---------------------------------------------------------------------------
 * `utm_source=meta` no dice nada de nadie: dice de qué anuncio salió el clic.
 * No identifica, no perfila y no se cruza con terceros. Se guarda pegado a un
 * lead que la persona ha entregado voluntariamente, bajo la misma base legal
 * que el propio lead. Por eso puede ir sin cartel, al contrario que el píxel.
 */

/** Las cinco etiquetas estándar, más por dónde entró. */
export type Campana = {
  /** Quién lo manda: `meta`, `instagram`, `google`, `whatsapp`. */
  source: string;
  /** Cómo: `cpc` si es pagado, `organic` si no. */
  medium: string;
  /** Qué campaña: `masterclass-desordenes`. */
  campaign: string;
  /** El anuncio CONCRETO: `video-marco-30s`. Es la etiqueta más útil de todas,
   *  porque es la única que señala a una pieza y no a un grupo. */
  content: string;
  /** Palabra clave. Casi siempre vacía fuera de Google. */
  term: string;
  /** La primera página que pisó. Dice por qué puerta entró aunque no haya
   *  etiquetas: `/masterclass` no es lo mismo que `/`. */
  landing: string;
};

const VACIA: Campana = { source: '', medium: '', campaign: '', content: '', term: '', landing: '' };

/* La memoria. Dura lo que dura la pestaña: ni más —no hay cookie— ni menos
   —Next no recarga la página al navegar, así que sobrevive a los saltos entre
   secciones. `null` significa «todavía no se ha mirado». */
let recordada: Campana | null = null;

/** Corta y limpia. Las etiquetas las escribe quien monta el anuncio, así que
 *  pueden venir con cualquier cosa dentro; esto acaba en una base de datos y
 *  en una pantalla, no en una consulta, pero se acota igual. */
function etiqueta(v: string | null): string {
  return (v || '').trim().slice(0, 100).replace(/[<>]/g, '');
}

/**
 * Mira la dirección y se queda con lo que traiga. LA PRIMERA GANA.
 *
 * Que la primera gane no es un detalle: si alguien entra por el anuncio de
 * Marco y luego navega a /numerologia, la segunda página no lleva etiquetas.
 * Si dejáramos que la última mandara, el lead se guardaría sin campaña y el
 * anuncio de Marco no se llevaría el mérito que le toca.
 *
 * Se llama al montar, desde el componente que mide. Llamarla dos veces no hace
 * nada, que es justo lo que se quiere.
 */
export function recuerdaCampana(): void {
  if (typeof window === 'undefined') return;
  if (recordada) return;

  const p = new URLSearchParams(window.location.search);
  recordada = {
    source: etiqueta(p.get('utm_source')),
    medium: etiqueta(p.get('utm_medium')),
    campaign: etiqueta(p.get('utm_campaign')),
    content: etiqueta(p.get('utm_content')),
    term: etiqueta(p.get('utm_term')),
    landing: etiqueta(window.location.pathname),
  };
}

/**
 * Lo que haya que pegarle al lead.
 *
 * Si nadie llamó a `recuerdaCampana` todavía —un formulario que se envía antes
 * de que monte nada, que no debería pasar pero pasa— se mira la dirección en
 * ese momento. Peor que recordarla, mejor que perderla.
 */
export function leeCampana(): Campana {
  if (typeof window === 'undefined') return VACIA;
  if (!recordada) recuerdaCampana();
  return recordada || VACIA;
}

/** Si trae algo que merezca guardarse. Un lead sin etiquetas no escribe seis
 *  campos vacíos en la base de datos: se queda sin el bloque y ya está. */
export function hayCampana(c: Campana): boolean {
  return Boolean(c.source || c.medium || c.campaign || c.content || c.term);
}
