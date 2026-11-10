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

export const dynamic = 'force-dynamic';

export async function GET(peticion: Request) {
  const id = new URL(peticion.url).searchParams.get('id');
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
  const { html } = correoDifusion(e, 'ejemplo@ejemplo.com');
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e.asunto.replace(/</g, '&lt;')}</title><body style="margin:0">${html}</body>`,
    { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } },
  );
}
