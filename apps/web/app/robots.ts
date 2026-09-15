import type { MetadataRoute } from 'next';
import { SITIO } from '@/lib/seo';

/**
 * LO QUE PUEDEN Y NO PUEDEN MIRAR LOS BUSCADORES. TAMPOCO EXISTÍA.
 *
 * Se sirve en `/robots.txt`, que es el primer archivo que pide cualquier
 * rastreador antes de entrar en una web.
 *
 * Hace dos cosas, y la segunda es la importante:
 *
 *   1. Deja pasar a todo el mundo al contenido.
 *   2. CIERRA `/api`. Ahí viven `/api/lead`, `/api/booking` y `/api/diagnostico`
 *      — o sea, las direcciones donde se guardan correos, se reservan citas y
 *      se dice en castellano qué claves faltan por poner. Ninguna de las tres
 *      tiene que salir en Google, y la última menos que ninguna.
 *
 *      Que conste lo que esto ES y lo que NO ES: `robots.txt` es un cartel,
 *      no una puerta. Los buscadores serios lo respetan; cualquiera que quiera
 *      entrar, entra igual. Quien protege de verdad esas rutas es el límite de
 *      peticiones que tienen dentro, no este archivo. Esto sólo evita que la
 *      dirección acabe indexada y se la encuentre alguien sin buscarla.
 *
 * Y apunta al índice, que es como Google se entera de que existe.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${SITIO}/sitemap.xml`,
    /* Con www y sin www sirviendo lo mismo, esto dice cuál de las dos es la
       casa. Es la pareja de `metadataBase` y del canonical. */
    host: SITIO,
  };
}
