/**
 * LA PORTADA — LA MITAD DE SERVIDOR.
 * ============================================================================
 *
 * Aquí NO hay `'use client'`, y es lo importante del archivo.
 *
 * Una página marcada como de cliente no puede exportar `metadata`: no avisa,
 * no falla el compilado, simplemente hereda la del layout y ahí se queda. Es
 * el fallo que dejó siete páginas de esta web mandando el título de la portada
 * y está contado entero en `lib/seo.ts`. La portada se libraba porque su
 * título ERA el del layout — o sea, de chiripa, no por diseño.
 *
 * Ahora está hecho a propósito: esta mitad lleva el título, la descripción, el
 * canonical y los datos estructurados; `components/casa/Portada.tsx` lleva
 * todo lo que necesita manos y scroll.
 *
 * LOS DATOS ESTRUCTURADOS son las fichas que Google lee para saber qué es esto
 * sin tener que adivinarlo:
 *   · Person ......... quién es Iris y a qué se dedica.
 *   · Organization ... la escuela, con su logo y su correo.
 *   · WebSite ........ el sitio, para que la marca salga bien escrita.
 * Todo lo que va ahí es verdad y sale de `content/site.ts`. Un dato inventado
 * en datos estructurados es peor que no ponerlos: Google los cruza.
 */

import type { Metadata } from 'next';
import Ficha from '@/components/Ficha';
import Portada from '@/components/casa/Portada';
import { CONTACTO, SESION, LOGO_COLOR } from '@/content/site';

const CASA = process.env.NEXT_PUBLIC_SITE_URL || 'https://escueladesabiduria33.com';

export const metadata: Metadata = {
  /*
   * EL TÍTULO LLEVA LO QUE LA GENTE BUSCA, no el titular de la web.
   * «Por qué se repite siempre lo mismo» es un buen titular para quien ya está
   * dentro leyendo. En Google no lo escribe nadie. Lo que se escribe es
   * «numerología transgeneracional», y el nombre de ella.
   */
  title: 'Numerología transgeneracional · Iris Soares',
  /* NI «LEE TU FECHA Y TU NOMBRE» NI NADA QUE EXPLIQUE EL MÉTODO.
     Gerson, el 27 de octubre: «eso no puede decir nada de eso, está mal».
     Decía «Iris Soares lee tu fecha y tu nombre para enseñarte el patrón que
     heredaste», y esa frase es lo primero que ve alguien en Google: a quien
     no conoce la casa le suena a adivinación y no entra. Lo que trae gente no
     es cómo se hace, es qué se entiende — por qué se repite lo mismo. */
  description:
    'Lo que se repite en tu vida no empieza en ti. Entiende de dónde viene el patrón que heredaste, y por dónde se sale. Talleres en directo y escuela online.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: CASA,
    title: 'Numerología transgeneracional · Iris Soares',
    description:
      'Lo que se repite en tu vida no empieza en ti. Entiende el patrón que heredaste, para que dejes de repetirlo.',
    siteName: 'Escuela de Sabiduría 33',
    locale: 'es_ES',
  },
};

export default function Pagina() {
  const anos = new Date().getFullYear() - SESION.desde;

  return (
    <>
      <Ficha
        datos={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Person',
              '@id': `${CASA}/#iris`,
              name: 'Iris Soares',
              jobTitle: 'Numeróloga transgeneracional',
              description: `Creadora de la Escuela de Sabiduría 33. Numerología transgeneracional y Kábala desde ${SESION.desde}, ${anos} años de consulta.`,
              image: `${CASA}/images/iris-hablando.jpg`,
              email: CONTACTO.email,
              knowsAbout: ['Numerología transgeneracional', 'Kábala', 'Árbol de la vida'],
              worksFor: { '@id': `${CASA}/#escuela` },
              url: CASA,
            },
            {
              '@type': 'Organization',
              '@id': `${CASA}/#escuela`,
              name: 'Escuela de Sabiduría 33',
              url: CASA,
              logo: `${CASA}${LOGO_COLOR}`,
              email: CONTACTO.email,
              founder: { '@id': `${CASA}/#iris` },
              foundingDate: String(SESION.desde),
            },
            {
              '@type': 'WebSite',
              '@id': `${CASA}/#sitio`,
              url: CASA,
              name: 'Escuela de Sabiduría 33',
              inLanguage: 'es-ES',
              publisher: { '@id': `${CASA}/#escuela` },
            },
          ],
        }}
      />
      <Portada />
    </>
  );
}
