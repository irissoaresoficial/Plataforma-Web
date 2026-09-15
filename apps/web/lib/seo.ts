import type { Metadata } from 'next';

/**
 * EL SEO DE CADA PÁGINA, EN UN SOLO SITIO.
 *
 * ============================================================================
 * QUÉ ESTABA PASANDO, QUE ES LO QUE HAY QUE ENTENDER PRIMERO
 * ============================================================================
 *
 * Gerson pegó `escueladesabiduria33.com/cursos` en WhatsApp y no salió la
 * ficha del curso. Y al mirarlo, el fallo era más gordo de lo que parecía:
 * SIETE de las nueve páginas mandaban el título y la descripción de la
 * portada. Las siete.
 *
 * El motivo es de Next y no se ve por ningún lado: una página marcada con
 * `'use client'` NO PUEDE exportar `metadata`. No avisa, no falla el compilado,
 * no sale un aviso en rojo. Simplemente hereda la del layout de arriba y ahí
 * se queda. Y todas las páginas de esta web son de cliente, porque todas tienen
 * movimiento al bajar.
 *
 * Así que al compartir `/cursos` salía «Iris Soares · Numerología
 * Transgeneracional» y la frase de la portada. Ni el nombre del curso, ni las
 * fechas, ni el precio. Lo mismo con el taller, con la sinergia y con todo.
 *
 * Y HABÍA ALGO PEOR, QUE NO SE VE AL COMPARTIR PERO SE PAGA EN GOOGLE. El
 * layout raíz declaraba `alternates: { canonical: '/' }`, y eso se hereda igual
 * que lo demás: `/cursos` servía
 *
 *     <link rel="canonical" href="https://escueladesabiduria33.com">
 *
 * Un canonical es una nota firmada que dice «no me indexes a mí, la buena es
 * ésa». O sea que las seis páginas de contenido —cursos, taller, numerología,
 * kábala, sinergia y membresía— le estaban pidiendo a Google que las tratara
 * como copias de la portada. Una web puede estar meses sin aparecer por esto y
 * sin que nadie entienda por qué.
 *
 * ============================================================================
 * LA SOLUCIÓN: UN LAYOUT DE SERVIDOR POR RUTA
 * ============================================================================
 *
 * Un `layout.tsx` sin `'use client'` sí puede exportar `metadata`, y envuelve a
 * la página sin cambiarla ni una línea. No hay que convertir nada a servidor ni
 * renunciar al movimiento: se le pone un sombrero a cada carpeta.
 *
 * Lo único que hacen esos layouts es llamar aquí, para que no haya seis copias
 * del mismo bloque de veinte líneas donde cinco están bien y una se olvidó.
 *
 * ============================================================================
 * CÓMO SE ESCRIBE UN TÍTULO QUE SIRVA
 * ============================================================================
 *
 * Un titular de la web y un título de buscador no son lo mismo, y confundirlos
 * es el error más común que hay. «Dos días que cambian la conversación en tu
 * casa» es un buen titular —para quien ya está dentro y está leyendo—. Como
 * título de Google es inútil: nadie escribe eso en el buscador.
 *
 * El título lleva LO QUE LA GENTE BUSCA. La descripción es la que puede tirar
 * de la emoción, porque para cuando se lee ya has salido en la lista y lo que
 * se decide es si te pinchan a ti o al de arriba.
 */

/** El dominio de casa. La misma variable que usa el layout raíz. */
export const SITIO = process.env.NEXT_PUBLIC_SITE_URL || 'https://escueladesabiduria33.com';

export const MARCA = 'Escuela de Sabiduría 33';
export const AUTORA = 'Iris Soares';

/**
 * Arma la metadata de una página.
 *
 * @param ruta        Empieza por `/`. Es la dirección real y va al canonical.
 * @param titulo      Sin la marca: se le pega detrás aquí, para que no haya
 *                    páginas donde está y páginas donde se olvidó.
 * @param descripcion Entre 120 y 160 caracteres. Más corta desaprovecha sitio;
 *                    más larga la corta Google por la mitad de una palabra.
 * @param imagen      Sólo si esa página tiene una imagen propia mejor que la de
 *                    la casa. Si no viene, se hereda la del layout raíz, que ya
 *                    está puesta y mide 1200×630.
 */
