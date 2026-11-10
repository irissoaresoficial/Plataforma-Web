/**
 * EL CORREO DE LA LISTA DE MARCO, TAL CUAL SALE.
 *
 * Lo pide la pantalla «Correos» de la plataforma para enseñarlo dentro de un
 * marco: así lo que se revisa allí es exactamente lo que va a salir, y no una
 * copia del texto que un día deja de coincidir.
 *
 * Es público y puede serlo: no lleva ningún dato de nadie. El enlace de baja
 * del ejemplo apunta a una dirección inventada.
 */
import { ENVIOS, correoDifusion, type IdEnvio } from '@/lib/difusion';

export const dynamic = 'force-dynamic';

export function GET(peticion: Request) {
  const id = new URL(peticion.url).searchParams.get('id') as IdEnvio | null;
  const e = ENVIOS.find((x) => x.id === id);
  if (!e) {
    /* La lista de envíos la lee la plataforma desde su propio dominio. */
    return Response.json(
      { envios: ENVIOS.map(({ id, dia, asunto, previo, aInscritas }) => ({ id, dia, asunto, previo, aInscritas })) },
      { headers: { 'access-control-allow-origin': '*', 'cache-control': 'no-store' } },
    );
  }
  const { html } = correoDifusion(e.id, 'ejemplo@ejemplo.com');
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e.asunto}</title><body style="margin:0">${html}</body>`, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}
