/**
 * GUARDAR PRIMERO. AVISAR DESPUÉS.
 *
 * Hasta hoy esta ruta hacía una sola cosa: pasarle el lead al Apps Script de
 * Google. Y si el Apps Script fallaba —Google caído, la clave mal copiada, el
 * script reimplementado sin publicar la versión nueva— el correo se perdía
 * entero. No quedaba copia en ninguna parte.
 *
 * Guardar el dato y mandar el aviso son dos cosas distintas, y estaban atadas
 * de forma que la más frágil se llevaba por delante a la más importante.
 *
 * Ahora el orden es el que tiene que ser:
 *
 *   1. Se guarda en Firestore. Esto es lo que no se puede perder.
 *   2. Se mandan los correos por Resend.
 *   3. Se avisa al Apps Script, que apunta la fila en la hoja de Iris.
 *
 * Si falla el aviso pero el dato está guardado, la persona ve que se ha
 * apuntado —porque se ha apuntado— y Iris la tiene en su lista aunque el correo
 * automático no haya salido. Si falla lo de guardar Y lo de avisar, entonces sí
 * se devuelve error, porque entonces sí se ha perdido.
 *
 * ---------------------------------------------------------------------------
 * EL CORREO ES COSA DE RESEND. GOOGLE SÓLO APUNTA LA FILA.
 * ---------------------------------------------------------------------------
 * Gerson, el 19 de octubre: «lo de Google (correos) bórralo todo, a partir de
 * este momento en cuestión de correos será con Resend».
 *
 * Así que del Apps Script se ha quitado hasta el último `MailApp.sendEmail`.
 * Lo que sigue haciendo —y por lo que se le sigue llamando— es apuntar la
 * persona en la hoja de cálculo, que es donde Iris mira sus apuntados y que
 * Resend no hace: Resend manda correos, no guarda listas.
 *
 * LO QUE ESTO SIGNIFICA, Y HAY QUE SABERLO: ya no hay plan B. Antes, si
 * Resend fallaba, el correo salía igual por Gmail. Ahora, si Resend falla, no
 * sale. El lead NO se pierde —está en Firestore y en la hoja— pero esa
 * persona se queda sin su confirmación hasta que alguien le escriba.
 *
 * Por eso un fallo aquí se registra con `[lead] CORREO NO ENVIADO`, en
 * mayúsculas y con el correo delante: es lo que hay que poder buscar en los
 * registros de Vercel el día que alguien diga que no le llegó nada. Y en el
 * panel de Resend, en «Emails», está cada envío con su estado.
 */
import { NextResponse } from 'next/server';
import { parseLead } from '@/lib/booking';
import { guardaLead } from '@/lib/leads-firebase';
import { dondeEsta } from '@/lib/donde';
import { enviaCorreosDeLead } from '@/lib/correo';
import { avisaMeta, galletasDeMeta } from '@/lib/capi';
import { SITIO } from '@/lib/seo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/* Como en /api/booking: Google tarda en mandar los correos, y cortarle a los
   diez segundos por defecto de Vercel deja a medias algo que iba bien. */
export const maxDuration = 60;

const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 8;

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  return recent.length > MAX_PER_WINDOW;
}

/**
 * Recorta una IP para que deje de señalar a una persona y siga diciendo de
 * dónde viene la visita.
 *
 *   IPv4: se pone a cero el último octeto. 88.12.34.56 -> 88.12.34.0
 *   IPv6: se deja el prefijo /48, que es la red. El resto se descarta.
 *
 * Lo que no reconozca como IP se guarda como 'desconocida': antes que
 * arriesgarse a dejar pasar algo entero.
 */
function recortaIp(ip: string): string {
  if (!ip || ip === 'local') return ip || 'desconocida';
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    const partes = ip.split('.');
    partes[3] = '0';
    return partes.join('.');
  }
  if (ip.includes(':')) {
    const grupos = ip.split(':').filter(Boolean).slice(0, 3);
    return grupos.length ? `${grupos.join(':')}::` : 'desconocida';
  }
  return 'desconocida';
}

