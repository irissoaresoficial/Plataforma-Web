/**
 * ============================================================================
 * MANDAR EL ENLACE DEL GRUPO A QUIEN YA SE APUNTÓ · DE UN SOLO USO
 * ============================================================================
 *
 * Gerson, el 25 de octubre: «no los quiero enviar yo, envíalos tú».
 *
 * El enlace del grupo cambió ese día, y las personas que ya se habían apuntado
 * tenían el viejo en su correo de confirmación. Esto les manda el nuevo.
 *
 * ESTA RUTA SE BORRA EN CUANTO SE USE. No es una pieza de la web: es una
 * herramienta para un día concreto. Una web pública con un botón permanente
 * que manda correos a su propia lista es una puerta abierta, y no hay ninguna
 * razón para dejarla puesta.
 *
 * TRES CANDADOS, porque mientras exista está en internet:
 *
 *   1. Una clave en la dirección. Sin ella no hace nada.
 *   2. UNA FECHA TOPE. Sólo escribe a quien se apuntó ANTES de esa fecha, que
 *      va escrita aquí. Aunque alguien encontrara la clave, no puede usar esto
 *      para escribirle a la gente que se apunte mañana: la lista no crece.
 *   3. Un único texto, el del grupo. No se le puede pedir que mande otra cosa.
 *
 * Y NO HAY NI UN CORREO ESCRITO EN ESTE ARCHIVO. Los destinatarios salen de
 * Firestore en el momento del envío. Los datos personales no se guardan en el
 * repositorio, ni siquiera los de cuatro personas.
 */
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/lib/firebase';
import { correoGrupoWhatsapp } from '@/lib/correo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CLAVE = 'Bk0KGw_zwJZ4ABVuaaAmZfMd';

/* Sólo a quien se apuntó antes de esto. La lista no puede crecer. */
const TOPE = new Date('2026-10-25T12:00:00.000Z');

const DE = process.env.RESEND_FROM || 'Escuela de Sabiduría 33 <hola@escueladesabiduria33.com>';
const CONTESTAR_A = process.env.RESEND_REPLY_TO || 'irissoaresoficial@gmail.com';

export async function GET(peticion: Request) {
  const p = new URL(peticion.url).searchParams;
  if (p.get('clave') !== CLAVE) {
    return NextResponse.json({ ok: false, error: 'clave incorrecta' }, { status: 403 });
  }

  const clave = process.env.RESEND_API_KEY;
  const base = db();
  if (!clave) return NextResponse.json({ ok: false, error: 'falta RESEND_API_KEY' }, { status: 500 });
  if (!base) return NextResponse.json({ ok: false, error: 'falta Firebase' }, { status: 500 });

  /* La lista: quien se apuntó a la masterclass antes del tope. */
  const r = await base.collection('leads').where('origen', '==', 'curso').get();
  const gente: { email: string; nombre: string }[] = [];
  for (const d of r.docs) {
    const v = d.data() as { email?: string; nombre?: string; alta?: { toDate?: () => Date } | string };
    const t = typeof v.alta === 'string' ? new Date(v.alta) : v.alta?.toDate?.();
    if (!v.email || !t || t > TOPE) continue;
    gente.push({ email: v.email, nombre: v.nombre || '' });
  }

  /* Y a quien lo pida por la dirección, para poder verlo uno mismo. */
  const extra = (p.get('extra') || '').trim().toLowerCase();
  if (extra && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(extra) && !gente.some((x) => x.email.toLowerCase() === extra)) {
    gente.push({ email: extra, nombre: p.get('nombreExtra') || '' });
  }

  /* De uno en uno, no en copia oculta: cada correo lleva el nombre de quien lo
     recibe, y así nadie ve la dirección de nadie — ni siquiera oculta. */
  const resend = new Resend(clave);
  const hechos: { para: string; ok: boolean; detalle: string }[] = [];
  for (const persona of gente) {
    const { asunto, html } = correoGrupoWhatsapp(persona.nombre);
    try {
      const envio = await resend.emails.send({ from: DE, to: persona.email, replyTo: CONTESTAR_A, subject: asunto, html });
      hechos.push({
        para: persona.email.replace(/^(.{2}).*(@.*)$/, '$1***$2'),
        ok: !envio.error,
        detalle: envio.error ? String(envio.error.message || envio.error) : `enviado (${envio.data?.id || 'sin id'})`,
      });
    } catch (err) {
      hechos.push({ para: persona.email.replace(/^(.{2}).*(@.*)$/, '$1***$2'), ok: false, detalle: String(err).slice(0, 140) });
    }
  }

  const bien = hechos.filter((x) => x.ok).length;
  return NextResponse.json({
    ok: bien === hechos.length && hechos.length > 0,
    resumen: `${bien} de ${hechos.length} enviados`,
    envios: hechos,
    aviso: 'Esta ruta se borra ahora. Si hace falta otra vez, se vuelve a montar.',
  });
}
