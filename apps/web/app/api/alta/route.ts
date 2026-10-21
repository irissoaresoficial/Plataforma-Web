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
 * Si algo falla, contesta con el motivo —y con `detalle`, en castellano— y
 * la plataforma lo enseña antes de mandar el de Firebase de serie, que es feo
 * pero funciona: nadie se queda sin entrar.
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

/**
 * POR QUÉ NO SALE EL CORREO BONITO, DICHO CON PALABRAS.
 *
 * Gerson, el 21 de octubre de 2026: «el mensaje que llega de creación de
 * cuenta sigue llegando feo». Llegaba el de Firebase de serie porque esto
 * fallaba y la plataforma, sin saber por qué, mandaba el de recambio en
 * silencio. Ahora cada fallo vuelve con `detalle`: qué falta y dónde se pone.
 * Nada de lo que va en `detalle` es secreto: son nombres de variables y el
 * mensaje de error de Resend o de Firebase.
 *
 * Y CON `prueba: true` el correo se le manda a quien lo pide —a Iris—, sin
 * crear a nadie: para ver cómo llega antes de dar de alta a una persona.
 */
export async function POST(request: Request) {
  const origen = request.headers.get('origin') || '';
  if (!permitido(origen)) return responde({ ok: false, motivo: 'origen', detalle: `La web no acepta llamadas desde ${origen || 'este sitio'}.` }, 403, origen);

  const base = db();
  const clave = process.env.RESEND_API_KEY || '';
  if (!base || !clave) {
    const falta = [!base && 'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY', !clave && 'RESEND_API_KEY'].filter(Boolean).join(' y ');
    return responde({ ok: false, motivo: 'sin_configurar', detalle: `En Vercel, en el proyecto de la web, falta ${falta}.` }, 503, origen);
  }

  /* 1. Quién lo pide: tiene que ser una administradora activa. */
  const yo = await administradora(request);
  if (!yo) {
    return responde(
      {
        ok: false,
        motivo: 'permiso',
        detalle:
          'La web no te reconoce como administradora. O la web y la plataforma usan proyectos de Firebase distintos (FIREBASE_PROJECT_ID tiene que ser plataforma-d3c55), o tu ficha no tiene la llave de administradora.',
      },
      403,
      origen
    );
  }

  /* 2. A quién. */
  let d: { email?: string; nombre?: string; roles?: string[]; prueba?: boolean };
  try {
    d = await request.json();
  } catch {
    return responde({ ok: false, motivo: 'datos' }, 400, origen);
  }
  let email = String(d.email || '').trim().toLowerCase();
  let nombre = String(d.nombre || '');
  let roles = Array.isArray(d.roles) ? d.roles.map(String) : [];
  if (d.prueba) {
    const cuenta = await getAuth(getApp()).getUser(yo);
    email = (cuenta.email || '').toLowerCase();
    nombre = cuenta.displayName || String((await base.doc(`usuarios/${yo}`).get()).data()?.nombre || '');
    roles = ['creador'];
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return responde({ ok: false, motivo: 'correo', detalle: 'Ese correo no está bien escrito.' }, 400, origen);

  /* 3. El enlace. */
  let enlace = '';
  try {
    enlace = await getAuth(getApp()).generatePasswordResetLink(email, { url: PLATAFORMA });
  } catch (e) {
    const c = (e as { code?: string; message?: string }) || {};
    console.error('[alta] no se ha podido hacer el enlace', e);
    return responde(
      {
        ok: false,
        motivo: 'enlace',
        detalle: /continue-uri|unauthorized/i.test(`${c.code} ${c.message}`)
          ? `Firebase no deja volver a ${PLATAFORMA}: añádelo en Authentication → Configuración → Dominios autorizados.`
          : `Firebase no ha hecho el enlace de contraseña: ${c.code || c.message || 'sin motivo'}.`,
      },
      502,
      origen
    );
  }

  /* 4. El correo. */
  try {
    const { asunto, html } = correoDeBienvenida({ nombre, enlace, roles, plataforma: PLATAFORMA });
    const r = await new Resend(clave).emails.send({ from: DE, to: email, replyTo: CONTESTAR_A, subject: asunto, html });
    if (r.error) throw new Error(r.error.message);
    return responde({ ok: true, a: email }, 200, origen);
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    console.error('[alta] no se ha podido mandar la bienvenida', e);
    return responde(
      {
        ok: false,
        motivo: 'envio',
        detalle: /domain|verif/i.test(m)
          ? `Resend no deja mandar desde ${DE}: el dominio no está verificado en Resend → Domains. Detalle: ${m}`
          : `Resend no lo ha mandado: ${m}`,
      },
      502,
      origen
    );
  }
}
