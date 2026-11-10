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
import { sincronizaCampana } from '@/lib/campana-sync';
import { CONFIG, COLECCION, LISTA, TOPE_POR_DEFECTO, correoDifusion, envioDeHoy, conCambios, type Textos } from '@/lib/difusion';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/* Hasta un minuto: con pocas decenas de personas sobra, y evita que un envío
   lento deje la tanda a medias. */
export const maxDuration = 60;

/* Los de la lista de Marco salen del mismo buzón, con su nombre delante. */
const DE_MARCO = `Marco Célio Sousa <${(process.env.RESEND_FROM || 'hola@escueladesabiduria33.com').replace(/^.*<|>.*$/g, '')}>`;
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

  /* Primero, las métricas de la plataforma: Meta → `campana`. No depende de
     nada de lo de abajo y, si falla, los correos salen igual. */
  const metricas = await sincronizaCampana();

  const clave = process.env.RESEND_API_KEY;
  const base = db();
  if (!clave) return NextResponse.json({ ok: false, motivo: 'falta RESEND_API_KEY' }, { status: 500 });
  if (!base) return NextResponse.json({ ok: false, motivo: 'falta Firebase' }, { status: 500 });
  const resend = new Resend(clave);

  /* Las inscritas, de una vez: se usan para los recordatorios y para no
     mandarle a una inscrita el «aún puedes apuntarte» de la lista de Marco. */
  const r = await base.collection('leads').where('origen', '==', 'curso').get();

  let enviados = 0;
  let saltados = 0;
  let fallados = 0;

  for (const doc of tipo ? r.docs : []) {
    const v = doc.data() as {
      email?: string;
      nombre?: string;
      baja?: boolean;
      recordatorios?: Record<string, boolean>;
    };
    if (!v.email || v.baja || v.recordatorios?.[tipo!]) {
      saltados += 1;
      continue;
    }

    const { asunto, html } = correoRecordatorio(tipo!, v.nombre || '', v.email);
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
        { recordatorios: { [tipo!]: true }, ultimoRecordatorio: FieldValue.serverTimestamp() },
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

  const inscritas = new Set(
    r.docs.map((d) => String((d.data() as { email?: string }).email || '').trim().toLowerCase()).filter(Boolean),
  );
  const difusion = await enviaDifusion(base, resend, inscritas, enviados);

  return NextResponse.json({
    ok: fallados === 0 && difusion.fallados === 0,
    dias,
    tipo,
    enviados,
    saltados,
    fallados,
    difusion,
    metricas,
  });
}

/**
 * LA LISTA DE MARCO (ver `lib/difusion.ts`).
 *
 * Tres cosas la frenan, por este orden: el interruptor apagado, que hoy no
 * toque ningún envío, y el tope diario. El tope cuenta también los
 * recordatorios que acaban de salir, porque el límite de Resend es de la
 * cuenta entera y no de cada lista. Quien no entra hoy, entra mañana.
 */
async function enviaDifusion(
  base: NonNullable<ReturnType<typeof db>>,
  resend: Resend,
  inscritas: Set<string>,
  yaSalidos: number,
) {
  const res = { envio: null as string | null, enviados: 0, pendientes: 0, fallados: 0, nota: '' };
  const conf = (await base.collection(CONFIG).doc(LISTA).get()).data() as { activa?: boolean; textos?: Record<string, Partial<Textos>> } | undefined;
  if (!conf?.activa) return { ...res, nota: 'apagado desde la plataforma' };
  const e = envioDeHoy(conCambios(conf.textos));
  if (!e) return { ...res, nota: 'hoy no toca ningún envío' };
  res.envio = e.id;

  const tope = Math.max(0, TOPE_POR_DEFECTO - yaSalidos);
  const lista = await base.collection(COLECCION).where('lista', '==', LISTA).get();
  const toca = lista.docs.filter((d) => {
    const v = d.data() as { email?: string; baja?: boolean; enviados?: Record<string, unknown> };
    if (!v.email || v.baja || v.enviados?.[e.id]) return false;
    if (!e.aInscritas && inscritas.has(v.email.trim().toLowerCase())) return false;
    return true;
  });
  res.pendientes = toca.length;

  /* De cincuenta en cincuenta con el envío por lotes de Resend: uno a uno,
     noventa correos no caben en el minuto que Vercel le da a esta función. */
  const hoy = toca.slice(0, tope);
  for (let i = 0; i < hoy.length; i += 50) {
    const tanda = hoy.slice(i, i + 50);
    try {
      const envio = await resend.batch.send(
        tanda.map((d) => {
          const email = String(d.get('email'));
          const { asunto, html } = correoDifusion(e, email);
          return { from: DE_MARCO, to: email, replyTo: CONTESTAR_A, subject: asunto, html };
        }),
      );
      if (envio.error) throw new Error(String(envio.error.message || envio.error));
      /* Se marca después de que Resend lo acepte: si algo falla, mañana se
         reintenta en vez de quedar como enviado sin haber salido. */
      const lote = base.batch();
      for (const d of tanda) lote.set(d.ref, { enviados: { [e.id]: FieldValue.serverTimestamp() } }, { merge: true });
      await lote.commit();
      res.enviados += tanda.length;
      res.pendientes -= tanda.length;
    } catch (err) {
      res.fallados += tanda.length;
      console.error('[difusion] fallo al enviar una tanda', e.id, String(err).slice(0, 200));
    }
  }
  return res;
}
