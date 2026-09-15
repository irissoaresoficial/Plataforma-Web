import type { MetadataRoute } from 'next';
import { SITIO } from '@/lib/seo';

/**
 * EL ÍNDICE DE LA WEB PARA GOOGLE. NO EXISTÍA.
 *
 * Es la lista de las páginas que hay, servida en `/sitemap.xml`. Sin ella,
 * Google tiene que descubrir las páginas siguiendo enlaces, y se entera de un
 * cambio cuando le toca volver a pasar — que pueden ser semanas.
 *
 * Aquí importa sobre todo por una cosa: cuando Iris ponga la fecha del taller o
 * salga un curso nuevo, esa página tiene que estar arriba ANTES del día, no
 * tres semanas después. Con el índice se avisa; sin él, se espera.
 *
 * NO ESTÁN LAS NUEVE PÁGINAS, Y ES A PROPÓSITO. `/legal` y `/privacidad` se
 * quedan fuera: son obligatorias por ley y no las busca nadie. Meterlas es
 * gastar en dos páginas que no traen a una sola persona el rastreo que
 * necesitan las que sí venden.
 *
 * `priority` es una pista, no una orden, y Google hace bastante lo que quiere
 * con ella. Lo que sí respeta es el orden de importancia relativo dentro de un
 * mismo sitio, y ése es el que está escrito abajo.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const hoy = new Date();

  return [
    /* La portada y la herramienta gratis van primero: una es la casa y la otra
       es por donde entra la gente desde redes. */
    { url: SITIO, lastModified: hoy, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITIO}/sinergia`, lastModified: hoy, changeFrequency: 'weekly', priority: 0.9 },

    /* La página que explica qué es esto. Es la única por la que puede entrar
       alguien que no ha oído hablar de Iris en su vida. */
    { url: `${SITIO}/numerologia`, lastModified: hoy, changeFrequency: 'monthly', priority: 0.9 },

    /* Lo que se vende. `weekly` porque las fechas y las plazas cambian. */
    { url: `${SITIO}/cursos`, lastModified: hoy, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITIO}/taller`, lastModified: hoy, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITIO}/kabala`, lastModified: hoy, changeFrequency: 'monthly', priority: 0.7 },

    /* Todavía no hay nada que comprar aquí, pero la página existe y recoge
       correos. */
    { url: `${SITIO}/membresia`, lastModified: hoy, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
