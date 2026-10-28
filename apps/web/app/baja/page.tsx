/**
 * ============================================================================
 * DARSE DE BAJA. UN CLIC, Y LAS DOS LISTAS A LA VEZ.
 * ============================================================================
 *
 * POR QUÉ EXISTE ESTA PÁGINA, que es lo importante.
 *
 * Hasta hoy el enlace de baja de los correos iba directo al Apps Script, que
 * marca la casilla en la hoja de cálculo de Iris. Eso bastaba mientras los
 * correos los mandaba Google leyendo esa misma hoja.
 *
 * Pero los recordatorios de la masterclass se mandan desde aquí, por Resend, y
 * leen la lista de FIRESTORE — que no se enteraba de ninguna baja. O sea que
 * alguien podía darse de baja, ver «listo, no recibirás más correos», y seguir
 * recibiéndolos igual. Eso no es un fallo de comodidad: el artículo 21 del
 * RGPD dice que oponerse tiene que surtir efecto, y la Agencia de Protección
 * de Datos multa exactamente esto.
 *
 * Así que la baja entra por aquí y hace las dos cosas:
 *   1. Marca `baja: true` en Firestore, que es de donde salen los
 *      recordatorios. Esto es lo que de verdad para los correos.
 *   2. Se lo cuenta al Apps Script, para que la hoja de Iris siga diciendo la
 *      verdad. Si eso falla, la baja vale igual: lo de arriba ya está hecho.
 *
 * SIGUE SIENDO UN SOLO ENLACE Y UN SOLO CLIC. No se le pide a nadie que
 * confirme nada ni que escriba su correo: un formulario de confirmación es
 * una fricción que la ley no pide y que sirve para que la gente se rinda a
 * mitad, que es justo lo contrario de lo que debe hacer una baja.
 *
 * LA FIRMA ES LA MISMA DE SIEMPRE. HMAC-SHA256 del correo en minúsculas con
 * el secreto compartido, base64 web-safe, dieciséis caracteres: lo que hace
 * `tokenBaja` en reservas.gs y lo que pone `enlaceDeBaja` en lib/correo.ts.
 * Sin firma válida no se da de baja a nadie — si no, cualquiera podría dar de
 * baja a otro escribiendo su correo en la dirección.
 */

import Link from 'next/link';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { db } from '@/lib/firebase';
import { CONTACTO } from '@/content/site';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Darse de baja · Escuela de Sabiduría 33',
  /* Que no lo indexe nadie: es una página de un correo, no de la web. */
  robots: { index: false, follow: false },
};

function firmaDe(email: string): string {
  const secreto = process.env.APPS_SCRIPT_SECRET || '';
  return createHmac('sha256', secreto).update(email.toLowerCase()).digest('base64url').slice(0, 16);
}

/* Comparación en tiempo constante: comparar dos cadenas con `===` tarda más
   cuanto más se parecen, y eso deja adivinar la firma carácter a carácter. */
function firmaValida(email: string, token: string): boolean {
  if (!process.env.APPS_SCRIPT_SECRET) return false;
  const buena = Buffer.from(firmaDe(email));
  const dada = Buffer.from(token);
  if (buena.length !== dada.length) return false;
  return timingSafeEqual(buena, dada);
}

async function daDeBaja(email: string): Promise<boolean> {
  const base = db();
  if (!base) return false;

  /* Una persona puede estar en `leads` varias veces —el identificador lleva
     el origen dentro, así que la misma del curso y de la sinergia son dos
     documentos— y la baja es de la PERSONA, no de uno de sus apuntes. */
  try {
    const r = await base.collection('leads').where('email', '==', email).get();
    const lote = base.batch();
    for (const d of r.docs) lote.update(d.ref, { baja: true, bajaEl: new Date().toISOString() });
    await lote.commit();
    return true;
  } catch (err) {
    console.error('[baja] no se ha podido marcar en Firestore', String(err).slice(0, 200));
    return false;
  }
}

/* Y que la hoja de Iris se entere. No bloquea: si Google tarda o falla, la
   baja ya está hecha donde importa. */
async function avisaALaHoja(email: string, token: string): Promise<void> {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) return;
  try {
    await fetch(`${url}?action=baja&e=${encodeURIComponent(email)}&t=${encodeURIComponent(token)}`, {
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    /* La hoja se quedará desactualizada y los correos NO salen igualmente,
       que es lo que importa. */
  }
}

export default async function Baja({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string }>;
}) {
  const { e = '', t = '' } = await searchParams;
  const email = e.trim().toLowerCase();

  const valido = Boolean(email) && Boolean(t) && firmaValida(email, t);
  let hecho = false;
  if (valido) {
    hecho = await daDeBaja(email);
    await avisaALaHoja(email, t);
  }

  return (
    <main className="baja">
      <div className="baja-caja">
        {valido && hecho ? (
          <>
            <h1>Listo, no recibirás más correos.</h1>
            <p>
              Te hemos quitado de la lista. Si algún día quieres volver, puedes
              apuntarte otra vez desde la web.
            </p>
          </>
        ) : valido ? (
          <>
            <h1>No hemos podido completarlo.</h1>
            <p>
              Escríbenos a <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a> y
              te quitamos de la lista a mano hoy mismo.
            </p>
          </>
        ) : (
          <>
            <h1>Ese enlace no es válido.</h1>
            <p>
              Puede que esté cortado por el programa de correo. Escríbenos a{' '}
              <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a> y te
              quitamos de la lista.
            </p>
          </>
        )}
        <Link href="/">Volver a la web</Link>
      </div>
    </main>
  );
}
