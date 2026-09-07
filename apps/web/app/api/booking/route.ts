import { NextResponse } from 'next/server';
import { parseBooking } from '@/lib/booking';
import { guardaCita, guardaLead, guardaReserva } from '@/lib/leads-firebase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * CUÁNTO SE LE DEJA TARDAR A GOOGLE.
 *
 * Vercel corta las funciones a los diez segundos si nadie dice otra cosa, y el
 * Apps Script tiene que crear un evento en el calendario y mandar DOS correos
 * antes de contestar. Eso pasa de diez segundos con facilidad.
 *
 * Y cuando pasaba, ocurría lo peor: el corte era en el lado de la web, así que
 * Google seguía trabajando y terminaba el encargo —la cita quedaba puesta y la
 * invitación llegaba al buzón— mientras al que estaba reservando se le decía
 * «se me ha caído la conexión». Con el correo delante, en la bandeja. Eso no es
 * un error técnico: es la web llamándose mentirosa a sí misma.
 */
export const maxDuration = 60;

// Límite simple por IP para que nadie llene la agenda de Iris desde una pestaña.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;

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
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, reason: 'rate_limited' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_json' }, { status: 400 });
  }

  const { booking, error } = parseBooking(body);
  if (!booking) {
    return NextResponse.json({ ok: false, reason: `invalid_${error}` }, { status: 400 });
  }

  /*
   * PRIMERO SE GUARDA. DESPUÉS SE AVISA.
   *
   * Este endpoint no guardaba nada: se limitaba a reenviarle la reserva a
   * Google. Si Google tardaba o fallaba, esa persona desaparecía — no estaba en
   * la hoja, no estaba en Firebase, no estaba en el panel de Iris. Sólo quedaba
   * una línea en un registro que nadie mira.
   *
   * Y va en DOS SITIOS a propósito, que no es duplicar por duplicar:
   *
   *   · `reservas` guarda la cita: día, hora y lo que contó del motivo. Tiene
   *     campos que una lista de espera no tiene, y al revés.
   *   · `leads` guarda a la PERSONA. Quien reserva ha dejado su correo igual
   *     que quien pide la sinergia, y en la lista de Iris tiene que salir como
   *     todos los demás. Si no, la única gente que de verdad ha pedido una cita
   *     sería justo la que no aparece en la bandeja.
   *   · `citas` guarda LA HORA en la agenda. Sin esto, la agenda de Iris decía
   *     «esa semana la tienes libre entera» con una sesión ya vendida dentro.
   *     Nace como `pedida`: la web no confirma nada por su cuenta.
   */
  const [enReservas, enLeads] = await Promise.all([
    guardaReserva({ ...booking, ip: ip.slice(0, 45) }),
    guardaLead(
      {
        email: booking.email,
        nombre: booking.nombre,
        origen: 'reserva',
        detalle: `${booking.dia} a las ${booking.hora}. Nacida el ${booking.fecha}. ${booking.motivo}`.slice(0, 500),
        whatsapp: '',
        lang: booking.lang || 'es',
      },
      { diaISO: booking.diaISO, hora: booking.hora },
    ),
    guardaCita(booking, `reserva__${booking.email}`.replace(/[/\\.#$[\]]/g, '_')),
  ]);
  const guardado = enReservas.guardado || enLeads.guardado;

  if (!url) {
    // Sin script no hay ni calendario ni invitación. Pero si está en Firebase,
    // Iris la ve y la cierra a mano: eso no es un fracaso, es medio camino.
    console.warn('[booking] APPS_SCRIPT_URL sin configurar. Reserva de:', booking.email);
    return guardado
      ? NextResponse.json({ ok: true, aviso: 'sin_confirmar' })
      : NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'book', secret, booking }),
      redirect: 'follow',
      /* 45 s, no 15. Ver el comentario de `maxDuration` arriba: a quince
         segundos se cortaba a Google a media faena y la web anunciaba una
         avería que no existía. */
      signal: AbortSignal.timeout(45_000),
    });

    const text = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {}

    if (!res.ok || !data?.ok) {
      console.error('[booking] Apps Script respondió mal:', res.status, text.slice(0, 300));
      const reason = typeof data?.reason === 'string' ? data.reason : 'upstream';

      /*
       * «TAKEN» ES DISTINTO Y NO SE PUEDE SUAVIZAR.
       *
       * Si el hueco se ha ocupado mientras esta persona escribía, no hay cita —
       * ni ahora ni después—, y hay que devolverla al calendario a elegir otro.
       * Decirle «lo tengo apuntado» sería mandarla a una hora que ya es de
       * otra persona. Todo lo demás sí se puede suavizar, porque está guardado.
       */
      if (reason === 'taken') {
        return NextResponse.json({ ok: false, reason }, { status: 409 });
      }
      if (guardado) {
        return NextResponse.json({ ok: true, aviso: 'sin_confirmar' });
      }
      return NextResponse.json({ ok: false, reason }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[booking] Error llamando al Apps Script:', err);
    if (guardado) return NextResponse.json({ ok: true, aviso: 'sin_confirmar' });
    return NextResponse.json({ ok: false, reason: 'upstream' }, { status: 502 });
  }
}
