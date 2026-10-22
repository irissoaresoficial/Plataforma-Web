/**
 * ============================================================================
 * EL NÚMERO DEL PÍXEL Y LA LLAVE DEL CARTEL — EN UN SOLO SITIO
 * ============================================================================
 *
 * Dos constantes que, hasta hoy, vivían dentro de `Medicion.tsx`. Se sacan
 * porque ya no las usa un solo archivo: el píxel lo necesitan el navegador
 * (para cargar el script) y el servidor (para avisar a Meta por su cuenta,
 * ver `capi.ts`), y la llave del cartel la necesitan el cartel mismo y el
 * formulario, que tiene que saber si esa persona dio permiso antes de mandarle
 * nada a Meta.
 *
 * Y se sacan AHORA, antes de que haya dos copias. Un número de píxel escrito
 * en dos archivos es un número que algún día serán dos números distintos, y el
 * día que eso pase los registros se irán a un píxel y las visitas a otro, y
 * nadie lo verá porque las dos cosas seguirán funcionando por separado.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ EL NÚMERO VA ESCRITO Y NO SÓLO EN UNA VARIABLE DE VERCEL
 * ---------------------------------------------------------------------------
 * Las variables `NEXT_PUBLIC_` se cuecen dentro del código AL COMPILAR. O sea
 * que ponerla en el panel de Vercel no basta: hay que volver a desplegar. Si
 * alguien se salta ese segundo paso, el píxel no carga, la web sigue
 * funcionando igual de bien y los anuncios gastan a ciegas. Pasó, y se tardaron
 * días en verlo.
 *
 * Un número de píxel no es un secreto —va dentro de la página, a la vista de
 * cualquiera que mire el código fuente—, así que vive en el repositorio como el
 * resto de la configuración que no hay nada que proteger: queda en el
 * historial, se revisa en un cambio, y no depende de que alguien se acuerde de
 * tocar un panel.
 *
 * LA VARIABLE SIGUE MANDANDO SI EXISTE. Es la escotilla para probar con otro
 * píxel sin tocar el código. Pero si contiene un número VIEJO, gana ella y el
 * de aquí abajo no se usa: por eso, al cambiar de píxel, hay que borrar la
 * variable de Vercel o actualizarla.
 *
 * 1146543124979316 es el píxel de la cuenta publicitaria que paga los anuncios.
 * El anterior (1114301841361501) vivía en otro portafolio al que esa cuenta no
 * llega, y por eso no se podía optimizar a registros ni construir públicos:
 * Meta medía, pero la cuenta no podía leer lo medido.
 */
export const PIXEL_META = process.env.NEXT_PUBLIC_META_PIXEL_ID || '1146543124979316';

/**
 * Donde el navegador apunta lo que la persona contestó al cartel: `si` o `no`.
 *
 * Es la única prueba de consentimiento que hay en el lado del navegador, y de
 * ella depende algo más que cargar un script: si vale `si`, el formulario le
 * dice al servidor que puede avisar a Meta del registro; si vale `no` o no hay
 * nada, no se le manda absolutamente nada a Meta. El porqué está en `capi.ts`.
 */
export const LLAVE_MEDICION = 'es33-medicion';
