/**
 * Envía un correo captado a /api/lead. Devuelve si se ha guardado de verdad,
 * para que los formularios no digan "guardado" cuando no lo está.
 *
 * Y LE PEGA LA CAMPAÑA, SIN QUE NINGÚN FORMULARIO TENGA QUE ACORDARSE.
 *
 * Es el único sitio por el que sale un lead de esta web —la masterclass, la
 * lista de la comunidad y la sinergia pasan los tres por aquí—, así que es el
 * único sitio donde hay que acordarse. Si la etiqueta se pegara en cada
 * formulario, el día que se añada el cuarto alguien se olvidaría, y quedaría
 * un agujero en las métricas del que nadie se enteraría hasta ver que los
 * números de Meta y los de casa no cuadran.
 *
 * De dónde sale la etiqueta y por qué no vive en una cookie: `campana.ts`.
 *
 * ---------------------------------------------------------------------------
 * Y DECIDE SI META SE ENTERA, QUE ES LO NUEVO DEL 22 DE OCTUBRE
 * ---------------------------------------------------------------------------
 * El registro se le cuenta a Meta por dos vías: el píxel, desde este navegador,
 * y la API de conversiones, desde el servidor (`lib/capi.ts`). La segunda existe
 * porque la primera se pierde avisos —bloqueadores, iPhone, pestañas que se
 * cierran— y una campaña que no recibe registros no puede aprender a traerlos.
 *
 * Por el mismo motivo que la etiqueta, las dos cosas que eso necesita se
 * preparan AQUÍ y no en cada formulario:
 *
 *   1. UN IDENTIFICADOR COMPARTIDO. El píxel y el servidor mandan el mismo, y
 *      Meta junta los dos avisos en un registro. Sin él contaría dos.
 *   2. EL PERMISO. Si la persona dijo «no, gracias» al cartel, al servidor le
 *      llega `consentimiento: false` y no le manda nada a Meta: ni el correo
 *      cifrado, ni la IP, ni nada. El cartel es la única base legal que hay
 *      para esa comunicación, y aquí es donde se comprueba.
 */
import { hayCampana, leeCampana } from './campana';
import type { LeadSource } from './booking';
import { LLAVE_MEDICION } from './pixel';

/**
 * Lo que devuelve: si entró, y con qué identificador se contó.
 *
 * Devolvía un `boolean` a secas. Ahora hace falta el identificador fuera, para
 * que el formulario pueda pasárselo a `medir('lead', …)` y el aviso del píxel
 * lleve el mismo que el del servidor. Quien sólo quiera saber si entró lee
 * `ok` y se olvida del resto.
 */
export type LeadEnviado = { ok: boolean; eventoId: string };

/** Un identificador para este registro concreto. */
function nuevoId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    /* Navegador antiguo o contexto sin `crypto`: sirve el de abajo. */
  }
  return `lead-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Si esta persona dio permiso para la medición.
 *
 * Lo apuntó el cartel en su propio navegador. En una ventana privada o con las
 * cookies bloqueadas leer esto lanza, y entonces la respuesta correcta es que
 * NO hay permiso: ante la duda, no se le manda nada a nadie.
 */
function hayPermisoDeMedicion(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(LLAVE_MEDICION) === 'si';
  } catch {
    return false;
  }
}

export async function sendLead(payload: {
  email: string;
  nombre?: string;
  /* Uno de los tres que el servidor conoce, y no un texto cualquiera. El motivo
     está escrito entero junto a `LEAD_SOURCES`, en `booking.ts`. */
  origen: LeadSource;
  detalle?: string;
  whatsapp?: string;
  lang?: string;
  /* El correo ya escrito para la persona. Sólo lo manda la sinergia; ver
     `correo-sinergia.ts` y el comentario del tipo `Lead` en `booking.ts`. */
  asunto?: string;
  parrafos?: string[];
}): Promise<LeadEnviado> {
  const campana = leeCampana();
  const eventoId = nuevoId();
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lang: 'es',
        nombre: '',
        detalle: '',
        whatsapp: '',
        ...payload,
        /* Sin etiquetas no se manda el bloque: un lead que llegó por su cuenta
           no tiene por qué escribir seis campos vacíos en la base de datos. */
        ...(hayCampana(campana) ? { campana } : {}),
        /* Esto NO se guarda en la base: es sólo para que el servidor sepa si
           puede avisar a Meta y con qué identificador. Ver `api/lead`. */
        meta: { id: eventoId, consentimiento: hayPermisoDeMedicion() },
      }),
    });
    const data = await res.json().catch(() => null);
    return { ok: !!data?.ok, eventoId };
  } catch {
    return { ok: false, eventoId };
  }
}
