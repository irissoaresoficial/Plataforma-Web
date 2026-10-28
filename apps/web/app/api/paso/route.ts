/**
 * ============================================================================
 * SUMA UNO AL ESCALÓN DEL DÍA
 * ============================================================================
 *
 * El otro lado de `lib/paso.ts`, donde está escrito el porqué entero.
 *
 * LO QUE ESTA RUTA NO GUARDA, que es lo que la hace anónima: ni la IP, ni el
 * navegador, ni de dónde viene la persona, ni nada que llegue en la petición
 * aparte de una palabra de tres posibles. Lo que queda escrito es
 * `embudo/2026-10-27 → { llega: 149, ve-formulario: 60, escribe: 8 }`.
 * No hay fila por persona porque no hay persona: hay un número.
 *
 * SE COMPRUEBA QUE LA LLAMADA VIENE DE LA PROPIA WEB. No es seguridad de
 * verdad —una cabecera se falsifica— pero evita que un contador público se
 * llene de ruido con un comando de dos líneas. Y lo peor que podría hacer
 * alguien decidido es inflar un número que sólo mira Iris: no hay nada que
 * robar aquí porque no hay nada guardado de nadie.
 */
import { NextResponse } from 'next/server';
import { db, FieldValue } from '@/lib/firebase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PASOS = new Set(['llega', 've-formulario', 'escribe']);

export async function POST(peticion: Request) {
  /*
   * MISMO ORIGEN, COMPARANDO EL DOMINIO CONTRA EL DE LA PROPIA PETICIÓN.
   *
   * Antes esto comparaba `origin` con `NEXT_PUBLIC_SITE_URL`, y el contador
   * pasó un día entero en la web sin registrar ni una visita. Esa variable la
   * escribe una persona en Vercel: una barra de más al final, un `www.`
   * delante o el dominio de pruebas, y `startsWith` dice que no — y todas las
   * llamadas se iban con un 403 que nadie veía.
   *
   * El dominio desde el que se sirve esta ruta ya viene en la petición, así
   * que no hace falta ninguna variable: si el origen es el mismo sitio que ha
   * servido la página, es nuestro. Es la comprobación de verdad, y además no
   * se puede configurar mal.
   */
  const origen = peticion.headers.get('origin') || '';
  if (origen) {
    const propio = peticion.headers.get('host') || '';
    let deFuera = true;
    try {
      deFuera = new URL(origen).host !== propio;
    } catch {
      deFuera = true;
    }
    if (deFuera) return NextResponse.json({ ok: false, motivo: 'otro origen' }, { status: 403 });
  }

  let paso = '';
  try {
    paso = String(((await peticion.json()) as { paso?: unknown }).paso || '');
  } catch {
    return NextResponse.json({ ok: false, motivo: 'cuerpo ilegible' }, { status: 400 });
  }
  if (!PASOS.has(paso)) return NextResponse.json({ ok: false, motivo: 'paso desconocido' }, { status: 400 });

  const base = db();
  if (!base) return NextResponse.json({ ok: false, motivo: 'sin base' });

  /* El día en hora de España, que es como se leen los partes. */
  const dia = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });

  try {
    await base.collection('embudo').doc(dia).set({ [paso]: FieldValue.increment(1) }, { merge: true });
  } catch (err) {
    /*
     * YA NO SE TRAGA EL ERROR. Antes aquí había un `catch` vacío con un
     * comentario que decía «si no se puede contar, no pasa nada». Y sí pasa:
     * un contador que falla y calla parece un contador que dice cero, y con
     * ese cero se toman decisiones. La persona sigue sin enterarse de nada
     * —esto no rompe su página— pero el fallo queda escrito en los registros
     * y sale en /api/diagnostico.
     */
    console.error('[paso] no se ha podido contar', paso, String(err).slice(0, 200));
    return NextResponse.json({ ok: false, motivo: 'no se ha podido escribir' }, { status: 200 });
  }
  return NextResponse.json({ ok: true });
}
