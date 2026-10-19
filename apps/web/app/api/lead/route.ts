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
 *   3. Se avisa al Apps Script, que apunta el lead en la hoja de Iris.
 *
 * Si falla el aviso pero el dato está guardado, la persona ve que se ha
 * apuntado —porque se ha apuntado— y Iris la tiene en su lista aunque el correo
 * automático no haya salido. Si falla lo de guardar Y lo de avisar, entonces sí
 * se devuelve error, porque entonces sí se ha perdido.
 *
 * ---------------------------------------------------------------------------
 * LOS CORREOS SALEN POR RESEND, Y GOOGLE SE CALLA. O AL REVÉS.
 * ---------------------------------------------------------------------------
 * Gerson, el 19 de octubre: «a partir de este momento todo será por Resend».
 *
 * El peligro evidente de tener dos sistemas de correo apuntando al mismo lead
 * es que la persona reciba la confirmación DOS VECES, una por cada camino. Por
 * eso el paso 2 le dice al paso 3 lo que ha conseguido hacer:
 *
 *   · Resend mandó  -> al Apps Script se le pasa `sinCorreo: true`, y él sólo
 *                      apunta la fila en la hoja. Ni acuse ni aviso a Iris.
 *   · Resend falló   -> no se le pasa nada, y el Apps Script manda los correos
 *                      como lleva haciendo desde el principio.
 *
 * O sea que el cambio de sistema no tiene momento de riesgo: mientras no haya
 * `RESEND_API_KEY` en Vercel, todo sigue saliendo por Google exactamente igual
 * que antes, y el día que se pegue la clave empieza a salir por Resend sin
 * tocar una línea más.
 */
import { NextResponse } from 'next/server';
import { parseLead } from '@/lib/booking';
import { guardaLead } from '@/lib/leads-firebase';
import { enviaCorreosDeLead } from '@/lib/correo';

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

  /* ---------------------------------------------------------------- 2 */
  /* LOS CORREOS. No lanza nunca: si Resend no está configurado o falla,
     devuelve `enviado: false` y el Apps Script se encarga más abajo. */
  const correo = await enviaCorreosDeLead(lead);
  if (!correo.enviado && correo.motivo !== 'sin_clave' && correo.motivo !== 'origen_sin_plantilla') {
    console.error('[lead] Resend no pudo mandar:', correo.motivo, lead.email, lead.origen);
  }

  /* ---------------------------------------------------------------- 3 */
  if (!url) {
    /* Sin Apps Script no se apunta en la hoja de cálculo. El correo puede
       haber salido igualmente por Resend, así que el aviso que se devuelve
       dice lo que de verdad ha pasado y no «sin_correo» a ciegas. */
    if (enBase.guardado) {
      if (!correo.enviado) {
        console.warn('[lead] Guardado en Firebase, pero ni Resend ni Apps Script: no sale correo.', lead.email, lead.origen);
      }
      return NextResponse.json({ ok: true, aviso: correo.enviado ? 'sin_hoja' : 'sin_correo' });
    }
    console.error('[lead] LEAD PERDIDO: ni Firebase ni Apps Script configurados.', lead.email, lead.origen);
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      /* `sinCorreo` es la bandera que evita el correo por duplicado: con ella
         el Apps Script apunta la fila y no manda nada. Ver guardarLead() en
         google-apps-script/reservas.gs. */
      body: JSON.stringify({ action: 'lead', secret, lead, sinCorreo: correo.enviado }),
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
