import { NextResponse } from 'next/server';
import { parseBooking } from '@/lib/booking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

  if (!url) {
    // Sin script desplegado no se guarda ni se avisa a nadie: mejor decirlo que fingir que sí.
    console.warn('[booking] APPS_SCRIPT_URL sin configurar. Reserva no entregada:', booking.email);
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'book', secret, booking }),
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
    });

    const text = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {}

    if (!res.ok || !data?.ok) {
      console.error('[booking] Apps Script respondió mal:', res.status, text.slice(0, 300));
      // El motivo del script se pasa tal cual: sin él, "taken" y "contraseña
      // equivocada" acaban en el mismo mensaje y no hay forma de arreglar nada.
      const reason = typeof data?.reason === 'string' ? data.reason : 'upstream';
      return NextResponse.json({ ok: false, reason }, { status: reason === 'taken' ? 409 : 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[booking] Error llamando al Apps Script:', err);
    return NextResponse.json({ ok: false, reason: 'upstream' }, { status: 502 });
  }
}
