/**
 * DEJA LA DIRECCIÓN SECRETA DEL CALENDARIO DONDE SÓLO LA LEE LA ADMINISTRACIÓN.
 *
 * El botón «Conectar con mi calendario» de la Agenda llama aquí y después lee
 * `difusion-config/calendario`, que las reglas de Firestore cierran a la
 * administración. Esta ruta no devuelve la dirección: sólo la escribe (es un
 * valor que calcula ella misma, así que pedirla no le da nada a nadie).
 *
 * POR QUÉ ASÍ Y NO COMPROBANDO EL TOKEN DE QUIEN PIDE: `firebase-admin/auth`
 * revienta en Vercel con un 500 sin mensaje (le pasa también a /api/alta);
 * en local funciona, así que es el empaquetado. Este camino no lo necesita.
 * Ver lib/calendario.ts.
 */
import { db, FieldValue } from '@/lib/firebase';
import { llaveCalendario } from '@/lib/calendario';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WEB = 'https://www.escueladesabiduria33.com';
const cabeceras = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Cache-Control': 'no-store' };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: cabeceras });
}

export async function GET() {
  const base = db();
  const llave = llaveCalendario();
  if (!base || !llave) return Response.json({ ok: false, motivo: 'sin_configurar' }, { status: 503, headers: cabeceras });
  const https = `${WEB}/api/calendario/iris.ics?k=${llave}`;
  const webcal = https.replace(/^https:/, 'webcal:');
  await base.doc('difusion-config/calendario').set(
    { https, webcal, google: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`, escrito: FieldValue.serverTimestamp() },
    { merge: true },
  );
  return Response.json({ ok: true }, { headers: cabeceras });
}
