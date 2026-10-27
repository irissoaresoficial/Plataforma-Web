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
  /* Mismo origen. El navegador pone `origin` solo y no se puede cambiar
     desde la página. */
  const origen = peticion.headers.get('origin') || '';
  const propio = process.env.NEXT_PUBLIC_SITE_URL || 'https://escueladesabiduria33.com';
  if (origen && !origen.startsWith(propio) && !origen.startsWith('http://localhost')) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  let paso = '';
  try {
    paso = String(((await peticion.json()) as { paso?: unknown }).paso || '');
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!PASOS.has(paso)) return NextResponse.json({ ok: false }, { status: 400 });

  const base = db();
  if (!base) return NextResponse.json({ ok: true, aviso: 'sin base' });

  /* El día en hora de España, que es como se leen los partes. */
  const dia = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });

  try {
    await base.collection('embudo').doc(dia).set({ [paso]: FieldValue.increment(1) }, { merge: true });
  } catch {
    /* Si no se puede contar, no pasa nada: la persona ni se entera. */
  }
  return NextResponse.json({ ok: true });
}