export function paginaMeta({
  ruta,
  titulo,
  descripcion,
  imagen,
}: {
  ruta: string;
  titulo: string;
  descripcion: string;
  imagen?: string;
}): Metadata {
  /*
   * LA MARCA DETRÁS DEL TÍTULO, PERO SÓLO SI CABE.
   *
   * La costumbre es rematar todos los títulos con « · Nombre de la marca», y
   * aquí eso salía mal a la primera: «Compatibilidad numerológica entre dos
   * fechas de nacimiento · Escuela de Sabiduría 33» son 83 caracteres y Google
   * corta alrededor de los 60. O sea que en la lista de resultados salía el
   * título a medias, con puntos suspensivos, y la marca no se veía — se pagaba
   * el precio de ponerla sin recibir nada a cambio.
   *
   * Dos decisiones, y las dos con un motivo:
   *
   *   · LA MARCA QUE SE PEGA ES «Iris Soares», no «Escuela de Sabiduría 33».
   *     Son doce caracteres menos, y sobre todo es lo que la gente escribe en
   *     el buscador cuando ya la conoce. El nombre largo de la casa sigue
   *     entero en `og:site_name`, que es donde se lee al compartir y ahí no
   *     hay límite que valga.
   *   · SI NO CABE EN 60, NO SE PONE. Un título que se entiende entero vale
   *     más que una firma cortada. Y si el título ya nombra a Iris —«Consulta
   *     de Kábala con Iris Soares»— tampoco: repetirla dos veces en la misma
   *     línea es de las cosas que Google marca como relleno.
   */
  const cabe = titulo.length + 3 + AUTORA.length <= 60;
  const tituloCorto = !titulo.includes(AUTORA) && cabe ? `${titulo} · ${AUTORA}` : titulo;

  /* Al compartir sí va el nombre largo: en una ficha de WhatsApp el nombre del
     sitio se lee encima del título y es lo que da confianza para pinchar. */
  const tituloCompleto = `${titulo} · ${MARCA}`;
  const url = `${SITIO}${ruta}`;

  return {
    title: tituloCorto,
    description: descripcion,

    /* CADA PÁGINA SE APUNTA A SÍ MISMA. Era lo que faltaba y lo que estaba
       hundiendo la indexación entera. */
    alternates: { canonical: ruta },

    openGraph: {
      type: 'website',
      locale: 'es_ES',
      siteName: MARCA,
      title: tituloCompleto,
      description: descripcion,
      /* `og:url` no estaba en ninguna página. Sin él, quien comparte un enlace
         con parámetros de campaña —?utm_source=instagram— hace que WhatsApp y
         Facebook guarden esa dirección sucia como si fuera la buena, y luego
         cada variante se cachea por separado. */
      url,
      ...(imagen ? { images: [{ url: imagen, width: 1200, height: 630 }] } : {}),
    },

    twitter: {
      card: 'summary_large_image',
      title: tituloCompleto,
      description: descripcion,
      ...(imagen ? { images: [imagen] } : {}),
    },
  };
}

/**
 * LOS DATOS ESTRUCTURADOS, EN CRISTIANO.
 *
 * Es una ficha escrita en un idioma que sólo leen los buscadores, metida en la
 * página. Dice con todas las letras «esto es un curso, empieza este día, cuesta
 * esto» en vez de dejar que Google lo adivine del texto.
 *
 * Sirve para dos cosas concretas y medibles: que el resultado salga con
 * adornos —fechas, precio, estrellas— en vez de dos renglones de texto, y que
 * Google entienda de qué va la casa.
 *
 * REGLA QUE NO SE SALTA NUNCA: aquí sólo entra lo que está escrito en
 * `content/site.ts` y confirmado. Poner una fecha que no está cerrada o un
 * precio que nadie ha dicho no es un error de programación: es lo que hace que
 * Google penalice el sitio entero por datos que no coinciden con la página. Por
 * eso las funciones de abajo devuelven `null` cuando les falta un dato, en vez
 * de rellenarlo con algo razonable.
 */
export function jsonLd(datos: Record<string, unknown> | null): string | null {
  if (!datos) return null;
  /* Se escapa el `<` porque este texto entra dentro de una etiqueta <script>:
     un `</script>` viniendo de un dato cerraría la etiqueta antes de tiempo.
     Hoy todo lo que entra aquí lo escribimos nosotros, pero el día que alguien
     meta aquí el título de un curso escrito desde un panel, esto ya está. */
  return JSON.stringify({ '@context': 'https://schema.org', ...datos }).replace(/</g, '\\u003c');
}
