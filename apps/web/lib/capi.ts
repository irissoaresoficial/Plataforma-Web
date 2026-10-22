/**
 * ============================================================================
 * AVISAR A META DESDE EL SERVIDOR (CONVERSIONS API)
 * ============================================================================
 *
 * Gerson, el 21 de octubre: «insisto, hoy día se sacan datos sin cookies, no
 * entiendo por qué no lo haces sin eso, por ejemplo API».
 *
 * Esto es esa API. Y conviene empezar por lo que NO es, porque es la parte que
 * se vende mal en todas partes:
 *
 * ---------------------------------------------------------------------------
 * ESTO NO QUITA EL CARTEL DE COOKIES. NADA LO QUITA.
 * ---------------------------------------------------------------------------
 * Lo que exige consentimiento en España no es la cookie: es MANDARLE A META
 * DATOS DE UNA PERSONA PARA FINES PUBLICITARIOS. Da igual si el dato viaja en
 * una cookie, en una llamada del navegador o —como aquí— en una petición de
 * servidor a servidor por detrás. El correo cifrado sigue siendo un dato
 * personal (pseudonimizado, dice el RGPD; que no es lo mismo que anónimo), y
 * comunicarlo a un tercero para que mejore sus anuncios necesita permiso.
 *
 * Así que el cartel se queda. Lo que sí se ha hecho es dejarlo pequeño.
 *
 * ---------------------------------------------------------------------------
 * ENTONCES, ¿PARA QUÉ SIRVE ESTO?
 * ---------------------------------------------------------------------------
 * Para que los registros LLEGUEN. Hoy el único que le cuenta a Meta que
 * alguien se ha apuntado es el píxel, desde el navegador de esa persona. Y el
 * navegador es el sitio más frágil del mundo para apoyar una campaña:
 *
 *   · un bloqueador de anuncios tira el script y el registro no se cuenta;
 *   · Safari y los iPhone recortan lo que puede mandar;
 *   · si la pestaña se cierra en el momento malo, el aviso se va con ella;
 *   · y si el script falla por cualquier motivo, no hay error en ninguna
 *     parte: simplemente no llega nada, y la campaña aprende de un cero.
 *
 * Eso último no es teórico: en esta campaña el píxel estuvo sin disparar
 * mientras los anuncios gastaban, y se vio tarde.
 *
 * Desde el servidor nada de eso aplica. El registro se manda desde donde se ha
 * guardado, que es el único sitio que SABE de verdad que ha ocurrido. Las dos
 * vías conviven: el píxel sigue mandando el suyo y Meta los junta por
 * `event_id`, que es el mismo en los dos. Sin ese identificador compartido Meta
 * contaría dos registros por cada persona, y una campaña que cree que convierte
 * el doble puja el doble.
 *
 * ---------------------------------------------------------------------------
 * Y ESTO ES LO QUE DESBLOQUEA DE VERDAD
 * ---------------------------------------------------------------------------
 * Mientras Meta no reciba registros no se puede pedirle que busque registros:
 * hay que conformarse con pedirle clics, que es lo que trae gente que toca el
 * anuncio sin querer. Con los registros entrando, se puede montar un conjunto
 * de anuncios que optimice a REGISTRO, y ahí es donde el coste por persona baja
 * de verdad.
 *
 * ---------------------------------------------------------------------------
 * QUÉ SE LE MANDA, Y POR QUÉ CADA COSA
 * ---------------------------------------------------------------------------
 *   em                 el correo cifrado con SHA-256. Nunca en claro. Es la
 *                      llave con la que Meta reconoce a la persona.
 *   fbc / fbp          las dos galletas que deja el propio píxel: de qué clic
 *                      vino y qué navegador es. Son la atribución exacta —con
 *                      `fbc` Meta sabe el anuncio concreto, sin adivinar— y
 *                      sólo existen si la persona aceptó el cartel, porque las
 *                      pone el píxel. Si dijo que no, no hay galletas y
 *                      tampoco hay envío.
 *   client_ip_address  la dirección de internet, entera.
 *   client_user_agent  el navegador.
 *
 * LAS DOS ÚLTIMAS, QUE CHIRRÍAN, Y HAY QUE EXPLICARLAS: esta casa no guarda la
 * IP entera de nadie —se recorta antes de escribirla, ver `api/lead`—. Aquí se
 * manda entera porque Meta las exige para los eventos de web y porque, en el
 * caso de alguien que ACEPTÓ el píxel, Meta ya tiene las dos: el píxel se las
 * manda en cada visita. No se le está dando nada nuevo. Para quien dijo «no,
 * gracias» no se manda nada en absoluto, ni esto ni el correo.
 *
 * Y no se manda el NOMBRE aunque Meta lo acepte y aunque mejoraría un poco el
 * emparejamiento: con el correo ya empareja, y el principio de minimización del
 * artículo 5.1.c dice que lo que no hace falta no se manda.
 *
 * ---------------------------------------------------------------------------
 * SIN TOKEN NO HACE NADA, Y ESO ESTÁ BIEN
 * ---------------------------------------------------------------------------
 * Hace falta una variable en Vercel, `META_CAPI_TOKEN`, que se genera en el
 * Administrador de eventos de Meta (el píxel → Configuración → Conversions
 * API → Generar token de acceso). ESA SÍ ES UN SECRETO: con ella se pueden
 * escribir eventos en el píxel, así que no va escrita en el código, no es
 * `NEXT_PUBLIC_` y no se imprime en ningún registro.
 *
 * Mientras no exista, esta función devuelve `sin_token` y no pasa nada más: el
 * lead se guarda igual, los correos salen igual y la web se comporta
 * exactamente como antes. El día que se pegue la variable empieza a avisar sola.
 */
