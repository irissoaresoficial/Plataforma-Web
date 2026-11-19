/**
 * La dirección secreta del calendario, sólo para una administradora (la pide
 * el botón «Conectar con mi calendario» de la Agenda de la plataforma, con su
 * token de Firebase). Ver lib/calendario.ts.
 */
import { getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/lib/firebase';
import { llaveCalendario } from '@/lib/calendario';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLATAFORMA = process.env.PLATAFORMA_URL || 'https://app.escueladesabiduria33.com';
const WEB = 'https://www.escueladesabiduria33.com';

function permitido(origen: string): boolean {
  try {
    const h = new URL(origen).hostname;
    return (
      h === 'localhost' ||
      h.endsWith('escueladesabiduria33.com') ||
      h.endsWith('sabiduria33.com') ||
      (h.endsWith('.vercel.app') && h.includes('plataforma')) ||
      h === new URL(PLATAFORMA).hostname
    );
  } catch {
    return false;
  }
}
const cabeceras = (o: string): Record<string, string> =>
  permitido(o)
    ? { 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Authorization', Vary: 'Origin' }
    : {};
const responde = (c: object, s: number, o: string) =>
  new Response(JSON.stringify(c), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cabeceras(o) } });

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: cabeceras(request.headers.get('origin') || '') });
}

export async function GET(request: Request) {
  const origen = request.headers.get('origin') || '';
  const base = db();
  const llave = llaveCalendario();
  if (!base || !llave) return responde({ ok: false, motivo: 'sin_configurar' }, 503, origen);
  const vale = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  let uid = '';
  try {
    uid = (await getAuth(getApp()).verifyIdToken(vale)).uid;
  } catch {
    return responde({ ok: false, motivo: 'permiso' }, 403, origen);
  }
  const ficha = (await base.doc(`usuarios/${uid}`).get()).data();
  const roles: string[] = Array.isArray(ficha?.roles) ? ficha.roles : [];
  if (!(ficha?.activo === true && (roles.length === 0 || roles.includes('admin')))) return responde({ ok: false, motivo: 'permiso' }, 403, origen);

  const https = `${WEB}/api/calendario/iris.ics?k=${llave}`;
  const webcal = https.replace(/^https:/, 'webcal:');
  return responde(
    { ok: true, https, webcal, google: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}` },
    200,
    origen,
  );
}
