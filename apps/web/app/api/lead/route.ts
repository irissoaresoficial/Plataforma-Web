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
 *   2. Se avisa al Apps Script, que manda el correo y toca el calendario.
 *
 * Si falla el aviso pero el dato está guardado, la persona ve que se ha
 * apuntado —porque se ha apuntado— y Iris la tiene en su lista aunque el correo
 * automático no haya salido. Si falla lo de guardar Y lo de avisar, entonces sí
 * se devuelve error, porque entonces sí se ha perdido.
 */
import { NextResponse } from 'next/server';
import { parseLead } from '@/lib/booking';
import { guardaLead } from '@/lib/leads-firebase';

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
    ip: ip.slice(0, 45),
    agente: (request.headers.get('user-agent') || '').slice(0, 200),
  });

  /* ---------------------------------------------------------------- 2 */
  if (!url) {
    /* Sin Apps Script no hay correo de bienvenida ni aviso a Iris. Pero si el
       dato está en Firebase, la persona SÍ se ha apuntado y decirle que no
       sería mentira: se le contesta que sí y se apunta en el registro que el
       correo automático no ha salido. */
    if (enBase.guardado) {
      console.warn('[lead] Guardado en Firebase, pero sin APPS_SCRIPT_URL: no sale correo.', lead.email, lead.origen);
      return NextResponse.json({ ok: true, aviso: 'sin_correo' });
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
