/**
 * MANDAR EL CORREO DE BIENVENIDA A QUIEN IRIS ACABA DE DAR DE ALTA.
 *
 * Lo llama la plataforma (otro dominio) justo después de crear la cuenta. Vive
 * aquí y no allí porque aquí están las dos llaves que hacen falta y que no
 * pueden estar en un navegador: la de administrador de Firebase —para generar
 * el enlace de contraseña— y la de Resend —para mandar el correo con diseño—.
 *
 * QUIÉN PUEDE PEDIRLO: sólo una administradora. La plataforma manda el vale
 * de Firebase de quien está dentro; aquí se comprueba con la clave de
 * administrador y se mira su ficha. Sin eso, cualquiera podría usar esta
 * dirección para mandar correos con el nombre de Iris a quien quisiera.
 *
 * Si algo falla, contesta con el motivo y la plataforma manda el correo de
 * Firebase de serie, que es feo pero funciona: nadie se queda sin entrar.
 */
import { getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { Resend } from 'resend';
import { db } from '@/lib/firebase';
import { correoDeBienvenida } from '@/lib/bienvenida';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLATAFORMA = process.env.PLATAFORMA_URL || 'https://app.escueladesabiduria33.com';
const DE = process.env.RESEND_FROM || 'Escuela de Sabiduría 33 <hola@escueladesabiduria33.com>';
const CONTESTAR_A = process.env.RESEND_REPLY_TO || 'irissoaresoficial@gmail.com';

/** De qué sitios se acepta la llamada: la plataforma, sus vistas previas y local. */
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

function cabeceras(origen: string): Record<string, string> {
  return permitido(origen)
    ? {
        'Access-Control-Allow-Origin': origen,
        'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        Vary: 'Origin',
      }
    : {};
}

const responde = (cuerpo: object, estado: number, origen: string) =>
  new Response(JSON.stringify(cuerpo), { status: estado, headers: { 'Content-Type': 'application/json', ...cabeceras(origen) } });

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: cabeceras(request.headers.get('origin') || '') });
}

/** Quién lo pide: tiene que ser una administradora activa. Devuelve su uid. */
async function administradora(request: Request): Promise<string | null> {
  const base = db();
  if (!base) return null;
  const vale = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  let uid = '';
  try {
    uid = (await getAuth(getApp()).verifyIdToken(vale)).uid;
  } catch {
    return null;
  }
  const ficha = (await base.doc(`usuarios/${uid}`).get()).data();
  const roles: string[] = Array.isArray(ficha?.roles) ? ficha.roles : [];
  return ficha?.activo === true && (roles.length === 0 || roles.includes('admin')) ? uid : null;
}

/**
 * BORRAR A ALGUIEN DE VERDAD. Gerson: «quiero borrar a esta gente de aquí».
 *
 * Desde el navegador sólo se puede quitar la ficha; la cuenta de acceso se
 * queda en Firebase. Aquí, con la llave de administrador, se va todo: la
 * cuenta, la ficha, sus accesos a cursos y su avance. Sus mensajes de la
 * comunidad se quedan —son parte de conversaciones de otras—; si los pide
 * borrar, se borran a mano desde la comunidad.
 *
 * Nadie se borra a sí misma: dejaría la plataforma sin administradora.
 */
export async function DELETE(request: Request) {
  const origen = request.headers.get('origin') || '';
  if (!permitido(origen)) return responde({ ok: false, motivo: 'origen' }, 403, origen);
  const base = db();
  if (!base) return responde({ ok: false, motivo: 'sin_configurar' }, 503, origen);
  const yo = await administradora(request);
  if (!yo) return responde({ ok: false, motivo: 'permiso' }, 403, origen);

  let uid = '';
  try {
    uid = String((await request.json()).uid || '');
  } catch {
    return responde({ ok: false, motivo: 'datos' }, 400, origen);
  }
  if (!uid) return responde({ ok: false, motivo: 'datos' }, 400, origen);
  if (uid === yo) return responde({ ok: false, motivo: 'tu_misma' }, 400, origen);

  try {
    await getAuth(getApp())
      .deleteUser(uid)
      .catch((e: { code?: string }) => {
        if (e?.code !== 'auth/user-not-found') throw e;
      });
    const lote = base.batch();
    lote.delete(base.doc(`usuarios/${uid}`));
    for (const col of ['inscripciones', 'avance']) {
      const r = await base.collection(col).where('uid', '==', uid).get();
      r.docs.forEach((d) => lote.delete(d.ref));
    }
    lote.delete(base.doc(`visitas/${uid}`));
    await lote.commit();
    return responde({ ok: true }, 200, origen);
  } catch (e) {
    console.error('[alta] no se ha podido borrar', e);
    return responde({ ok: false, motivo: 'borrar' }, 502, origen);
  }
}

export async function POST(request: Request) {
  const origen = request.headers.get('origin') || '';
  if (!permitido(origen)) return responde({ ok: false, motivo: 'origen' }, 403, origen);

  const base = db();
  const clave = process.env.RESEND_API_KEY || '';
  if (!base || !clave) return responde({ ok: false, motivo: 'sin_configurar' }, 503, origen);

  /* 1. Quién lo pide: tiene que ser una administradora activa. */
  if (!(await administradora(request))) return responde({ ok: false, motivo: 'permiso' }, 403, origen);

  /* 2. A quién. */
  let d: { email?: string; nombre?: string; roles?: string[] };
  try {
    d = await request.json();
  } catch {
    return responde({ ok: false, motivo: 'datos' }, 400, origen);
  }
  const email = String(d.email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return responde({ ok: false, motivo: 'correo' }, 400, origen);

  /* 3. El enlace y el correo. */
  try {
    const enlace = await getAuth(getApp()).generatePasswordResetLink(email, { url: PLATAFORMA });
    const { asunto, html } = correoDeBienvenida({
      nombre: String(d.nombre || ''),
      enlace,
      roles: Array.isArray(d.roles) ? d.roles.map(String) : [],
      plataforma: PLATAFORMA,
    });
    const r = await new Resend(clave).emails.send({ from: DE, to: email, replyTo: CONTESTAR_A, subject: asunto, html });
    if (r.error) throw new Error(r.error.message);
    return responde({ ok: true }, 200, origen);
  } catch (e) {
    console.error('[alta] no se ha podido mandar la bienvenida', e);
    return responde({ ok: false, motivo: 'envio' }, 502, origen);
  }
}