import { createHash } from 'node:crypto';
import { PIXEL_META } from './pixel';

/* La versión de la API va fijada a propósito. Si se deja a la que Meta sirva
   por defecto, un cambio suyo de versión puede cambiar qué campos acepta sin
   que aquí se toque una línea. */
const VERSION = 'v23.0';

export type AvisoDeRegistro = {
  /** El correo tal cual lo escribió la persona. Se cifra aquí dentro. */
  email: string;
  /** El MISMO identificador que lleva el evento del píxel. Sin él, Meta cuenta dos. */
  id: string;
  /** La página donde se apuntó. Meta la exige para los eventos de web. */
  url: string;
  /** El navegador. Meta lo exige para los eventos de web. */
  agente: string;
  /** La dirección de internet, entera. Ver arriba por qué. */
  ip?: string;
  /** La galleta del clic que la trajo, si el píxel la dejó. */
  fbc?: string;
  /** La galleta del navegador, si el píxel la dejó. */
  fbp?: string;
  /** Para distinguir en Meta un registro de la masterclass de otro cualquiera. */
  contenido?: string;
};

export type ResultadoAviso = { enviado: boolean; motivo?: string };

/** SHA-256 en minúsculas y sin espacios, que es como lo pide Meta. */
function cifra(valor: string): string {
  return createHash('sha256').update(valor.trim().toLowerCase()).digest('hex');
}

/**
 * Saca de la petición las dos galletas que deja el píxel de Meta.
 *
 * Son de primera parte —las pone el script en nuestro propio dominio—, así que
 * llegan solas en la cabecera `cookie` de cada petición sin que el formulario
 * tenga que mandarlas. Si la persona dijo «no» al cartel, el píxel no cargó y
 * aquí no hay nada: que vengan vacías es la respuesta correcta, no un fallo.
 */
export function galletasDeMeta(request: Request): { fbc?: string; fbp?: string } {
  const cabecera = request.headers.get('cookie') || '';
  const busca = (nombre: string): string | undefined => {
    for (const trozo of cabecera.split(';')) {
      const corte = trozo.indexOf('=');
      if (corte < 0) continue;
      if (trozo.slice(0, corte).trim() !== nombre) continue;
      const valor = trozo.slice(corte + 1).trim();
      /* Acotado: esto acaba dentro de una petición a un tercero, y una galleta
         la escribe quien quiera en su propio navegador. */
      return valor ? valor.slice(0, 200) : undefined;
    }
    return undefined;
  };
  return { fbc: busca('_fbc'), fbp: busca('_fbp') };
}

/**
 * Le cuenta a Meta que alguien se ha apuntado. NUNCA LANZA.
 *
 * Esto se llama después de guardar el lead, y lo que no puede pasar bajo ningún
 * concepto es que un fallo de Meta —su API caída, el token caducado, la red
 * lenta— le devuelva un error a una persona que acaba de apuntarse bien. Así
 * que todo lo que pueda romperse se recoge aquí y se devuelve como `enviado:
 * false` con el motivo, para que quien llama lo apunte en los registros y siga.
 */
export async function avisaMeta(aviso: AvisoDeRegistro): Promise<ResultadoAviso> {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) return { enviado: false, motivo: 'sin_token' };
  if (!PIXEL_META) return { enviado: false, motivo: 'sin_pixel' };
  if (!aviso.email || !aviso.id) return { enviado: false, motivo: 'sin_datos' };

  const cuerpo = {
    /* El token viaja en el cuerpo y no en la dirección: una dirección con un
       secreto dentro acaba en los registros de alguien. */
    access_token: token,
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id: aviso.id,
        action_source: 'website',
        event_source_url: aviso.url,
        user_data: {
          em: [cifra(aviso.email)],
          client_user_agent: aviso.agente,
          ...(aviso.ip ? { client_ip_address: aviso.ip } : {}),
          /* Sin cifrar, y es así a propósito: Meta pide cifrados los datos de
             la persona (correo, teléfono) y en claro los identificadores que
             puso ella misma (`fbc`, `fbp`, IP, navegador). Cifrar estos dos los
             deja inservibles y el evento se queda sin atribuir. */
          ...(aviso.fbc ? { fbc: aviso.fbc } : {}),
          ...(aviso.fbp ? { fbp: aviso.fbp } : {}),
        },
        ...(aviso.contenido ? { custom_data: { content_name: aviso.contenido } } : {}),
      },
    ],
  };

  try {
    const res = await fetch(`https://graph.facebook.com/${VERSION}/${PIXEL_META}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
      /* Ocho segundos. Si Meta no contesta en ocho segundos, el registro ya
         está guardado y la persona ya tiene su pantalla de gracias: lo que no
         se puede es tenerla esperando por esto. */
      signal: AbortSignal.timeout(8_000),
    });

    const texto = await res.text();
    let datos: { events_received?: number; error?: { message?: string } } | null = null;
    try {
      datos = JSON.parse(texto);
    } catch {
      /* Si no es JSON, el texto crudo es lo que hay que poder leer en Vercel. */
    }

    if (!res.ok) {
      /* El mensaje de Meta, recortado. El token NO aparece en la respuesta,
         pero se recorta igual por si algún día apareciera. */
      return { enviado: false, motivo: `meta_${res.status}: ${(datos?.error?.message || texto).slice(0, 200)}` };
    }

    /* Meta contesta 200 también cuando acepta cero eventos: hay que mirar el
       número, no el código. */
    if (!datos || !datos.events_received) return { enviado: false, motivo: 'aceptado_pero_cero' };

    return { enviado: true };
  } catch (err) {
    return { enviado: false, motivo: err instanceof Error ? err.message : 'error_desconocido' };
  }
}
