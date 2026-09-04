import { NextResponse } from 'next/server';
import { parseLead } from '@/lib/booking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

  if (!url) {
    console.warn('[lead] APPS_SCRIPT_URL sin configurar. Lead perdido:', lead.email, lead.origen);
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'lead', secret, lead }),
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
    });
    const text = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {}

    if (!res.ok || !data?.ok) {
      console.error('[lead] Apps Script respondió mal:', res.status, text.slice(0, 300));
      return NextResponse.json({ ok: false, reason: 'upstream' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[lead] Error llamando al Apps Script:', err);
    return NextResponse.json({ ok: false, reason: 'upstream' }, { status: 502 });
  }
}
