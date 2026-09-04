import { NextResponse } from 'next/server';
import { parseAvailability, type Availability } from '@/lib/booking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// La agenda cambia poco en un minuto y así no se llama al Apps Script en cada apertura del chat.
let cache: { at: number; days: Availability } | null = null;
const TTL_MS = 60_000;

export async function GET() {
  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;

  if (!url) return NextResponse.json({ ok: false, reason: 'not_configured' });

  if (cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json({ ok: true, days: cache.days, cached: true });
  }

  try {
    const target = `${url}?action=availability${secret ? `&secret=${encodeURIComponent(secret)}` : ''}`;
    const res = await fetch(target, { redirect: 'follow', signal: AbortSignal.timeout(10_000) });
    const data = await res.json();
    const days = parseAvailability(data);
    if (!res.ok || !days) {
      console.error('[availability] Respuesta inesperada del Apps Script:', res.status);
      return NextResponse.json({ ok: false, reason: 'upstream' });
    }
    cache = { at: Date.now(), days };
    return NextResponse.json({ ok: true, days });
  } catch (err) {
    console.error('[availability] Error llamando al Apps Script:', err);
    return NextResponse.json({ ok: false, reason: 'upstream' });
  }
}
