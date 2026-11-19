/**
 * SUBIR LA LISTA DE MARCO SIN PASAR POR EL NAVEGADOR (19 de noviembre de 2026).
 *
 * Gerson: «móntalos tú, créalos en la base de datos, hazlo tú, a mí no me
 * líes». La lista se puede subir a mano en la plataforma (Correos → «Subir la
 * lista»); esto hace lo mismo desde fuera, para que la sesión que lleva el
 * proyecto la cargue sin que nadie tenga que buscar un archivo.
 *
 * Hace exactamente lo que hace el botón de la plataforma, y nada más:
 *   · escribe cada correo en `difusion` con `merge` (subirla dos veces no
 *     borra lo enviado ni las bajas);
 *   · si se pide, enciende el interruptor (`difusion-config/marco.activa`);
 *   · si se pide, manda YA una tanda del envío que toca hoy, con el mismo
 *     correo, el mismo enlace de baja y marcándolo como enviado, para no
 *     esperar a las 8:00 de mañana. Nunca más de lo que cabe en el día.
 *
 * LA LLAVE: la cabecera `x-difusion-key` tiene que traer el mismo secreto que
 * usa el reloj diario (`CRON_SECRET`). Sin él no hace nada. Va en una cabecera
 * propia y no en `Authorization` a propósito: así quien tenga esta llave no
 * puede disparar el reloj de los recordatorios por error.
 */
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db, FieldValue } from '@/lib/firebase';
import { CONFIG, COLECCION, LISTA, TOPE_POR_DEFECTO, conCambios, correoDifusion, envioDeHoy, idContacto, type Textos } from '@/lib/difusion';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CORREO = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const CONTESTAR_A = process.env.RESEND_REPLY_TO || 'irissoaresoficial@gmail.com';
const DE_MARCO = `Marco Célio Sousa <${(process.env.RESEND_FROM || 'hola@escueladesabiduria33.com').replace(/^.*<|>.*$/g, '')}>`;

export async function POST(peticion: Request) {
  /* Vale el secreto del reloj (CRON_SECRET) o uno propio (DIFUSION_KEY), por
     si el de Vercel está marcado como «sensible» y no se puede copiar. */
  const llave = peticion.headers.get('x-difusion-key') || '';
  const secretos = [process.env.CRON_SECRET, process.env.DIFUSION_KEY].filter((x): x is string => !!x);
  if (!llave || !secretos.includes(llave)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const base = db();
  if (!base) return NextResponse.json({ ok: false, motivo: 'falta Firebase' }, { status: 500 });

  let cuerpo: { emails?: unknown; activar?: unknown; enviarYa?: unknown };
  try {
    cuerpo = await peticion.json();
  } catch {
    return NextResponse.json({ ok: false, motivo: 'json' }, { status: 400 });
  }

  /* 1 · La lista. Sólo lo que tiene forma de correo, en minúsculas y sin repetir. */
  const correos = Array.isArray(cuerpo.emails)
    ? [...new Set(cuerpo.emails.map((x) => String(x).trim().toLowerCase()).filter((x) => CORREO.test(x)))]
    : [];
  for (let i = 0; i < correos.length; i += 400) {
    const lote = base.batch();
    for (const email of correos.slice(i, i + 400)) {
      lote.set(base.collection(COLECCION).doc(idContacto(email)), { email, lista: LISTA, subido: FieldValue.serverTimestamp() }, { merge: true });
    }
    await lote.commit();
  }

  /* 2 · El interruptor. */
  const confRef = base.collection(CONFIG).doc(LISTA);
  if (cuerpo.activar === true) await confRef.set({ activa: true, cambiado: FieldValue.serverTimestamp() }, { merge: true });

  /* 3 · Una tanda ya, si se pide. */
  let enviados = 0;
  let fallados = 0;
  let envio: string | null = null;
  const cuantos = Math.min(Number(cuerpo.enviarYa) || 0, TOPE_POR_DEFECTO);
  if (cuantos > 0) {
    const conf = (await confRef.get()).data() as { activa?: boolean; textos?: Record<string, Partial<Textos>> } | undefined;
    const e = conf?.activa ? envioDeHoy(conCambios(conf.textos)) : null;
    const clave = process.env.RESEND_API_KEY;
    if (e && clave) {
      envio = e.id;
      const resend = new Resend(clave);
      const lista = await base.collection(COLECCION).where('lista', '==', LISTA).get();
      const toca = lista.docs.filter((d) => {
        const v = d.data() as { email?: string; baja?: boolean; enviados?: Record<string, unknown> };
        return v.email && !v.baja && !v.enviados?.[e.id];
      });
      const hoy = toca.slice(0, cuantos);
      for (let i = 0; i < hoy.length; i += 50) {
        const tanda = hoy.slice(i, i + 50);
        try {
          const r = await resend.batch.send(
            tanda.map((d) => {
              const email = String(d.get('email'));
              const { asunto, html } = correoDifusion(e, email);
              return { from: DE_MARCO, to: email, replyTo: CONTESTAR_A, subject: asunto, html };
            }),
          );
          if (r.error) throw new Error(String(r.error.message || r.error));
          const lote = base.batch();
          for (const d of tanda) lote.set(d.ref, { enviados: { [e.id]: FieldValue.serverTimestamp() } }, { merge: true });
          await lote.commit();
          enviados += tanda.length;
        } catch (err) {
          fallados += tanda.length;
          console.error('[difusion/importar] fallo al enviar una tanda', String(err).slice(0, 200));
        }
      }
    }
  }

  const total = (await base.collection(COLECCION).where('lista', '==', LISTA).count().get()).data().count;
  const activa = !!(await confRef.get()).data()?.activa;
  return NextResponse.json({ ok: fallados === 0, subidos: correos.length, enLaLista: total, activa, envio, enviados, fallados });
}
