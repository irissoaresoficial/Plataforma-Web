/**
 * ============================================================================
 * EL RELOJ QUE MANDA LOS RECORDATORIOS
 * ============================================================================
 *
 * Lo llama Vercel una vez al día (ver `vercel.json`). Mira cuántos días
 * faltan para la masterclass, y si toca recordatorio lo manda a quien no lo
 * haya recibido ya.
 *
 * ---------------------------------------------------------------------------
 * LAS CUATRO COSAS QUE NO PUEDEN FALLAR, Y CÓMO SE EVITAN
 * ---------------------------------------------------------------------------
 *
 * 1 · MANDAR DOS VECES LO MISMO. Es lo peor que puede hacer un recordatorio:
 *     el mismo correo repetido convierte a una interesada en alguien que se
 *     da de baja. Cada envío queda apuntado en la ficha de la persona
 *     (`recordatorios.manana = true`) ANTES de que pueda repetirse, y quien
 *     ya lo tiene se salta. Si Vercel llama dos veces el mismo día, o si
 *     alguien abre esta dirección a mano, no sale nada nuevo.
 *
 * 2 · ESCRIBIRLE A QUIEN SE DIO DE BAJA. Se salta a quien tenga `baja: true`,
 *     que es lo que marca `/baja`. Si esto fallara, no sería un correo de
 *     más: sería el artículo 21 del RGPD incumplido.
 *
 * 3 · QUE LO LLAME CUALQUIERA. Hace falta la cabecera que pone Vercel con
 *     `CRON_SECRET`. Sin ella no manda nada. No es paranoia: esta dirección
 *     es pública y manda correos a personas reales.
 *
 * 4 · QUE SE CAIGA A MEDIAS Y NADIE SE ENTERE. Cada persona va en su propio
 *     intento: si falla el correo de una, las demás salen igual, y lo que no
 *     salió no se marca como enviado, así que mañana se reintenta solo.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ UNA VEZ AL DÍA Y NO CADA HORA
 * ---------------------------------------------------------------------------
 * El plan de Vercel que tiene Iris permite un aviso diario. Con eso llegan
 * bien los tres recordatorios que importan: a una semana, el día de antes y
 * la mañana del día. El de «empezamos en una hora» necesitaría llamadas cada
 * hora; ése lo manda Iris por el grupo de WhatsApp, que además es donde la
 * gente lo va a mirar ese rato.
 */
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db, FieldValue } from '@/lib/firebase';
import { correoRecordatorio, type Recordatorio } from '@/lib/correo';
import { MASTERCLASS } from '@/content/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/* Hasta un minuto: con pocas decenas de personas sobra, y evita que un envío
   lento deje la tanda a medias. */
export const maxDuration = 60;

const DE = process.env.RESEND_FROM || 'Escuela de Sabiduría 33 <hola@escueladesabiduria33.com>';
const CONTESTAR_A = process.env.RESEND_REPLY_TO || 'irissoaresoficial@gmail.com';

/** Cuántos días faltan, contando días de calendario y no horas sueltas. */
function diasQueFaltan(): number {
  const dia = (d: Date) => d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
  const hoy = new Date(`${dia(new Date())}T00:00:00Z`).getTime();
  const clase = new Date(`${dia(new Date(MASTERCLASS.iso))}T00:00:00Z`).getTime();
  return Math.round((clase - hoy) / 86400000);
}

/** Qué recordatorio toca hoy, si es que toca alguno. */
function tocaHoy(dias: number): Recordatorio | null {
  if (dias === 7) return 'semana';
  if (dias === 1) return 'manana';
  if (dias === 0) return 'hoy';
  return null;
}

export async function GET(peticion: Request) {
  /* Vercel manda `Authorization: Bearer <CRON_SECRET>`. Sin secreto puesto,
     esto no manda nada: es preferible no recordar a nadie que abrir una
     dirección pública que escribe a la lista entera. */
  const secreto = process.env.CRON_SECRET;
  if (!secreto) {
    return NextResponse.json({ ok: false, motivo: 'falta CRON_SECRET en Vercel' }, { status: 500 });
  }
  if (peticion.headers.get('authorization') !== `Bearer ${secreto}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const dias = diasQueFaltan();
  const tipo = tocaHoy(dias);
  if (!tipo) {
    return NextResponse.json({ ok: true, dias, enviados: 0, nota: 'hoy no toca recordatorio' });
  }

  const clave = process.env.RESEND_API_KEY;
  const base = db();
  if (!clave) return NextResponse.json({ ok: false, motivo: 'falta RESEND_API_KEY' }, { status: 500 });
  if (!base) return NextResponse.json({ ok: false, motivo: 'falta Firebase' }, { status: 500 });

  const r = await base.collection('leads').where('origen', '==', 'curso').get();
  const resend = new Resend(clave);

  let enviados = 0;
  let saltados = 0;
  let fallados = 0;

  for (const doc of r.docs) {
    const v = doc.data() as {
      email?: string;
      nombre?: string;
      baja?: boolean;
      recordatorios?: Record<string, boolean>;
    };
    if (!v.email || v.baja || v.recordatorios?.[tipo]) {
      saltados += 1;
      continue;
    }

    const { asunto, html } = correoRecordatorio(tipo, v.nombre || '', v.email);
    try {
      const envio = await resend.emails.send({
        from: DE,
        to: v.email,
        replyTo: CONTESTAR_A,
        subject: asunto,
        html,
      });
      if (envio.error) throw new Error(String(envio.error.message || envio.error));
      /* Se marca DESPUÉS de que Resend lo acepte y nunca antes: marcar primero
         dejaría a alguien sin recordatorio y creyendo que lo tiene. */
      await doc.ref.set(
        { recordatorios: { [tipo]: true }, ultimoRecordatorio: FieldValue.serverTimestamp() },
        { merge: true },
      );
      enviados += 1;
    } catch (err) {
      fallados += 1;
      /* Sin marcar: mañana se reintenta solo si todavía toca. El correo no se
         escribe en el registro, sólo que hubo un fallo y cuál. */
      console.error('[recordatorios] fallo al enviar', tipo, String(err).slice(0, 200));
    }
  }

  return NextResponse.json({ ok: fallados === 0, dias, tipo, enviados, saltados, fallados });
}