/**
 * EL BLOQUE QUE DICE SI META PUEDE ENTERARSE, Y CON QUÉ IDENTIFICADOR.
 *
 * Lo manda `lib/sendLead.ts` y NO entra en la base de datos: no es un dato del
 * lead, es un permiso y un número de referencia para esta petición.
 *
 * El permiso lo pone el navegador leyendo lo que la persona contestó al cartel
 * de cookies. Sí, eso significa que alguien podría escribir `true` a mano con
 * las herramientas del navegador — y lo único que conseguiría es que Meta se
 * enterase de su propio registro. No hay nada que proteger ahí. Lo que importa
 * es el caso normal: quien dijo «no, gracias» manda `false`, y entonces no sale
 * nada hacia Meta.
 *
 * Ante cualquier cosa rara —el bloque no viene, viene a medias, viene con otro
 * tipo— la respuesta es que NO hay permiso. Un formulario viejo cacheado en el
 * navegador de alguien no lleva este bloque, y lo correcto es no mandar nada.
 */
function leePermisoDeMeta(body: unknown): { id: string; permitido: boolean } {
  const bloque = (body as { meta?: unknown } | null)?.meta;
  if (!bloque || typeof bloque !== 'object') return { id: '', permitido: false };
  const m = bloque as { id?: unknown; consentimiento?: unknown };
  const id = typeof m.id === 'string' ? m.id.trim().slice(0, 80) : '';
  return { id, permitido: m.consentimiento === true && Boolean(id) };
}


