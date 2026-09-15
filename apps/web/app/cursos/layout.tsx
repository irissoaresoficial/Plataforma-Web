import type { Metadata } from 'next';
import Ficha from '@/components/Ficha';
import { paginaMeta, SITIO, MARCA, AUTORA } from '@/lib/seo';
import { CURSOS } from '@/content/site';

/*
 * El porqué de que este archivo exista —y de que haya uno igual en cada
 * carpeta— está escrito entero en `lib/seo.ts`. En una frase: la página es de
 * cliente y una página de cliente no puede exportar `metadata`, así que la
 * suya la ponía el layout raíz y todas las páginas de la web compartían el
 * título y la descripción de la portada.
 */

/*
 * EL TÍTULO LLEVA EL NOMBRE DEL CURSO, NO EL TITULAR DE LA PÁGINA.
 *
 * En pantalla el titular es «Dos días que cambian la conversación en tu casa»,
 * que está bien escrito para quien ya está leyendo y no sirve de nada en un
 * buscador: nadie escribe esa frase en Google. Lo que sí se busca es el nombre
 * de lo que se vende.
 */
export const metadata: Metadata = paginaMeta({
  ruta: '/cursos',
  titulo: 'Formación en Numerología Transgeneracional',
  descripcion:
    'Dos jornadas en directo con Iris Soares. Sales sabiendo calcular tu fecha y tu nombre a mano, poner tres generaciones sobre la mesa y ver qué se repite.',
});

/**
 * La ficha del curso para Google.
 *
 * Se arma con el primer curso de `content/site.ts`, que es el que la página
 * enseña arriba. Y se cae a `null` en cuanto falte algo: un `Course` sin fecha
 * o sin precio no es «un poco peor», es un dato que no coincide con la página
 * y por eso Google deja de fiarse del resto de fichas del sitio.
 */
function fichaDelCurso() {
  const c = CURSOS[0];
  if (!c || !c.fechaISO || !c.precio) return null;

  return {
    '@type': 'Course',
    name: c.titulo,
    description: c.claim,
    url: `${SITIO}/cursos`,
    provider: { '@type': 'Organization', name: MARCA, url: SITIO },
    /* `Course` sin esto sale con un aviso en las herramientas de Google: quiere
       saber cómo se imparte, no sólo que existe. */
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      startDate: c.fechaISO,
      inLanguage: 'es',
      instructor: { '@type': 'Person', name: AUTORA },
    },
    offers: {
      '@type': 'Offer',
      price: String(c.precio),
      priceCurrency: 'EUR',
      /* La dirección de la página, no la de Stripe: `url` en una oferta es
         dónde se informa el comprador, y mandar al robot directo a la pasarela
         de pago hace que el resultado de Google se salte la página que explica
         qué se compra. */
      url: `${SITIO}/cursos`,
      availability: 'https://schema.org/InStock',
    },
  };
}

export default function CursosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Ficha datos={fichaDelCurso()} />
      {children}
    </>
  );
}
