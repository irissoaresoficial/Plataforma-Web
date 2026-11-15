/**
 * EL CORREO DE LA LISTA DE MARCO, TAL CUAL SALE.
 *
 * Lo pide la pantalla «Correos» de la plataforma: sin `id` devuelve los tres
 * envíos con sus textos (los editados encima de los originales), y con `id`
 * pinta ese correo entero para enseñarlo dentro de un marco. Lee lo editado
 * de Firestore cada vez, así que lo que se revisa es lo que va a salir.
 *
 * Es público y puede serlo: no lleva ningún dato de nadie. El enlace de baja
 * del ejemplo apunta a una dirección inventada.
 */
import { db } from '@/lib/firebase';
import { ENVIOS, correoDifusion, enviosActuales } from '@/lib/difusion';
import { correoRecordatorio, vistaPreviaDeLead } from '@/lib/correo';
import type { Lead } from '@/lib/booking';

/* Los correos de las inscritas a la masterclass, para verlos desde la
   plataforma (15 de noviembre de 2026). Sólo se PINTAN, con un nombre y un
   correo de ejemplo: aquí no sale nada hacia nadie. */
const EJEMPLO = 'ejemplo@ejemplo.com';
function correoDeInscrita(id: string): { asunto: string; html: string } | null {
  if (id === 'semana' || id === 'manana' || id === 'hoy') return correoRecordatorio(id, 'María', EJEMPLO);
  if (id === 'confirmacion') {
    const lead = { email: EJEMPLO, nombre: 'María', origen: 'curso', detalle: '', whatsapp: '', lang: 'es' } as Lead;
    return vistaPreviaDeLead(lead);
  }
  return null;
}
const pagina = (asunto: string, html: string) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${asunto.replace(/</g, '&lt;')}</title><body style="margin:0">${html}</body>`,
    { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } },
  );

export const dynamic = 'force-dynamic';

export async function GET(peticion: Request) {
  const id = new URL(peticion.url).searchParams.get('id');
  const inscrita = id ? correoDeInscrita(id) : null;
  if (inscrita) return pagina(inscrita.asunto, inscrita.html);
  const envios = await enviosActuales(db());
  const e = envios.find((x) => x.id === id);
  if (!e) {
    /* La lista la lee la plataforma desde su propio dominio. `originales`
       sirve para el botón de volver al texto de partida. */
    return Response.json(
      { envios, originales: ENVIOS },
      { headers: { 'access-control-allow-origin': '*', 'cache-control': 'no-store' } },
    );
  }
  const { html } = correoDifusion(e, EJEMPLO);
  return pagina(e.asunto, html);
}