export async function POST(request: Request) {
  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (rateLimited(ip)) return NextResponse.json({ ok: false, reason: 'rate_limited' }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_json' }, { status: 400 });
  }

  const { lead, error } = parseLead(body);
  if (!lead) return NextResponse.json({ ok: false, reason: `invalid_${error}` }, { status: 400 });

  /* La ubicación la pone el servidor, no el navegador. Si viniera del cliente
     cualquiera podría decir que entra desde Tokio, y entonces el mapa de
     Métricas sería una obra de ficción. */
  const donde = dondeEsta(request);
  if (donde.pais) lead.pais = donde.pais;
  if (donde.ciudad) lead.ciudad = donde.ciudad;

  /* ---------------------------------------------------------------- 1 */
  /* Se guarda ANTES de intentar nada más. Si Firebase no está configurado esto
     devuelve `sin_configurar` y no pasa nada: se sigue como se seguía antes. */
  /* El correo escrito para la persona NO se guarda en la base: es texto que se
     vuelve a componer igual en cualquier momento a partir de las fechas, así que
     guardarlo sería meter un párrafo largo por lead para no usarlo jamás. Al
     Apps Script sí va, que es quien tiene que mandarlo. */
  const { asunto: _a, parrafos: _p, ...paraGuardar } = lead;
  const enBase = await guardaLead(paraGuardar, {
    /* LA IP VA RECORTADA, Y NO ES UN CAPRICHO.
       Aquí se guardaba entera. Una IP completa identifica a una persona: es
       dato personal del artículo 4.1 del RGPD, y guardarla «por si acaso»,
       sin que haga falta para nada y sin decirlo en la política de
       privacidad, es exactamente lo que multa la Agencia Española de
       Protección de Datos. MARCA.md §7 ya lo tenía escrito: «no se guarda la
       IP entera de nadie».
       Para lo único que se usa es para frenar a quien envíe el formulario
       cien veces, y para eso el recorte sirve igual — ese control vive más
       arriba, en memoria, y no toca esto.
       Se recorta como manda la práctica estándar: en IPv4 se borra el último
       octeto (88.12.34.56 -> 88.12.34.0) y en IPv6 se deja el prefijo de red.
       Sigue valiendo para saber de qué país y provincia entra la gente, que
       es para lo que se quería, y deja de señalar a una persona. */
    ip: recortaIp(ip),
    agente: (request.headers.get('user-agent') || '').slice(0, 200),
  });

  /* --------------------------------------------------------------- 1.b */
  /*
   * QUE META SE ENTERE, Y SÓLO SI ELLA DIJO QUE SÍ.
   *
   * Va aquí, pegado a lo de guardar, por una razón de fondo: este servidor es
   * el único sitio del mundo que SABE que el registro ha ocurrido. El píxel del
   * navegador manda el suyo también, pero se pierde con un bloqueador, con un
   * iPhone o con una pestaña que se cierra en el momento malo — y esta campaña
   * ya estuvo gastando con el píxel sin disparar. Los dos avisos llevan el mismo
   * `id` y Meta los junta en uno.
   *
   * Lo que se le manda y por qué cada cosa está escrito en `lib/capi.ts`.
   * Lo que NO se le manda si no hay permiso: absolutamente nada.
   *
   * No se le mira el resultado para decidir qué contestarle a la persona. Que
   * Meta acepte o no un evento no cambia que ella se ha apuntado.
   */
  const permisoMeta = leePermisoDeMeta(body);
  if (permisoMeta.permitido) {
    const { fbc, fbp } = galletasDeMeta(request);
    const avisado = await avisaMeta({
      email: lead.email,
      id: permisoMeta.id,
      /* La página desde la que se envió el formulario. Meta la exige para los
         eventos de web, y además dice por qué puerta entró. */
      url: request.headers.get('referer') || SITIO,
      agente: request.headers.get('user-agent') || '',
      /* Entera, y sólo hacia Meta. En nuestra base va recortada, arriba. */
      ip: ip !== 'local' ? ip : undefined,
      fbc,
      fbp,
      /* De los tres orígenes que el servidor conoce. Nada más: el detalle es
         texto libre y a un tercero no se le manda texto libre. */
      contenido: lead.origen,
    });
    /* `sin_token` no es un fallo: es que la variable de Vercel todavía no
       está puesta, y mientras no esté no hay nada que avisar. Lo demás sí hay
       que poder buscarlo en los registros. */
    if (!avisado.enviado && avisado.motivo !== 'sin_token') {
      console.error('[lead] META NO AVISADO', lead.origen, '·', avisado.motivo);
    }
  }

  /* ---------------------------------------------------------------- 2 */
  /* LOS CORREOS. No lanza nunca: si Resend no está configurado o falla,
     devuelve `enviado: false` y NO HAY NADIE MÁS QUE LOS MANDE. El Apps Script
     dejó de mandar correos el 19 de octubre, así que esto no es un aviso: es
     una persona que se ha apuntado y no va a recibir nada. Se escribe en los
     registros y lo canta `/api/diagnostico`. */
  const correo = await enviaCorreosDeLead(lead);
  if (!correo.enviado) {
    console.error('[lead] CORREO NO ENVIADO', lead.email, lead.origen, '·', correo.motivo);
  }

  /* ---------------------------------------------------------------- 3 */
  if (!url) {
    /* Sin Apps Script no se apunta en la hoja de cálculo, pero el correo ya
       habrá salido por Resend, que es lo que ve la persona. El lead está en
       Firestore, así que no se pierde: lo que falta es la fila de Iris. */
    if (enBase.guardado) {
      console.warn('[lead] Guardado en Firebase, pero sin APPS_SCRIPT_URL: no entra en la hoja.', lead.email, lead.origen);
      return NextResponse.json({ ok: true, aviso: correo.enviado ? 'sin_hoja' : 'sin_hoja_ni_correo' });
    }
    console.error('[lead] LEAD PERDIDO: ni Firebase ni Apps Script configurados.', lead.email, lead.origen);
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'lead', secret, lead }),
      redirect: 'follow',
      signal: AbortSignal.timeout(45_000),
    });
    const text = await res.text();
    let data: unknown = null;
    try {
      data = JSON.parse(text);
    } catch {}

    const bien = res.ok && (data as { ok?: boolean } | null)?.ok === true;
    if (!bien) {
      console.error('[lead] Apps Script respondió mal:', res.status, text.slice(0, 300));
      /* El aviso falló. Si el dato está guardado, la persona está apuntada de
         verdad y lo único que no ha salido es el correo automático: eso no es
         un error para quien rellenó el formulario. */
      if (enBase.guardado) return NextResponse.json({ ok: true, aviso: 'sin_correo' });
      return NextResponse.json({ ok: false, reason: 'upstream' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[lead] Error llamando al Apps Script:', err);
    if (enBase.guardado) return NextResponse.json({ ok: true, aviso: 'sin_correo' });
    return NextResponse.json({ ok: false, reason: 'upstream' }, { status: 502 });
  }
}
